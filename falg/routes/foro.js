var express = require('express');
var router = express.Router();
var tablas = require("../models");
const posts = require('../models/posts');
var Users = tablas.Users;
var Posts = tablas.Posts;
var Comments = tablas.Comments;
var Userscomments = tablas.Userscomments
var Usersposts = tablas.Usersposts
let views = 0;
var userbannedlike = []

async function getposts(){
  //req.app.locals.posts = 0; como mierda hago la variable global intente aca pero no arranca bien
  var posts = await Posts.findAll({
    nest: true,
    raw: true,
    include: [
      {
          model: Users,
          as: "user",
      }
  ]
  });
  //req.app.locals.posts = posts
  return posts;
}

async function getcomments(){
  var comments = await Comments.findAll({
    nest: true,
    raw: true,
    include: [
      {
          model: Users,
          as: "user",
      }
  ]
  });
  return comments;
}

router.get('/', async function(req, res, next) {
  var posts = await getposts();
  //console.log(posts);
  res.send({posts});
});

router.get('/comments', async function(req, res, next) {
  var comments = await getcomments();
  res.send({comments});
});

router.post('/publicaciones', async function(req, res, next) {
  var newpost = req.body;
  var posts = await getposts();
  var comments = await getcomments();
  var post = await Posts.create({
    title: newpost.title,
    description: newpost.description,
    iduser: newpost.iduser,
    filter: newpost.filter
  });
  var comentario = comments.filter(comentario => {
    return(comentario.idpost == newpost.id);
  });
  var lengthcomments = comentario.length
  console.log("SOS VOS MAMITA LIND?")
  console.log(lengthcomments)
  await Usersposts.create({
    postid: post.id, 
    userid: newpost.iduser
  });
  res.send({
    status : true,
    response : lengthcomments
  });
});

router.get('/goToPage/:idPage', async function(req, res, next) {
    var id = req.params.idPage
    res.render('foro', { id })
  });

router.get('/irpublicacion/:idpublicacion', async function(req, res, next) {
  var posts = await getposts();
  var comments = await getcomments();
  var idpublicacion = req.params.idpublicacion;
  var publicacion = posts.find(publicacion => {
    return(publicacion.id == idpublicacion);
  });
  var comentario = comments.filter(comentario => {
    return(comentario.idpost == idpublicacion);
  });
  var lengthcomments = comentario.length
  res.render('publicacionusuario', {publicacion, comentario, lengthcomments})
  views++;// Si se entra a una misma publicacion se sigue sumando los views, no quiero hacer que cuando publicacion que se bloquee o algo asi
  //no hay una mejor forma mas linda sin tener qe hacerlo con el ++ y el bloqueo ese?
  //alta paja hacerlo ahora chapotear despues
});

router.get('/filter/:filter', async function(req, res, next) {
  var posts = await getposts();
  var filter = req.params.filter;
  var publications = posts.filter(publication => {
    return(publication.filter == filter);
  });
  res.render('foro', {publications, filter})
});

router.post('/subircomentario', async function(req, res, next) {
  var newcomment = req.body;
  var comment = await Comments.create({ 
    nest: true,
    raw: true,
    idpost: newcomment.idpost,
    comment: newcomment.comment
  });
  await Userscomments.create({
    commentid: comment.id, 
    userid: newcomment.iduser
  });
  res.send({
    status : true
  });
});

router.get('/addlikepost/:like/:iduser', async function(req, res, next) {
  var idpost = req.params.like
  var iduser = req.params.iduser
  var posts = await getposts();
  var like = posts[idpost - 1].likes;
  console.log(iduser)
  console.log("holaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasdasdasdasdasdasdasd")
  console.log(userbannedlike)
  console.log(userbannedlike[0])
  console.log(like)
  var userIndex = userbannedlike.indexOf("1")
  if(userIndex+1 == iduser){
    console.log("LA RE CONCHA DE TU MADRE PELOTUDO DE MIERDA HIJO DE REMIL PUTA")
    await Posts.update({ likes: like - 1 }, {
      where: {
        id: idpost
      }
    });
    userbannedlike.slice(userIndex,1)
    //userbannedlike.splice(iduser)
    res.redirect(req.get('referer'));
  }
  else{
    userbannedlike.push(iduser)
    await Posts.update({ likes: like + 1 }, {
      where: {
        id: idpost
      }
    });
    res.redirect(req.get('referer'));
  }
});

router.get('/adddislikepost/:dislike', async function(req, res, next) {
  var idpost = req.params.dislike
  var posts = await getposts();
  var dislike = posts[idpost - 1].dislikes;
  await Posts.update({ dislikes: dislike + 1 }, {
    where: {
      id: idpost
    }
  });
  res.redirect(req.get('referer'));
});

router.get('/addlikecomment/:likecomment', async function(req, res, next) {
  var idcomment = req.params.likecomment
  var comments = await getcomments();
  var likecomment = comments[idcomment - 1].likes;
  await Comments.update({ likes: likecomment + 1 }, {
    where: {
      id: idcomment
    }
  });
  res.redirect(req.get('referer'));
});

router.get('/adddislikecomment/:dislikecomment', async function(req, res, next) {
  var idcomment = req.params.dislikecomment
  var comments = await getcomments();
  var dislikecomment = comments[idcomment - 1].dislikes;
  await Comments.update({ dislikes: dislikecomment + 1 }, {
    where: {
      id: idcomment
    }
  });
  res.redirect(req.get('referer'));
});

router.get('/foro/:idPage/:all', async function(req, res, next) {
  var filter = req.params.all
  console.log("OSO YOHGUI?")
  console.log(filter)
  const publications = await getposts();
  res.render('foro', {publications, filter})
});

  router.get('/crearpublicacion', async function(req, res, next) {
    await countPosts()
  res.render('crearpublicacion')
});

module.exports = router;

async function countPosts(){
  const count = await Posts.count();
} 