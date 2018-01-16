/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
// const request = require('supertest');
const httpStatus = require('http-status');

const chai = require('chai');
const dirtyChai = require('dirty-chai');
// const sinon = require('sinon');
// const bcrypt = require('bcryptjs');
/* const {
  some,
  omitBy,
  isNil,
} = require('lodash'); */
// const app = require('../../../index');
const User = require('../../models/user.model');
// const JWT_EXPIRATION = require('../../../config/vars').jwtExpirationInterval;

const testHelper = require('../../helpers/test.helper');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const { expect } = chai;
chai.use(dirtyChai);

/**
 * root level hooks
 */

/*
async function format(user) {
  const formated = user;

  // delete password
  delete formated.password;

  // get users from database
  const dbUser = (await User.findOne({ email: user.email })).transform();

  // remove null and undefined properties
  return omitBy(dbUser, isNil);
}
*/

const ModelClass = User;
const path = `/v1/${ModelClass.collection.name}`;
const modelNameCap = (new ModelClass()).constructor.modelName;
const modelName = modelNameCap.toLowerCase();


const password = '123456';

let adminAccessToken;
let jonAccessToken;
let branAccessToken;

const dbObjects = {
  branStark: {
    email: 'branstark@gmail.com',
    name: 'Bran Stark',
  },
  jonSnow: {
    email: 'jonsnow@gmail.com',
    name: 'Jon Snow',
  },
  adminUser: {
    email: 'adminuser@gmail.com',
    name: 'Ad Min',
    role: 'admin',
  },
};

const newUser = {
  email: 'newuser@gmail.com',
  name: 'New User',
};

const newAdmin = {
  email: 'newadmin@gmail.com',
  name: 'new Admin',
  role: 'admin',
};

const paginationSource = {
  page: 2,
  perPage: 1,
};

const tokens = {
  adminAccessToken: null,
  jonAccessToken: null,
  branAccessToken: null,
};

const defaultOptions = {
  tokens,
  path,
  ModelClass,
  modelName,
  expectedBodyOmissionKeys: ['password'],
  tokenIndex: 'adminAccessToken',
};

const defaultGetOptions = {
  ...defaultOptions,
  method: 'get',
};

const defaultPostOptions = {
  ...defaultOptions,
  method: 'post',
  requestDataSource: newAdmin,
  mutationDataSource: { password: { password } },
};

const defaultPutOptions = {
  ...defaultOptions,
  method: 'put',
  tokenIndex: 'branAccessToken',
  requestDataSource: newUser,
  mutationDataSource: { password: { password } },
  resourceIdSource: dbObjects.branStark,
};

const defaultPatchOptions = {
  ...defaultOptions,
  method: 'patch',
  tokenIndex: 'branAccessToken',
  requestDataSource: newUser,
  resourceIdSource: dbObjects.branStark,
};

const defaultDelOptions = {
  ...defaultOptions,
  method: 'delete',
  tokenIndex: 'adminAccessToken',
  resourceIdSource: dbObjects.branStark,
};

const invalidFieldOptions = {
  password: [{
    mutationValue: '12345',
    eMessages: '"password" length must be at least 6 characters long',
    description: 'less than 6 characters long',
  }],
};

