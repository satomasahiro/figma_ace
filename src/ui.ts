import './ui.css'
import { Ace } from './ace';

const ace = require('ace-builds/src-min-noconflict/ace')
const Tokenizer = ace.require('ace/tokenizer').Tokenizer

require('ace-builds/src-noconflict/theme-monokai')
require('ace-builds/src-noconflict/mode-javascript')
require('ace-builds/src-noconflict/mode-golang')
require('ace-builds/src-noconflict/mode-html')
require('ace-builds/src-noconflict/mode-php')

function tokenize(code, mode) {
  const Mode = ace.require('ace/mode/' + mode).Mode
  const HighlightRules = (new Mode).HighlightRules
  const $rules = (new HighlightRules).$rules
  const tokenizer = new Tokenizer($rules)
  return tokenizer.getLineTokens(code).tokens
}

const colorMap = new Map([
  ['text', '#ffffff'],
  ['entity.name.tag', '#f92672'],
  ['keyword', '#f92672'],
  ['keyword.operator', '#f92672'],
  ['meta.tag', '#f92672'],
  ['storage', '#f92672'],
  ['punctuation', '#ffffff'],
  ['punctuation.tag', '#ffffff'],
  ['constant.character', '#ae81ff'],
  ['constant.language', '#ae81ff'],
  ['constant.numeric', '#ae81ff'],
  ['constant.other', '#ae81ff'],
  ['support.constant', '#66d9ef'],
  ['support.function', '#66d9ef'],
  ['support.function.firebug', '#66d9ef'],
  ['storage.type', '#66d9ef'],
  ['support.class', '#66d9ef'],
  ['support.type', '#66d9ef'],
  ['entity.name.function', '#a6e22e'],
  ['entity.other', '#a6e22e'],
  ['entity.other.attribute-name', '#a6e22e'],
  ['variable', '#a6e22e'],
  ['variable.language', '#a6e22e'],
  ['variable.parameter', '#fd971f'],
  ['string', '#e6db74'],
  ['comment', '#8F908B'],
  ['string.quasi.start', '#e6db74'],
  ['string.quasi', '#e6db74'],
  ['string.quasi.end', '#e6db74'],
])

function convTokens(tokens) {
  return tokens.map(token => (
    {
      rgb: hexToNormRGB(colorMap.get(token.type) || '#ffffff'),
      value: token.value,
    }
  ))
}

function hexToNormRGB(hex) {
  const h = hex.slice(1)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
  }
}

let text = ""

document.getElementById('highlight').onclick = () => {
  const select = document.getElementById('language') as HTMLSelectElement
  const language = select.value
  const tokens = convTokens(tokenize(text, language))
  parent.postMessage({ pluginMessage: { type: 'highlight', tokens } }, '*')
}

document.getElementById('cancel').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
}

onmessage = (event) => {
  text = event.data.pluginMessage
}