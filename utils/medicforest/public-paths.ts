const MEDICFOREST_PUBLIC_PATHS = new Set([
  "/medicforest",
  "/medicforest/about",
  "/medicforest/access",
  "/medicforest/contact",
  "/medicforest/feedback",
  "/medicforest/interviews",
  "/medicforest/interview/question-bank",
  "/medicforest/personal-statement",
  "/medicforest/pricing",
  "/medicforest/resources",
  "/medicforest/tutoring",
  "/medicforest/ucat",
]);

const MEDICFOREST_PUBLIC_PATH_PREFIXES = [
  // These candidate-facing PNGs are requested by the clean /interviews routes.
  // Let Next serve the files even when the visitor has no preview-access cookie.
  "/medicforest/interview-stimuli/",
];

export function isPublicMedicForestPath(pathname: string) {
  return MEDICFOREST_PUBLIC_PATHS.has(pathname)
    || MEDICFOREST_PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
