const express = require('express');

let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

/* 
mostrar todas las categorias
*/
app.get('/categoria', (req, res) => {
    Categoria.find({})
        .populate('usuario', 'nombre email')
        .sort('descripcion')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count((err, conteo) => {
                res.json({
                    ok: true,
                    conteo,
                    categorias
                });
            });
        });
});

/* 
mostrar una categoria por id
*/
app.get('/categoria/:id', (req, res) => {

    let id = req.params.id;

    Categoria.findById({ _id: id }).exec((err, categoriaBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err: {
                    message: 'No se encuentra la categoria'
                }
            });
        }

        if (!categoriaBD) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBD
        })
    });
});

/* 
crear nueva categoria
*/
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaBD) {
            res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            categoria: categoriaBD
        })
    })
});

/* 

*/
app.put('/categoria/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaBD) {
            res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria: categoriaBD
        })
    });
});

/* 

*/
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    Categoria.findOneAndRemove(id, (err, categoriaBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaBD) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            })
        }

        res.json({
            ok: true,
            message: 'La categoria se ha eliminado'
        })
    });
});

module.exports = app;