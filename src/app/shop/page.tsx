import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { formatPrice } from '@/lib/utils'

export default async function ShopPage() {
	const supabase = await createClient()

	// Query products with their main images
	const { data: products, error } = await supabase
		.from('products')
		.select(
			`
			*,
			product_images!inner (
				image_url
			)
		`
		)
		.eq('product_images.is_main', true)

	if (error) {
		console.error('Error fetching products:', error)
		// You might want to handle this error more gracefully
		return <div>Failed to load products</div>
	}

	return (
		<div className='flex justify-center min-h-screen m-8'>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				{products?.map((product) => (
					<div
						key={product.id}
						className='flex flex-col items-center space-y-4'
					>
						<Link href={`/shop/${product.id}`}>
							<div className='relative w-[300px] h-[200px]'>
								{product.product_images?.[0]?.image_url ? (
									<Image
										src={product.product_images[0].image_url}
										alt={product.name}
										fill
										className='object-cover rounded-lg'
										sizes='(max-width: 300px) 100vw, 300px'
									/>
								) : (
									<div className='w-full h-full bg-gray-200 rounded-lg flex items-center justify-center'>
										No Image
									</div>
								)}
							</div>
						</Link>
						<div className='flex flex-col items-center justify-center'>
							<p className='text-lg font-semibold text-center'>
								{product.name}
							</p>
							<p>{formatPrice(product.price)}</p>
							{product.quantity === 0 && (
								<p className='text-red-500'>Out of Stock</p>
							)}
							{product.is_preorder && (
								<p className='text-blue-500'>Pre-order</p>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
