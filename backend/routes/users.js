const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const crypto = require('crypto');
const moment = require('moment');
const utils = require('../utils')

const connection = utils.connection;


router.get('/register', function (req, res, next) {
    connection.query('SELECT * FROM users', function (err, result) {

        res.send({...result})

        console.log(err);
        console.log(result); // собственно данные
    });
})


router.post('/register', function (req, res, next) {

    let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('hex');
    let data =  [req.body.email, passwordHash, moment().format('YYYY-MM-DD HH:mm:ss')];

    connection.query('SELECT id FROM users WHERE email = ?', [req.body.email], function (err, results) {

        //если вернуло => значит такая запись есть
        if (err || (results && results.length)) {
            res.status(403).send("User has already registered");
        } else {
            // не вернуло => свободен, продолжить рагистрацию
            // выполнить регистрацию, запомнить id пользователя
            connection.query('INSERT INTO users(email, password, last_login) VALUES(?, ?, ?) ', data, function (err, results) {
                // создать новую сессию этому пользователю
                let sessionId = crypto.randomBytes(32).toString('hex');

                connection.query("INSERT INTO sessions(sessionID, userID, lastLogin) VALUES(?, ?, ?);", [sessionId, results.insertId, moment().format('YYYY-MM-DD HH:mm:ss')], function (err, results, fields) {
                    res.json({"session": sessionId})
                })
            })
        }
    })
})

router.post('/deleteUser', function (req, res, next) {

    let UsersId = req.body;

    connection.query('DELETE FROM users WHERE id IN (?) ', [UsersId], function (err, results, fields) {
        !err ? res.json(results) : res.json(err);
    })

})

module.exports = router;