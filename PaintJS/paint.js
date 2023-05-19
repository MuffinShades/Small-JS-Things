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

ctx.translate(0.5,0.5);

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

let i_execute = {};

function SetTool(t) {
    if (typeof i_execute[t] == 'function') i_execute[t]();
    current_tool = t;
}

can.addEventListener('mousedown', function(e) {
    ctx.globalAlpha = 1;
    let rect = can.getBoundingClientRect();

    mx = e.pageX - rect.left;
    my = e.pageY - rect.top;

    if (mx >= 0 && mx <= can.width && my >= 0 && my <= can.height && current_tool != 'Eye Dropper') {
        undo_history.push(ctx.getImageData(0,0,can.width,can.height));
        redo_history = [];
    }

    //modes: 0 mousedown, 1 mousemove, 2 mouseup
    tools[current_tool](mx, my, current_color, {mode:0,brush_size:BrushSize});
});

can.addEventListener('mousemove', function(e) {
    ctx.globalAlpha = 1;
    let rect = can.getBoundingClientRect();

    mx = e.pageX - rect.left;
    my = e.pageY - rect.top;

    //modes: 0 mousedown, 1 mousemove, 2 mouseup
    tools[current_tool](mx, my, current_color, {mode:1,brush_size:BrushSize});
});

can.addEventListener('mouseup', function(e) {
    ctx.globalAlpha = 1;
    let rect = can.getBoundingClientRect();

    mx = e.pageX - rect.left;
    my = e.pageY - rect.top;

    //modes: 0 mousedown, 1 mousemove, 2 mouseup
    tools[current_tool](mx, my, current_color, {mode:2,brush_size:BrushSize});
});

function SetColorInputValue(e, v){
    let r_hex = v.r.toString(16);
    let g_hex = v.g.toString(16);
    let b_hex = v.b.toString(16);

    if (r_hex.length == 1) {
        r_hex = `0${r_hex}`;
    }

    if (g_hex.length == 1) {
        g_hex = `0${g_hex}`;
    }

    if (b_hex.length == 1) {
        b_hex = `0${b_hex}`;
    }

    e.value = `#${r_hex}${g_hex}${b_hex}`;
}

var tool_update = {

};

setInterval(function(){
    if (tool_update[current_tool] != void 0) {
        tool_update[current_tool]();
    }
},1);

function setCursor(mode) {
    can.style.cursor=mode;
}

function resetCursor() {
    can.style.cursor = 'default';
}

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

function ImageDatToImage(dat, w, h) {
    let _c = document.createElement('canvas');
    _c.width = w;
    _c.height = h;
    let _ctx = _c.getContext('2d');
    _ctx.putImageData(dat, 0,0);
    let _i = new Image();
    _i.src=_c.toDataURL();
    return _i;
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

i_execute['Eye Dropper'] = function() {
    tool_data['Eye Dropper'] = {
        dat: ctx.getImageData(0,0,can.width,can.height),
        last_tool: current_tool,
    }
}

tools['Eye Dropper'] = function(x, y, select_color, settings) {
    if (settings.mode == 0) {
        let dat = tool_data['Eye Dropper'].dat;
        let mdx = (x + (y * can.width))*4;
        current_color = {
            r: dat.data[mdx+0],
            g: dat.data[mdx+1],
            b: dat.data[mdx+2],
            a: dat.data[mdx+3]
        }
        SetTool(tool_data['Eye Dropper'].last_tool);
        ctx.putImageData(tool_data['Eye Dropper'].dat,0,0);
        SetColorInputValue(document.querySelector('#color_inp'),current_color);
    }

    if (settings.mode == 1) {
        ctx.putImageData(tool_data['Eye Dropper'].dat,0,0);
        let dat = tool_data['Eye Dropper'].dat;
        let mdx = (x + (y * can.width))*4;
        ctx.lineWidth = 1;
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                let idx = mdx + (i + j*can.height)*4;

                
                ctx.fillStyle = `rgb(${dat.data[idx+0]},${dat.data[idx+1]},${dat.data[idx+2]})`
                ctx.fillRect(15+x+((i+5)*10),15+y+((j+5)*10),10,10);
                ctx.strokeStyle = '#eee';
                ctx.strokeRect(15+x+((i+5)*10), 15+y+((j+5)*10),10,10);
            }
        }
        ctx.strokeStyle = '#999';
        ctx.strokeRect(15+x+((0+5)*10), 15+y+((0+5)*10),10,10);
    }

    if (settings.mode == 2) {
        ctx.putImageData(tool_data['Eye Dropper'].dat,0,0);
    }
}

