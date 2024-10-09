'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/providers/cart-store-provider'
import { CartProduct } from '@/stores/cart-store'
import Stripe from 'stripe'
import { formatPrice } from '@/lib/utils'
const stripe = new Stripe(process.env.PUBLIC_STRIPE_KEY as string)

function CartPage() {
	const { products } = useCartStore((state) => state)
	const handleCheckout = async () => {
		const paymentLink = await stripe.paymentLinks.create({
			line_items: products.map((product: CartProduct) => ({
				price: product.priceId,
				quantity: product.quantity,
			})),
		})
		window.open(paymentLink.url, '_blank')
	}

	const total = products.reduce((sum, item) => sum + item.price, 0)

	return (
		<div className='grid grid-cols-1 sm:grid-cols-3 min-h-full p-8'>
			<div className='col-span-2 flex flex-wrap gap-4'>
				{products.map((product) => (
					<CartProducts
						key={product.priceId}
						imageUrl={product.image}
						name={product.name}
						price={product.price}
					/>
				))}
			</div>
			<div className='col-span-1 bg-[#E2E2E2] h-screen p-4'>
				<div className='flex flex-col gap-4'>
					<h2 className='font-bold text-xl mb-2'>Order Summary</h2>
					{products.map((item) => (
						<div key={item.priceId} className='flex justify-between'>
							<span>{item.name}</span>
							<span>{item.price}</span>
						</div>
					))}
					<hr className='my-2 border-gray-400' />
					<p className='font-bold text-lg flex text-wrap flex-wrap items-center'>
						<span>Total:</span> <span>{`$${total.toFixed(2)} `}</span>
						<span className='text-sm text-gray-500 italic'>
							(+ taxes and shipping)
						</span>
					</p>
					<Button
						onClick={handleCheckout}
						className='bg-[#B3C8DD] text-white font-bold'
					>
						CHECKOUT
					</Button>
				</div>
			</div>
		</div>
	)
}
export default CartPage

function CartProducts({
	imageUrl,
	name,
	price,
}: {
	imageUrl: string
	name: string
	price: number
}) {
	return (
		<div className='flex flex-col gap-4'>
			<Image src={imageUrl} alt={name} width={200} height={200} />
			<div className='flex flex-col'>
				<p className='font-bold text-lg'>{name}</p>
				<p className='text-sm'>{formatPrice(price)}</p>
				<p className='text-sm'>Quantity: 1</p>
			</div>
		</div>
	)
}
