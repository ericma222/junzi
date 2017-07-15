var mongoose = require('mongoose');

// Step 0: Remember to add your MongoDB information in one of the following ways!
var connect = process.env.MONGODB_URI || require('./connect');
mongoose.connect(connect);

var userSchema = mongoose.Schema({
  displayName: String,
  userType: String,
  username: String,
  password: String,
  location: String,
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  reviews: []
});

userSchema.methods.getFollows = function(id, callback){
  Follow.find({uid1: id})
    .populate('uid2')
    .exec(function(err, following){
      if (err) {
        console.log("err", err)
      }
      else {
        Follow.find({uid2: id})
        .populate('uid1')
        .exec(function(err, followers){
          console.log('Following:', following)
          console.log('Followers:', followers)
          callback(err, following, followers)
        })
      }
    })
}

userSchema.methods.getReviews = function(id, callback) {
  Review.find({UserID: id})
    .populate('RestaurantID')
    .exec(function(err, reviews){
      if (err) {
        console.log("err", err)
      }
      else {
        console.log("These are reviews:" + reviews)
        callback(err, reviews)
        }
      })
    }

userSchema.methods.follow = function (idToFollow){
    var fromID = this._id
    console.log('im inside follow')
    Follow.find({
      uid1: fromID,
      uid2: idToFollow})
      .exec(function(err, followers) {
        if (err) {
          console.log('error:', err)
        }
        else if (followers.length === 0) {
          new Follow({
            uid1: fromID,
            uid2: idToFollow
          }).save(function(err) {
            if (err) {
              console.log("error:", err)
            }
            else {
              console.log('Follow status saved')
            }
          })
        }
        else {
          console.log('You already follow this user')
        }
      })
}

userSchema.methods.unfollow = function (idToUnfollow){
  Follow.remove({
    uid1: this._id,
    uid2: idToUnfollow})
    .exec(function(err, followers) {
      if (err) {
        console.log('error:', err)
      }
      else if (followers.length === 0) {
        console.log('You dont follow this user')
      }
      else {
        console.log('Unfollowed')
      }
    })
}
userSchema.methods.isFollowing = function(idToFollow) {
  Follow.find({
    uid1: this._id,
    uid2: idToFollow})
    .exec(function(err, followers) {
      if (err) {
        console.log('error:', err)
      }
      else if (followers.length === 0) {
        return false
      }
      else {
        return true
      }
    })
}

var FollowsSchema = mongoose.Schema({
    uid1: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    uid2: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
});

var reviewSchema = mongoose.Schema({
    Content: String,
    Stars: Number,
    RestaurantID: {
      type: mongoose.Schema.ObjectId,
      ref: 'Restaurant'
    },
    UserID: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
});


var restaurantSchema = mongoose.Schema({
  Name: String,
  Category: String,
  Latitude: Number,
  Longitude: Number,
  Price: Number,
  Spots: Number,
  IsOpen: Boolean,
  ClosingTime: Date,
  Food: {
    description: String,
    photoUrl: String
  },
  Reviews:[
    {
      rating: Number,
      comment: String
    }
  ],
  ContactInfo: Number,
});

restaurantSchema.methods.getReviews = function (restaurantId, callback){
  console.log(restaurantId)
  Review.find({RestaurantID: restaurantId})
    .populate('UserID')
    .exec(function(err, reviews){
      if (err) {
        console.log("err", err)
      }
      else {
        console.log("These are reviews:" + reviews)
        callback(err, reviews)
        }
      })
    }



//restaurantSchema.methods.stars = function(callback){
//
//}

var User = mongoose.model('User', userSchema);
var Restaurant = mongoose.model('Restaurant', restaurantSchema);
var Review = mongoose.model('Review', reviewSchema);
var Follow = mongoose.model('Follow', FollowsSchema);




module.exports = {
  User: User,
  Restaurant: Restaurant,
  Review: Review,
  Follow: Follow
};
