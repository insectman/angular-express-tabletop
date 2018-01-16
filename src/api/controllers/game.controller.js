const httpStatus = require('http-status');
const { omit } = require('lodash');
const Game = require('../models/game.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load game and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const game = await Game.get(id);
    req.locals = { game };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get game
 * @public
 */
exports.get = (req, res) => res.json(req.locals.game.transform());

/**
 * Create new game
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const game = new Game(req.body);
    const savedGame = await game.save();
    res.status(httpStatus.CREATED);
    res.json(savedGame.transform());
  } catch (error) {
    next(Game.checkDuplicateName(error));
  }
};

/**
 * Replace existing game
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { game } = req.locals;
    const newGame = new Game(req.body);
    const newGameObject = omit(newGame.toObject(), '_id');

    await game.update(newGameObject, { override: true, upsert: true });
    const savedGame = await Game.findById(game._id);

    res.json(savedGame.transform());
  } catch (error) {
    next(Game.checkDuplicateEmail(error));
  }
};

/**
 * Update existing game
 * @public
 */
exports.update = (req, res, next) => {
  // const omitRole = req.locals.game.role !== 'admin' ? 'role' : '';
  const omitRole = '';
  const updatedGame = omit(req.body, omitRole);
  const game = Object.assign(req.locals.game, updatedGame);

  game.save()
    .then(savedGame => res.json(savedGame.transform()))
    .catch(e => next(Game.checkDuplicateEmail(e)));
};

/**
 * Get game list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const games = await Game.list(req.query);
    const transformedGames = games.map(game => game.transform());
    res.json(transformedGames);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete game
 * @public
 */
exports.remove = (req, res, next) => {
  const { game } = req.locals;

  game.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
