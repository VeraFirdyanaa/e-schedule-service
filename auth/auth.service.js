const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config')

exports.hashPassword = function (password, cb) {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      cb(err);
    } else {
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) {
          cb(err);
        } else {
          cb(null, hash);
        }
      });
    }
  })
}

exports.isAuthenticated = function (req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    jwt.verify(token, config.SECRET_KEY, function (err, decoded) {
      if (err) return res.status(401).json({
        err: err,
        message: 'Token is Not Valid!'
      });

      delete decoded.password;
      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
}