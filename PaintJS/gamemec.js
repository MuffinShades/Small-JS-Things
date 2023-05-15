var Physics = {
    BlockCollision: function(x1, y1, w1, h1, x2, y2, w2, h2) {
        return (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2)
    }
}
var Animating = {
    animations: [],
    imageScale: 1,
    freeId: 0,
    cot: 0,
    fps: 0,
    Settings: {
        maxFps: 60,
        desiredFps: 250,
    },
    Create: function(imgSheet, fps, maxFrame, mode, yPosition, spriteWidth, spriteHeight, manual, countData) {
        return {
            img: imgSheet || 'none',
            mxf: maxFrame,
            frame: 0,
            fps: fps || 30,
            count: 0,
            mode: mode || 0,
            cdp: 0,
            countData: countData || [],
            yp: yPosition || 0,
            goo: true,
            sw: spriteWidth || null,
            sh: spriteHeight || null,
            man: manual,
        }
    },
    Run: function(data, x, y, w, h, ctx, nxt) {
        if (!data.man) {
        data.count += Animating.Settings.desiredFps/Animating.fps;
        if (data.count >= data.fps && data.mode == 0) {
            data.frame++;
            data.count = 0;
            if (data.frame > data.mxf - 1) {
                data.frame = 0;
            }
        } else if (data.mode == 1) {
            if (data.count >= data.countData[data.cdp]) {
                data.frame++;
                data.count = 0;
                data.cdp++;
                if (data.cdp >= data.countData.length) {
                    data.cdp = 0;
                }
            }
            if (data.frame > data.mxf - 1) {
                data.frame = 0;
            }
        }} else if (nxt) {
            data.frame++;
            if (data.frame > data.mxf - 1) {
                data.frame = 0;
            }
        }
        if (data.img != 'none' && data.img != void 0 && data.img != null) {
            ctx.drawImage(data.img, data.frame * ((data.sw  * this.imageScale) || 0), data.yp * ((data.sh * this.imageScale) || 0), (data.sw  * this.imageScale || 0), (data.sh  * this.imageScale || 0), x || 0, y || 0, w || 0, h || 0);
        }
        return data;
    },
    changeBlock: ['run', 'updateSettings', 'goo', 'id'],
    StartAnimation: function(d, x, y, w, h, ctx) {
        let an = d;
        an.id = Animating.freeId;
        an.x = x;
        an.y = y;
        an.w = w;
        an.h = h;
        an.ctx = ctx;
        an.run = function() {
            return Animating.Run(this, this.x, this.y, this.w, this.h, this.ctx);
        }
        
        an.updateSettings = function(data) {
            if (typeof data == 'object') {
                let o = Object.keys(data);
                let c = Object.keys(this);
                for (let i = 0; i < o.length; i++) {
                    for (let j = 0; j < c.length; j++) {
                        for (let k = 0; k < Animating.changeBlock.length; k++) {
                            if (o[i] == c[j] && o[i] != Animating.changeBlock[k]) {
                                this[o[i]] = data[o[i]];
                            }
                        }
                    }
                }
            } else {
                console.error('To update settings. The data must be in form of "object".');
            }
        }
        Animating.freeId++;
        Animating.animations.push(an);
        return an;
    },
    StopAnimation: function(id) {
        for (let i = 0; i < Animating.animations.length; i++) {
            let n = Animating.animations[i];
            if (n != void 0) {
                if (n.id == id) {
                    Animating.animations.splice(i, 1);
                    break;
                }
            } else {
                continue;
            }
        }
    },
    PauseAnimation: function(id) {
        for (let i = 0; i < Animating.animations.length; i++) {
            let n = Animating.animations[i];
            if (n.id == id) {
                n.goo = false;
                break;
            }
        }
    },
    ResumeAnimation: function(id) {
        for (let i = 0; i < Animating.animations.length; i++) {
            let n = Animating.animations[i];
            if (n.id == id) {
                n.goo = true;
                break;
            }
        }
    },
    Draw: function() {
        for (let i = 0; i < Animating.animations.length; i++) {
            let m = Animating.animations[i];
            if (m != void 0) {
                if (m.goo == true) {
                    let o = m.run();
                    Animating.animations[i] = o;
                    continue;
                }
            }
        }
    }
}
setInterval(function() {
    Animating.cot++;
},1000/Animating.Settings.maxFps);
setInterval(function() {
    Animating.fps = Animating.cot;
    Animating.cot = 0;
},1000);
var Lights = {
    GetRGB: function(color) {
        var co = color.substring(4, color.length - 1).replace(/ /g, '').split(',');
        for (let i = 0; i < co.length; i++) {
            co[i] = parseInt(co[i]);
        }
        return co;
    },
    ToRgb: function(color, array) {
        let og = color;
        let addHash = false;
        if (color.toLowerCase().replaceAll('rgb') == color.toLowerCase()) {
            addHash = true;
        }
        if (color.toString().replaceAll('#','') == color && array != true) {
            return og;
        } else if (color.toLowerCase().replaceAll('rgb') == color.toLowerCase() || color.toString().replaceAll('#','') != color ) {
            let c = color.toString().replaceAll('#', '');
            let ckeep = c;
            if (c.length == 3) {
                c = c.match(/.{1,1}/g);
            } else if (c.length == 6) {
                c = c.match(/.{1,2}/g);
            } else {
                return og;
            }
            if (ckeep.length == 3 || ckeep.length == 6) {
                let v = [];
                if (ckeep.length == 3) {
                    for (let i = 0; i < c.length; i++) {
                        c[i] = c[i] + c[i];
                    }
                }
                for (let i = 0; i < c.length; i++) {
                    v.push(
                        parseInt(c[i], 16)
                    );
                }
                if (array != true) {
                    let rc = 'rgb(';
                    for (let i = 0; i < v.length; i++) {
                        if (i < v.length-1) {
                            rc += v[i] + ',';
                        } else {
                            rc += v[i] + ')';
                        }
                    }
                    return rc;
                } else {
                    return v;
                }
            }
        } else {
            return Lights.GetRGB(color);
        }
    },
    ApplyAlpha: function(color, alpha) {
        var tc = color;
        if (color.replaceAll('#') != color || color.toLowerCase().replaceAll('rgb') == color.toLowerCase()) {
            tc = Lights.ToRgb(color);
        }
        tc = tc.substring(3, tc.length - 1);
        tc += ',' + alpha + ')';
        tc = 'rgba' + tc;
        return tc;
    },
    CreateLight: function(brightness, spread, color, ctx) {
        this.brightness = brightness;
        this.color = color;
        this.spread=spread;
        this.Draw = function(x, y) {
            let grd = ctx.createRadialGradient(x, y, 1, x, y, this.spread*2);
            grd.addColorStop(0, Lights.ApplyAlpha(this.color, this.brightness));

            grd.addColorStop(1, Lights.ApplyAlpha(this.color, 0));

            ctx.beginPath();
            ctx.arc(x, y, this.spread*2, 0, 2 * Math.PI, false);

            ctx.fillStyle=grd;
            ctx.fill();
        }
    },
    CombineColors: function(c1, c2) {
        let color1 = Lights.ToRgb(c1, true);
        let color2 = Lights.ToRgb(c2, true);

        let r = color1[0]*0.5 + color2[0]*0.5;
        let g = color1[1]*0.5 + color2[1]*0.5;
        let b = color1[2]*0.5 + color2[2]*0.5;

        return 'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+')';
    },
    RandomColor: function() {
        let cr = 'rgb('+Math.floor(Math.random() * 256)+','+Math.floor(Math.random() * 256)+','+Math.floor(Math.random() * 256)+')';
        return cr;
    }
}
var Mouse = {}
document.onmousemove = function(e) {
    Mouse = e;
}
var pat= [];
var Particles = {
    Create: function(color, amount, sx, sy, canCollide, vel, bc) {
        for (let i = 0; i < amount; i++) {
            if (color == 'nyan') {
                pat.push({
                    color: Lights.RandomColor(),
                    x: sx,
                    y: sy,
                    vx: (Math.random()*vel)-vel/2,
                    vy: (Math.random()*vel)-vel/2,
                    smx: false,
                    smy: false,
                    col: canCollide || false,
                    time: 0,
                    maxVel: vel,
                    borderCollsion: bc || false,
                    s: false,
                });
            } else {
                pat.push({
                    color: color,
                    x: sx,
                    y: sy,
                    vx: (Math.random()*vel)-vel/2,
                    vy: (Math.random()*vel)-vel/2,
                    smx: false,
                    smy: false,
                    col: canCollide || false,
                    time: 0,
                    maxVel: vel,
                    borderCollsion: bc || false,
                    s: false,
                });
            }
        }
    },
    Draw: function(offsetX, offsetY, renderCapWidth, renderCapHeight) {
        for (let i = 0; i < pat.length; i++) {
            pat[i].time++;
            if (Physics.BlockCollision(pat[i].x + offsetX, pat[i].y + offsetY, 5, 5, 0, 0, renderCapWidth, renderCapHeight)) {
                ctx.fillStyle = pat[i].color;
                ctx.fillRect(pat[i].x + offsetX, pat[i].y + offsetY, 5, 5);
            }

            //change x and y
            if (pat[i].smx == false) {
                pat[i].x += pat[i].vx;
            }
            if (pat[i].smy == false) {
                pat[i].y += pat[i].vy;
            }
            if (pat[i].time > 50 && pat[i].col == true) {
                for (let j = 0; j < pat.length; j++) {
                    let t = pat[j];
                    if (Math.abs(t.x-pat[i].x) < 20 && Math.abs(t.y-pat[i].y) < 20) {
                        if (Physics.BlockCollision(t.x+t.vx, t.y+t.vy, 6, 6, pat[i].x+pat[i].vx, pat[i].y+pat[i].vy, 6, 6) == true && i != j) {
                            t.smx = false;
                            t.vx += pat[i].vx * 0.75;
    
                            t.smy = false;
                            t.vy += pat[i].vy * 0.75;
    
                            pat[i].vx *= -0.25;
                            pat[i].vy *= -0.25;
                        }
                    }
                }
            }
            if ((pat[i].x < 0 || pat[i].x > can.width) && pat[i].borderCollsion == true) {
                pat[i].vx *= -0.75;
            }
            if ((pat[i].y < 0 || pat[i].y > can.height) && pat[i].borderCollsion == true) {
                pat[i].vy *= -0.75;
            }
            pat[i].vx += -Math.sign(pat[i].vx) * 0.01;
            pat[i].vy += -Math.sign(pat[i].vy) * 0.01;
            if (Math.floor(pat[i].vx*100)/100 == 0) {
                pat[i].smx = true;
            }

            if (Math.floor(pat[i].vy*100)/100 == 0) {
                pat[i].smy = true;
            }
        }
    }
}
var Text = {
    AllChars: '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',
    crub: function(l) {
        let a = '';
        for (let i = 0; i < l; i++) {
            a += Text.AllChars.charAt(Math.floor(Math.random() * Text.AllChars.length));
        }
        return a;
    }
}
Math.clamp = function(v, m ,x) {
    return v > x ? x : v < m ? m : v;
}
var Audio = {
    playing: [],
    audio: [],
    id: Text.crub(8),
    status: 0,
    freeId: 0,
    Ready: function() {
        if(Audio.status > 1) {
            return true;
        }
    },
    PlayFile: function(src, times, settings, endFunc) {
        if (document.getElementById(Audio.id) != null) {
            let srcCheck = src.replaceAll('../', '');
            if (srcCheck.split('.')[1] == 'mp3' || srcCheck.split('.')[1] == 'wav' || srcCheck.split('.')[1] == 'ogg') {
                let set = {
                    src:src,
                    loop: times,
                    played: false,
                    type: src.split('.')[1],
                    times: times,
                    playSpeed: Math.clamp(settings != void 0 ? settings.speed != void 0 ? settings.speed : 1 : 1, 0, 16) || 1,
                    volume: Math.clamp( settings != void 0 ? settings.volume != void 0 ? settings.volume : 1 : 1, 0, 1) || 'def',
                    onend: typeof endFunc == 'function' ? endFunc : function() {},
                    id: Audio.freeId,
                }
                Audio.playing.push(set);
                Audio.freeId++;
                return set;
            } else {
                Audio.TypeErr(src.split('.')[1]);
            }
        } else {
            Audio.LoadErr();
        }
    },
    LoadErr: function() {
        console.error(`Audio API has not finished loading or hasn't loaded at all. To check if it's loaded call "(javascript) Audio.Ready()" or if it hasen't loaded at all call Audio.LoadStart(). We've automatically reloaded the audio API for you. =^._.^=`);
        Audio.LoadStart();
    },
    TypeErr: function(fileType) {
        console.error(`Audio API only supports .wav, .mp3, and .ogg file formats. The format: .`+fileType.replaceAll('.','')+` Is not supported. =^._.^=`);
    },
    LoadStart: function() {
        document.body.focus();
        let audTag = document.createElement('div');
        audTag.id = Audio.id;
        audTag.style.display = 'none';
        document.body.appendChild(audTag);
        Audio.status = 2;
    },
    StopSound: function(id) {
        for (let i = 0; i < Audio.playing.length; i++) {
            let t = Audio.playing[i];
            if (t.id == id) {
                Audio.playing.splice(i, 1);
                document.getElementById('sound'+id).remove();
                break;
            }
        }
    }
}
let wl = [];
var WindowLoad = function(d) {
    wl.push(d);
}
window.onload = function(e) {
    for (let i = 0; i < wl.length; i++) {
        if (typeof wl[i] == 'function') {
            wl[i](e);
        }
    }
}
WindowLoad(Audio.LoadStart());
setInterval(function() {
    //audio player
    for (let i = 0; i < Audio.playing.length; i++) {
        let aud = Audio.playing[i];
        if (aud.played == false) {
            let t = document.getElementById(Audio.id);
            if (t != null) {
                let tg = document.createElement('audio');
                tg.setAttribute('controls', 'none');
                tg.setAttribute('preload', 'auto');
                tg.style.display = 'none';
                tg.playbackRate = aud.playSpeed;
                let sor = document.createElement('source');
                sor.src = aud.src;
                if (aud.volume != 'def' && aud.volume != null && aud.volume != void 0) {
                    tg.volume = aud.volume;
                }
                sor.setAttribute('pindex', i)
                tg.addEventListener('ended', function() {
                    if (aud.times <= 0) {
                        Audio.playing.splice(this.pindex, 1);
                        aud.onend();
                        this.remove();
                    } else {
                        this.play();
                        aud.times--;
                    }
                });
                tg.id = 'sound'+aud.id;
                tg.appendChild(sor);
                t.appendChild(tg);
                tg.play();
                aud.times--;
                aud.played = true;
            } else {
                Audio.LoadErr();
            }
        }
    }
});
var GUI = {
    freeId: 0,
    guis: [],
    CreateText: function(x, y, data) {
        if (data != void 0) {
            this.addtxtGui({
                x: x,
                y: y,
                text: data.content != void 0 ? data.content : [{text:"New Gui", color: '#000', font: 'sans-serif', bold: false, italic: false, underline: false, size: 20,}],
                id: this.freeId,
                background: data.background != void 0 ? data.background : '#fff',
            });
        } else {
            this.addtxtGui({
                x: x,
                y: y,
                text: [{text:"New Gui", color: '#000', font: 'sans-serif', bold: false, italic: false, underline: false, size: 20,}],
                id: this.freeId,
                background: '#fff',
            });
        }
        this.freeId++;
        return this.freeId - 1;
    },
    CreateHTML: function(x, y, html) {
        if (html != void 0) {

        } else {

        }
    },
    Load: function() {
        if (document.getElementById('guis') == null) {
            let g = document.createElement('div');
            g.id = 'guis';
            document.body.appendChild(g);
        }
    },
    addtxtGui: function(txt) {
        //generate text
        let dat = [];
        let styleData = [];
        console.log(txt);
        for (let i = 0; i < txt.text.length; i++) {
            dat[i] = '';
            styleData[i] = '';
            let tx = txt.text[i];
            let t= tx.text || 'New Gui'
            ,c = tx.color
            ,b = tx.bold
            ,o = tx.font
            ,l = tx.italic
            ,u = tx.underline
            ,s = tx.size;

            if (c) {styleData[i] += 'color: '+c+';'}
            if (s) {styleData[i] += 'font-size: '+parseInt(s)+'px;'}
            if (o) {styleData[i] += 'font-family: '+o+';'}
            if (b) {dat[i] += '<b>';}
            if (l) {dat[i] += '<i>';}
            if (u) {dat[i] += '<u>';}
            if (t) {dat[i] += t;}
            if (u) {dat[i] += '</u>';}
            if (l) {dat[i] += '</i>';}
            if (b) {dat[i] += '</b>';}

            console.log(dat);
        }
        let xp = txt.x, yp = txt.y, back = txt.background || '#fff';
        if (document.getElementById('guis') != null) {
            var cd = document.createElement('p');
            for(let i = 0; i < dat.length; i++) {
                if (dat[i] != void 0 && dat[i] != '') {
                    if (styleData[i] != '' && styleData[i] != void 0) {
                        cd.innerHTML += `
                            <span style='`+styleData[i]+`'>
                                `+dat[i]+`
                            </span>
                        `;
                    } else {
                        cd.innerHTML += `
                            <span>
                                `+dat[i]+`
                            </span>
                        `;
                    }
                }
            }
            cd.style = 'position: absolute; top: '+yp+'px;, left: '+xp+'px; background: '+back+';';
            document.getElementById('guis').appendChild(cd);
        }
    },
    addHTMLGui: function(html) {
        let d = document.createElement('div');
        d.innerHTML = html;
        document.getElementById('guis').appendChild(d);
    }
}
/*
* Easy Draw
*
* Created By James Weigand
* Wallgle
*/
function toRad(n) {
    return n * Math.PI / 180;
}
var EasyDraw = {
    can: void 0,
    ctx: void 0,
    loaded: false,
    Load: function(can, ctx) {
        if (can != void 0) {
            this.can = can;
        }
        if (ctx != void 0) {
            this.ctx = ctx;
        }
        this.loaded = true;
    },
    loadErr: function() {
        console.error('Please make sure to load EasyDraw with EasyDraw.Load(canvas, context)!')
    },
    Rotate: function(df, deg, x, y, w, h) {
        if (this.loaded) {
            if (typeof df ==  'function' && deg != void 0 && typeof deg == 'number') {
                if (x != void 0 && y != void 0 && w != void 0 && h != void 0) {
                    this.ctx.save();
                    this.ctx.translate(x+w/2,y+h/2);
                    this.ctx.rotate(toRad(deg));
                    df(-w/2,-h/2,w,h);
                    this.ctx.restore();
                }
            } else {
                return;
            }
        } else {
            this.loadErr();
            return;
        }
    }
}
String.prototype.capitalize = function() {
    return this.toString().toLowerCase().replace(/^\w/, function(a) {
        return a.toUpperCase();
    });
}