// Add Passport-related auth routes here.

var express = require('express');
var router = express.Router();
var models = require('../models/models');


module.exports = function(passport) {



  router.get('/signup', function(req, res) {
    res.render('signup');
  });

  // POST registration page
  var validateReq = function(userData) {
    return (userData.password === userData.passwordRepeat);
  };

  router.post('/signup', function(req, res) {
    if (!validateReq(req.body)) {
      return res.render('signup', {
        error: "Passwords don't match."
      });
    }
    var u = new models.User({
      // Note: Calling the email form field 'username' here is intentional,
      //    passport is expecting a form field specifically named 'username'.
      //    There is a way to change the name it expects, but this is fine.
      displayName: req.body.displayName,
      userType: req.body.userType,
      username: req.body.username,
      password: req.body.password
    });
    u.save(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).redirect('/register');
        return;
      }
      console.log(user);
      if (user.userType === 'customer') {
        res.redirect('/login');
      } else if (user.userType === 'cook'){
        var restaurant = new models.Restaurant({
          // we can add restaurat information in here later
        });
        restaurant.save(function(err, restaurant) {
          if (err) {
            console.log(err);
            res.status(500).redirect('/register');
          } else {
            user.restaurant = restaurant._id;
            console.log('about to save the user again')
            user.save(function(error){
              if(error){
                console.log(err);
                res.status(500).redirect('/register');
              }
              else {
                res.redirect('/login')
              }
            });
          }
        });
      } else {
        res.send('what the fuck');
      }
    });
  });

  // GET Login page
  router.get('/login', function(req, res) {
    res.render('login');
  });

  // POST Login page
  router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
  });

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  return router;
};
