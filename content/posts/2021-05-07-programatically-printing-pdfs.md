---
layout: post
title: Printing web pages to PDF programatically
date: 2021-05-07
tags:
    - pdf
    - scripting
---

I recently needed to dump a bunch of web pages to PDFs. There are [several](https://wkhtmltopdf.org/) [different](https://github.com/puppeteer/puppeteer) [possibilities](https://github.com/spatie/browsershot) for doing this, however many of them don't print items rendered by js after the page load. There are potential workarounds to introduce delay before printing, but they didn't output quite right.

Chrome has had a [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome) for quite a while now, which lets you print pdfs, ideal! But it still didn't render fully. The key options to add are `--virtual-time-budget=10000 --run-all-compositor-stages-before-draw` upping the time budget to 10,000ms (this is a max wait time, rather than a sleep, so generally is much faster), and ensuring all rendering is complete before the page is drawn and therefore exported to PDF.

The full (powershell) command is:

```powershell
& 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' --headless https://example.com --print-to-pdf="D:\tmp\chrome.pdf" --virtual-time-budget=10000 --run-all-compositor-stages-before-draw
```
