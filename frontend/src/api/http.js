/**
 * @param {Response} res
 * @returns {Promise<unknown>}
 */
async function parseJsonBody(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

/**
 * @param {Response} res
 * @returns {Promise<unknown>}
 */
export async function handleResponse(res) {
  const data = await parseJsonBody(res)
  if (!res.ok) {
    const msg = data && typeof data === 'object' && 'message' in data ? data.message : res.statusText
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return data
}
