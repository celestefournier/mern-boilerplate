const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const mongodb = require('./config/config.js')
const port = process.env.PORT || 4000
const app = express()

// Connect to MongoDB
mongoose.Promise = global.Promise
mongoose.connect(mongodb.db_host, { useMongoClient: true })

// Config body to encode/decode JSON
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Call route
var routes = require('./app/routes/module-routes')
routes(app)

app.listen(port)