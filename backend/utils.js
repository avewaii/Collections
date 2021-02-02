const mysql = require("mysql");
const moment = require('moment');

const connection = mysql.createConnection(
    process.env.CLEARDB_DATABASE_URL ? process.env.CLEARDB_DATABASE_URL : {
        host: "localhost",
        user: "root",
        database: "users",
        password: "12345678"
    })

connection.connect()

module.exports = {
    connection,
    initDb() {
        connection.query("CREATE TABLE IF NOT EXISTS `users` (\n" +
            "  `id` int NOT NULL AUTO_INCREMENT,\n" +
            "  `name` varchar(20) DEFAULT NULL,\n" +
            "  `email` varchar(50) NOT NULL,\n" +
            "  `password` varchar(64) NOT NULL,\n" +
            "  `last_login` datetime DEFAULT NULL,\n" +
            "  `blocked` tinyint(1) DEFAULT '0',\n" +
            "  `admin` tinyint(1) DEFAULT '0',\n" +
            "  PRIMARY KEY (`id`),\n" +
            "  UNIQUE KEY `id_UNIQUE` (`id`)\n" +
            ")")
        connection.query("CREATE TABLE IF NOT EXISTS `sessions` (\n" +
            "  `sessionID` varchar(64) NOT NULL,\n" +
            "  `userID` int DEFAULT NULL,\n" +
            "  `lastLogin` datetime DEFAULT NULL,\n" +
            "  PRIMARY KEY (`sessionID`)\n" +
            ")")
        connection.query("CREATE TABLE IF NOT EXISTS `collections` (\n" +
            "  `id` int NOT NULL AUTO_INCREMENT,\n" +
            "  `name` varchar(45) DEFAULT NULL,\n" +
            "  `description` mediumtext,\n" +
            "  `theme` enum('books','alcohol','pictures','flowers') DEFAULT NULL,\n" +
            "  `user` int NOT NULL,\n" +
            "  PRIMARY KEY (`id`)\n" +
            ")")
    },
    authRequired(req, res, next) {
        let session = req.header('Authorization');
        console.log("TEST", session)
        if (!session) {
            res.status(401).send("Please, log in")
        } else {
            connection.query(`
                SELECT sessionID FROM sessions
                WHERE sessionID = ? `, session, (err, result) => {
                    if (err || !result || !result.length) {
                        res.status(401).send("Please, log in")
                    } else {
                        connection.query(`
                            UPDATE sessions
                            SET lastLogin = ?
                            WHERE sessionID = ?
                            `, [moment().format('YYYY-MM-DD HH:mm:ss'), session], (err, result) => {
                                if (!err && result) {
                                    next();
                                    return;
                                }

                                res.status(401).send("Please, log in")
                        })
                    }
                }
            )
        }
    },
    adminRequired(req, res, next) {
        let session = req.header("Authorization")
        connection.query(`
            SELECT u.id FROM sessions AS s 
            INNER JOIN users AS u 
            WHERE 
                u.id = s.userID 
            AND
                u.admin = 1
            AND 
                s.sessionID = ?
            ;`, [session], (err, result) => {

            if (!err && result.length) {
                next()
                return
            }

            res.status(403).send("Please contact administrator")

        })
    }
}