const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "asd798852!",
    database: "ws_reservation"
});

db.connect((err) => {
    if (err) {
        console.error("db연결실패", err);
        return;
    }
    console.log("db연결성공")
});

module.exports = db;