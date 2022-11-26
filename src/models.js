const mongoose = require('mongoose');

const User = mongoose.model('users', {
    username: String
})
const Exercise = mongoose.model('exercises', new mongoose.Schema({
    user_id: mongoose.ObjectId,
    description: String,
    duration: Number,
    date: String,
    
}, { timestamps: true}))
module.exports = {
    User: User,
    Exercise: Exercise
}