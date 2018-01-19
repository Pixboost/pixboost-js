# pixboost-js

Javascript library to integrate [Pixboost](https://pixboost.com) into web application that
can directly modify DOM.

## Usage

Library will add <picture> tag to all elements that marked with data-pb-picture attribute.
Picture tag will include images for different CSS breakpoints.

For instance, for element below:

```html
<div data-pb-picture
    data-pb-lg="optimise"
    data-pb-lg-url="https://yoursite.com/doggy.png"
    data-pb-md="resize"
    data-pb-md-url="https://yoursite.com/doggy.png"
    data-pb-md-params="size=300"
    data-pb-sm="fit"
    data-pb-sm-url="https://yoursite.com/doggy.png"
    data-pb-sm-params="size=100x100"/>
```

generated `<picture>` tag will be:

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

Operations (data-pb-<BREAKPOINT> attribute):

* optimise
* resize
* fit
* asis
* hide

See more about operations [here](https://pixboost.com/docs/api/).

data-pb-<BREAKPOINT>-params is a query param string that will be passed to the URL.

## Supporting Breakpoints

* Small devices (576px and down)
  `@media (max-width: 576px)`

* Medium devices (tablets, 768px and down)
  `@media (max-width: 992px)`

* Large devices (desktops, 993px and up)
  `@media (min-width: 993px)`