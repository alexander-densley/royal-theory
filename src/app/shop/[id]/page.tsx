'use client'

import Image from 'next/image'
import { useCartStore } from '@/providers/cart-store-provider'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProductById } from '@/queryFn/products'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

export default function ProductPage({ params }: { params: { id: string } }) {
	const [selectedImage, setSelectedImage] = useState<string | null>(null)

	const { addToCart } = useCartStore((state) => state)
	const { data, isPending, isError, isFetching } = useQuery({
		queryKey: ['product', params.id],
		queryFn: () => getProductById(params.id),
	})

	if (isPending || isFetching)
		return (
			<div className='flex justify-center items-center mt-28'>
				Product is loading...
			</div>
		)
	if (isError)
		return (
			<div className='flex justify-center items-center mt-28'>
				Sorry, there was an error loading the product, please refresh the page
			</div>
		)
	const product = data.data

	const handleCheckout = async () => {
		const product = {
			name: data.data.name,
			price: data.data.price,
			priceId: data.data.price_id,
			image: data.data.main_image,
			quantity: 1,
		}
		addToCart(product)
		toast.success('Product added to your cart')
	}

	const images = [data.data.main_image, ...(data.data.images || [])]

	return (
		<div className='grid grid-cols-1 md:grid-cols-3 pt-10 gap-6 w-full p-10'>
			<div className='flex items-center md:items-start justify-center min-w-[300px]'>
				<Image
					src={selectedImage ? selectedImage : data.data.main_image}
					alt={'lol'}
					width={400}
					height={400}
				/>
			</div>
			<div className='flex md:flex-col md:-order-1 gap-6 md:h-[500px] overflow-x-auto md:overflow-y-auto md:ml-auto'>
				{images.map((product: any, index: any) => (
					<div key={product} onClick={() => setSelectedImage(product)}>
						<Image
							className='size-24'
							src={product}
							alt={product}
							width={100}
							height={100}
						/>
					</div>
				))}
			</div>
			<div className='flex flex-col align-top gap-6'>
				<h1 className='text-2xl font-light'>{product.name}</h1>
				<p className='text-3xl font-semibold'>{formatPrice(product.price)}</p>
				<p className='text-xl font-semibold'>{product.description}</p>
				<Button onClick={handleCheckout} className='w-52'>
					Add to cart
				</Button>
			</div>
		</div>
	)
}
