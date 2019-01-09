# pixboost-js

[![Build Status](https://travis-ci.org/Pixboost/pixboost-js.svg?branch=master)](https://travis-ci.org/Pixboost/pixboost-js)


Javascript library to integrate [Pixboost](https://pixboost.com) into a web application that
working directly on DOM tree (without shadow DOM), e.g. using JQuery, Backbone or other libraries.

Table of Contents:

* [Usage](#usage)
    * [Responsive images](#responsive-images)
        * [Operations](#operations)
        * [Supporting Breakpoints](#supporting-breakpoints)
        * [Alt text](#alt-text)
    * [Non-responsive images](#not-responsive-images)
    * [CSS Background images](#css-background-images)
    * [Lazy Loading](#lazy-loading)
* [Configuration](#configuration)
    * [Replacing on document load](#replacing-on-document-load)
    * [Custom domain name](#custom-domain-name)
    * [Reloading](#reloading)
        * [Custom reload events](#custom-reload-events)
    * [Disabling](#disabling)
    * [Enabling by cookie](#enabling-by-cookie)
* [Browsers Support](#browsers-support)
* [Build](#build)
    * [Using Docker](#using-docker)

## Usage

The easiest way to start using the library is to include it on the page and turn on autoload:

```html
<script 
  type="text/javascript" 
  src="https://pixboost.com/libs/pixboost.bundle.min.js"
  id="pb-script"
  data-api-key="<YOUR PIXBOOST API KEY>"
  data-autoload=""
></script> 
```

pixboost.bundle.min.js script includes picturefill library that adds support of `<picture>` element to old browsers
and lozad.js for lazy loading.

autoload option will run picture() and image() functions (see below) on document load.

Alternatively, you can include all components separately:

```html
<!--Responsive images-->
<script type="text/javascript" src="https://pixboost.com/libs/picturefill.min.js"></script>

<!-- Lazy loading-->
<script type="text/javascript" src="https://pixboost.com/libs/lozad.min.js"></script>

<script type="text/javascript" src="https://pixboost.com/libs/pixboost.min.js"></script> 
```

Library provides two main functions:
* [picture()](#responsive-images) - to deal with responsive images.
* [image()](#not-responsive-images) - to optimise all images that are device agnostic.


### Responsive images

Library replaces all elements that have `data-pb-picture` attribute with `<picture>` tag.
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

then `div` will be replaced with `<picture>` tag:

```html
<picture>
    <source srcset="https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/optimise?auth=API_KEY" 
        media="(min-width: 990px)">
    <source srcset="https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/resize?size=300&auth=API_KEY" 
        media="(min-width: 640px)">
    <img src="https://pixboost.com/api/2/img/https://yoursite.com/doggy.png/fit?size=100x100&auth=API_KEY">
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

#### Alt text

You can specify alt text for responsive images using `data-alt` attribute:

```html
<div data-pb-picture
    data-alt="doggy"
    data-url="https://yoursite.com/doggy.png"
    data-lg="optimise"
    data-md="resize?size=300"
    data-sm="fit?size=100x100"/>
```

### Not responsive images

You can use library with `<img>` tag as well. Below is an example of image that will be replaced with resized version:

```html
<img data-op="resize?size=x600" data-src="https://yoursite.com/doggy.png" data-pb-image/>
```

To process all images:

```js
    window.Pixboost.image({apiKey: 'API_KEY'})
```

### CSS background images

[Background images](https://css-tricks.com/almanac/properties/b/background-image/) are often used for hero banners or in 
cases where you need to put content on top of an image.

Below is a simple example of hero banner:

```html
<style>
    .hero {
        height: 600px;
        background-image: url("https://yoursite.com/hero.jpg");
        background-size: cover;
    }
</style>

<div class="hero" >
    <div class="content">This text is displayed on top of the image.</div>
</div>
```

In this example we created hero banner and using "background-image" CSS rule to setup an URL for the image.

Using this library you can optimise this image and also make it responsive. The syntax is exact the 
same as for [responsive images](#responsive-images), but instead of using `data-pb-picture` attribute
you should use `data-pb-background`:

```html
<style>
    .hero {
        height: 600px;
        background-size: cover;
    }
</style>

<div class="hero" 
    data-pb-background=""
    data-url="https://yoursite.com/hero.jpg"
    data-lg="optimise"
    data-md="resize?size=990"
    data-sm="resize?size=640">

    <div class="content">This text is displayed on top of the image.</div>
</div>
```

The snippet above will render 3 different sizes for different devices. We don't need `background-image`
CSS rule anymore as it will be added by the library. Lazy loading is supported for background images as well.

### Lazy loading

Lazy loading will not load image until it becomes visible to a user.
Pixboost.js supports lazy loading for both responsive and non-responsive images. To enable
lazy load you need to add `data-lazy` attribute to `<div>` or `<img>` elements.

```html
<div data-pb-picture
    data-lazy
    data-url="https://yoursite.com/doggy.png"
    data-lg="optimise"
    data-md="resize?size=300"
    data-sm="fit?size=100x100"/>
``` 

```html
<img data-pb-image data-lazy data-op="resize?size=x600" data-src="https://yoursite.com/doggy.png"/>
```

Lazy loading in Pixboost.js implemented by using 3rd party library [lozad.js](https://github.com/ApoorvSaxena/lozad.js).
In order to make it work, you'll need to use pixboost bundle (see [Usage](#usage) section) or add the library 
with polyfill for the [Intersection Observer](https://github.com/w3c/IntersectionObserver/) feature
if you want to have support in all browsers:

```html
    <script type="text/javascript" src="https://pixboost.com/libs/intersection-observer.min.js"></script>
    <script type="text/javascript" src="https://pixboost.com/libs/lozad.min.js"></script>
```

WARNING: In case of using polyfill make sure that you test your application in all browsers. We found some issues
in IE (before Edge) and Safari with absolute positioning when using polyfill.

## Configuration

This is a short table of supported options that you can pass to `<script>` tag as attributes:

| Option             | Description                                                                                    |
|--------------------|------------------------------------------------------------------------------------------------|
| data-api-key       | API key that will be used. If specified then no need to pass it manually to function calls     |
| data-autoload      | If attribute presents then image() and picture() will be called automatically on document load |
| data-events        | List of DOM events (separated by comma) that will trigger update once fired.                   |
| data-jquery-events | Similar to above data-events options, but using jQuery events                                  |
| data-domain        | The domain name in case you set up a custom domain name for your account.                      |
| data-cookie-enable | Name of the cookie that will need to be set to value “true” for images to be optimized.        |
| data-disabled      | Will disable Pixboost and use original images.                                                 |


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

Lazy loading is using [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) 
feature that supports by all [major browsers](https://caniuse.com/#search=intersectionObserver) 
except for Safari. You can use polyfill, but make sure that you are doing thorough testing 
(see more details in [lazy loading](#lazy-loading) section).

## Build

There is a `prepare` to build a minified version of the library. It will be run on `npm install` execution.
Result files will be generated into `dist/` folder.

### Using Docker

If you don't have Nodejs installed locally then you can use docker:

```
$ docker build -t pixboost-js .
$ docker run -v $(pwd):/app --rm pixboost-js
``` 
