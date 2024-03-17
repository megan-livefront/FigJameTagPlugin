figma.showUI(__html__);

type Fills = typeof figma.mixed | readonly Paint[];

/** Finds nodes within the selection that contain the `clusterString` text. */
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
        const tagWidth = 150;
        const tagHeight = 50;
        tag.resize(tagWidth, tagHeight);

        const fills = cloneFills(tag.fills);
        if (Array.isArray(fills)) {
          const tagColor = msg.tagColor;
          const backgroundColor = tagColor.includes("#")
            ? tagColor
            : `#${tagColor}`;
          fills[0] = figma.util.solidPaint(backgroundColor, fills[0]);
          tag.fills = fills;
        }

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

function cloneFills(fills: Fills): Fills {
  return JSON.parse(JSON.stringify(fills));
}
