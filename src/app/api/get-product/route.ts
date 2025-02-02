import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const id = searchParams.get('id') as unknown as number

	const supabase = await createClient()
	const { data, error } = await supabase
		.from('product')
		.select('*')
		.eq('id', id)
		.single()
	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}
	return NextResponse.json({ data }, { status: 200 })
}
