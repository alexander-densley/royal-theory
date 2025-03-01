'use client'

import Image from 'next/image'
import { useCartStore } from '@/providers/cart-store-provider'
import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProductById } from '@/queryFn/products'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import type { Product, ProductVariant } from '@/types/database'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import React from 'react'

// Add useMediaQuery hook
const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(false)

	React.useEffect(() => {
		const media = window.matchMedia(query)
		if (media.matches !== matches) {
			setMatches(media.matches)
		}
		const listener = () => setMatches(media.matches)
		media.addEventListener('change', listener)
		return () => media.removeEventListener('change', listener)
	}, [matches, query])

	return matches
}

export default function ProductPage() {
	const params = useParams<{ id: string }>()
	const containerRef = useRef<HTMLDivElement>(null)
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
		null
	)
	const [selectedSize, setSelectedSize] = useState<string>('')
	const [selectedColor, setSelectedColor] = useState<string>('')
	const [quantity, setQuantity] = useState(1)
	const [notifyEmail, setNotifyEmail] = useState('')
	const [isNotifying, setIsNotifying] = useState(false)
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const [isHovering, setIsHovering] = useState(false)
	const [thumbnailsLoaded, setThumbnailsLoaded] = useState(false)

	// Add check for mobile devices
	const isDesktop = useMediaQuery('(min-width: 1024px)')

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
					We couldn&apos;t load the product information
				</p>
				<Button onClick={() => window.location.reload()} variant='outline'>
					Try Again
				</Button>
			</div>
		)

	const product = data.data as Product

	// Get unique sizes and colors
	const sizes = Array.from(
		new Set(
			product.variants
				?.map((v) => v.size)
				.filter((size): size is string => Boolean(size)) || []
		)
	)
	const colors = Array.from(
		new Set(
			product.variants
				?.map((v) => v.color)
				.filter((color): color is string => Boolean(color)) || []
		)
	)

	// Update selected variant when size or color changes
	const handleSizeChange = (size: string) => {
		setSelectedSize(size)
		const variant = product.variants?.find(
			(v) => v.size === size && (!selectedColor || v.color === selectedColor)
		)
		setSelectedVariant(variant || null)
		setQuantity(1)
	}

	const handleColorChange = (color: string) => {
		setSelectedColor(color)
		const variant = product.variants?.find(
			(v) => v.color === color && (!selectedSize || v.size === selectedSize)
		)
		setSelectedVariant(variant || null)
		setQuantity(1)
	}

	const handleCheckout = async () => {
		if (!selectedVariant?.price_id) {
			toast.error('Please select a variant')
			return
		}

		const mainImage = product.product_images.find((img) => img.is_main)
		const cartProduct = {
			id: selectedVariant.id,
			productId: product.id,
			name: product.name,
			price: selectedVariant.price,
			priceId: selectedVariant.price_id,
			image: mainImage?.image_url || '',
			quantity: quantity,
			size: selectedVariant.size,
			color: selectedVariant.color,
			stock: selectedVariant.quantity,
		}
		addToCart(cartProduct)
		toast.success('Product added to your cart')
	}

	const handleNotifyMe = async () => {
		if (!notifyEmail) {
			toast.error('Please enter your email address')
			return
		}

		if (!selectedVariant) {
			toast.error('Please select a variant')
			return
		}

		setIsNotifying(true)
		try {
			await fetch('/api/notify-stock', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					variantId: selectedVariant.id,
					email: notifyEmail,
				}),
			})
			toast.success('You will be notified when this variant is back in stock')
			setNotifyEmail('')
		} catch (error) {
			console.error(error)
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

	// Add this function to check if all required variants are selected
	const areAllVariantsSelected = () => {
		if (sizes.length > 0 && !selectedSize) return false
		if (colors.length > 0 && !selectedColor) return false
		return true
	}

	const generateBlurPlaceholder = (color = 'f3f4f6') => {
		return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23${color}'/%3E%3C/svg%3E`
	}

	return (
		<div>
			{/* Main content */}
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10 pb-[120px] lg:pb-0'>
					{/* Image gallery section */}
					<div className='flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-x-8'>
						{/* Main image */}
						<div className='lg:col-span-10 order-1 lg:order-2'>
							<div
								ref={containerRef}
								className='aspect-square relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group'
								onMouseEnter={() => isDesktop && setIsHovering(true)}
								onMouseLeave={() => {
									if (isDesktop) {
										setIsHovering(false)
										setMousePosition({ x: 0, y: 0 })
									}
								}}
								onMouseMove={(e) => {
									if (!isDesktop || !containerRef.current) return

									requestAnimationFrame(() => {
										const rect = containerRef.current?.getBoundingClientRect()
										if (!rect) return

										const x = ((e.clientX - rect.left) / rect.width) * 100
										const y = ((e.clientY - rect.top) / rect.height) * 100
										setMousePosition({ x, y })
									})
								}}
							>
								{/* Preview box - only show on desktop */}
								{isHovering && isDesktop && (
									<div className='absolute top-4 right-4 w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg z-20'>
										<div className='relative w-full h-full'>
											<Image
												src={selectedImage || mainImage}
												alt={`${product.name} preview`}
												fill
												className='object-contain'
												sizes='128px'
											/>
											<div
												className='absolute border-2 border-blue-500 bg-blue-500/10'
												style={{
													width: '40%',
													height: '40%',
													left: `${mousePosition.x - 20}%`,
													top: `${mousePosition.y - 20}%`,
													transform: 'translate(0%, 0%)',
												}}
											/>
										</div>
									</div>
								)}
								<Image
									src={selectedImage || mainImage}
									alt={product.name}
									fill
									placeholder='blur'
									blurDataURL={generateBlurPlaceholder()}
									onLoadingComplete={() => {
										// Load thumbnails after main image loads
										setThumbnailsLoaded(true)
									}}
									className='object-contain object-center transition-all duration-200 ease-out will-change-transform'
									style={{
										transform:
											isHovering && isDesktop
												? `scale(2.5) translate(${50 - mousePosition.x}%, ${
														50 - mousePosition.y
												  }%)`
												: 'scale(1) translate(0%, 0%)',
										transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
									}}
									priority
									sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
									quality={80}
								/>
							</div>
						</div>

						{/* Thumbnail column */}
						<div className='lg:col-span-2 order-2 lg:order-1'>
							<div className='flex gap-4 pb-2 lg:pb-0 lg:flex-col lg:h-[440px] overflow-x-auto lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 snap-x lg:snap-none p-1'>
								{thumbnailsLoaded &&
									sortedImages.map((image, index) => (
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											key={image.id}
											onClick={() => setSelectedImage(image.image_url)}
											className={cn(
												'cursor-pointer transition-all duration-200',
												'rounded-md overflow-hidden shadow-sm hover:shadow-md',
												'flex-shrink-0 relative w-20 h-20 lg:w-full lg:h-[80px]',
												'snap-start',
												(selectedImage || mainImage) === image.image_url
													? 'ring-2 ring-blue-500 ring-offset-2'
													: 'opacity-70 hover:opacity-100',
												index >= 5 ? 'lg:mt-0' : ''
											)}
										>
											<Image
												className='absolute inset-0 w-full h-full object-contain'
												src={image.image_url}
												alt={`${product.name} view`}
												width={112}
												height={112}
												quality={75}
												loading='lazy'
											/>
										</motion.div>
									))}
							</div>
							{sortedImages.length > 5 && (
								<div className='hidden lg:flex justify-center mt-2'>
									<span className='text-sm text-gray-500'>
										Scroll for more images
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Product info */}
					<div className='lg:sticky lg:top-24 lg:self-start'>
						<div className='flex flex-col gap-6 pb-[180px] lg:pb-0'>
							{/* Product header */}
							<div className='border-b border-gray-200 pb-6'>
								<h1 className='text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900'>
									{product.name}
								</h1>
								<div className='mt-4 flex items-center justify-between'>
									<p className='text-3xl font-bold text-blue-600'>
										{selectedVariant
											? formatPrice(selectedVariant.price)
											: product.variants?.length
											? (() => {
													// Get all valid variant prices based on selected size/color
													//TODO: when a size is selected, it sets the price, unless both are selected it shouldn't update the price really
													const validVariants = product.variants.filter(
														(v) =>
															(!selectedSize || v.size === selectedSize) &&
															(!selectedColor || v.color === selectedColor)
													)

													const prices = [
														...new Set(validVariants.map((v) => v.price)),
													]

													return prices.length > 0
														? prices.length > 1
															? `From ${formatPrice(Math.min(...prices))}`
															: formatPrice(prices[0])
														: 'Price not available'
											  })()
											: 'Price not available'}
									</p>
								</div>
							</div>

							{/* Product description */}
							<div className='prose prose-gray max-w-none'>
								<p className='text-base sm:text-lg text-gray-600'>
									{product.description}
								</p>
							</div>

							{/* Variant selection */}
							<div className='space-y-4'>
								{sizes.length > 0 && (
									<div className='space-y-2'>
										<label className='text-sm font-medium text-gray-900'>
											Size
										</label>
										<div className='flex flex-wrap gap-2'>
											{sizes.map((size) => (
												<Button
													key={size}
													variant={
														selectedSize === size ? 'default' : 'outline'
													}
													size='sm'
													onClick={() => handleSizeChange(size)}
													className='min-w-[3rem]'
												>
													{size}
												</Button>
											))}
										</div>
									</div>
								)}

								{colors.length > 0 && (
									<div className='space-y-2'>
										<label className='text-sm font-medium text-gray-900'>
											Color
										</label>
										<div className='flex flex-wrap gap-2'>
											{colors.map((color) => (
												<Button
													key={color}
													variant={
														selectedColor === color ? 'default' : 'outline'
													}
													size='sm'
													onClick={() => handleColorChange(color)}
													className='min-w-[4rem]'
												>
													{color}
												</Button>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Add to cart section */}
							<div className='fixed lg:relative bottom-0 left-0 right-0 p-4 lg:p-0 border-t border-gray-200 lg:border-0 z-10 bg-white lg:bg-transparent'>
								<div className='max-w-7xl mx-auto'>
									{selectedVariant && areAllVariantsSelected() ? (
										<>
											{selectedVariant.quantity > 0 && !product.is_notify ? (
												<div className='flex flex-col gap-4'>
													<div className='flex items-center justify-between gap-4'>
														<div className='flex items-center rounded-lg border border-gray-200'>
															<button
																onClick={() =>
																	setQuantity(Math.max(1, quantity - 1))
																}
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
															<span className='px-6 py-2 text-center min-w-[3rem] font-medium'>
																{quantity}
															</span>
															<button
																onClick={() => setQuantity(quantity + 1)}
																className='p-3 hover:bg-gray-50 transition-colors rounded-r-lg disabled:opacity-50'
																disabled={quantity >= selectedVariant.quantity}
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
														<Button
															onClick={handleCheckout}
															className='flex-1 py-6 text-lg font-medium transition-transform duration-200 hover:scale-[1.02]'
															disabled={
																!selectedVariant ||
																quantity > selectedVariant.quantity ||
																!selectedVariant.price_id
															}
														>
															{product.is_preorder
																? 'Pre-order Now'
																: 'Add to Cart'}
														</Button>
													</div>
													<p className='text-sm text-gray-500 text-center lg:text-left'>
														{selectedVariant.quantity} items available
													</p>
												</div>
											) : (
												<div className='rounded-lg bg-blue-50 p-6'>
													<div className='flex flex-col gap-4'>
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
													</div>
												</div>
											)}
										</>
									) : (
										<div className='rounded-lg bg-gray-50 p-6'>
											<div className='flex flex-col gap-4'>
												<p className='text-gray-600 font-medium flex items-center gap-2'>
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
															d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
														/>
													</svg>
													Please select{' '}
													{!selectedSize && sizes.length > 0 ? 'a size' : ''}
													{!selectedSize &&
													sizes.length > 0 &&
													!selectedColor &&
													colors.length > 0
														? ' and '
														: ''}
													{!selectedColor && colors.length > 0 ? 'a color' : ''}
												</p>
											</div>
										</div>
									)}

									{product.is_preorder && !product.is_notify && (
										<div className='mt-6 bg-blue-50 p-4 rounded-lg'>
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
												This is a pre-order item. It will be shipped as soon as
												it becomes available.
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
