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
ctx.globalAlpha = 0;
ctx.fillRect(0,0,can.width,can.height);
ctx.globalAlpha = 1;

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

//image to canvas data conversion functions
function GetImageDat(img) {
    let _c = document.createElement('canvas');
    _c.width = img.width;
    _c.height = img.height;
    let _ctx = _c.getContext('2d');
    _ctx.drawImage(img,0,0,img.width,img.height);
    return _ctx.getImageData(0,0,_c.width,_c.height);
}

function ImageDatToImage(dat, w, h) {
    let _c = document.createElement('canvas');
    _c.width = w;
    _c.height = h;
    let _ctx = _c.getContext('2d');
    _ctx.putImageData(dat, 0,0);
    let _i = new Image();
    _i.src=_c.toDataURL();
    _i.width = w;
    _i.height = h;
    return _i;
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

let clipboard = [];

let ctrl = false;

window.addEventListener('keydown',function(e) {
    if (e.key.toLowerCase() == 'control') {
        ctrl = true;
    }
    if (ctrl) {
        for (let i = 0; i < ctrlCombos.length; i++) {
            if (typeof ctrlCombos[i] == 'object' && ctrlCombos[i].exe && ctrlCombos[i].char.toLowerCase() == e.key.toLowerCase()) {
                ctrlCombos[i].exe(e);
            }
        }
    }
})

window.addEventListener('keyup',function(e) {
    if (e.key.toLowerCase() == 'control') {
        ctrl = false;
    }
});

let ctrlCombos = [];

ctrlCombos.push({
    char: 'c',
    exe: function(e) {
        Copy();
    }
})

ctrlCombos.push({
    char: 'v',
    exe: function(e) {
        Paste();
    }
})

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

function Copy() {
    if (tool_data['Select']) {
        let dat = tool_data['Select'];

        if (dat.select_mov) {
            clipboard.push(
                {
                    x: dat.sel_x,
                    y: dat.sel_y,
                    w: dat.sel_w,
                    h: dat.sel_h,
                    img: dat.img
                }
            );
        }
    }
}

function Paste() {
    if (clipboard.length > 0) {
        let dat = tool_data['Select'];

        let clip_dat = clipboard[clipboard.length -1];

        SelectImg(clip_dat.img, clip_dat.x, clip_dat.y, clip_dat.w, clip_dat.h);
    }
}

let img_prompt = document.getElementById('img_prompt');

function PromptImage() {
    img_prompt.style.display = 'block';
}

function AddImage() {
    let e = document.getElementById('img_file_inp');

    let _img = e.files;
    
    if (_img.length > 0) {
        let img = _img[0];

        let IMG = new Image();
        IMG.src = URL.createObjectURL(img);
        IMG.onload = function() {
            SelectImg(this, 0, 0, this.naturalWidth, this.naturalHeight);
        }
    }

    img_prompt.style.display = 'none';
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