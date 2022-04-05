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
require("ace-builds/src-noconflict/mode-scss");
require("ace-builds/src-noconflict/mode-golang");

function tokenize(code, mode) {
  const Mode = ace.require("ace/mode/" + mode).Mode;
  const HighlightRules = new Mode().HighlightRules;
  const $rules = new HighlightRules().$rules;
  // console.log($rules); // 同等のルールを取得できている
  const tokenizer = new Tokenizer($rules);
  const lineSplitArray = code.split("\n");
  let tokensRowArray = [];
  // console.log(tokenizer.getLineTokens(code).tokens);
  let nextState = "";
  for (let i = 0; i < lineSplitArray.length; i++) {
    const tokensRowData = tokenizer.getLineTokens(lineSplitArray[i], nextState);
    // console.log(tokensRowData);
    const tokensRow = tokensRowData.tokens;
    tokensRowArray.push(tokensRow);
    nextState = tokensRowData.state;
  }
  return tokensRowArray;
}

const paletteVer1 = {
  white: "#FFFFFF",
  red: "#FF0E5B",
  green: "#A0CA40",
  yellow: "#F8E186",
  blue: "#40CEF4",
  purple: "#B5A4FF",
  orange: "#FD971F",
  gray: "#BCC2C6",
};

const paletteVer2 = {
  white: "#FFFFFF",
  red: "#ED5974",
  green: "#A0CA40",
  yellow: "#F8E186",
  blue: "#40CEF4",
  purple: "#B5A4FF",
  orange: "#FD971F",
  gray: "#BCC2C6",
};

let currentColorObj;

let colorMap;

function tokensToRgbRowArray(tokensRowArray: any[]) {
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
  return currentColorObj["white"];
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
  const selectedLanguage = document.getElementById("language") as HTMLSelectElement;
  const language = selectedLanguage.value;
  const selectedPalette = document.getElementById("palette") as HTMLSelectElement;
  setColorMap(selectedPalette.value);
  const tokens = tokenize(text, language);
  const rgbRowArray = tokensToRgbRowArray(tokens);
  parent.postMessage({ pluginMessage: { type: "highlight", rgbRowArray: rgbRowArray } }, "*");
};

onmessage = (event) => {
  const highlight = document.getElementById("highlight") as HTMLInputElement;
  // テキスト未選択なら「text-unselected」という文字列をcode.tsから送っている
  if (event.data.pluginMessage === "text-unselected") {
    highlight.disabled = true;
    text = "";
  } else {
    highlight.disabled = false;
    text = event.data.pluginMessage;
  }
};

function setColorMap(ver) {
  let selectedColorObj;
  switch (ver) {
    case "1":
      selectedColorObj = paletteVer1;
      break;
    case "2":
      selectedColorObj = paletteVer2;
      break;
    default:
      selectedColorObj = paletteVer2;
      break;
  }
  // 同じパレットのままなら処理中断
  if (currentColorObj === selectedColorObj) {
    return;
  }

  currentColorObj = selectedColorObj;
  colorMap = new Map([
    // theme-monokai.jsのcssTextの分類を元に定義している。
    // cssの性質上、後にかかれているものの優先順位が高いので、
    // Map上では順番を逆にして定義している
    ["comment", currentColorObj["gray"]],

    ["string", currentColorObj["yellow"]],

    // .でつないでいるものはhtml上でclassに分解される
    // そのため、順番が入れ替わったtokenも同じものとして扱う必要がある
    ["variable.parameter", currentColorObj["orange"]],
    ["parameter.variable", currentColorObj["orange"]],

    ["entity.other.attribute-name", currentColorObj["green"]],
    ["entity.attribute-name.other", currentColorObj["green"]],
    ["other.entity.attribute-name", currentColorObj["green"]],
    ["other.attribute-name.entity", currentColorObj["green"]],
    ["attribute-name.other.entity", currentColorObj["green"]],
    ["attribute-name.entity.other", currentColorObj["green"]],

    ["entity.name.function", currentColorObj["green"]],
    ["entity.function.name", currentColorObj["green"]],
    ["function.entity.name", currentColorObj["green"]],
    ["function.name.entity", currentColorObj["green"]],
    ["name.function.entity", currentColorObj["green"]],
    ["name.entity.function", currentColorObj["green"]],

    ["variable", currentColorObj["green"]],

    ["support.type", currentColorObj["blue"]],
    ["type.support", currentColorObj["blue"]],

    ["support.class", currentColorObj["blue"]],
    ["class.support", currentColorObj["blue"]],

    ["storage.type", currentColorObj["blue"]],
    ["type.storage", currentColorObj["blue"]],

    ["support.function", currentColorObj["blue"]],
    ["function.support", currentColorObj["blue"]],

    ["support.constant", currentColorObj["blue"]],
    ["constant.support", currentColorObj["blue"]],

    ["constant.other", currentColorObj["purple"]],
    ["other.constant", currentColorObj["purple"]],

    ["constant.numeric", currentColorObj["purple"]],
    ["numeric.constant", currentColorObj["purple"]],

    ["constant.language", currentColorObj["purple"]],
    ["language.constant", currentColorObj["purple"]],

    ["constant.character", currentColorObj["purple"]],
    ["character.constant", currentColorObj["purple"]],

    ["punctuation.tag", currentColorObj["white"]],
    ["tag.punctuation", currentColorObj["white"]],

    ["punctuation", currentColorObj["white"]],

    ["storage", currentColorObj["red"]],

    ["meta.tag", currentColorObj["red"]],
    ["tag.meta", currentColorObj["red"]],

    ["keyword", currentColorObj["red"]],

    ["entity.name.tag", currentColorObj["red"]],
    ["entity.tag.name", currentColorObj["red"]],
    ["tag.entity.name", currentColorObj["red"]],
    ["tag.name.entity", currentColorObj["red"]],
    ["name.tag.entity", currentColorObj["red"]],
    ["name.entity.tag", currentColorObj["red"]],
  ]);
}
