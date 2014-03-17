var Tokenizer = require('tokenizer');

module.exports = function ConfluenceTokenizer (debug) {



  var t = new Tokenizer(function(token, match) {
                            if (debug) {
                              console.log('::token: ', JSON.stringify(token));
                              console.log('::match: ', match);
                            }
                            if (match.type === 'macro' && token.match(/code/)) {
                              return 'code';
                            } else if (match.type === 'macro' && token.match(/noformat/)) {
                              return 'noformat';
                            }
                        }
                        );

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

  t.on('token', debug ? function (token, type) {
                            console.log('>>%s<< %s', token, type);
                          }
                        : function (token, type) {})


  return t;
}
