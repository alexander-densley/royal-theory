import Link from 'next/link'
export default function ContactPage() {
	return (
		<div className='flex items-center justify-center px-4'>
			<div className='max-w-2xl w-full bg-white/5 backdrop-blur-sm rounded-lg p-8 md:p-12 space-y-10'>
				<h2 className='text-2xl md:text-3xl font-semibold text-center mb-8'>
					Contact Us
				</h2>

				<div className='space-y-6'>
					<div className='flex flex-col sm:flex-row items-center gap-2 justify-center'>
						<span className='text-lg sm:text-xl font-semibold'>INSTAGRAM</span>
						<a
							href='https://www.instagram.com/sincerelycourtier?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=='
							target='_blank'
							rel='noreferrer'
							className='text-lg sm:text-xl font-light hover:text-[#B7C8D7] transition-colors duration-200 hover:underline'
						>
							@SINCERELYCOURTIER
						</a>
					</div>

					<div className='flex flex-col sm:flex-row items-center gap-2 justify-center'>
						<span className='text-lg sm:text-xl font-semibold'>EMAIL</span>
						<a
							href='mailto:sincerelycourtier@aroyalkin.co'
							target='_blank'
							rel='noreferrer'
							className='text-lg sm:text-xl font-light hover:text-[#B7C8D7] transition-colors duration-200 hover:underline'
						>
							SINCERELYCOURTIER@AROYALKIN.CO
						</a>
					</div>
				</div>

				<div className='text-center pt-8'>
					<Link
						href='/'
						className='inline-flex items-center text-lg hover:text-[#B7C8D7] transition-colors duration-200 hover:underline'
					>
						<span>&larr;</span>
						<span className='ml-2'>BACK TO SHOP</span>
					</Link>
				</div>
			</div>
		</div>
	)
}
