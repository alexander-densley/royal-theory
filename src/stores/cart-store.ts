import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'

export type CartProduct = {
	name: string
	quantity: number
	priceId: string
	price: number
	image: string
	stock: number
}

export type CartState = {
	products: CartProduct[]
}

export type CartActions = {
	addToCart: (product: CartProduct) => void
	removeFromCart: (product: CartProduct) => void
	increaseQuantity: (priceId: string) => void
	decreaseQuantity: (priceId: string) => void
	clearCart: () => void
}

export type CartStore = CartState & CartActions

export const defaultInitState: CartState = {
	products: [],
}

export const createCartStore = (initState: CartState = defaultInitState) => {
	return createStore<CartStore>()(
		persist(
			(set) => ({
				...initState,
				addToCart: (product: CartProduct) => {
					set((state) => {
						const existingProduct = state.products.find(
							(p) => p.priceId === product.priceId
						)
						if (existingProduct) {
							const newQuantity = existingProduct.quantity + product.quantity
							if (newQuantity > product.stock) {
								toast.error(
									`Sorry, only ${product.stock} items available in stock`
								)
								return state
							}
							return {
								...state,
								products: state.products.map((p) =>
									p.priceId === product.priceId
										? { ...p, quantity: newQuantity }
										: p
								),
							}
						} else {
							return {
								...state,
								products: [...state.products, product],
							}
						}
					})
				},
				removeFromCart: (product: CartProduct) => {
					set((state) => ({
						...state,
						products: state.products.filter(
							(p) => p.priceId !== product.priceId
						),
					}))
				},
				clearCart: () => {
					set({ products: [] })
				},
				increaseQuantity: (priceId: string) => {
					set((state) => {
						const product = state.products.find((p) => p.priceId === priceId)
						if (!product || product.quantity >= product.stock) {
							return state
						}
						return {
							...state,
							products: state.products.map((p) =>
								p.priceId === priceId ? { ...p, quantity: p.quantity + 1 } : p
							),
						}
					})
				},
				decreaseQuantity: (priceId: string) => {
					set((state) => {
						const product = state.products.find((p) => p.priceId === priceId)
						if (!product) return state

						if (product.quantity <= 1) {
							// Remove the product if quantity would become 0
							return {
								...state,
								products: state.products.filter((p) => p.priceId !== priceId),
							}
						}

						// Otherwise decrease the quantity
						return {
							...state,
							products: state.products.map((p) =>
								p.priceId === priceId ? { ...p, quantity: p.quantity - 1 } : p
							),
						}
					})
				},
			}),
			{ name: 'cart-storage' }
		)
	)
}
