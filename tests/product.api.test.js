const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/app')
const Product = require('../src/models/Product')

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/product_api_test'

describe('Product API', () => {
  let product
  let productId

  beforeAll(async () => {
    await mongoose.connect(MONGODB_TEST_URI)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await Product.deleteMany({})
    product = await Product.create({
      name: 'Keyboard',
      price: 499,
      description: 'Mechanical keyboard'
    })
    productId = product._id
  })

  it('should return all products', async () => {
    const response = await request(app).get('/products')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThanOrEqual(1)
    expect(response.body[0].name).toBe('Keyboard')
  })

  it('should create a new product', async () => {
    await Product.deleteMany({})
    const response = await request(app).post('/products').send({
      name: 'Mouse',
      price: 199,
      description: 'Wireless mouse'
    })
    expect(response.status).toBe(201)
    expect(response.body.name).toBe('Mouse')
    expect(response.body.price).toBe(199)
  })

  it('should return a 400 error if create payload is missing name', async () => {
    const response = await request(app).post('/products').send({
      price: 499,
      description: 'Mechanical keyboard'
    })
    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Name and price are required')
  })

  it('should return a product by id', async () => {
    const response = await request(app).get(`/products/${productId}`)
    expect(response.status).toBe(200)
    expect(response.body._id).toBe(productId.toString())
    expect(response.body.name).toBe('Keyboard')
    expect(response.body.price).toBe(499)
  })

  it('should return 400 for invalid product id on GET', async () => {
    const response = await request(app).get('/products/123')
    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid product ID')
  })

  it('should return a 404 error if the product is not found', async () => {
    const missingId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/products/${missingId}`)
    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Product not found')
  })

  it('should update a product by id', async () => {
    const response = await request(app).put(`/products/${productId}`).send({
      name: 'Gaming keyboard',
      price: 899,
      description: 'RGB'
    })
    expect(response.status).toBe(200)
    expect(response.body.name).toBe('Gaming keyboard')
    expect(response.body.price).toBe(899)
  })

  it('should return 400 when update fails validation', async () => {
    const response = await request(app).put(`/products/${productId}`).send({
      name: 'Keyboard',
      price: 10,
      category: 'food'
    })
    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid product data')
  })

  it('should return 404 when updating a non-existent product', async () => {
    const missingId = new mongoose.Types.ObjectId()
    const response = await request(app).put(`/products/${missingId}`).send({
      name: 'Keyboard',
      price: 499,
      description: 'Mechanical keyboard'
    })
    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Product not found')
  })

  it('should delete a product by id', async () => {
    const response = await request(app).delete(`/products/${productId}`)
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Product deleted')
    const gone = await Product.findById(productId)
    expect(gone).toBeNull()
  })

  it('should return 400 for invalid product id on DELETE', async () => {
    const response = await request(app).delete('/products/not-an-object-id')
    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid product ID')
  })

  it('should return 404 when deleting a non-existent product', async () => {
    const missingId = new mongoose.Types.ObjectId()
    const response = await request(app).delete(`/products/${missingId}`)
    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Product not found')
  })
})
