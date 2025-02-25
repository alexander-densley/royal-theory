import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { CartProduct } from '@/stores/cart-store'
export async function POST(req: NextRequest) {
	const { line_items, metadata } = await req.json()
	console.log(line_items)
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

	const paymentLink = await stripe.paymentLinks.create({
		line_items,
		metadata: {
			products: metadata.products.map((product: CartProduct) => ({
				...product,
			})),
		},
		shipping_address_collection: {
			allowed_countries: ['US'],
		},
	})
	return NextResponse.json({ url: paymentLink.url }, { status: 200 })
}
