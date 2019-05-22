const express = require('express');

let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

app.get('/productos', verificaToken, (req, res) => {

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 0;

    Producto.find({})
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.count((err, conteo) => {
                res.json({
                    ok: true,
                    conteo,
                    productos: productosDB
                });
            });
        });
});

/* 
producto por id
*/
app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById({ _id: id })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoBD) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err: {
                        message: 'No se encuentra el producto'
                    }
                });
            }

            if (!productoBD) {
                res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBD
            })
        });

});

/* 
Buscar productos
*/
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productosBD) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    err: {
                        message: 'No se encuentra el producto'
                    }
                });
            }

            res.json({
                ok: true,
                productos: productosBD
            });
        });
});

/* 
crear producto 
*/

app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBD) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoBD
        });
    });
});

/* 
actualizar producto
*/
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err: {
                    message: 'no se encontró el producto a actualizar'
                }
            })
        }

        if (!productoBD) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encuentra el producto para actualizar'
                }
            })
        }

        res.json({
            ok: true,
            producto: productoBD
        })
    });
});

app.delete('/productos/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    Producto.findOneAndRemove(id, (err, productoBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoBD) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            })
        }

        res.json({
            ok: true,
            message: 'El producto se ha eliminado'
        })
    });

});
module.exports = app;