const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String, 
            required: true, 
            unique: true,
            lowercase: true, 
        }, 
        password: {
            type: String, 
            required: true, 
            minLength: 6, 
            trim: true, 
        },

    })

    UserSchema.pre('save', async function() {
        if (!this.isModified('password')) {
            return
        }
        try {
            const salt = await bcrypt.genSalt(10)
            this.password = await bcrypt.hash(this.password, salt)
        } catch (err) {
            return next(err)
        }
    })

module.exports = mongoose.model('User', UserSchema)
