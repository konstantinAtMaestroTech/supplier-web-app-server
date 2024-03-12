const express = require('express');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');

let router = express.Router();

function deleteFilesInDirectory(directory) {
    fs.readdir(directory, (err, files) => {
      if (err) throw err;
  
      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
      }
    });
}

function processJSON(bodyJSON, headerJSON) {
    for (const key in bodyJSON) {
        let data = [];
        let name = key;
        console.log('BodyJSON[key]: ', bodyJSON[key]);
        for (const each of bodyJSON[key]) {
            data.push(each.UniqueID);
        };
        let combinedData = data.join('_');
        console.log('Combined data: ', combinedData);
        let url = `http://localhost:8080/#${headerJSON.urn}?uniqueID=${combinedData}`;
        let qr_svg = qr.image(url, { type: 'png' });
        qr_svg.pipe(fs.createWriteStream(`./files/${headerJSON.projectname}/AssemblyFiles/QRCodes/${name}.png`))
    };
}

router.post('/', async (req, res, next) => {

    let bodyJSON = req.body;
    let headerJSON = req.headers;
    console.log( 'The server has received qrcode generation request. Here are the headers :', headerJSON );

    deleteFilesInDirectory(`./files/${headerJSON.projectname}/AssemblyFiles/QRCodes`); // tenporary measure to delete all files in the directory. Definately ruins the folder in case of a partial upload

    processJSON(bodyJSON, headerJSON);

    res.status(200).send('Data processed successfully');
});


module.exports = router;