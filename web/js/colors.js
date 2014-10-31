    /**
     * @see http://stackoverflow.com/q/7616461/940217
     * @return {number}
     
     var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        char  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
    
     */
    /*String.prototype.hashCode = function()
    {
        var hash = 0.5;
        if (this.length === 0) return hash;
        for (var i = 0; i < this.length; i++) {
            var character  = (this.charCodeAt(i)%10) / 10;
            hash = ((hash << 5) - hash) + character;
        }
        hash = Math.max(0, Math.min(1, Math.abs(hash)));
        return hash;
    }*/
    
    var baseline = '0'.charCodeAt(0)
    String.prototype.hashCode = function()
    {
        var hash = 0.1;
        if (this.length === 0) return hash;
        for (var i = 0; i < this.length; i++) {
            var character  = this.charCodeAt(i) - baseline;
            hash += Math.pow(2, -i)*(character%8)/8
        }
        hash = hash % 1.0
        hash = Math.max(0, Math.min(1, Math.abs(hash)));
        return hash;
    }
    
    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  l       The lightness
     * @return  Array           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;
    
        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
    
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
    
        return [(r * 255), (g * 255), (b * 255)];
    }
    
    function decToHex(i)
    {
        return (Math.floor(i)+0x10000).toString(16).substr(-2).toUpperCase();
    }
    
    function getColor(tag)
    {
        code = tag.hashCode()
        
        if(code > 0.05 && code < 0.25)
        {
            code += 0.6;
        } 
        colors = hslToRgb(code, 0.6, 0.5);
        color = ""+decToHex(colors[0])+decToHex(colors[1])+decToHex(colors[2])
        
        //console.log(tag + " " + color + " " + code)
        return color;
    }
