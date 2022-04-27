import GoogleStrategy from "passport-google-oauth20";
import passport from "passport";
import {Users} from "./models/UserModel.js"
const CLIENT_URL = "http://localhost:3000/";

const GOOGLE_CLIENT_ID =
  "985233707598-6ncqot5tq4bkjk5bpcar2oddqf1o8cdo.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = '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';


passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      const res = profile._json;
          Users.findOrCreate({
            where: {
              avatar: res.picture,
              fistName: res.given_name,
              lastName: res.family_name,
              email: res.email,
            },
              defaults:{
                avatar: res.picture,
                fistName: res.given_name,
                lastName: res.family_name,
                email: res.email,
            }
          }).catch(error =>{
            console.log(error);
          });
      done(null, profile);
    }
  )
);

// Setting Id di cookie browser
passport.serializeUser((user, done) => {
  done(null, user);
});
// mendapatkan Id yang ada di cookie browser
passport.deserializeUser((user, done) => {
  done(null, user);
});