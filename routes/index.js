var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Follow = models.Follow;
var Restaurant = models.Restaurant;
var Review = models.Review;
var bodyParser = require('body-parser')

router.use(bodyParser({extended: true}))
// Geocoding - uncomment these lines when the README prompts you to!
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder({
  provider: "google",
  apiKey: 'AIzaSyCxFx9q1ZnpKc-GFPEQIINS9Og8t8kNKMk',
  httpAdapter: "https",
  formatter: null
});

// THE WALL - anything routes below this are protected!
router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});
router.get('/profile', function(req, res) {
  User.find()
  .exec(function(err, users) {
    if (err) {
      console.log(err)
    }
    else {
      console.log(users[0].email)
      res.render('profiles', {
        users: users
      })
    }
  })
})
router.get('/users/:id', function(req, res) {
  var id = req.params.id
  User.findById(id, function(err, user) {
    if (err) {
      console.log("error:", err)
    }
    else {
      user.getFollows(user._id, function(err, following, followers) {
        if (err) {
          console.log(err)
        }
        else {
          console.log('canoli')
          user.getReviews(id, function(err, reviews){
            if (err) {
              console.log('Error: Reviews not found')
            }
            else {
              res.render('singleProfile', {
                user: user,
                following: following,
                followers: followers,
                reviews: reviews
                })
            }
          })
        }
      })
    }
  })
})

router.post("/follow/:id", function(req, res) {
  var id = req.params.id
  // console.log('hello')
  // res.send(req.user)
  req.user.follow(id)
  res.redirect('/users/'+id)
})

router.post("/unfollow/:id", function(req, res) {
  var id = req.params.id
  // console.log('hello')
  // res.send(req.user)
  req.user.unfollow(id)
  res.redirect('/users/'+id)
})

router.get('/restaurants', function(req, res) {
  Restaurant.find()
  .exec(function(err, restaurants) {
      res.render('restaurants', {
        restaurants: restaurants
      })
  })
})


router.get('/restaurants/new', function(req, res) {
  res.render('newRestaurant')
})

var addressData
router.post('/restaurants/new', function(req, res, next) {
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
      OpenTime: req.body.oTime,
      ClosingTime: req.body.cTime
    }).save(function(err) {
      if (err) {
        console.log("error:", err)
      }
      else {
        console.log('Restaurant saved!')
        res.redirect('/restaurants')
      }
    })

  });
});

router.get('/restaurants/:id/review/new', function(req, res) {
  var id = req.params.id
  Restaurant.findById(id, function(err, restaurant) {
    if (err) {
      console.log("error: ", err)
    }
    else {
      console.log('Got the review')
      res.render('newReview', {
        restaurant: restaurant
      })
    }
  })
})

router.post('/restaurants/:id/review', function(req, res, next) {
  var id = req.params.id
  new Review({
    Content: req.body.content,
    Stars: req.body.stars,
    RestaurantID: id,
    UserID:  req.user.id
  }).save(function(err) {
    if (err) {
      console.log("error:", err)
    }
    else {
      console.log('Review saved! Here is the RestaurantID:'+id)
      res.redirect('/restaurants/' + id)
    }
  })
});

router.get('/restaurants/:id', function(req, res) {
  var id = req.params.id
  Restaurant.findById(id, function(err, restaurant) {
    if (err) {
      console.log("error: ", err)
    }
    else {
      console.log('yay')
      restaurant.getReviews(id, function(err, reviews){
        if (err) {
          console.log('error:' + err)
        }
        else {
          console.log('this is the returned' +reviews)
          res.render('singleRestaurant', {
          restaurant: restaurant,
          reviews: reviews
          })
        }
      })
    }
  })
})




module.exports = router;
