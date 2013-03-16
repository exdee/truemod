(function (jQuery) {
  jQuery.fn.i18n = function () {
    this.find("[data-i18n]").each(function(index, element){
      $(element).html(chrome.i18n.getMessage(element.dataset["i18n"]));
    });
  }
})(jQuery);