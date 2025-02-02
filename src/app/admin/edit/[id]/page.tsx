'use client'

import { useState, useEffect } from 'react'
import { ProductImage, ProductVariant } from '@/types/database'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, X, Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'

export default function EditProductPage() {
	const router = useRouter()
	const params = useParams()
	const id = params.id as string
	const supabase = createClient()
	const queryClient = useQueryClient()

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		is_preorder: false,
		is_notify: false,
	})

	const [variants, setVariants] = useState<ProductVariant[]>([])
	const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([])

	const [imageFiles, setImageFiles] = useState<File[]>([])
	const [pendingImageChanges, setPendingImageChanges] = useState<{
		mainImageId?: number
		deletedImageIds: number[]
	}>({
		deletedImageIds: [],
	})

	// Query for fetching the product
	const { data: product, isLoading } = useQuery({
		queryKey: ['product', id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('products')
				.select(
					`
					*,
					product_images (*),
					variants:product_variants (*)
				`
				)
				.eq('id', id)
				.single()

			if (error) throw error
			return data
		},
	})

	// Reset pending changes when product data changes
	useEffect(() => {
		setPendingImageChanges({ deletedImageIds: [] })
		setDeletedVariantIds([])
	}, [product])

	// Set initial form data when product is loaded
	useEffect(() => {
		if (product) {
			setFormData({
				name: product.name,
				description: product.description || '',
				is_preorder: product.is_preorder,
				is_notify: product.is_notify,
			})
			setVariants(product.variants || [])
		}
	}, [product])

	// Mutation for uploading images
	const uploadImageMutation = useMutation({
		mutationFn: async ({
			productId,
			files,
		}: {
			productId: number
			files: File[]
		}) => {
			for (const file of files) {
				const fileExt = file.name.split('.').pop()
				const fileName = `${productId}/${Date.now()}.${fileExt}`

				const { error: uploadError } = await supabase.storage
					.from('images')
					.upload(fileName, file)

				if (uploadError) throw uploadError

				const {
					data: { publicUrl },
				} = supabase.storage.from('images').getPublicUrl(fileName)

				await supabase.from('product_images').insert({
					product_id: productId,
					image_url: publicUrl,
					is_main: false,
					sort_order: 0,
				})
			}
		},
	})

	// Mutation for deleting images
	const deleteImageMutation = useMutation({
		mutationFn: async (imageIds: number[]) => {
			for (const imageId of imageIds) {
				const { error } = await supabase
					.from('product_images')
					.delete()
					.eq('id', imageId)
				if (error) throw error
			}
		},
	})

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
	})

	// Mutation for updating product
	const productMutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			// Update product
			const { error: productError } = await supabase
				.from('products')
				.update(data)
				.eq('id', params.id)
			if (productError) throw productError

			// Delete removed variants
			if (deletedVariantIds.length > 0) {
				const { error: deleteError } = await supabase
					.from('product_variants')
					.delete()
					.in('id', deletedVariantIds)
				if (deleteError) throw deleteError
			}

			// Check for duplicate combinations
			const combinations = new Set()
			const duplicates = variants.filter((variant) => {
				const key = `${variant.size}-${variant.color}`
				if (combinations.has(key)) return true
				combinations.add(key)
				return false
			})

			if (duplicates.length > 0) {
				throw new Error('Duplicate size and color combinations are not allowed')
			}

			// Update or create variants
			for (const variant of variants) {
				if (variant.id && variant.id !== 0) {
					// Check if this update would create a duplicate
					const { data: existingVariants } = await supabase
						.from('product_variants')
						.select('id')
						.eq('product_id', params.id)
						.eq('size', variant.size)
						.eq('color', variant.color)
						.neq('id', variant.id)

					if (existingVariants && existingVariants.length > 0) {
						throw new Error(
							`A variant with size ${variant.size} and color ${variant.color} already exists`
						)
					}

					// Update existing variant
					const { error: updateError } = await supabase
						.from('product_variants')
						.update({
							size: variant.size,
							color: variant.color,
							price: variant.price,
							quantity: variant.quantity,
							price_id: variant.price_id,
							sku: variant.sku,
						})
						.eq('id', variant.id)
					if (updateError) throw updateError
				} else {
					// Check if this new variant would create a duplicate
					const { data: existingVariants } = await supabase
						.from('product_variants')
						.select('id')
						.eq('product_id', params.id)
						.eq('size', variant.size)
						.eq('color', variant.color)

					if (existingVariants && existingVariants.length > 0) {
						throw new Error(
							`A variant with size ${variant.size} and color ${variant.color} already exists`
						)
					}

					// Create new variant - omit the id field
					const { error: createError } = await supabase
						.from('product_variants')
						.insert({
							product_id: parseInt(id),
							size: variant.size,
							color: variant.color,
							price: variant.price,
							quantity: variant.quantity,
							price_id: variant.price_id,
							sku: variant.sku,
						})
					if (createError) throw createError
				}
			}

			return parseInt(id)
		},
		onSuccess: async (productId) => {
			try {
				// Handle image changes
				if (pendingImageChanges.deletedImageIds.length > 0) {
					await deleteImageMutation.mutateAsync(
						pendingImageChanges.deletedImageIds
					)
				}

				if (pendingImageChanges.mainImageId) {
					await setMainImageMutation.mutateAsync({
						imageId: pendingImageChanges.mainImageId,
						productId,
					})
				}

				if (imageFiles.length > 0) {
					await uploadImageMutation.mutateAsync({
						productId,
						files: imageFiles,
					})
				}

				// Invalidate both the single product and products list queries
				queryClient.invalidateQueries({ queryKey: ['product', id] })
				queryClient.invalidateQueries({ queryKey: ['products'] })

				toast.success('Product updated successfully')
				router.push('/admin')
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (error: any) {
				toast.error(error.message || 'Failed to update images')
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		},
	})

	// Add delete product mutation after other mutations
	const deleteProductMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabase
				.from('products')
				.delete()
				.eq('id', params.id)
			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['products'] })
			router.push('/admin')
		},
	})

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		// Validate variants
		if (!variants.length) {
			alert('Please add at least one variant')
			return
		}

		if (variants.some((v) => !v.price)) {
			alert('All variants must have a price')
			return
		}

		await productMutation.mutateAsync(formData)
	}

	const handleDeleteImage = (imageId: number) => {
		setPendingImageChanges((prev) => ({
			...prev,
			deletedImageIds: [...prev.deletedImageIds, imageId],
		}))
	}

	const handleSetMainImage = (imageId: number) => {
		setPendingImageChanges((prev) => ({
			...prev,
			mainImageId: imageId,
		}))
	}

	const addVariant = () => {
		setVariants([
			...variants,
			{
				id: 0, // Will be replaced with actual ID after creation
				product_id: parseInt(id),
				size: '',
				color: '',
				price: 0,
				quantity: 0,
				price_id: '',
				sku: '',
				created_at: new Date().toISOString(),
			},
		])
	}

	const removeVariant = (index: number) => {
		const variant = variants[index]
		if (variant.id) {
			setDeletedVariantIds([...deletedVariantIds, variant.id])
		}
		setVariants(variants.filter((_, i) => i !== index))
	}

	const updateVariant = (
		index: number,
		field: keyof ProductVariant,
		value: string | number
	) => {
		const newVariants = [...variants]
		// For quantity and price, ensure we handle empty string and zero correctly
		if (field === 'quantity' || field === 'price') {
			const numValue = typeof value === 'string' ? parseFloat(value) : value
			newVariants[index] = {
				...newVariants[index],
				[field]: value === '' ? 0 : isNaN(numValue) ? 0 : numValue,
			}
		} else {
			newVariants[index] = {
				...newVariants[index],
				[field]: value,
			}
		}
		setVariants(newVariants)
	}

	// Add handleDelete function before return statement
	const handleDelete = async () => {
		await deleteProductMutation.mutateAsync()
	}

	if (isLoading) {
		return (
			<div className='container mx-auto p-4 flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		)
	}

	// Filter out deleted images and apply pending main image change
	const displayImages = product?.product_images
		?.filter(
			(image: ProductImage) =>
				!pendingImageChanges.deletedImageIds.includes(image.id)
		)
		.map((image: ProductImage) => ({
			...image,
			is_main: pendingImageChanges.mainImageId
				? image.id === pendingImageChanges.mainImageId
				: image.is_main,
		}))

	return (
		<div className='container mx-auto p-4'>
			<Card className='max-w-4xl mx-auto'>
				<CardHeader className='flex flex-row items-center justify-between'>
					<CardTitle>Edit Product</CardTitle>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='text-gray-500 hover:text-red-500'
							>
								<Trash2 className='h-5 w-5' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-80'>
							<div className='space-y-4'>
								<h4 className='font-medium'>Delete Product</h4>
								<p className='text-sm text-gray-500'>
									Are you sure you want to delete this product? This action
									cannot be undone.
								</p>
								<div className='flex justify-end gap-2'>
									<Button
										variant='destructive'
										size='sm'
										onClick={handleDelete}
										disabled={deleteProductMutation.isPending}
									>
										{deleteProductMutation.isPending ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												Deleting...
											</>
										) : (
											'Delete'
										)}
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='name'>Name</Label>
								<Input
									id='name'
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									required
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									rows={3}
								/>
							</div>

							<div className='flex gap-6'>
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='is_preorder'
										checked={formData.is_preorder}
										onCheckedChange={(checked: boolean) =>
											setFormData({
												...formData,
												is_preorder: checked,
											})
										}
									/>
									<Label htmlFor='is_preorder'>Pre-order</Label>
								</div>

								<div className='flex items-center space-x-2'>
									<Checkbox
										id='is_notify'
										checked={formData.is_notify}
										onCheckedChange={(checked: boolean) =>
											setFormData({
												...formData,
												is_notify: checked,
											})
										}
									/>
									<Label htmlFor='is_notify'>Notify when available</Label>
								</div>
							</div>
						</div>

						<div className='space-y-4'>
							<div className='flex justify-between items-center'>
								<Label>Product Variants</Label>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={addVariant}
								>
									<Plus className='h-4 w-4 mr-2' />
									Add Variant
								</Button>
							</div>

							<div className='space-y-4'>
								{variants.map((variant, index) => (
									<Card key={variant.id || index}>
										<CardContent className='pt-6'>
											<div className='flex justify-between mb-4'>
												<h3 className='font-medium'>Variant {index + 1}</h3>
												{variants.length > 1 && (
													<Button
														type='button'
														variant='ghost'
														size='sm'
														onClick={() => removeVariant(index)}
													>
														<X className='h-4 w-4' />
													</Button>
												)}
											</div>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label>Size</Label>
													<Input
														value={variant.size || ''}
														onChange={(e) =>
															updateVariant(index, 'size', e.target.value)
														}
														placeholder='e.g., Small, Medium, Large'
													/>
												</div>
												<div className='space-y-2'>
													<Label>Color</Label>
													<Input
														value={variant.color || ''}
														onChange={(e) =>
															updateVariant(index, 'color', e.target.value)
														}
														placeholder='e.g., Red, Blue, Green'
													/>
												</div>
												<div className='space-y-2'>
													<Label>Price</Label>
													<Input
														type='number'
														value={variant.price || ''}
														onChange={(e) =>
															updateVariant(
																index,
																'price',
																Math.max(0, parseFloat(e.target.value) || 0)
															)
														}
														min='0'
														step='0.01'
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label>Quantity</Label>
													<Input
														type='number'
														value={variant.quantity}
														onChange={(e) => {
															const value = e.target.value
															// Allow empty input to be passed through
															updateVariant(
																index,
																'quantity',
																value === '' ? value : parseFloat(value)
															)
														}}
														min='0'
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label>Stripe Price ID</Label>
													<Input
														value={variant.price_id || ''}
														onChange={(e) =>
															updateVariant(index, 'price_id', e.target.value)
														}
														placeholder='price_...'
													/>
												</div>
												<div className='space-y-2'>
													<Label>SKU</Label>
													<Input
														value={variant.sku || ''}
														onChange={(e) =>
															updateVariant(index, 'sku', e.target.value)
														}
														placeholder='Stock Keeping Unit'
													/>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='images'>Add More Images</Label>
							<Input
								id='images'
								type='file'
								multiple
								accept='image/*'
								onChange={(e) =>
									setImageFiles(Array.from(e.target.files || []))
								}
								className='cursor-pointer'
							/>
						</div>

						{displayImages && (
							<div className='space-y-2'>
								<Label>Current Images</Label>
								<div className='flex flex-wrap gap-3'>
									{displayImages.map((image: ProductImage) => (
										<div key={image.id} className='relative group'>
											<Image
												src={image.image_url}
												alt={product.name}
												width={80}
												height={80}
												className={`object-cover rounded-md ${
													image.is_main
														? 'ring-2 ring-primary ring-offset-2'
														: ''
												}`}
											/>
											<div className='absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
												<Button
													variant='destructive'
													size='icon'
													className='h-6 w-6'
													onClick={() => handleDeleteImage(image.id)}
												>
													<X className='h-4 w-4' />
												</Button>
												{!image.is_main && (
													<Button
														variant='secondary'
														size='icon'
														className='h-6 w-6'
														onClick={() => handleSetMainImage(image.id)}
														title='Set as main image'
													>
														★
													</Button>
												)}
											</div>
											{image.is_main && (
												<span className='absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded'>
													Main
												</span>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						<div className='flex gap-2 pt-4'>
							<Button
								type='submit'
								disabled={
									productMutation.isPending || uploadImageMutation.isPending
								}
							>
								{productMutation.isPending || uploadImageMutation.isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Updating...
									</>
								) : (
									'Update Product'
								)}
							</Button>

							<Button
								type='button'
								variant='outline'
								onClick={() => router.push('/admin')}
							>
								Cancel
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
