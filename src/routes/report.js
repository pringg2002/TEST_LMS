const router = require('express').Router();
const controller = require('../controllers/report.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../lib/roles');

router.use(auth, role(ROLES.ADMIN, ROLES.INSTRUCTOR));

router.get('/student-roles', asyncHandler(controller.studentRoles)); // Report 1: users INNER JOIN roles
// Members: add your report here, e.g.
router.get('/course-modules', asyncHandler(controller.courseModules)); // Report 2: courses INNER JOIN modules
router.get('/lessons-without-resources', asyncHandler(controller.lessonsWithoutResources)); // Report 3: lessons LEFT JOIN lesson_resources
router.get('/quiz-questions', asyncHandler(controller.quizQuestions)); // Report 4: quizzes INNER JOIN questions
router.get('/assignments-without-submissions', asyncHandler(controller.assignmentsWithoutSubmissions)); // Report 5: assignments LEFT JOIN submissions
router.get('/enrollment-activity', asyncHandler(controller.enrollmentActivity)); // Report 6: LEFT JOIN UNION RIGHT JOIN

module.exports = router;
