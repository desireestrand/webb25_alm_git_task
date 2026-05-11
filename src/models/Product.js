const mongoose = require('mongoose')
const ProductPriceHistory = require('./ProductPriceHistory')
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    price: {
      type: Number,
      min: 0,
      required: [true, 'Product price is required']
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false
    }
  },
  {
    timestamps: true
  }
)

productSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('price')) {
    await ProductPriceHistory.create({ product: this._id, price: this.price, date: Date.now() })
  }
  next()
})

module.exports = mongoose.model('Product', productSchema)
