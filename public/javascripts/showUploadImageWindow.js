$(document).ready(function () {
    // ��� ������� �� ������� ����������� ��������� ����.
    // �� ��������� ����� data-*, ������� ���� ����������� �
    // �������� ��������, �� ��������� ������ ��� ����� ��� ���-��
    // ������� � ��� ���� ���������
    $('#uploadImageWindow').on('show.bs.modal', function (event) {
        var linkLikeButton = $(event.relatedTarget);
        //���������� ���-�� �� ����� data-method � data-action
        var methodForForm = linkLikeButton.data('method');
        var actionForForm = linkLikeButton.data('action');
        var modal = $(this);
        modal.find('form').attr({
            method: methodForForm,
            action:actionForForm
        });
    })
});

