import "./ui.css";

const ace = require("ace-builds/src-noconflict/ace");
const Tokenizer = ace.require("ace/tokenizer").Tokenizer;

require("ace-builds/src-noconflict/theme-monokai");

require("ace-builds/src-noconflict/mode-html");
require("ace-builds/src-noconflict/mode-css");
require("ace-builds/src-noconflict/mode-javascript");
require("ace-builds/src-noconflict/mode-ruby");
require("ace-builds/src-noconflict/mode-php");
require("ace-builds/src-noconflict/mode-java");
require("ace-builds/src-noconflict/mode-python");
require("ace-builds/src-noconflict/mode-mysql");

require("ace-builds/src-noconflict/mode-golang");

function tokenize(code, mode) {
  const Mode = ace.require("ace/mode/" + mode).Mode;
  const HighlightRules = new Mode().HighlightRules;
  const $rules = new HighlightRules().$rules;
  // console.log($rules); // 同等のルールを取得できている
  const tokenizer = new Tokenizer($rules);
  const lineSplitArray = code.split("\n");
  let tokensRowArray = [];
  for (let i = 0; i < lineSplitArray.length; i++) {
    const tokensRow = tokenizer.getLineTokens(lineSplitArray[i]).tokens;
    tokensRowArray.push(tokensRow);
  }
  return tokensRowArray;
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
  // theme-monokai.jsのcssTextの分類を元に定義している。
  // cssの性質上、後にかかれているものの優先順位が高いので、
  // Map上では順番を逆にして定義している
  ["comment", selectedColorObj["gray"]],

  ["string", selectedColorObj["yellow"]],

  // .でつないでいるものはhtml上でclassに分解される
  // そのため、順番が入れ替わったtokenも同じものとして扱う必要がある
  ["variable.parameter", selectedColorObj["orange"]],
  ["parameter.variable", selectedColorObj["orange"]],

  ["entity.other.attribute-name", selectedColorObj["green"]],
  ["entity.attribute-name.other", selectedColorObj["green"]],
  ["other.entity.attribute-name", selectedColorObj["green"]],
  ["other.attribute-name.entity", selectedColorObj["green"]],
  ["attribute-name.other.entity", selectedColorObj["green"]],
  ["attribute-name.entity.other", selectedColorObj["green"]],

  ["entity.name.function", selectedColorObj["green"]],
  ["entity.function.name", selectedColorObj["green"]],
  ["function.entity.name", selectedColorObj["green"]],
  ["function.name.entity", selectedColorObj["green"]],
  ["name.function.entity", selectedColorObj["green"]],
  ["name.entity.function", selectedColorObj["green"]],

  ["variable", selectedColorObj["green"]],

  ["support.type", selectedColorObj["blue"]],
  ["type.support", selectedColorObj["blue"]],

  ["support.class", selectedColorObj["blue"]],
  ["class.support", selectedColorObj["blue"]],

  ["storage.type", selectedColorObj["blue"]],
  ["type.storage", selectedColorObj["blue"]],

  ["support.function", selectedColorObj["blue"]],
  ["function.support", selectedColorObj["blue"]],

  ["support.constant", selectedColorObj["blue"]],
  ["constant.support", selectedColorObj["blue"]],

  ["constant.other", selectedColorObj["purple"]],
  ["other.constant", selectedColorObj["purple"]],

  ["constant.numeric", selectedColorObj["purple"]],
  ["numeric.constant", selectedColorObj["purple"]],

  ["constant.language", selectedColorObj["purple"]],
  ["language.constant", selectedColorObj["purple"]],

  ["constant.character", selectedColorObj["purple"]],
  ["character.constant", selectedColorObj["purple"]],

  ["punctuation.tag", selectedColorObj["white"]],
  ["tag.punctuation", selectedColorObj["white"]],

  ["punctuation", selectedColorObj["white"]],

  ["storage", selectedColorObj["red"]],

  ["meta.tag", selectedColorObj["red"]],
  ["tag.meta", selectedColorObj["red"]],

  ["keyword", selectedColorObj["red"]],

  ["entity.name.tag", selectedColorObj["red"]],
  ["entity.tag.name", selectedColorObj["red"]],
  ["tag.entity.name", selectedColorObj["red"]],
  ["tag.name.entity", selectedColorObj["red"]],
  ["name.tag.entity", selectedColorObj["red"]],
  ["name.entity.tag", selectedColorObj["red"]],
]);

function convTokens(tokensRowArray: any[]) {
  let rgbRowArray = [];
  tokensRowArray.forEach((tokensRow: any[]) => {
    const rgbRow = tokensRow.map((token) => ({
      rgb: hexToNormRGB(getColor(token)),
      value: token.value,
    }));
    rgbRowArray.push(rgbRow);
  });
  return rgbRowArray;
}

function getColor(token) {
  for (let key of colorMap.keys()) {
    // aceは token.type からクラスを生成する
    // 例えば、support.function のtypeからは ace_support と ace_function の2つのクラスが生まれる
    // なので、support.function.xml などが support.function として認識できるように、文字列の部分一致を調べている
    if (String(token.type).indexOf(key) > -1) {
      return colorMap.get(key);
    }
  }
  return selectedColorObj["white"];
}

function hexToNormRGB(hex) {
  const h = hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
  };
}

let text = "";

document.getElementById("highlight").onclick = () => {
  const select = document.getElementById("language") as HTMLSelectElement;
  const language = select.value;
  const rgbRowArray = convTokens(tokenize(text, language));
  parent.postMessage({ pluginMessage: { type: "highlight", rgbRowArray: rgbRowArray } }, "*");
};

document.getElementById("cancel").onclick = () => {
  parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
};

onmessage = (event) => {
  text = event.data.pluginMessage;
};
