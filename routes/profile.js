var express = require('express');
var multer = require('multer');
var mime = require('mime');
var path = require('path');
var fs = require('fs');// Управление файлами на сервере

var Subscribtions = require('../models/models').Subscribtion;
var Users = require('../models/models').Users;
var Images = require('../models/models').Images;

var router = express.Router();

// PATH
const Pathes = {
    dirOfUploads: '/uploads',
    dirOfUploadsPhotos: '/photos',
    dirOfUploadsAvatars: '/avatars',
    pathToDefaultImages: '/images/default'
};
// Папки
var dirOfUploads = Pathes.dirOfUploads;
var dirOfUploadsPhotos = Pathes.dirOfUploadsPhotos;
var dirOfUploadsAvatars = Pathes.dirOfUploadsAvatars;

// Пути к папкам
var pathToPhotosDirectory = Pathes.dirOfUploads + Pathes.dirOfUploadsPhotos;
var pathToAvatarsDirectory = Pathes.dirOfUploads + Pathes.dirOfUploadsAvatars;
var pathToDefaultImages = Pathes.pathToDefaultImages;

// Пути к файлам
var pathToDefaultAvatar = path.join(pathToDefaultImages, "avatar.png");

// ~~PATH

//Настройка multer для скачивания картинки
//Description about storage
var storageImage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/..' + pathToPhotosDirectory);
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, req.user.username + '_' +
            Date.now() + "." +
            mime.extension(file.mimetype));
    }
});
var limitsImage = {
    files: 1
};
var settingsImageUploader = {
    storage: storageImage,
    limits: limitsImage
};
var uploadImage = multer(settingsImageUploader);

// Настройка multer для скачивания аватарки
var storageAvatars = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/..' + pathToAvatarsDirectory);
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, req.user.username + '_' +
            Date.now() + "." +
            mime.extension(file.mimetype));
    }
});
var limitsAvatars = {
    files: 1
};
var settingsAvatarsUploader = {
    storage: storageAvatars,
    limits: limitsAvatars
};
var uploadAvatar = multer(settingsAvatarsUploader);


router.get('/:username', function (req, res) {
    Users.findOne(
        {username: req.params.username},
        'name surname pathToAvatar username',
        function (err, user) {
            if (err) {
                console.error(err);
                return res.redirect('/');
            }
            // Если не найден пользователь
            if (!user)
                return res.render('pageNotFound');

            // Поиск всех картинок для этого пользователя
            Images.find({
                username: user.username
            }, function (err, images) {
                if (err) {
                    console.error(err);
                    return res.send('Error: err in Images.find()');
                }

                var infoForProfilePage = {
                    // По-умолчанию, страница запрашивается неавторизованным пользователем.
                    IsAutorizedUser: false,
                    User: user,
                    UserImages: images,
                    // По-умолчанию, подписок нет
                    CountOfFollowingForReqUser: 0,
                    // По-умолчанию, подписчиков нет
                    CountOfFollowersForReqUser: 0,
                    // По-умолчанию, информации о авторизованном пользователе нет
                    AutorizedUser: {},
                    // По-умолчанию, пользователь, страница которого запрашивается,
                    // НЕ существует в подписках у авторизованного пользователя
                    ReqUserIsExistInSubscribtionsOfAutorizedUser: false,
                    PathToDefaultAvatar: pathToDefaultAvatar
                };
                //Получение числа подписок
                Subscribtions.count({
                        username: user.username
                    },
                    function (err, countOfFollowing) {
                        if (err) return console.error(err);

                        infoForProfilePage.CountOfFollowingForReqUser = countOfFollowing;
                        Subscribtions.count({
                                toUsername: user.username
                            },
                            function (err, countOfFollowers) {
                                if (err) return console.error(err);
                                infoForProfilePage.CountOfFollowersForReqUser = countOfFollowers;

                                //Если страница запрашивается авторизованным пользователем
                                if (req.user) {
                                    infoForProfilePage.IsAutorizedUser = true;
                                    // Если запрашиваемая страница является профилем авторизованного пользователя
                                    if (req.user.username === user.username) {
                                        // Добавляем в информацию об авториз-ом польз-е, которую мы уже нашли
                                        infoForProfilePage.AutorizedUser = user;
                                        return res.render('profile', infoForProfilePage);
                                    }
                                    else {
                                        // Добавляем в информацию об авториз-ом польз-е, которую мы еще не нашли
                                        // В простейшем случае нам нужен только username авторизованного пользователя
                                        // для topNavbar
                                        infoForProfilePage.AutorizedUser = {
                                            username: req.user.username
                                        };

                                        // Проверяем, если у нас в подписчиках человек, страницу
                                        // которого мы загружаем
                                        Subscribtions.findOne({
                                                username: req.user.username,
                                                toUsername: req.params.username
                                            },
                                            function (err, subscrib) {
                                                if (err) return console.error(err);

                                                if (subscrib)
                                                    infoForProfilePage.ReqUserIsExistInSubscribtionsOfAutorizedUser = true;

                                                return res.render('profile', infoForProfilePage);
                                            });

                                    }
                                }
                                else {
                                    return res.render('profile', infoForProfilePage);
                                }
                            });
                    });
            }).sort({'dateAdded': -1});
        });
});

