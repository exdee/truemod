var Trueshot = (function () {
    'use strict';
    Trueshot.prototype.reader = new FileReader();

    Trueshot.prototype.data_url_to_blob = function(str) {
        var 
            byte_string = atob(str.split(',')[1]),
            array_buffer = new ArrayBuffer(byte_string.length),
            int_array = new Uint8Array(array_buffer),
            mime_string = str.match(/\:([^;]+)\;/)[1];

        byte_string.split("").forEach(function (val, index) {
            int_array[index] = val.charCodeAt(0);
        }); 
        return new Blob([int_array], {type: mime_string});
    };

    Trueshot.prototype.paste_listener = function (event) {
        Array.prototype.some.call(
            event.originalEvent.clipboardData.items, 
            function (item) {
            if (/^image.*/.test(item.type)) {
                this.reader.readAsDataURL(item.getAsFile());
                return true;
            }
            return false;
        }, this);
    };

    Trueshot.prototype.img_load_listener = function () {
        $("#screenshot").append(this.img);
        this.jcrop = $.Jcrop(this.img, {
            onSelect: function () {
                $("#crop").removeClass("hide");
            },
            onRelease: this.jcrop_release
        });
    };

    Trueshot.prototype.jcrop_release = function () {
        $("#crop").addClass("hide");
    };

    Trueshot.prototype.crop_click_listener = function () {
        if (this.jcrop === null) { return false; }
        var ctx,
            size = this.jcrop.tellSelect(),
            canvas = document.createElement("canvas");
        canvas.width = size.w;
        canvas.height = size.h;
        ctx = canvas.getContext("2d");
        ctx.drawImage(this.img, size.x, size.y, size.w, size.h, 0, 0, size.w, size.h);
        this.reader.readAsDataURL( this.data_url_to_blob(canvas.toDataURL()) );
        this.jcrop_release();
    };

    Trueshot.prototype.upload_click_listener = function() {
        chrome.extension.getBackgroundPage().background.send(
            this.data_url_to_blob(this.img.src),
            "blob"
        );
        this.close_window();
    };

    Trueshot.prototype.close_window = function() {
        window.close();
    };

    Trueshot.prototype.reader_load_listener = function (event) {

        if (this.jcrop) {this.jcrop.destroy(); this.jcrop = null;}

        var tmp = document.querySelector("img#img");
        if (tmp !== null) tmp.parentNode.removeChild(tmp);

        this.img = new Image();
        this.img.id = "img";
        this.img.addEventListener("load", this.img_load_listener.bind(this));
        this.img.src = event.target.result;
    };

    Trueshot.prototype.cancel_click_listener = function () {
        this.close_window();
    };

    Trueshot.prototype.document_load_listener = function () {
        $(document).i18n();
        $("#upload").on("click", this.upload_click_listener.bind(this));
        $("#crop").on("click", this.crop_click_listener.bind(this));
        $("#cancel").on("click", this.cancel_click_listener.bind(this));
        document.execCommand("paste");
    };

    function Trueshot () {
        $(this.reader).on("load", this.reader_load_listener.bind(this));
        $(window).on("paste", this.paste_listener.bind(this));
        $(this.document_load_listener.bind(this));
    };

    return Trueshot;
}()), trueshot = new Trueshot();