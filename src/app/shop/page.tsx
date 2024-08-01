import { AspectRatio } from '@/components/ui/aspect-ratio'
import Image from 'next/image'
import test from '../../../public/test.png'

const images = [
	{
		src: '/test.png',
		alt: 'Royal Theory Shop',
		width: 300,
		height: 500,
		name: 'Test Item',
		price: '$100',
	},
	{
		src: '/test.png',
		alt: 'Royal Theory Shop',
		width: 300,
		height: 500,
		name: 'Test Item',
		price: '$100',
	},
	{
		src: '/test.png',
		alt: 'Royal Theory Shop',
		width: 300,
		height: 500,
		name: 'Test Item',
		price: '$100',
	},
	{
		src: '/test.png',
		alt: 'Royal Theory Shop',
		width: 300,
		height: 500,
		name: 'Test Item',
		price: '$100',
	},
	{
		src: '/test.png',
		alt: 'Royal Theory Shop',
		width: 300,
		height: 500,
		name: 'Test Item',
		price: '$100',
	},
	{
		src: '/test.png',
		alt: 'Royal Theory Shop',
		width: 300,
		height: 500,
		name: 'Test Item',
		price: '$100',
	},
]

export default function ShopPage() {
	return (
		<div className='flex items-center justify-center min-h-screen my-8'>
			<div className='grid grid-cols-3 gap-4'>
				{images.map((image, index) => (
					<div key={index} className='flex flex-col'>
						<Image
							src={image.src}
							alt={image.alt}
							width={image.width}
							height={image.height}
						/>
						<div className='flex flex-col items-center justify-center'>
							<p className='text-lg font-semibold'>{image.name}</p>
							<p>{image.price}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
