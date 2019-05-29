const express = require('express');
const fs = require('fs');
const path = require('path');

let { verificaTokenImg } = require('../middlewares/autenticacion');

let app = express();


app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let imagen = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${imagen}`);
    
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        let noImgPath =  path.resolve(__dirname, `../assets/no-image.jpg`);
        res.sendFile(noImgPath);
    }
});

module.exports = app;