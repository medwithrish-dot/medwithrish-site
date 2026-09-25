import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const medicForestHost = { type: "host" as const, value: "medicforest.com" };
const medicForestPublicPagePattern =
  "about|pricing|personal-statement|tutoring|resources|feedback|contact";
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
        source: "/interviews",
        has: [medicForestHost],
        destination: "https://medicforest.com/interviews/dashboard",
        permanent: true,
      },
      {
        source: "/medicforest/interview",
        has: [medicForestHost],
        destination: "https://medicforest.com/interviews/dashboard",
        permanent: true,
      },
      {
        source: "/medicforest/interview/:path+",
        has: [medicForestHost],
        destination: "https://medicforest.com/interviews/:path+",
        permanent: true,
      },
      {
        source: "/medicforest/interviews",
        has: [medicForestHost],
        destination: "https://medicforest.com/interviews/dashboard",
        permanent: true,
      },
      {
        source: "/medicforest/interviews/:path+",
        has: [medicForestHost],
        destination: "https://medicforest.com/interviews/:path+",
        permanent: true,
      },
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
        source: "/medicforest",
        has: [medicForestHost],
        destination: "https://medicforest.com",
        permanent: true,
      },
      {
        source: "/medicforest/ucat",
        has: [medicForestHost],
        destination: "https://medicforest.com/ucat",
        permanent: true,
      },
      {
        source: "/medicforest/ucat/:path+",
        has: [medicForestHost],
        destination: "https://medicforest.com/ucat/:path+",
        permanent: true,
      },
      {
        source: `/medicforest/:page(${medicForestPublicPagePattern})`,
        has: [medicForestHost],
        destination: "https://medicforest.com/:page",
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
          has: [medicForestHost],
          destination: "/medicforest",
        },
        {
          source: "/ucat/:path*",
          has: [medicForestHost],
          destination: "/medicforest/ucat/:path*",
        },
        {
          source: "/interviews/:path+",
          has: [medicForestHost],
          destination: "/medicforest/interview/:path+",
        },
        {
          source: `/:page(${medicForestPublicPagePattern})`,
          has: [medicForestHost],
          destination: "/medicforest/:page",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
