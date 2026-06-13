/** @type {import('next').NextConfig} */
const nextConfig = {
  // Native Node libraries — don't bundle into the server-component graph
  // (they reference `dns`/`net`/`tls`). Loaded via require at runtime.
  experimental: {
    serverComponentsExternalPackages: [
      "ioredis",
      "bullmq",
      "pg",
      "@prisma/adapter-pg",
    ],
  },
};

export default nextConfig;
