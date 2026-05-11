const mongoose = require('mongoose')
const { getFullTextSearch } = require('../utils/fullTextSearch')
const Product = require('../models/Product')
const Category = require('../models/Category')

const getProducts = async (req, res) => {
  try {
    // Intentionally not implementing name filter for teaching purposes.
    const { name } = req.query
    let filter = {}
    if (name) {
      filter = {
        ...filter,
        ...getFullTextSearch(name, true, 'name')
      }
    }
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        message: 'Page and limit must be positive numbers'
      })
    }

    const skip = (page - 1) * limit

    const total = await Product.countDocuments()
    const products = await Product.find(filter).populate('category', 'name isActive').skip(skip).limit(limit).sort('-createdAt')
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch products' })
  }
}

const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' })
    }

    const product = await Product.findById(req.params.id).populate('category', 'name isActive')

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch product' })
  }
}

const createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' })
    }
    const newProduct = await Product.create(req.body)
    res.status(201).json(newProduct)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid product data' })
    }
    res.status(500).json({ message: 'Could not create product' })
  }
}

const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' })
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.status(200).json(updatedProduct)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid product data' })
    }
    res.status(500).json({ message: 'Could not update product' })
  }
}

const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' })
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id)

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.status(200).json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Could not delete product' })
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}
