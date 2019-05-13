/* 
Puerto
*/

process.env.PORT = process.env.PORT || 3000;

/* 
ENTORNO
*/

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/* 
Base de datos
*/

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/omg_cafe';
} else {
    urlDB = process.env.MONGO_DB;
}

process.env.URL_DB = urlDB;

/* 
Vencimiento del token
60 segundos
60 minutos
24 horas
30 dias
*/
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

/*
SEED semilla de autenticacion
*/
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

/*
google client ID
 */
process.env.CLIENT_ID = process.env.CLIENT_ID || '757336159702-u2ceilsdqf2d6rc1adhrpobsr9n39q0l.apps.googleusercontent.com';