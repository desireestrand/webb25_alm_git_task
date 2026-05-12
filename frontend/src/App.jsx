import { useCallback, useEffect, useState } from 'react'
import { getApiBase } from './api/client.js'
import { createProduct, deleteProduct, fetchProducts } from './api/products.js'
import { fetchCategories } from './api/categories.js'
import CategoriesPanel from './components/CategoriesPanel.jsx'
import './App.css'

function App() {
  const hasApi = Boolean(getApiBase())
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [nameFilter, setNameFilter] = useState('')
  const [nameFilterApplied, setNameFilterApplied] = useState('')

  const [formName, setFormName] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [saving, setSaving] = useState(false)

  const [categories, setCategories] = useState([])
  const [categoriesError, setCategoriesError] = useState(null)

  const load = useCallback(
    async (signal) => {
      if (!getApiBase()) {
        setProducts([])
        return
      }
      setLoading(true)
      setError(null)
      try {
        const opts = signal ? { signal } : {}
        const list = await fetchProducts({ page, limit, name: nameFilterApplied || undefined }, opts)
        setProducts(list)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Request failed')
        setProducts([])
      } finally {
        setLoading(false)
      }
    },
    [page, limit, nameFilterApplied]
  )

  useEffect(() => {
    if (!hasApi) return
    const ac = new AbortController()
    const t = window.setTimeout(() => {
      void load(ac.signal)
    }, 0)
    return () => {
      window.clearTimeout(t)
      ac.abort()
    }
  }, [hasApi, load])

  const onApplyFilter = (e) => {
    e.preventDefault()
    setPage(1)
    setNameFilterApplied(nameFilter)
  }

  const onCreate = async (e) => {
    e.preventDefault()
    const price = Number(formPrice)
    if (!formName.trim() || Number.isNaN(price)) {
      setError('Name and a numeric price are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const body = {
        name: formName.trim(),
        price,
        description: formDescription.trim()
      }
      if (formCategory) {
        body.category = formCategory
      }
      await createProduct(body)
      setFormName('')
      setFormPrice('')
      setFormDescription('')
      setFormCategory('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create product')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    setError(null)
    try {
      await deleteProduct(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete product')
    }
  }

  const loadCategories = useCallback(
    async (signal) => {
      if (!hasApi) return
      setCategoriesError(null)

      try {
        const opts = signal ? { signal } : []
        const list = await fetchCategories(opts)
        setCategories(list)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setCategoriesError(e instanceof Error ? e.message : 'Could not load categories')
      }
    },
    [hasApi]
  )

  useEffect(() => {
    if (!hasApi) return
    const ac = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState happens after await, not sync
    void loadCategories(ac.signal)
    return () => ac.abort()
  }, [hasApi, loadCategories])

  if (!hasApi) {
    return (
      <div className='app shell'>
        <header className='header'>
          <h1>Products</h1>
        </header>
        <main className='main'>
          <div className='card notice'>
            <p>
              <strong>API URL missing.</strong> Copy <code>frontend/.env.example</code> to <code>frontend/.env</code> and set{' '}
              <code>VITE_API_BASE_URL</code> to your Express server (for example <code>http://localhost:3000</code>). Then restart{' '}
              <code>npm run dev</code>.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className='app shell'>
      <header className='header'>
        <h1>Products</h1>
        <p className='muted'>Using API at {getApiBase()}</p>
      </header>

      <main className='main'>
        {error ? (
          <div className='card error' role='alert'>
            {error}
          </div>
        ) : null}

        <section className='card'>
          <h2>Add product</h2>
          <form className='form-grid' onSubmit={onCreate}>
            <label>
              Name
              <input value={formName} onChange={(ev) => setFormName(ev.target.value)} required />
            </label>
            <label>
              Price
              <input type='number' min='0' step='0.01' value={formPrice} onChange={(ev) => setFormPrice(ev.target.value)} required />
            </label>
            <label className='span-2'>
              Description
              <input value={formDescription} onChange={(ev) => setFormDescription(ev.target.value)} />
            </label>

            <label>
              Category
              <select value={formCategory} onChange={(ev) => setFormCategory(ev.target.value)}>
                <option value=''>No category</option>
                {categories
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                {error ? (
                  <div className='card error' role='alert'>
                    {error}
                  </div>
                ) : null}

                {categoriesError ? (
                  <div className='card error' role='alert'>
                    Categories: {categoriesError}
                  </div>
                ) : null}
              </select>
            </label>
            <div className='form-actions'>
              <button type='submit' disabled={saving}>
                {saving ? 'Saving…' : 'Create'}
              </button>
            </div>
          </form>
        </section>

        {error ? (
          <div className='card error' role='alert'>
            {error}
          </div>
        ) : null}

        {categoriesError ? (
          <div className='card error' role='alert'>
            Categories: {categoriesError}
          </div>
        ) : null}

        {/* ⬇️ Lägg till denna */}
        <CategoriesPanel categories={categories} onChanged={loadCategories} />

        <section className='card'>
          <h2>Catalog</h2>
          <form className='filter-row' onSubmit={onApplyFilter}>
            <label className='grow'>
              Filter by name
              <input value={nameFilter} onChange={(ev) => setNameFilter(ev.target.value)} placeholder='Search text' />
            </label>
            <button type='submit'>Apply</button>
          </form>

          {loading ? <p className='muted'>Loading…</p> : null}

          {!loading && products.length === 0 ? <p className='muted'>No products on this page.</p> : null}

          <ul className='product-list'>
            {products.map((p) => (
              <li key={p._id} className='product-row'>
                <div>
                  <strong>{p.name}</strong>
                  <span className='muted'> · {p.price} kr</span>
                  {p.category && typeof p.category === 'object' ? <span className='tag'>{p.category.name}</span> : null}
                  {p.description ? <p className='desc'>{p.description}</p> : null}
                </div>
                <button type='button' className='danger' onClick={() => onDelete(p._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className='pager'>
            <button type='button' disabled={page <= 1 || loading} onClick={() => setPage((n) => Math.max(1, n - 1))}>
              Previous
            </button>
            <span className='muted'>Page {page}</span>
            <button type='button' disabled={loading || products.length < limit} onClick={() => setPage((n) => n + 1)}>
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
