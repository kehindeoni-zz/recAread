'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Book = mongoose.model('Book'),
	Review = mongoose.model('Review'),
	_ = require('lodash');

/**
 * Create a Book
 */
exports.create = function(req, res) {
	var book = new Book(req.body);
	book.user = req.user;

	book.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(book);
		}
	});
};

/**
 * Show the current Book
 */
exports.read = function(req, res) {
	res.jsonp(req.book);
};

/**
 * Update a Book
 */
exports.update = function(req, res) {
	var book = req.book ;

	book = _.extend(book , req.body);

	book.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(book);
		}
	});
};

/**
 * Delete a Book
 */
exports.delete = function(req, res) {
	var book = req.book ;

	book.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(book);
		}
	});
};

/**
 * List of Books
 */
exports.list = function(req, res) { 
	Book.find().sort('-created').populate('user', 'displayName').exec(function(err, books) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(books);
		}
	});
};

/**
 * Book middleware
 */
exports.bookByID = function(req, res, next, id) { 
		Book.findById(id).populate('user', 'displayName').exec(function(err, book) {
		if (err) return next(err);
		if (! book) return next(new Error('Failed to load Book ' + id));
		req.book = book ;
		next();
	});
};

/**
 * Book authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.book.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

/**
 *Search for book by title, author or genre
 */
// exports.bookSearch = function(req,res){  

//   var $or = {$or:[]};
//   var checkQuery = function(){
//     if (req.query.title &&req.query.title.length > 0){
//       $or.$or.push({title : new RegExp(req.query.title)});
//     }
//     if (req.query.author && req.query.author.length > 1){
//       $or.$or.push({author: new RegExp(req.query.authorization)});
//     }
//     if(req.query.genre && req.query.genre.length > 1)
//     {
//       $or.$or.push({genre:new RegExp(req.query.genre)});
//     }
//   };

//   checkQuery();
//   Book.find($or).exec(function(err, data){
//     if(err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       res.jsonp(data);
//       console.log(req.body);
//     }
//   });
// };

/**
 *Add a Review
 */
exports.addReview = function(req, res) {
    var book = req.book;
    var review = req.body;
    review.reviewer = req.user;
    book.reviews.unshift(review);

    book.save(function(err) {
        if (err) {
            return res.send(400, {
                message: errorHandler.getErrorMessage(err)
            });
        }   
        else {
            res.jsonp(book);
        }
    });
};

/**
 *Delete a Review
 */
exports.deleteReview = function(req, res){
	var book = req.book;

    book.reviews.id(req.params.reviewId).remove();
    book.save(function(err){
        if(err) {
            return res.send(400, {
                message: 'Failed to delete review'
            });
        }
        else{
            res.jsonp(book);
        }
    });
};

/**
 * Like a Post
 */
exports.likePost = function(req, res){
	var book = req.book,
        like = req.body;
        like.user = req.user;
    var hasLiked = false; 
    

    for(var i = 0; i < book.likes.length; i++) {
       if (req.user.id === book.likes[i].user.toString()) {
           hasLiked = true;
           break;
        }
    }
    if (!hasLiked) {
        book.likes.push(like);

        book.save(function(err) {
           if (err) {
               return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
               });
            } else {
                res.jsonp(book);
            }
        });
    } 
    else {
        return res.send(400, {
           message: 'you have already liked this book before'
        });
    }
    
};

/**
 *Review Middleware
 */
exports.reviewByID = function(req, res, next, id) {
		var book = req.book;
		req.review = book.reviews.id(id);
		next();
};

