const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Room = require('../models/room.model');

const listRooms = {
  query: {
    page: Joi.number().min(1),
    perPage: Joi.number().min(1).max(100),
    name: Joi.string(),
    game: Joi.objectId(),
    owner: Joi.objectId(),
    state: Joi.string().valid(Room.states),
  },
};

const createRoom = {
  body: {
    name: Joi.string().min(2).max(128).required(),
    state: Joi.string().valid(Room.states),
    game: Joi.objectId().required(),
  },
};
/*
const replaceRoom = {
  body: {
    name: Joi.string().min(2).max(128).required(),
    game: Joi.objectId().required(),
    owner: Joi.objectId().required(),
    state: Joi.string().valid(Room.states),
  },
  params: {
    roomId: Joi.objectId().required(),
  },
};
*/
const updateRoom = {
  body: {
    name: Joi.string().min(2).max(128),
    state: Joi.string().valid(Room.states),
  },
  params: {
    roomId: Joi.objectId().required(),
  },
};

/*
exports.listRooms = listRooms;
exports.listRooms = createRoom;
exports.listRooms = replaceRoom;
exports.listRooms = updateRoom;
*/

module.exports = {

  listRooms,
  createRoom,
  updateRoom,

};
