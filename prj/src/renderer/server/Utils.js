// Common Interface

//https://blog.csdn.net/qq_37568049/article/details/80736305
export function generalGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

export function Appendzero(o_num) {
    if(o_num < 10) return "0" + "" + o_num;
    else return o_num;
}