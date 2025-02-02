'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

export async function login(formData: FormData) {
	const supabase = await createClient()

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	}

	const { error } = await supabase.auth.signInWithPassword(data)

	if (error) {
		redirect('/error')
	}

	revalidatePath('/', 'layout')
	redirect('/')
}

export async function signup(formData: FormData) {
	const supabase = await createClient()
	const serviceRoleClient = await createServiceRoleClient()

	const inviteCode = formData.get('inviteCode') as string

	// Verify invite code
	const { data: inviteData, error: inviteError } = await serviceRoleClient
		.from('invite_codes')
		.select('*')
		.eq('code', inviteCode)
		.single()

	if (inviteError || !inviteData || inviteData.used) {
		redirect('/error?message=Invalid+or+used+invite+code')
	}

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	}

	const { error: signupError } = await supabase.auth.signUp(data)

	if (signupError) {
		redirect('/error')
	}

	// Mark invite code as used
	await supabase
		.from('invite_codes')
		.update({ used: true })
		.eq('code', inviteCode)

	revalidatePath('/', 'layout')
	redirect('/')
}
