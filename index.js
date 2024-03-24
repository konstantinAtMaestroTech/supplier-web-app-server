const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors({
    origin: ['http://13.53.130.105:3000', 'http://13.53.130.105:3001', 'http://13.53.130.105', 'https://supplier-web-app.maestrotest.info'],
    credentials: true,
}));

app.get('/files/:selectedProject/AssemblyFiles/QRCodes/:AssemblyID', (req, res) => {
    console.log('Request for QR code received', req.params.selectedProject, req.params.AssemblyID);
    const { selectedProject, AssemblyID } = req.params;
    res.sendFile(path.join(__dirname, `./files/${selectedProject}/AssemblyFiles/QRCodes/${AssemblyID}`));
});

app.listen(3001, () => {console.log('Server is running on port 3001')});
app.use(express.json());
app.use('/getData', require('./routes/queryfromSQL.js')); // query from mysql
app.use('/uploadJSON', require('./routes/elementsRevittoSQL.js')); // upload files from revit to mysql
app.use('/qrCode', require('./routes/qrCode.js')); // generate qr code
