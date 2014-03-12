var stream    = require('stream');
var util      = require('util');
var Tokenizer = require('tokenizer');


function Confluence2Markdown() {
  stream.Transform.call(this, { objectMode: true });
}
util.inherits(Confluence2Markdown, stream.Transform);

Confluence2Markdown.prototype._transform = function(chunk, encoding, done) {
//  this.push(">>" + JSON.Confluence2Markdown(chunk) + "<<\n");
  this.push(chunk.content);
  done();
};
c2m = new Confluence2Markdown();

t = new Tokenizer();

t.addRule(Tokenizer.whitespace);
t.addRule(Tokenizer.word);
t.addRule(Tokenizer.number);

t.addRule(/^\*$/, 'star');
t.addRule(/^\_$/, 'under');
t.addRule(/^\#$/, 'hash');
t.addRule(/^\"$/, 'dquote');
t.addRule(/^\'$/, 'squote');
t.addRule(/^\{$/, 'ocurly');
t.addRule(/^\}$/, 'ccurly');
t.addRule(/^\[$/, 'obracket');
t.addRule(/^\]$/, 'cbracket');
t.addRule(/^[\(\)]$/, "parens")
t.addRule(/^[@~;.:\?\^%<>=!&|+\-,\$\\\/]$/, "punct")
t.addRule(/^h[1-6]\.$/, 'heading');


t.on('token', function (token, type) {
             //  console.log('%s %s', token, type);
              // t.push(token)
              });

process.stdin.pipe(t)
             .pipe(c2m)
             .pipe(process.stdout)

