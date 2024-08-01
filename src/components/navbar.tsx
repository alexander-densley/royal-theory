'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function NavBar() {
	const pathname = usePathname()
	const isShop = pathname.startsWith('/shop')
	const isContact = pathname.startsWith('/contact')

	return (
		<div className='flex flex-col w-full items-center justify-center pt-4'>
			<Link href='/'>
				<Image
					src='/rt-logo.svg'
					alt='Royal Theory Logo'
					className='dark:invert'
					width={100}
					height={24}
					priority
				/>
			</Link>

			<div className='flex w-full justify-center gap-24 sm:gap-52 mt-16'>
				<Link
					href='/shop'
					className={`text-2xl font-semibold hover:text-[#B7C8D7] ${
						isShop ? 'text-[#B7C8D7]' : ''
					}`}
				>
					SHOP
				</Link>
				<Link
					href='/contact'
					className={`text-2xl font-semibold hover:text-[#B7C8D7] ${
						isContact ? 'text-[#B7C8D7]' : ''
					}`}
				>
					CONTACT
				</Link>
			</div>
		</div>
	)
}
