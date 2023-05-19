tools['Circle'] = function(x, y, select_color, settings) {
    if (tool_data['Circle'] == void 0) {
        tool_data['Circle'] = {
            dat_save: [],
            current_r: false,
            sx: 0,
            sy: 0,
            color: {},
        }
    }

    if (settings.mode == 0) {
        tool_data['Circle'].current_r = true;
        tool_data['Circle'].sx = x;
        tool_data['Circle'].sy = y;
        tool_data['Circle'].dat_save = ctx.getImageData(0,0,can.width,can.height);
        tool_data['Circle'].color = current_color;

        can.appendChild(e);
    }

    if (settings.mode == 1) {
        if (tool_data['Circle'].current_r) {
            ctx.lineWidth = settings.brush_size;
            ctx.putImageData(tool_data['Circle'].dat_save,0,0);
            SetCanvasStrokeColor(tool_data['Circle'].color);
            let sy = tool_data['Circle'].sy, sx = tool_data['Circle'].sx;
            ctx.beginPath();
            if (x - sx >= 0 && y - sy >= 0) {
                ctx.roundRect(sx, sy, x-sx, y-sy, [sx*sy]);
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
                ctx.roundRect(_x,_y,_w,_h,_w);
            }
            ctx.stroke();
        }
    }

    if (settings.mode == 2) {
        if (tool_data['Circle'].current_r) {
            ctx.putImageData(tool_data['Circle'].dat_save,0,0);
            ctx.lineWidth = settings.brush_size;
            SetCanvasStrokeColor(tool_data['Circle'].color);
            let sy = tool_data['Circle'].sy, sx = tool_data['Circle'].sx;
            ctx.save();
            ctx.beginPath();
            if (x - sx >= 0 && y - sy >= 0) {
                ctx.scale(1, ((y-sy)/2) / ((x-sx)/2));
                ctx.arc(sx, sy, (x-sx)/2, 0, Math.PI * 2);
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
                ctx.scale(1, (_h/2)/(_w/2));
                ctx.arc(_x,_y,_w/2, 0, Math.PI * 2);
            }
            ctx.stroke();
            ctx.restore();
            tool_data['Circle'].current_r = false;
        }
    }
}