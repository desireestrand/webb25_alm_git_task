const mongoose = require('mongoose')
const Product = require('../src/models/Product')

describe('Product model validation', () => {
  it('creates a valid product with category', () => {
    const product = new Product({
      name: 'Keyboard',
      price: 499,
      category: new mongoose.Types.ObjectId()
    })
    expect(product.validateSync()).toBeUndefined()
  })

  it('creates a valid product without category', () => {
    const product = new Product({ name: 'Pen', price: 10 })
    expect(product.validateSync()).toBeUndefined()
  })

  it('fails validation when name is missing', () => {
    const product = new Product({ price: 199 })
    const error = product.validateSync()

    expect(error).toBeDefined()
    expect(error.errors.name.message).toBe('Product name is required')
  })

  it('fails validation when price is negative', () => {
    const product = new Product({ name: 'Mouse', price: -10 })
    const error = product.validateSync()

    expect(error).toBeDefined()
    expect(error.errors.price.message).toBe('Path `price` (-10) is less than minimum allowed value (0).')
  })

  it('fails validation when category is not a valid ObjectId', () => {
    const product = new Product({ name: 'Banana', price: 5, category: 'not-an-id' })
    const error = product.validateSync()

    expect(error).toBeDefined()
    expect(error.errors.category).toBeDefined()
  })
})
