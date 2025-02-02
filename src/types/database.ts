export interface Product {
	id: number
	name: string
	description: string | null
	price: number
	quantity: number
	is_preorder: boolean
	is_notify: boolean
	sizes: string[] | null
	price_id: string | null
	created_at: string
	product_images: ProductImage[]
}

export interface ProductImage {
	id: number
	product_id: number
	image_url: string
	is_main: boolean
	sort_order: number
	created_at: string
}

export interface InviteCode {
	id: number
	code: string
	used: boolean
	created_at: string
	used_at: string | null
}
