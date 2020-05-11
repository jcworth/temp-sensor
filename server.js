const dotenv = require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 3000
const mongoose = require('mongoose');
const sensorLib = require('node-dht-sensor');



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
querySensor();


app.listen(port, () => {
    console.log('Connected on port: ' + port);
})

app.get('/', (req, res) => {
    res.send('Hello World')
})