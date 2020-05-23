var Book = require("../models/books");
var Comment = require("../models/comment");
var middlewareObj = {};

//Book ownership check
middlewareObj.checkBookOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id, function (err, foundBook) {
            if (err) {
                req.flash("error", "Book not found!");
                res.redirect("back");
            } else {
                if (foundBook.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in!");
        res.redirect("back");
    }
}

//Comment ownership check
middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission!");
                    res.redirect("back");
                }
            }
        });
    }
}

//Checking is user logged in
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in!");
    res.redirect("/login");
}


module.exports = middlewareObj;