const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/game.controller');
const { authorize, ADMIN } = require('../../middlewares/auth');
const {
  listGames,
  createGame,
  replaceGame,
  updateGame,
} = require('../../validations/game.validation');

const router = express.Router();

/**
 * Load game when API with gameId route parameter is hit
 */
router.param('gameId', controller.load);


router
  .route('/')
  /**
   * @api {get} v1/games List Games
   * @apiDescription Get a list of games
   * @apiVersion 1.0.0
   * @apiName ListGames
   * @apiGroup Game
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  Game's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Games per page
   * @apiParam  {String{2-128}}      [name]       Game's name
   * @apiParam  {Number{1-128}}      [minPlayers] Game's minPlayers
   * @apiParam  {Number{1-128}}      [maxPlayers] Game's maxPlayers
   *
   * @apiSuccess {Object[]} games List of games.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), validate(listGames), controller.list)
  /**
   * @api {post} v1/games Create Game
   * @apiDescription Create a new game
   * @apiVersion 1.0.0
   * @apiName CreateGame
   * @apiGroup Game
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  Game's access token
   *
   * @apiParam  {String{2-128}}      name       Game's name
   * @apiParam  {Number{1-128}}      minPlayers Game's minPlayers
   * @apiParam  {Number{1-128}}      maxPlayers Game's maxPlayers
   *
   * @apiSuccess (Created 201) {String}  id         Game's id
   * @apiSuccess (Created 201) {String}  name       Game's name
   * @apiSuccess (Created 201) {String}  minPlayers Game's minPlayers
   * @apiSuccess (Created 201) {String}  maxPlayers Game's maxPlayers
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(ADMIN), validate(createGame), controller.create);

router
  .route('/:gameId')
  /**
   * @api {get} v1/games/:id Get Game
   * @apiDescription Get game information
   * @apiVersion 1.0.0
   * @apiName GetGame
   * @apiGroup Game
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  Game's access token
   *
   * @apiSuccess  {String}  id         Game's id
   * @apiSuccess  {String}  name       Game's name
   * @apiSuccess  {String}  minPlayers Game's minPlayers
   * @apiSuccess  {String}  maxPlayers Game's maxPlayers
   * @apiSuccess  {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Not Found 404)    NotFound     Game does not exist
   */
  .get(authorize(), controller.get)
  /**
   * @api {put} v1/games/:id Replace Game
   * @apiDescription Replace the whole game document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceGame
   * @apiGroup Game
   * @apiPermission users
   *
   * @apiHeader {String} Athorization  Game's access token
   *
   * @apiParam  {String{2-128}}      name       Game's name
   * @apiParam  {Number{1-128}}      minPlayers Game's minPlayers
   * @apiParam  {Number{1-128}}      maxPlayers Game's maxPlayers
   *
   * @apiSuccess  {String}  name       Game's name
   * @apiSuccess  {String}  minPlayers Game's minPlayers
   * @apiSuccess  {String}  maxPlayers Game's maxPlayers
   * @apiSuccess  {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only admins can modify the data
   * @apiError (Not Found 404)    NotFound     Game does not exist
   */
  .put(authorize(ADMIN), validate(replaceGame), controller.replace)
  /**
   * @api {patch} v1/games/:id Update Game
   * @apiDescription Update some fields of a game document
   * @apiVersion 1.0.0
   * @apiName UpdateGame
   * @apiGroup Game
   * @apiPermission users
   *
   * @apiHeader {String} Athorization  Game's access token
   *
   * @apiParam  {String{2-128}}      name       Game's name
   * @apiParam  {Number{1-128}}      minPlayers Game's minPlayers
   * @apiParam  {Number{1-128}}      maxPlayers Game's maxPlayers
   *
   * @apiSuccess  {String}  name       Game's name
   * @apiSuccess  {String}  minPlayers Game's minPlayers
   * @apiSuccess  {String}  maxPlayers Game's maxPlayers
   * @apiSuccess  {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only admins can modify the data
   * @apiError (Not Found 404)    NotFound     Game does not exist
   */
  .patch(authorize(ADMIN), validate(updateGame), controller.update)
  /**
   * @api {patch} v1/games/:id Delete Game
   * @apiDescription Delete a game
   * @apiVersion 1.0.0
   * @apiName DeleteGame
   * @apiGroup Game
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  Game's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only admins can delete the data
   * @apiError (Not Found 404)    NotFound      Game does not exist
   */
  .delete(authorize(ADMIN), controller.remove);


module.exports = router;
