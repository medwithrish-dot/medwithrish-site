import {
  type UCATOptionKey,
  type UCATQuestion,
  type UCATSection,
  type UCATSingleQuestion,
  type UCATMostLeastSlot,
  isUCATDragCategoryQuestion,
  isUCATDragOrderQuestion,
  isUCATMostLeastQuestion,
  isUCATYesNoQuestion,
} from "./ucatQuestionBank";

export type PracticeAnswerStatus = "correct" | "partial" | "incorrect" | "unanswered";

export type PracticeAnswerMap = Record<string, string>;

export type PracticeAnswer = UCATOptionKey | string[] | PracticeAnswerMap;

export type PracticeAnswerScore = {
  points: number;
  maxPoints: number;
  status: PracticeAnswerStatus;
  feedback: string;
};

export type DiagnosticSectionScore = {
  label: string;
  value: string;
  helper: string;
  metadata: {
    rawScore: number;
    maxScore: number;
    accuracy: number;
    scaledScore: number | null;
    sjtBand: number | null;
  };
};

export function isPracticeAnswerMap(
  answer?: PracticeAnswer
): answer is Record<string, string> {
  return typeof answer === "object" && answer !== null && !Array.isArray(answer);
}

export function isUCATSingleSelectQuestion(
  question: UCATQuestion
): question is UCATSingleQuestion {
  return (
    !isUCATDragOrderQuestion(question) &&
    !isUCATDragCategoryQuestion(question) &&
    !isUCATYesNoQuestion(question) &&
    !isUCATMostLeastQuestion(question)
  );
}

export function sameOrder(first: string[], second: string[]) {
  return (
    first.length === second.length &&
    first.every((item, index) => item === second[index])
  );
}

export function getDragCategoryPlacementScore(
  question: UCATQuestion,
  answer?: PracticeAnswer
) {
  if (!isUCATDragCategoryQuestion(question) || !isPracticeAnswerMap(answer)) {
    return { placedCount: 0, correctCount: 0, totalCount: 0 };
  }

  const categoryIds = new Set(question.categories.map((category) => category.id));
  const totalCount = question.categoryItems.length;
  const placedCount = question.categoryItems.filter((item) =>
    categoryIds.has(answer[item.id])
  ).length;
  const correctCount = question.categoryItems.filter(
    (item) => answer[item.id] === item.answerCategory
  ).length;

  return { placedCount, correctCount, totalCount };
}

export function getYesNoStatementScore(
  question: UCATQuestion,
  answer?: PracticeAnswer
) {
  if (!isUCATYesNoQuestion(question) || !isPracticeAnswerMap(answer)) {
    return { answeredCount: 0, correctCount: 0, totalCount: 0 };
  }

  const totalCount = question.yesNoStatements.length;
  const answeredCount = question.yesNoStatements.filter((statement) =>
    ["Yes", "No"].includes(answer[statement.id])
  ).length;
  const correctCount = question.yesNoStatements.filter(
    (statement) => answer[statement.id] === statement.answer
  ).length;

  return { answeredCount, correctCount, totalCount };
}

export function getMostLeastSlotScore(
  question: UCATQuestion,
  answer?: PracticeAnswer
) {
  if (!isUCATMostLeastQuestion(question) || !isPracticeAnswerMap(answer)) {
    return { answeredCount: 0, correctCount: 0, totalCount: 0 };
  }

  const slots = Object.keys(question.answerSlots) as UCATMostLeastSlot[];
  const answeredCount = slots.filter((slot) => Boolean(answer[slot])).length;
  const correctCount = slots.filter(
    (slot) => answer[slot] === question.answerSlots[slot]
  ).length;

  return { answeredCount, correctCount, totalCount: slots.length };
}

export function makeAnswerScore(
  status: PracticeAnswerStatus,
  points: number,
  feedback: string,
  maxPoints = 1
): PracticeAnswerScore {
  return { points, maxPoints, status, feedback };
}

export function isSameSjtScaleSide(
  answer: UCATOptionKey,
  correctAnswer: UCATOptionKey
) {
  return (
    (["A", "B"].includes(answer) && ["A", "B"].includes(correctAnswer)) ||
    (["C", "D"].includes(answer) && ["C", "D"].includes(correctAnswer))
  );
}

export function isSjtPartialCreditAnswer(
  question: UCATQuestion,
  answer?: PracticeAnswer
) {
  return (
    question.section === "sjt" &&
    isUCATSingleSelectQuestion(question) &&
    typeof answer === "string" &&
    answer !== question.answer &&
    isSameSjtScaleSide(answer as UCATOptionKey, question.answer)
  );
}

