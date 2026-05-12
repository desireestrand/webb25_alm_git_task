import { useState } from 'react'
import { createCategory, deleteCategory, updateCategory } from '../api/categories'

/**
 * @param {{
 *   categories: Array<{ _id: string, name: string, description?: string, isActive?: boolean }>,
 *   onChanged: () => Promise<void>
 * }} props
 */

export default function CategoriesPanel({ categories, onChanged }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const resetForm = () => {
    setName('')
    setDescription('')
    setIsActive(true)
    setEditingId(null)
    setError(null)
  }

  const onStartEdit = (category) => {
    setEditingId(category._id)
    setName(category.name)
    setDescription(category.description ?? '')
    setIsActive(category.isActive ?? true)
    setError(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError(null)

    try {
      const body = {
        name: name.trim(),
        description: description.trim(),
        isActive
      }
      if (editingId) {
        await updateCategory(editingId, body)
      } else {
        await createCategory(body)
      }
      resetForm()
      await onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save category')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    setError(null)

    try {
      await deleteCategory(id)
      if (editingId === id) resetForm()
      await onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete category')
    }
  }

  return (
    <section className='card'>
      <h2>Categories</h2>
      {error ? (
        <div className='card error' role='alert'>
          {error}
        </div>
      ) : null}

      <form className='form-grid' onSubmit={onSubmit}>
        <label htmlFor='name'>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label className='span-2'>
          Description
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          <input type='checkbox' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
        </label>
        <div className='form-actions'>
          <button type='submit' disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
          </button>
          {editingId ? (
            <button type='button' onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {categories.length === 0 ? (
        <p className='muted'>No categories yet.</p>
      ) : (
        <ul className='product-list'>
          {categories.map((c) => (
            <li key={c._id} className='product-row'>
              <div>
                <strong>{c.name}</strong>
                {!c.isActive ? <span className='muted'> (inactive)</span> : null}
                {c.description ? <p className='desc'>{c.description}</p> : null}
              </div>
              <div className='form-actions'>
                <button type='button' onClick={() => onStartEdit(c)}>
                  Edit
                </button>
                <button type='button' className='danger' onClick={() => onDelete(c._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
