figma.showUI(__html__);
figma.ui.resize(120, 220);

const HIGHLIGHT_MODE = {
  SELECT: "select",
  ALL: "all",
  REALTIME: "realtime",
};

let selection,
  text,
  highlightMode = HIGHLIGHT_MODE.SELECT;
changeSlection();

function changeSlection() {
  if (highlightMode != HIGHLIGHT_MODE.SELECT) {
    return;
  }

  selection = figma.currentPage.selection;
  if (selection.length == 0) {
    // ui.tsにメッセージ送信
    figma.ui.postMessage("obj-unselected");
    return;
  }
}

figma.on("selectionchange", () => {
  changeSlection();
});

// ui.tsからメッセージ受信
figma.ui.onmessage = async (msg) => {
  // highlight-mode 変更時
  if (msg.type === "changeHighlightMode") {
    highlightMode = msg.highlightMode;
  }

  // Highlight! クリック時
  if (msg.type === "highlight") {
    setTextAndNode();
    figma.ui.postMessage(selectedTexts);
  }

  // Highlight! クリック後のカラー反映時
  if (msg.type === "setRgbRowArrays") {
    const rgbRow2DArray: string[][][] = msg.rgbRow2DArray;
    await figma.loadFontAsync(selectedTextNodes[0].fontName as FontName);

    for (let i = 0; i < rgbRow2DArray.length; i++) {
      const rgbRowArray = rgbRow2DArray[i];
      let cursor = 0;
      try {
        // console.log(msg.rgbRow2DArray);
        rgbRowArray.forEach((rgbRow) => {
          rgbRow.forEach((rgbInfo: any) => {
            selectedTextNodes[i].setRangeFills(cursor, cursor + rgbInfo.value.length, [
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
};

let selectedTextNodes: TextNode[] = [];
let selectedTexts: String[] = [];

function setTextAndNode() {
  selectedTexts = [];
  selectedTextNodes = [];
  selection.forEach((node) => {
    findTextNodeRecursively(node);
  });
}

function findTextNodeRecursively(item: BaseNode) {
  if (item.type === "TEXT" && item.name === "body") {
    const font = item.fontName;
    if (font["family"] === "Source Code Pro") {
      selectedTexts.push(item.characters);
      selectedTextNodes.push(item);
    }
  }
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

function highlightObjects() {
  text = selection[0] as TextNode;
  const characters = text.characters.replace(/“|”/g, '"').replace(/‘|’/g, "'");
  figma.ui.postMessage(characters);
}
