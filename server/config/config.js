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

if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/omg_cafe';
}else{
    urlDB = 'mongodb+srv://omg_cafe_user:kKaTfOqAl0wgcXd2@cluster0-lbfun.mongodb.net/omg_cafe'
}

process.env.URL_DB = urlDB;

