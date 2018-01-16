const httpStatus = require('http-status');
const { pickBy, identity } = require('lodash');
const Room = require('../models/room.model');
const Game = require('../models/game.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load room and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const room = await Room.get(id);
    req.locals = { room };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get room
 * @public
 */
exports.get = (req, res) => res.json(req.locals.room.transform());

/**
 * Create new room
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const { name, game } = req.body;
    const room = new Room({
      name,
      game,
      state: 'closed',
      owner: req.user.id,
    });
    let savedRoom = await room.save();

    const gameObj = await Game.get(game);
    const { minPlayers, maxPlayers } = gameObj;
    savedRoom = Object.assign(savedRoom, { minPlayers, maxPlayers });
    await savedRoom.save();

    res.status(httpStatus.CREATED);
    res.json(savedRoom.transform());
  } catch (error) {
    next(Room.formatValidationError(error));
  }
};

/**
 * Update existing room
 * @public
 */
exports.update = (req, res, next) => {
  const { state, minPlayers, maxPlayers } = req.body;
  const room = Object.assign(req.locals.room, pickBy({ state, minPlayers, maxPlayers }, identity));

  room.save()
    .then(savedRoom => res.json(savedRoom.transform()))
    .catch(e => next(Room.formatValidationError(e)));
};

/**
 * Get room list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const rooms = await Room.list(req.query);
    res.json(rooms.map(room => room.transform()));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete room
 * @public
 */
exports.remove = (req, res, next) => {
  const { room } = req.locals;

  room.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};

/**
 * Enter room
 * @public
 */
exports.join = async (req, res, next) => {
  const { room } = req.locals;
  const { user } = req;

  room.join(user.id)
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};

/**
 * Leave room
 * @public
 */
exports.leave = async (req, res, next) => {
  const { room } = req.locals;
  // const { user } = req;

  room.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
