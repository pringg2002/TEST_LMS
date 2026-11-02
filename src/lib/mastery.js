// The Adaptive Learning rules as PURE functions (no database), so they can be unit-tested.
//
//   module mastered  =  every published lesson completed (100%)
//                       AND the latest graded score of every published quiz >= required score
//   74% -> NOT mastered      75% -> mastered
//
//   "Latest" means the LAST attempt: when a student has used every allowed attempt,
//   that last attempt's score is the final score on record.
//
//   instructor override = allowed only when the student finished every lesson and has
//   used ALL attempts of every failing quiz (so they truly cannot improve any more).
const { meetsScore } = require('./grading');

const hasScore = (s) => s !== null && s !== undefined;

// lessons_total / lessons_completed: counts of published lessons.
// quiz_scores: one entry per published quiz - the student's LATEST graded score, or null if never graded.
function evaluateMastery({ lessons_total, lessons_completed, quiz_scores, minimum_score }) {
  const lessons_done = Number(lessons_total) === 0 || Number(lessons_completed) >= Number(lessons_total);
  const quizzes_done = quiz_scores.every((s) => hasScore(s) && meetsScore(s, minimum_score));
  const known = quiz_scores.filter(hasScore).map(Number);
  return {
    mastered: lessons_done && quizzes_done,
    lessons_done,
    quizzes_done,
    lessons_total: Number(lessons_total),
    lessons_completed: Number(lessons_completed),
    latest_score: known.length ? Math.min(...known) : null,
  };
}

// A quiz is exhausted when it has an attempt limit and the student has graded attempts >= that limit.
// A quiz without a limit (null) can never be exhausted.
function isExhausted(quiz) {
  return quiz.attempt_limit !== null && quiz.attempt_limit !== undefined &&
    Number(quiz.graded_attempts) >= Number(quiz.attempt_limit);
}

// Can an instructor unlock the module that depends on this prerequisite for this student?
// quizzes: [{ quiz_id, title, score (latest graded or null), graded_attempts, attempt_limit }]
function evaluateOverride({ lessons_done, quizzes, minimum_score }) {
  const failing = quizzes.filter((q) => !hasScore(q.score) || !meetsScore(q.score, minimum_score));
  if (!failing.length) return { eligible: false, reason: 'The student already meets the required score.' };
  if (!lessons_done) return { eligible: false, reason: 'The student has not finished all lessons yet.' };

  const stillOpen = failing.filter((q) => !isExhausted(q));
  if (stillOpen.length) {
    const names = stillOpen.map((q) => (q.attempt_limit == null ? `"${q.title}" (unlimited attempts)` : `"${q.title}"`)).join(', ');
    return { eligible: false, reason: `The student still has attempts left on ${names}.` };
  }
  return { eligible: true, reason: 'The student used every attempt and the last score is below the required score.' };
}

// Human-readable explanation of what is still missing (shown to the student).
function describeGap(title, evaluation, minimum_score, { attempts_exhausted = false } = {}) {
  const parts = [];
  if (!evaluation.lessons_done) {
    parts.push(`finish all lessons (${evaluation.lessons_completed}/${evaluation.lessons_total} done)`);
  }
  if (!evaluation.quizzes_done) {
    parts.push(
      evaluation.latest_score === null
        ? `pass the quiz with at least ${Number(minimum_score)}%`
        : `reach at least ${Number(minimum_score)}% on the quiz (latest score ${evaluation.latest_score}%)`
    );
  }
  let text = `Module "${title}": ${parts.join(' and ')}.`;
  if (attempts_exhausted) {
    text += ` All attempts are used - your last score (${evaluation.latest_score}%) is final. Ask your instructor to review.`;
  }
  return text;
}

module.exports = { evaluateMastery, evaluateOverride, isExhausted, describeGap };
