import './ui.css'

const ace = require('ace-builds/src-min-noconflict/ace')
const Tokenizer = ace.require('ace/tokenizer').Tokenizer

require('ace-builds/src-noconflict/theme-monokai')
require('ace-builds/src-noconflict/mode-javascript')
require('ace-builds/src-noconflict/mode-golang')
require('ace-builds/src-noconflict/mode-html')
require('ace-builds/src-noconflict/mode-php')
require("ace-builds/src-noconflict/mode-ruby");

function tokenize(code, mode) {
  const Mode = ace.require('ace/mode/' + mode).Mode
  const HighlightRules = (new Mode).HighlightRules
  const $rules = (new HighlightRules).$rules
  const tokenizer = new Tokenizer($rules);
  return tokenizer.getLineTokens(code).tokens
}

const oldColorObj = {
  white: "#FFFFFF",
  red: "#FF0E5B",
  green: "#A0CA40",
  yellow: "#F8E186",
  blue: "#40CEF4",
  purple: "#B5A4FF",
  orange: "#FD971F",
  gray: "#BCC2C6",
};

const newColorObj = {
  white: "#FFFFFF",
  red: "#ED5974",
  green: "#A0CA40",
  yellow: "#F8E186",
  blue: "#40CEF4",
  purple: "#B5A4FF",
  orange: "#FD971F",
  gray: "#BCC2C6",
};

let selectedColorObj = newColorObj;

const colorMap = new Map([
  // theme-monokai.jsのcssTextの分類を元に定義
  ["comment", selectedColorObj["gray"]],

  ["string", selectedColorObj["yellow"]],

  ["variable.parameter", selectedColorObj["orange"]],

  ["entity.other.attribute-name", selectedColorObj["green"]],
  ["entity.other", selectedColorObj["green"]],
  ["entity.name.function", selectedColorObj["green"]],

  ["support.type", selectedColorObj["blue"]],
  ["support.class", selectedColorObj["blue"]],
  ["storage.type", selectedColorObj["blue"]],
  ["support.function", selectedColorObj["blue"]],
  ["support.constant", selectedColorObj["blue"]],

  ["constant.other", selectedColorObj["purple"]],
  ["constant.numeric", selectedColorObj["purple"]],
  ["constant.language", selectedColorObj["purple"]],
  ["constant.character", selectedColorObj["purple"]],

  ["punctuation.tag", selectedColorObj["white"]],
  ["punctuation", selectedColorObj["white"]],

  ["storage", selectedColorObj["red"]],
  ["meta.tag", selectedColorObj["red"]],
  ["keyword", selectedColorObj["red"]],
  ["entity.name.tag", selectedColorObj["red"]],

]);

function convTokens(tokens: any[]) {
  return tokens.map((token) => ({
    rgb: hexToNormRGB(getColor(token)),
    value: token.value,
  }));
}

function getColor(token) {
  for (let key of colorMap.keys()) {
    if (String(token.type).indexOf(key) > -1) {
      return colorMap.get(key);
    }
  }
  return selectedColorObj["white"];
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