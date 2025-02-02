'use client'

import { ProductImage } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
	const supabase = createClient()

	// Query for fetching products
	const { data: products = [], isLoading } = useQuery({
		queryKey: ['products'],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('products')
				.select(`*, product_images (*)`)
				.order('created_at', { ascending: false })

			if (error) throw error
			return data || []
		},
	})

	return (
		<div className='container mx-auto p-4 space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-bold'>Product Management</h1>
				<Button asChild>
					<Link href='/admin/add'>Add New Product</Link>
				</Button>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{isLoading ? (
					<div className='col-span-full flex items-center justify-center p-8'>
						<Loader2 className='h-8 w-8 animate-spin' />
					</div>
				) : (
					<>
						{products.map((product) => (
							<Card key={product.id}>
								<CardContent className='pt-6'>
									<div className='flex justify-between items-start mb-4'>
										<div>
											<h3 className='font-semibold text-lg'>{product.name}</h3>
											<p className='text-sm text-muted-foreground'>
												${product.price}
											</p>
											{product.price_id && (
												<p className='text-xs text-muted-foreground mt-1'>
													Price ID: {product.price_id}
												</p>
											)}
											<p className='text-sm text-muted-foreground mt-1'>
												Quantity: {product.quantity}
											</p>
											{product.sizes && product.sizes.length > 0 && (
												<p className='text-sm text-muted-foreground mt-1'>
													Sizes: {product.sizes.join(', ')}
												</p>
											)}
											{product.description && (
												<p className='text-sm mt-2 line-clamp-2'>
													{product.description}
												</p>
											)}
										</div>
										<Button asChild variant='secondary'>
											<Link href={`/admin/edit/${product.id}`}>Edit</Link>
										</Button>
									</div>

									<div className='flex flex-wrap gap-3 mt-4'>
										{product.product_images?.map((image: ProductImage) => (
											<div key={image.id} className='relative'>
												<Image
													src={image.image_url}
													alt={product.name}
													width={80}
													height={80}
													className={`object-cover rounded-md ${
														image.is_main
															? 'ring-2 ring-primary ring-offset-2'
															: ''
													}`}
												/>
												{image.is_main && (
													<span className='absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded'>
														Main
													</span>
												)}
											</div>
										))}
									</div>

									<div className='flex gap-2 mt-4'>
										{product.is_preorder && (
											<span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>
												Pre-order
											</span>
										)}
										{product.is_notify && (
											<span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
												Notify When Available
											</span>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</>
				)}
			</div>
		</div>
	)
}
