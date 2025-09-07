//back-end/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Auth0Strategy = require('passport-auth0');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

// JWT Strategy
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        },
        async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id);
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await User.findOne({
                    $or: [
                        { googleId: profile.id },
                        { email: profile.emails[0].value }
                    ]
                });

                if (user) {
                    // If user exists but doesn't have googleId, add it
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                    emailVerified: true
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Auth0 OIDC Strategy
passport.use(
    new Auth0Strategy(
        {
            domain: process.env.AUTH0_DOMAIN,
            clientID: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            callbackURL: process.env.AUTH0_CALLBACK_URL || '/api/auth/auth0/callback'
        },
        async (accessToken, refreshToken, extraParams, profile, done) => {
            try {
                let user = await User.findOne({
                    $or: [
                        { auth0Id: profile.id },
                        { email: profile.emails?.[0]?.value }
                    ]
                });

                if (user) {
                    if (!user.auth0Id) {
                        user.auth0Id = profile.id;
                        await user.save();
                    }
                    return done(null, user);
                }

                user = await User.create({
                    auth0Id: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value,
                    avatar: profile.photos?.[0]?.value,
                    emailVerified: profile.email_verified || true
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;