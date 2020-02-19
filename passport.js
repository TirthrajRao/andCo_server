const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const Usermodel = require('./models/user.model');
const jwt = require('jsonwebtoken');

var GoogleStrategy = require('passport-google-oauth2').Strategy;


passport.use(new GoogleStrategy({
  clientID: '265692874005-9q5lu0gc23u3los6fisqmvgiuo7bp99s.apps.googleusercontent.com',
  clientSecret: '2ckYdBjJDXqtbmCkjCCPvhZa0',
  callbackURL: "http://localhost:3000",
  passReqToCallback: true

},
  function (request, accessToken, refreshToken, profile, done) {
    console.log("Inside the function--------->>>>>>");
    console.log('profile', profile);
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
  }
));


passport.use('facebookToken', new FacebookTokenStrategy({
  clientID: '350939005533804',
  clientSecret: 'fba52c673960a676b41090914cebd910',
}, function (accessToken, refreshToken, profile, done) {
  console.log('profile', profile._json);
  console.log('accessToken', accessToken);
  console.log('refreshToken', refreshToken);

  facebook = {
    firstName: profile._json.first_name,
    lastName: profile._json.last_name,
    email: profile._json.email,
    socialId: profile._json.id
  }

  console.log("FAcebook Object", facebook.fbId);



  Usermodel.findOne({
    socialId: facebook.socialId
  }, function (err, user) {

    console.log("In function-------->>>>>");
    if (err) {

      console.log("In err part===========>>>", profile._json.id);
      // We create new Account in Facebook Object

      const payload = { facebook };
      var token = jwt.sign(payload, 'asoebi');
      const tokenData = {
        accessToken: token
      }

      UserModel.create(facebook, (useerr, userres) => {
        if (useerr) {
          console.log('usererror: ', useerr);
          return ({ status: 500, message: 'Internal Server Error' });
        } else {
          return ({ status: 200, message: 'Successfully login', data: tokenData })
        }
      })
    }
    else {
      console.log("In else");
      const payload = { user };
      var token = jwt.sign(payload, 'asoebi');
      const tokenData = {
        accessToken: token
      }

      console.log("Access token", tokenData);
      return done(token);
    }
  })
}
));
