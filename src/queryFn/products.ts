import { createClient } from '@/utils/supabase/client'

export async function getProductById(id: string) {
	const supabase = createClient()

	const { data, error } = await supabase
		.from('products')
		.select(
			`
			*,
			product_images (
				id,
				image_url,
				is_main,
				sort_order
			),
			variants:product_variants (
				id,
				size,
				color,
				price,
				quantity,
				price_id,
				sku
			)
		`
		)
		.eq('id', id)
		.single()

	if (error) throw error

	return { data }
}
