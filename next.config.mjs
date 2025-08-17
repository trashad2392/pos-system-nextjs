/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this experimental section
  experimental: {
    // This tells the Next.js dev server to trust requests from our Gitpod URLs
    allowedDevOrigins: ["*.gitpod.io"],
  },
};

export default nextConfig;