jQuery(function () {
    'use strict';
    $(document).i18n();

    config.default("options_page", $("#nav a:first").attr("href"));

    var show = function (hash) {
        var selector = hash || location.hash || config.get("options_page");
        $("article:not("+ selector +")").addClass("hide");
        $("article" + selector).removeClass("hide");
        $("#nav a:not([href=" + selector + "])").parent().removeClass("active");
        $("#nav a[href=" + selector + "]").parent().addClass("active");
    }

    show();

    $("#nav a").on("click", function (e) {
        config.set("options_page", this.hash);
        show(this.hash);
    });

    $("#clipboard_enabled").attr("checked", config.get("clipboard_enabled"));
    $("#clipboard_enabled").on("change", function () {
        config.set("clipboard_enabled", this.checked);
    });

    $(config.get("clipboard_copy_url")).attr("checked", true);
    $("[name=clipboard_copy_url]").on("change", function () {
        config.set("clipboard_copy_url", $("[name=clipboard_copy_url]:checked").val());
    });
});