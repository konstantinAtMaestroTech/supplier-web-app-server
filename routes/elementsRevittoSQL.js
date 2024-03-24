const express = require('express');
const mysql = require('mysql2');

let router = express.Router();

async function processJSON(connection, bodyJSON, headerJSON) {
    return new Promise((resolve, reject) => {
        connection.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            // Delete all rows in the table
            let deleteSql = `TRUNCATE TABLE ${headerJSON.table}`; // Temporary measure to delete all rows in the table. Definitely ruins the table in case of a partial upload
            connection.query(deleteSql, function (err, result) {
                if (err) throw err;
                console.log("All rows deleted");

                // Insert new rows
                for (const key in bodyJSON) {
                    let instanceJSON = bodyJSON[key];
                    let keys = Object.keys(instanceJSON);
                    let values = Object.values(instanceJSON);
                    let sql = `INSERT INTO ${headerJSON.table} (${keys.join(', ')}) VALUES (${values.map(value => `'${value}'`).join(', ')}) ON DUPLICATE KEY UPDATE ${keys.map(key => `${key} = VALUES(${key})`).join(', ')}`;
                    connection.query(sql, function (err, result) {
                        if (err) throw err;
                        resolve();
                    });
                };
            });
        });
    }).then(() => {
        connection.end();
        console.log('Processing JSON finished');
    }).catch((error) => {
        console.log('Error processing JSON');
        console.log(error);
    });
};

router.post('/', async (req, res, next) => {

    bodyJSON = req.body;
    console.log('The serever has received SQL table generation request', req.body);

    let connection = mysql.createConnection({
        host: "13.60.18.89",
        user: req.headers.user,
        password: req.headers.password,
        database: req.headers.database
    });

    await processJSON(connection, req.body, req.headers);

    res.status(200).send('Data processed successfully');
});



module.exports = router;    