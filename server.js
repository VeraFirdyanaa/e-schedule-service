const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');
const path = require('path');
const PORT = process.env.PORT || 8888;

const app = express();

mongoose.connect(config.DB_URL);
mongoose.connection.on('connected', function () {
  console.log('Database Connected!');
});
mongoose.connection.on('error', function (err) {
  console.log('Error to Connect Database', err);
});

app.use(express.static(path.join(__dirname, 'build')));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('./routes')(app);

app.listen(PORT, function () {
  console.log(`Server running on PORT ${PORT}`);
});