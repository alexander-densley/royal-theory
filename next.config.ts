import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		minimumCacheTTL: 2678400, // 31 days

		// Use only webp for output format (good balance of quality and size)
		formats: ['image/webp'],

		// Optimize device sizes to match your actual usage
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256],

		// Set a reasonable quality default
		// Add domain patterns if needed
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'txichddekjevqhuhnpri.supabase.co',
				port: '',
				pathname: '/storage/v1/object/public/**',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
				port: '54321',
				pathname: '/storage/v1/object/public/**',
			},
		],
	},
}

export default nextConfig
