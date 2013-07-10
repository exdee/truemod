var Background = (function () {
    'use strict';

    Background.prototype.trueimages_url = "http://trueimages.ru/";
    Background.prototype.trueimages_short_url = "http://timg.in/";
    Background.prototype.trueimages_upload_path = "upload.php?json=true";
    Background.prototype.trueshot_page = "pages/truemod.html#trueshot";

    config.default("clipboard_enabled", true);
    config.default("clipboard_copy_url", "#clipboard_copy_short");

    Background.prototype.trueshift_action_listener = function(image, tab) {
        this.send(image.srcUrl, "url");
    };

    Background.prototype.send = function(data, type) {
        var
            fd = new FormData(),
            xhr = new XMLHttpRequest();
        fd.append("quality", "85");
        fd.append("resize", "0");
        switch(type) {
            case "url":    fd.append("urlToUpload", data); break;
            case "blob":   fd.append("fileToUpload[]", data, "truemod.png"); break;
        }
        xhr.open("POST", this.trueimages_url + this.trueimages_upload_path);
        xhr.addEventListener("load", this.send_load_listener.bind(this), false);
        xhr.send(fd);
    };

    Background.prototype.send_load_listener = function(event) {
        var error, image;
        if(event.target.status == 200) {
            try {
                image = JSON.parse(event.target.response)[0];
                if(image === undefined) {
                    error = "send_upload_error";
                }
            } catch (exception) {
                error = "send_json_response_error";
            }
        } else {
            error = "send_xhr_status_error";
        }

        if(error === undefined) {
            notification.complete(this.trueimages_short_url + image.shorturl);
            if (config.get("clipboard_enabled")) {
                this.copy_image_url(image);
            };
            log.create({image: image, created_at: (new Date()*1)});
        } else {
            notification.error(error);
        }
    };

    Background.prototype.copy_image_url = function(image) {
        this.copy(function () {
            switch(config.get("clipboard_copy_url")) {
                case "#clipboard_copy_full":
                    return this.trueimages_url + image.img;
                case "#clipboard_copy_short":
                    return this.trueimages_short_url + image.shorturl;
            }
        }.bind(this)());
    };

    Background.prototype.copy = function(data) {
        var clipboard = document.getElementById("clipboard");
        clipboard.value = data.toString();
        clipboard.select();
        document.execCommand("copy");
    };

    function Background () {    
        chrome.browserAction.onClicked.addListener(function(tab) {
            chrome.tabs.create({'url': chrome.extension.getURL(this.trueshot_page)});
        }.bind(this));

        chrome.contextMenus.create({
            "title" : chrome.i18n.getMessage("trueshift_action"),
            "contexts" : [ "image" ],
            "onclick" : this.trueshift_action_listener.bind(this)
        });
    };

    return Background;
}()), background = new Background();