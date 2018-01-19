var Pixboost = {
  /**
   * Generates <picture> tag into all tags that have
   * data-pb-picture attribute.
   * @param {object} options
   * @param {string} options.apiKey Pixboost api key that will be used
   */
  picture: function (options) {
    var apiKey = options.apiKey;
    if (!apiKey) {
      throw 'apiKey option is mandatory';
    }

    var createSource = function (mediaQuery, src, op, size) {
      var el = document.createElement('source');
      var srcSetVal = 'https://pixboost.com/api/2/img/' + src + '/' + op + '?auth=' + options.apiKey;
      if (size) {
        srcSetVal += '&size=' + size
      }

      el.setAttribute('srcset', srcSetVal);
      el.setAttribute('media', mediaQuery);

      return el;
    };

    var toPictureElements = document.querySelectorAll('[data-pb-picture]');
    toPictureElements.forEach(function (el) {
      var pic = document.createElement('picture');

      BREAKPOINTS.forEach(function (bp) {
        var attrUrl = el.getAttribute('data-' + bp.name + '-url');
        var attrSize = el.getAttribute('data-' + bp.name + '-size');
        var attrHide = el.getAttribute('data-' + bp.name + '-hide');

        var op = '';
        var size = '';
        var widthAndHeight = attrSize.split('x');
        var width = widthAndHeight[0];
        var height = widthAndHeight[1];

        //TODO: test that width and height are numbers
        if (width && height) {
          op = 'fit';
          size = width + 'x' + height;
        } else if (width) {
          op = 'resize';
          size = width;
        } else if (height) {
          op = 'resize';
          size = 'x' + height
        } else {
          op = 'optimise'
        } //TODO: asis, hide

        var sourceEl = createSource(bp.mediaQuery, attrUrl, op, size);
        pic.appendChild(sourceEl);
      });

      var imgEl = document.createElement('img');
      imgEl.setAttribute('src', el.getAttribute('data-desktop-url'));
      pic.appendChild(imgEl);

      el.appendChild(pic);
    });
  }
};