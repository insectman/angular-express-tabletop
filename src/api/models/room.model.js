const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

mongoose.plugin(require('mongoose-ref-validator'));
mongoose.plugin(require('mongoose-unique-validator'));

/**
* Room States
*/
const states = ['open', 'ready', 'closed', 'full', 'playing', 'abandoned', 'finished'];


/**
 * Room Schema
 * @private
 */
const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 128,
      required: true,
      unique: true,
      trim: true,
    },
    game: {
      conditions: {},
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Game',
    },
    owner: {
      conditions: {},
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },
    state: {
      type: String,
      enum: states,
      default: 'closed',
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Methods
 */
roomSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'state', 'game', 'owner', 'createdAt', 'minPlayers', 'maxPlayers'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

});

/**
 * Statics
 */
roomSchema.statics = {

  states,

  /**
   * Get room
   *
   * @param {ObjectId} id - The objectId of room.
   * @returns {Promise<Room, APIError>}
   */
  async get(id) {
    try {
      let room;

      if (mongoose.Types.ObjectId.isValid(id)) {
        room = await this.findById(id).exec();
      }
      if (room) {
        return room;
      }

      throw new APIError({
        message: 'Room does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List rooms in ascending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of rooms to be skipped.
   * @param {number} limit - Limit number of rooms to be returned.
   * @returns {Promise<Room[]>}
   */
  list({
    page = 1, perPage = 30, name, state, game,
  }) {
    const options = omitBy({ name, state, game }, isNil);

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
  formatValidationError(error) {
    if (error.name !== 'ValidationError') {
      return error;
    }

    const { errors } = error;
    let returnedError = error;

    ['name', 'game', 'owner'].forEach((fieldName) => {
      const messages = [];
      let status;

      if (!errors[fieldName]) {
        return;
      }

      if (errors[fieldName].kind === 'unique') {
        messages.push(`"${fieldName}" already exists`);
        status = httpStatus.CONFLICT;
      } else if (errors[fieldName].kind === 'user defined') {
        messages.push(`"${fieldName}" references document which does not exist`);
        status = httpStatus.BAD_REQUEST;
      } else {
        return;
      }

      returnedError = new APIError({
        message: 'Validation Error',
        errors: [{
          field: fieldName,
          location: 'body',
          messages,
        }],
        status,
        isPublic: true,
        stack: error.stack,
      });
    });

    return returnedError;
  },

};

/**
 * @typedef Room
 */
module.exports = mongoose.model('Room', roomSchema);
