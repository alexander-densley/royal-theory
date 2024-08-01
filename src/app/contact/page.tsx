import Link from 'next/link'
export default function ContactPage() {
	return (
		<div className='flex-grow flex flex-col items-center justify-center'>
			<div className='flex flex-col items-center justify-center gap-8'>
				<h1>
					<span className='text-lg sm:text-2xl font-semibold'>INSTAGRAM: </span>
					<a
						href='https://www.instagram.com/sincerelycourtier?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=='
						target='_blank'
						rel='noreferrer'
						className='text-lg sm:text-2xl font-light hover:text-[#B7C8D7] hover:underline'
					>
						@SINCERELYCOURTIER
					</a>
				</h1>
				<h1>
					<span className='text-lg sm:text-2xl font-semibold'>EMAIL: </span>
					<a
						href='mailto:prodbythart@gmail.com'
						target='_blank'
						rel='noreferrer'
						className='text-lg sm:text-2xl font-light hover:text-[#B7C8D7] hover:underline'
					>
						PRODBYTHART@GMAIL.COM
					</a>
				</h1>
				<Link href='/' className='hover:text-[#B7C8D7] hover:underline mt-28'>
					<p>&lt; BACK TO SHOP</p>
				</Link>
			</div>
		</div>
	)
}
