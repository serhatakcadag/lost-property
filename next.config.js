/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ttbuwvdugkphtctthrgt.supabase.co',
        pathname: '/storage/v1/object/public/uploads/**',
      },
    ],
  }
}

module.exports = nextConfig 