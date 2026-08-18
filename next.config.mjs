/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 90, 100],
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

export default nextConfig;
