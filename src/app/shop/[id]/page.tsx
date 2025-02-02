'use client'

import Image from 'next/image'
import { useCartStore } from '@/providers/cart-store-provider'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProductById } from '@/queryFn/products'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import type { Product } from '@/types/database'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function ProductPage() {
	const params = useParams<{ id: string }>()
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [quantity, setQuantity] = useState(1)
	const [notifyEmail, setNotifyEmail] = useState('')
	const [isNotifying, setIsNotifying] = useState(false)

	const { addToCart } = useCartStore((state) => state)
	const { data, isPending, isError, isFetching } = useQuery({
		queryKey: ['product', params.id],
		queryFn: () => getProductById(params.id),
	})

	if (isPending || isFetching)
		return (
			<div className='grid grid-cols-1 md:grid-cols-3 pt-10 gap-6 w-full p-10'>
				<div className='flex items-center md:items-start justify-center min-w-[300px]'>
					<Skeleton className='w-[400px] h-[400px] rounded-lg' />
				</div>
				<div className='flex md:flex-col md:-order-1 gap-6 md:h-[500px] md:w-24'>
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className='min-w-24 size-24 rounded-md' />
					))}
				</div>
				<div className='flex flex-col gap-6'>
					<Skeleton className='h-8 w-2/3' />
					<Skeleton className='h-10 w-1/3' />
					<Skeleton className='h-24 w-full' />
					<Skeleton className='h-12 w-52' />
				</div>
			</div>
		)

	if (isError)
		return (
			<div className='flex flex-col justify-center items-center mt-28 gap-4'>
				<h2 className='text-2xl font-semibold text-red-500'>
					Oops! Something went wrong
				</h2>
				<p className='text-gray-600'>
					We couldn't load the product information
				</p>
				<Button onClick={() => window.location.reload()} variant='outline'>
					Try Again
				</Button>
			</div>
		)

	const product = data.data as Product

	const handleCheckout = async () => {
		if (!product.price_id) {
			toast.error('This product is not available for purchase yet')
			return
		}

		const mainImage = product.product_images.find((img) => img.is_main)
		const cartProduct = {
			id: product.id,
			name: product.name,
			price: product.price,
			priceId: product.price_id,
			image: mainImage?.image_url || '',
			quantity: quantity,
		}
		addToCart(cartProduct)
		toast.success('Product added to your cart')
	}

	const handleNotifyMe = async () => {
		if (!notifyEmail) {
			toast.error('Please enter your email address')
			return
		}

		setIsNotifying(true)
		try {
			// You'll need to implement this API endpoint
			await fetch('/api/notify-stock', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productId: product.id,
					email: notifyEmail,
				}),
			})
			toast.success('You will be notified when this product is back in stock')
			setNotifyEmail('')
		} catch (error) {
			toast.error('Failed to set up notification')
		} finally {
			setIsNotifying(false)
		}
	}

	// Sort images by sort_order
	const sortedImages = [...product.product_images].sort(
		(a, b) => a.sort_order - b.sort_order
	)

	const mainImage =
		product.product_images.find((img) => img.is_main)?.image_url || ''

	return (
		<div className='grid grid-cols-1 md:grid-cols-3 pt-10 gap-10 w-full p-10 max-w-7xl mx-auto'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='flex items-center md:items-start justify-center min-w-[300px]'
			>
				<Image
					src={selectedImage || mainImage}
					alt={product.name}
					width={500}
					height={500}
					className='rounded-lg object-cover shadow-lg transition-transform duration-300 hover:scale-105'
					priority
				/>
			</motion.div>
			<div className='flex md:flex-col md:-order-1 gap-6 md:h-[400px] md:w-28 overflow-x-scroll overflow-y-auto md:ml-auto scrollbar-hide p-1'>
				<div className='flex md:flex-col gap-6'>
					{sortedImages.slice(0, 4).map((image) => (
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							key={image.id}
							onClick={() => setSelectedImage(image.image_url)}
							className={cn(
								'cursor-pointer transition-all duration-200 hover:scale-105',
								'rounded-md overflow-hidden shadow-md hover:shadow-lg',
								'flex-shrink-0',
								(selectedImage || mainImage) === image.image_url
									? 'ring-2 ring-blue-500 ring-offset-2'
									: 'opacity-70 hover:opacity-100'
							)}
						>
							<Image
								className='min-w-28 size-28 rounded-md object-cover'
								src={image.image_url}
								alt={`${product.name} view`}
								width={112}
								height={112}
							/>
						</motion.div>
					))}
				</div>
				{sortedImages.length > 4 && (
					<div className='flex md:flex-col gap-6'>
						{sortedImages.slice(4).map((image) => (
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								key={image.id}
								onClick={() => setSelectedImage(image.image_url)}
								className={cn(
									'cursor-pointer transition-all duration-200 hover:scale-105',
									'rounded-md overflow-hidden shadow-md hover:shadow-lg',
									'flex-shrink-0',
									(selectedImage || mainImage) === image.image_url
										? 'ring-2 ring-blue-500 ring-offset-2'
										: 'opacity-70 hover:opacity-100'
								)}
							>
								<Image
									className='min-w-28 size-28 rounded-md object-cover'
									src={image.image_url}
									alt={`${product.name} view`}
									width={112}
									height={112}
								/>
							</motion.div>
						))}
					</div>
				)}
			</div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='flex flex-col align-top gap-8'
			>
				<div className='space-y-4'>
					<div className='flex justify-between items-start'>
						<h1 className='text-3xl font-medium tracking-tight text-gray-900'>
							{product.name}
						</h1>
						<div className='flex flex-col items-end'>
							<p className='text-4xl font-bold text-blue-600'>
								{formatPrice(product.price)}
							</p>
							<p className='text-sm text-gray-500'>
								{product.quantity > 0
									? `${product.quantity} in stock`
									: 'Out of stock'}
							</p>
						</div>
					</div>
					{product.created_at && (
						<p className='text-sm text-gray-500'>
							Added {new Date(product.created_at).toLocaleDateString()}
						</p>
					)}
				</div>

				<div className='prose prose-gray max-w-none'>
					<p className='text-lg text-gray-600'>{product.description}</p>
				</div>

				{product.sizes && product.sizes.length > 0 && (
					<div className='space-y-4'>
						<h3 className='font-medium text-gray-900'>Available Sizes</h3>
						<div className='flex flex-wrap gap-3'>
							{product.sizes.map((size) => (
								<span
									key={size}
									className='px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors'
								>
									{size}
								</span>
							))}
						</div>
					</div>
				)}

				<div className='space-y-6'>
					{product.quantity > 0 && !product.is_notify && (
						<div className='flex items-center space-x-4'>
							<div className='flex items-center rounded-lg border border-gray-200'>
								<button
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									className='p-3 hover:bg-gray-50 transition-colors rounded-l-lg disabled:opacity-50'
									disabled={quantity <= 1}
								>
									<svg
										className='w-4 h-4'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M20 12H4'
										/>
									</svg>
								</button>
								<span className='px-6 py-2 text-center min-w-[3rem]'>
									{quantity}
								</span>
								<button
									onClick={() => setQuantity(quantity + 1)}
									className='p-3 hover:bg-gray-50 transition-colors rounded-r-lg disabled:opacity-50'
									disabled={quantity >= product.quantity}
								>
									<svg
										className='w-4 h-4'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 4v16m8-8H4'
										/>
									</svg>
								</button>
							</div>
							<p className='text-sm text-gray-500'>
								{product.quantity} items available
							</p>
						</div>
					)}

					{product.is_notify ? (
						<div className='flex flex-col gap-3 bg-blue-50 p-4 rounded-lg'>
							<p className='text-blue-600 font-medium flex items-center gap-2'>
								<svg
									className='w-5 h-5'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
									/>
								</svg>
								Get notified when available
							</p>
							<div className='flex gap-2'>
								<input
									type='email'
									placeholder='Enter your email'
									value={notifyEmail}
									onChange={(e) => setNotifyEmail(e.target.value)}
									className='flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
								/>
								<Button
									onClick={handleNotifyMe}
									variant='outline'
									disabled={isNotifying}
								>
									{isNotifying ? 'Setting up...' : 'Notify Me'}
								</Button>
							</div>
							<p className='text-sm text-blue-600'>
								We'll notify you when this product becomes available for
								purchase
							</p>
						</div>
					) : product.quantity === 0 ? (
						<p className='text-red-500 font-medium flex items-center gap-2'>
							<svg
								className='w-5 h-5'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
							Out of Stock
						</p>
					) : (
						<Button
							onClick={handleCheckout}
							className='w-full md:w-full text-lg py-6 transition-transform duration-200 hover:scale-[1.02]'
							disabled={quantity > product.quantity || !product.price_id}
						>
							{product.is_preorder ? 'Pre-order Now' : 'Add to Cart'}
						</Button>
					)}

					{product.is_preorder && !product.is_notify && (
						<div className='bg-blue-50 p-4 rounded-lg'>
							<p className='text-blue-600 font-medium flex items-center gap-2'>
								<svg
									className='w-5 h-5'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
									/>
								</svg>
								Pre-order available
							</p>
							<p className='text-sm text-blue-600 mt-1'>
								This is a pre-order item. It will be shipped as soon as it
								becomes available.
							</p>
						</div>
					)}
				</div>
			</motion.div>
		</div>
	)
}
