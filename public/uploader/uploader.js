function bs_input_file() {
    $(".input-file").before(
        function () {
            var element = $("<input type='file' class='input-ghost' style='visibility:hidden; height:0'>");
            element.attr("name", $(this).attr("name"));
            element.change(function () {
                element.next(element).find('input').val((element.val()).split('\\').pop());
            });
            $(this).find("button.btn-choose").click(function () {
                element.click();
            });
            return element;
        }
    );
}
$(function () {
    bs_input_file();
});