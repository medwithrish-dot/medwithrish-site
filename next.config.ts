import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
