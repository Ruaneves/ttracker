const mongoose = require('mongoose');

const User = mongoose.model('users', {
    username: String
})
const Exercise = mongoose.model('exercises', {
    description: String,
    duration: Number,
    date: Date
})
module.exports = {
    User: User,

}