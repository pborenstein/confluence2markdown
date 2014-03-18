# confluence2markdown

Convert Confluence (3.5 and earlier) markup to Markdown.


## What it handles:

*   {code} and {noformat} blocks
*   Lists (bullets and numbers)
*   {{monospace}}
*   Tables


## Still to do:

* Links
* Images
* Anchors for headings
* TOC generation
* Make this a proper npm package

## Notes

This converter uses [a fork](https://github.com/pborenstein/node-tokenizer)
of Florent Jaby's [node-tokenizer](https://github.com/Floby/node-tokenizer).

`npm install` should load my fork.
