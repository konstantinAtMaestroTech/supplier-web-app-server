const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

let router = express.Router();

router.use(cors());

dataBaseName = "MAESTRO_SUPPLY"
user = "konstantin"
password = "321553R2d2c3po!"

async function fetchSupplier(tableName) {

    let connection = mysql.createConnection({
        host: "16.171.137.163",
        user: user,
        password: password,
        database: dataBaseName
    });

    return new Promise((resolve, reject) => {
        connection.connect(function(err) {
            if (err) reject(err);
            console.log("Connected!");
            connection.query(`SELECT * FROM ${tableName}`, (err, result) => {
                if (err) reject(err);
                resolve(result);
                connection.end();
            });
        });
    });
};

async function fetchProjects(tableName, selectedSupplier) {

    let connection = mysql.createConnection({
        host: "16.171.137.163",
        user: user,
        password: password,
        database: dataBaseName
    });

    return new Promise((resolve, reject) => {
        connection.connect(function(err) {
            if (err) reject(err);
            console.log("Connected!");
            connection.query(`SELECT Projects.ProjectName, Projects.URN FROM ${tableName} INNER JOIN Project_Producers ON Projects.ProjectID = Project_Producers.ProjectID INNER JOIN Producers ON Project_Producers.ProducerID = Producers.ProducerID WHERE Producers.ProducerName = ?`, [selectedSupplier], (err, result) => {
                if (err) reject(err);
                console.log('Query results: ', result);
                resolve(result);
                connection.end();
            });
        });
    });
};

async function fetchElements(tableName, selectedSupplier, selectedProject) {

    let connection = mysql.createConnection({
        host: "16.171.137.163",
        user: user,
        password: password,
        database: dataBaseName
    });

    return new Promise((resolve, reject) => {
        connection.connect(function(err) {
            if (err) reject(err);
            console.log("Connected!");
            console.log('NEW Selected project: ', selectedProject);
    
            // Query to get manufacturer_id and project_id
    
            connection.query(`SELECT (SELECT ProjectID FROM Projects WHERE ProjectName = ?) AS ProjectID, (SELECT ProducerID FROM Producers WHERE ProducerName = ?) AS ProducerID;`, [selectedProject, selectedSupplier], (err, results) => {
                if (err) reject(err);
                console.log('Results: ', results);
                let manufacturer_id = results[0].ProducerID;
                let project_id = results[0].ProjectID;
    
                console.log('Manufacturer ID: ', manufacturer_id);
                console.log('Project ID: ', project_id);
    
                // Query the main table
                connection.query(`SELECT * FROM ?? WHERE Manufacturer_id = ? AND Project_id = ?`, [tableName, manufacturer_id, project_id], (err, result) => {
                    if (err) reject(err);
                    console.log('Query results: ', result);
                    resolve(result);
                    connection.end();
                });
            });
        });
    });
};

router.get('/producers', async (req, res, next) => {
    let tableName = "Producers";
    const suppliers = await fetchSupplier(tableName);
    res.json({data: suppliers});
});

router.get('/projects', async (req, res, next) => {
    let tableName = "Projects";
    console.log('Header', req.headers['selectedsupplier']);
    const projects = await fetchProjects(tableName, req.headers['selectedsupplier']);
    res.json({data: projects});
});

router.get('/elements', async (req, res, next) => {
    let tableName = "Elements";
    const elements = await fetchElements(tableName, req.headers['selectedsupplier'], req.headers['selectedproject']);
    res.json({data: elements});
});

module.exports = router;