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
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddProductPage() {
	const router = useRouter()
	const supabase = createClient()
	const queryClient = useQueryClient()

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: 0,
		quantity: 0,
		is_preorder: false,
		is_notify: false,
		sizes: [] as string[],
		price_id: '',
	})

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
		mutationFn: async (
			data: Omit<typeof formData, 'sizes'> & { sizes: string[] }
		) => {
			const { data: newProduct, error } = await supabase
				.from('products')
				.insert(data)
				.select()
			if (error) throw error
			return newProduct?.[0]?.id
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
		},
	})

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const productData = {
			...formData,
			price: Number(formData.price),
			quantity: Number(formData.quantity),
		}
		await productMutation.mutateAsync(productData)
	}

	return (
		<div className='container mx-auto p-4'>
			<Card className='max-w-2xl mx-auto'>
				<CardHeader>
					<CardTitle>Add New Product</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
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

						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='price'>Price</Label>
								<Input
									id='price'
									type='number'
									value={formData.price || ''}
									onChange={(e) =>
										setFormData({
											...formData,
											price:
												e.target.value === ''
													? 0
													: Math.max(0, parseFloat(e.target.value) || 0),
										})
									}
									required
									min='0'
									step='0.01'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='quantity'>Quantity</Label>
								<Input
									id='quantity'
									type='number'
									value={formData.quantity || ''}
									onChange={(e) =>
										setFormData({
											...formData,
											quantity:
												e.target.value === ''
													? 0
													: Math.max(0, parseInt(e.target.value) || 0),
										})
									}
									required
									min='0'
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='price_id'>Stripe Price ID</Label>
							<Input
								id='price_id'
								value={formData.price_id}
								onChange={(e) =>
									setFormData({ ...formData, price_id: e.target.value })
								}
								placeholder='price_...'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='sizes'>Sizes (comma-separated)</Label>
							<Input
								id='sizes'
								value={formData.sizes.join(', ')}
								onChange={(e) =>
									setFormData({
										...formData,
										sizes: e.target.value.split(',').map((s) => s.trim()),
									})
								}
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
