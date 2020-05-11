const dotenv = require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 3000
const mongoose = require('mongoose');

app.listen(port, () => {
    console.log('Connected on port: ' + port);
})

app.get('/', (req, res) => {
    res.send('Hello World')
})