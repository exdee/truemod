var config, Config = (function(){
  function Config () {
    
  }

  Config.prototype.get = function(key) {
    return JSON.parse(localStorage.getItem(key) || "\"\"");
  };

  Config.prototype.set = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  };

  Config.prototype.delete = Config.prototype.remove = function(key) {
    localStorage.removeItem(key);
  };

  Config.prototype.has = function(key) {
    return localStorage.hasOwnProperty(key);
  };

  Config.prototype.default = function(key, value) {
    if (!this.has(key)) {
      this.set(key, value);
    }
  };

  return Config;
})();
config = new Config();