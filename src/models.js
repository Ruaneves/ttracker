const mongoose = require('mongoose');

const User = mongoose.model('users', {
    username: String
})
const Exercise = mongoose.model('exercises', {
    user_id: mongoose.ObjectId,
    description: String,
    duration: Number,
    date: Date
})
module.exports = {
    User: User,
    Exercise: Exercise
}