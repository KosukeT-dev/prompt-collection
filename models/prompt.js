'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Prompt = sequelize.define(
  'prompts',
  {
    promptId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    promptName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['createdBy']
      }
    ]
  }
);

module.exports = Prompt;