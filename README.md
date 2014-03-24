# confluence2markdown

Convert Confluence (3.5 and earlier) markup to Markdown.

## Overview

```
$ npm install -g confluence2markdown
$ c2m < confluence.txt > markdown.md
```


## What it handles:

*   {code} and {noformat} blocks
*   Lists (bullets and numbers)
*   {{monospace}}
*   Tables (some weird cases don't work)
*   Paired macros (note, info, writersnote, etc)
    These a rendered as HTML DIVs


## Still to do:

* Links
* Images
* Anchors for headings
* TOC generation

## Notes

This converter uses [a fork](https://github.com/pborenstein/node-tokenizer)
of Florent Jaby's [node-tokenizer](https://github.com/Floby/node-tokenizer).
