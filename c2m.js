var stream    = require('stream');
var util      = require('util');
var Tokenizer = require('./lib/ConfluenceTokenizer.js');

//  Some confluence macros are paired
//    and some are not.
//    paired macros of different types can nest inside each other
//    verbatim macros are paired but cannot nest
var macros = {
  'include'           : 'single',
  'toc'               : 'single',
  'children'          : 'single',
  'composition-setup' : 'single',
  'toggle-cloak'      : 'single',
  'note'              : 'paired',
  'cloak'             : 'paired',
  'writersnote'       : 'paired',
  'code'              : 'verbatim',
  'noformat'          : 'verbatim'
}

t = new Tokenizer();


function Confluence2Markdown() {
  stream.Transform.call(this, { objectMode: true });

  this._state = {
                  verbatim : false
                };

  this._macro = '';
  this._prevToken = { content: '', type: 'whitespace'};

}
util.inherits(Confluence2Markdown, stream.Transform);


//  Convert Confluence markup to Markdown one token at a time

Confluence2Markdown.prototype._transform = function(token, encoding, done) {
  var outText;
  var s = this._state; // make things easier to type

  if (s.verbatim && token.type !== s.verbatim) {
    outText = token.content;
  }





  this.push(outText);
  this._prevToken = token;
  done();
};
c2m = new Confluence2Markdown();


process.stdin.pipe(t)
             .pipe(c2m)
             .pipe(process.stdout)


