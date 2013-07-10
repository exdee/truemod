jQuery(function () {
    'use strict';

    $("#clipboard_enabled").attr("checked", config.get("clipboard_enabled"));
    $("#clipboard_enabled").on("change", function () {
        config.set("clipboard_enabled", this.checked);
    });

    $(config.get("clipboard_copy_url")).attr("checked", true);
    $("[name=clipboard_copy_url]").on("change", function () {
        config.set("clipboard_copy_url", $("[name=clipboard_copy_url]:checked").val());
    });

    var page = 1;
    var display_log = function () {
        var container = $("#log_table tbody");
        container.empty();
        chrome.extension.getBackgroundPage().log.each(function (item) {
            var row = $("<tr>");
            $("<td>").append(
                $("<a>").attr("href",
                    chrome.extension.getBackgroundPage().background.trueimages_short_url +
                    item.value.image.shorturl
                ).attr("target", "_blank").append(
                    $("<img>").attr("src",
                        chrome.extension.getBackgroundPage().background.trueimages_url +
                        item.value.image.thumb
                    ).addClass("thumb")
                )
            ).appendTo(row);
            var created_at = new Date(item.value.created_at);
            $("<td>").append(
                created_at.toLocaleDateString(chrome.i18n.getMessage("@@ui_locale")) + " " +
                created_at.toLocaleTimeString(chrome.i18n.getMessage("@@ui_locale"))
            ).appendTo(row);
            $("<td>").append(
                $("<input>").attr("type", "checkbox").val(item.key)
            ).appendTo(row);
            row.appendTo(container);
            
        },  IDBKeyRange.bound(
                (page-1)*config.get("log_items_per_page"), 
                page*config.get("log_items_per_page"), 
                true
            )
        );
    };

    display_log();

    chrome.extension.getBackgroundPage().log.count(function (count) {
        for(var i = 1; i <= Math.ceil(count/config.get("log_items_per_page")); i++) {
            var li = $("<li>");
            var link = $("<a>").attr("href", "#").html(i);
            link.on("click", function (event) {
                event.preventDefault();
                $(".pagination li.active").removeClass("active");
                $(this).parent().addClass("active");
                page = parseInt($(this).html());
                display_log();
            });
            if(page === i) li.addClass("active");
            $(".pagination ul").append(
                li.append(link)
            );
        }
    });

    $("#log_checkall").on("change", function () {
        $("#log_table tbody input[type=checkbox]").prop("checked", this.checked);
    });

    $("#log_delete").on("click", function () {
        chrome.extension.getBackgroundPage().log.delete(
            $.map($("#log_table tbody input:checked"), function (i) {
                return parseInt(i.value);
            })
        );
        window.location.reload();
    });
});