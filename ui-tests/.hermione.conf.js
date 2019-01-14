module.exports = {
  plugins: {
    'html-reporter/hermione': {
      enabled: true,
      path: './hermione/reports',
      defaultView: 'all',
      baseHost: 'localhost'
    }
  },

  sets: {
    all: {
      files: 'src'
    },
    chrome: {
      files: 'src',
      browsers: ['chrome']
    }
  },

  browsers: {
    chrome: {
      desiredCapabilities: {
        browserName: 'chrome'
      },
      windowSize: '1200x800',
      screenshotDelay: 1000
    },
    firefox: {
      desiredCapabilities: {
        browserName: 'firefox'
      },
      windowSize: '1200x800',
      screenshotDelay: 1000
    },
    ie: {
      desiredCapabilities: {
        browserName: 'internet explorer'
      },
      windowSize: '1200x800',
      screenshotDelay: 1000
    },
    mobile: {
      desiredCapabilities: {
        browserName: 'chrome'
      },
      windowSize: '375x667',
      screenshotDelay: 1000
    },
    tablet: {
      desiredCapabilities: {
        browserName: 'chrome'
      },
      windowSize: '768x1024',
      screenshotDelay: 1000
    }
    // edge: {
    //   desiredCapabilities: {
    //     browserName: 'MicrosoftEdge'
    //   }
    // }
  }
};