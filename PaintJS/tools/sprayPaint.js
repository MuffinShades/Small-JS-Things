i_execute['sprayPaint'] = function() {
    tool_data['sprayPaint'] = {
        color: '#000',
        settings: {},
        x: 0,
        y: 0,
    }
}

tools['sprayPaint'] = function(x, y, select_color, settings) {
    if (settings.mode == 0) {
        drawing = true;
        tool_data['sprayPaint'] = {
            color: select_color,
            settings: settings,
            x: x,
            y: y
        }
    }

    if (settings.mode == 1) {
        tool_data['sprayPaint'].x = x;
        tool_data['sprayPaint'].y = y;
    }

    if (settings.mode == 2) {
        drawing = false;
    }
}

tool_update['sprayPaint'] = function() {
    if (drawing) {
        let r = tool_data['sprayPaint'].settings.brush_size;
        let a = Math.PI * r ** 2;
        for (let i = 0; i < a / 100; i++) {
            let theta = Math.random()*Math.PI*2;
            let u=tool_data['sprayPaint'].x+(Math.random()*r)*Math.cos(theta);
            let v=tool_data['sprayPaint'].y+(Math.random()*r)*Math.sin(theta);
            ctx.fillStyle = SetCanvasFillColor(tool_data['sprayPaint'].color);
            ctx.fillRect(u,v,1,1);
        }
    }
}