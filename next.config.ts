import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const legacyUcatRoutes = [
  "dashboard",
  "diagnostic",
  "diagnostics",
  "groups",
  "mocks",
  "practice",
  "progress",
  "question-bank",
  "report",
  "skills-trainers",
  "ucat-demo",
];

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    const phloemHosts = ["phloemai.com", "www.phloemai.com"];

    return [
      ...legacyUcatRoutes.map((route) => ({
        source: `/phloemai/${route}/:path*`,
        destination: `/phloemai/ucat/${route}/:path*`,
        permanent: true,
      })),
      {
        source: "/phloemai/interview",
        destination: "/phloemai/interview/dashboard",
        permanent: true,
      },
      {
        source: "/phloemai/interviews",
        destination: "/phloemai/interview/dashboard",
        permanent: true,
      },
      {
        source: "/phloemai/interviews/:path*",
        destination: "/phloemai/interview/:path*",
        permanent: true,
      },
      ...phloemHosts.flatMap((host) => [
        {
          source: "/",
          has: [{ type: "host" as const, value: host }],
          destination: "https://www.medwithrish.com/phloemai",
          permanent: true,
        },
        {
          source: "/phloemai/:path*",
          has: [{ type: "host" as const, value: host }],
          destination: "https://www.medwithrish.com/phloemai/:path*",
          permanent: true,
        },
        {
          source: "/:path*",
          has: [{ type: "host" as const, value: host }],
          destination: "https://www.medwithrish.com/phloemai/:path*",
          permanent: true,
        },
      ]),
    ];
  },
};

export default nextConfig;
