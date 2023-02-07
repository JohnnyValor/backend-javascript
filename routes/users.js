const express = require('express');
var router = express.Router();
const sqlite = require('sqlite3').verbose();
var models = require('../models');
const auth = require('../config/auth');
const passport = require('passport');
const connectEnsure = require('connect-ensure-login');
const posts = require('../models/posts');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.get("/signup", function (req, res, next) {
  res.render('signup')
});

//bcrypt+jwt auth signup
router.post('/signup', function (req, res, next) {
  const hashedPassword = auth.hashPassword(req.body.password);
  models.users
    .findOne({
      where: {
        UserName: req.body.username
      }
    })
    .then(user => {
      if (user) {
        res.send('this user already exists');
      } else {
        models.users
          .create({
            FirstName: req.body.firstName,
            LastName: req.body.lastName,
            Email: req.body.email,
            UserName: req.body.username,
            Password: hashedPassword
          })
          .then(createdUser => {
            const isMatch = createdUser.comparePassword(req.body.password);

            if (isMatch) {
              const userId = createdUser.UserId;
              console.log(userId);
              const token = auth.signUser(createdUser);
              res.cookie('jwt', token);
              res.redirect('profile/' + userId);
            } else {
              console.error('not a match');
            }
          });
      }
    });
});

// jwt auth login
router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  const hashedPassword = auth.hashPassword(req.body.password);
  models.users.findOne({
    where: {
      UserName: req.body.username
    }
  }).then(user => {
    const isMatch = user.comparePassword(req.body.password)

    if (!user) {
      return res.status(401).json({
        message: 'Login Failed'
      });
    }
    if (isMatch) {
      const userId = user.UserId
      const token = auth.signUser(user);
      res.cookie('jwt', token);
      if (user.Admin) {
        res.redirect('admin');
      } else {
        res.redirect('profile/' + userId);
      }
    }
  });
});

// profile login, admin boolean
router.get('/profile/:id', auth.verifyUser, function (req, res, next) {

  if (req.params.id !== String(req.user.UserId)) {
    res.send('You are not authorized to view this profile');
  } else {
    let status;
    if (req.user.Admin) {
      status = 'Admin';
      res.render('Admin');
    } else {
      status = 'Normal user';
      models.posts
        .findAll({
          where: {
            Deleted: false,
            UserId: req.user.UserId
          },
          include: [models.users]
        })
        .then(post => {
          res.render('profile', {
            FirstName: req.user.FirstName,
            LastName: req.user.LastName,
            UserName: req.user.UserName,
            UserId: req.user.UserId,
            status: status,
            posts: post
          });
        });
    }
  }
});

// new post
router.post('/profile', function (req, res, next) {
  models.posts
    .findOrCreate({
      where: {
        PostTitle: req.body.postTitle,
        PostBody: req.body.postBody,
        UserId: req.body.UserId
      }
    })
    .spread(function (result, created) {
      if (created) {
        res.redirect('profile/' + req.body.UserId);
      } else {
        res.send('You already posted this, try again');
      }
    });
});

// specific post
router.get('/posts/:id', function (req, res, next) {
  let postId = parseInt(req.params.id);
  models.posts
    .find({
      where: {
        PostId: postId
      }
    })
    .then(posts => {
      res.render('specificPost', {
        PostTitle: posts.PostTitle,
        PostBody: posts.PostBody,
        PostId: posts.PostId,
        UserId: posts.UserId
      });
    });
});

// user updates post
router.put('/posts/:id', (req, res) => {
  let postId = parseInt(req.params.id);
  models.posts
    .update({
      PostTitle: req.body.postTitle,
      PostBody: req.body.postBody
    }, {
      where: {
        PostId: postId
      }
    })
    .then(result => {
      res.send();
    });
});

// user deletes post
router.delete('/posts/:id/delete', (req, res) => {
  let postId = parseInt(req.params.id);
  models.posts
    .update({
      Deleted: 'true'
    },
      {
        where: {
          postId: postId
        }
      })
    .then(posts => {
      res.send();
    });
});

// admin view
router.get('/admin', function (req, res, next) {
  models.users
    .findAll({
      where: {
        Deleted: false
      }
    })
    .then(usersFound => {
      res.render('admin', {
        users: usersFound
      });
    });
});

// admin edit user
router.get('/editUser/:id', (req, res) => {
  let userId = parseInt(req.params.id);
  models.users
    .find({
      where: {
        UserId: userId,
        Deleted: false
      }
    })
    .then(posts => {
      models.posts
        .findAll({
          where: {
            UserId: userId,
            Deleted: false
          }
        })
        .then(editUser => {
          res.render('editUser', {
            FirstName: posts.FirstName,
            LastName: posts.LastName,
            UserName: posts.UserName,
            UserId: posts.UserId,
            PostId: posts.PostId,
            posts: editUser
          });
        });
    });
});

// admin delete user
router.delete('/editUser/:id/delete', (req, res) => {
  let userId = parseInt(req.params.id);
  models.users
    .update(
      {
        Deleted: 'true'
      },
      {
        where: {
          UserId: userId
        }
      }
    )
    .then(post => {
      models.posts
        .update(
          {
            Deleted: 'true'
          },
          {
            where: {
              UserId: userId
            }
          }
        )
        .then(user => {
          res.redirect('admin');
        });
    });
});

// admin delete post
router.delete('/editUser/:id/delete', (req, res) => {
  let postId = parseInt(req.params.id);
  models.posts
    .update(
      {
        Deleted: 'true'
      },
      {
        where: {
          postId: postId
        }
      }
    )
    .then(posts => {
      res.send();
    });
});


// logout, jwt token made null, route to login page
router.get('/logout', function (req, res) {
  res.cookie('jwt', null);
  res.redirect('/users/login');
});


module.exports = router;
