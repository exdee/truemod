var Notification = (function () {
    'use strict';
    Notification.prototype.display = function(options) {
        this.popup = webkitNotifications.createNotification(
            options.icon,
            options.title,
            options.body
        );
        if(typeof options.onclick === "function")
            this.popup.addEventListener("click", options.onclick);
        this.popup.show();
    };

    Notification.prototype.error = function(message) {
        this.display({
            icon: '/images/icons/truemod_128.png',
            title: chrome.i18n.getMessage('send_error'),
            body: chrome.i18n.getMessage(message)
        });
    };

    Notification.prototype.complete = function(body) {
        this.display({
            icon: '/images/icons/truemod_128.png',
            title: chrome.i18n.getMessage('send_complete'),
            body: body,
            onclick: function () {
                chrome.tabs.create({url: body});
            }
        });
    };

    function Notification () {
        
    };
    return Notification;
}()), notification = new Notification();