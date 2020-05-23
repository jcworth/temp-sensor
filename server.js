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

// Socket
const io = require('socket.io')(http);

function sensorQuery() {
  sensorLib.read(22, 4, (err, temperature, humidity) => {
    if (err) {
      console.log(err);
      writeErr(err)
    } else {
      let newReading = new Reading({
          temperature,
          humidity
        });
      return newReading;
    };
  });
};

async function sensorProcess() {
  const newRead = await sensorQuery();
  newRead.save((err) => {
    console.log(err);
    writeErr(err);
  });
  io.emit('newReading', newRead);
};

// Sensor reading that saves to Mongo & emits to socket
// const sensorLib = require('node-dht-sensor');
// function querySensor() {
//     sensorLib.read(22, 4, (err, temperature, humidity) => {
//         if (err) {
//             console.log(err);
//             writeErr(err);
//         } else {
//             let newReading = new Reading({
//                 temperature,
//                 humidity
//             });
//             newReading.save((err) => {
//                 if (err) {
//                     console.log(err);
//                     writeErr(err);
//                 }
//             });
//             io.emit('newReading', newReading);
//             // console.log(Date() + `\nTemperature: ${temperature.toFixed(2)}°C\nHumidity: ${humidity.toFixed(2)}%`);
//         }
//     })
// };

// Server connection and routing
http.listen(port, () => {
    console.log('Connected on port: ' + port);
});

app.get('/reading', (req, res) => {
    Reading.find({}, {}, { sort: { 'created_at_UTC' : -1 }}).limit(20).exec((err, reading) => {
        res.send(reading);
    })
});


setInterval(querySensor, 5000)
