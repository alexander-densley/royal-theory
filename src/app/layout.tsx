import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { cn } from '@/lib/utils'
import { CartStoreProvider } from '@/providers/cart-store-provider'
import NavBar from '@/components/navbar'
import Providers from '@/providers/react-query'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
})
export const metadata: Metadata = {
	title: 'Royal Theory',
	description: 'Royal Theory by Sincerely Courtier',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<body
				className={cn(
					'min-h-screen bg-[#F2F4F4] font-sans antialiased',
					fontSans.variable
				)}
			>
				<Providers>
					<CartStoreProvider>
						<div className='flex flex-col min-h-screen'>
							<NavBar />
							{children}
							<p className='w-full text-center pb-4 mt-auto'>
								A ROYAL KIN LLC. &copy; 2024
							</p>
						</div>
					</CartStoreProvider>
				</Providers>
				<Toaster />
			</body>
		</html>
	)
}
