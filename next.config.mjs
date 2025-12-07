/** @type {import('next').NextConfig} */
const nextConfig = {
  // No invalid experimental keys
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