tools['Select'] = function(x, y, current_color, settings) {
    if (tool_data['Select'] == void 0 || tool_data['Select'] == {}) {
        tool_data['Select'] = {
            dat: null,
            c_sav: null,
            sx: 0,
            sy: 0,
            sel_x:0,
            sel_y:0,
            sel_w:0,
            sel_h:0,
            img:null,
            xOff: 0,
            yOff: 0,
            mov: false,
            dash_offset: 0,
            dash_space: 5,
            current_r: false,
            select_mov: false,
            pts: [],
            point_w: 4,
            current_pt:-1,
        }
    }

    let dat = tool_data['Select'];

    if (settings.mode == 0) {
        if (!dat.select_mov) {
            tool_data['Select'].sx = x;
            tool_data['Select'].sy = y;
            tool_data['Select'].c_sav = ctx.getImageData(0,0,can.width,can.height);
            tool_data['Select'].current_r = true;
        }

        if (dat.pts) {
            for (let i = 0; i < dat.pts.length; i++) {
                let p = dat.pts[i];
                let pw = dat.point_w/2;
                if (x <= p.x + pw && x + 1 >= p.x - pw && y <= p.y + pw && y + 1 >= p.y - pw) {
                    tool_data['Select'].current_pt = i;
                }
            }
        }

        if (dat.select_mov || dat.current_r) {
            let sx = dat.sel_w >= 0 ? dat.sel_x : dat.sel_x + dat.sel_w;
            let sy = dat.sel_h >= 0 ? dat.sel_y : dat.sel_y + dat.sel_h; 
            let sw = dat.sel_w >= 0 ? dat.sel_w : dat.sel_x - sx;
            let sh = dat.sel_h >= 0 ? dat.sel_h : dat.sel_y - sy;
            sx -= dat.point_w;
            sy -= dat.point_w;
            sw += dat.point_w * 2;
            sh += dat.point_w*2;
            //ctx.fillStyle = '#f00';
            //ctx.fillRect(sx,sy,sw,sh);
            if (!(x <= sx + sw && x +1 >= sx && y <= sy + sh && y + 1 >= sy)) {
                ctx.putImageData(dat.c_sav,0,0);
                ctx.drawImage(dat.img,dat.sel_x,dat.sel_y,dat.sel_w,dat.sel_h);
                tool_data['Select'] = void 0;
            } else if (dat.current_pt < 0) {
                console.log('!');
                dat.mov = true;
                dat.xOff = x - dat.sel_x;
                dat.yOff = y - dat.sel_y;
            }
        }
    }

    if (settings.mode == 1) {
        //hovering
        if (dat.current_pt < 0 && !dat.current_r) {
            let sx = dat.sel_w >= 0 ? dat.sel_x : dat.sel_x + dat.sel_w;
            let sy = dat.sel_h >= 0 ? dat.sel_y : dat.sel_y + dat.sel_h; 
            let sw = dat.sel_w >= 0 ? dat.sel_w : dat.sel_x - sx;
            let sh = dat.sel_h >= 0 ? dat.sel_h : dat.sel_y - sy;
            sx -= dat.point_w;
            sy -= dat.point_w;
            sw += dat.point_w * 2;
            sh += dat.point_w*2;
            //ctx.fillStyle = '#f00';
            //ctx.fillRect(sx,sy,sw,sh);
            if (x <= sx + sw && x +1 >= sx && y <= sy + sh && y + 1 >= sy) {
                //hover events
                setCursor('move');

                if (dat.pts) {
                    for (let i = 0; i < dat.pts.length; i++) {
                        let p = dat.pts[i];
                        let pw = dat.point_w/2;
                        if (x <= p.x + pw && x + 1 >= p.x - pw && y <= p.y + pw && y + 1 >= p.y - pw) {
                            setCursor(p.cursor);
                        }
                    }
                }
            } else {
                setCursor('');
            }
        }
        ctx.globalAlpha=1;
            if (dat.current_r) {

                //draw bounding box
                ctx.lineWidth = 0.5;
                ctx.putImageData(tool_data['Select'].c_sav,0,0);
                ctx.strokeStyle = 'rgba(0,0,0,255)';
                let sy = tool_data['Select'].sy, sx = tool_data['Select'].sx;
                let _x = sx, _y = sy, _w = x-sx, _h = y-sy;
                    if (x - sx < 0 && y - sy >= 0) {
                        _x = x;
                        _w = Math.abs(x-sx);
                    }
    
                    if (x - sx >= 0 && y - sy < 0) {
                        _y = y;
                        _h = Math.abs(y-sy);
                    }
    
                    ctx.strokeRect(_x,_y,_w,_h);
            } else if (dat.select_mov) {
                if (dat.current_pt >= 0) {
                    let x_sav = tool_data['Select'].pts[dat.current_pt].x;
                    let y_sav = tool_data['Select'].pts[dat.current_pt].y;

                    tool_data['Select'].pts[dat.current_pt].x = x;
                    tool_data['Select'].pts[dat.current_pt].y = y;

                    let of_x = x_sav - x;
                    let of_y = y_sav - y;

                    let p_dat = tool_data['Select'].pts[dat.current_pt];

                    if (p_dat.modX == 'sel_x') {
                        tool_data['Select'][p_dat.modX] = p_dat.x;
                        tool_data['Select']['sel_w'] += of_x;
                    }

                    if (p_dat.modY == 'sel_y') {
                        tool_data['Select'][p_dat.modY] = p_dat.y;
                        tool_data['Select']['sel_h'] += of_y;
                    }

                    if (p_dat.modX == 'sel_w') {
                        tool_data['Select'][p_dat.modX] = x - dat.sel_x;
                    }

                    if (p_dat.modY == 'sel_h') {
                        tool_data['Select'][p_dat.modY] = y - dat.sel_y;
                    }

                    for (let i = 0; i < tool_data['Select'].pts.length; i++) {
                        tool_data['Select'].pts[i].updateP(dat);
                    }
                } else if (dat.mov) {
                    dat.sel_x = x - dat.xOff;
                    dat.sel_y = y - dat.yOff;

                    for (let i = 0; i < dat.pts.length; i++) {
                        dat.pts[i].updateP(dat);
                    }
                }
            }
    } 
    
    if (settings.mode == 2) {
        if (tool_data['Select'].current_r) {
            tool_data['Select'].select_mov = true;
            let dat = tool_data['Select'];

            tool_data['Select'].current_r = false;

        let sy = tool_data['Select'].sy, sx = tool_data['Select'].sx;
                let _x = sx, _y = sy, _w = x-sx, _h = y-sy;
                    if (x - sx < 0 && y - sy >= 0) {
                        _x = x;
                        _w = Math.abs(x-sx);
                    }
    
                    if (x - sx >= 0 && y - sy < 0) {
                        _y = y;
                        _h = Math.abs(y-sy);
                    }

        tool_data['Select'].sel_x = _x;
        tool_data['Select'].sel_y = _y;
        tool_data['Select'].sel_w = _w;
        tool_data['Select'].sel_h = _h;
        
        ctx.putImageData(dat.c_sav,0,0);
        tool_data['Select'].dat = ctx.getImageData(tool_data['Select'].sel_x+1,tool_data['Select'].sel_y+1,tool_data['Select'].sel_w,tool_data['Select'].sel_h);
        ctx.clearRect(tool_data['Select'].sel_x,tool_data['Select'].sel_y,tool_data['Select'].sel_w,tool_data['Select'].sel_h);
        tool_data['Select'].img = ImageDatToImage(tool_data['Select'].dat,_w,_h);
        tool_data['Select'].c_sav=ctx.getImageData(0,0,can.width,can.height);
        ctx.drawImage(tool_data['Select'].img,tool_data['Select'].sel_x,tool_data['Select'].sel_y,tool_data['Select'].sel_w,tool_data['Select'].sel_h);

        tool_data['Select'].pts = [];

        tool_data['Select'].pts.push({
            x: dat.sel_x,
            y: dat.sel_y,
            modX: 'sel_x',
            modY: 'sel_y',
            cursor: 'nw-resize',
            updateP: function(dat) {
                this.x = dat.sel_x;
                this.y = dat.sel_y;
            }
        })

        tool_data['Select'].pts.push({
            x: dat.sel_x+dat.sel_w,
            y: dat.sel_y,
            modX: 'sel_w',
            modY: 'sel_y',
            cursor: 'ne-resize',
            updateP: function(dat) {
                this.x = dat.sel_x+dat.sel_w;
                this.y = dat.sel_y;
            }
        })

        tool_data['Select'].pts.push({
            x: dat.sel_x+dat.sel_w,
            y: dat.sel_y+dat.sel_h,
            modX: 'sel_w',
            modY: 'sel_h',
            cursor: 'nw-resize',
            updateP: function(dat) {
                this.x = dat.sel_x+dat.sel_w;
                this.y = dat.sel_y+dat.sel_h;
            }
        })

        tool_data['Select'].pts.push({
            x: dat.sel_x,
            y: dat.sel_y+dat.sel_h,
            modX: 'sel_x',
            modY: 'sel_h',
            cursor: 'ne-resize',
            updateP: function(dat) {
                this.x = dat.sel_x;
                this.y = dat.sel_y+dat.sel_h;
            }
        })

        //side points
        tool_data['Select'].pts.push({
            x: dat.sel_x,
            y: dat.sel_y+dat.sel_h/2,
            modX: 'sel_x',
            modY: '',
            cursor: 'w-resize',
            updateP: function(dat) {
                this.x = dat.sel_x;
                this.y = dat.sel_y+dat.sel_h/2;
            }
        })

        tool_data['Select'].pts.push({
            x: dat.sel_x+dat.sel_w/2,
            y: dat.sel_y+dat.sel_h,
            modX: '',
            modY: 'sel_h',
            cursor: 's-resize',
            updateP: function(dat) {
                this.x = dat.sel_x+dat.sel_w/2;
                this.y = dat.sel_y+dat.sel_h;
            }
        })

        tool_data['Select'].pts.push({
            x: dat.sel_x+dat.sel_w,
            y: dat.sel_y+dat.sel_h/2,
            modX: 'sel_w',
            modY: '',
            cursor: 'e-resize',
            updateP: function(dat) {
                this.x = dat.sel_x+dat.sel_w;
                this.y = dat.sel_y+dat.sel_h/2;
            }
        })

        tool_data['Select'].pts.push({
            x: dat.sel_x+dat.sel_w/2,
            y: dat.sel_y,
            modX: '',
            modY: 'sel_y',
            cursor: 'n-resize',
            updateP: function(dat) {
                this.x = dat.sel_x+dat.sel_w/2;
                this.y = dat.sel_y;
            }
        })
        }

        if (tool_data['Select'].select_mov) {
            tool_data['Select'].current_pt = -1;
        }

        resetCursor();
        dat.mov = false;
    }
}

