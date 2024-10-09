export const getProductById = async (id: string) => {
	const response = await fetch(`/api/get-product?id=${id}`)
	if (!response.ok) {
		throw new Error('Failed to fetch users')
	}
	const data = await response.json()
	return data
}
