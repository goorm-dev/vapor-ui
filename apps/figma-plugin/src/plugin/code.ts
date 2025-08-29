figma.showUI(__html__);
figma.ui.resize(400, 400);

figma.ui.onmessage = (msg) => {
    console.log('UI로부터 받은 메시지:', msg);
    if (msg.type === 'create-rectangle') {
        const rect = figma.createRectangle();
        rect.name = 'My Rectangle';
        figma.currentPage.appendChild(rect);
        figma.notify('사각형이 생성되었습니다! ✅');
    }
};
