'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const { v4: uuidv4 } = require('uuid');
const Prompt = require('../models/prompt');
const User = require('../models/user');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.get('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  res.render('new', { user: req.user, csrfToken: req.csrfToken() });
});

router.post('/', authenticationEnsurer, csrfProtection, async (req, res, next) => {
  const promptId = uuidv4();
  const updatedAt = new Date();
  const prompt = await Prompt.create({
    promptId: promptId,
    promptName: req.body.promptName.slice(0, 255) || '（名称未設定）',
    prompt: req.body.prompt,
    createdBy: req.user.id,
    updatedAt: updatedAt
  });
  res.redirect('/prompts/' + prompt.promptId);
});

router.get('/:promptId', authenticationEnsurer, async (req, res, next) => {
  const prompt = await Prompt.findOne({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }],
    where: {
      promptId: req.params.promptId
    },
    order: [['updatedAt', 'DESC']]
  });
    res.render('prompt', {
      user: req.user,
      prompt: prompt,
      users: [req.user]
    }); 
});

router.get('/:promptId/edit', authenticationEnsurer, csrfProtection, async (req, res, next) => {
  const prompt = await Prompt.findOne({
    where: {
      promptId: req.params.promptId
    }
  });
  if (isMine(req, prompt)) {
    res.render('edit', {
      user: req.user,
      prompt: prompt,
      csrfToken: req.csrfToken()
    });
  } else {
    const err = new Error('指定されたPROMPTがありません');
    err.status = 404;
    next(err);
  }
});

function isMine(req, prompt) {
  return prompt && parseInt(prompt.createdBy) === parseInt(req.user.id);
}

router.post('/:promptId', authenticationEnsurer, csrfProtection, async (req, res, next) => {
  let prompt = await Prompt.findOne({
    where: {
      promptId: req.params.promptId
    }
  });
  if (prompt && isMine(req, prompt)) {
    if (parseInt(req.query.edit) === 1) {
      const updatedAt = new Date();
      prompt = await prompt.update({
        promptId: prompt.promptId,
        promptName: req.body.promptName.slice(0, 255) || '（名称未設定）',
        prompt: req.body.prompt,
        createdBy: req.user.id,
        updatedAt: updatedAt
      });
        res.redirect('/prompts/' + prompt.promptId);
      } else if (parseInt(req.query.delete) === 1) {
        await deletePromptAggregate(req.params.promptId);
        res.redirect('/');
      } else {
      const err = new Error('不正なリクエストです');
      err.status = 400;
      next(err);
    }
   } else {
      const err = new Error('指定されたPROMPTがありません');
      err.status = 404;
      next(err);
    }  
  }
);

async function deletePromptAggregate(promptId) {
  const s = await Prompt.findByPk(promptId);
  await s.destroy();
}

router.deletePromptAggregate = deletePromptAggregate;

module.exports = router;