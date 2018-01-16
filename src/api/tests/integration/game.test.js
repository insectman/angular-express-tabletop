/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const {
  some,
  omit,
  omitBy,
  isNil,
} = require('lodash');
const app = require('../../../index');
const User = require('../../models/user.model');
const Game = require('../../models/game.model');

/**
 * root level hooks
 */

async function format(game) {
  // get games from database
  const dbGame = (await Game.findOne({ name: game.name })).transform();

  // remove null and undefined properties
  return omitBy(dbGame, isNil);
}

describe('Games API', async () => {
  let adminAccessToken;
  let userAccessToken;
  let dbGames;
  let dbUsers;
  let game;

  const password = '123456';
  const passwordHashed = bcrypt.hashSync(password, 1);

  beforeEach(async () => {
    dbGames = {
      mypkr: {
        name: 'mypkr',
        minPlayers: 2,
        maxPlayers: 9,
      },
      brs: {
        name: 'brs',
        minPlayers: 2,
        maxPlayers: 2,
      },
    };

    game = {
      name: 'mrs',
      minPlayers: 1,
      maxPlayers: 5,
    };

    await Game.remove({});
    await Game.insertMany([dbGames.mypkr, dbGames.brs]);

    dbUsers = {
      admin: {
        email: 'admin@gmail.com',
        password: passwordHashed,
        role: 'admin',
      },
      user: {
        email: 'user@gmail.com',
        password: passwordHashed,
      },
    };

    await User.remove({});
    await User.insertMany([dbUsers.admin, dbUsers.user]);
    dbUsers.admin.password = password;
    dbUsers.user.password = password;
    adminAccessToken = (await User.findAndGenerateToken(dbUsers.admin)).accessToken;
    userAccessToken = (await User.findAndGenerateToken(dbUsers.user)).accessToken;
  });

  describe('POST /v1/games', () => {
    it('should create a new game when request is ok', () => {
      return request(app)
        .post('/v1/games')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(game)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.include(game);
        });
    });

    it('should report error when name already exists', () => {
      return request(app)
        .post('/v1/games')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ ...game, name: dbGames.brs.name })
        .expect(httpStatus.CONFLICT)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('name');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"name" already exists');
        });
    });

    it('should report error when name is not provided', () => {
      return request(app)
        .post('/v1/games')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(omit(game, 'name'))
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('name');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"name" is required');
        });
    });

    it('should report error when minPlayers is less than 1', () => {
      return request(app)
        .post('/v1/games')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ ...game, minPlayers: 0 })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('minPlayers');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"minPlayers" must be larger than or equal to 1');
        });
    });

    it('should report error when logged user is not an admin', () => {
      return request(app)
        .post('/v1/games')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(game)
        .expect(httpStatus.FORBIDDEN)
        //        .catch(e => console.log(e))
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
          expect(res.body.message).to.be.equal('Forbidden');
        });
    });
  });

  describe('GET /v1/games', () => {
    it('should get all games', () => {
      return request(app)
        .get('/v1/games')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const mypkr = format(dbGames.mypkr);
          const brs = format(dbGames.brs);

          const includesMypkr = some(res.body, mypkr);
          const includesBrs = some(res.body, brs);

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt);
          res.body[1].createdAt = new Date(res.body[1].createdAt);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(includesMypkr).to.be.true;
          expect(includesBrs).to.be.true;
        });
    });

    it('should get all games with pagination', () => {
      return request(app)
        .get('/v1/games')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, perPage: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          delete dbGames.mypkr.password;
          const john = format(dbGames.mypkr);
          const includesmypkr = some(res.body, john);

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(1);
          expect(includesmypkr).to.be.true;
        });
    });

    it('should filter games', () => {
      return request(app)
        .get('/v1/games')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ name: dbGames.mypkr.name })
        .expect(httpStatus.OK)
        .then((res) => {
          const mypkr = format(dbGames.mypkr);
          const includesmypkr = some(res.body, mypkr);

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt);

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(1);
          expect(includesmypkr).to.be.true;
        });
    });

    it('should report error when pagination\'s parameters are not a number', () => {
      return request(app)
        .get('/v1/games')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: '?', perPage: 'whaat' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('page');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"page" must be a number');
          return Promise.resolve(res);
        })
        .then((res) => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field).to.be.equal('perPage');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"perPage" must be a number');
        });
    });
  });

  describe('GET /v1/games/:gameId', () => {
    it('should get game', async () => {
      const id = (await Game.findOne({ name: 'mypkr' }))._id;

      return request(app)
        .get(`/v1/games/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(dbGames.mypkr);
        });
    });

    it('should report error "Game does not exist" when game does not exist', () => {
      return request(app)
        .get('/v1/games/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Game does not exist');
        });
    });

    it('should report error "Game does not exist" when id is not a valid ObjectID', () => {
      return request(app)
        .get('/v1/games/palmeiras1914')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.equal('Game does not exist');
        });
    });
  });

  describe('PUT /v1/games/:gameId', () => {
    it('should replace game', async () => {
      const id = (await Game.findOne(dbGames.brs))._id;

      return request(app)
        .put(`/v1/games/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(game)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(game);
          expect(res.body.name).to.be.equal('mrs');
        });
    });

    it('should report error when name is not provided', async () => {
      const id = (await Game.findOne({}))._id;

      return request(app)
        .put(`/v1/games/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(omit(game, 'name'))
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('name');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"name" is required');
        });
    });

    it('should report error game when name length is less than 2', async () => {
      const id = (await Game.findOne({}))._id;
      return request(app)
        .put(`/v1/games/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ ...game, name: 'a' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('name');
          expect(location).to.be.equal('body');
          expect(messages).to.include('"name" length must be at least 2 characters long');
        });
    });

    it('should report error "Game does not exist" when game does not exist', () => {
      return request(app)
        .put('/v1/games/palmeiras1914')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Game does not exist');
        });
    });
  });

  describe('PATCH /v1/games/:gameId', () => {
    it('should update game', async () => {
      const id = (await Game.findOne(dbGames.brs))._id;
      const { name } = game;

      return request(app)
        .patch(`/v1/games/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.be.equal(name);
          expect(res.body.minPlayers).to.be.equal(dbGames.brs.minPlayers);
          expect(res.body.maxPlayers).to.be.equal(dbGames.brs.maxPlayers);
        });
    });

    it('should not update game when no parameters were given', async () => {
      const id = (await Game.findOne(dbGames.brs))._id;

      return request(app)
        .patch(`/v1/games/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(dbGames.brs);
        });
    });

    it('should report error "Game does not exist" when game does not exist', () => {
      return request(app)
        .patch('/v1/games/palmeiras1914')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Game does not exist');
        });
    });

    it('should not update the game (not admin)', async () => {
      const mypkr = await Game.findOne({ name: dbGames.mypkr.name });
      const { id, minPlayers } = { id: mypkr._id, minPlayers: mypkr.minPlayers + 1 };

      return request(app)
        .patch(`/v1/games/${id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ minPlayers })
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.code).to.be.equal(403);
          expect(res.body.minPlayers).to.not.be.equal(minPlayers);
        });
    });
  });

  describe('DELETE /v1/games', () => {
    it('should delete game', async () => {
      const id = (await Game.findOne({}))._id;

      return request(app)
        .delete(`/v1/games/${id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() => request(app).get('/v1/games'))
        .then(async () => {
          const games = await Game.find({});
          expect(games).to.have.lengthOf(1);
        });
    });

    it('should report error "Game does not exist" when game does not exist', () => {
      return request(app)
        .delete('/v1/games/palmeiras1914')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.code).to.be.equal(404);
          expect(res.body.message).to.be.equal('Game does not exist');
        });
    });
  });
});
