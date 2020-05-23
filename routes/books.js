var express = require("express");
var router = express.Router();
var Book = require("../models/books");
var middleware = require("../middleware");

var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

//Image Format Check
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter })

//Cloudinary Config
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'ddjvovyco',
    api_key: '673921289445291',
    api_secret: 'Dfr_AC3YT9UyaC-c7P8q9mMtCP0'
});

//GET All Books
router.get("/", function (req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');

        Book.find({ title: regex }, function (err, books) {
            if (err) {
                console.log(err);
            } else {
                res.render("books/index", { books: books });
            }
        });
    } else {
        Book.find({}, function (err, books) {
            if (err) {
                console.log(err);
            } else {
                res.render("books/index", { books: books });
            }
        });
    }
});

//POST New Book
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        req.body.book.image = result.secure_url;
        req.body.book.imageId = result.public_id;
        req.body.book.author = {
            id: req.user._id,
            username: req.user.username
        }
        Book.create(req.body.book, function (err, book) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/books/' + book.id);
        });
    });
});

//NEW Form
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("books/new");
});

//GET One Book
router.get("/:id", function (req, res) {
    Book.findById(req.params.id).populate("comments").exec(function (err, foundBook) {
        if (err) {
            console.log(err);
        } else {
            res.render("books/show", { book: foundBook });
        }
    });
});

//EDIT Form
router.get("/:id/edit", middleware.checkBookOwnership, function (req, res) {
    Book.findById(req.params.id, function (err, foundBook) {
        res.render("books/edit", { book: foundBook });
    });
});

//EDIT Book
router.put("/:id", middleware.checkBookOwnership, upload.single('image'), function (req, res) {
    Book.findById(req.params.id, async function (err, book) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(book.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    book.imageId = result.public_id;
                    book.image = result.secure_url;
                } catch (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            book.title = req.body.book.title;
            book.description = req.body.book.description;
            book.grade = req.body.book.grade;
            book.save();
            req.flash("success", "Successfully Updated!");
            res.redirect("/books/" + book._id);
        }
    });
});

//DELETE Book
router.delete("/:id", middleware.checkBookOwnership, function (req, res) {
    Book.findById(req.params.id, async function (err, book) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(book.imageId);
            book.remove();
            req.flash('success', 'Book deleted successfully!');
            res.redirect('/books');
        } catch (err) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
