var express = require('express');
var passport = require('passport');
var Account = require('../models/models').Account;
var Users = require('../models/models').Users;
var Subscribtions = require('../models/models').Subscribtion;
var Images = require('../models/models').Images;
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    if (!req.user)
        return res.render('index', {
            AutorizedUser: req.user,
            Message: req.flash('error')
        });

    var limitImagesOnPage = 10;

    // Ищем username-ы, на кого подписан авторизованный пользователь
    Subscribtions.distinct('toUsername',{username: req.user.username},
        function (err, usernameSubscrib) {
            if (err) return console.error(err);

            // Условия отбора :
            var userInfoSelectionCriteria = [
                {username: {$in: usernameSubscrib}},
                {username: req.user.username}
            ];

            // Ищем информацию о подписчиках
            Users.find({$or: userInfoSelectionCriteria},
                'name surname pathToAvatar images username',
                function (err, users) {
                    if (err) return console.error(err);

                    //Ищем картинки о пользователях
                    Images.find({
                            $or: userInfoSelectionCriteria
                        },
                        'username path',
                        function (err, images) {
                            if (err) return console.error(err);
                            console.log(images);
                            console.log(users);
                            return res.render('index', {
                                AutorizedUser: req.user,
                                ImagesForBandOfPosts: images,
                                InfoAboutUsers: users,
                                Message: req.flash('error')
                            });
                        }).sort({'dateAdded': -1}).limit(limitImagesOnPage);
                });
        });


});

router.get('/register', function (req, res) {
    res.render('register');
});

router.post('/register', function (req, res, next) {

    var account = new Account({
        username: req.body.username
    });
    // Информация о аккаунте
    var user = new Users({
        username: req.body.username,
        name: req.body.name,
        surname: req.body.surname
    });

    Account.register(account,
        req.body.password, function (err, account) {
            if (err) {
                console.log(err);
                return res.render("register", {info: "Sorry. That username already exists. Try again."});
            }
            // Сохраняем информацию о зарегистрированном пользователе
            user.save(function (err, user) {
                if (err) return console.error(err);
            });

            // Аутентифицируемся
            passport.authenticate('local')(req, res, function () {
                req.session.save(function (err) {
                    if (err)
                        return next(err);
                    res.redirect("/");
                });
            });
        });
});

router.get('/login', function (req, res) {
    res.render('login', {
        User: req.user,
        Message: req.flash('error')
    });
});

router.post('/login', passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    }),
    function (req, res, next) {
        req.session.save(function (err) {
            if (err)
                return next(err);
            res.redirect("/");

        });
    });

router.get('/logout', function (req, res, next) {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


module.exports = router;
