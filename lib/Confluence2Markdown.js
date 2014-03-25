var stream    = require('stream');
var util      = require('util');
var Tokenizer = require('./ConfluenceTokenizer.js');


var substitutions = {
    'startfence'        : '\n```',
    'endfence'          : '```\n',
    'bold'              : '**',
    'italic'            : '_',
    'tab'               : '    ', // 4 spaces are magic to Markdown
    'bullet'            : '*  ',
    'number'            : '1.  ',
    'mono'              : '`',
    'break'             : '<BR/>',
    'table'             : '|',
    'tablemark'         : '| :-- ',
    'tablemarkend'      : '|\n',
    'newline'           : '\n'

}


//  Output DIVs for paired macros.
//  The 'markdown="1"' attribute ensures that Markdown inside
//      the DIV gets interpreted as Markdown.

function _pairSubst(macrotxt, open) {
    if (open)
        return '<div markdown="1" class="confluence ' + macrotxt + '">';
    else
        return ('</div>');
}


// Repeat a character count times.
function _repeatChar (c, count) {
    return Array(count+1).join(c);
}

function _numNewlines (txt) {
    var m = txt.match(/\n/g);
    return m ? m.length : 0;
}

function _macroName (tokentext) {
  var matches = tokentext.match(/{([^:\}]+)/);
  return matches[1];
}

// Given a Confluence style link
//    [text | link]
// create a Markdown style link
//    [text](link)
function _makeLink (txt) {
    var m;
    if (m = txt.match(/\[(.*)\|(.*)]/))
        return "[" + m[1] +"]("+m[2]+")";
    else {
        m = txt.slice(1,-1);
        return "[" + m +"]("+ m +")";
    }
}


function Confluence2Markdown() {
    stream.Transform.call(this, { objectMode: true });

    this.tokenizer = new Tokenizer();

    this._state = {
        verbatim    : false,    // Holds the close tag
        bold        : false,
        italic      : false,
        tcellcount  : false,     // Also lets us know number of cells
        //  These are the paired macros.
        //  Value of the macro is
        //      false if we're not in the macro
        //      true if we are in the macro
        //  'foo' in paired ? the  macro is in this object : it's not
        //  pairSubst() outputs the substitution for the macro
        paired      : {
            'box'           : false,
            'cloak'         : false,
            'column'        : false,
            'info'          : false,
            'note'          : false,
            'panel'         : false,
            'section'       : false,
            'tip'           : false,
            'warning'       : false,
            'writersnote'   : false,
        }
    };

    this._prevToken = { content: '', type: 'whitespace'};

}
util.inherits(Confluence2Markdown, stream.Transform);


//  Convert Confluence markup to Markdown one token at a time

Confluence2Markdown.prototype._transform = function(token, encoding, done) {
    var s = this._state; // make things easier to type
    var t = token;
    outText = t.content;

    if (s.verbatim) {
        if (t.type !== s.verbatim) {
            // verbatim, but strip out \r's
            outText = t.content.replace(/\r/g,'');
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

            // normalize line endings (CRLF? Really?)
            outText = _repeatChar(substitutions['newline'], _numNewlines(t.content));

            if (s.tcellcount) {
                //console.log(')) tcellcount: %d', s.tcellcount);
                for (var i = 0; i < s.tcellcount; i++) {
                    outText += substitutions['tablemark'];
                }
                outText += substitutions['tablemarkend'];
                s.tcellcount = false;
            }
        } else if (t.type === 'code' || t.type === 'noformat') {
          s.verbatim = t.type;    // store the token type here
          outText = substitutions['startfence'];
        } else if (t.type === 'heading')  {
            outText = _repeatChar('#', parseInt(t.content[1]));
            // TODO anchors
        } else if (t.type === 'bulletlist' && s.bold) {
            // not really a bullet, but the end of bold with a space
            outText = substitutions['bold'] + ' ';
            outText += _repeatChar(substitutions['newline'], _numNewlines(t.content));
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
        } else if (t.type === 'dpipe') {
            s.tcellcount++;             // lets us know to put the marker after newline
            outText = substitutions['table'];
        } else if (t.type === 'macro') {
            var macroname = _macroName(t.content);

            if (macroname in s.paired) {
                s.paired[macroname] = !s.paired[macroname];
                outText = _pairSubst(macroname, s.paired[macroname]);
            }
        } else if (t.type === 'link') {
            outText = _makeLink(t.content);
        }
      }

    this.push(outText);
    this._prevToken = token;
    done();
};

module.exports = Confluence2Markdown;
