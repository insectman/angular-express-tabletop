const Joi = require('joi');
// const Game = require('../models/game.model');

module.exports = {

  // GET /v1/games
  listGames: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      minPlayers: Joi.string(),
      maxPlayers: Joi.string(),
    },
  },

  // POST /v1/games
  createGame: {
    body: {
      name: Joi.string().min(2).max(128).required(),
      minPlayers: Joi.number().min(1).max(128).required(),
      maxPlayers: Joi.number().min(1).max(128).required(),
    },
  },

  // PUT /v1/games/:gameId
  replaceGame: {
    body: {
      name: Joi.string().min(2).max(128).required(),
      minPlayers: Joi.number().min(1).max(128).required(),
      maxPlayers: Joi.number().min(1).max(128).required(),
    },
    params: {
      gameId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /v1/games/:gameId
  updateGame: {
    body: {
      name: Joi.string().min(2).max(128),
      minPlayers: Joi.number().min(1).max(128),
      maxPlayers: Joi.number().min(1).max(128),
    },
    params: {
      gameId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },
};
