import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
	return (
		<div className='min-h-screen flex items-center justify-center px-4'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<h1 className='text-2xl font-bold text-center'>Welcome Back</h1>
					<p className='text-muted-foreground text-center'>
						Please sign in to continue
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
					</CardContent>
					<CardFooter className='flex flex-col gap-2'>
						<Button className='w-full' formAction={login}>
							Log in
						</Button>
						<Button className='w-full' variant='outline' formAction={signup}>
							Sign up
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
