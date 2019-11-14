const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');
const path = require('path');
const PORT = process.env.PORT || 8888;
const PusherService = require('./services/pusher.service');

const app = express();

const ps = new PusherService();

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
app.get('/message', function (req, res) {
  ps.trigger('automation', 'status', { message: 'You connected mate!' });
  res.status(200).send({ message: 'You connected mate!' });
});
require('./routes')(app);


app.listen(PORT, function () {
  console.log(`Server running on PORT ${PORT}`);
});