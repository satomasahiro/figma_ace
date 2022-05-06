// UI表示
figma.showUI(__html__);
figma.ui.resize(120, 160);

// フォント読込
const fontName = {
  family: "Source Code Pro",
  style: "Regular",
};
figma.loadFontAsync(fontName);

// グローバル変数宣言
let targetTextNodes: TextNode[] = [];
let targetTexts: String[] = [];

// ui.tsからメッセージ受信
figma.ui.onmessage = (msg) => {
  // Highlight! クリック時
  if (msg.type === "highlight") {
    initTargetData();
    // ui.tsに対象のテキスト配列を送る
    figma.ui.postMessage(targetTexts);
  }

  // Highlight! クリック後のFillカラー反映時
  if (msg.type === "setFills") {
    setFills(msg.rgbRowsArray);
  }
};

function initTargetData() {
  targetTexts = [];
  targetTextNodes = [];
  if (figma.currentPage.selection.length <= 0) {
    figma.currentPage.children.forEach((node) => {
      findTextNodeRecursively(node);
    });
  } else {
    figma.currentPage.selection.forEach((node) => {
      findTextNodeRecursively(node);
    });
  }
}

function findTextNodeRecursively(item: BaseNode) {
  // font familyだけではコードに絞れなかったのでitem.nameも合わせて絞る
  if (
    item.type === "TEXT" &&
    item.name === "body" &&
    item.fontName["family"] === "Source Code Pro"
  ) {
    // smartQuotesは予め置き換えておく
    const characters = item.characters.replace(/“|”/g, '"').replace(/‘|’/g, "'");
    targetTexts.push(characters);
    targetTextNodes.push(item);
  }
  // 複数Nodeを保持するなら再帰的に探す
  if (
    item.type === "INSTANCE" ||
    item.type === "GROUP" ||
    item.type === "FRAME" ||
    item.type === "BOOLEAN_OPERATION"
  ) {
    item.children.forEach((child) => {
      findTextNodeRecursively(child);
    });
  }
}

function setFills(rgbRowsArray: string[][][]) {
  for (let i = 0; i < rgbRowsArray.length; i++) {
    const rgbRows = rgbRowsArray[i];
    const textNode = targetTextNodes[i];
    // ロジックはaceを真似た
    let cursor = 0;
    try {
      rgbRows.forEach((rgbRow) => {
        rgbRow.forEach((rgbInfo: any) => {
          textNode.setRangeFills(cursor, cursor + rgbInfo.value.length, [
            { color: rgbInfo.rgb, type: "SOLID" },
          ]);
          cursor += rgbInfo.value.length;
        });
        cursor++;
      });
    } catch (e) {
      console.log(e);
      figma.closePlugin();
    }
  }
}
