(function (window) {
    'use strict';
    $(document).i18n();

    config.default("nav_page", "#options");

    var show_page = function () {
        var selector = location.hash || config.get("options_page");

        $("article:not("+ selector +")").addClass("hide");
        $("article" + selector).removeClass("hide");

        $("#nav a:not([href=" + selector + "])").parent().removeClass("active");
        $("#nav a[href=" + selector + "]").parent().addClass("active");
    }
    show_page();
    $(window).on("hashchange", show_page);
}(window));