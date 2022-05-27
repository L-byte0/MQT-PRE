//Configuracion de rutas del controlador de usuarios
'use strict'
var express = require('express');
var UserController=require('../controllers/user');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');//Objeto de middleware

//Definir las rutas
//Se coloca el middleware a las rutas que podrian requerir autenticacion
api.get('/home', UserController.home);
api.get('/pruebas', md_auth.ensureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);

module.exports=api;