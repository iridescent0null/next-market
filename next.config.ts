import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // to display RSS feed. someday another domain might be required
      {
        protocol: "https",
        hostname: "umamusume-umapyoi.com",
      },
      {
        protocol: "https",
        hostname: "uma-log.net",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "livedoor.blogimg.jp",
      },
      {
        protocol: "https",
        hostname: "agemasen.com",
      },
    ],
  },
};

export default nextConfig;
