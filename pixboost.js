'use strict';

var _window = typeof global !== 'undefined' ? global.window : window;

function getBrowser() {
  var ua=_window.navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if(/trident/i.test(M[1])){
    tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
    return {name:'IE',version:(tem[1]||'')};
  }
  if(M[1]==='Chrome'){
    tem=ua.match(/\bOPR|Edge\/(\d+)/)
    if(tem!=null)   {return {name:'Opera', version:tem[1]};}
  }
  M=M[2]? [M[1], M[2]]: [_window.navigator.appName, _window.navigator.appVersion, '-?'];
  if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
  return {
    name: M[0],
    version: M[1]
  };
}

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
      name: 'sm',
      mediaQuery: ''
    }
  ],

  _apiKey: '',
  _domain: '',
  _disabled: false,
  _browser: '',

  _pixboostUrl: function (src, op, domain, apiKey, disabled) {
    if (op.indexOf('hide') === 0) {
      return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    }
    src = src.replace('https:https:', 'https:').replace('https:http:', 'http:');
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
    _window.Pixboost._browser = getBrowser();

    var scriptTag = _window.document.getElementById('pb-script');
    if (typeof scriptTag !== 'undefined' && scriptTag) {
      var autoload = scriptTag.hasAttribute('data-autoload');
      var apiKey = scriptTag.getAttribute('data-api-key');
      var domain = scriptTag.getAttribute('data-domain');
      var events = scriptTag.getAttribute('data-events');
      var jqueryEvents = scriptTag.getAttribute('data-jquery-events');
      var disabled = scriptTag.hasAttribute('data-disabled');
      var enableByCookie = scriptTag.getAttribute('data-cookie-enable');
      var runUpdate = function(apiKey) {
        _window.Pixboost.picture({apiKey: apiKey});
        _window.Pixboost.image({apiKey: apiKey});
        if (_window.lozad) {
          var observer = _window.lozad(_window.document.querySelectorAll('[data-pb-lazy]'));
          observer.observe();
        }
      };

      if (apiKey) {
        _window.Pixboost._apiKey = apiKey;
      }
      if (domain) {
        _window.Pixboost._domain = domain;
      }

      _window.Pixboost._disabled = disabled;

      if (!disabled && enableByCookie) {
        var cookieRegExp = new RegExp('(?:(?:^|.*;\\s*)' + enableByCookie + '\\s*\\=\\s*([^;]*).*$)|^.*$');
        var cookieValue = _window.document.cookie.replace(cookieRegExp, "$1");
        if (cookieValue !== 'true') {
          _window.Pixboost._disabled = true;
        }
      }

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
    var browser = _window.Pixboost._browser;
    var isIE9 = browser.name === 'MSIE' && browser.version === '9';
    var isIE = browser.name === 'MSIE' || browser.name === 'IE'; //TODO: exclude EDGE

    options = options || {};

    var apiKey = options.apiKey || _window.Pixboost._apiKey;
    if (!apiKey) {
      throw 'apiKey option is mandatory';
    }
    var domain = options.domain || _window.Pixboost._domain || 'pixboost.com';

    var createImage = function (url, op, isIE9) {
      var imgEl = doc.createElement('img');
      imgEl.setAttribute('src', self._pixboostUrl(url, op, domain, apiKey, _window.Pixboost._disabled));

      if (isIE9) {
        if (imgEl.hasAttribute('width')) {
          imgEl.removeAttribute('width');
        }
        if (imgEl.hasAttribute('height')) {
          imgEl.removeAttribute('height');
        }
      }
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
        isLazy = el.getAttribute('data-pb-lazy') !== undefined,
        pic = doc.createElement('picture');

      //Make <picture> work in IE9 - https://scottjehl.github.io/picturefill/#ie9
      var video;
      if (isIE9) {
        video = doc.createElement('video');
        video.setAttribute('style', 'display: none;');
        pic.appendChild(video);
      }

      if(isLazy && !isIE) {
        pic.setAttribute('data-pb-lazy', "");
      }

      self._BREAKPOINTS.forEach(function (bp, idx) {
        var attrUrl = el.getAttribute(attrPrefix + bp.name + '-url'),
          attrOp = el.getAttribute(attrPrefix + bp.name),
          isLast = idx === self._BREAKPOINTS.length - 1,
          url = attrUrl || defaultUrl;

        if (isLast) {
          if (isLazy && !isIE) {
            pic.appendChild(createSource(bp.mediaQuery, url, attrOp));
          } else {
            pic.appendChild(createImage(url, attrOp, isIE9));
          }
        } else if (isIE9) {
          video.appendChild(createSource(bp.mediaQuery, url, attrOp));
        } else {
          pic.appendChild(createSource(bp.mediaQuery, url, attrOp));
        }
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
        op = el.getAttribute(attrPrefix + 'op'),
        isLazy = el.getAttribute(attrPrefix + 'pb-lazy');

      el.removeAttribute('data-pb-image');
      if (isLazy) {
        el.setAttribute('src', self._pixboostUrl(src, op, domain, apiKey, _window.Pixboost._disabled));
      } else {
        el.setAttribute('data-src', self._pixboostUrl(src, op, domain, apiKey, _window.Pixboost._disabled));
      }
    }
  }
};

if (typeof _window.document !== 'undefined') {
  if (_window.document.readyState === 'complete' ||
    // !IE 8-10
    (_window.document.readyState !== 'loading' && !_window.document.documentElement.doScroll)
  ) {
    _window.Pixboost.init();
  } else {
    _window.document.addEventListener('DOMContentLoaded', _window.Pixboost.init);
  }
}
