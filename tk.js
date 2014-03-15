var stream    = require('stream');
var util      = require('util');
var Tokenizer = require('./lib/ConfluenceTokenizer.js');

var debug = true;

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


t = new Tokenizer(debug);


process.stdin.pipe(t)
             .pipe(stringify)
             .pipe(process.stdout)

