import { redirect } from 'next/navigation'

export default function Home() {
	redirect('/shop')
	return <div>hello world</div>
}
