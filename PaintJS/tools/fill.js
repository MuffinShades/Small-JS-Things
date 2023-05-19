tools['Fill'] = function(x, y, select_color, settings) {
    ctx.globalAlpha = 1;
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

    console.log(targetColor, select_color);
    //alert(targetColor.r);

    let pix = [
        {x: x+1, y: y},
        {x: x, y: y + 1},
        {x: x-1, y: y},
        {x: x, y: y-1}
    ];

    if (targetColor.r == select_color.r && targetColor.g == select_color.g && targetColor.b == select_color.b && targetColor.a == select_color.a) return;

    while (pix.length > 0) {
        let p = pix.pop();
        
        var pval = GetPixelColor(p.x, p.y, can.width, _dat.data);
        if (pval.r == targetColor.r && pval.g == targetColor.g && pval.b == targetColor.b && targetColor.a == pval.a && p.x > 0 && p.y > 0 && p.x < can.width && p.y < can.height) {
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