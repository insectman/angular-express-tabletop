/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^path|tokens|tokenIndex$" }] */

// const { expect } = require('chai');

const chai = require('chai');
const dirtyChai = require('dirty-chai');

const { expect } = chai;
chai.use(dirtyChai);


const request = require('supertest');
const app = require('../../index');
// const httpStatus = require('http-status');
const mongoose = require('mongoose');
const {
  some,
  omit,
} = require('lodash');

const getModelPathValidator = (model, fPath, type) =>
  model.schema.path(fPath).validators.filter(validator => validator.type === type)[0];

const formatModelsArray = models =>
  (models.length ? models.map(model => omit(model, 'createdAt')) : models);

const parseQueryData = (options) => {
  const query = {};
  if (options.queryDataSource && Object.keys(options.queryDataSource).length) {
    Object.keys(options.queryDataSource).forEach((key) => {
      query[key] = options.queryDataSource[key][key];
    });
    return { ...options, query };
  }
  return { ...options };
};

const parsePathData = (options) => {
  const { path, resourceIdSource, randomId } = options;
  if (randomId) {
    return { ...options, path: `${path}/${new mongoose.Types.ObjectId()}` };
  } else if (resourceIdSource) {
    return { ...options, path: `${path}/${resourceIdSource.id}` };
  }
  return { ...options };
};

const parseRequestData = (options) => {
  if (options.requestDataSource) {
    let requestData = { ...options.requestDataSource };

    if (options.mutationDataSource) {
      Object.keys(options.mutationDataSource).forEach((key) => {
        requestData[key] = options.mutationDataSource[key][key];
      });
    }

    if (options.requestOmissionKeys) {
      requestData = omit(requestData, options.requestOmissionKeys);
    }

    return { ...options, requestData };
  }
  return { ...options };
};

const parseOptionOmission = (options) => {
  if (options.optionOmissionKeys) {
    return omit(options, options.optionOmissionKeys);
  }
  return { ...options };
};

const parseExpectedBody = (options) => {
  const { expectedBodySource, expectedBodyMutationSource, expectedBodyOmissionKeys } = options;
  if (expectedBodySource) {
    let expectedBody = { ...expectedBodySource };
    if (expectedBodyMutationSource) {
      Object.keys(expectedBodyMutationSource).forEach((key) => {
        expectedBody[key] = expectedBodyMutationSource[key][key];
      });
    }
    if (expectedBodyOmissionKeys) {
      expectedBody = omit(expectedBody, expectedBodyOmissionKeys);
    }
    return { ...options, expectedBody };
  }
  return { ...options };
};

const parseOptions = options =>
  [parseOptionOmission, parseQueryData, parseRequestData, parsePathData, parseExpectedBody]
    .reduce((o, fn) =>
      fn(o), options);


const prepareRequest = (options) => {
  const {
    path,
    method,
    requestData = null,
    tokens,
    tokenIndex,
    query,
    breakPointTrap1,
  } = options;
  const res = request(app)[method](path);
  const accessToken = tokenIndex ? tokens[tokenIndex] : null;
  if (query) {
    res.query(query);
  }
  if (['post', 'patch', 'put'].includes(method) && requestData) {
    res.send(requestData);
  }
  if (accessToken) {
    res.set('Authorization', `Bearer ${accessToken}`);
  }
  if (breakPointTrap1) {
    breakPointTrap1(res, options);
  }
  return res;
};

const handleTestCase = params =>
  it(params.itTitle, async () => {
    if (params.preParseFn) {
      await params.preParseFn(params);
    }
    const options = parseOptions(params);
    if (options.preReqFn) {
      await options.preReqFn(options);
    }
    const res = await prepareRequest(options);
    if (options.postReqFn) {
      await options.postReqFn(res, options);
    }
    if (options.expectedStatus) {
      expect(res.status).to.be.equal(options.expectedStatus);
    }
    if (options.expectedCode) {
      expect(res.statusCode).to.be.equal(options.expectedCode);
    }
    if (options.expectedErrorMessage) {
      expect(res.body.message).to.be.equal(options.expectedErrorMessage);
    }
    if (options.expectedBody) {
      expect(res.body).to.include(options.expectedBody);
    }
    if (options.expectedError) {
      const { field, location, messages } = res.body.errors[0];
      const { eField, eLocation = 'body', eMessages } = options.expectedError;
      expect(field).to.be.equal(eField);
      expect(location).to.be.equal(eLocation);
      expect(messages).to.include(eMessages);
    }
    if (options.expectedResponseArray) {
      let includesAllModels = true;
      const formatted = formatModelsArray(res.body);
      options.expectedResponseArray.forEach((expectedModel) => {
        includesAllModels = includesAllModels && some(formatted, expectedModel);
      });
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(options.expectedResponseArray.length);
      expect(includesAllModels).to.be.true();
    }
  });

const getUniqueModelFields = (Model) => {
  const uniqueFields = [];


  Object.keys(Model.schema.paths).forEach((path) => {
    if (Model.schema.paths[path].options.unique) {
      uniqueFields.push(path);
    }
  });

  return uniqueFields;
};

module.exports = {
  getUniqueModelFields,
  handleTestCase,
  getModelPathValidator,
};
