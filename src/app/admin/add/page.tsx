'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Variant {
	size: string
	color: string
	price: number
	quantity: number
	price_id: string
	sku: string
}

export default function AddProductPage() {
	const router = useRouter()
	const supabase = createClient()
	const queryClient = useQueryClient()

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		is_preorder: false,
		is_notify: false,
	})

	const [variants, setVariants] = useState<Variant[]>([
		{
			size: '',
			color: '',
			price: 0,
			quantity: 0,
			price_id: '',
			sku: '',
		},
	])

	const [imageFiles, setImageFiles] = useState<File[]>([])

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

	// Mutation for creating products
	const productMutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			// First, create the product
			const { data: newProduct, error: productError } = await supabase
				.from('products')
				.insert(data)
				.select()
			if (productError) throw productError

			const productId = newProduct[0].id

			// Then, create all variants
			const { error: variantError } = await supabase
				.from('product_variants')
				.insert(
					variants.map((variant) => ({
						...variant,
						product_id: productId,
					}))
				)
			if (variantError) throw variantError

			return productId
		},
		onSuccess: async (productId) => {
			if (imageFiles.length > 0) {
				await uploadImageMutation.mutateAsync({
					productId,
					files: imageFiles,
				})
			}
			queryClient.invalidateQueries({ queryKey: ['products'] })
			router.push('/admin')
			toast.success('Product created successfully')
		},
		onError: (error: Error) => {
			toast.error(error.message)
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

		// Check for duplicate combinations
		const combinations = new Set()
		const duplicates = variants.filter((variant) => {
			const key = `${variant.size}-${variant.color}`
			if (combinations.has(key)) return true
			combinations.add(key)
			return false
		})

		if (duplicates.length > 0) {
			toast.error('Duplicate size and color combinations are not allowed')
			return
		}

		await productMutation.mutateAsync(formData)
	}

	const addVariant = () => {
		setVariants([
			...variants,
			{
				size: '',
				color: '',
				price: 0,
				quantity: 0,
				price_id: '',
				sku: '',
			},
		])
	}

	const removeVariant = (index: number) => {
		setVariants(variants.filter((_, i) => i !== index))
	}

	const updateVariant = (
		index: number,
		field: keyof Variant,
		value: string | number
	) => {
		const newVariants = [...variants]
		newVariants[index] = {
			...newVariants[index],
			[field]: value,
		}
		setVariants(newVariants)
	}

	return (
		<div className='container mx-auto p-4'>
			<Card className='max-w-4xl mx-auto'>
				<CardHeader>
					<CardTitle>Add New Product</CardTitle>
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
									<Card key={index}>
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
														value={variant.size}
														onChange={(e) =>
															updateVariant(index, 'size', e.target.value)
														}
														placeholder='e.g., Small, Medium, Large'
													/>
												</div>
												<div className='space-y-2'>
													<Label>Color</Label>
													<Input
														value={variant.color}
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
														value={variant.quantity || ''}
														onChange={(e) =>
															updateVariant(
																index,
																'quantity',
																Math.max(0, parseInt(e.target.value) || 0)
															)
														}
														min='0'
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label>Stripe Price ID</Label>
													<Input
														value={variant.price_id}
														onChange={(e) =>
															updateVariant(index, 'price_id', e.target.value)
														}
														placeholder='price_...'
													/>
												</div>
												<div className='space-y-2'>
													<Label>SKU</Label>
													<Input
														value={variant.sku}
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
							<Label htmlFor='images'>Images</Label>
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
										Creating...
									</>
								) : (
									'Add Product'
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