tool_update['Select'] = function() {
    let dat = tool_data['Select'];
    if (typeof dat == 'object' && dat.select_mov) {
        ctx.putImageData(tool_data['Select'].c_sav,0,0);
        ctx.drawImage(tool_data['Select'].img,tool_data['Select'].sel_x,tool_data['Select'].sel_y,tool_data['Select'].sel_w,tool_data['Select'].sel_h);

        tool_data['Select'].dash_offset+=0.2;

        if (tool_data['Select'].dash_offset > tool_data['Select'].dash_space*2) {
            tool_data['Select'].dash_offset = 0;
        }

        ctx.setLineDash([dat.dash_space]);
        ctx.lineDashOffset = -dat.dash_offset;

        ctx.beginPath();
        ctx.moveTo(dat.sel_x,dat.sel_y);
        ctx.lineTo(dat.sel_x+dat.sel_w,dat.sel_y);
        ctx.lineTo(dat.sel_x+dat.sel_w,dat.sel_y+dat.sel_h);
        ctx.lineTo(dat.sel_x,dat.sel_y+dat.sel_h);
        ctx.lineTo(dat.sel_x,dat.sel_y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        for (let i = 0; i < dat.pts.length; i++) {
            
            let p = dat.pts[i];
            let pw = dat.point_w;

            ctx.fillStyle = '#bbb';
            ctx.strokeStyle = '#000';

            ctx.fillRect(p.x-pw/2,p.y-pw/2,pw,pw);
            ctx.strokeRect(p.x-pw/2,p.y-pw/2,pw,pw);
        }
    }
}

/*function DrawLineDash(pa, pb, spacing, offset) {
    //let m  = Math.random()*3;

    if (pa.x > pb.x || pa.y > pb.y) {
        let temp = pb;
        pb = pa;
        pa = temp;
    }

    let x = pa.x ;
    let y = pa.y;

    let x_end = pb.x;
    let y_end = pb.y;

    let dx = x_end - x;
    let dy = y_end - y;

    let l = Math.sqrt(dx**2 + dy**2);

    let y_b = y;
    let x_b = x;

    let m = dy/dx;

    if (m <= 1) {
        x+=offset;
        y+=m*offset;
        for (let i = offset; i < l-offset; i+=spacing*2) {
            x += spacing*2;
            y += m * spacing*2;
    
            ctx.beginPath();
            ctx.moveTo(x,y);
            ctx.lineTo(Math.min(x+spacing, x_end+(dx-offset)),Math.min(y+m*spacing, y_end+(dy-offset)));
            ctx.stroke();
        }
    } else {
        m = dx/dy;
        x += m*offset;
        y += offset;
        for (let i = offset; i < l-offset; i+=spacing*2) {
            x += m*spacing*2;
            y += spacing*2;
    
            ctx.beginPath();
            ctx.moveTo(x,y);
            ctx.lineTo(Math.min(x+m*spacing, x_end+(dx-offset)),Math.min(y+spacing, y_end+(dy-offset)));
            ctx.stroke();
        }
    }
}
let o = 0;
let _y = 50;
setInterval(function() {
    ctx.clearRect(0,0,can.width,can.height);
    //_y += 0.1;
    //o+=0.1;
    if (o >= 10) {
        o=0;
    }
DrawLineDash(
    {
        x:100,y:0,
    },
    {
        x:10,y:100
    },
    5,
    o
)
})*/