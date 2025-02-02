import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
	const { line_items } = await req.json()
	console.log(line_items)
	console.log(process.env.STRIPE_SECRET_KEY as string)
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

	const paymentLink = await stripe.paymentLinks.create({
		line_items,
	})
	console.log(paymentLink)
	return NextResponse.json({ url: paymentLink.url }, { status: 200 })
}
