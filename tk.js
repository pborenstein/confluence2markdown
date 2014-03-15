var stream    = require('stream');
var util      = require('util');
var Tokenizer = require('tokenizer');


function Stringify() {
  stream.Transform.call(this, { objectMode: true });
}
util.inherits(Stringify, stream.Transform);

Stringify.prototype._transform = function(chunk, encoding, done) {
//  this.push(">>" + JSON.stringify(chunk) + "<<\n");
//  this.push(chunk.content);
  done();
};
stringify = new Stringify();

// https://github.com/Floby/node-tokenizer
t = new Tokenizer();


// http://stackoverflow.com/questions/3469080/how-do-i-match-whitespace-but-not-newlines
t.addRule(/^[^\S\r\n]+$/,           'whitespace'); // but not newlines
t.addRule(/^(\n)+$/,                'newline');
t.addRule(/^\\\\$/,                 'break');
t.addRule(/^h[1-6]\.$/,             'heading');
t.addRule(/^[-\w\d]+$/,             'word');
t.addRule(/^{[\w-]+(:.*)?}$/,       'macro');
t.addRule(/^{{[-\w\d=\/\\:. ]+}}$/, 'mono'); // spaces are allowed here
t.addRule(/^\*$/,                   'star');
t.addRule(/^\_$/,                   'under');
t.addRule(/^\#$/,                   'hash');
t.addRule(/^\"$/,                   'dquote');
t.addRule(/^\'$/,                   'squote');
t.addRule(/^\{\s$/,                 'ocurly');
t.addRule(/^\}$/,                   'ccurly');
t.addRule(/^{}$/,                   'nullobj'); // For handling null JSON objects in code
t.addRule(/^\[$/,                   'obracket');
t.addRule(/^\]$/,                   'cbracket');
t.addRule(/^\($/,                   'oparen');
t.addRule(/^\)$/,                   'cparen');
t.addRule(/^[|]$/,                  'pipe');
t.addRule(/^!$/,                    'bang');
t.addRule(/^[@~;:\?\^%<>=&+\-\$\\\/\.,└─├]$/, "punct")

t.on('token', function (token, type) {
               console.log('>>%s<< %s', token, type);
              // t.push(token)
              });

process.stdin.pipe(t)
             .pipe(stringify)
             .pipe(process.stdout)

