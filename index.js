const express = require('express');
const bp = require('body-parser');
const cors = require('cors');

const mongoose = require('mongoose');
const { User } = require('./src/models');

const app = express();
require('dotenv').config();

mongoose.connect(`mongodb+srv://admin:${process.env.DB_PASS}@projects.4t6epta.mongodb.net/?retryWrites=true&w=majority`, {dbName: "ttracker"});

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) => {
  var q = await User.find();
  console.log(q)
  res.json(q)
})

app.post('/api/users', (req, res) => {
  try {
    var username = req.body.username;
    var user = new User({
      username: req.body.username
    });
    user.save();

    res.json({"_id": user.id, "username": username});
  } catch (err) {
    console.log(err);
    res.json({"username": "A"});

  }
});

app.post('/api/users/:id/exercises', async (req, res) => {
  try {
    var id = req.params.id;
    var description = req.body["description"];
    var duration = req.body["duration"];

    if (typeof id != "string") throw "Invalid ID";
    if (typeof description != "string") throw "Invalid Description";

    if (isNumeric(duration)) throw "Invalid Duration";

    var user = await User.findById(id, (err, docs) => {
      if (err) {
        throw "User Do Not Exists";
      }
      else {
        res.json(docs)
      }
    })
    
    res.json(user)

  } catch (err) {
    res.json({"error": err})
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
