var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Follow = models.Follow;
var Restaurant = models.Restaurant;
var Review = models.Review;

router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

router.get('/', function(req, res, next) {
    res.render('home');
});

// Users

router.get('/users', function(req, res, next) {
  User.find(function(err, users) {
    if (err) return next(err);
    res.render('users', {
      users: users
    });
  });
});

router.get('/profile', function(req, res) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    User.getFollowers(user.id, function(err, followers, following) {
      if (err) return next(err);
      res.render('profile', {
        user: user,
        following: following,
        followers: followers
      });
    });
  });
});

router.get('/profile/:id', function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if (err) return next(err);
    User.getFollowers(user.id, function(err, followers, following) {
      if (err) return next(err);
      res.render('profile', {
        user: user,
        following: following,
        followers: followers
      });
    });
  });
});


router.post('/follow/:id', function(req, res, next) {
  User.follow(req.user.id, req.params.id, function(err) {
    if (err) return next(err);
    res.redirect('/profile');
    // TODO: Confirm following
  });
});
router.post('/unfollow/:id', function(req, res, next) {
  User.unfollow(req.user.id, req.params.id, function(err) {
    if (err) return next(err);
    res.redirect('/profile');
  });
});


// TODO: Add /unfollow/:id

// Restarants

router.get('/restaurants/new', function(req, res, next) {
  res.render('editRestaurant');
});

router.post('/restaurants/new', function(req, res, next) {
  var restaurant = new Restaurant({
    name: req.body.name,
    price: parseInt(req.body.price),
    category: req.body.category,
    openHoursEST: {
      openTime: parseInt(req.body.openTime),
      closingTime: parseInt(req.body.closingTime)
    }
  });
  restaurant.save(function(err) {
    if (err) return next(err);
    res.redirect('/restaurants');
  });
});

// Calculates the straight-line distance (pythagorean distance)
var distanceFrom = function(pointA, pointB) {
  var sum;
  var partial;
  for (var key in pointA) {
    partial = pointA[key] - pointB[key];
    partial *= partial;
    sum += partial;
  }
  return Math.sqrt(sum);
};

router.get('/restaurants', function(req, res, next) {
  var ihp = {
    "latitude": 39.9553176,
    "longitude": -75.197408
  };
  var now = Math.ceil(new Date().getHours() + new Date().getMinutes() / 60);
  var q = Restaurant.find();
  if (req.params.price) {
    q = q.where('price').gte(req.params.price);
  }
  if (req.params.open !== false) {
    q = q.where('openHoursEST.openTime').lt(now).where('openHoursEST.closingTime').gt(now);
  } else {
    q = q.where('openHoursEST.openTime').gt(now).where('openHoursEST.closingTime').lt(now);
  }
  if (req.params.category) {
    q = q.where('category').equals(req.params.category);
  }
  q.exec(function(err, restaurants) {
    if (err) return next(err);
    //  console.log(restaurants)
    if (req.params.maxDist !== undefined) {
      restaurants = restaurants.filter(function(r) {
        return (distanceFrom(ihp, r.location) < req.params.maxDist);
      });
    }
    res.render('restaurants', {
      restaurants: restaurants
    });
  });
});

router.get('/restaurants/:id', function(req, res) {
  Restaurant.findById(req.params.id, function(err, restaurant) {
    if (err) return next(err);
    restaurant.getReviews(req.params.id, function(err, reviews) {
      if (err) return next(err);
      restaurant.stars(function(err, stars) {
        restaurant.stars=stars;
        res.render('restaurant', {
          restaurant:restaurant,
          reviews:reviews
        });
      });
    });
  });
});

router.post('/restaurants/:id', function(req, res, next) {
  var review = new Review({
    stars: req.body.stars,
    content: req.body.content,
    restaurant: req.params.id,
    user:  req.user.id
  });
  review.save(function(err) {
    if (err) return next(err);
    res.redirect('/restaurants/'+req.params.id);
  })
});

module.exports = router;
