// ArcGrid Figma Plugin — Main (sandbox)
// Runs in Figma's plugin sandbox; communicates with ui.html via postMessage.

figma.showUI(__html__, { width: 420, height: 580, themeColors: true });

// Send selection info (name only, no SVG export yet) 
function sendSelectionInfo() {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
        figma.ui.postMessage({ type: 'no-selection' });
        return;
    }
    if (selection.length > 1) {
        figma.ui.postMessage({ type: 'multi-selection', count: selection.length });
        return;
    }
    // Just notify UI that a node is selected (don't export yet)
    figma.ui.postMessage({ type: 'selection-ready', name: selection[0].name });
}

// Export SVG and send to UI (only when user clicks Analyze)
async function exportAndSend() {
    const selection = figma.currentPage.selection;
    if (selection.length !== 1) {
        sendSelectionInfo();
        return;
    }

    const node = selection[0];
    figma.ui.postMessage({ type: 'loading', name: node.name });

    try {
        const svgBytes = await node.exportAsync({ format: 'SVG' });
        figma.ui.postMessage({ type: 'svg-data', svgBytes, name: node.name });
    } catch (e) {
        figma.ui.postMessage({ type: 'error', message: 'Failed to export SVG: ' + (e.message || String(e)) });
    }
}

// Send initial selection info
sendSelectionInfo();

// Watch for selection changes (just update info, don't auto-analyze)
figma.on('selectionchange', () => {
    sendSelectionInfo();
});

// Listen for messages from UI
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'close') {
        figma.closePlugin();
    }
    if (msg.type === 'resize') {
        figma.ui.resize(msg.width, msg.height);
    }
    // Manual analyze trigger from UI
    if (msg.type === 'analyze') {
        exportAndSend();
    }
    // Export SVG back to Figma canvas
    if (msg.type === 'export-svg') {
        const selection = figma.currentPage.selection;
        if (selection.length > 0) {
            try {
                // Create new node from the generated SVG string
                const newNode = figma.createNodeFromSvg(msg.svgString);
                newNode.name = `${selection[0].name} (ArcGrid)`;

                // Position it next to the original node
                newNode.x = selection[0].x + selection[0].width + 20;
                newNode.y = selection[0].y;

                // Add to same parent if possible
                if (selection[0].parent) {
                    selection[0].parent.appendChild(newNode);
                } else {
                    figma.currentPage.appendChild(newNode);
                }

                // Select the new node
                figma.currentPage.selection = [newNode];

                figma.notify("ArcGrid SVG exported successfully!");
            } catch (err) {
                figma.notify("Failed to export SVG: " + (err.message || String(err)), { error: true });
            }
        }
    }
};
