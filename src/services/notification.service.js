const notificationModel = require('../models/notification.models');
const { ROLES } = require('../lib/roles');
const AppError = require('../utils/AppError');

const TYPES = ['announcement', 'progress', 'quiz', 'system'];

// ---- For OTHER MEMBERS' services -------------------------------------------
// Call this when something notable happens, e.g. after a quiz is graded or a new
// module unlocks:
//   await notificationService.notify({
//     user_id: studentId, title: 'Module unlocked',
//     message: 'Module 2 is now available.', notification_type: 'progress', reference_id: moduleId });
async function notify({ user_id, title, message, notification_type = 'system', reference_id = null }) {
  if (!TYPES.includes(notification_type)) {
    throw new AppError(`notification_type must be one of: ${TYPES.join(', ')}`, 400);
  }
  const id = await notificationModel.create({ user_id, title, message, notification_type, reference_id });
  return notificationModel.findById(id);
}

// ---- Used by the notifications routes --------------------------------------
const listForUser = (userId, unreadOnly) => notificationModel.findByUser(userId, { unreadOnly });

async function loadOwned(id, actor) {
  const n = await notificationModel.findById(id);
  if (!n) throw new AppError('Notification not found', 404);
  if (n.user_id !== actor.user_id && actor.role !== ROLES.ADMIN) {
    throw new AppError('You can only access your own notifications', 403);
  }
  return n;
}

async function markRead(id, actor) {
  await loadOwned(id, actor);
  await notificationModel.markRead(id);
  return notificationModel.findById(id);
}

const markAllRead = (userId) => notificationModel.markAllRead(userId);

async function remove(id, actor) {
  await loadOwned(id, actor);
  await notificationModel.remove(id);
}

module.exports = { notify, listForUser, markRead, markAllRead, remove };
