var express = require("express");
var router = express.Router({ mergeParams: true });
var Book = require("../models/books");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//NEW Form
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Book.findById(req.params.id, function (err, book) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { book: book });
        }
    });
});

//POST Comment
router.post("/", middleware.isLoggedIn, function (req, res) {
    Book.findById(req.params.id, function (err, book) {
        if (err) {
            console.log(err);
            res.redirect("/books");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong!");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    book.comments.push(comment);
                    book.save();
                    req.flash("success", "Successfully added comment!");
                    res.redirect("/books/" + book._id);
                }
            });
        }
    });
});

//EDIT Form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", { book_id: req.params.id, comment: foundComment });
        }
    });
});

//EDIT Comment
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/books/" + req.params.id);
        }
    });
});

//DELETE Comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!");
            res.redirect("/books/" + req.params.id);
        }
    });
});

module.exports = router;
