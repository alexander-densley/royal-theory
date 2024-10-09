/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'txichddekjevqhuhnpri.supabase.co',
				port: '',
				pathname: '/**',
			},
		],
	},
}

module.exports = nextConfig
