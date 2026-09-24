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
];

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      ...legacyUcatRoutes.map((route) => ({
        source: `/medicforest/${route}/:path*`,
        destination: `/medicforest/ucat/${route}/:path*`,
        permanent: true,
      })),
      {
        source: "/medicforest/interview",
        destination: "/medicforest/interview/dashboard",
        permanent: true,
      },
      {
        source: "/medicforest/interviews/:path+",
        destination: "/medicforest/interview/:path+",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: "www.medicforest.com" }],
        destination: "https://medicforest.com",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.medicforest.com" }],
        destination: "https://medicforest.com/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: "medicforest.com" }],
          destination: "/medicforest",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
