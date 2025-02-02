'use client'

import { ProductImage, Product } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, GripVertical } from 'lucide-react'
import Link from 'next/link'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
	DragStartEvent,
	DragOverlay,
} from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

interface SortableProductCardProps {
	product: Product
	onSetMainImage: (imageId: number, productId: number) => void
}

function SortableProductCard({
	product,
	onSetMainImage,
}: SortableProductCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: product.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: transition || 'transform 300ms ease, opacity 300ms ease',
		opacity: isDragging ? 0.3 : 1,
	}

	return (
		<div ref={setNodeRef} style={style}>
			<Card>
				<CardContent className='pt-6'>
					<div className='flex justify-between items-start mb-4'>
						<div className='flex items-start gap-2'>
							<div
								{...attributes}
								{...listeners}
								className='cursor-grab hover:text-primary mt-1'
							>
								<GripVertical className='h-5 w-5' />
							</div>
							<div>
								<h3 className='font-semibold text-lg'>{product.name}</h3>
								<p className='text-sm text-muted-foreground'>
									${product.price}
								</p>
								{product.price_id && (
									<p className='text-xs text-muted-foreground mt-1'>
										Price ID: {product.price_id}
									</p>
								)}
								<p className='text-sm text-muted-foreground mt-1'>
									Quantity: {product.quantity}
								</p>
								{product.sizes && product.sizes.length > 0 && (
									<p className='text-sm text-muted-foreground mt-1'>
										Sizes: {product.sizes.join(', ')}
									</p>
								)}
								{product.description && (
									<p className='text-sm mt-2 line-clamp-2'>
										{product.description}
									</p>
								)}
							</div>
						</div>
						<Button asChild variant='secondary'>
							<Link href={`/admin/edit/${product.id}`}>Edit</Link>
						</Button>
					</div>

					<div className='flex flex-wrap gap-3 mt-4'>
						{product.product_images?.map((image: ProductImage) => (
							<div key={image.id} className='relative group'>
								<Image
									src={image.image_url}
									alt={product.name}
									width={80}
									height={80}
									className={`object-cover rounded-md ${
										image.is_main ? 'ring-2 ring-primary ring-offset-2' : ''
									}`}
								/>
								{image.is_main ? (
									<span className='absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded'>
										Main
									</span>
								) : (
									<Button
										variant='secondary'
										size='icon'
										className='h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity'
										onClick={() => onSetMainImage(image.id, product.id)}
										title='Set as main image'
									>
										★
									</Button>
								)}
							</div>
						))}
					</div>

					<div className='flex gap-2 mt-4'>
						{product.is_preorder && (
							<span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>
								Pre-order
							</span>
						)}
						{product.is_notify && (
							<span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
								Notify When Available
							</span>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default function AdminPage() {
	const supabase = createClient()
	const queryClient = useQueryClient()
	const [activeId, setActiveId] = useState<number | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	// Mutation for setting main image
	const setMainImageMutation = useMutation({
		mutationFn: async ({
			imageId,
			productId,
		}: {
			imageId: number
			productId: number
		}) => {
			await supabase
				.from('product_images')
				.update({ is_main: false })
				.eq('product_id', productId)

			const { error } = await supabase
				.from('product_images')
				.update({ is_main: true })
				.eq('id', imageId)

			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['products'] })
		},
	})

	// Mutation for updating product sort order
	const updateSortOrderMutation = useMutation({
		mutationFn: async (updates: { id: number; sort_order: number }[]) => {
			for (const update of updates) {
				const { error } = await supabase
					.from('products')
					.update({ sort_order: update.sort_order })
					.eq('id', update.id)
				if (error) throw error
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['products'] })
		},
	})

	// Query for fetching products
	const { data: products = [], isLoading } = useQuery({
		queryKey: ['products'],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('products')
				.select(`*, product_images (*)`)
				.order('sort_order', { ascending: true })

			if (error) throw error
			return data || []
		},
	})

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as number)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveId(null)
		const { active, over } = event
		if (!over || active.id === over.id) return

		const oldIndex = products.findIndex((p) => p.id === active.id)
		const newIndex = products.findIndex((p) => p.id === over.id)

		const newOrder = arrayMove(products, oldIndex, newIndex)
		const updates = newOrder.map((product: Product, index: number) => ({
			id: product.id,
			sort_order: index,
		}))

		updateSortOrderMutation.mutate(updates)
	}

	const activeProduct = activeId
		? products.find((p) => p.id === activeId)
		: null

	return (
		<div className='container mx-auto p-4 space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-bold'>Product Management</h1>
				<Button asChild>
					<Link href='/admin/add'>Add New Product</Link>
				</Button>
			</div>

			{isLoading ? (
				<div className='col-span-full flex items-center justify-center p-8'>
					<Loader2 className='h-8 w-8 animate-spin' />
				</div>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						<SortableContext
							items={products.map((p) => p.id)}
							strategy={rectSortingStrategy}
						>
							{products.map((product) => (
								<SortableProductCard
									key={product.id}
									product={product}
									onSetMainImage={(imageId, productId) =>
										setMainImageMutation.mutate({ imageId, productId })
									}
								/>
							))}
						</SortableContext>
					</div>
					<DragOverlay
						dropAnimation={{
							duration: 300,
							easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
						}}
					>
						{activeProduct ? (
							<div className='opacity-80 rotate-3 scale-105'>
								<SortableProductCard
									product={activeProduct}
									onSetMainImage={(imageId, productId) =>
										setMainImageMutation.mutate({ imageId, productId })
									}
								/>
							</div>
						) : null}
					</DragOverlay>
				</DndContext>
			)}
		</div>
	)
}
