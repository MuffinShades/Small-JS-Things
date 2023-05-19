tools['Brush'] = function(x, y, select_color, settings) {
    if (settings.mode == 0) {
        drawing = true;
        lastX = x;
        lastY = y;
    }

    if (drawing && settings.mode == 1) {
        ctx.lineWidth = settings.brush_size;
        ctx.strokeStyle = SetCanvasStrokeColor(select_color);
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x,y);
        ctx.stroke();

        lastX = x;
        lastY = y;
    }

    if (settings.mode == 2) {
        drawing = false;
    }
}