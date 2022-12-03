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

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, "BODY => ", req.body, "QUERY =>", req.query);
  next()
});

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

    let userQuery = await User.findOne({_id: id}, "username")
    .catch(() => {
      throw "User Do Not Exists"
    })
    
    let exercise = new Exercise({
      "user_id": userQuery.id,
      "date": date,
      "duration": duration,
      "description": description
    })

    exercise.save();

    return res.json({
      "_id" : userQuery.id,
      "username": userQuery.username,
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
    let from = req.query.from ? new Date(req.query.from) : undefined;
    let to = req.query.to ? new Date(req.query.to) : undefined;
    let limit = req.query.limit ? Number(req.query.limit) : 10;

    if ((from && !(from instanceof Date && !isNaN(from))) || (to && !(to instanceof Date && !isNaN(to) ) )) throw "Invalid Date Format";
    
    let userQuery = await User.findOne({_id: id}).catch(() => {throw "User Do Not Exists"});

    let dateFilter = {};
    if (from) {
      from.setHours(0,0,0,0);
      dateFilter.$gte = from.toISOString()
    };
    if (to) {
      to.setHours(0,0,0,0);
      dateFilter.$lte = to.toISOString();
    }
    let exerciseQuery = await Exercise.find({user_id: id, date: dateFilter},"-_id description duration date")
    .then((doc) => {
      return doc.map((x) => {
        return {
          description: x.description,
          duration: x.duration,
          date: new Date(x.date).toDateString()
        };
      });

    })
    .catch((err) => {return [];});

    exerciseQuery = exerciseQuery.slice(0, limit);

    return res.json({
      "_id": id,
      "username": userQuery.username,
      "count": exerciseQuery.length,
      "log": exerciseQuery
    });
    
  } catch (err) {
    if(typeof err != 'string') return res.json({"error": "Internal Server Error"});
    return res.json({error: err});
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
