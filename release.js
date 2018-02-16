'use strict';

const UglifyJS = require('uglify-js');
const fs = require('fs');
const rimraf = require('rimraf');

const version = require('./package.json').version;
const src = fs.readFileSync(`${__dirname}/pixboost.js`).toString('utf-8');
const code = {
  'pixboost.js': `/*@preserve ${version}*/\n${src}`
};
const minified = UglifyJS.minify(code, {
  sourceMap: {
    filename: 'pixboost.js',
    url: 'pixboost.js.map'
  },
  output: {
    comments: 'some'
  }
});

if (minified.error) {
  console.error(`Couldn't minify code: ${minified.error}`);
  process.exit(1);
}

const distDir = `${__dirname}/dist`;
if (fs.existsSync(distDir)) {
  rimraf.sync(distDir);
}

fs.mkdirSync(distDir);

fs.writeFileSync(`${distDir}/pixboost.js`, minified.code);
fs.writeFileSync(`${distDir}/pixboost.js.map`, minified.map);