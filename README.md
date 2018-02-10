# pixboost-js

Javascript library to integrate [Pixboost](https://pixboost.com) into web application that
can directly modify DOM.

## Usage

You need to include library on your page:

```html
<script type="text/javascript" src="https://pixboost.com/libs/pixboost.js"></script> 
```

Library replaces all elements that marked with data-pb-picture attribute with `<picture>` tag.
Picture tag will include different sources (images) for different CSS breakpoints.

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

Operations (`data-<BREAKPOINT>` attribute):

* optimise
* resize
* fit
* asis
* hide

You can specify query params adding them after operation name, e.g. `fit?size=100x100`

See more about operations [here](https://pixboost.com/docs/api/).

If you have the same source image for all operations then you can specify default URL:

```html
<div data-pb-picture
    data-url="https://yoursite.com/doggy.png"
    data-lg="optimise"
    data-md="resize?size=300"
    data-sm="fit?size=100x100"/>
``` 

### Browser Support

TODO:

### Replacing on document load

You can turn on automatic replacement by setting up `<script>` tag:

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

If you are fetching content using AJAX then you might want to run `picture()` once request finished.
You can do this manually using `window.Pixboost.picture()` call or you can trigger `pbUpdate` event:

```js
    var pbUpdateEvent = document.createEvent("Event");
    pbUpdateEvent.initEvent("pbUpdate", false, true);
    document.dispatchEvent(pbUpdateEvent);
```

#### Custom reload events

TODO:

## Supporting Breakpoints


* _lg_ - Large devices (desktops, 990px and up)
  `@media (min-width: 990px)`

* _md_ - Medium devices (tablets, 640px and up)
  `@media (max-width: 992px)`

* _sm_ - Small devices - everything below tablets