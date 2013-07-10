(function (window) {
    'use strict';
    Log.prototype.init_db = function() {
        var idb_open_request = indexedDB.open("log", 1);
        idb_open_request.onupgradeneeded = function (event) {
            event.target.result.createObjectStore("log", {pathKey: "id", autoIncrement: true});
        }
        idb_open_request.onsuccess = function (event) {
            this.db = event.target.result;
        }.bind(this);
    };

    Log.prototype.create = function(data) {
        this.db.transaction("log", "readwrite").objectStore("log").add(data);
    };

    Log.prototype.count = function(callback) {
        var count_request = this.db.transaction("log").objectStore("log").count();
        count_request.onsuccess = function (event) { callback(event.target.result); }
    };

    Log.prototype.each = function(callback, range) {
        var cursor_request = this.db.transaction("log").objectStore("log").openCursor(range || null, 'prev');
        cursor_request.onsuccess = function (event) {
            var item = event.target.result;
            if (item) {
                callback(item);
                item.continue();
            };
        };
    };

    Log.prototype.delete = function(index) {
        [].concat(index).forEach(function (value) {
            this.db.transaction("log", "readwrite").objectStore("log").delete(value);
        }.bind(this));
    };

    function Log () {
        this.init_db();
    };
    window.Log = Log;
}(window)); var log = new Log();