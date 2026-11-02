// Shared authorization helpers ("who may touch this course/module?").
// Every member's service uses these instead of re-writing ownership rules.
//   await access.assertCourseManager(req.user, courseId)   // admin or the course's instructor
//   const mod = await access.assertModuleManager(user, moduleId)
const courseModel = require('../models/course.models');
const moduleModel = require('../models/module.models');
const { ROLES } = require('../lib/roles');
const AppError = require('../utils/AppError');

const isAdmin = (user) => user.role === ROLES.ADMIN;
const isStaff = (user) => user.role === ROLES.ADMIN || user.role === ROLES.INSTRUCTOR;

async function getCourseOrFail(courseId) {
  const course = await courseModel.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);
  return course;
}

async function getModuleOrFail(moduleId) {
  const mod = await moduleModel.findById(moduleId);
  if (!mod) throw new AppError('Module not found', 404);
  return mod;
}

// Admin, or the instructor who owns the course. Returns the course.
async function assertCourseManager(user, courseId) {
  const course = await getCourseOrFail(courseId);
  if (!isAdmin(user) && !(user.role === ROLES.INSTRUCTOR && course.instructor_id === user.user_id)) {
    throw new AppError('Only the course instructor or an admin can do this', 403);
  }
  return course;
}

// Same rule, starting from a module id. Returns { module, course }.
async function assertModuleManager(user, moduleId) {
  const module = await getModuleOrFail(moduleId);
  const course = await assertCourseManager(user, module.course_id);
  return { module, course };
}

module.exports = { isAdmin, isStaff, getCourseOrFail, getModuleOrFail, assertCourseManager, assertModuleManager };
