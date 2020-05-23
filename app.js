process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var methodOverride = require("method-override");
var flash = require("connect-flash");


LocalStrategy = require("passport-local");
Book = require("./models/books.js");
Comment = require("./models/comment");
User = require("./models/user");

var commentRoutes = require("./routes/comments");
var bookRoutes = require("./routes/books");
var authRoutes = require("./routes/index");

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
const databaseUri = "mongodb://localhost:27017/book_pals";

mongoose.connect(databaseUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Database connected!"))
    .catch(err => console.log("Database connection error: $(err.message"));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "Citaj i samo citaj!",
    resave: false,
    saveUninitialized: false
}));

app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(authRoutes);
app.use("/books", bookRoutes);
app.use("/books/:id/comments", commentRoutes);

app.get("*", function (req, res) {
    res.status(404).render("404", {
        url: req.url
    });
});

app.listen(3000, function () {
    console.log("BookPals server has started!");
});