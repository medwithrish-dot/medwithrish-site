"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Sparkles,
  Target,
} from "lucide-react";
import { ClientPremiumGate } from "./ClientPremiumGate";
import { ExpandableAiFeedback } from "./ExpandableAiFeedback";
import { ReportIssueSignalCard } from "./ReportIssueSignalCard";
import {
  buildReportIssueCard,
  formatDiagnosticReportDate,
  getActiveDiagnosticReportStudyPlanTasks,
  getCombinedDiagnosticAccuracy,
  getCombinedDiagnosticAvgSeconds,
  getDiagnosticReportStudyPlanTasks,
  getFullMockReportDiagnostics,
  isFreeQrDiagnostic,
  isFullMockSectionDiagnostic,
  type DashboardDiagnostic,
  type ReportSectionFilter,
} from "../_lib/ucatDiagnostics";

export type UCATReportContentProps = {
  isPremium: boolean;
  checkoutLoading: boolean;
  onUpgrade: () => void | Promise<void>;
  latestDiagnostic: DashboardDiagnostic | null;
  diagnosticHistory: DashboardDiagnostic[];
  initialReportId?: string | null;
  initialMockId?: string | null;
  completedDashboardTaskIds: Set<string>;
  removedDashboardTaskIds: Set<string>;
};

const reportFilters: ReportSectionFilter[] = ["All", "VR", "DM", "QR", "SJT"];

