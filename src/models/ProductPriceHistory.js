const mongoose = require('mongoose')

const productPriceHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: Number,
    required: true
    },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('ProductPriceHistory', productPriceHistorySchema)