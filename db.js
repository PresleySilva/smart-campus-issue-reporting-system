const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "nick@1234",
    database: "smart_campus",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;

// test mysql connection //

async function testConnection() {
    try {
        const connection = await db.getConnection();

        console.log("MySQL connected successfully!");

        connection.release();

    } catch (error) {

        console.error("MySQL connection failed:");
        console.error(error.message);

    }
}

testConnection();
