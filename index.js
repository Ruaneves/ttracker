const express = require('express');
const bp = require('body-parser');
const cors = require('cors');

const mongoose = require('mongoose');
const { User, Exercise } = require('./src/models');

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
  let q = await User.find();
  res.json(q)
})

app.post('/api/users', async (req, res) => {
  try {
    let username = req.body.username || 'Anonymous';

    let q = await User.findOne({username: username}, "username")
    
    if(q) {return res.json(q);} 
    else {

      let user = new User({
        username: username
      });

      await user.save();

      return res.json({"_id": user.id, "username": username});
    }

  } catch (err) {
    if(typeof err != 'string') return res.json({"error": "Internal Server Error"});
    
    res.json({error: err});
  }
});

app.post('/api/users/:id/exercises', async (req, res) => {
  try {
    let id = req.params.id;
    let description = req.body["description"];
    let duration = Number(req.body["duration"]);
    let date = req.body["date"] ? new Date(req.body["date"]) : new Date();

    if (typeof id != "string") throw "Invalid ID";
    if (typeof description != "string" || description === "") throw "Invalid Description";
    if (!duration) throw "Invalid Duration";
    if (!(date instanceof Date && !isNaN(date))) throw "Invalid Date Format";
    date.setHours(0,0,0,0);

    let q = await User.findOne({_id: id}, "username")
    .catch(() => {
      throw "User Do Not Exists"
    })
    
    let exercise = new Exercise({
      "user_id": q.id,
      "date": date,
      "duration": duration,
      "description": description
    })

    exercise.save();

    return res.json({
      "_id" : q.id,
      "username": q.username,
      "date": date.toDateString(),
      "duration": duration,
      "description": description
    });


  } catch (err) {
    if(typeof err != 'string') return res.json({"error": "Internal Server Error"});
    return res.json({"error": err});
  }
})

app.get('/api/users/:id/logs', async (req, res) => {
  try {
    let id = req.params.id;
    let from = req.query.from ? new Date(req.query.from) : new Date(); 
    let to = req.query.to ? new Date(req.query.to) : new Date(); 
    let limit = req.query.limit || 10;

    if (!(from instanceof Date && !isNaN(from)) || !(to instanceof Date && !isNaN(to))) throw "Invalid Date Format";
    from.setHours(0,0,0,0);
    to.setHours(0,0,0,0);
    
    let q = await User.findOne({_id: id}).catch(() => {throw "User Do Not Exists"});
    
    console.log(from);
    console.log(to);

    let q2 = await Exercise.find({user_id: id, date:{$gte: from.toISOString(), $lte: to.toISOString()}},"-_id description duration date").limit(limit)
    .then((doc) => {
      console.log("then");
      let filter = doc.map((x) => {
        return {
          description: x.description,
          duration: x.duration,
          date: new Date(x.date).toDateString()
        };
      })
      return filter;
    })
    .catch((err) => {
      console.log("erro");
      console.log(err)
      return [];
    });

    console.log(q2)

    return res.json({
      "_id": id,
      "username": q.username,
      "count": q2.length,
      "log": q2
    });
    
  } catch (err) {
    console.log(err)
    if(typeof err != 'string') return res.json({"error": "Internal Server Error"});
    return res.json({error: err});
  }

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
