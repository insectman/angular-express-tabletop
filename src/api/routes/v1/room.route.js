const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/room.controller');
const { authorize, ADMIN } = require('../../middlewares/auth');
const { isRoomOwner, isRoomMember } = require('../../middlewares/room');
const {
  listRooms,
  createRoom,
  updateRoom,
} = require('../../validations/room.validation');

const router = express.Router();

/**
 * Load room when API with roomId route parameter is hit
 */
router.param('roomId', controller.load);


router
  .route('/')
  .get(validate(listRooms), controller.list);

router
  .route('/create')
  .post(authorize(), validate(createRoom), controller.create);

router
  .route('/:roomId')
  .get(controller.get)
  .patch(authorize(), validate(updateRoom), isRoomOwner, controller.update)
  .delete(authorize(ADMIN), controller.remove);

router
  .route('/join')
  .post(authorize(), controller.join);

router
  .route('/leave')
  .post(authorize(), isRoomMember, controller.leave);

module.exports = router;
