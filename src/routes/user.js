// TEMPLATE for the team: route -> auth -> role -> controller (wrapped in asyncHandler).
const router = require('express').Router();
const controller = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../lib/roles');

router.use(auth); // every users route requires login

router.get('/', role(ROLES.ADMIN), asyncHandler(controller.list));
router.get('/students', role(ROLES.ADMIN, ROLES.INSTRUCTOR), asyncHandler(controller.listStudents)); // must stay above '/:id'
router.post('/', role(ROLES.ADMIN), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.get));        // admin or self (checked in service)
router.put('/:id', asyncHandler(controller.update));     // admin or self (checked in service)
router.delete('/:id', role(ROLES.ADMIN), asyncHandler(controller.remove));

module.exports = router;
