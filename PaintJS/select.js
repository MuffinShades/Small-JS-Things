/*

File for the Select Tool

Programmed by James Weigand 5/19/2023

version 1.0

This tool is a addon and is not included in the original tutorial due to complexity

*/

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