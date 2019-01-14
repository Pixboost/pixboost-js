'use strict';

const jsdom = require('jsdom');
const assert = require('assert');
const matchMediaPolyfill = require('mq-polyfill').default;

describe('Pixboost JS', function () {
  let pixboost;
  let virtualConsole;

  before(() => {
    global.window = {};
    require('../pixboost');
    pixboost = global.window.Pixboost;

    virtualConsole = new jsdom.VirtualConsole();
    virtualConsole.sendTo(console);
  });

  const setup = async (fixture, cookies, userAgent) => {
    const cookieJar = new jsdom.CookieJar();
    if (Array.isArray(cookies) && cookies.length > 0) {
      cookies.forEach(c => {
        cookieJar.setCookieSync(`${c};domain=127.0.0.1`, 'http://127.0.0.1', {});
      });
    }

    const jsDomOptions = {
      virtualConsole,
      cookieJar,
      url:'http://127.0.0.1'
    };
    if (userAgent) {
      jsDomOptions.userAgent = userAgent;
    }

    const dom = await jsdom.JSDOM.fromFile(fixture, jsDomOptions);
    global.window.Event = dom.window.Event;
    global.window.dispatchEvent = dom.window.dispatchEvent;
    global.window.addEventListener = dom.window.addEventListener;
    global.window.screen = dom.window.screen;
    global.window.document = dom.window.document;
    global.window.navigator = dom.window.navigator;
    global.window.IntersectionObserver = () => {};
    matchMediaPolyfill(global.window);

    global.window.resizeTo = function(width, height) {
      Object.assign(this, {
        innerWidth: width,
        innerHeight: height,
        outerWidth: width,
        outerHeight: height,
      }).dispatchEvent(new this.Event('resize'));
    };
    pixboost.init();

    return dom;
  };

  describe('picture()', () => {
    const testCases = (urls) => {
      it('should contain one picture tag', () => {
        const pictures = global.window.document.getElementsByTagName('picture');
        assert.equal(pictures.length, 1);
      });

      [
        {
          name: 'md',
          mediaQuery: '(min-width: 640px)'
        },
        {
          name: 'lg',
          mediaQuery: '(min-width: 990px)',
        },
        {
          name: 'sm',
          mediaQuery: ''
        }
      ].forEach((b) => {
        if (urls[b.name]) {
          it(`should generate <source> for ${b.name} breakpoint`, () => {
            const source = global.window.document.querySelectorAll(`source[media="${b.mediaQuery}"]`);
            assert.equal(source.length, 1);
            assert.equal(source[0].getAttribute('srcset'), urls[b.name]);
          });
        }
      });

      if (urls.img) {
        it('should contain <img> that points to the small breakpoint', () => {
          const img = global.window.document.querySelectorAll(`img`);
          assert.equal(img.length, 1);
          assert.equal(img[0].getAttribute('src'), urls['img']);
        });

        it('should have <img> with alt attribute', () => {
          const img = global.window.document.querySelectorAll(`img`);
          assert.equal(img.length, 1);
          assert.equal(img[0].getAttribute('alt'), 'Doggy');
        });
      } else {
        it('should not have <img>', () => {
          const img = global.window.document.querySelectorAll(`img`);
          assert.equal(img.length, 0);
        });

        it('picture element should have data-alt attribute', () => {
          const pic = global.window.document.querySelectorAll(`picture`);
          assert.equal(pic[0].getAttribute('data-alt'), 'Doggy');
        });
      }
    };

    describe('when inserting <picture> tag manually', () => {

      beforeEach(async () => {
        await setup('./test/fixtures/picture/test.html');

        pixboost.picture({apiKey: '123'});
      });

      testCases({
        lg: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
    });

    describe('when inserting <picture> tag manually in IE9', () => {

      beforeEach(async () => {
        await setup('./test/fixtures/picture/test.html', undefined,
          'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729)');

        pixboost.picture({apiKey: '123'});
      });

      testCases({
        lg: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });

      it('should have video element', () => {
        const video = global.window.document.querySelectorAll(`video`);
        assert.equal(video.length, 1);
      });

      it('source elements must be inside video element', () => {
        const sources = global.window.document.querySelectorAll(`video>source`);
        assert.equal(sources.length, 2);
      });
    });

    describe('when dispatch pbUpdate event', () => {
      beforeEach(async () => {
        const dom = await setup('./test/fixtures/picture/test-init.html');

        global.window.document.dispatchEvent(new dom.window.CustomEvent('pbUpdate'));
      });

      testCases({
        lg: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
    });

    describe('when dispatch custom event', () => {
      beforeEach(async () => {
        const dom = await setup('./test/fixtures/picture/test-custom-event.html');

        global.window.document.dispatchEvent(new dom.window.CustomEvent('contentloaded'));
      });

      testCases({
        lg: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
    });

    describe('when autoload is turned on', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/picture/test-autoload.html');
      });

      testCases({
        lg: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
    });

    describe('when using default url', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/picture/test-default-attrs.html');

        pixboost.picture({apiKey: '123'});
      });

      testCases({
        lg: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/optimise?auth=123',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123',
        img: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/fit?size=100x100&auth=123'
      });
    });

    describe('when using hide operation', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/picture/test-hide.html');

        pixboost.picture({apiKey: '123'});
      });

      testCases({
        lg: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/fit?size=100x100&auth=123',
        img: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      });
    });

    describe('when using custom domain', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/picture/test-custom-domain.html');

        pixboost.picture({apiKey: '123', domain: 'static.doggy.com'});
      });

      testCases({
        lg: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
    });

    describe('when disabled', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/picture/test-disabled.html');

        pixboost.picture({apiKey: '123', domain: 'static.doggy.com'});
      });

      testCases({
        lg: 'https://yoursite.com/doggy-lg.png',
        md: 'https://yoursite.com/doggy-md.png',
        img: 'https://yoursite.com/doggy-sm.png'
      });
    });

    describe('when protocol doubled', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/picture/test-double-protocol.html');

        pixboost.picture({apiKey: '123'});
      });

      testCases({
        lg: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
    });

    describe('when disabled by cookie', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/picture/test-cookie-enable.html');

        pixboost.picture({apiKey: '123', domain: 'static.doggy.com'});
      });

      testCases({
        lg: 'https://yoursite.com/doggy-lg.png',
        md: 'https://yoursite.com/doggy-md.png',
        img: 'https://yoursite.com/doggy-sm.png'
      });
    });

    describe('when enabled by cookie', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/picture/test-cookie-enable.html', ['optimized-images=true']);

        pixboost.picture({apiKey: '123', domain: 'static.doggy.com'});
      });

      testCases({
        lg: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
    });


    describe('when lazyload', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/picture/test-lazyload.html');

        pixboost.picture({apiKey: '123', domain: 'static.doggy.com'});
      });

      //Here we don't have image, but have <source> with all breakpoints.
      testCases({
        lg: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        sm: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      }, true);
    });
  });

  describe('image()', () => {
    const testCases = (src) => {
      it('should contain one img tag', () => {
        const images = global.window.document.getElementsByTagName('img');
        assert.equal(images.length, 1);
      });

      it('should has src attribute', () => {
        const img = global.window.document.getElementsByTagName(`img`);
        assert.equal(img[0].getAttribute('src'), src);
      });

      it('should not have data-pb-image attribute after replacement', () => {
        const img = global.window.document.getElementsByTagName(`img`);
        assert.equal(img[0].hasAttribute('data-pb-image'), false);
      });
    };

    describe('when inserting <img> tag manually', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/image/test.html');

        pixboost.image({apiKey: '123'});
      });

      testCases('https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when dispatch pbUpdate event', () => {
      beforeEach(async () => {
        const dom = await setup('./test/fixtures/image/test-init.html');

        global.window.document.dispatchEvent(new dom.window.CustomEvent('pbUpdate'));
      });

      testCases('https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when dispatch custom event', () => {
      beforeEach(async () => {
        const dom = await setup('./test/fixtures/image/test-custom-event.html');

        global.window.document.dispatchEvent(new dom.window.CustomEvent('contentloaded'));
      });

      testCases('https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when autoload is turned on', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/image/test-autoload.html');
      });

      testCases('https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when using custom domain', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/image/test-custom-domain.html');

        pixboost.image({apiKey: '123', domain: 'static.doggy.com'});
      });

      testCases('https://static.doggy.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when disabled', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/image/test-disabled.html');

        pixboost.image({apiKey: '123', domain: 'static.doggy.com'});
      });

      testCases('https://yoursite.com/doggy.png');
    });

    describe('when protocol doubled', () => {
        beforeEach(async () => {
            await setup('./test/fixtures/image/test-double-protocol.html');

            pixboost.image({apiKey: '123'});
        });

        testCases('https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when lazy load', () => {
        const src = 'https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123';
        beforeEach(async () => {
            await setup('./test/fixtures/image/test-lazyload.html');

            pixboost.image({apiKey: '123'});
        });

        it('should contain one img tag', () => {
          const images = global.window.document.getElementsByTagName('img');
          assert.equal(images.length, 1);
        });

        it('should has data-src attribute', () => {
          const img = global.window.document.getElementsByTagName(`img`);
          assert.equal(img[0].getAttribute('data-src'), src);
        });

        it('should not have src attribute', () => {
          const img = global.window.document.getElementsByTagName(`img`);
          assert.equal(img[0].hasAttribute('src'), false);
        });

        it('should not have data-pb-image attribute after replacement', () => {
          const img = global.window.document.getElementsByTagName(`img`);
          assert.equal(img[0].hasAttribute('data-pb-image'), false);
        });
    });
  });

  describe('background', () => {
    describe('simple', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/background/test.html');

        pixboost.background({apiKey: '123'});
      });

      it('should have background image style attribute', () => {
        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/optimise?auth=123)`);
      });
    });

    describe('responsive', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/background/test-responsive.html');
      });

      it('should set background image for desktop', () => {
        global.window.resizeTo(1024, 768);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123)`);
      });

      it('should set background image for tablet', () => {
        global.window.resizeTo(768, 1024);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123)`);
      });

      it('should set background image for mobile', () => {
        global.window.resizeTo(500, 400);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123)`);
      });
    });

    describe('responsive with default url', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/background/test-responsive-default-url.html');
      });

      it('should set background image for desktop', () => {
        global.window.resizeTo(1024, 768);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/optimise?auth=123)`);
      });

      it('should set background image for tablet', () => {
        global.window.resizeTo(768, 1024);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123)`);
      });

      it('should set background image for mobile', () => {
        global.window.resizeTo(500, 400);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/fit?size=100x100&auth=123)`);
      });
    });

    describe('when using hide operation', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/background/test-hide.html');
      });

      it('should set background image for desktop', () => {
        global.window.resizeTo(1024, 768);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/optimise?auth=123)`);
      });

      it('should hide image on tablet', () => {
        global.window.resizeTo(768, 1024);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)`);
      });

      it('should hide image on mobile', () => {
        global.window.resizeTo(500, 400);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)`);
      });
    });

    describe('when using lazy loading', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/background/test-lazy.html');
      });

      it('should set background image for desktop', () => {
        global.window.resizeTo(1024, 768);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].getAttribute('data-background-image'), `https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123`);
      });
    });

    describe('when using lazy loading and background already loaded', () => {
      beforeEach(async () => {
        await setup('./test/fixtures/background/test-lazy-loaded.html');
      });

      it('should set background image for desktop', () => {
        global.window.resizeTo(1024, 768);

        pixboost.background({apiKey: '123'});

        const div = global.window.document.getElementsByTagName(`div`);
        assert.equal(div[0].style.backgroundImage, `url(https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123)`);
      });
    });
  });
});
