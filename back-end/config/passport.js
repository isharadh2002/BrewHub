//back-end/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const OidcStrategy = require('passport-openidconnect').Strategy;
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
            callbackURL: '/api/auth/google/callback'
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

// Auth0 OIDC Strategy (replaces Facebook)
passport.use('auth0',
    new OidcStrategy(
        {
            issuer: `https://${process.env.AUTH0_DOMAIN}`,
            authorizationURL: `https://${process.env.AUTH0_DOMAIN}/authorize`,
            tokenURL: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
            userInfoURL: `https://${process.env.AUTH0_DOMAIN}/userinfo`,
            clientID: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            callbackURL: '/api/auth/auth0/callback',
            scope: 'openid profile email'
        },
        async (issuer, profile, done) => {
            try {
                // Check if user exists by Auth0 sub (subject) or email
                let user = await User.findOne({
                    $or: [
                        { auth0Id: profile.id },
                        { email: profile.emails[0].value }
                    ]
                });

                if (user) {
                    // If user exists but doesn't have auth0Id, add it
                    if (!user.auth0Id) {
                        user.auth0Id = profile.id;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    auth0Id: profile.id,
                    name: profile.displayName || profile.name || 'Auth0 User',
                    email: profile.emails[0].value,
                    avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                    emailVerified: true
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