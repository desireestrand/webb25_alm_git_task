import { apiUrl } from './client.js'
import { handleResponse } from './http.js'

/**
 * @param {{ page?: number, limit?: number, name?: string }} [query]
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<unknown[]>}
 */
export async function fetchProducts(query = {}, options = {}) {
  const { page = 1, limit = 10, name } = query
  const { signal } = options
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  })
  if (name && name.trim()) {
    params.set('name', name.trim())
  }
  const res = await fetch(`${apiUrl('/products')}?${params}`, { signal })
  const data = await handleResponse(res)
  return Array.isArray(data) ? data : []
}

/**
 * @param {Record<string, unknown>} body
 */
export async function createProduct(body) {
  const res = await fetch(apiUrl('/products'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return handleResponse(res)
}

/**
 * @param {string} id
 */
export async function deleteProduct(id) {
  const res = await fetch(apiUrl(`/products/${id}`), { method: 'DELETE' })
  return handleResponse(res)
}
