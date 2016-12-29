---
layout: post
title: A short time spent with multiviews
tags:
    - apache
    - multiviews
    - mod_rewrite
    - website
    - server
---

I've recently been building a new website, well newish. It's a re-design and replacement for a website written a couple of years back and made in the CMS Drupal. I also recently read (albeit rather old) an article on [URIs not changing](http://www.w3.org/Provider/Style/URI "Cool URIs don't change"). Now this prompted various thoughts into my head, some of which I had had whist designing this other website. Such as why do I have to have .html on all my URIs? The old site most of the content was coming from didn't (I know this is down to mod_rewrite for fancy SEO urls by Drupal, but all the same).

So I started to try and find out what Sir Tim was on about here, something really simple you can add that makes it 'just work' that doesn't sound like any web development I've done before... There seemed to be lots of posts from people who had also read the article and were looking for the answer, but no-one else seemed to know it, nearly everyone pointed to use some variant of mod_rewrite to various degrees of complexity. But then I found the answer, it really was quite simple, enable MultiViews in your apache config for that directory, and it would 'just work' you could even have it auto detect language setting from the browser.

<pre class="brush: plain; gutter: false">Options MultiViews</pre>

A quick update and build later and both the site I was working on and my main website were extensionless and wonderful. However this was not to be the end of the story.
<!--more-->
The main point of Sir Tim's article is that uris should not go away, even if the content changes a bit, or the website is redesigned, or passes to someone else (all three of which were happening on this website). So earlier this night, having almost completely finished the site, I set about creating the redirects for the pages I'd moved to renamed.

However, after wrestling with apache rewrite and various server configs with it still not working properly, I remembered what I had had to do to get multiviews working in the first place... Helpfully the [h5bp](h5bp.com "HTML5 BoilerPlate") developers had configured multiviews to be disabled, which i had commented out. The reason behind this is it causes problems with redirects... So having enabled it, then tried to add a number of redirects they just wouldn't work. Back to the drawing board (why would you write code on a drawing board?)

A bit more googleing later and I came up with a solution, the first of which was simply to re-create the multiviews effect by rewriting 'file' to 'file.html' nicely behind the scenes. However this did not solve one of the issues I had with MultiViews: someone can still access the .html file with extension (particularly if your website has already been crawled with it), thereby serving duplicate content a rather huge no-no. Obviously my previous attempts to redirect this failed due to multiviews blocking the redirect.

<pre class="brush: plain"># If extensionless page URL with ".php" added resolves to an existing file
RewriteCond %{DOCUMENT_ROOT}/$1.php -f
# rewrite extensionless page URL to .php file
RewriteRule ^(([^/]+/)*[^./]+)$ /$1.php [L]</pre>

[http://www.webmasterworld.com/apache/3800500.htm](http://www.webmasterworld.com/apache/3800500.htm)

Then I found a second solution, that had everything I wanted. It would give you the file from just 'file' it would redirect you to 'file' from 'file.html' and it would even remove index(.html)? from the URI to give you the root dir. Lovely.

<pre class="brush: plain"><IfModule mod_rewrite.c> DirectorySlash Off
RewriteEngine On

RewriteCond %{THE_REQUEST} \ /(.+/)?index(\.html)?(\?.*)?\ [NC]
RewriteRule ^(.+/)?index(\.html)?$ /%1 [R=301,L]

RewriteCond %{SCRIPT_FILENAME}/ -d
RewriteCond %{SCRIPT_FILENAME}.html !-f
RewriteRule [^/]$ %{REQUEST_URI}/ [R=301,L]

RewriteCond %{ENV:REDIRECT_STATUS} ^$
RewriteRule ^(.+)\.html$ /$1 [R=301,L]

RewriteCond %{SCRIPT_FILENAME}.html -f
RewriteRule [^/]$ %{REQUEST_URI}.html [QSA,L]
</IfModule></pre>

[http://forum.modrewrite.com/viewtopic.php?t=37515](http://forum.modrewrite.com/viewtopic.php?t=37515)

So now multiviews is back off from the site and all this lovely mod_redirect goodness is in. My main site however shall keep multiviews for a little while, whilst I try to solve the duplicate content issue and update what Google has crawled.
