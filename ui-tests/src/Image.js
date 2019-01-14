const assert = require('chai').assert;

describe('Image', function() {
  it('simple', function () {
    return this.browser
      .url('http://localhost:8080/examples/img-simple.html')
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
      .url('http://localhost:8080/examples/img-lazy.html')
      .getAttribute('img', 'src')
      .then(src => {
        assert.isNull(src);
      })
      .scroll('img')
      .getAttribute('img', 'src')
      .then(src => {
        assert.equal(src, 'https://pixboost.com/api/2/img/http://www.midday.coffee/midday-coffee.jpg/resize?size=x200&auth=MTg4MjMxMzM3MA__');
      });
  });
});