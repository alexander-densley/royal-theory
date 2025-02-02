// src/providers/counter-store-provider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { type CartStore, createCartStore } from '@/stores/cart-store'

export type CartProduct = {
	id: number
	productId: number
	name: string
	price: number
	priceId: string
	image: string
	quantity: number
	stock: number
	size: string | null
	color: string | null
}

export type CartStoreApi = ReturnType<typeof createCartStore>

export const CartStoreContext = createContext<CartStoreApi | undefined>(
	undefined
)

export interface CartStoreProviderProps {
	children: ReactNode
}

export const CartStoreProvider = ({ children }: CartStoreProviderProps) => {
	const storeRef = useRef<CartStoreApi>()
	if (!storeRef.current) {
		storeRef.current = createCartStore()
	}

	return (
		<CartStoreContext.Provider value={storeRef.current}>
			{children}
		</CartStoreContext.Provider>
	)
}

export const useCartStore = <T,>(selector: (store: CartStore) => T): T => {
	const counterStoreContext = useContext(CartStoreContext)

	if (!counterStoreContext) {
		throw new Error(`useCartStore must be used within CartStoreProvider`)
	}

	return useStore(counterStoreContext, selector)
}
