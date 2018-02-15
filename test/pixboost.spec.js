'use strict';

const jsdom = require('jsdom');
const assert = require('assert');

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

  describe('picture()', function() {
    const testCases = (urls) => {
      it('should contain one picture tag', () => {
        const pictures = global.window.document.getElementsByTagName('picture');
        assert.equal(pictures.length, 1);
      });

      [
        {
          name: 'md',
          mediaQuery: '(min-width: 640px)',
          srcset: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?auth=123&size=300'
        },
        {
          name: 'lg',
          mediaQuery: '(min-width: 990px)',
          srcset: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123'
        }
      ].forEach((b) => {
        it(`should generate <source> for ${b.name} breakpoint`, () => {
          const source = global.window.document.querySelectorAll(`source[media="${b.mediaQuery}"]`);
          assert.equal(source.length, 1);
          assert.equal(source[0].getAttribute('srcset'), urls[b.name]);
        });
      });

      it('should contain <img> that points to the small breakpoint', () => {
        const img = global.window.document.querySelectorAll(`img`);
        assert.equal(img.length, 1);
        assert.equal(img[0].getAttribute('src'), urls['img']);
      });
    };

    describe('when inserting <picture> tag manually', function () {

      beforeEach(async () => {
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/picture/test.html', {virtualConsole});
        global.window.document = dom.window.document;

        pixboost.picture({apiKey: '123'});
      });

      testCases({
        lg: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
    });

    describe('when dispatch pbUpdate event', () => {
      beforeEach(async () => {
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/picture/test-init.html', {virtualConsole});
        global.window.document = dom.window.document;
        pixboost.init();
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
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/picture/test-custom-event.html', {virtualConsole});
        global.window.document = dom.window.document;
        pixboost.init();
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
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/picture/test-autoload.html', {virtualConsole});
        global.window.document = dom.window.document;
        pixboost.init();
      });

      testCases({
        lg: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
    });

    describe('when using default url', () => {
      beforeEach(async () => {
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/picture/test-default-attrs.html', {virtualConsole});
        global.window.document = dom.window.document;

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
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/picture/test-hide.html', {virtualConsole});
        global.window.document = dom.window.document;

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
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/picture/test-custom-domain.html', {virtualConsole});
        global.window.document = dom.window.document;

        pixboost.picture({apiKey: '123', domain: 'static.doggy.com'});
      });

      testCases({
        lg: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123',
        md: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-md.png/resize?size=300&auth=123',
        img: 'https://static.doggy.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?size=100x100&auth=123'
      });
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

    describe('when inserting <img> tag manually', function () {
      beforeEach(async () => {
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/image/test.html', {virtualConsole});
        global.window.document = dom.window.document;

        pixboost.image({apiKey: '123'});
      });

      testCases('https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when dispatch pbUpdate event', () => {
      beforeEach(async () => {
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/image/test-init.html', {virtualConsole});
        global.window.document = dom.window.document;
        pixboost.init();
        global.window.document.dispatchEvent(new dom.window.CustomEvent('pbUpdate'));
      });

      testCases('https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when dispatch custom event', () => {
      beforeEach(async () => {
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/image/test-custom-event.html', {virtualConsole});
        global.window.document = dom.window.document;
        pixboost.init();
        global.window.document.dispatchEvent(new dom.window.CustomEvent('contentloaded'));
      });

      testCases('https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when autoload is turned on', () => {
      beforeEach(async () => {
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/image/test-autoload.html', {virtualConsole});
        global.window.document = dom.window.document;
        pixboost.init();
      });

      testCases('https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');
    });

    describe('when using custom domain', () => {
      beforeEach(async () => {
        const dom = await jsdom.JSDOM.fromFile('./test/fixtures/image/test-custom-domain.html', {virtualConsole});
        global.window.document = dom.window.document;

        pixboost.image({apiKey: '123', domain: 'static.doggy.com'});
      });

      testCases('https://static.doggy.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=123');    });
  });
});
