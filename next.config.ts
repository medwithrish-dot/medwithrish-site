import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    const phloemHosts = ["phloemai.com", "www.phloemai.com"];

    return phloemHosts.flatMap((host) => [
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
    ]);
  },
};

export default nextConfig;