export function UCATReportContent({
  isPremium,
  checkoutLoading,
  onUpgrade,
  latestDiagnostic,
  diagnosticHistory,
  initialReportId,
  initialMockId,
  completedDashboardTaskIds,
  removedDashboardTaskIds,
}: UCATReportContentProps) {
  const [reportFilter, setReportFilter] = useState<ReportSectionFilter>("All");
  const selectedReportId = initialReportId ?? null;
  const selectedMockId = initialMockId ?? null;
  const [generatedFeedbackById, setGeneratedFeedbackById] = useState<
    Record<string, string>
  >({});
  const [aiRequestingReportId, setAiRequestingReportId] = useState<string | null>(
    null
  );
  const [aiFeedbackNotice, setAiFeedbackNotice] = useState<string | null>(null);
  const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);

  const reportHistory = useMemo(
    () =>
      diagnosticHistory.length > 0
        ? diagnosticHistory
        : latestDiagnostic
          ? [latestDiagnostic]
          : [],
    [diagnosticHistory, latestDiagnostic]
  );

  const selectedReportFromHistory = selectedReportId
    ? reportHistory.find((report) => report.id === selectedReportId) ?? null
    : selectedMockId
      ? reportHistory.find(
          (report) =>
            isFullMockSectionDiagnostic(report) && report.mockId === selectedMockId
        ) ?? null
    : null;

  const selectedDiagnostic =
    selectedReportId !== null || selectedMockId !== null
      ? selectedReportFromHistory
      : latestDiagnostic;

  const selectedReportMissing =
    Boolean(selectedReportId || selectedMockId) &&
    reportHistory.length > 0 &&
    !selectedReportFromHistory;

  const reportDiagnostics = getFullMockReportDiagnostics(
    selectedDiagnostic,
    reportHistory
  );

  const isFullMockReport =
    isFullMockSectionDiagnostic(selectedDiagnostic) && reportDiagnostics.length > 1;

  const filteredReportDiagnostics =
    reportFilter === "All"
      ? reportDiagnostics
      : reportDiagnostics.filter((diagnostic) => diagnostic.section === reportFilter);

  const selectedAiFeedbackText =
    reportDiagnostics
      .map((diagnostic) =>
        isFullMockReport && diagnostic.aiFeedbackScope !== "full_mock"
          ? generatedFeedbackById[diagnostic.id]
          : generatedFeedbackById[diagnostic.id] ?? diagnostic.aiFeedbackText
      )
      .find((feedback): feedback is string => Boolean(feedback)) ?? null;

  const selectedReportIsLatest =
    Boolean(selectedDiagnostic?.id && latestDiagnostic?.id) &&
    selectedDiagnostic?.id === latestDiagnostic?.id;

  const hasDiagnostic = Boolean(selectedDiagnostic);
  const reportFeaturesUnlocked =
    isPremium || isFreeQrDiagnostic(selectedDiagnostic);
  const filterMatches = filteredReportDiagnostics.length > 0;

  const diagnosticIssueCards = filteredReportDiagnostics.flatMap(
    (diagnostic) =>
      diagnostic.issues.map((issue, index) => {
        const issueCard = buildReportIssueCard(issue, index);

        if (!isFullMockReport) return issueCard;

        return {
          ...issueCard,
          id: `${diagnostic.id}-${issueCard.id}`,
          title: `${diagnostic.section} - ${issueCard.title}`,
          freeLabel: `${diagnostic.section} - ${issueCard.freeLabel}`,
          evidence: [`${diagnostic.section} section`, ...issueCard.evidence],
        };
      })
  );

  const hasSignals = diagnosticIssueCards.length > 0;
  const allStudyPlanTasks = getDiagnosticReportStudyPlanTasks(reportDiagnostics);
  const studyPlanTasks = getActiveDiagnosticReportStudyPlanTasks(
    reportDiagnostics,
    completedDashboardTaskIds,
    removedDashboardTaskIds
  );
  const recommendedTask = studyPlanTasks[0];
  const completedCurrentPlan = allStudyPlanTasks.length > 0 && !recommendedTask;

  const feedbackStatus =
    selectedAiFeedbackText
      ? "Ready"
      : selectedDiagnostic?.aiFeedbackStatus === "queued_no_api_key"
        ? "Queued"
        : selectedDiagnostic
          ? "Not requested"
          : "Waiting";

  const feedbackHelper =
    selectedAiFeedbackText
      ? isFullMockReport
        ? "Generated once from all saved sections in this full mock."
        : selectedReportIsLatest
        ? "Generated from your latest diagnostic."
        : "Generated from the selected previous diagnostic."
      : selectedReportMissing
        ? "This report link does not match a saved diagnostic on this account."
        : selectedDiagnostic
          ? isFullMockReport
            ? "Use 1 AI diagnostic credit to generate feedback across all saved sections in this full mock."
            : "AI feedback has not been generated for this diagnostic yet."
          : "Complete and mark a diagnostic to generate personalised written feedback.";

  const latestDiagnosticSummary = selectedDiagnostic
    ? isFullMockReport
      ? `Full mock report across ${reportDiagnostics.length} saved sections.`
      : `${selectedDiagnostic.section} diagnostic saved ${formatDiagnosticReportDate(selectedDiagnostic.completedAt)}.`
    : selectedReportMissing
      ? "Choose another diagnostic from your report history."
      : "Complete a diagnostic to unlock personalised issue labels and study tasks.";

  const metricAccuracy = selectedDiagnostic
    ? isFullMockReport
      ? `${getCombinedDiagnosticAccuracy(reportDiagnostics)}%`
      : `${selectedDiagnostic.accuracy}%`
    : "-";

  const metricAvgTime = selectedDiagnostic
    ? isFullMockReport
      ? `${getCombinedDiagnosticAvgSeconds(reportDiagnostics)}s`
      : `${selectedDiagnostic.avgSecondsPerQuestion ?? 0}s`
    : "-";

  const filteredLabel =
    reportFilter === "All"
      ? isFullMockReport
        ? "All saved sections"
        : `${selectedDiagnostic?.section ?? "All"} section`
      : `${reportFilter} section`;

  const signalBadgeText = hasSignals
    ? `${diagnosticIssueCards.length} detected`
    : filterMatches
      ? "Clear"
      : "No data";

  const signalBadgeClass = hasSignals
    ? "bg-amber-50 text-amber-700"
    : filterMatches
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-500";

  const feedbackBadgeClass =
    feedbackStatus === "Ready"
      ? "bg-emerald-50 text-emerald-700"
      : feedbackStatus === "Queued"
        ? "bg-amber-50 text-amber-700"
        : feedbackStatus === "Not requested"
          ? "bg-blue-50 text-blue-700"
          : "bg-violet-50 text-violet-700";

  const emptyIssueMessage =
    reportFilter !== "All"
      ? isFullMockReport
        ? `No ${reportFilter} section data in this full mock report.`
        : `No ${reportFilter} issues in the selected ${selectedDiagnostic?.section} diagnostic.`
      : hasDiagnostic
        ? "No issue labels were saved for this diagnostic."
        : selectedReportMissing
          ? "That specific diagnostic report could not be found. Choose another saved report from your history."
          : "Complete and mark a diagnostic to start detecting issues from your own telemetry.";

  const emptyIssueActionHref = hasDiagnostic
    ? "/medicforest/ucat/practice"
    : selectedReportMissing
      ? "/medicforest/ucat/report"
      : "/medicforest/ucat/diagnostic";

  const emptyIssueActionLabel = hasDiagnostic
    ? "Open practice"
    : selectedReportMissing
      ? "View reports"
      : "Run diagnostic";

  const noFeedbackActionLabel = hasDiagnostic
    ? aiRequestingReportId === selectedDiagnostic?.id
      ? "Generating..."
      : isFullMockReport
        ? "Generate full mock AI feedback"
        : "Generate AI feedback"
    : selectedReportMissing
      ? "View reports"
      : "Run diagnostic";

  const reportIssueIntro = hasDiagnostic
    ? isFullMockReport
      ? "Showing issue labels, causes, supporting evidence and study tasks across all saved sections in this full mock."
      : "Showing issue labels, causes, supporting evidence and study tasks from this diagnostic."
    : "MedicForest analyses response timing, calculator habits and decision confidence to isolate root causes.";

  const recommendedTaskText = !reportFeaturesUnlocked
    ? "Upgrade to unlock your study plan."
    : recommendedTask
      ? `${recommendedTask.title}: ${recommendedTask.fix}`
      : hasDiagnostic
        ? "Run another diagnostic to update your study priorities."
        : "Complete a diagnostic to generate targeted study tasks.";

  const recommendedTaskHref = !reportFeaturesUnlocked
    ? "/medicforest/pricing"
    : recommendedTask?.href ??
      (hasDiagnostic
        ? "/medicforest/ucat/diagnostic"
        : "/medicforest/ucat/question-bank/qr?diagnostic=free-qr");

  const selectReport = () => {
    setAiFeedbackNotice(null);
    setAiFeedbackError(null);
  };

  const requestSelectedReportAiFeedback = async () => {
    if (!selectedDiagnostic?.id) return;

    setAiRequestingReportId(selectedDiagnostic.id);
    setAiFeedbackNotice(null);
    setAiFeedbackError(null);

    try {
      const response = await fetch("/api/ai/diagnostic-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: selectedDiagnostic.id,
          attemptIds: reportDiagnostics.map((diagnostic) => diagnostic.id),
          section: selectedDiagnostic.section,
          accuracy: selectedDiagnostic.accuracy,
          scorePoints: selectedDiagnostic.scorePoints,
          maxScore: selectedDiagnostic.maxScore,
          answeredQuestions: selectedDiagnostic.answeredQuestions,
          totalQuestions: selectedDiagnostic.totalQuestions,
          avgSecondsPerQuestion: selectedDiagnostic.avgSecondsPerQuestion,
          issues: selectedDiagnostic.issues,
          strengths: selectedDiagnostic.strengths,
          studyPlanTasks: selectedDiagnostic.studyPlanTasks,
        }),
      });

      const payload = (await response.json()) as {
        feedback?: string;
        error?: string;
        attemptIds?: string[];
      };

      if (!response.ok || !payload.feedback) {
        throw new Error(payload.error ?? "AI feedback could not be generated.");
      }

      const returnedAttemptIds =
        payload.attemptIds && payload.attemptIds.length > 0
          ? payload.attemptIds
          : reportDiagnostics.map((diagnostic) => diagnostic.id);

      setGeneratedFeedbackById((current) => ({
        ...current,
        ...Object.fromEntries(
          returnedAttemptIds.map((attemptId) => [
            attemptId,
            payload.feedback ?? "",
          ])
        ),
      }));

      setAiFeedbackNotice(
        isFullMockReport
          ? "Full mock AI feedback generated and saved to each section report."
          : "AI feedback generated and saved to this report."
      );
    } catch (error) {
      setAiFeedbackError(
        error instanceof Error
          ? error.message
          : "AI feedback could not be generated."
      );
    } finally {
      setAiRequestingReportId(null);
    }
  };

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_220px_220px] md:items-center">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-blue-600">
              <Bookmark className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-black">
                {isFullMockReport
                  ? "Full mock diagnostic"
                  : selectedReportIsLatest
                    ? "Latest diagnostic"
                    : "Selected diagnostic"}
              </h2>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {latestDiagnosticSummary}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black text-slate-700">Overall accuracy</p>
            <p className="mt-2 text-3xl font-black text-slate-400">
              {metricAccuracy}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black text-slate-700">Avg. time / question</p>
            <p className="mt-2 text-3xl font-black text-slate-400">
              {metricAvgTime}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {reportFilters.map((filter) => {
          const active = reportFilter === filter;
          return (
            <button
              type="button"
              key={filter}
              onClick={() => setReportFilter(filter)}
              className={`h-8 rounded-full px-8 text-xs font-black ${
                active
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <section className="rounded-xl border border-violet-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-blue-600">
              MedicForest personalised feedback
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {feedbackHelper}
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${feedbackBadgeClass}`}>
            {feedbackStatus}
          </span>
        </div>
        {selectedAiFeedbackText ? (
          <ExpandableAiFeedback
            text={selectedAiFeedbackText}
            className="mt-4 text-sm font-semibold leading-7 text-slate-700"
            paragraphClassName="whitespace-pre-wrap"
            buttonClassName="mt-4 text-sm font-black text-blue-600 hover:text-blue-700"
          />
        ) : (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-violet-100 bg-violet-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold leading-6 text-slate-600">
              {hasDiagnostic
                ? "Generate AI feedback for this saved diagnostic. If feedback already exists, it will reload here."
                : "The generated feedback will appear here above the issue scan."}
            </p>
            {hasDiagnostic ? (
              <button
                type="button"
                onClick={() => void requestSelectedReportAiFeedback()}
                disabled={aiRequestingReportId === selectedDiagnostic?.id}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {noFeedbackActionLabel}
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <Link
                href="/medicforest/ucat/diagnostic"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700"
              >
                {noFeedbackActionLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
        {aiFeedbackNotice && (
          <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
            {aiFeedbackNotice}
          </p>
        )}
        {aiFeedbackError && (
          <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700">
            {aiFeedbackError}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">
              Issue scan
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              {reportIssueIntro}
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${signalBadgeClass}`}>
            {signalBadgeText}
          </span>
        </div>

        <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">
          Filter: {filteredLabel}
        </p>

        {!hasSignals && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>{emptyIssueMessage}</span>
            {hasDiagnostic && !filterMatches ? (
              <button
                type="button"
                onClick={() => setReportFilter("All")}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700"
              >
                Show all sections
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <Link
                href={emptyIssueActionHref}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700"
              >
                {emptyIssueActionLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {diagnosticIssueCards.map((issue) => (
            <ReportIssueSignalCard
              key={issue.id}
              issue={issue}
              isPremium={reportFeaturesUnlocked}
              hasSignals
              checkoutLoading={checkoutLoading}
              onUpgrade={onUpgrade}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
        <ClientPremiumGate
          isPremium={reportFeaturesUnlocked}
          checkoutLoading={checkoutLoading}
          onUpgrade={onUpgrade}
          title="Unlock personalised study plan"
          description="Premium reveals the exact drills and next tasks generated from this diagnostic report."
          featureLabel="Premium study plan"
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Personalised study plan
            </h2>
            {studyPlanTasks.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {studyPlanTasks.map((task, index) => {
                  const Icon = task.icon;
                  return (
                    <li key={task.id}>
                      <Link
                        href={task.href}
                        className="grid grid-cols-[36px_1fr] gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                            <h3 className="text-xs font-black uppercase tracking-wide text-blue-700">
                              {task.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                            {task.fix}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-2 text-xs font-black text-blue-600">
                            Start task
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <Link
                href={completedCurrentPlan ? "/medicforest/ucat/diagnostic" : "/medicforest/ucat/practice"}
                className="mt-4 block rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50/70"
              >
                <span>
                  {completedCurrentPlan
                    ? "All tasks from this report are ticked off."
                    : "Study tasks will appear here as the saved fixes from your latest diagnostic."}
                </span>
                <span className="mt-3 inline-flex items-center gap-2 text-xs font-black text-blue-600">
                  {completedCurrentPlan ? "Run another diagnostic" : "Open practice"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            )}
          </section>
        </ClientPremiumGate>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">
                View previous reports
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Open an earlier diagnostic to reload its AI feedback, issue scan
                and study plan on this page.
              </p>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
              {reportHistory.length} saved
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            {reportHistory.length === 0 ? (
              <Link
                href="/medicforest/ucat/diagnostic"
                className="block px-4 py-8 text-center transition-colors hover:bg-blue-50/70"
              >
                <p className="text-sm font-black text-slate-700">
                  No previous reports yet.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Saved diagnostics will appear here after you mark them.
                </p>
                <span className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-black text-blue-600">
                  Run diagnostic
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ) : (
              reportHistory.map((report, index) => {
                const active = report.id === selectedDiagnostic?.id;
                const reportHref = `/medicforest/ucat/report?attempt=${encodeURIComponent(report.id)}`;
                const reportAiReady = Boolean(
                  generatedFeedbackById[report.id] ?? report.aiFeedbackText
                );
                return (
                  <Link
                    key={report.id}
                    href={reportHref}
                    onClick={selectReport}
                    aria-current={active ? "page" : undefined}
                    className={`grid w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 sm:grid-cols-[1fr_90px_86px] sm:items-center ${
                      active
                        ? "bg-blue-50 text-blue-800"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        {index === 0 ? "Latest report" : `Previous report ${index}`}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {formatDiagnosticReportDate(report.completedAt)}
                      </p>
                    </div>
                    <span className="text-xs font-black">{report.section}</span>
                    <span className="text-xs font-black">
                      {reportAiReady ? "AI ready" : `${report.accuracy}%`}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
            <Target className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-black">
            Ready to improve?{" "}
            <span className="font-semibold text-slate-600">
              {recommendedTaskText}
            </span>
          </p>
        </div>
        <Link
          href={recommendedTaskHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-black text-white hover:bg-blue-700"
        >
          {!reportFeaturesUnlocked
            ? "Upgrade"
            : recommendedTask
              ? "Start recommended task"
              : "Open practice"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
