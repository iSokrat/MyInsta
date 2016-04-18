$(document).ready(function () {
    // Обработка нажатия кнопки подпиcаться
    var subscribToButtonClass = '.subscribToButton';
    $(subscribToButtonClass).click(function () {
        var pathToSubscribToHandler = location.pathname + "/subscribto";

        $.ajax({
            url: pathToSubscribToHandler,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if (data.errorMessage) {
                    alert(data.errorMessage)
                    return;
                }
                var subscribtionClassesButton = 'subscribtionButton btn btn-success ' +
                                                'center-block vertical-center-block';
                $(subscribToButtonClass).removeClass()
                    .addClass(subscribtionClassesButton)
                    .find('strong')
                    .text('Подписка оформлена');
            },
            error: function (data) {
                switch (data.statusText) {
                    case "Unauthorized":
                    { //Error 401
                        window.location = data.responseJSON.redirectPath;
                        break;
                    }
                }
            }
        });
    });

    // Обработка нажатия кнопки Подписчики
    var showFollowersButtonClass = '.showFollowersButton';
    $(showFollowersButtonClass).click(function () {
        var pathToHandlerOfInfoAboutFollowers = location.pathname + "/followers";
        $.ajax({
            url: pathToHandlerOfInfoAboutFollowers,
            type: "POST",
            dataType: "json",
            success: function (data) {
                $(".listOfUsers").empty();

                $(".titleForListOfUsers").text('Подписчики');

                for (var i in data.Followers){
                    //   Ищем в массиве username (на кого подписан запрашиваемый пользователь)
                    // номер элемента массива username текущего
                    // обрабатываемого подписчика (data.followers[i])

                    var indexOfUsername = $.inArray(
                        data.Followers[i].username,
                        data.FollowingUsernames);
                    console.log(indexOfUsername);
                    // если он найден, то добавляем кнопку "Подписки"
                    var button = "";
                    if (indexOfUsername!=-1)
                        button = getSubscribtionButton();
                    // Иначе "Подписаться"
                    else
                        button = getSubscribToButton();

                    $(".listOfUsers").prepend(getVisitCardHTML(data.Followers[i],{
                        Button:button
                    }));
                    // иначе добавляем кнопку "Подписаться"

                }
            },
            error: function (data) {

            }
        });
    });

    // Обработка нажатия кнопки Подписки
    var showFollowersButtonClass = '.showFollowingButton';
    $(showFollowersButtonClass).click(function () {
        var pathToHandlerOfInfoAboutFollowing = location.pathname + "/following";
        $.ajax({
            url: pathToHandlerOfInfoAboutFollowing,
            type: "POST",
            dataType: "json",
            success: function (data) {

                $(".listOfUsers").empty();
                $(".titleForListOfUsers").text('Подписки');
                for (var i in data.Following){

                    var followingButton = getSubscribtionButton();

                    $(".listOfUsers").prepend(getVisitCardHTML(data.Following[i],{
                        Button:followingButton
                    }));
                    // иначе добавляем кнопку "Подписаться"

                }
            },
            error: function (data) {
                alert('Error: '+data);
            }
        });
    });
});

function getSubscribToButton(){
    var textForButton = "Подписаться";
    return "<button class='subscribToButton btn btn-default vertical-block-align'>" +
        "       "+textForButton+
        "   </button>";
};

function getSubscribtionButton(){
    var textForButton = "Подписки";
    return "<button class='subscribtionButton btn btn-success vertical-block-align'>" +
        "       "+textForButton+
        "   </button>";
};

function getVisitCardHTML(people,options) {
    var avatarWidth = 64,avatarHeight = 64;
    var pathToAvatar = (people.pathToAvatar)?people.pathToAvatar:"/images/default/avatar.png";
    var initials = people.name+" "+people.surname;
    var username ="@"+people.username;

    // Проверяем options

    var button = (options.Button)?options.Button:getSubscribToButton();

    return "" +
        "<li class='list-group-item'>" +
        "   <div class='row'>  " +
        "       <div class='col-lg-2 col-md-2 col-sm-2'>" +
        "           <a href="+'/'+people.username+">" +
        "               <img src="+pathToAvatar+" class='img-circle center-block' width="+avatarWidth+" height="+avatarHeight+">" +
        "           </a>" +
        "       </div>" +
        "       <div class='col-lg-6 col-md-6 col-sm-6'>" +
        "           <h4>"+initials+"</h4>" +
        "           <h5>"+username+"</h5>" +
        "       </div>" +
        "       <div class='col-lg-4 col-md-4 col-sm-4'>" +
        "          "+button +
        "       </div>" +
        "   </div>" +
        "</li>";
};
