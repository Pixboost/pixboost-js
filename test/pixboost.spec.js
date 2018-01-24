'use strict';

const jsdom = require('jsdom');
const assert = require('assert');

const testCases = () => {
  it('should contain one picture tag', () => {
    const pictures = global.window.document.getElementsByTagName('picture');
    assert.equal(pictures.length, 1);
  });

  [
    {
      name: 'sm',
      mediaQuery: '(max-width: 576px)',
      srcset: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-sm.png/fit?auth=123&size=100x100'
    },
    {
      name: 'md',
      mediaQuery: '(max-width: 768px)',
      srcset: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-md.png/resize?auth=123&size=300'
    },
    {
      name: 'lg',
      mediaQuery: '(min-width: 769px)',
      srcset: 'https://pixboost.com/api/2/img/https://yoursite.com/doggy-lg.png/optimise?auth=123'
    }
  ].forEach((b) => {
    it(`should generate <source> for ${b.name} breakpoint`, () => {
      const source = global.window.document.querySelectorAll(`source[media="${b.mediaQuery}"]`);
      assert.equal(source.length, 1);
      assert.equal(source[0].getAttribute('srcset'), b.srcset);
    });
  });

  it('should contain <img> fallback that points to the desktop image', () => {
    const img = global.window.document.querySelectorAll(`img`);
    assert.equal(img.length, 1);
    assert.equal(img[0].getAttribute('src'), 'https://yoursite.com/doggy-lg.png');
  });
};

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

  describe('when inserting <picture> tag manually', function () {

    beforeEach(async () => {
      const dom = await jsdom.JSDOM.fromFile('./test/test.html', {virtualConsole});
      global.window.document = dom.window.document;

      pixboost.picture({apiKey: '123'});
    });

    testCases();
  });

  describe('when dispatch pbUpdate event', () => {
    let dom;
    beforeEach(async () => {
      dom = await jsdom.JSDOM.fromFile('./test/test-init.html', {virtualConsole});
      global.window.document = dom.window.document;
      pixboost.init();
      global.window.document.dispatchEvent(new dom.window.CustomEvent('pbUpdate'));
    });

    testCases();
  });

  describe('when autoload is turned on', () => {
    let dom;
    beforeEach(async () => {
      dom = await jsdom.JSDOM.fromFile('./test/test-autoload.html', {virtualConsole});
      global.window.document = dom.window.document;
      pixboost.init();
    });

    testCases();
  });

});
