const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt-nodejs');
const salt = bcrypt.genSaltSync(10);
const _ = require('underscore');

const app = express();

app.get('/', function (req, res) {
    res.json('Hello World')
});

app.get('/usuario', function (req, res) {

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 0;

    Usuario.find({estado: true}, 'nombre email google estado role')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({estado: true}, (err, conteo) => {

                res.json({
                    ok: true,
                    conteo,
                    usuarios
                });
            });

        });

});

app.post('/usuario', function (req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, salt),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id', function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioBD) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuarioBD
        });
    });

});

app.delete('/usuario/:id', function (req, res) {

    let id = req.params.id;


    // Usuario.findByIdAndRemove(id, (err, usuarioBD) => {
    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioBD) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuarioBD
        });
    });

});

module.exports = app;