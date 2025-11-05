/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn.deeppi.app',
      // Add your R2 domain here
    ],
  },
  async rewrites() {
    return [
      {
        source: '/catalog.json',
        destination: '/api/catalog',
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
