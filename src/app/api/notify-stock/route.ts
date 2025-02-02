import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		console.log('Received notification request')
		const { productId, email } = await request.json()

		if (!productId || !email) {
			return NextResponse.json(
				{ error: 'Product ID and email are required' },
				{ status: 400 }
			)
		}

		const supabase = await createClient()

		// First verify the product exists and is out of stock
		const { data: product, error: productError } = await supabase
			.from('products')
			.select('quantity')
			.eq('id', productId)
			.single()

		if (productError || !product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 })
		}

		// Store the notification request
		// You'll need to create this table in your database
		const { error: notifyError } = await supabase
			.from('stock_notifications')
			.insert({
				product_id: productId,
				email: email,
				created_at: new Date().toISOString(),
			})

		if (notifyError) {
			console.error('Error storing notification:', notifyError)
			return NextResponse.json(
				{ error: 'Failed to store notification' },
				{ status: 500 }
			)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error processing notification:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
