'use strict';
const express = require('express');
const router = express.Router();
const Prompt = require('../models/prompt');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

/* GET home page. */
router.get('/', async (req, res, next) => {
  const title = 'PROMPT COLLECTION';
  if (req.user) {
    const prompts = await Prompt.findAll({
      where: {
        createdBy: req.user.id
      },
      order: [['updatedAt', 'DESC']]
      });
      prompts.forEach((prompt) => {
        prompt.formattedUpdatedAt = dayjs(prompt.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
    });
    res.render('index', {
      title: title,
      user: req.user,
      prompts: prompts
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;
