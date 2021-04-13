figma.showUI(__html__)
figma.ui.resize(240, 80);

let selection, text;
changeSlection();


function changeSlection() {
  selection = figma.currentPage.selection;
  if (selection.length == 0 || selection[0].type != "TEXT") {
    return;
  }

  text = selection[0] as TextNode;
  const characters = text.characters.replace(/“|”/g, '"').replace(/‘|’/g, "'");
  figma.ui.postMessage(characters);
}

figma.on("selectionchange", () => {
  changeSlection();
});

figma.ui.onmessage = async msg => {
  if (msg.type === 'highlight') {
    let cursor = 0
    try {
      await figma.loadFontAsync(text.fontName as FontName)
      console.log(msg.rgbRowArray);
      msg.rgbRowArray.forEach((rgbRow) => {
        rgbRow.forEach(rgbInfo => {
          text.setRangeFills(cursor, cursor + rgbInfo.value.length, [
            { color: rgbInfo.rgb, type: "SOLID" },
          ]);
          cursor += rgbInfo.value.length;
        });
        cursor++;
      });
    } catch(e) {
      console.log(e)
      figma.closePlugin()
    }
  }
}