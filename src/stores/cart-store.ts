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
	increaseQuantity: (product: CartProduct) => void
	decreaseQuantity: (product: CartProduct) => void
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
			set((state) => ({
				...state,
				products: [...state.products, product],
			}))
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
		increaseQuantity: (product: CartProduct) => {
			set((state) => ({
				...state,
				products: state.products.map((p) =>
					p.name === product.name ? { ...p, quantity: p.quantity + 1 } : p
				),
			}))
		},
		decreaseQuantity: (product: CartProduct) => {
			set((state) => ({
				...state,
				products: state.products.map((p) =>
					p.name === product.name ? { ...p, quantity: p.quantity - 1 } : p
				),
			}))
		},
	}))
}
