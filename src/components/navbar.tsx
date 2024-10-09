'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/providers/cart-store-provider'
export default function NavBar() {
	const pathname = usePathname()
	const isShop = pathname.startsWith('/shop')
	const isContact = pathname.startsWith('/contact')
	const isShopIdPage = pathname.startsWith('/shop/')
	const { products } = useCartStore((state) => state)
	const total = products.reduce((acc, product) => acc + product.quantity, 0)

	return (
		<div className='flex flex-col w-full items-center justify-center pt-4'>
			<Link href='/cart'>
				<Button
					variant='ghost'
					size='icon'
					className='absolute top-12 right-12 p-2 hover:bg-gray-100 rounded-full'
				>
					<ShoppingCart size={24} />
					{total > 0 && (
						<span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full'>
							{total}
						</span>
					)}
				</Button>
			</Link>
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

			{(isShop || isContact) && !isShopIdPage ? (
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
			) : (
				<div className='flex w-full justify-center gap-24 sm:gap-52 mt-16'>
					<Link
						href='/shop'
						className='text-2xl font-semibold hover:text-[#B7C8D7]'
					>
						<div className='flex items-center gap-2'>
							<ArrowLeft size={24} /> BACK TO SHOP
						</div>
					</Link>
				</div>
			)}
		</div>
	)
}
