const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const crypto = require('crypto');
const moment = require('moment');
const utils = require('../utils')

const connection = utils.connection;

router.post('/login', function (req, res, next) {

    let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('hex');

    connection.query('SELECT id FROM users WHERE email = ? AND password = ?', [req.body.email, passwordHash], function (err, results) {

        if (err || !results || !results.length) {
            res.status(401).send("Bad credentials")
            return
        }

        let userId = results[0].id;

        let sessionId = crypto.randomBytes(32).toString('hex');

        connection.query("INSERT INTO sessions(sessionID, userID, lastLogin) VALUES(?, ?, ?);", [sessionId, userId, moment().format('YYYY-MM-DD HH:mm:ss')], function (err, results, fields) {
            res.json({"session": sessionId})
            return sessionId;
            })
        })

})


module.exports = router;