i_execute['magicSelect'] = function() {
    tool_data['magicSelect'] = {
        pixels: [],
        points: [],
        selected: false,
        cSave: [],
    }
}

function SortPointsToLine(q){let d=function(h,j){return Math.sqrt((h.x-j.x)**2+(h.y-j.y)**2)},o=[...q],I=0;while(I<q.length){let u={x:0,y:0},c=o[0],p=o[0],P=d(p,u);o.splice(0,1);for(let j=0;j<o.length;j++){let Y=o[j];if(Math.abs(P-d(Y,u))<Math.abs(P-d(c,u))&&!(c.x==Y.x&&c.y==Y.y)){c=Y}};q[I].nextPoint=c;I++};return o};

tools['magicSelect'] = function(x, y, select_color, settings) {
    if (settings.mode == 0) {
        tool_data['magicSelect'].pixels = [];
        tool_data['magicSelect'].points = [];
        tool_data['magicSelect'].selected = true;
        let _dat = ctx.getImageData(0,0,can.clientWidth,can.height);
        tool_data['magicSelect'].cSave = _dat.data;

        var GetPixelColor = function(u,v,w,d){let p=(u+v*w)*4;return {r:d[p+0],g:d[p+1],b:d[p+2],a:d[p+3]}};

        let c_color = GetPixelColor(x, y, can.width, _dat.data);

        let d_color = {
            r: 0,
            g: 255,
            b: 0,
            a: 255,
        }

        let pix = [
            {x: x, y: y, compareColor: c_color},
            {x: x+1, y: y, compareColor: c_color},
            {x: x, y: y + 1, compareColor: c_color},
            {x: x-1, y: y,  compareColor: c_color},
            {x: x, y: y-1, compareColor: c_color},
        ];
    
        while (pix.length > 0) {
            let p = pix.pop();
            let c= p.compareColor;
            var pval = GetPixelColor(p.x, p.y, can.width, _dat.data);

            if (!(pval.r == d_color.r && pval.g == d_color.g && pval.b == d_color.b && pval.a == d_color.a)) {
                if (Math.abs(pval.r - c.r) < 25 && Math.abs(pval.g - c.g) < 25 && Math.abs(pval.b - c.b) < 25 && Math.abs(pval.a - c.a) < 25 && p.x > 0 && p.y > 0 && p.x < can.width && p.y < can.height) {
                    let _p = (p.x+(p.y*can.width))*4;
    
                    _dat.data[_p+0] = d_color.r;
                    _dat.data[_p+1] = d_color.g;
                    _dat.data[_p+2] = d_color.b;
                    _dat.data[_p+3] = d_color.a;

                    tool_data['magicSelect'].pixels.push({
                        x:p.x,
                        y:p.y
                    });
    
                    pix.push({x: p.x + 1, y: p.y + 0, compareColor: pval});
                    pix.push({x: p.x + 0, y: p.y + 1, compareColor: pval});
                    pix.push({x: p.x - 1, y: p.y - 0, compareColor: pval});
                    pix.push({x: p.x - 0, y: p.y - 1, compareColor: pval});
                } else {
                    tool_data['magicSelect'].points.push({
                        x:p.x,
                        y:p.y
                    });

                    let _p = (p.x+(p.y*can.width))*4;
    
                    _dat.data[_p+0] = 255;
                    _dat.data[_p+1] = 0;
                    _dat.data[_p+2] = 0;
                    _dat.data[_p+3] = 255;
                }
            }
        }

        ctx.putImageData(_dat,0,0);
        //tool_data['magicSelect'].points = [];
        for (let i = 0; i < 0; i++) {
            tool_data['magicSelect'].points.push({
                x:Math.sign(i)*Math.random()*200+200,
                y:Math.sign(i)*Math.random()*200+200
            })
        }

        let SortPoints = function(p) {
            let q = function(y,w) {
                let m=0;
                for (let g in y) {
                    m+=y[g][w];
                }
                return m/y.length;
            }
            let c = {
                u: q(p,'x'),
                v: q(p,'y')
            }
            c.u=c.v=0;

            console.log(c);

            let d=function(_) {
                return {
                    r: Math.atan2(_.y-c.v,_.x-c.u)*2,
                    i: (_.x-c.u)**2 + (_.y-c.v)**2
                }
            }

            p=p.sort(function(a,b) {
                let o=d(a),p=d(b);
                return (o.r-p.r) || (o.i-p.i);
            })
            ctx.fillStyle = '#f00';
            ctx.fillRect(c.u,c.v,100,100);
            return p;
        }

        let d = function(h,j) {
            return Math.sqrt((h.x-j.x)**2+(h.y-j.y)**2)
        }

        let points = [...tool_data['magicSelect'].points];
        let tpoints =[];
        let I = 0;
        while (I < tool_data['magicSelect'].points.length) {
            let c = points[points.length-1];
            let p = points[0];
            let idx = 0;
            points.splice(0,1);
            for (let j = 0; j < points.length; j++) {
                let Y=points[j];
                if (d(Y,p)<d(c,p)&&!(c.x==Y.x&&c.y==Y.y)&&j!=I) {
                    c=Y;
                    idx=j;
                }
            }
            tool_data['magicSelect'].points[I].nextPoint=idx;
            tpoints.push(idx);
            I++;
        }
        //tool_data['magicSelect'].points=SortPoints(tool_data['magicSelect'].points);

        ctx.lineWidth = 1;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0,0,can.width,can.height);
        ctx.strokeStyle = '#000';
        ctx.setLineDash([]);
        ctx.beginPath();
        for (let i = 0; i < tool_data['magicSelect'].points.length; i++) {
            
            let p1 = tool_data['magicSelect'].points[tool_data['magicSelect'].points[i].nextPoint];
            let p2 = tool_data['magicSelect'].points[i];
            //console.log(p1,p2);
            ctx.moveTo(p1.x,p1.y);
            ctx.lineTo(p2.x,p2.y);
        }        
        ctx.stroke();
        ctx.setLineDash([]);
    }
}