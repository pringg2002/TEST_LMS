// Central place where every member mounts their router.
// When you finish a feature, uncomment YOUR line (and create the file in src/routes/).
const router = require('express').Router();
const { success } = require('../utils/response');

router.get('/health', (req, res) => success(res, null, 'Learning Module API is running'));

// Member 1
router.use('/auth', require('./auth'));
router.use('/users', require('./user'));
router.use('/notifications', require('./notification'));
router.use('/reports', require('./report'));

// Member 2 - courses, modules, prerequisites
router.use(require('./course')); // /courses, /courses/:courseId/modules
router.use(require('./module')); // /modules/:id, /modules/:moduleId/prerequisites, /prerequisites/:id

// Member 3 - lessons, resources, progress
router.use(require('./lesson')); // lessons, resources, progress

// Member 4 - quizzes, questions, attempts
router.use(require('./quiz')); // quizzes, questions, attempts

// Member 5 - assignments, submissions, discussions, replies
router.use(require('./assignment')); // assignments, submissions
router.use(require('./discussion')); // discussions, replies

// Main developer - adaptive learning (module access + course progress)
router.use(require('./adaptive'));

// Member 6 - enrollments, answers, announcements
router.use(require('./enrollment')); // enrollments, announcements
router.use(require('./answer')); // attempt answers (auto-graded)

module.exports = router;
