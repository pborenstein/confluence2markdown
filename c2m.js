var stream    = require('stream');
var util      = require('util');
var Tokenizer = require('tokenizer');


function Confluence2Markdown() {
  stream.Transform.call(this, { objectMode: true });

  this._inOCurly = false;
  this._inLiteral = false;
  this._inCode = false;
  this._macro = '';
  this._prevToken = { content: '', type: 'whitespace'};


  this.mkLiteral = function (string) {
                      return '`' + string + '`';
                   }

  this.handleMacro = function (string) {
    if (string.match(/^code/) || string.match(/^noformat/)) {
      this._inCode = ! this._inCode;
      return '```';
    }
  }

}
util.inherits(Confluence2Markdown, stream.Transform);



Confluence2Markdown.prototype._transform = function(token, encoding, done) {
  var outText;

  //this.push(">>" + JSON.stringify(token) + "<<\n");

  outText = token.content;

  if (token.type === 'ocurly') {
    this._inOCurly = true;
    if (this._prevToken.type === 'ocurly') {
      this._inLiteral = true;
    }
    this._prevToken = token;
    done();
    return ;
  }

  if (this._inOCurly && token.type !== 'ccurly') {
    this._macro += token.content;
    this._prevToken = token;
    done();
    return ;
  }

  if (token.type === 'ccurly') {
    if (this._inLiteral && this._prevToken.type === 'ccurly') {
      outText = this.mkLiteral(this._macro);
      this._inLiteral = false;
      this._inOCurly = false;
      this._macro = '';
    } else if (this._inLiteral && this._prevToken.type !== 'ccurly') {
      // swallow it
      this._prevToken = token;
      done();
      return ;
    } else if (! this._inLiteral) {
      this._inOCurly = false;
      outText = 'MACRO:' + this._macro + '<<';
      this._macro = '';
    }
  }


  this.push(outText);
  this._prevToken = token;
  done();
};
c2m = new Confluence2Markdown();

t = new Tokenizer();

t.addRule(Tokenizer.whitespace);
t.addRule(/^h[1-6]\.$/, 'heading');

t.addRule(/^[\w\d\.,\-]+$/, 'word');

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
t.addRule(/^[@~;:\?\^%<>=!&|+\$\\\/]$/, "punct")


t.on('token', function (token, type) {

               //console.log('>>%s %s<<', token, type);
              // t.push(token)
              });

process.stdin.pipe(t)
             .pipe(c2m)
             .pipe(process.stdout)


