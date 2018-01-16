/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */

const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const chai = require('chai');
const dirtyChai = require('dirty-chai');

const User = require('../../models/user.model');
const Game = require('../../models/game.model');
const Room = require('../../models/room.model');
const testHelper = require('../../helpers/test.helper');

const { expect } = chai;
chai.use(dirtyChai);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/* const {
  some,
  omit,
} = require('lodash'); */

/**
 * root level hooks
 */

const paginationSource = {
  page: 1,
  perPage: 2,
};

const patchRoom = {
  state: 'open',
};

const newRoom = {
  name: 'mypkr room 2',
};

const dbGames = {
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

const dbUsers = {
  admin: {
    email: 'admin@gmail.com',
    role: 'admin',
  },
  user1: {
    email: 'user@gmail.com',
  },
  user2: {
    email: 'user2@gmail.com',
  },
  user3: {
    email: 'user3@gmail.com',
  },
  user4: {
    email: 'user4@gmail.com',
  },
};

const dbObjects = {
  main: {
    name: 'brs room 1',
    state: 'open',
  },
  second: {
    name: 'brs room 2',
    state: 'playing',
  },
  third: {
    name: 'mypkr room 1',
    state: 'finished',
  },
};

const tokens = {
  adminAccessToken: null,
  user2AccessToken: null,
  user3AccessToken: null,
};

beforeEach(async () => {
  await Game.remove({});
  await Game.insertMany([dbGames.mypkr, dbGames.brs]);

  const brsGameId = (await Game.findOne(dbGames.brs))._id;
  const mypkrGameId = (await Game.findOne(dbGames.mypkr))._id;

  newRoom.game = mypkrGameId.toString();
  dbObjects.main.game = brsGameId;
  dbObjects.second.game = brsGameId;
  dbObjects.third.game = mypkrGameId;

  const password = '123456';
  const passwordHashed = bcrypt.hashSync(password, 1);

  const allUsers = [dbUsers.admin, dbUsers.user1, dbUsers.user2, dbUsers.user3, dbUsers.user4];

  await User.remove({});
  await User.insertMany(allUsers
    .map(u => ({ ...u, password: passwordHashed })));

  allUsers.forEach(user => user.password = password);

  tokens.adminAccessToken = (await User.findAndGenerateToken(dbUsers.admin)).accessToken;
  tokens.user1AccessToken = (await User.findAndGenerateToken(dbUsers.user1)).accessToken;
  tokens.user2AccessToken = (await User.findAndGenerateToken(dbUsers.user2)).accessToken;
  tokens.user3AccessToken = (await User.findAndGenerateToken(dbUsers.user3)).accessToken;
  tokens.user4AccessToken = (await User.findAndGenerateToken(dbUsers.user4)).accessToken;

  // newRoom.owner = (await User.findOne({ email: dbUsers.user1.email }))._id.toString();
  dbObjects.main.owner = (await User.findOne({ email: dbUsers.user2.email }))._id;
  dbObjects.second.owner = (await User.findOne({ email: dbUsers.user3.email }))._id;
  dbObjects.third.owner = (await User.findOne({ email: dbUsers.user4.email }))._id;

  await ModelClass.remove({});
  for (let index = 0; index < Object.values(dbObjects).length; index += 1) {
    const dbRoom = Object.values(dbObjects)[index];
    const createdModel = await ModelClass.create(dbRoom);// eslint-disable-line no-await-in-loop
    await delay(1);// eslint-disable-line no-await-in-loop
    dbRoom.id = createdModel._id.toString();
    dbRoom.game = createdModel.game.toString();
    dbRoom.owner = createdModel.owner.toString();
    dbRoom.state = createdModel.state;
  }
});

const ModelClass = Room;
const path = `/v1/${ModelClass.collection.name}`;
const modelNameCap = (new ModelClass()).constructor.modelName;
const modelName = modelNameCap.toLowerCase();


const invalidFieldOptions = {
  game: [{
    mutationValue: 'invalidGameId',
    eMessages: '"game" with value "invalidGameId" fails to match the required pattern: ' +
    '/^[0-9a-fA-F]{24}$/',
    description: 'invalid',
  }],
  state: [{
    mutationValue: 'invalidStateValue',
    eMessages: `"state" must be one of [${ModelClass.schema.path('state').enumValues.join(', ')}]`,
    description: 'invalid',
  }],
  name: [{
    mutationValue: '1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu' +
    '1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu' +
    '1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu' +
    '1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu' +
    '1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu' +
    '1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu' +
    '1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu' +
    '1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu1234567qwertyu',
    eMessages: '"name" length must be less than or equal to ' +
    `${testHelper.getModelPathValidator(ModelClass, 'name', 'maxlength').maxlength} characters long`,
    description: 'too large',
  },
  {
    mutationValue: '1',
    eMessages: '"name" length must be at least ' +
    `${testHelper.getModelPathValidator(ModelClass, 'name', 'minlength').minlength} characters long`,
    description: 'too small',
  }],
};

const defaultOptions = {
  tokens,
  path,
  ModelClass,
  modelName,
};

const defaultPostOptions = {
  ...defaultOptions,
  path: `${path}/create`,
  method: 'post',
  requestDataSource: newRoom,
  tokenIndex: 'user1AccessToken',
};

const defaultDelOptions = {
  ...defaultOptions,
  method: 'delete',
  tokenIndex: 'adminAccessToken',
  resourceIdSource: dbObjects.main,
};

const defaultGetOptions = {
  ...defaultOptions,
  method: 'get',
};

const defaultPatchOptions = {
  ...defaultOptions,
  method: 'patch',
  requestDataSource: patchRoom,
  tokenIndex: 'user2AccessToken',
  resourceIdSource: dbObjects.main,
};

describe('Rooms API', async () => {
  describe(`POST ${path}/create`, () => {
    testHelper.handleTestCase({
      ...defaultPostOptions,
      expectedStatus: httpStatus.CREATED,
      expectedCode: 201,
      expectedBodySource: defaultPostOptions.requestDataSource,
      expectedBodyMutationSource: {
        state: { state: 'closed' },
        maxPlayers: dbGames.mypkr,
        minPlayers: dbGames.mypkr,
      },
      itTitle: `should create a new ${modelName} when request is ok`,
    });

    ['name'].forEach(duplicateValueName => (
      testHelper.handleTestCase({
        ...defaultPostOptions,
        mutationDataSource: { [duplicateValueName]: dbObjects.main },
        expectedStatus: httpStatus.CONFLICT,
        expectedCode: 409,
        itTitle: `should report error when ${duplicateValueName} already exists`,
      })
    ));

    Object.keys(invalidFieldOptions)
      .forEach(fieldName =>
        invalidFieldOptions[fieldName]
          .forEach(invalidFieldCase =>
            testHelper.handleTestCase({
              ...defaultPostOptions,
              mutationDataSource: {
                [fieldName]: { [fieldName]: invalidFieldCase.mutationValue },
              },
              itTitle: `should report error when ${fieldName} is ${invalidFieldCase.description}`,
              expectedStatus: httpStatus.BAD_REQUEST,
              expectedCode: 400,
              expectedError: {
                eField: fieldName,
                eMessages: invalidFieldCase.eMessages,
              },
            })));

    /* ['owner'].forEach(fieldName => (
      testHelper.handleTestCase({
        ...defaultPostOptions,
        itTitle: `should not create when unallowed data is sent (${fieldName})`,
        requestOmissionKeys: [],
        expectedStatus: httpStatus.BAD_REQUEST,
        expectedCode: 400,
        expectedError: {
          eField: fieldName,
          eMessages: `"${fieldName}" is not allowed`,
        },
      }))); */

    ['name', 'game'].forEach(fieldName => (
      testHelper.handleTestCase({
        ...defaultPostOptions,
        requestOmissionKeys: [fieldName],
        expectedStatus: httpStatus.BAD_REQUEST,
        expectedCode: 400,
        expectedError: {
          eField: fieldName,
          eMessages: `"${fieldName}" is required`,
        },
        itTitle: `should report error when ${fieldName} is not provided`,
      })
    ));

    ['game'].forEach(fieldName => (
      testHelper.handleTestCase({
        ...defaultPostOptions,
        mutationDataSource: { [fieldName]: { [fieldName]: new mongoose.Types.ObjectId() } },
        itTitle: `should report error when referenced ${fieldName} does not exist`,
        expectedStatus: httpStatus.BAD_REQUEST,
        expectedCode: 400,
        expectedError: {
          eField: fieldName,
          eMessages: `"${fieldName}" references document which does not exist`,
        },
      })
    ));

    testHelper.handleTestCase({
      ...defaultPostOptions,
      itTitle: 'should report error when user is not authorized',
      optionOmissionKeys: ['tokenIndex'],
      expectedStatus: httpStatus.UNAUTHORIZED,
      expectedCode: 401,
      expectedErrorMessage: 'No auth token',
    });
  });

  describe(`GET ${path}`, () => {
    testHelper.handleTestCase({
      ...defaultGetOptions,
      expectedResponseArray: Object.values(dbObjects),
      itTitle: `should get all ${modelName}s`,
    });

    testHelper.handleTestCase({
      ...defaultGetOptions,
      expectedResponseArray: [dbObjects.main, dbObjects.second],
      queryDataSource: {
        page: paginationSource,
        perPage: paginationSource,
      },
      itTitle: `should get all ${modelName}s with pagination`,
    });

    testHelper.handleTestCase({
      ...defaultGetOptions,
      expectedResponseArray: [dbObjects.main, dbObjects.second],
      queryDataSource: {
        game: dbObjects.main,
      },
      itTitle: `should filter ${modelName}s`,
    });
  });

  describe(`GET ${path}/:roomId`, () => {
    testHelper.handleTestCase({
      ...defaultGetOptions,
      resourceIdSource: dbObjects.main,
      expectedStatus: httpStatus.OK,
      expectedCode: 200,
      expectedBodySource: dbObjects.main,
      itTitle: `should get ${modelName}`,
    });

    testHelper.handleTestCase({
      ...defaultGetOptions,
      randomId: true,
      itTitle: `should report error "${modelNameCap} does not exist" when ${modelName} does not exist`,
      expectedStatus: httpStatus.NOT_FOUND,
      expectedCode: 404,
      expectedErrorMessage: `${modelNameCap} does not exist`,
    });

    testHelper.handleTestCase({
      ...defaultGetOptions,
      resourceIdSource: { id: 'qwertyu123456' },
      itTitle: `should report error "${modelNameCap} does not exist" when id is not a valid ObjectID`,
      expectedStatus: httpStatus.NOT_FOUND,
      expectedCode: 404,
      expectedErrorMessage: `${modelNameCap} does not exist`,
    });
  });

  describe(`PATCH ${path}/:roomId`, () => {
    testHelper.handleTestCase({
      ...defaultPatchOptions,
      expectedCode: 200,
      expectedBodySource: patchRoom,
      itTitle: `should update ${modelName}`,
    });

    testHelper.handleTestCase({
      ...defaultPatchOptions,
      itTitle: `should report error "${modelNameCap} does not exist" when ${modelName} does not exist`,
      expectedStatus: httpStatus.NOT_FOUND,
      expectedCode: 404,
      randomId: true,
      expectedErrorMessage: `${modelNameCap} does not exist`,
    });

    testHelper.handleTestCase({
      ...defaultPatchOptions,
      itTitle: 'should report error when user is not authorized',
      optionOmissionKeys: ['tokenIndex'],
      expectedStatus: httpStatus.UNAUTHORIZED,
      expectedCode: 401,
      expectedErrorMessage: 'No auth token',
    });

    testHelper.handleTestCase({
      ...defaultPatchOptions,
      itTitle: `should not update ${modelName} when user has no permission`,
      tokenIndex: 'user3AccessToken',
      expectedStatus: httpStatus.FORBIDDEN,
      expectedCode: 403,
      expectedErrorMessage: 'Forbidden',
    });

    /* ['game']
      .forEach(fieldName => (
        testHelper.handleTestCase({
          ...defaultPatchOptions,
          mutationDataSource: { [fieldName]: { [fieldName]: new mongoose.Types.ObjectId() } },
          itTitle: `should report error when referenced ${fieldName} does not exist`,
          expectedStatus: httpStatus.BAD_REQUEST,
          expectedCode: 400,
          expectedError: {
            eField: fieldName,
            eMessages: `"${fieldName}" references document which does not exist`,
          },
        })
      )); */

    Object.keys(invalidFieldOptions).filter(key => key === 'state')
      .forEach(fieldName =>
        invalidFieldOptions[fieldName]
          .forEach(invalidFieldCase =>
            testHelper.handleTestCase({
              ...defaultPatchOptions,
              mutationDataSource: {
                [fieldName]: { [fieldName]: invalidFieldCase.mutationValue },
              },
              itTitle: `should report error when ${fieldName} is ${invalidFieldCase.description}`,
              expectedStatus: httpStatus.BAD_REQUEST,
              expectedCode: 400,
              expectedError: {
                eField: fieldName,
                eMessages: invalidFieldCase.eMessages,
              },
            })));

    testHelper.handleTestCase({
      ...defaultPatchOptions,
      expectedCode: 200,
      expectedStatus: httpStatus.OK,
      expectedBodySource: dbObjects.main,
      optionOmissionKeys: 'requestDataSource',
      itTitle: `should not update ${modelName} when no parameters were given`,
    });
  });

  describe(`DELETE ${path}/rooms`, () => {
    testHelper.handleTestCase({
      ...defaultDelOptions,
      expectedCode: 204,
      expectedStatus: httpStatus.NO_CONTENT,
      itTitle: `should delete ${modelName}`,
      postReqFn: async (res, options) => {
        expect(await options.ModelClass.findById(options.resourceIdSource.id)).to.be.a('null');
      },
    });

    testHelper.handleTestCase({
      ...defaultDelOptions,
      expectedStatus: httpStatus.NOT_FOUND,
      expectedCode: 404,
      randomId: true,
      itTitle: `should report error "${modelNameCap} does not exist" when ${modelName} does not exist`,
      expectedErrorMessage: `${modelNameCap} does not exist`,
    });

    testHelper.handleTestCase({
      ...defaultDelOptions,
      itTitle: 'should report error when user is not authorized',
      optionOmissionKeys: ['tokenIndex'],
      expectedStatus: httpStatus.UNAUTHORIZED,
      expectedCode: 401,
      expectedErrorMessage: 'No auth token',
    });

    testHelper.handleTestCase({
      ...defaultDelOptions,
      itTitle: 'should report error when logged user is not an admin',
      tokenIndex: 'user3AccessToken',
      expectedStatus: httpStatus.FORBIDDEN,
      expectedCode: 403,
      expectedErrorMessage: 'Forbidden',
    });
  });
});
