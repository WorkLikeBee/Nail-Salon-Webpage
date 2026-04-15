var switchOn = true;

$(".navbar-toggler").click(function () {
    if (switchOn) {
        $("#logo").css({
            "height": "200px",
            "width": "200px"
        });
        switchOn = false;
    } else {
        $("#logo").css({
            "height": "100px",
            "width": "100px"
        });
        switchOn = true;
    }
});
