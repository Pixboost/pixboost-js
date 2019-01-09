const assert = require('chai').assert;

describe('Picture', function() {
  it('simple', function () {
    return this.browser
      .url('http://localhost:8080/examples/simple.html')
      .waitUntil(() => {
        return this.browser.execute(function() {
          return document.getElementsByTagName('img')[0].complete
        }).then(complete => {
          return complete.value === true
        });
      }, 5000)
      .assertView('plain', '.js-app');
  });

  it('hide', function () {
    return this.browser
      .url('http://localhost:8080/examples/hide.html')
      .waitUntil(() => {
        return this.browser.execute(function() {
          return document.getElementsByTagName('img')[0].complete
        }).then(complete => {
          return complete.value === true
        });
      }, 5000)
      .assertView('plain', '.js-app');
  });

  hermione.skip.in('ie', `IE doesn't support intersection observer`);
  it('lazy', function() {
    return this.browser
      .url('http://localhost:8080/examples/lazyload.html')
      .isExisting('img')
      .then(imgExists => {
        assert.equal(imgExists, false);
      })
      .scroll('picture')
      .waitForExist('img');
  });
});