export function getAnswerScore(
  question: UCATQuestion,
  answer?: PracticeAnswer
): PracticeAnswerScore {
  if (isUCATDragOrderQuestion(question)) {
    if (!Array.isArray(answer) || answer.length !== question.answerOrder.length) {
      return makeAnswerScore("unanswered", 0, "No answer selected");
    }

    return sameOrder(answer, question.answerOrder)
      ? makeAnswerScore("correct", 1, "Full mark awarded")
      : makeAnswerScore("incorrect", 0, "Incorrect order");
  }

  if (isUCATDragCategoryQuestion(question)) {
    const { placedCount, correctCount, totalCount } =
      getDragCategoryPlacementScore(question, answer);
    const wrongCount = totalCount - correctCount;

    if (totalCount === 0 || placedCount === 0) {
      return makeAnswerScore("unanswered", 0, "No answer selected");
    }

    if (correctCount === totalCount && placedCount === totalCount) {
      return makeAnswerScore(
        "correct",
        1,
        `${correctCount}/${totalCount} items correctly categorised`
      );
    }

    if (placedCount === totalCount && wrongCount === 1) {
      return makeAnswerScore(
        "partial",
        0.5,
        `${correctCount}/${totalCount} items correctly categorised`
      );
    }

    return makeAnswerScore(
      "incorrect",
      0,
      `${correctCount}/${totalCount} items correctly categorised`
    );
  }

  if (isUCATYesNoQuestion(question)) {
    const { answeredCount, correctCount, totalCount } = getYesNoStatementScore(
      question,
      answer
    );
    const wrongCount = totalCount - correctCount;

    if (totalCount === 0 || answeredCount < totalCount) {
      return makeAnswerScore("unanswered", 0, "Not all statements answered");
    }

    if (correctCount === totalCount) {
      return makeAnswerScore("correct", 1, "Full mark awarded");
    }

    if (wrongCount === 1) {
      return makeAnswerScore(
        "partial",
        0.5,
        `${correctCount}/${totalCount} statements correct`
      );
    }

    return makeAnswerScore(
      "incorrect",
      0,
      `${correctCount}/${totalCount} statements correct`
    );
  }

  if (isUCATMostLeastQuestion(question)) {
    const { answeredCount, correctCount, totalCount } = getMostLeastSlotScore(
      question,
      answer
    );
    const wrongCount = totalCount - correctCount;

    if (totalCount === 0 || answeredCount < totalCount) {
      return makeAnswerScore("unanswered", 0, "No complete response selected");
    }

    if (correctCount === totalCount) {
      return makeAnswerScore("correct", 1, "Full mark awarded");
    }

    if (wrongCount === 1) {
      return makeAnswerScore(
        "partial",
        0.5,
        `${correctCount}/${totalCount} positions correct`
      );
    }

    return makeAnswerScore(
      "incorrect",
      0,
      `${correctCount}/${totalCount} positions correct`
    );
  }

  if (!isUCATSingleSelectQuestion(question) || typeof answer !== "string") {
    return makeAnswerScore("unanswered", 0, "No answer selected");
  }

  if (answer === question.answer) {
    return makeAnswerScore("correct", 1, "Full mark awarded");
  }

  if (isSjtPartialCreditAnswer(question, answer)) {
    return makeAnswerScore("partial", 0.5, "Half mark awarded");
  }

  return makeAnswerScore("incorrect", 0, "Incorrect answer");
}

export function isAnswerCorrect(question: UCATQuestion, answer?: PracticeAnswer) {
  return getAnswerScore(question, answer).status === "correct";
}

export function isAnswered(question: UCATQuestion, answer?: PracticeAnswer) {
  if (isUCATDragOrderQuestion(question)) {
    return Array.isArray(answer) && answer.length === question.answerOrder.length;
  }

  if (isUCATDragCategoryQuestion(question)) {
    return getDragCategoryPlacementScore(question, answer).placedCount > 0;
  }

  if (isUCATYesNoQuestion(question)) {
    return (
      isPracticeAnswerMap(answer) &&
      question.yesNoStatements.every((statement) =>
        ["Yes", "No"].includes(answer[statement.id])
      )
    );
  }

  if (isUCATMostLeastQuestion(question)) {
    return (
      isPracticeAnswerMap(answer) &&
      (Object.keys(question.answerSlots) as UCATMostLeastSlot[]).every(
        (slot) => Boolean(answer[slot])
      )
    );
  }

  return typeof answer === "string" && Boolean(answer);
}

export function getEstimatedScaledScore(points: number, maxPoints: number) {
  if (maxPoints <= 0) return 300;

  const pct = Math.max(0, Math.min(1, points / maxPoints));
  return Math.max(300, Math.min(900, Math.round((300 + pct * 600) / 10) * 10));
}

export function getSjtBand(points: number, maxPoints: number) {
  if (maxPoints <= 0) return 4;

  const pct = (points / maxPoints) * 100;
  if (pct >= 75) return 1;
  if (pct >= 60) return 2;
  if (pct >= 40) return 3;
  return 4;
}

export function getDiagnosticSectionScore(summary: {
  scorePoints: number;
  maxScore: number;
  section: UCATSection;
}): DiagnosticSectionScore {
  const rawScore = summary.scorePoints;
  const maxScore = summary.maxScore;
  const accuracy = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

  if (summary.section === "sjt") {
    const band = getSjtBand(rawScore, maxScore);
    return {
      label: "SJT band",
      value: `Band ${band}`,
      helper: "Estimated from your partial-credit SJT score.",
      metadata: {
        rawScore,
        maxScore,
        accuracy,
        scaledScore: null,
        sjtBand: band,
      },
    };
  }

  const scaledScore = getEstimatedScaledScore(rawScore, maxScore);
  return {
    label: "Estimated scaled score",
    value: String(scaledScore),
    helper: "Approximate 300-900 scaling from this diagnostic set.",
    metadata: {
      rawScore,
      maxScore,
      accuracy,
      scaledScore,
      sjtBand: null,
    },
  };
}
