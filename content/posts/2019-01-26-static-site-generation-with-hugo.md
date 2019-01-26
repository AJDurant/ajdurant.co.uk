---
layout: post
title: Static site generation with Hugo
date: 2019-01-26
tags:
    - blog
    - website
---
In December 2016 I started re-writing my website to be generated as a static site. I wanted to make the blog the same as the rest of the site, and move it off Tumblr, as it had been using the same theme as my original website.

This was done in JavaScript using a gulp process to pull all the content (written in Markdown) into the templates (written in HTML). Over a few days it was mostly working, but before getting round to deploying it things got busy again and it stayed as an unfinished project on GitHub.

So now, wanting to write the occasional blog post again, I found some time to finish updating it. However technology has moved on and I couldn't be bothered to work through the changes to a million JS dependencies to get everything up to date again, I had a look for other static site generators. I initially wanted to use webpack, as I have done some work with is over the last few years, and in general it seems a better model than gulp. But seemingly having to write the build system from scratch again was not that appealing. Then I came across [Static Gen](https://www.staticgen.com/) and specifically [Hugo](https://gohugo.io/), which is a static site generator written in Go. A single executable that will take my already converted to Markdown blog posts, any number of community designed themes (or my own) and make the full site with minimal hassle.

The guides from Hugo are pretty good, so I'm not going to repeat what they say. Just that I was very impressed at the ease with which I got a basic site up and running. It has a development server built in, so you can see things live as you work on them, and everything is structured so that once a few things are in the right places you can pick from a large number of themes and have a well designed website running just like that.
