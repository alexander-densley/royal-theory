import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Suspense } from 'react'
import type { Product } from '@/types/database'

// Loading skeleton component
function ProductSkeleton() {
	return (
		<div className='animate-pulse'>
			<div className='relative w-full aspect-[3/2] bg-gray-200 rounded-lg mb-4'></div>
			<div className='space-y-3'>
				<div className='h-4 bg-gray-200 rounded w-3/4'></div>
				<div className='h-4 bg-gray-200 rounded w-1/4'></div>
			</div>
		</div>
	)
}

// Product card component
function ProductCard({ product }: { product: Product }) {
	return (
		<Link href={`/shop/${product.id}`} className='group h-full'>
			<div className='flex flex-col h-full p-4 space-y-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:bg-gray-50 border border-transparent hover:border-gray-200'>
				<div className='relative w-full aspect-[3/2] overflow-hidden rounded-lg bg-gray-100'>
					{product.product_images?.[0]?.image_url ? (
						<>
							<Image
								src={product.product_images[0].image_url}
								alt={product.name}
								fill
								className='object-cover transition-transform duration-300 group-hover:scale-105'
								sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
								priority={false}
							/>
							{product.description && (
								<div className='absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4'>
									<p className='text-white text-sm line-clamp-6 text-center'>
										{product.description}
									</p>
								</div>
							)}
						</>
					) : (
						<div className='w-full h-full bg-gray-200 rounded-lg flex items-center justify-center'>
							<span className='text-gray-400'>No Image</span>
						</div>
					)}
				</div>
				<div className='flex flex-col flex-grow space-y-2'>
					<h2 className='text-lg font-medium line-clamp-2 group-hover:text-blue-600 transition-colors'>
						{product.name}
					</h2>
					<p className='text-xl font-semibold text-gray-900'>
						{formatPrice(product.price)}
					</p>
					<div className='flex flex-wrap gap-2 mt-auto pt-2'>
						{product.quantity === 0 && (
							<span className='px-2 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-full'>
								Out of Stock
							</span>
						)}
						{product.is_preorder && (
							<span className='px-2 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full'>
								Pre-order
							</span>
						)}
						{product.quantity > 0 && !product.is_preorder && (
							<span className='px-2 py-1 text-sm font-medium text-green-600 bg-green-50 rounded-full'>
								In Stock
							</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	)
}

async function ProductGrid() {
	const supabase = await createClient()

	const { data: products, error } = await supabase
		.from('products')
		.select(
			`
			*,
			product_images!inner (
				image_url,
				is_main,
				sort_order
			)
		`
		)
		.eq('product_images.is_main', true)
		.order('created_at', { ascending: false })

	if (error) {
		console.error('Error fetching products:', error)
		return (
			<div className='flex flex-col items-center justify-center p-8 space-y-4 text-center'>
				<div className='rounded-full bg-red-100 p-3'>
					<svg
						className='w-6 h-6 text-red-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
						/>
					</svg>
				</div>
				<h2 className='text-xl font-semibold text-gray-900'>
					Unable to load products
				</h2>
				<p className='text-gray-600 max-w-md'>
					We&apos;re having trouble loading the products. Please try refreshing
					the page or come back later.
				</p>
			</div>
		)
	}

	if (!products?.length) {
		return (
			<div className='flex flex-col items-center justify-center p-8 space-y-4 text-center'>
				<div className='rounded-full bg-blue-100 p-3'>
					<svg
						className='w-6 h-6 text-blue-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
						/>
					</svg>
				</div>
				<h2 className='text-xl font-semibold text-gray-900'>
					No products available
				</h2>
				<p className='text-gray-600 max-w-md'>
					Check back soon for new products! We&apos;re working on adding more
					items to our collection.
				</p>
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	)
}

export default function ShopPage() {
	return (
		<main className='container mx-auto px-4 sm:px-6 py-8'>
			<div className='max-w-2xl mx-auto text-center mb-12'>
				<h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
					Our Products
				</h1>
			</div>
			<Suspense
				fallback={
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{Array.from({ length: 8 }).map((_, i) => (
							<ProductSkeleton key={i} />
						))}
					</div>
				}
			>
				<ProductGrid />
			</Suspense>
		</main>
	)
}
