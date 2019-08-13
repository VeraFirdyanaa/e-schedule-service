const _ = require('lodash');
const Q = require('q');
const User = require('./user.model');
const Student = require('../student/student.model');
const jwt = require('jsonwebtoken');
const config = require('../../config');

exports.index = function (req, res) {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  let skip = (page - 1) * limit;
  let query = {};

  Q.all([
    User.count(query).exec(),
    User.find(query).skip(skip).limit(limit).exec()
  ])
    .spread(function (total, users) {
      return res.status(200).json({ total, users });
    })
    .catch(function (err) {
      if (err) return res.status(500).send(err);
    });
};

exports.search = function (req, res) {
  let limit = Number(req.query.limit) || 25;
  let query = { name: { $regex: req.query.name, $options: 'i' } };

  User.find(query).limit(limit).exec(function (err, users) {
    if (err) return res.status(500).send(err);

    return res.status(200).json(users);
  });
};

exports.show = function (req, res) {
  User.findOne({ _id: req.params.id }).populate('classes').exec(function (err, user) {
    if (err) return res.status(500).send(err);

    if (!user) return res.status(404).json({ message: 'User Not Found!' });
    return res.status(200).json(user);
  });
};

exports.create = function (req, res) {
  let body = req.body;
  User.create(body, function (err, user) {
    if (err) return res.status(500).send(err);

    return res.status(201).json(user);
  });
};

exports.update = function (req, res) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) return res.status(500).send(500);
    if (!user) return res.status(404).json({ message: 'User not Found!' });

    let updated = _.merge(user, req.body);
    updated.save(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(200).json(user);
    });
  });
};

exports.destroy = function (req, res) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) return res.status(500).send(err);
    if (!user) return res.status(404).json({ message: 'User Not Found!' });

    user.remove(function (err) {
      if (err) return res.status(500).send(500);

      return res.status(204);
    });
  });
};

exports.authenticate = function (req, res) {
  User.findOne({
    email: req.body.email
  })
    .then(user => {
      if (user) {
        // if (bcrypt.compareSync(req.body.password, user.password)) {
        if (req.body.password === user.password) {
          const payload = {
            _id: user._id,
            email: user.email,
            role: user.role
          }
          let token = jwt.sign(payload, config.SECRET_KEY, {
            expiresIn: 1440
          });
          switch (user.role) {
            case 'dosen':
              return res.send({
                token: token,
                user: payload
              });
              break;
            case 'mahasiswa':
              Student.findOne({ user: user._id }).exec(function (err, student) {
                if (err) return res.status(500).send(err);

                if (!student) return res.status(400).json({ message: "Student Data Not Found!" });
                payload.student = student;
                return res.send({
                  token: token,
                  user: payload
                });
              });
              break;
            default:
              res.send({
                token: token,
                user: payload
              });
          }
        } else {
          res.json({
            error: 'Password is invalid'
          })
        }
      } else {
        res.json({
          error: 'User does not exist'
        })
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
}