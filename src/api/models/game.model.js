const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

/**
 * Game Schema
 * @private
 */
const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: 128,
      required: true,
      unique: true,
      trim: true,
    },
    minPlayers: {
      type: Number,
      required: true,
    },
    maxPlayers: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Methods
 */
gameSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'minPlayers', 'maxPlayers', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

});

/**
 * Statics
 */
gameSchema.statics = {

  /**
   * Get game
   *
   * @param {ObjectId} id - The objectId of game.
   * @returns {Promise<Game, APIError>}
   */
  async get(id) {
    try {
      let game;

      if (mongoose.Types.ObjectId.isValid(id)) {
        game = await this.findById(id).exec();
      }
      if (game) {
        return game;
      }

      throw new APIError({
        message: 'Game does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List games in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of games to be skipped.
   * @param {number} limit - Limit number of games to be returned.
   * @returns {Promise<Game[]>}
   */
  list({
    page = 1, perPage = 30, name,
  }) {
    const options = omitBy({ name }, isNil);

    return this.find(options)
      .sort({ createdAt: 1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateName(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'name',
          location: 'body',
          messages: ['"name" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

};

/**
 * @typedef Game
 */
module.exports = mongoose.model('Game', gameSchema);
