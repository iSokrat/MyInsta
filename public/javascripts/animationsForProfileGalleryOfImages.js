$(document).ready(function () {

    //ќбработка наведени¤ мыши на изображение
    $(".imageProfileGallery").hover(function () {

        $(this).stop().animate({opacity:0.5}, 400);

    }, function () {
        $(this).stop().animate({opacity:1}, 400);
    });
});