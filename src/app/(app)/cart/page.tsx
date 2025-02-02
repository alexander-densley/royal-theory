'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/providers/cart-store-provider'
import { CartProduct } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

function CartPage() {
	const { products, removeFromCart } = useCartStore((state) => state)
	const [isCheckingOut, setIsCheckingOut] = useState(false)

	const handleCheckout = async () => {
		setIsCheckingOut(true)
		const toastId = toast.loading('Preparing your checkout...')
		try {
			const response = await fetch('/api/get-payment-link', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					line_items: products.map((product: CartProduct) => ({
						price: product.priceId,
						quantity: product.quantity,
					})),
				}),
			})

			if (!response.ok) {
				throw new Error('Checkout failed')
			}

			const paymentLink = await response.json()
			toast.dismiss(toastId)
			window.location.href = paymentLink.url
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message)
			} else {
				toast.error('Something went wrong. Please try again.')
			}
		} finally {
			setIsCheckingOut(false)
			toast.dismiss(toastId)
		}
	}

	const subtotal = products.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	)

	const estimatedTax = subtotal * 0.1 // 10% tax estimation
	const estimatedShipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
	const total = subtotal + estimatedTax + estimatedShipping

	if (products.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
				<ShoppingBag size={64} className='text-gray-400' />
				<h2 className='text-2xl font-bold text-gray-600'>Your cart is empty</h2>
				<p className='text-gray-500 mb-4'>Add some items to get started!</p>
				<Link href='/shop'>
					<Button className='bg-[#B3C8DD] text-white font-bold'>
						Continue Shopping
					</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-2xl font-bold mb-8'>
				Shopping Cart ({products.length} items)
			</h1>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2 space-y-6'>
					{products.map((product) => (
						<CartProducts
							key={product.priceId}
							imageUrl={product.image}
							name={product.name}
							price={product.price}
							quantity={product.quantity}
							priceId={product.priceId}
							stock={product.stock}
							onRemove={() => {
								removeFromCart(product as unknown as CartProduct)
								toast.success(`${product.name} removed from cart`)
							}}
						/>
					))}
				</div>
				<div className='lg:col-span-1'>
					<div className='bg-white rounded-lg shadow-md p-6 sticky top-4'>
						<h2 className='font-bold text-xl mb-4'>Order Summary</h2>
						<div className='space-y-3'>
							<div className='flex justify-between'>
								<span>Subtotal</span>
								<span>{formatPrice(subtotal)}</span>
							</div>
							<div className='flex justify-between text-gray-600'>
								<span>Estimated Tax</span>
								<span>{formatPrice(estimatedTax)}</span>
							</div>
							<div className='flex justify-between text-gray-600'>
								<span>Estimated Shipping</span>
								<span>
									{estimatedShipping === 0
										? 'FREE'
										: formatPrice(estimatedShipping)}
								</span>
							</div>
							<div className='border-t pt-3 mt-3'>
								<div className='flex justify-between font-bold text-lg'>
									<span>Total</span>
									<span>{formatPrice(total)}</span>
								</div>
							</div>
							{subtotal < 100 && (
								<p className='text-sm text-green-600 mt-2'>
									Add {formatPrice(100 - subtotal)} more for free shipping!
								</p>
							)}
							<Button
								onClick={handleCheckout}
								className='w-full bg-[#B3C8DD] text-white font-bold mt-4'
								disabled={isCheckingOut}
							>
								{isCheckingOut ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Processing...
									</>
								) : (
									'CHECKOUT'
								)}
							</Button>
						</div>
					</div>
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
	quantity,
	priceId,
	stock = 0,
	onRemove,
}: {
	imageUrl: string
	name: string
	price: number
	quantity: number
	priceId: string
	stock?: number
	onRemove: () => void
}) {
	const { increaseQuantity, decreaseQuantity } = useCartStore((state) => state)

	const handleIncrease = () => {
		if (quantity >= stock) {
			toast.error(`Sorry, only ${stock} items available in stock`)
			return
		}
		increaseQuantity(priceId)
	}

	return (
		<div className='flex gap-6 p-4 bg-white rounded-lg shadow-sm'>
			<div className='relative w-[120px] h-[120px]'>
				<Image
					src={imageUrl}
					alt={name}
					fill
					className='object-cover rounded-md'
					sizes='120px'
				/>
			</div>
			<div className='flex-1 flex flex-col'>
				<div className='flex justify-between items-start'>
					<div>
						<h3 className='font-bold text-lg'>{name}</h3>
						<p className='text-lg font-semibold text-gray-700'>
							{formatPrice(price)}
						</p>
					</div>
					<Button
						variant='ghost'
						size='icon'
						onClick={onRemove}
						className='text-gray-500 hover:text-red-500'
					>
						<Trash2 size={18} />
					</Button>
				</div>
				<div className='mt-auto'>
					<div className='flex items-center gap-1 text-sm text-gray-600 mb-2'>
						<span>{stock} items available</span>
					</div>
					<div className='flex items-center gap-3'>
						<div className='flex items-center border rounded-md'>
							<Button
								variant='ghost'
								size='icon'
								className='h-8 w-8 rounded-none'
								onClick={() => decreaseQuantity(priceId)}
							>
								-
							</Button>
							<span className='w-12 text-center'>{quantity}</span>
							<Button
								variant='ghost'
								size='icon'
								className='h-8 w-8 rounded-none'
								onClick={handleIncrease}
								disabled={quantity >= stock}
							>
								+
							</Button>
						</div>
						<p className='text-sm font-medium'>
							Total: {formatPrice(price * quantity)}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
