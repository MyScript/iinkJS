const system = require('./inks/system.json')
const one = require('./inks/one.json')
// const equation = require('./inks/equation.json')
const equation2 = require('./inks/equation2.json')
const equation3 = require('./inks/equation3.json')
const threetimes2 = require('./inks/3times2.json')
const fence = require('./inks/fence.json')
const rabText = require('./inks/rabText.json')
const helloStrike = require('./inks/helloStrike.json')
const hello = require('./inks/hello.json')
const helloHow = require('./inks/helloHowAreYou.json')
const helloHowHighlighted = require('./inks/highlighted.json')
const helloHowEmphasized = require('./inks/emphasized.json')
const shape = require('./inks/shape.json')
const fourSquare = require('./inks/fourSquare.json')
const music = require('./inks/music.json')
const rcEs233 = require('./inks/rc_es_233.json')
const rcFr = require('./inks/rc_fr_simple.json')
const rcIt = require('./inks/rc_it_216.json')
const rcKo = require('./inks/rc_ko_262.json')

module.exports = {
  one: {
    name: 'one',
    type: 'MATH',
    strokes: one,
    apiVersion: '',
    exports: {
      LATEX: ['1']
    }
  },
  equation: {
    name: 'equation',
    type: 'MATH',
    strokes: equation2,
    apiVersion: '',
    exports: {
      LATEX: ['-', '\\sqrt {2}', 'r', '']
    }
  },
  equation2: {
    name: 'equation2',
    type: 'MATH',
    strokes: equation2,
    apiVersion: '',
    exports: {
      LATEX: ['-', '\\sqrt {2}', 'r', '']
    }
  },
  equation3: {
    name: 'equation3',
    type: 'MATH',
    strokes: equation3,
    apiVersion: '',
    exports: {
      LATEX: ['y', 'y-', 'y=', 'y=3', 'y=30', 'y=3x', 'y=3x-', 'y=3x+', 'y=3x+2']
    }
  },
  system: {
    name: 'system',
    type: 'MATH',
    strokes: system,
    apiVersion: '',
    exports: {
      LATEX: [
        '\\int', '\\int _{6}',
        '\\int _{6}^{\\infty }',
        '\\int _{6}^{\\infty }f',
        '\\int _{0}^{\\infty }\\sqrt {f}',
        '\\int _{0}^{\\infty }\\sqrt {f(}',
        '\\int _{0}^{\\infty }\\sqrt {fb}',
        '\\int _{0}^{\\infty }\\sqrt {f(x}',
        '\\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }',
        '\\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }d',
        '\\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }d7',
        '\\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & c\\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos \\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos (\\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos (1\\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos (11\\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos (^{\\pi }\\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos (\\Updownarrow \\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos (\\dfrac {\\pi } {2}\\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos \\left( \\dfrac {\\pi } {2}\\right) \\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos \\left( \\dfrac {\\pi } {2}\\right) -\\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos \\left( \\dfrac {\\pi } {2}\\right) -2\\end{align*}',
        '\\begin{align*} & \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ & \\cos \\left( \\dfrac {\\pi } {2}\\right) ^{2}-2\\end{align*}',
        '\\begin{cases} \\int _{0}^{\\infty }\\sqrt {f\\left( x\\right) }dx\\\\ \\cos \\left( \\dfrac {\\pi } {2}\\right) ^{2}-2\\end{cases}'
      ]
    }
  },
  '3times2': {
    name: '3times2',
    type: 'MATH',
    strokes: threetimes2,
    apiVersion: 'V4',
    exports: {
      LATEX: ['3', '31', '311', '3112']
    }
  },
  fence: {
    name: 'fence',
    type: 'MATH',
    strokes: fence,
    apiVersion: 'V4',
    exports: {
      MATHML: {
        STANDARD: [
          '<math xmlns=\'http://www.w3.org/1998/Math/MathML\'>\n' +
          '    <mrow>\n' +
          '        <mo> { </mo>\n' +
          '        <mtable columnalign=\'left\'>\n' +
          '            <mtr>\n' +
          '                <mtd>\n' +
          '                    <msqrt>\n' +
          '                        <mn> 3 </mn>\n' +
          '                    </msqrt>\n' +
          '                </mtd>\n' +
          '            </mtr>\n' +
          '            <mtr>\n' +
          '                <mtd>\n' +
          '                    <msqrt>\n' +
          '                        <mn> 6 </mn>\n' +
          '                    </msqrt>\n' +
          '                </mtd>\n' +
          '            </mtr>\n' +
          '        </mtable>\n' +
          '    </mrow>\n' +
          '</math>'
        ],
        MSOFFICE: [
          '<math xmlns=\'http://www.w3.org/1998/Math/MathML\'>\n' +
          '    <mfenced open="{" close="">\n' +
          '        <mtable columnalign=\'left\'>\n' +
          '            <mtr>\n' +
          '                <mtd>\n' +
          '                    <msqrt>\n' +
          '                        <mn> 3 </mn>\n' +
          '                    </msqrt>\n' +
          '                </mtd>\n' +
          '            </mtr>\n' +
          '            <mtr>\n' +
          '                <mtd>\n' +
          '                    <msqrt>\n' +
          '                        <mn> 6 </mn>\n' +
          '                    </msqrt>\n' +
          '                </mtd>\n' +
          '            </mtr>\n' +
          '        </mtable>\n' +
          '    </mfenced>\n' +
          '</math>'
        ]
      }
    }
  },
  hello: {
    name: 'hello',
    type: 'TEXT',
    strokes: hello,
    apiVersion: '',
    exports: {
      TEXT: ['h', 'he', 'hee', 'heel', 'hello']
    }
  },
  hellov4rest: {
    name: 'hellov4rest',
    type: 'TEXT',
    strokes: hello,
    apiVersion: 'V4',
    exports: {
      TEXT: ['h', 'he', 'hee', 'hell', 'hello']
    }
  },
  helloHow: {
    name: 'helloHow',
    type: 'TEXT',
    strokes: helloHow,
    apiVersion: '',
    exports: {
      TEXT: ['hello', 'hello how', 'hello how o', 'hello how are', 'hello how are you', 'hello how are you?', 'hello how are you?']
    }
  },
  helloHowDecoHighlighted: {
    name: 'helloHowDecoHighlighted',
    type: 'TEXT',
    strokes: helloHowHighlighted,
    apiVersion: 'V4',
    exports: {
      TEXT: ['hello', 'hello how', 'hello how']
    }
  },
  helloHowDecoEmphasized: {
    name: 'helloHowDecoEmphasized',
    type: 'TEXT',
    strokes: helloHowEmphasized,
    apiVersion: 'V4',
    exports: {
      TEXT: ['hello', 'hello how', 'hello how']
    }
  },
  helloStrike: {
    name: 'helloStrike',
    type: 'TEXT',
    strokes: helloStrike,
    apiVersion: 'V4',
    exports: {
      TEXT: ['hello', '']
    }
  },
  rabText: {
    name: 'rabText',
    type: 'TEXT',
    strokes: rabText,
    apiVersion: 'V4',
    exports: {
      TEXT: ['covfefe']
    }
  },
  shape: {
    name: 'shape',
    type: 'SHAPE',
    strokes: shape,
    apiVersion: '',
    exports: {
      SEGMENTS: ['circle', 'circle,polyline', 'circle,polyline,rectangle']
    }
  },
  fourSquare: {
    name: 'fourSquare',
    type: 'ANALYZER',
    strokes: fourSquare,
    apiVersion: '',
    exports: {
      ANALYSIS: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
        'circle,ellipse,groups:2',
        'circle,ellipse,groups:2,isosceles triangle,rectangle,tables:2,txt:c. rd,txt:elipse,txt:rectangle,txt:triangle'
      ]
    }
  },
  music: {
    name: 'music',
    type: 'MUSIC',
    strokes: music,
    apiVersion: '',
    exports: {
      MUSICXML: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '<step>F</step>', '<step>C</step>']
    }
  },
  rawContentEs: {
    name: 'rawContent_es_ES',
    type: 'Raw Content',
    strokes: rcEs233,
    apiVersion: 'V4',
    exports: {
    }
  },
  rawContentFr: {
    name: 'rawContent_fr_FR',
    type: 'Raw Content',
    strokes: rcFr,
    apiVersion: 'V4',
    exports: {
    }
  },
  rawContentIt: {
    name: 'rawContent_it_IT',
    type: 'Raw Content',
    strokes: rcIt,
    apiVersion: 'V4',
    exports: {
    }
  },
  rawContentKr: {
    name: 'rawContent_ko_KR',
    type: 'Raw Content',
    strokes: rcKo,
    apiVersion: 'V4',
    exports: {
    }
  }
}
