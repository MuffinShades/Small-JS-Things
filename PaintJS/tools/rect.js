tools['Rect'] = function(x, y, select_color, settings) {
    if (tool_data['Rect'] == void 0) {
        tool_data['Rect'] = {
            dat_save: [],
            current_r: false,
            sx: 0,
            sy: 0,
            color: {},
        }
    }

    if (settings.mode == 0) {
        tool_data['Rect'].current_r = true;
        tool_data['Rect'].sx = x;
        tool_data['Rect'].sy = y;
        tool_data['Rect'].dat_save = ctx.getImageData(0,0,can.width,can.height);
        tool_data['Rect'].color = current_color;
    }

    if (settings.mode == 1) {
        if (tool_data['Rect'].current_r) {
            ctx.lineWidth = settings.brush_size;
            ctx.putImageData(tool_data['Rect'].dat_save,0,0);
            SetCanvasStrokeColor(tool_data['Rect'].color);
            let sy = tool_data['Rect'].sy, sx = tool_data['Rect'].sx;
            if (x - sx >= 0 && y - sy >= 0) {
                ctx.strokeRect(sx, sy, x-sx, y-sy);
            } else {
                let _x = sx, _y = sy, _w = x-sx, _h = y-sy;
                if (x - sx < 0 && y - sy >= 0) {
                    _x = x;
                    _w = Math.abs(x-sx);
                }

                if (x - sx >= 0 && y - sy < 0) {
                    _y = y;
                    _h = Math.abs(y-sy);
                }

                ctx.strokeRect(_x, _y, _w, _h);
            }
        }
    }

    if (settings.mode == 2) {
        if (tool_data['Rect'].current_r) {
            ctx.putImageData(tool_data['Rect'].dat_save,0,0);
            ctx.lineWidth = settings.brush_size;
            SetCanvasStrokeColor(tool_data['Rect'].color);
            let sy = tool_data['Rect'].sy, sx = tool_data['Rect'].sx;
            if (x - sx >= 0 && y - sy >= 0) {
                ctx.strokeRect(sx, sy, x-sx, y-sy);
            } else {
                let _x = sx, _y = sy, _w = x-sx, _h = y-sy;
                if (x - sx < 0 && y - sy >= 0) {
                    _x = x;
                    _w = Math.abs(x-sx);
                }

                if (x - sx >= 0 && y - sy < 0) {
                    _y = y;
                    _h = Math.abs(y-sy);
                }

                ctx.strokeRect(_x, _y, _w, _h);
            }
            tool_data['Rect'].current_r = false;
        }
    }
}