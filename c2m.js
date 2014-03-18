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

var substitutions = {
    'startfence'        : '\n```',
    'endfence'          : '```\n',
    'bold'              : '**',
    'italic'            : '_',
    'tab'               : '    ', // 4 spaces are magic to Markdown
    'bullet'            : '*  ',
    'number'            : '1.  ',
    'mono'              : '`',
    'break'             : '<BR/>'

}



tokenizer = new Tokenizer();


function Confluence2Markdown() {
    stream.Transform.call(this, { objectMode: true });

    this._state = {
        verbatim    : false,
        bold        : false,
        italic      : false
    };

    this._macro = '';
    this._prevToken = { content: '', type: 'whitespace'};

}
util.inherits(Confluence2Markdown, stream.Transform);


//  Convert Confluence markup to Markdown one token at a time

Confluence2Markdown.prototype._transform = function(token, encoding, done) {
    var s = this._state; // make things easier to type
    var t = token;
    outText = token.content;

    if (s.verbatim) {
        if (t.type !== s.verbatim) {
            outText = t.content;
        } else {
            // we're looking at the closing token
            outText = substitutions['endfence'];
            s.verbatim = false;
        }
    } else {
        if (t.type === 'newline') {
            // newline cancels stuff
            s.bold = false;
            s.italic = false;
        } else if (t.type === 'code' || t.type === 'noformat') {
          s.verbatim = t.type;    // store the token type here
          outText = substitutions['startfence'];
        } else if (t.type === 'heading')  {
            outText = Array(parseInt(t.content[1])+1).join('#');
            // TODO anchors
        } else if (t.type === 'bulletlist' && s.bold) {
            // not really a bullet, but the end of bold with a space
            outText = substitutions['bold'] + ' ';
            s.bold = false
        } else if (t.type === 'bulletlist' || t.type === 'numberlist') {
            outText = '';
            for (var i = 1; i < t.content.length-1; i++) {
                outText += substitutions['tab'];
            }
            outText += substitutions[t.type === 'bulletlist' ? 'bullet' : 'number'];
        } else if (t.type === 'star') {
            outText = substitutions['bold'];
            s.bold = ! s.bold;
        } else if (t.type === 'under') {
            outText = substitutions['italic'];
            s.italic = ! s.italic;
        } else if (t.type === 'mono') {
            outText = substitutions['mono'];
            outText += t.content.slice(2, -2);
            outText += substitutions['mono'];
        } else if (t.type === 'break') {
            outText = substitutions['break'];
        }


      }




    this.push(outText);
    this._prevToken = token;
    done();
};
c2m = new Confluence2Markdown();


process.stdin.pipe(tokenizer)
             .pipe(c2m)
             .pipe(process.stdout)


