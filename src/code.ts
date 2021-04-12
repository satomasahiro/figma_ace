figma.showUI(__html__)

const selection = figma.currentPage.selection
if (selection.length == 0 || selection[0].type != 'TEXT') {
  alert('Please select a text node you want to highlight')
  figma.closePlugin()
}

const text = selection[0] as TextNode
const characters = text.characters.replace(/“|”/g, '"').replace(/‘|’/g, "'")

figma.ui.postMessage(characters)

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
      // figma.closePlugin();
    } catch(e) {
      console.log(e)
      figma.closePlugin()
    }
  }
}