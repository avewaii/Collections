const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const crypto = require('crypto');
const moment = require('moment');
const utils = require('../utils')

const connection = utils.connection;

router.get('/collections', utils.authRequired, function (req, res, next) {
    connection.query("SELECT userID FROM sessions WHERE sessionID = ?", [req.header("Authorization")], (e, r) => {
        let uid = r[0]['userID']
        connection.query('SELECT * FROM collections WHERE user = ?', [uid], (err, result) => {
            res.send({...result})

            console.log(err);
        });
    })

})

router.post('/collections', utils.authRequired, function (req, res, next) {

    connection.query("SELECT userID FROM sessions WHERE sessionID = ?", [req.header("Authorization")], (e, r) => {
        let uid = r[0]['userID']
        let data = [req.body.name, req.body.description, uid];
        connection.query('INSERT INTO collections (name, description, user) VALUES(?, ?, ?) ', data, function (err, results, fields) {
            !err ? res.json(results) : res.json(err);
        })
    })
})


router.post('/deleteCollection', utils.authRequired, function (req, res, next) {

    let collectionId = Object.keys(req.body);
    connection.query("SELECT userID FROM sessions WHERE sessionID = ?", [req.header("Authorization")], (e, r) => {
        let uid = r[0]['userID']
        connection.query('DELETE FROM collections WHERE id IN (?) and user = ? ', [collectionId, uid], function (err, results, fields) {
            !err ? res.json(results) : res.json(err);
        })
    })

})

module.exports = router;