const can = document.getElementById('c');
const ctx = can.getContext('2d');

var temp = document.getElementById('temp-cell');

can.style = 'border: 1px solid #000;';
can.width = 500;
can.height = 500;
/*

0: draw
1: fill
2: rectangle
3: circle
4: select
5: magic select

*/
let _r = can.getClientRects();
temp.style = `position: absolute; top: ${_r.top}; left: ${_r.left}; width: ${can.width}; height: ${can.height};`;

ctx.fillStyle = '#fff';
ctx.fillRect(0,0,can.width,can.height);

ctx.strokeStyle = '#f00';
ctx.strokeRect(200,200,50, 50);

can.style.position = 'relative';

var current_color = {
    r: 0,
    g: 0,
    b: 0,
    a: 255,
}

var current_tool = 'Brush';

var BrushSize = 1;

function SetBrushSize(v) {
    BrushSize = v;
}

function _Undo() {
    if (undo_history.length > 0) {
        redo_history.push(ctx.getImageData(0,0,can.width,can.height));
        let h = undo_history.pop();
        ctx.putImageData(h,0,0);
    }
}

function Redo() {
    if (redo_history.length > 0) {
        undo_history.push(ctx.getImageData(0,0,can.width,can.height));
        ctx.putImageData(redo_history.pop(),0,0);
    }
}

var undo_history=[];
var redo_history = [];

var tools = {};

var lastX = -1;
var lastY = -1;

var drawing = false;

function SetColorInp(inp) {
    let val = Lights.GetRGB(Lights.ToRgb(inp.value));

    current_color = {
        r: val[0],
        g: val[1],
        b: val[2],
        a: 255,
    }
}

let tool_data = {};

function SetCanvasFillColor(s) {
    ctx.globalAlpha = 1;
    if (typeof s == 'object') {
        ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
        if (s.a != void 0)ctx.globalAlpha = (s.a / 255);
    } else {
        ctx.fillStyle = 'rgb(0,0,0)'
    }
}

function SetCanvasStrokeColor(s) {
    ctx.globalAlpha = 1;
    if (typeof s == 'object') {
        ctx.strokeStyle = `rgb(${s.r},${s.g},${s.b})`;
        if (s.a != void 0) ctx.globalAlpha = (s.a / 255);
    } else {
        ctx.strokeStyle = 'rgb(0,0,0)'
    }
}

function SetTool(t) {
    current_tool = t;
}

window.addEventListener('mousedown', function(e) {
    ctx.globalAlpha = 1;
    let rect = can.getBoundingClientRect();

    mx = e.pageX - rect.left;
    my = e.pageY - rect.top;

    if (mx >= 0 && mx <= can.width && my >= 0 && my <= can.height) {
        undo_history.push(ctx.getImageData(0,0,can.width,can.height));
        redo_history = [];
    }

    //modes: 0 mousedown, 1 mousemove, 2 mouseup
    tools[current_tool](mx, my, current_color, {mode:0,brush_size:BrushSize});
});

window.addEventListener('mousemove', function(e) {
    ctx.globalAlpha = 1;
    let rect = can.getBoundingClientRect();

    mx = e.pageX - rect.left;
    my = e.pageY - rect.top;

    //modes: 0 mousedown, 1 mousemove, 2 mouseup
    tools[current_tool](mx, my, current_color, {mode:1,brush_size:BrushSize});
});

window.addEventListener('mouseup', function(e) {
    ctx.globalAlpha = 1;
    let rect = can.getBoundingClientRect();

    mx = e.pageX - rect.left;
    my = e.pageY - rect.top;

    //modes: 0 mousedown, 1 mousemove, 2 mouseup
    tools[current_tool](mx, my, current_color, {mode:2,brush_size:BrushSize});
});

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

tools['Fill'] = function(x, y, select_color, settings) {
    if (settings.mode == 0) {
    let _dat = ctx.getImageData(0,0,can.width,can.height);

    var GetPixelColor = function(x, y, w, dat) {
        let p  = (x + y*w) * 4;
        return {

            r: dat[p+0],
            g: dat[p+1],
            b: dat[p+2],
            a: dat[p+3],
        }
    };

    //alert(GetPixelColor(0,0).r);

    var targetColor = GetPixelColor(x,y,can.width,_dat.data);

    //alert(targetColor.r);

    let pix = [
        {x: x+1, y: y},
        {x: x, y: y + 1},
        {x: x-1, y: y},
        {x: x, y: y-1}
    ];

    if (targetColor.r == select_color.r && targetColor.g == select_color.g && targetColor.b == select_color.b) return;

    while (pix.length > 0) {
        let p = pix.pop();
        //console.log(GetPixelColor(p.x,p.y), targetColor, GetPixelColor(p.x,p.y) == targetColor);
        var pval = GetPixelColor(p.x, p.y, can.width, _dat.data);
        if (pval.r == targetColor.r && pval.g == targetColor.g && pval.b == targetColor.b && pval.a == targetColor.a && p.x > 0 && p.y > 0 && p.x < can.width && p.y < can.height) {
            let _p = (p.x+(p.y*can.width))*4;

            _dat.data[_p+0] = select_color.r;
            _dat.data[_p+1] = select_color.g;
            _dat.data[_p+2] = select_color.b;
            _dat.data[_p+3] = select_color.a;

            pix.push({x: p.x + 1, y: p.y + 0});
            pix.push({x: p.x + 0, y: p.y + 1});
            pix.push({x: p.x - 1, y: p.y - 0});
            pix.push({x: p.x - 0, y: p.y - 1});
        }
    }

    ctx.putImageData(_dat,0,0);
}
};



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

        can.appendChild(e);
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

tools['Eraser'] = function(x, y, select_color, settings) {
    tools['Brush'](x,y, {r:255,g:255,b:255,a:255}, settings);
}