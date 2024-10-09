import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/server'
import { formatPrice } from '@/lib/utils'

export default async function ShopPage() {
	const supabase = createClient()
	const { data: products, error } = await supabase.from('product').select('*')
	if (error) {
		console.error(error)
	}
	console.log(products)

	return (
		<div className='flex justify-center min-h-screen m-8'>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				{products?.map((product, index) => (
					<div key={index} className='flex flex-col'>
						<Link href={`/shop/${product.id}`}>
							<Image
								src={product.main_image}
								alt={product.name}
								width={300}
								height={200}
							/>
						</Link>
						<div className='flex flex-col items-center justify-center'>
							<p className='text-lg font-semibold'>{product.name}</p>
							<p>{formatPrice(product.price)}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