describe('Users API', async () => {
  beforeEach(async () => {
    await ModelClass.remove({});
    const createdBran = await ModelClass
      .create({ ...dbObjects.branStark, password });
    await delay(1);
    const createdJon = await ModelClass
      .create({ ...dbObjects.jonSnow, password });
    await delay(1);
    const createdAdmin = await ModelClass
      .create({ ...dbObjects.adminUser, password });

    dbObjects.branStark.id = createdBran._id.toString();
    dbObjects.jonSnow.id = createdJon._id.toString();
    dbObjects.adminUser.id = createdAdmin._id.toString();

    adminAccessToken = (await ModelClass.findAndGenerateToken({ ...dbObjects.adminUser, password }))
      .accessToken;
    branAccessToken = (await ModelClass.findAndGenerateToken({ ...dbObjects.branStark, password }))
      .accessToken;
    jonAccessToken = (await ModelClass.findAndGenerateToken({ ...dbObjects.jonSnow, password }))
      .accessToken;

    tokens.adminAccessToken = adminAccessToken;
    tokens.branAccessToken = branAccessToken;
    tokens.jonAccessToken = jonAccessToken;
  });

  describe('POST /v1/users', () => {
    testHelper.handleTestCase({
      ...defaultPostOptions,
      expectedStatus: httpStatus.CREATED,
      expectedCode: 201,
      expectedBodySource: defaultPostOptions.requestDataSource,
      itTitle: 'should create a new admin user when request is ok',
    });

    testHelper.handleTestCase({
      ...defaultPostOptions,
      requestDataSource: newUser,
      expectedStatus: httpStatus.CREATED,
      expectedCode: 201,
      expectedBodySource: newUser,
      expectedBodyMutationSource: { role: { role: 'user' } },
      itTitle: `should create a new ${modelName} and set default role to "user"`,
    });

    ['email'].forEach(duplicateValueName => (
      testHelper.handleTestCase({
        ...defaultPostOptions,
        mutationDataSource: {
          ...defaultPostOptions.mutationDataSource,
          [duplicateValueName]: dbObjects.branStark,
        },
        expectedStatus: httpStatus.CONFLICT,
        expectedCode: 409,
        itTitle: `should report error when ${duplicateValueName} already exists`,
      })
    ));

    ['email', 'password'].forEach(fieldName => (
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

    Object.keys(invalidFieldOptions)
      .forEach(fieldName =>
        invalidFieldOptions[fieldName]
          .forEach(invalidFieldCase =>
            testHelper.handleTestCase({
              ...defaultPostOptions,
              mutationDataSource: {
                ...defaultPostOptions.mutationDataSource,
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
      ...defaultPostOptions,
      itTitle: 'should report error when logged user is not an admin',
      tokenIndex: 'jonAccessToken',
      expectedStatus: httpStatus.FORBIDDEN,
      expectedCode: 403,
      expectedErrorMessage: 'Forbidden',
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
      expectedResponseArray: [dbObjects.jonSnow],
      queryDataSource: {
        page: paginationSource,
        perPage: paginationSource,
      },
      itTitle: `should get all ${modelName}s with pagination`,
    });

    testHelper.handleTestCase({
      ...defaultGetOptions,
      expectedResponseArray: [dbObjects.adminUser],
      queryDataSource: {
        role: { role: 'admin' },
      },
      itTitle: `should filter ${modelName}s`,
    });

    ['page', 'perPage'].forEach(fieldName =>
      testHelper.handleTestCase({
        ...defaultGetOptions,
        queryDataSource: {
          [fieldName]: { [fieldName]: 'foobar' },
        },
        expectedStatus: httpStatus.BAD_REQUEST,
        expectedCode: 400,
        expectedError: {
          eField: fieldName,
          eLocation: 'query',
          eMessages: `"${fieldName}" must be a number`,
        },
        itTitle: `should report error when pagination's parameter (${fieldName}) is not a number`,
      }));

    testHelper.handleTestCase({
      ...defaultGetOptions,
      itTitle: 'should report error when logged user is not an admin',
      tokenIndex: 'jonAccessToken',
      expectedStatus: httpStatus.FORBIDDEN,
      expectedCode: 403,
      expectedErrorMessage: 'Forbidden',
    });
  });

  describe(`GET ${path}/:userId`, () => {
    testHelper.handleTestCase({
      ...defaultGetOptions,
      tokenIndex: 'jonAccessToken',
      resourceIdSource: dbObjects.jonSnow,
      expectedStatus: httpStatus.OK,
      expectedCode: 200,
      expectedBodySource: dbObjects.jonSnow,
      itTitle: `should get ${modelName}`,
    });

    testHelper.handleTestCase({
      ...defaultGetOptions,
      tokenIndex: 'jonAccessToken',
      randomId: true,
      itTitle: `should report error "${modelNameCap} does not exist" when ${modelName} does not exist`,
      expectedStatus: httpStatus.NOT_FOUND,
      expectedCode: 404,
      expectedErrorMessage: `${modelNameCap} does not exist`,
    });

    testHelper.handleTestCase({
      ...defaultGetOptions,
      tokenIndex: 'jonAccessToken',
      resourceIdSource: { id: 'qwertyu123456' },
      itTitle: `should report error "${modelNameCap} does not exist" when id is not a valid ObjectID`,
      expectedStatus: httpStatus.NOT_FOUND,
      expectedCode: 404,
      expectedErrorMessage: `${modelNameCap} does not exist`,
    });

    testHelper.handleTestCase({
      ...defaultGetOptions,
      tokenIndex: 'branAccessToken',
      resourceIdSource: dbObjects.jonSnow,
      itTitle: 'should report error when logged user is not the same as the requested one',
      expectedStatus: httpStatus.FORBIDDEN,
      expectedCode: 403,
      expectedErrorMessage: 'Forbidden',
    });
  });

  describe(`PUT ${path}`, () => {
    testHelper.handleTestCase({
      ...defaultPutOptions,
      expectedStatus: httpStatus.OK,
      expectedCode: 200,
      expectedBodySource: defaultPutOptions.requestDataSource,
      itTitle: `should replace ${modelName}`,
    });

    ['email', 'name', 'password'].forEach(fieldName => (
      testHelper.handleTestCase({
        ...defaultPutOptions,
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

    Object.keys(invalidFieldOptions)
      .forEach(fieldName =>
        invalidFieldOptions[fieldName]
          .forEach(invalidFieldCase =>
            testHelper.handleTestCase({
              ...defaultPutOptions,
              mutationDataSource: {
                ...defaultPostOptions.mutationDataSource,
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
      ...defaultPutOptions,
      itTitle: `should report error "${modelNameCap} does not exist" when ${modelName} does not exist`,
      expectedStatus: httpStatus.NOT_FOUND,
      expectedCode: 404,
      randomId: true,
      expectedErrorMessage: `${modelNameCap} does not exist`,
    });

    testHelper.handleTestCase({
      ...defaultPutOptions,
      tokenIndex: 'jonAccessToken',
      itTitle: 'should report error when logged user is not the same as the requested one',
      expectedStatus: httpStatus.FORBIDDEN,
      expectedCode: 403,
      expectedErrorMessage: 'Forbidden',
    });

    testHelper.handleTestCase({
      ...defaultPutOptions,
      requestDataSource: newAdmin,
      expectedStatus: httpStatus.OK,
      expectedCode: 200,
      expectedBodySource: newAdmin,
      expectedBodyMutationSource: { role: { role: 'user' } },
      itTitle: 'should not replace the role of the user (not admin)',
    });
  });

  describe('PATCH /v1/users/:userId', () => {
    testHelper.handleTestCase({
      ...defaultPatchOptions,
      expectedStatus: httpStatus.OK,
      expectedCode: 200,
      expectedBodySource: defaultPatchOptions.requestDataSource,
      itTitle: `should update ${modelName}`,
    });

    testHelper.handleTestCase({
      ...defaultPatchOptions,
      expectedCode: 200,
      expectedStatus: httpStatus.OK,
      expectedBodySource: dbObjects.branStark,
      optionOmissionKeys: 'requestDataSource',
      itTitle: `should not update ${modelName} when no parameters were given`,
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
      tokenIndex: 'jonAccessToken',
      itTitle: 'should report error when logged user is not the same as the requested one',
      expectedStatus: httpStatus.FORBIDDEN,
      expectedCode: 403,
      expectedErrorMessage: 'Forbidden',
    });

    testHelper.handleTestCase({
      ...defaultPatchOptions,
      requestDataSource: newAdmin,
      expectedStatus: httpStatus.OK,
      expectedCode: 200,
      expectedBodySource: newAdmin,
      expectedBodyMutationSource: { role: { role: 'user' } },
      itTitle: 'should not replace the role of the user (not admin)',
    });
  });

  describe('DELETE /v1/users', () => {
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
      tokenIndex: 'jonAccessToken',
      itTitle: 'should report error when logged user is not the same as the requested one',
      expectedStatus: httpStatus.FORBIDDEN,
      expectedCode: 403,
      expectedErrorMessage: 'Forbidden',
    });
  });

  /*  describe('GET /v1/users/profile', () => {
    return; it('should get the logged user\'s info', () => {
      delete dbObjects.jonSnow.password;

      return request(app)
        .get('/v1/users/profile')
        .set('Authorization', `Bearer ${jonAccessToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(dbObjects.jonSnow);
        });
    });

    it('should report error without stacktrace when accessToken is expired', async () => {
      // fake time
      const clock = sinon.useFakeTimers();
      const expiredAccessToken = (await User.findAndGenerateToken(dbObjects.branStark)).accessToken;

      // move clock forward by minutes set in config + 1 minute
      clock.tick((JWT_EXPIRATION * 60000) + 60000);

      return request(app)
        .get('/v1/users/profile')
        .set('Authorization', `Bearer ${expiredAccessToken}`)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.code).to.be.equal(httpStatus.UNAUTHORIZED);
          expect(res.body.message).to.be.equal('jwt expired');
          expect(res.body).to.not.have.a.property('stack');
        });
    });
  }); */
});
