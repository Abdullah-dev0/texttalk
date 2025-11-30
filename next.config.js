/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'gravatar.com',
      },
      {
        hostname: 'img.clerk.com',
      },
    ],
  },
};

module.exports = nextConfig;
