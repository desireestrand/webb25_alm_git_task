const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/app')
const Category = require('../src/models/Category')

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/category_api_test'

describe('Category API', () => {
  let category
  let categoryId

  beforeAll(async () => {
    await mongoose.connect(MONGODB_TEST_URI)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await Category.deleteMany({})
    category = await Category.create({
      name: 'Food',
      description: 'Delicacies from all around the world'
    })
    categoryId = category._id
  })

  it('should return all categories', async () => {
    const response = await request(app).get('/categories')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThanOrEqual(1)
    expect(response.body[0].name).toBe('Food')
  })

  it('should create a new category', async () => {
    await Category.deleteMany({})
    const response = await request(app).post('/categories').send({
      name: 'Toys',
      description: 'Fun for everyone'
    })
    expect(response.status).toBe(201)
    expect(response.body.name).toBe('Toys')
    expect(response.body.description).toBe('Fun for everyone')
  })

  it('should return a 400 error if create payload is missing name', async () => {
    const response = await request(app).post('/categories').send({
      description: 'Missing name'
    })
    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Name is required')
  })

  it('should return a category by id', async () => {
    const response = await request(app).get(`/categories/${categoryId}`)
    expect(response.status).toBe(200)
    expect(response.body._id).toBe(categoryId.toString())
    expect(response.body.name).toBe('Food')
    expect(response.body.description).toBe('Delicacies from all around the world')
  })

  it('should return 400 for invalid category id on GET', async () => {
    const response = await request(app).get('/categories/123')
    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid category ID')
  })

  it('should return a 404 error if the category is not found', async () => {
    const missingId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/categories/${missingId}`)
    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Category not found')
  })

  it('should update a category by id', async () => {
    const response = await request(app).put(`/categories/${categoryId}`).send({
      name: 'Updated Food',
      description: 'New description'
    })
    expect(response.status).toBe(200)
    expect(response.body.name).toBe('Updated Food')
    expect(response.body.description).toBe('New description')
  })

  it('should return 400 when update fails validation', async () => {
    const response = await request(app).put(`/categories/${categoryId}`).send({
      name: ""
    })
    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid category data')
  })

  it('should return 404 when updating a non-existent category', async () => {
    const missingId = new mongoose.Types.ObjectId()
    const response = await request(app).put(`/categories/${missingId}`).send({
      name: 'Cars'
    })
    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Category not found')
  })

  it('should delete a category by id', async () => {
    const response = await request(app).delete(`/categories/${categoryId}`)
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Category deleted')
    const gone = await Category.findById(categoryId)
    expect(gone).toBeNull()
  })

  it('should return 400 for invalid category id on DELETE', async () => {
    const response = await request(app).delete('/categories/not-an-object-id')
    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid category ID')
  })

  it('should return 404 when deleting a non-existent category', async () => {
    const missingId = new mongoose.Types.ObjectId()
    const response = await request(app).delete(`/categories/${missingId}`)
    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Category not found')
  })
})
