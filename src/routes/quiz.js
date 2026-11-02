// Member 4 - quizzes, questions, attempts. Mounted at "/" (full /api/... paths, `auth` per route).
const router = require('express').Router();
const controller = require('../controllers/quiz.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../lib/roles');

const staff = role(ROLES.ADMIN, ROLES.INSTRUCTOR);
const student = role(ROLES.STUDENT);

// Quizzes
router.get('/modules/:moduleId/quizzes', auth, asyncHandler(controller.listByModule));
router.post('/modules/:moduleId/quizzes', auth, staff, asyncHandler(controller.createInModule));
router.get('/quizzes/:id', auth, asyncHandler(controller.get));
router.put('/quizzes/:id', auth, staff, asyncHandler(controller.update));
router.delete('/quizzes/:id', auth, staff, asyncHandler(controller.remove));

// Questions (the answer key is only returned to the quiz's instructor/admin)
router.get('/quizzes/:quizId/questions', auth, asyncHandler(controller.listQuestions));
router.post('/quizzes/:quizId/questions', auth, staff, asyncHandler(controller.createQuestion));
router.get('/questions/:id', auth, asyncHandler(controller.getQuestion));
router.put('/questions/:id', auth, staff, asyncHandler(controller.updateQuestion));
router.delete('/questions/:id', auth, staff, asyncHandler(controller.removeQuestion));

// Attempts
router.get('/quizzes/:quizId/attempts', auth, asyncHandler(controller.listAttempts));
router.post('/quizzes/:quizId/attempts', auth, student, asyncHandler(controller.startAttempt));
router.get('/attempts/:id', auth, asyncHandler(controller.getAttempt));
router.post('/attempts/:id/submit', auth, student, asyncHandler(controller.submitAttempt)); // extra: grades the attempt

module.exports = router;
