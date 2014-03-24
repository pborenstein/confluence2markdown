#! /usr/bin/env node

var stream    = require('stream');
var util      = require('util');
var Tokenizer = require('./lib/ConfluenceTokenizer.js');
var Confluence2Markdown = require('./lib/Confluence2Markdown')



tokenizer = new Tokenizer();


c2m = new Confluence2Markdown();


process.stdin.pipe(tokenizer)
             .pipe(c2m)
             .pipe(process.stdout)


