// Join reports. Each member adds their own report here (or in their own controller).
const userService = require('../services/user.service');
const courseService = require('../services/course.service');
const lessonService = require('../services/lesson.service');
const enrollmentService = require('../services/enrollment.service');
const quizService = require('../services/quiz.service');
const assignmentService = require('../services/assignment.service');
const { success } = require('../utils/response');

// Report 1 - Student Roles (users INNER JOIN roles)
exports.studentRoles = async (req, res) => {
  success(res, await userService.rolesReport(), 'Student roles report retrieved successfully');
};

// Report 2 - Course Modules (courses INNER JOIN modules)  [Member 2]
exports.courseModules = async (req, res) => {
  success(res, await courseService.modulesReport(), 'Course modules report retrieved successfully');
};

// Report 3 - Lessons Without Resources (lessons LEFT JOIN lesson_resources)  [Member 3]
exports.lessonsWithoutResources = async (req, res) => {
  success(res, await lessonService.lessonsWithoutResourcesReport(), 'Lessons without resources report retrieved successfully');
};

// Report 6 - Enrollment / Activity (LEFT JOIN UNION RIGHT JOIN)  [Member 6]
exports.enrollmentActivity = async (req, res) => {
  success(res, await enrollmentService.activityReport(), 'Enrollment activity report retrieved successfully');
};

// Report 4 - Quiz Questions (quizzes INNER JOIN questions)  [Member 4]
exports.quizQuestions = async (req, res) => {
  success(res, await quizService.quizQuestionsReport(), 'Quiz questions report retrieved successfully');
};

// Report 5 - Assignments Without Submissions (assignments LEFT JOIN submissions)  [Member 5]
exports.assignmentsWithoutSubmissions = async (req, res) => {
  success(res, await assignmentService.assignmentsWithoutSubmissionsReport(), 'Assignments without submissions report retrieved successfully');
};
