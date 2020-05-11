const dotenv = require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 3000
const sensorLib = require('node-dht-sensor');

app.use(express.static('public'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlEncoded({extended: false}));

// Sensor reading every two seconds
function querySensor() {
    sensorLib.read(22, 4, (err, temperature, humidity) => {
        if (err) {
            console.warn(err);
        } else {
            console.log(Date() + `\nTemperature: ${temperature}°C, Humidity: ${humidity}%`);
            setTimeout(querySensor, 2000);
        }
    })
}

// Mongoose Database connection
const mongoose = require('mongoose');
const url = process.env.MONGO_DB
mongoose
    .connect(url, {useNewUrlParser: true})
    .then('open', () => {
        console.log('MongoDB connected on: ' + url);
    })
    .catch('error', (err) => {
        console.log('Error: ' + err);
    });
// Mongoose model creation

const reading = new mongoose.model('Reading', {
    temperature: String,
    humidity: String
})

// Server connection and routing
app.listen(port, () => {
    console.log('Connected on port: ' + port);
})

app.get('/', (req, res) => {
    res.send('Hello World')
})