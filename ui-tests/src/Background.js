const assert = require('chai').assert;

describe('Background', function() {
  it('simple', function () {
    return this.browser
      .url('http://localhost:8080/examples/bg-simple.html')
      .pause(1000) //for Firefox
      .assertView('plain', '.js-app');
  });

  it('responsive', function() {
    return this.browser
      .url('http://localhost:8080/examples/bg-responsive.html')
      .pause(1000) //for Firefox
      .assertView('plain', '.js-app');
  });

  hermione.skip.in('ie', `IE doesn't support intersection observer`);
  it('lazy', function() {
    const browserId = this.browser.executionContext.browserId;
    return this.browser
      .url('http://localhost:8080/examples/bg-lazy.html')
      .waitUntil(() => {
        return this.browser.execute(function() {
          return document.querySelector('[data-pb-background]').style.backgroundImage;
        }).then(bgImage => {
          return bgImage.value === ''
        });
      }, 5000)
      .scroll('[data-pb-background]')
      .waitUntil(() => {
        return this.browser.execute(function() {
          return document.querySelector('[data-pb-background]').style.backgroundImage;
        }).then(bgImage => {
          switch (browserId) {
            case 'mobile': return  bgImage.value === 'url("https://pixboost.com/api/2/img/http://www.midday.coffee/assets/banner.jpg/fit?size=300x300&auth=MTg4MjMxMzM3MA__")';
            case 'tablet': return  bgImage.value === 'url("https://pixboost.com/api/2/img/http://www.midday.coffee/assets/banner.jpg/resize?size=600&auth=MTg4MjMxMzM3MA__")';
            default: return bgImage.value === 'url("https://pixboost.com/api/2/img/http://www.midday.coffee/assets/banner.jpg/optimise?auth=MTg4MjMxMzM3MA__")';
          }
        });
      }, 5000)
  });

});