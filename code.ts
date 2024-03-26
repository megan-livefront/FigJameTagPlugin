figma.showUI(__html__);
figma.ui.resize(400, 350);

type Fills = typeof figma.mixed | readonly Paint[];

/** Adds a tag to each `STICKY` node in the selection with the given tag name and color. */
figma.ui.onmessage = (msg: {
  type: string;
  tagName: string;
  tagColor: string;
}) => {
  if (msg.type === "create-tag") {
    const currentViewPort = figma.currentPage.selection[0].absoluteBoundingBox;

    if (currentViewPort) {
      (async () => {
        const tag = figma.createShapeWithText();
        tag.shapeType = "ROUNDED_RECTANGLE";

        // Load the font before setting characters
        await figma.loadFontAsync(tag.text.fontName as FontName);
        tag.text.characters = msg.tagName;

        // Set width and height of tag
        const tagWidth = getTagWidth(msg.tagName);
        const tagHeight = 40;
        tag.resize(tagWidth, tagHeight);

        // Set color of tag
        const fills = cloneFills(tag.fills);
        if (Array.isArray(fills)) {
          const backgroundColor = getBackgroundColor(msg.tagColor);
          fills[0] = figma.util.solidPaint(backgroundColor, fills[0]);
          tag.fills = fills;
        }

        // Add tag to each of the selected sticky nodes
        const selectedNodes = figma.currentPage.selection;
        selectedNodes.forEach((node, index) => {
          if (node.type === "STICKY") {
            const stickyX = node.x;
            const stickyY = node.y;
            const tagForNode = index === 0 ? tag : tag.clone();
            tagForNode.x = stickyX + node.width - tagWidth - 15;
            tagForNode.y = stickyY + node.height - (tagHeight + 15);
            figma.group([node, tagForNode], figma.currentPage);
          }
        });

        figma.closePlugin();
      })();
    }
  }
};

function getBackgroundColor(tagColor: string): string {
  return tagColor.includes("#") ? tagColor : `#${tagColor}`;
}

/** Returns appropriate tag width based on characters in `tagName`. */
function getTagWidth(tagName: string): number {
  const widthBasedOnTagText = tagName.length * 15;
  if (widthBasedOnTagText < 50) return 60;
  else if (widthBasedOnTagText > 150) return 150;
  else return widthBasedOnTagText;
}

/** Returns a clone of the given `fills` object. */
function cloneFills(fills: Fills): Fills {
  return JSON.parse(JSON.stringify(fills));
}
