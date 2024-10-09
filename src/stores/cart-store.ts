import { createStore } from 'zustand/vanilla'

export type CartProduct = {
	name: string
	quantity: number
	priceId: string
	price: number
	image: string
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
	return createStore<CartStore>()((set) => ({
		...initState,
		addToCart: (product: CartProduct) => {
			set((state) => {
				const existingProduct = state.products.find(
					(p) => p.priceId === product.priceId
				)
				if (existingProduct) {
					return {
						...state,
						products: state.products.map((p) =>
							p.priceId === product.priceId
								? { ...p, quantity: p.quantity + 1 }
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
					(product) => product.name !== product.name
				),
			}))
		},
		clearCart: () => {
			set({ products: [] })
		},
		increaseQuantity: (priceId: string) => {
			set((state) => ({
				...state,
				products: state.products.map((p) =>
					p.priceId === priceId ? { ...p, quantity: p.quantity + 1 } : p
				),
			}))
		},
		decreaseQuantity: (priceId: string) => {
			set((state) => ({
				...state,
				products: state.products
					.map((p) =>
						p.priceId === priceId && p.quantity > 0
							? { ...p, quantity: p.quantity - 1 }
							: p
					)
					.filter((p) => p.quantity > 0), // Remove products with quantity 0
			}))
		},
	}))
}
