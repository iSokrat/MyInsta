$(document).ready(function () {
    $('#showImageWindow').on('show.bs.modal', function (event) {
        var imageLikeButton = $(event.relatedTarget);
        var pathToImage = imageLikeButton.data('imagepath');
        var modal = $(this) // ��������� ������ ���������� ����
        modal.find('img').attr('src', pathToImage);
    })
})

