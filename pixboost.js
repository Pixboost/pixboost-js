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
  _domain: '',
  _disabled: false,

  _pixboostUrl: function (src, op, domain, apiKey, disabled) {
    if (op.indexOf('hide') === 0) {
      return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    }
    if (disabled) {
      return src;
    }

    var hasParams = op.indexOf('?') > -1;
    return 'https://' + domain + '/api/2/img/' + src + '/' + op + (hasParams ? '&' : '?') + 'auth=' + apiKey;
  },

  /**
   * This function is called on DOMContentLoaded event.
   *
   * Looks up <script> tag with id="pb-script" and loads settings from attributes.
   * Supported attributes:
   *  - data-autoload - if present then will execute picture replacement
   *  - data-api-key - api ket that will be used. Must be set if data-autoload is set
   *  - data-domain - custom domain name if setup to use instead of pixboost.com
   *  - data-events - comma separated list of events that will trigger update
   *  - data-jquery-events - comma separated list of JQuery events that will trigger event. window.$ should be exist
   *    at the time of the function call
   *  - data-disabled - if attribute presents then won't do any URL transformations. Original URL on picture and img
   *    tags will be used.
   *
   * Also, this function will setup listener for pbUpdate event that will execute picture replacement.
   * It would be useful if content is loaded through AJAX requests.
   */
  init: function () {
    _window.Pixboost._apiKey = '';
    _window.Pixboost._domain = '';
    _window.Pixboost._disabled = false;

    var scriptTag = _window.document.getElementById('pb-script');
    if (typeof scriptTag !== 'undefined' && scriptTag) {
      var autoload = scriptTag.hasAttribute('data-autoload');
      var apiKey = scriptTag.getAttribute('data-api-key');
      var domain = scriptTag.getAttribute('data-domain');
      var events = scriptTag.getAttribute('data-events');
      var jqueryEvents = scriptTag.getAttribute('data-jquery-events');
      var disabled = scriptTag.hasAttribute('data-disabled');
      var runUpdate = function(apiKey) {
        _window.Pixboost.picture({apiKey: apiKey});
        _window.Pixboost.image({apiKey: apiKey});
      };

      if (apiKey) {
        _window.Pixboost._apiKey = apiKey;
      }
      if (domain) {
        _window.Pixboost._domain = domain;
      }

      _window.Pixboost._disabled = disabled;

      if (autoload) {
        runUpdate(apiKey);
      }

      var onEvent = function(e) {
        var eventApiKey = e.detail ? e.detail.apiKey : undefined;
        runUpdate(eventApiKey);
      };
      _window.document.addEventListener('pbUpdate', onEvent);
      if (events) {
        var eventsList = events.split(',');
        for (var i = 0; i < eventsList.length; i++) {
          _window.document.addEventListener(eventsList[i], onEvent);
        }
      }
      if (jqueryEvents && _window.$) {
        var $eventsList = jqueryEvents.split(',');
        for (var i = 0; i < $eventsList.length; i++) {
          _window.$(document).on($eventsList[i], onEvent);
        }
      }
    }
  },

  /**
   * Generates <picture> tag into all tags that have
   * data-pb-picture attribute.
   * @param {object} options
   * @param {string} options.apiKey Pixboost api key that will be used
   * @param {string} options.domain Custom domain name if setup to use instead of pixboost.com
   */
  picture: function (options) {
    var self = this;
    var doc = _window.document;

    options = options || {};

    var apiKey = options.apiKey || _window.Pixboost._apiKey;
    if (!apiKey) {
      throw 'apiKey option is mandatory';
    }
    var domain = options.domain || _window.Pixboost._domain || 'pixboost.com';

    var createImage = function (url, op) {
      var imgEl = doc.createElement('img');
      imgEl.setAttribute('src', self._pixboostUrl(url, op, domain, apiKey, _window.Pixboost._disabled));

      return imgEl;
    };

    var createSource = function (mediaQuery, src, op) {
      var el = doc.createElement('source');

      el.setAttribute('srcset', self._pixboostUrl(src, op, domain, apiKey, _window.Pixboost._disabled));
      el.setAttribute('media', mediaQuery);

      return el;
    };

    //Replacing all pixboost tags with picture
    var pbPictures = doc.querySelectorAll('[data-pb-picture]');
    for (var i = 0; i < pbPictures.length; i++) {
      var el = pbPictures[i];
      var attrPrefix = 'data-',
        defaultUrl = el.getAttribute(attrPrefix + 'url'),
        pic = doc.createElement('picture');

      self._BREAKPOINTS.forEach(function (bp, idx) {
        var attrUrl = el.getAttribute(attrPrefix + bp.name + '-url'),
          attrOp = el.getAttribute(attrPrefix + bp.name),
          isLast = idx === self._BREAKPOINTS.length - 1,
          url = attrUrl || defaultUrl;

        pic.appendChild(isLast ? createImage(url, attrOp) : createSource(bp.mediaQuery, url, attrOp));
      });

      el.parentNode.replaceChild(pic, el);
    }

    //Calling picture polyfill library
    if (_window.picturefill && typeof _window.picturefill === 'function') {
      _window.picturefill();
    }
  },

  /**
   * Finds all <img> tags that have data-pb-image attribute
   * and inserts src attribute using value of data-src attribute
   * as source and operation. For instance:
   * <img data-src="https://site.com/logo.png" data-operation="resize?size=300"/>
   * will be replaced with
   * <img data-src="https://pixboost.com/api/2/img/https://site.com/logo.png/resize?size=300&auth=YOUR_API_KEY"/>
   * @param {object} options
   * @param {string} options.apiKey Pixboost api key that will be used
   * @param {string} options.domain Custom domain name if setup to use instead of pixboost.com
   */
  image: function(options) {
    var doc = _window.document;
    var self = this;

    options = options || {};

    var apiKey = options.apiKey || _window.Pixboost._apiKey;
    if (!apiKey) {
      throw 'apiKey option is mandatory';
    }
    var domain = options.domain || _window.Pixboost._domain || 'pixboost.com';

    var pbImages = doc.querySelectorAll('img[data-pb-image]');
    for (var i = 0; i < pbImages.length; i++) {
      var el = pbImages[i];
      var attrPrefix = 'data-',
        src = el.getAttribute(attrPrefix + 'src'),
        op = el.getAttribute(attrPrefix + 'op');

      el.removeAttribute('data-pb-image');
      el.setAttribute('src', self._pixboostUrl(src, op, domain, apiKey, _window.Pixboost._disabled));
    }
  }
};

if (typeof _window.document !== 'undefined') {
  if (_window.document.readyState === 'interactive') {
    _window.Pixboost.init();
  } else {
    _window.document.addEventListener('DOMContentLoaded', _window.Pixboost.init);
  }
}
