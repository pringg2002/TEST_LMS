// Pure grading helpers (no database) - shared by Member 4 (attempt scoring) and Member 6 (answer grading).
// Keeping them pure makes them easy to unit-test and to explain in the defense.

const normalize = (value) => String(value ?? '').trim().toLowerCase();

// Short-answer questions may list several accepted answers separated by "|", e.g. "primary key|pk".
function isCorrect(question, answerText) {
  const given = normalize(answerText);
  if (given === '') return false;
  return String(question.correct_answer)
    .split('|')
    .map(normalize)
    .includes(given);
}

// Returns what to store in attempt_answers for one answer.
function gradeAnswer(question, answerText) {
  const correct = isCorrect(question, answerText);
  return { is_correct: correct, points_earned: correct ? Number(question.points) : 0 };
}

// Percentage 0-100 rounded to 2 decimals (matches DECIMAL(5,2)). No questions => 0.
function computeScore(pointsEarned, pointsPossible) {
  const possible = Number(pointsPossible);
  if (!possible) return 0;
  return Math.round((Number(pointsEarned) / possible) * 10000) / 100;
}

// The mastery rule used everywhere: 75 passes, 74.99 does not.
const meetsScore = (score, required) => Number(score) >= Number(required);

module.exports = { normalize, isCorrect, gradeAnswer, computeScore, meetsScore };