// Подписаться
router.post('/:username/subscribto', function (req, res) {
    if (!req.user)
        return res.status(401)  //При ошибке
            .json({redirectPath: '/login'});

    //Проверяем, если у нас в подписчиках этот человек на всякий случай
    Subscribtions.findOne({
            username: req.user.username,
            toUsername: req.params.username
        },
        function (err, subscrib) {
            if (err) return console.error(err);
            // Если подписка уже есть
            if (subscrib)
                return res.send({
                    errorMessage: "Этот пользователь уже есть в Подписках"
                });
            // Если нет, то создаем ее
            var subscribtion = new Subscribtions({
                username: req.user.username,
                toUsername: req.params.username
            });

            // Сохраняем подписку
            subscribtion.save(function (err, user) {
                if (err) return console.error(err);
                res.send({});
            })
        });
});

// Получить список подписчиков
router.post('/:username/followers', function (req, res) {

    // Поиск подписчиков для пользователя с :username
    Subscribtions.distinct('username', {
            toUsername: req.params.username
        },
        function (err, followerUsernames) {
            if (err) return console.error(err);
            //  Получаем username тех подписчиков, на которых
            // подписан сам пользователь с req.params.username
            Subscribtions.distinct('toUsername', {
                    username:  req.params.username,
                    toUsername:{$in: followerUsernames}
                },
                function (err, followingUsernames) {
                    if (err) return console.error(err);
                    // Ищем информацию о каждом подписчике
                    Users.find({username: {$in: followerUsernames}},
                        'name surname username pathToAvatar',
                        function (err, followersInfo) {
                            if (err) return console.error(err);
                            return res.send({
                                Followers:          followersInfo,
                                FollowingUsernames: followingUsernames
                            });
                        });
                });
        });
});

// Получить список подписок
router.post('/:username/following', function (req, res){
    // Поиск подписок для пользователя с :username
    Subscribtions.distinct('toUsername', {
        username: req.params.username
    },function (err, followingUsernames) {
        if (err) return console.error(err);

        Users.find({username: {$in: followingUsernames}},
            'name surname username pathToAvatar',
            function (err, followingInfo) {
                if (err) return console.error(err);

                return res.send({
                    Following: followingInfo
                });
            })
    });
});


// Загрузить изображение
router.post('/upload', uploadImage.single('image'), function (req, res) {
    if (!req.user)
        return res.redirect('/login');

    if (!req.file) {
        console.error('Empty image source!');
        res.redirect('back');
    }

    var pathToPhoto = path.join(dirOfUploadsPhotos, req.file.filename);
    var newImage = new Images({
        username: req.user.username,
        path: pathToPhoto,
        dateAdded: Date.now()
    });
    newImage.save();
    res.redirect('back');
});

// Перезапись аватарки
router.post('/avatar', uploadAvatar.single('image'), function (req, res) {
    Users.findOne({username: req.user.username}, function (err, user) {
        if (err)
            return console.err(err);
        if (!req.file)
            return res.redirect('/profile');

        // Вычисляем новый путь к аватарке
        var pathToAvatar = path.join(dirOfUploadsAvatars, req.file.filename);

        // Удаляем старую аватарку
        // Если путь указан
        if (user.pathToAvatar)
            fs.unlink(user.pathToAvatar, function (err) {// Удаляем с диска
                if (err) console.error(err);
            });

        // Перезаписываем путь к новой аватарке в БД
        user.pathToAvatar = pathToAvatar;
        user.save();
        return res.redirect('back');
    });
});

module.exports = router;
