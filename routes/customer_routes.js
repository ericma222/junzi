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

// THE WALL - anything routes below this are protected!
router.use(function(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
});

// GET registration page
router.get('/', function(req, res) {
  if (req.user.userType === 'customer') {
    console.log('theusertype is a customer')
    res.redirect('/restaurants')
  } else if (req.user.userType === 'cook') {
    res.redirect(`/cook`)
  } else {
    res.send('what the fuck')
  }
})

router.get('/restaurants', function(req, res) {
  Restaurant.find()
    .exec(function(err, restaurants) {
      res.render('map', {
        restaurants: restaurants
      })
    })
})

router.get('/restaurants/:id', function(req, res) {
  var id = req.params.id
  Restaurant.findById(id, function(err, restaurant) {
    if (err) {
      console.log("error: ", err)
    } else {
      console.log('yay')
      restaurant.getReviews(id, function(err, reviews) {
        if (err) {
          console.log('error:' + err)
        } else {
          console.log('this is the returned' + reviews)
          // res.render('singleRestaurant', {
          //   restaurant: restaurant,
          //   reviews: reviews
          // })
          res.render('detailInfo', {
            restaurant: restaurant,
            reviews: reviews
          })
        }
      })
    }
  })
})


router.post('/restaurants/:id/review', function(req, res) {
  var id = req.params.id
  new Review({
    Content: req.body.content,
    Stars: req.body.stars,
    RestaurantID: id,
    UserID: req.user.id
  }).save(function(err) {
    if (err) {
      console.log("error:", err)
    } else {
      console.log('Review saved! Here is the RestaurantID:' + id)
      res.redirect('/restaurants/' + id)
    }
  })
});



router.get('/restaurants/:id/review/new', function(req, res) {
  var id = req.params.id
  Restaurant.findById(id, function(err, restaurant) {
    if (err) {
      console.log("error: ", err)
    } else {
      console.log('Got the review')
      res.render('newReview', {
        restaurant: restaurant
      })
    }
  })
})



module.exports = router;
