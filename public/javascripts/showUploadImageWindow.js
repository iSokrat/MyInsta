$(document).ready(function () {
    // При нажатии на элемент открывается модальное окно.
    // На основании полей data-*, которые были установлены у
    // нажатого элемента, мы заполняем нужные нам места той инф-ей
    // которая в них была прописана
    $('#uploadImageWindow').on('show.bs.modal', function (event) {
        var linkLikeButton = $(event.relatedTarget);
        //Извлечение инф-ии из полей data-method и data-action
        var methodForForm = linkLikeButton.data('method');
        var actionForForm = linkLikeButton.data('action');
        var modal = $(this);
        modal.find('form').attr({
            method: methodForForm,
            action:actionForForm
        });
    })
});

