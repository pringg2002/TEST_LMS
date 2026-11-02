// Main developer - Adaptive Learning endpoints. Mounted at "/" (full /api/... paths, `auth` per route).
const router = require('express').Router();
const controller = require('../controllers/adaptive.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../lib/roles');

const staff = role(ROLES.ADMIN, ROLES.INSTRUCTOR); // "own course" check happens in the service

router.get('/modules/:id/access', auth, asyncHandler(controller.moduleAccess));
router.get('/courses/:courseId/progress', auth, asyncHandler(controller.courseProgress));

// Instructor override: unlock a module for a student who used every attempt and still cannot pass.
router.get('/modules/:moduleId/unlock-candidates', auth, staff, asyncHandler(controller.unlockCandidates));
router.get('/modules/:moduleId/unlocks', auth, staff, asyncHandler(controller.listUnlocks));
router.post('/modules/:moduleId/unlocks', auth, staff, asyncHandler(controller.grantUnlock));
router.delete('/modules/:moduleId/unlocks/:studentId', auth, staff, asyncHandler(controller.revokeUnlock));

module.exports = router;
