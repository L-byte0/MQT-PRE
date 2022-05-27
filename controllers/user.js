'use strict'
//Importa el modelo de usuario, la variable inicia con letra mayuscula para indicar que es un modelo
var User = require('../models/user');
var bcrypt = require('bcrypt');//Paquete para cifrar contraseña
var jwt = require('../services/jwt');

//Funcion de las rutas
function home(req, res) {
    res.status(200).send({
        message: 'Prueba de servidor node.js'
    });
}

function pruebas(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'Prueba de servidor node.js'
    });
}

//----------------Metodo para registrar usuario en db
function saveUser(req, res) {
    var params = req.body;//Todos los parametros que lleguen por post se guardan en la variable
    var user = new User();
    if (params.name && params.surname && params.nick && params.email && params.password) {
        //Si todos los datos son true guarda los parametros
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;
        /*Controlar ususaior duplicados
        Las condiciones incluidas en el array son las que se van a guardar
        Busca todos los registros en la bd, si alguna de las dos se cumple regresa los datos*/
        User.find({
            $or: [{ email: user.email.toLowerCase() },
            { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {//Comprueba si el error llega
            if (err) return res.status(500).send({ message: 'Error en la peticion de usuarios' });
            //Si existen los usuarios
            //SI se cumplen las condiciones ni siquiera pasa al bcrypt
            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'Usuario que intenta registrar ya existe' })
            } else {
                //Cifra contraseña y guarda los datos
                bcrypt.hash(params.password, 10, function (err, hash) {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar usuario' });
                        //Comprueba si el userStore existe
                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'No se ha registrado el usuario' })
                        }
                    });
                });
            }
        })
    } else {//Si no llegan correctamente
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}
//----------------------Fin metodo de registrar

//----------------------Funcion de login
function loginUser(req, res) {
    var params = req.body;
    var email = params.email; //Variable para email
    var password = params.password;//Variable para password
    //Buscar si hay conincidencia en la BD
    User.findOne({ email: email }, (err, user) => {
        //Si se produce un error
        if (err) return res.status(200).send({ message: 'error en la peticion' });
        //Si todo esta bien
        if (user) {
            //Compara la contraseña de la bd con bcrypt
            bcrypt.compare(password, user.password, (err, check) => {
                //Si todo va bien
                if (check) {
                    //Devuelve datos del usuario
                    //Comprobar si se llega parametro por post
                    if (params.gettoken) {
                        //Generar y Devolver token
                        //En el token se guardan los datos del usuario, clave secreta, fecha de creacion token etc.
                        //Todo encriptado y se puede hacer proceso inverso a devolver datos
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //Devolver tados del usuario
                        user.password = undefined;//Elimina la propiedad del objeto (No muestra la contraseña)
                        return res.status(200).send({ user });
                    }
                } else {
                    return res.status(404).send({ message: 'Usuario no se pudo identificar' });
                }
            });
        } else {
            //Si el usuario no existe
            return res.status(404).send({ message: 'Usuario no se puede identificar' });
        }
    });
}
//----------------------Fin de funcion de login

//----------------------Conseguir datos del usuario
function getUser(req,res){
    var userId = req.params.id;
    User.findById(userId, (err,user) => {

      if(err) return res.status(500).send({message: 'Error en la peticion'});

      if(!user) return res.status(404).send({message: 'usuario no existe'});
      
      return res.status(200).send({user});
    });
}

//----------------------Fin de conseguir los datos del usuario



//Exporta las funciones de los modelos para que puedan ser utilizadas fuera del archivo
module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser
}
