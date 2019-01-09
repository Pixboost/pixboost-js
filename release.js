'use strict';

const UglifyJS = require('uglify-js');
const fs = require('fs');
const rimraf = require('rimraf');

const version = require('./package.json').version;
const src = fs.readFileSync(`${__dirname}/pixboost.js`).toString('utf-8');
const lozadSrc = fs.readFileSync(`${__dirname}/vendor/lozad.min.js`).toString('utf-8');
const picturefillSrc = fs.readFileSync(`${__dirname}/vendor/picturefill.js`).toString('utf-8');

const code = {
  'pixboost.js': `/* @preserve ${version} */\n${src}`
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

const minifiedWithVersion = UglifyJS.minify(code, {
  sourceMap: {
    filename: `pixboost-${version}.js`,
    url: `pixboost-${version}.js.map`
  },
  output: {
    comments: 'some'
  }
});
if (minifiedWithVersion.error) {
  console.error(`Couldn't minify code: ${minifiedWithVersion.error}`);
  process.exit(3);
}

const bundleCode = {
  'picturefill.js': picturefillSrc,
  'lozad.js': lozadSrc,
  'pixboost.js': `/* @preserve ${version} */\n${src}`,
};
const bundleMinified = UglifyJS.minify(bundleCode, {
  sourceMap: {
    filename: 'pixboost.bundle.js',
    url: 'pixboost.bundle.js.map'
  },
  output: {
    comments: 'some'
  }
});

if (bundleMinified.error) {
  console.error(`Couldn't minify code: ${bundleMinified.error}`);
  process.exit(2);
}

const bundleMinifiedWithVersion = UglifyJS.minify(bundleCode, {
  sourceMap: {
    filename: `pixboost-${version}.bundle.js`,
    url: `pixboost-${version}.bundle.js.map`
  },
  output: {
    comments: 'some'
  }
});

if (bundleMinifiedWithVersion.error) {
  console.error(`Couldn't minify code: ${bundleMinifiedWithVersion.error}`);
  process.exit(4);
}

const distDir = `${__dirname}/dist`;
if (fs.existsSync(distDir)) {
  rimraf.sync(distDir);
}

fs.mkdirSync(distDir);

fs.writeFileSync(`${distDir}/pixboost.js`, code['pixboost.js']);
fs.writeFileSync(`${distDir}/pixboost.min.js`, minified.code);
fs.writeFileSync(`${distDir}/pixboost.js.map`, minified.map);

fs.writeFileSync(`${distDir}/pixboost-${version}.js`, code['pixboost.js']);
fs.writeFileSync(`${distDir}/pixboost-${version}.min.js`, minifiedWithVersion.code);
fs.writeFileSync(`${distDir}/pixboost-${version}.js.map`, minifiedWithVersion.map);

fs.writeFileSync(`${distDir}/pixboost.bundle.min.js`, bundleMinified.code);
fs.writeFileSync(`${distDir}/pixboost.bundle.js.map`, bundleMinified.map);

fs.writeFileSync(`${distDir}/pixboost-${version}.bundle.min.js`, bundleMinifiedWithVersion.code);
fs.writeFileSync(`${distDir}/pixboost-${version}.bundle.js.map`, bundleMinifiedWithVersion.map);

fs.copyFileSync(`${__dirname}/vendor/intersection-observer.min.js`, `${distDir}/intersection-observer.min.js`);
fs.copyFileSync(`${__dirname}/vendor/lozad.min.js`, `${distDir}/lozad.min.js`);
fs.copyFileSync(`${__dirname}/vendor/lozad.js`, `${distDir}/lozad.js`);
fs.copyFileSync(`${__dirname}/vendor/picturefill.min.js`, `${distDir}/picturefill.min.js`);
fs.copyFileSync(`${__dirname}/vendor/picturefill.js`, `${distDir}/picturefill.js`);