(function () {
    'use strict';
    var listener,
        dce = function () { return document.createElement.apply(document, arguments); },
        TTg = function () {
            var i;
            this.posts = document.querySelectorAll(this.post_message_selector);
            for (i = 0; i < this.posts.length; i += 1) {
                if (this.posts.item(i).querySelector(this.thumb_selector) !== null) {
                    this.append_ttg_controls(this.posts.item(i));
                }
            }
        };

    TTg.prototype.post_message_selector = "table[id^=post]";
    TTg.prototype.thumb_selector = "a > img[src^=\"http://trueimages.ru/thumb\"]";
    TTg.prototype.ttg_button_panel_selector = "table[id^=post] td.alt1 div.smallfont:nth-child(2)";
    TTg.prototype.image_index = 0;
    TTg.prototype.fullsized_pattern = new RegExp("<meta property=\"og:image\" content=\"(.+)\" />");
    TTg.prototype.is_image_url_pattern = /\.(png|gif|jpg|jpeg)$/;

    TTg.prototype.append_ttg_controls = function (container) {
        var panel = container.parentNode.querySelector(this.ttg_button_panel_selector),
            ttg_button = dce("img");
        ttg_button.src = chrome.extension.getURL("images/icons/truemod_16.png");
        ttg_button.title = chrome.i18n.getMessage("truegallery_button_title");
        ttg_button.classList.add("inlineimg");
        ttg_button.classList.add("ttg_button");
        ttg_button.addEventListener("click", function (event) {
            event.preventDefault();
            this.build_viewer(container);
        }.bind(this), true);
        panel.appendChild(ttg_button);
    };

    TTg.prototype.build_viewer = function (container) {
        var i, anchor, controls, close, previous, next, image_container;
        listener = this.key_listen.bind(this);
        document.addEventListener("keydown", listener, false);
        document.body.style.overflow = "hidden";
        this.viewer = dce("div");
        this.viewer.classList.add("ttg_viewer");

        this.image_urls_stack = [];
        this.thumbs_stack = container.querySelectorAll(this.thumb_selector);

        controls = dce("div");
        controls.classList.add("ttg_controls");

        close = dce("a");
        close.classList.add("ttg_controls_close");
        close.href = "#";
        close.addEventListener("click", (function (event) {
            event.preventDefault();
            this.close_viewer();
        }).bind(this), true);
        controls.appendChild(close);

        previous = dce("a");
        previous.classList.add("ttg_controls_previous");
        previous.href = "#";
        previous.addEventListener("click", (function (event) {
            event.preventDefault();
            this.show_previous_image();
        }).bind(this), true);
        controls.appendChild(previous);

        next = dce("a");
        next.classList.add("ttg_controls_next");
        next.href = "#";
        next.addEventListener("click", (function (event) {
            event.preventDefault();
            this.show_next_image();
        }).bind(this), true);
        controls.appendChild(next);

        this.viewer.appendChild(controls);

        image_container = dce("div");
        image_container.classList.add("ttg_image_container");

        this.img = dce("img");
        this.img.classList.add("ttg_img_normal");
        this.img.addEventListener("click", function (event) {
            this.classList.toggle("ttg_img_normal");
            this.parentNode.classList.toggle("ttg_fullsized");
        }, true);
        image_container.appendChild(this.img);

        this.viewer.appendChild(image_container);

        document.body.appendChild(this.viewer);

        this.show_image();
    };

    TTg.prototype.close_viewer = function () {
        document.removeEventListener("keydown", listener, false);
        document.body.style.overflow = "";
        document.body.removeChild(this.viewer);
        this.image_index = 0;
    };

    TTg.prototype.key_listen = function (event) {
        switch (event.keyCode) {
            case 39:
            case 40:
            case 32:
            case 13:  this.show_next_image(); break;
            
            case 8:   event.stopPropagation(); event.preventDefault();
            case 37:
            case 38:  this.show_previous_image(); break;
            
            case 27:  this.close_viewer(); break;
        }
        return false;
    };

    TTg.prototype.show_image = function (index) {
        var request_url, xhr;
        this.img.src = chrome.extension.getURL("images/truegallery/load.gif");
        if (index !== undefined) {
            this.image_index = index;
        }
        if (this.image_urls_stack[this.image_index] === undefined) {
            request_url = this.thumbs_stack.item(this.image_index).parentNode.href;
            if (this.is_image_url_pattern.test(request_url)) {
                this.img.src = this.image_urls_stack[this.image_index] = request_url;
            } else {
                xhr = new XMLHttpRequest();
                xhr.open("GET", request_url);
                xhr.addEventListener("load", (function (event) {
                    var image_url = event.target.response.match(this.fullsized_pattern)[1];
                    this.img.src = this.image_urls_stack[this.image_index] = image_url;
                }).bind(this), true);
                xhr.send();
            }
        } else {
            this.img.src = this.image_urls_stack[this.image_index];
        }
    };

    TTg.prototype.show_next_image = function () {
        this.image_index += 1;
        if (this.image_index >= this.thumbs_stack.length) {
            this.image_index = 0;
        }
        this.show_image();
    };

    TTg.prototype.show_previous_image = function () {
        this.image_index -= 1;
        if (this.image_index <= -1) {
            this.image_index += this.thumbs_stack.length;
        }
        this.show_image();
    };

    new TTg();
}());