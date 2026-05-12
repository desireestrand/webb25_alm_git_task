import { apiUrl } from './client.js'
import { handleResponse } from './http.js'

/**
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<unknown[]>}
 */
export async function fetchCategories(options = {}) {
  const { signal } = options
  const res = await fetch(apiUrl('/categories'), { signal })
  const data = await handleResponse(res)
  return Array.isArray(data) ? data : []
}

/**
 * @param {string} id
 */
export async function fetchCategoryById(id) {
  const res = await fetch(apiUrl(`/categories/${id}`))
  return handleResponse(res)
}

/**
 * @param {Record<string, unknown>} body
 */
export async function createCategory(body) {
  const res = await fetch(apiUrl('/categories'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return handleResponse(res)
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} body
 */
export async function updateCategory(id, body) {
  const res = await fetch(apiUrl(`/categories/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return handleResponse(res)
}

/**
 * @param {string} id
 */
export async function deleteCategory(id) {
  const res = await fetch(apiUrl(`/categories/${id}`), { method: 'DELETE' })
  return handleResponse(res)
}
