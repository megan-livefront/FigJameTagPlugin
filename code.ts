figma.showUI(__html__);

/** Finds nodes within the selection that contain the `clusterString` text. */
figma.ui.onmessage = (msg: { type: string; tagName: string }) => {
  if (msg.type === "create-tag") {
    const currentViewPort = figma.currentPage.selection[0].absoluteBoundingBox;

    if (currentViewPort) {
      (async () => {
        const tag = figma.createShapeWithText();
        tag.shapeType = "ROUNDED_RECTANGLE";

        // Load the font before setting characters
        await figma.loadFontAsync(tag.text.fontName as FontName);

        tag.text.characters = msg.tagName;
        const tagWidth = 150;
        const tagHeight = getTagHeight(tag);
        tag.resize(tagWidth, tagHeight);

        const selectedNodes = figma.currentPage.selection;
        selectedNodes.forEach((node) => {
          if (node.type === "STICKY") {
            const stickyX = node.x;
            const stickyY = node.y;
            const tagForNode = tag.clone();
            tagForNode.x = stickyX + 15;
            tagForNode.y = stickyY + node.height - (tagHeight + 15);
            figma.group([node, tagForNode], figma.currentPage);
          }
        });

        figma.closePlugin();
      })();
    }
  }
};

/** Returns the appropriate height for the tag based on the character count. */
function getTagHeight(tag: ShapeWithTextNode): number {
  const tagTextCharCount = tag.text.characters.length;
  const lines = parseInt((tagTextCharCount / 15).toString()) + 1;
  return lines * 50;
}
