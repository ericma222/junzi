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
    res.redirect('/');
    // } else if (req.userType !== 'customer') {
    //   res.redirect('/');
  } else if (req.user.userType === 'cook') {
    next();
  } else {
    res.send('What the fuck');
  }
});


router.get('/cook/:id',function(req,res){
  User.findById(req.params.id, function(error, cook){
    if(error){
      res.send(error)
    }
    else {
      res.render('cook',{
        cook:cook
      });
    }
  });
});

router.get('/restaurants/new', function(req, res) {
  res.render('newRestaurant')
})

var addressData
router.post('/restaurants/new', function(req, res) {
  var longitude;
  var latitude;
  // Geocoding - uncomment these lines when the README prompts you to!
  geocoder.geocode(req.body.address, function(err, data) {
    console.log(err);
    addressData = data[0]
    latitude = addressData.latitude
    longitude = addressData.longitude
    new Restaurant({
      Name: req.body.name,
      Category: req.body.category,
      Latitude: latitude,
      Longitude: longitude,
      Price: req.body.relativePrice,
      isOpen: false,
      // OpenTime: req.body.oTime,
      // ClosingTime: req.body.cTime
    }).save(function(err) {
      if (err) {
        console.log("error:", err)
      } else {
        console.log('Restaurant saved!')
        res.redirect('/restaurants')
      }
    })

  });
});


module.exports = router;
