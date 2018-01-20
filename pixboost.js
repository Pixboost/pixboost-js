'use strict';

var _window = global ? global.window : window;

_window.Pixboost = {
  _BREAKPOINTS: [
    {
      name: 'sm',
      mediaQuery: '(max-width: 576px)'
    },
    {
      name: 'md',
      mediaQuery: '(max-width: 768px)'
    },
    {
      name: 'lg',
      mediaQuery: '(min-width: 769px)'
    }
  ],

  /**
   * Generates <picture> tag into all tags that have
   * data-pb-picture attribute.
   * @param {object} options
   * @param {string} options.apiKey Pixboost api key that will be used
   * @param {Document} options.document DOM Document
   */
  picture: function (options) {
    var self = this;

    var apiKey = options.apiKey;
    if (!apiKey) {
      throw 'apiKey option is mandatory';
    }

    var doc = options.document || _window.document;
    if (!doc) {
      throw 'document object must be provided';
    }

    var createSource = function (mediaQuery, src, op, params) {
      var
        el = doc.createElement('source'),
        srcSetVal = 'https://pixboost.com/api/2/img/' + src + '/' + op + '?auth=' + options.apiKey;
      if (params) {
        srcSetVal += '&' + params;
      }

      el.setAttribute('srcset', srcSetVal);
      el.setAttribute('media', mediaQuery);

      return el;
    };

    doc.querySelectorAll('[data-pb-picture]').forEach(function (el) {
      var pic = doc.createElement('picture');

      self._BREAKPOINTS.forEach(function (bp) {
        var
          attrUrl = el.getAttribute('data-pb-' + bp.name + '-url'),
          attrOp = el.getAttribute('data-pb-' + bp.name),
          attrOpParams = el.getAttribute('data-pb-' + bp.name + '-params');

        pic.appendChild(createSource(bp.mediaQuery, attrUrl, attrOp, attrOpParams));
      });

      var imgEl = doc.createElement('img');
      imgEl.setAttribute('src', el.getAttribute('data-pb-lg-url'));
      pic.appendChild(imgEl);

      el.appendChild(pic);
    });
  }
};