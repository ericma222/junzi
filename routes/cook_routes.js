var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Follow = models.Follow;
var Restaurant = models.Restaurant;
var Review = models.Review;
var bodyParser = require('body-parser')

router.use(bodyParser({
  extended: true
}))
// Geocoding - uncomment these lines when the README prompts you to!
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder({
  provider: "google",
  apiKey: 'AIzaSyCxFx9q1ZnpKc-GFPEQIINS9Og8t8kNKMk',
  httpAdapter: "https",
  formatter: null
});

// ANOTHER WALL - anything routes below this are DOUBLE protected!
router.use(function(req, res, next) {
  if (req.user.userType === 'customer') {
    console.log('You are a logged in customer, but you are trying to access routes that customers don\'t have access to!');
    res.redirect('/');
  } else if (req.user.userType === 'cook') {
    next();
  } else {
    res.send('What the fuck');
  }
});


router.get('/cook',function(req,res){
  User.findById(req.user.id, function(error, cook){
    if(error){
      res.send(error)
    }
    else {
      res.render('customerList',{
        cook:cook
      });
    }
  });
});

router.get('/cook/restaurant', function(req, res) {
  res.render('postDish')
})


var addressData
router.post('/cook/restaurant', function(req, res) {
  var longitude;
  var latitude;
  // Geocoding - uncomment these lines when the README prompts you to!
  geocoder.geocode('San Francisco', function(err, data) {
    console.log(err);
    addressData = data[0]
    latitude = addressData.latitude
    longitude = addressData.longitude
    console.log("*********req.user", req.user);
    //req.user.populate('Restaurant', function(err, user) {
    var restaurantId = req.user.restaurant;
    Restaurant.findById(restaurantId, function(err, restaurant){
      if (err) {res.send(err)}
      else {
        //update
        restaurant.Name = req.body.name;
        restaurant.Category = req.body.category;
        restaurant.latitude = latitude;
        restaurant.longitude = longitude;
        restaurant.Price = req.body.price;
        restaurant.save(function(err) {
          if (err) {res.send(err)}
          else {res.redirect('/cook')}
        });
      }
    });
  });
});


module.exports = router;
