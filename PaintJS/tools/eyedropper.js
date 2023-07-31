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
                ctx.fillStyle = '#fff';
                ctx.fillRect(15+x+((i+5)*10),15+y+((j+5)*10),10,10);
                ctx.globalAlpha =dat.data[idx+3] / 255;
                ctx.fillStyle = `rgb(${dat.data[idx+0]},${dat.data[idx+1]},${dat.data[idx+2]})`
                ctx.fillRect(15+x+((i+5)*10),15+y+((j+5)*10),10,10);
                ctx.globalAlpha = 1;
                ctx.strokeStyle = '#eee';
                ctx.strokeRect(15+x+((i+5)*10), 15+y+((j+5)*10),10,10);
            }
        }
        ctx.strokeStyle = '#000';
        ctx.strokeRect(15+x+((0+5)*10), 15+y+((0+5)*10),10,10);
    }

    if (settings.mode == 2) {
        ctx.putImageData(tool_data['Eye Dropper'].dat,0,0);
    }
}