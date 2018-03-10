# pixboost-js

[![Build Status](https://travis-ci.org/Pixboost/pixboost-js.svg?branch=master)](https://travis-ci.org/Pixboost/pixboost-js)


Javascript library to integrate [Pixboost](https://pixboost.com) into a web application that
can directly access DOM, e.g. using JQuery, Backbone or other libraries.

Table of Contents:

* [Usage](#usage)
    * [Responsive images](#responsive-images)
        * [Operations](#operations)
        * [Supporting Breakpoints](#supporting-breakpoints)
    * [Non-responsive images](#not-responsive-images)
    * [Replacing on document load](#replacing-on-document-load)
    * [Custom domain name](#custom-domain-name)
    * [Reloading](#reloading)
        * [Custom reload events](#custom-reload-events)
    * [Disabling](#disabling)
* [Browsers Support](#browsers-support)
* [Build](#build)
    * [Using Docker](#using-docker)

## Usage

Add below code into your HTML page to include library:

```html
<script type="text/javascript" src="https://pixboost.com/libs/pixboost.js"></script> 
```

### Responsive images

Library replaces all elements that marked with a data-pb-picture attribute with `<picture>` tag.
Picture tag will include different sources (images) for different CSS breakpoints (screen sizes).

For instance, for this element:

```html
<div data-pb-picture
    data-lg="optimise"
    data-lg-url="https://yoursite.com/doggy.png"
    data-md="resize?size=300"
    data-md-url="https://yoursite.com/doggy.png"
    data-sm="fit?size=100x100"
    data-sm-url="https://yoursite.com/doggy.png"/>
```

when you run picture() function from the library: 

```js
    window.Pixboost.picture({apiKey: 'API_KEY'})
```

then inserted `<picture>` tag will be:

```html
<picture>
    <source srcset="https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/optimise?auth=API_KEY" 
        media="(min-width: 769px)">
    <source srcset="https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=API_KEY" 
        media="(max-width: 768px)">
    <source srcset="https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/fit?size=100x100&auth=API_KEY" 
        media="(max-width: 576px)">
    <img src="https://yoursite.com/doggy.png"
</picture>
```

#### Operations

Operations (`data-<BREAKPOINT>` attribute):

* optimise
* resize
* fit
* asis
* hide

You can specify operation arguments by adding them after operation name, e.g. `fit?size=100x100`

See more about operations [here](https://pixboost.com/docs/api/).

If you have the same source image for all operations then you can specify default URL:

```html
<div data-pb-picture
    data-url="https://yoursite.com/doggy.png"
    data-lg="optimise"
    data-md="resize?size=300"
    data-sm="fit?size=100x100"/>
``` 

#### Supporting Breakpoints


* _lg_ - Large devices (desktops, 990px and up)
  `@media (min-width: 990px)`

* _md_ - Medium devices (tablets, 640px and up)
  `@media (min-width: 640px)`

* _sm_ - Small devices - everything below tablets

### Not responsive images

You can use library with `<img>` tag as well. Below is an example of image that will be replaced with optimised
version:

```html
<img data-op="resize?size=x600" data-src="https://yoursite.com/doggy.png" data-pb-image/>
```

Call the `image()` function from the library if not using automatic replacement (see below).

### Replacing on document load

You can turn on automatic replacement by setting up `data-autoload` attribute on `<script>` tag:

```html
    <script type="text/javascript" src="https://pixboost.com/libs/pixboost.js" 
        id="pb-script" 
        data-api-key="API_KEY"
        data-autoload></script>
```

### Custom domain name

If you have [custom domain name](https://help.pixboost.com/setup/custom-domain.html) setup then
you can pass domain to the script tag using `data-domain` attribute:

```html
    <script type="text/javascript" src="https://pixboost.com/libs/pixboost.js" 
        id="pb-script" 
        data-api-key="API_KEY"
        data-domain="static.yoursite.com"
        data-autoload></script>
```

Or you can pass it to picture() call:

```js
  window.Pixboost.picture({apiKey: 'API_KEY', domain: 'static.yoursite.com'})
```

### Reloading

If you are fetching content using AJAX then you might want to run `picture()` and `image()` once requests finished.
You can do this manually using `window.Pixboost.picture()` and `window.Pixboost.image()` call or you can trigger 
`pbUpdate` event:

```js
    var pbUpdateEvent = document.createEvent("Event");
    pbUpdateEvent.initEvent("pbUpdate", false, true);
    document.dispatchEvent(pbUpdateEvent);
```

#### Custom reload events

The library supports native DOM events and JQuery. You can specify a list of events separated
by the comma in `data-events` or `data-jquery-events` attributes. For example,

```
    <script type="text/javascript" src="https://pixboost.com/libs/pixboost.js" 
            id="pb-script" 
            data-api-key="API_KEY"
            data-events="contentloaded"></script>
```

Then to trigger update:

```
    var contentLoadedEvent = document.createEvent("Event");
    contentLoadedEvent.initEvent("contentloaded", false, true);
    document.dispatchEvent(contentLoadedEvent);
```

And with JQuery:

```
    <script type="text/javascript" src="https://pixboost.com/libs/pixboost.js" 
            id="pb-script" 
            data-api-key="API_KEY"
            data-jquery-events="contentloaded"></script>
```

Then to trigger update:

```
    $(document).trigger("contentloaded");
```

### Disabling

You can globally disable URL transformations using `data-disabled` attribute.

```html
    <script type="text/javascript" src="https://pixboost.com/libs/pixboost.js" 
        id="pb-script" 
        data-api-key="API_KEY"
        data-disabled></script>
```

### Enabling by cookie

Sometimes you would want to enable optimized images only if cookie presents. This is useful
if you are using Optimizely or other AB testing services, so you can turn on optimization for a small amount 
of your customers in the beginning and increase it through time.

```html
    <script type="text/javascript" src="https://pixboost.com/libs/pixboost.js" 
        id="pb-script" 
        data-api-key="API_KEY"
        data-cookie-enable="optimized-images"></script>
```

Value of the cookie must be set to `true`.

## Browsers Support

The library supports all major browsers including Chrome, Firefox, Safari and Internet Explorer.
Internet Explorer 9 requires polyfill for `<picture>` implementations. We are recommending to use
[picturefill](http://scottjehl.github.io/picturefill/) version 3. Pixboost-js has integration with
it and will call `window.picturefill()` once replacements are done. 

## Build

There is a `prepare` to build a minified version of the library. It will be run on `npm install` execution.
Result files will be generated into `dist/` folder.

### Using Docker

If you don't have Nodejs installed locally then you can use docker:

```
$ docker build -t pixboost-js .
$ docker run -v $(pwd):/app --rm pixboost-js
``` 
