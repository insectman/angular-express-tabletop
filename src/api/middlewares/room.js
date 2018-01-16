// const User = require('../models/user.model');
// const Room = require('../models/room.model');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');

const isRoomOwner = async (req, res, next) => {
  const apiError = new APIError({
    message: 'Forbidden',
    status: httpStatus.FORBIDDEN,
    stack: undefined,
  });
  const isOwner = req.user._id.equals(req.locals.room.owner);

  if (!isOwner) {
    return next(apiError);
  }

  return next();
};

const isRoomMember = async (req, res, next) => {
  next();
};

module.exports = {
  isRoomOwner,
  isRoomMember,
};
