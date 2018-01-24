'use strict';

var _window = typeof global !== 'undefined' ? global.window : window;

_window.Pixboost = {
  _BREAKPOINTS: [
    {
      name: 'lg',
      mediaQuery: '(min-width: 990px)'
    },
    {
      name: 'md',
      mediaQuery: '(min-width: 640px)'
    },
    {
      name: 'sm'
    }
  ],

  _apiKey: '',

  /**
   * This function is called on DOMContentLoaded event.
   *
   * Looks up <script> tag with id="pb-script" and loads settings from attributes.
   * Supported attributes:
   *  - data-autoload - if present then will execute picture replacement
   *  - data-api-key - api ket that will be used. Must be set if data-autoload is set
   *
   * Also, this function will setup listener for pbUpdate event that will execute picture replacement.
   * It would be usefull if content is loaded through AJAX requests.
   */
  init: function () {
    var scriptTag = _window.document.getElementById('pb-script');
    if (typeof scriptTag !== 'undefined' && scriptTag) {
      var autoload = scriptTag.hasAttribute('data-autoload');
      var apiKey = scriptTag.getAttribute('data-api-key');

      if (apiKey) {
        _window.Pixboost._apiKey = apiKey;
      }

      if (autoload) {
        _window.Pixboost.picture({apiKey: apiKey});
      }

      _window.document.addEventListener('pbUpdate', function(e) {
        _window.Pixboost.picture({
          apiKey: e.detail ? e.detail.apiKey : undefined
        });
      });
    }
  },

  /**
   * Generates <picture> tag into all tags that have
   * data-pb-picture attribute.
   * @param {object} options
   * @param {string} options.apiKey Pixboost api key that will be used
   */
  picture: function (options) {
    var self = this;
    var doc = _window.document;

    options = options || {};

    var apiKey = options.apiKey || _window.Pixboost._apiKey;
    if (!apiKey) {
      throw 'apiKey option is mandatory';
    }

    var pixboostUrl = function (src, op, params) {
      var url = 'https://pixboost.com/api/2/img/' + src + '/' + op + '?auth=' + apiKey;
      if (params) {
        url += '&' + params;
      }

      return url;
    };

    var createSource = function (mediaQuery, src, op, params) {
      var el = doc.createElement('source');

      el.setAttribute('srcset', pixboostUrl(src, op, params));
      el.setAttribute('media', mediaQuery);

      return el;
    };

    doc.querySelectorAll('[data-pb-picture]').forEach(function (el) {
      var pic = doc.createElement('picture');

      self._BREAKPOINTS.forEach(function (bp, idx) {
        var
          attrUrl = el.getAttribute('data-pb-' + bp.name + '-url'),
          attrOp = el.getAttribute('data-pb-' + bp.name),
          attrOpParams = el.getAttribute('data-pb-' + bp.name + '-params'),
          isLast = idx === self._BREAKPOINTS.length - 1;

        if (isLast) {
          var imgEl = doc.createElement('img');
          imgEl.setAttribute('src', pixboostUrl(attrUrl, attrOp, attrOpParams));
          pic.appendChild(imgEl);
        } else {
          pic.appendChild(createSource(bp.mediaQuery, attrUrl, attrOp, attrOpParams));
        }
      });

      el.parentNode.replaceChild(pic, el);
    });
  }
};

if (typeof _window.document !== 'undefined') {
  if (_window.document.readyState === 'interactive') {
    _window.Pixboost.init();
  } else {
    _window.document.addEventListener('DOMContentLoaded', _window.Pixboost.init);
  }
}
