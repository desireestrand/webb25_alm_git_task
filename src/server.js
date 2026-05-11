const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')

dotenv.config()

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/product_api'
const DEBUG = ['1', 'true', 'yes'].includes(String(process.env.DEBUG).toLowerCase())

mongoose.set('debug', DEBUG)

if (!DEBUG) {
  console.log = () => {}
  console.warn = () => {}
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.info('Server running on PORT', PORT)
      console.info('MongoDB connected to', MONGODB_URI)
      console.info('Debug mode is', DEBUG ? 'enabled' : 'disabled')
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })
