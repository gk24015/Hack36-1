const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const passport = require('passport');
const GithubStrategy = require('passport-github');
var server = require('http').createServer(app);
const User = require('./models/user');

app.use(passport.initialize());
app.use(passport.session());
passport.use(new GithubStrategy({
    clientID : "aa3269056a6f67fc8129",
    clientSecret: "f7c8f9e1be99ea02e2e612dc70f7955cafd7bc34",
    callbackURL: "http://localhost:3000/github/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({username: profile.username}, {
            email: profile._json.email ? profile._json.email : profile.username,
            githubAvatar: profile._json.avatar_url,
            name: profile.displayName ? profile.displayName : profile.username,
            bio: profile._json.bio ? profile._json.bio : profile.username,
            twitter: profile.username,
            linkedIn: profile.username,
            other: profile.username,
            profileUrl: profile.profileUrl
        }, function(err, user) {
            console.log(user);
            return cb(err, user);
        })
    }
))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(express.static('public'));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({limit: '10mb', extended:false}));

const mongourl = "mongodb+srv://mellark201:mellark201@codecollab.zucli.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const mongoose = require('mongoose');
mongoose.connect(mongourl, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true});
const db = mongoose.connection
db.on('error', error => console.log(error));
db.once('open', () => {
    console.log('Connected to Mongoose');
})


const indexRouter = require('./routes/index');
const githubRouter = require('./routes/github');

app.use('/', indexRouter);
app.use('/github', githubRouter);

server.listen(process.env.PORT || 3000);