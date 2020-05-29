const dotenv = require('dotenv').config()
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Error logging
const fs = require('fs');
function writeErr(error) {
    fs.appendFile('./error_log.txt', `\n${Date()}\n${error}`, (err) => {
        if (err) console.log(err);
    })
};

// Mongoose Database connection
const mongoose = require('mongoose');
const url = process.env.MONGO_DB
mongoose
  .connect(url, {useNewUrlParser: true})
  .then(() => {
      console.log('MongoDB connected on: ' + url);
  })
  .catch('error', (err) => {
      console.log('Error: ' + err);
  });

// Mongoose model creation
const Reading = new mongoose.model('Reading', {
    created_at_UTC: {type: Date, default: Date.now},
    temperature: String,
    humidity: String
});

// Socket & DHT Sensor
const io = require('socket.io')(http);
const sensorLib = require('node-dht-sensor');

// Function to read from the DHT sensor
function sensorQuery() {
  return new Promise((resolve, reject) => {
    sensorLib.read(22, 4, (err, temperature, humidity) => {
      if (err) {
        writeErr(err);
        reject('Reading failed');
      } else {
        let newReading = new Reading({
          temperature,
          humidity
        });
        resolve(newReading);
      };
    });
  });
};

// Async function attempts to make call the sensor function and log to the database
async function sensorProcess() {
  try {
    let newRead = await sensorQuery();
    newRead.save((err) => {
      if (err) {
        writeErr(err);
      };
    });
    io.emit('newReading', newRead);
  }
  catch(err) {
    console.log(err);
    writeErr(err);
  }
};

// Server connection and routing
http.listen(port, () => {
    console.log('Connected on port: ' + port);
});

app.get('/reading', (req, res) => {
    Reading.find({}, {}, { sort: { 'created_at_UTC' : -1 }}).limit(20).exec((err, reading) => {
        res.send(reading);
    })
});

setInterval(sensorProcess, 5000)
