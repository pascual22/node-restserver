const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options
app.use(fileUpload({ useTempFiles: true }));


app.put('/upload/:tipo/:id', function (req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No archivos cargados.'
            }
        });
    }

    //validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'las tipos permitidos son ' + tiposValidos.join(', ')
            }
        });
    }

    let archivo = req.files.archivo;
    let datosArchivo = archivo.name.split('.');
    let extension = datosArchivo[datosArchivo.length - 1];

    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'las extensiones validas son ' + extensionesValidas.join(', ')
            }
        });
    }

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;


    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, function (err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (tipo === 'usuarios') {
            imagenUsuario(id, nombreArchivo, res);
        } else {
            imagenProducto(id, nombreArchivo, res)
        }

    });
});

function imagenUsuario(id, nombreArchivo, res) {
    Usuario.findById(id, (err, usuarioBD) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario no existe'
                }
            });
        }

        borraArchivo(usuarioBD.img, 'usuarios');

        usuarioBD.img = nombreArchivo;

        usuarioBD.save((err, usuarioActualizado) => {
            res.json({
                ok: true,
                usuario: usuarioActualizado,
                img: nombreArchivo
            })
        })

    });
}

function imagenProducto(id, nombreArchivo, res) {
    Producto.findById(id, (err, productoBD) => {

        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBD) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'producto no existe'
                }
            });
        }

        borraArchivo(productoBD.img, 'productos');

        productoBD.img = nombreArchivo;

        productoBD.save((err, productoActualizado) => {
            res.json({
                ok: true,
                producto: productoActualizado,
                img: nombreArchivo
            })
        })

    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg)
    }
}
module.exports = app;