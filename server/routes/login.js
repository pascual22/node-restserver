const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const Usuario = require('../models/usuario');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({
        email: body.email
    }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario o contraseña incorrecto'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario o contraseña incorrecto'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioBD
        }, process.env.SEED, { expiresIn: 60 * 60 * 24 * 30 });

        res.json({
            ok: true,
            token,
            usuarioBD
        });

    })
});


// CONFIGURACIONES DE GOOGLE

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }

}

app.post('/google', async (req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED, { expiresIn: 60 * 60 * 24 * 30 });

                return res.json({
                    ok: true,
                    usuario: usuarioBD,
                    token
                });
            }
        } else {
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.password = ':)SDFSFSD546';

            usuario.save((err, usuarioBD) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED, { expiresIn: 60 * 60 * 24 * 30 });
    
                return res.json({
                    ok: true,
                    usuario: usuarioBD,
                    token
                });
            });


        }
    })

});

module.exports = app;