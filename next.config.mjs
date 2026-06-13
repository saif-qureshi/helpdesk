/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "ioredis",
      "bullmq",
      "pg",
      "@prisma/adapter-pg",
      "@node-rs/argon2",
    ],
  },
};

export default nextConfig;
