import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { cn } from '@/lib/utils'
import { CartStoreProvider } from '@/providers/cart-store-provider'
import NavBar from '@/components/navbar'
import Providers from '@/providers/react-query'
import { Toaster } from '@/components/ui/sonner'

import '@/app/globals.css'

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
})
export const metadata: Metadata = {
	title: 'Royal Theory',
	description: 'Royal Theory by Sincerely Courtier',
}

export default function AppLayout({
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
							<main className='flex-1'>{children}</main>
							<footer className='w-full text-center pb-4'>
								A ROYAL KIN LLC. &copy; {new Date().getFullYear()}
							</footer>
						</div>
					</CartStoreProvider>
				</Providers>
				<Toaster />
			</body>
		</html>
	)
}
