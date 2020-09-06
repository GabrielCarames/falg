var express = require('express');
var router = express.Router();
var forolista = require('../public/html/foro/foro.json');
var tablas = require("../models");
var Posts = tablas.Posts;

/*router.get('/', function(req, res, next) {
   res.send(forolista);
});

/*router.post('/publicaciones', function(req, res, next) {
  console.log(req.body);
  forolista[0].publicaciones.push(req.body);
  res.send({
    status : true,
  });
});*/




async function getposts(){
  //req.app.locals.posts = 0; como mierda hago la variable global intente aca pero no arranca bien
  var posts = await Posts.findAll({
    nest: true,
    raw: true
  });
  //req.app.locals.posts = posts
  return posts;
}

router.get('/', async function(req, res, next) {
  var posts = await getposts();
  //console.log(posts);
  res.send({posts});
});

router.post('/publicaciones', async function(req, res, next) {
  var newpost = req.body;
  var posts = await getposts();
  await Posts.create({
    title: newpost.title,
    description: newpost.description,
    iduser: newpost.iduser
  });
  res.send({
    status : true,
    response : posts
  });
});





router.get('/irpublicacion/:idpublicacion', async function(req, res, next) {
  var posts = await getposts();
  var idpublicacion = req.params.idpublicacion;
  var publicacion = posts.find(publicacion => {
    return(publicacion.id == idpublicacion);
  });
  var comentario = posts.find(comentario => {
    return(comentario.id == idpublicacion);
  });
  console.log(publicacion)
  res.render('publicacionusuario', { publicacion: publicacion, comentario: comentario})
});

router.post('/subircomentario', function(req, res, next) {
  var newcomment = req.body;
  await Usuarios.create({ 
    idpost: newcomment.idpost,
    iduser: newcomment.iduser,
    comment: nuevacuenta.comment
  });
  res.send({
    status : true
  });
});

router.get('/foro', function(req, res, next) {
  res.render('foro')
});

router.get('/crearpublicacion', function(req, res, next) {
  res.render('crearpublicacion')
});

module.exports = router;