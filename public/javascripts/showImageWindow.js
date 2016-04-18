$(document).ready(function () {
    $('#showImageWindow').on('show.bs.modal', function (event) {
        var imageLikeButton = $(event.relatedTarget);
        var pathToImage = imageLikeButton.data('imagepath');
        var modal = $(this) // Получение нашего модального окна
        modal.find('img').attr('src', pathToImage);
    })
})

