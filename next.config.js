/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' olib tashlangan — dynamic [slug] route uchun
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'shops-platform.uz' },
      { protocol: 'https', hostname: 'api.shops-platform.uz' },
      { protocol: 'http',  hostname: '13.53.218.203' },
      { protocol: 'https', hostname: '**' }, // barcha https rasmlar
    ],
  },
  // Server deploy uchun standalone build
  output: 'standalone',
};

module.exports = nextConfig;
