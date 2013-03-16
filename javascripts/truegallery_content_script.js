var TTg = (function() {
    var _dce = function(){ return document.createElement.apply(document, arguments); };    
    TTg.prototype.post_message_selector = "table[id^=post]";
    TTg.prototype.thumb_selector = "img[src^=\"http://trueimages.ru/thumb\"]";
    TTg.prototype.ttg_button_panel_selector = "table[id^=post] td.alt1 div.smallfont:nth-child(2)";
    TTg.prototype.image_index = 0;
    TTg.prototype.fullsized_pattern = new RegExp("<meta property=\"og:image\" content=\"(.+)\" />");
    TTg.prototype.is_image_url_pattern = /\.(png|gif|jpg|jpeg)$/;
    TTg.prototype.trueimages_host_names = [
        "http://trueimages.ru/",
        "http://timg.in/"
    ];

    function TTg() {
        this.posts = document.querySelectorAll(this.post_message_selector);
        for(var i = 0; i < this.posts.length; i++) {
            if(this.posts.item(i).querySelector(this.thumb_selector) !== null) {
                this.append_ttg_controls(this.posts.item(i));
            }
        }
    }

    TTg.prototype.append_ttg_controls = function(container) {
        var panel = container.parentNode.querySelector(this.ttg_button_panel_selector);
        var ttg_button = _dce("img");
        ttg_button.src = chrome.extension.getURL("images/icons/truemod_16.png");
        ttg_button.title = chrome.i18n.getMessage("truegallery_button_title");
        ttg_button.classList.add("inlineimg");
        ttg_button.classList.add("ttg_button");
        ttg_button.addEventListener("click", (function (event) {
            event.preventDefault();
            this.build_viewer(container);
        }).bind(this), true);
        panel.appendChild(ttg_button);
    };

    TTg.prototype.build_viewer = function(container) {
        listener = this.key_listen.bind(this);
        document.addEventListener("keydown", listener, false);
        document.body.style.overflow = "hidden";
        this.viewer = _dce("div");
        this.viewer.classList.add("ttg_viewer");

        this.image_urls_stack = [];
        this.thumbs_stack = container.querySelectorAll(this.thumb_selector);
        for(var i = 0; i < this.thumbs_stack.length; i++) {
            if(this.thumbs_stack.item(i).parentNode.tagName.toLowerCase() == "a") {
                var anchor = this.thumbs_stack.item(i).parentNode;
                if(anchor.href.match(new RegExp(
                    this.trueimages_host_names.map(function(host){
                        return "^" + host.replace(/\.|\/|\:/,"\\$&")
                    }).join("|"))) !== null) {
                }
            }
        }

        var controls = _dce("div");
        controls.classList.add("ttg_controls");

        var close = _dce("a");
        close.classList.add("ttg_controls_close");
        close.href = "#";
        close.addEventListener("click", (function (event) {
            event.preventDefault();
            this.close_viewer();
        }).bind(this), true);
        controls.appendChild(close);

        var previous = _dce("a");
        previous.classList.add("ttg_controls_previous");
        previous.href = "#";
        previous.addEventListener("click", (function (event) {
            event.preventDefault();
            this.show_previous_image();
        }).bind(this), true);
        controls.appendChild(previous);

        var next = _dce("a");
        next.classList.add("ttg_controls_next");
        next.href = "#";
        next.addEventListener("click", (function (event) {
            event.preventDefault();
            this.show_next_image();
        }).bind(this), true);
        controls.appendChild(next);

        this.viewer.appendChild(controls);

        var image_container = _dce("div");
        image_container.classList.add("ttg_image_container");

        this.img = new Image();
        image_container.appendChild(this.img);
        this.img.classList.add("ttg_img_normal");
        this.img.addEventListener("click", function(event){
            this.classList.toggle("ttg_img_normal");
            this.parentNode.classList.toggle("ttg_fullsized");
        }, true);

        this.viewer.appendChild(image_container);

        document.body.appendChild(this.viewer);

        this.show_image();
    };

    TTg.prototype.close_viewer = function() {
        document.removeEventListener("keydown", listener, false);
        document.body.style.overflow = "";
        document.body.removeChild(this.viewer);
        this.image_index = 0;
    };

    TTg.prototype.key_listen = function(event) {
        switch(event.keyCode) {
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

    TTg.prototype.show_image = function(index) {
        this.img.src = chrome.extension.getURL("images/truegallery/load.gif");
        if (index !== undefined) {
            this.image_index = index;
        }
        if(this.image_urls_stack[this.image_index] === undefined) {
            var request_url = this.thumbs_stack.item(this.image_index).parentNode.href;
            if(this.is_image_url_pattern.test(request_url)) {
                this.img.src = this.image_urls_stack[this.image_index] = request_url;
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", request_url);
                xhr.addEventListener("load", (function(event) {
                    var image_url = event.target.response.match(this.fullsized_pattern)[1];
                    this.img.src = this.image_urls_stack[this.image_index] = image_url;
                }).bind(this), true);
                xhr.send();
            }
        } else {
            this.img.src = this.image_urls_stack[this.image_index];
        }
    };

    TTg.prototype.show_next_image = function() {
        ++this.image_index < this.thumbs_stack.length ? this.image_index : this.image_index = 0;
        this.show_image();
    };

    TTg.prototype.show_previous_image = function() {
        --this.image_index > -1 ? this.image_index : this.image_index += this.thumbs_stack.length;
        this.show_image();
    };

    return TTg;

}()), listener, ttg = new TTg();