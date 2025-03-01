import { signup } from '../login/actions'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function SignupPage() {
	return (
		<div className='min-h-screen flex items-center justify-center px-4'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<h1 className='text-2xl font-bold text-center'>Create Account</h1>
					<p className='text-muted-foreground text-center'>
						Sign up to get started
					</p>
				</CardHeader>
				<form>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								name='email'
								type='email'
								placeholder='Enter your email'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								name='password'
								type='password'
								placeholder='Enter your password'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='inviteCode'>Invite Code</Label>
							<Input
								id='inviteCode'
								name='inviteCode'
								type='text'
								placeholder='Enter your invite code'
								required
							/>
						</div>
					</CardContent>
					<CardFooter className='flex flex-col gap-2'>
						<Button className='w-full' formAction={signup}>
							Sign up
						</Button>
						<p className='text-sm text-center text-muted-foreground'>
							Already have an account?{' '}
							<Link href='/login' className='text-primary hover:underline'>
								Log in
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
