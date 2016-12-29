---
layout: post
title: Fun with Flexbox
tags:
    - css
    - flexbox
---

In the course of the past few days I have discovered parts of CSS that I never knew existed, but have often wished did in some form or another. Amongst these is the calc() function which lets you calculate values for properties, such as calc(100% - 3em).

The one I'm most excited about for the moment is Flexbox or the [Flexible Box Layout Model](http://dev.w3.org/csswg/css3-flexbox/). I first discovered this from [Paul Irish](https://twitter.com/paul_irish), on his [flexbox tutorial](http://www.html5rocks.com/en/tutorials/flexbox/quick/) over on html5rocks.com however as warned I soon discovered the issues with the changing spec of flexbox and the many versions implemented (or not implemented) by different browsers.

The issue is as browsers implement moving specification and then it changes drastically so much to break *everything*. So now there exists the 2009 spec (display: box) which is in quite a few browsers, some mixed up 2011 stuff from a transitionary period which doesn't exist in browsers but is scattered across the internet in various guides as 'how to use the new flexbox' (display: flexbox) and lastly the current implementation (at time of writing) which is implemented (at least partially) in all modern browsers.
<!--more-->
From what I can see there don't seem to be many guides (if any) that cover the current specification. So mostly for my benefit in any future working with flexible box layout here's my quick summary of flexbox, I hope it helps anyone else who happens to stumble across my blog.

#### Syntax

The css properties you need are:

<dl>

<dt>display</dt>

<dd>… flex …</dd>

<dd>sets the display mode to flex - this needs to be a wrapper/container for the items.</dd>

<dt>flex</dt>

<dd><flex-grow> <flex-shrink> <flex-basis></dd>

<dd>Shorthand setter for the listed properties. Sets how the items fill the space.</dd>

<dt>flex-grow</dt>

<dd>>number<</dd>

<dd>Flex grow factor. Sets the ratio to grow by compared to the other flex items.</dd>

<dt>flex-shrink</dt>

<dd>>number<</dd>

<dd>Flex shrink factor. Sets the ratio to shrink by compared to the other flex items.</dd>

<dt>flex-basis</dt>

<dd><width></dd>

<dd>Like width, sets the main size before the free space is distributed according to grow & shrink</dd>

<dt>flex-flow</dt>

<dd><flex-direction> <flex-wrap></dd>

<dd>Shorthand setter for the listed properties. Sets how the items are laid out.</dd>

<dt>flex-direction</dt>

<dd>**row** | row-reverse | column | column-reverse</dd>

<dd>How the items are laid out horizontal, vertical or reverse ordered.</dd>

<dt>flex-wrap</dt>

<dd>**nowrap** | wrap | wrap-reverse</dd>

<dd>Selects if all items have to be on a single line, or multiple lines are allowed.</dd>

<dt>justify-content</dt>

<dd>**flex-start** | flex-end | center | space-between | space-around</dd>

<dd>How items are distributed in space, only effective when flex factors are not set as it's calculated afterwards. Affects alignment on the main axis.</dd>

<dt>align-content</dt>

<dd>flex-start | flex-end | center | space-between | space-around | **stretch**</dd>

<dd>How items are distributed in space, only effective on multiline (flex-wrap). Affects positioning on the cross axis.</dd>

<dt>align-items</dt>

<dd>flex-start | flex-end | center | baseline | **stretch**</dd>

<dd>Same as justify-content but in the perpendicular axis. Affects alignment on the cross axis.</dd>

<dt>align-self</dt>

<dd>**auto** | flex-start | flex-end | center | baseline | stretch</dd>

<dd>Same as align-items, but this is set on the individual items. Affects alignment on the cross axis.</dd>

<dt>order</dt>

<dd>>integer<</dd>

<dd>The display order for the items. Laid out in ascending order, unless reverse is set in the direction.</dd>

</dl>

For making this all work in Chrome (and other webkits - though they are not fully compatible yet) the `-webkit-` prefix needs to be added to all the properties, other than display which needs it added to the value ie. `display: -webkit-flex;`

And then I got to firefox which 'supports' it. Or rather it will support it in version 20 (stable at time of writing is 17, Dev/Aurora is 19). In 18 and 19 it can be enabled by changing the flag `layout.css.flexbox.enabled` to true and even then only single line is supported.

#### Making my layout

So the project I'm working on that brought this flexboxing all about needs a header/footer with left, right & centre, and centred content that always stays in those relative positions no matter what the display size is. This is why flexbox is ideal in my situation, however I would say building an entire website structure from flexbox for the majority of applications is probably not a good idea. The best layout model is probably CSS Grid, however as no browser has got round to implementing it yet, that wil have to wait.

![](https://38.media.tumblr.com/9347825c08596eda0b1dceb785a9222d/tumblr_inline_mf8dqtMv0f1rnzreh.png)

My standard method for doing such a layout would be floats, however I wanted to give this a go. So taking my code:

<pre class="brush: html"><header class="box">
<div class="left">
<div class="centre">
<div class="right">
</header>
</pre>

I made my CSS:

<pre class="brush: css">.box {
    display: -webkit-flex;
    -webkit-flex-flow: row;
    -webkit-justify-content: space-between;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.box > * {
    -webkit-flex: auto;
    flex: auto;
}
.left {
    text-align: left;
}
.centre {
    text-align: center;
}
.right {
    text-align: right;
}
</pre>

My `flex-flow` and `flex` lines are a bit extraneous, but particularly whilst I'm developing I like to set things manually do I know what's going on. Also using `flex` means that each flex item fills out its space, rather than just sitting in position.

This works for creating the header and footer how I want them, but to get the main content right in the middle more work needed to be done. ~~Time to add a wrapper div (OH no!) as unfortunately you get some weird things happening if you try to use the body as a flex item container.~~ Actually having just done it, you can use the body to wrap flex items, so all is good =) My page structure has `<header> <section> <footer>` so each of those becomes a flex item in its own right, this time vertically in a column and the section element gets aligned centrally. My full css is:

<pre class="brush: css">.box {
    display: -webkit-flex;
    -webkit-flex-flow: row;
    -webkit-justify-content: space-between;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.vbox {
    display: -webkit-flex;
    -webkit-flex-flow: column;
    -webkit-justify-content: space-between;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.box > * {
    -webkit-flex: auto;
    flex: auto;
}

#display section {
    -webkit-align-self: center;
    align-self: center;
}

.left {
    text-align: left;
}
.centre {
    text-align: center;
}
.right {
    text-align: right;
}
</pre>

with .vbox and #display applied to the body for this page layout.

And that's about all for now, coming soon: WebSockets
