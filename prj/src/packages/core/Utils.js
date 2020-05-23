// Common Interface
const axios = require('axios');
import * as fs from 'fs-extra'
import * as path from 'path'
//const mimestruct = require("./mine.js");

//https://blog.csdn.net/qq_37568049/article/details/80736305
function generalGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function strMsgContentToJson(strMsgContent) {
    if(strMsgContent == "") {
        return "";
    }
    var chatGroupMsgContent = {};
    try{
        chatGroupMsgContent = JSON.parse(unescape(strMsgContent));
    } catch (e) {
        console.log("Message Content Json parse Failed.", strMsgContent);
    }
    return chatGroupMsgContent;
}

function JsonMsgContentToString (jsonMsgContent) {
    var chatGroupMsgContent = "";
    try{
        chatGroupMsgContent =JSON.stringify(jsonMsgContent);
    } catch (e) {
        console.log("Message Content Json stringify Failed.", jsonMsgContent);
    }
    return chatGroupMsgContent;
}

function getFileNameInPath(filePath) {
    var dealedPath = filePath.replace("/", "\\");
    var pos = dealedPath.lastIndexOf('\\');
    var m_filename = dealedPath.substring(pos + 1);
    return m_filename;
}
// https://blog.csdn.net/qq_33729889/article/details/55510648
function trim(originalStr) {
    return originalStr.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
}

function sliceReturnsOfString(originalStr) {
    if(originalStr == undefined) {
        return "";
    }
    var finalStr = trim(originalStr);
    while(finalStr[finalStr.length-1] == '\n') {
        let finalIndex = finalStr.length - 3;
        finalStr = finalStr.substring(0, finalIndex-2);
    }
    if(finalStr.length == 0) {
        return "";
    }
    return finalStr;
}

//https://blog.csdn.net/qq_36644766/article/details/80258048
function findKey(obj, value, compare = (a, b) => a === b) {
    return Object.keys(obj).find(k => compare(obj[k], value));
}

function pathDeal(oriPath) {
    return oriPath.replace("/", "\\");
}

function Appendzero(o_num) {
    if(o_num < 10) return "0" + "" + o_num;
    else return o_num;
}
// https://www.jianshu.com/p/3b5728046dc8
function getElementTop(element) {
    // var actTop = element.offsetTop;
    // var current = element.offsetParent;
    // while(current !== null){
    //     actTop += current.offsetTop;
    //     current = current.offsetParent;
    // }
    // return actTop;
    var actTop = element.offsetTop;
    var current = element.offsetParent;
    while(current !== null){
        actTop += current.offsetTop;
        current = current.offsetParent;
    }
    var msgListElement = document.getElementById("message-show-list");
    var scrollTop = msgListElement.scrollTop;
    return actTop - scrollTop;
}

// https://www.jianshu.com/p/3b5728046dc8
function getElementLeft(element) {
    var actLeft = element.offsetLeft;
    // var current = element.offsetParent;
    // while(current !== null){
    //     actLeft += current.offsetLeft;
    //     current = current.offsetParent;
    // }
    return actLeft;
}

async function downloadGroupAvatar(url, accesstoken)
{
    var headers={Authorization:"Bearer " + accesstoken};
    var appendix = {
            timeout: 35000,
            responseType: "blob"
        };
    var config = Object.assign({
      headers: headers,
    }, appendix);

  return axios.get(url,config);
}

const mimestruct = {
    "323": "text/h323",
    "3gp": "video/3gpp",
    "aab": "application/x-authoware-bin",
    "aam": "application/x-authoware-map",
    "aas": "application/x-authoware-seg",
    "acx": "application/internet-property-stream",
    "ai": "application/postscript",
    "aif": "audio/x-aiff",
    "aifc": "audio/x-aiff",
    "aiff": "audio/x-aiff",
    "als": "audio/X-Alpha5",
    "amc": "application/x-mpeg",
    "ani": "application/octet-stream",
    "apk": "application/vnd.android.package-archive",
    "asc": "text/plain",
    "asd": "application/astound",
    "asf": "video/x-ms-asf",
    "asn": "application/astound",
    "asp": "application/x-asap",
    "asr": "video/x-ms-asf",
    "asx": "video/x-ms-asf",
    "au": "audio/basic",
    "avb": "application/octet-stream",
    "avi": "video/x-msvideo",
    "awb": "audio/amr-wb",
    "axs": "application/olescript",
    "bas": "text/plain",
    "bcpio": "application/x-bcpio",
    "bin ": "application/octet-stream",
    "bld": "application/bld",
    "bld2": "application/bld2",
    "bmp": "image/bmp",
    "bpk": "application/octet-stream",
    "bz2": "application/x-bzip2",
    "c": "text/plain",
    "cal": "image/x-cals",
    "cat": "application/vnd.ms-pkiseccat",
    "ccn": "application/x-cnc",
    "cco": "application/x-cocoa",
    "cdf": "application/x-cdf",
    "cer": "application/x-x509-ca-cert",
    "cgi": "magnus-internal/cgi",
    "chat": "application/x-chat",
    "class": "application/octet-stream",
    "clp": "application/x-msclip",
    "cmx": "image/x-cmx",
    "co": "application/x-cult3d-object",
    "cod": "image/cis-cod",
    "conf": "text/plain",
    "cpio": "application/x-cpio",
    "cpp": "text/plain",
    "cpt": "application/mac-compactpro",
    "crd": "application/x-mscardfile",
    "crl": "application/pkix-crl",
    "crt": "application/x-x509-ca-cert",
    "csh": "application/x-csh",
    "csm": "chemical/x-csml",
    "csml": "chemical/x-csml",
    "css": "text/css",
    "cur": "application/octet-stream",
    "dcm": "x-lml/x-evm",
    "dcr": "application/x-director",
    "dcx": "image/x-dcx",
    "der": "application/x-x509-ca-cert",
    "dhtml": "text/html",
    "dir": "application/x-director",
    "dll": "application/x-msdownload",
    "dmg": "application/octet-stream",
    "dms": "application/octet-stream",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "dot": "application/msword",
    "dvi": "application/x-dvi",
    "dwf": "drawing/x-dwf",
    "dwg": "application/x-autocad",
    "dxf": "application/x-autocad",
    "dxr": "application/x-director",
    "ebk": "application/x-expandedbook",
    "emb": "chemical/x-embl-dl-nucleotide",
    "embl": "chemical/x-embl-dl-nucleotide",
    "eps": "application/postscript",
    "epub": "application/epub+zip",
    "eri": "image/x-eri",
    "es": "audio/echospeech",
    "esl": "audio/echospeech",
    "etc": "application/x-earthtime",
    "etx": "text/x-setext",
    "evm": "x-lml/x-evm",
    "evy": "application/envoy",
    "exe": "application/octet-stream",
    "fh4": "image/x-freehand",
    "fh5": "image/x-freehand",
    "fhc": "image/x-freehand",
    "fif": "application/fractals",
    "flr": "x-world/x-vrml",
    "flv": "flv-application/octet-stream",
    "fm": "application/x-maker",
    "fpx": "image/x-fpx",
    "fvi": "video/isivideo",
    "gau": "chemical/x-gaussian-input",
    "gca": "application/x-gca-compressed",
    "gdb": "x-lml/x-gdb",
    "gif": "image/gif",
    "gps": "application/x-gps",
    "gtar": "application/x-gtar",
    "gz": "application/x-gzip",
    "h": "text/plain",
    "hdf": "application/x-hdf",
    "hdm": "text/x-hdml",
    "hdml": "text/x-hdml",
    "hlp": "application/winhlp",
    "hqx": "application/mac-binhex40",
    "hta": "application/hta",
    "htc": "text/x-component",
    "htm": "text/html",
    "html": "text/html",
    "hts": "text/html",
    "htt": "text/webviewhtml",
    "ice": "x-conference/x-cooltalk",
    "ico": "image/x-icon",
    "ief": "image/ief",
    "ifm": "image/gif",
    "ifs": "image/ifs",
    "iii": "application/x-iphone",
    "imy": "audio/melody",
    "ins": "application/x-internet-signup",
    "ips": "application/x-ipscript",
    "ipx": "application/x-ipix",
    "isp": "application/x-internet-signup",
    "it": "audio/x-mod",
    "itz": "audio/x-mod",
    "ivr": "i-world/i-vrml",
    "j2k": "image/j2k",
    "jad": "text/vnd.sun.j2me.app-descriptor",
    "jam": "application/x-jam",
    "jar": "application/java-archive",
    "java": "text/plain",
    "jfif": "image/pipeg",
    "jnlp": "application/x-java-jnlp-file",
    "jpe": "image/jpeg",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "jpz": "image/jpeg",
    "js": "application/x-javascript",
    "jwc": "application/jwc",
    "kjx": "application/x-kjx",
    "lak": "x-lml/x-lak",
    "latex": "application/x-latex",
    "lcc": "application/fastman",
    "lcl": "application/x-digitalloca",
    "lcr": "application/x-digitalloca",
    "lgh": "application/lgh",
    "lha": "application/octet-stream",
    "lml": "x-lml/x-lml",
    "lmlpack": "x-lml/x-lmlpack",
    "log": "text/plain",
    "lsf": "video/x-la-asf",
    "lsx": "video/x-la-asf",
    "lzh": "application/octet-stream",
    "m13": "application/x-msmediaview",
    "m14": "application/x-msmediaview",
    "m15": "audio/x-mod",
    "m3u": "audio/x-mpegurl",
    "m3url": "audio/x-mpegurl",
    "m4a": "audio/mp4a-latm",
    "m4b": "audio/mp4a-latm",
    "m4p": "audio/mp4a-latm",
    "m4u": "video/vnd.mpegurl",
    "m4v": "video/x-m4v",
    "ma1": "audio/ma1",
    "ma2": "audio/ma2",
    "ma3": "audio/ma3",
    "ma5": "audio/ma5",
    "man": "application/x-troff-man",
    "map": "magnus-internal/imagemap",
    "mbd": "application/mbedlet",
    "mct": "application/x-mascot",
    "mdb": "application/x-msaccess",
    "mdz": "audio/x-mod",
    "me": "application/x-troff-me",
    "mel": "text/x-vmel",
    "mht": "message/rfc822",
    "mhtml": "message/rfc822",
    "mi": "application/x-mif",
    "mid": "audio/mid",
    "midi": "audio/midi",
    "mif": "application/x-mif",
    "mil": "image/x-cals",
    "mio": "audio/x-mio",
    "mmf": "application/x-skt-lbs",
    "mng": "video/x-mng",
    "mny": "application/x-msmoney",
    "moc": "application/x-mocha",
    "mocha": "application/x-mocha",
    "mod": "audio/x-mod",
    "mof": "application/x-yumekara",
    "mol": "chemical/x-mdl-molfile",
    "mop": "chemical/x-mopac-input",
    "mov": "video/quicktime",
    "movie": "video/x-sgi-movie",
    "mp2": "video/mpeg",
    "mp3": "audio/mpeg",
    "mp4": "video/mp4",
    "mpa": "video/mpeg",
    "mpc": "application/vnd.mpohun.certificate",
    "mpe": "video/mpeg",
    "mpeg": "video/mpeg",
    "mpg": "video/mpeg",
    "mpg4": "video/mp4",
    "mpga": "audio/mpeg",
    "mpn": "application/vnd.mophun.application",
    "mpp": "application/vnd.ms-project",
    "mps": "application/x-mapserver",
    "mpv2": "video/mpeg",
    "mrl": "text/x-mrml",
    "mrm": "application/x-mrm",
    "ms": "application/x-troff-ms",
    "msg": "application/vnd.ms-outlook",
    "mts": "application/metastream",
    "mtx": "application/metastream",
    "mtz": "application/metastream",
    "mvb": "application/x-msmediaview",
    "mzv": "application/metastream",
    "nar": "application/zip",
    "nbmp": "image/nbmp",
    "nc": "application/x-netcdf",
    "ndb": "x-lml/x-ndb",
    "ndwn": "application/ndwn",
    "nif": "application/x-nif",
    "nmz": "application/x-scream",
    "nokia-op-logo": "image/vnd.nok-oplogo-color",
    "npx": "application/x-netfpx",
    "nsnd": "audio/nsnd",
    "nva": "application/x-neva1",
    "nws": "message/rfc822",
    "oda": "application/oda",
    "ogg": "audio/ogg",
    "oom": "application/x-AtlasMate-Plugin",
    "p10": "application/pkcs10",
    "p12": "application/x-pkcs12",
    "p7b": "application/x-pkcs7-certificates",
    "p7c": "application/x-pkcs7-mime",
    "p7m": "application/x-pkcs7-mime",
    "p7r": "application/x-pkcs7-certreqresp",
    "p7s": "application/x-pkcs7-signature",
    "pac": "audio/x-pac",
    "pae": "audio/x-epac",
    "pan": "application/x-pan",
    "pbm": "image/x-portable-bitmap",
    "pcx": "image/x-pcx",
    "pda": "image/x-pda",
    "pdb": "chemical/x-pdb",
    "pdf": "application/pdf",
    "pfr": "application/font-tdpfr",
    "pfx": "application/x-pkcs12",
    "pgm": "image/x-portable-graymap",
    "pict": "image/x-pict",
    "pko": "application/ynd.ms-pkipko",
    "pm": "application/x-perl",
    "pma": "application/x-perfmon",
    "pmc": "application/x-perfmon",
    "pmd": "application/x-pmd",
    "pml": "application/x-perfmon",
    "pmr": "application/x-perfmon",
    "pmw": "application/x-perfmon",
    "png": "image/png",
    "pnm": "image/x-portable-anymap",
    "pnz": "image/png",
    "pot,": "application/vnd.ms-powerpoint",
    "ppm": "image/x-portable-pixmap",
    "pps": "application/vnd.ms-powerpoint",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "pqf": "application/x-cprplayer",
    "pqi": "application/cprplayer",
    "prc": "application/x-prc",
    "prf": "application/pics-rules",
    "prop": "text/plain",
    "proxy": "application/x-ns-proxy-autoconfig",
    "ps": "application/postscript",
    "ptlk": "application/listenup",
    "pub": "application/x-mspublisher",
    "pvx": "video/x-pv-pvx",
    "qcp": "audio/vnd.qcelp",
    "qt": "video/quicktime",
    "qti": "image/x-quicktime",
    "qtif": "image/x-quicktime",
    "r3t": "text/vnd.rn-realtext3d",
    "ra": "audio/x-pn-realaudio",
    "ram": "audio/x-pn-realaudio",
    "rar": "application/octet-stream",
    "ras": "image/x-cmu-raster",
    "rc": "text/plain",
    "rdf": "application/rdf+xml",
    "rf": "image/vnd.rn-realflash",
    "rgb": "image/x-rgb",
    "rlf": "application/x-richlink",
    "rm": "audio/x-pn-realaudio",
    "rmf": "audio/x-rmf",
    "rmi": "audio/mid",
    "rmm": "audio/x-pn-realaudio",
    "rmvb": "audio/x-pn-realaudio",
    "rnx": "application/vnd.rn-realplayer",
    "roff": "application/x-troff",
    "rp": "image/vnd.rn-realpix",
    "rpm": "audio/x-pn-realaudio-plugin",
    "rt": "text/vnd.rn-realtext",
    "rte": "x-lml/x-gps",
    "rtf": "application/rtf",
    "rtg": "application/metastream",
    "rtx": "text/richtext",
    "rv": "video/vnd.rn-realvideo",
    "rwc": "application/x-rogerwilco",
    "s3m": "audio/x-mod",
    "s3z": "audio/x-mod",
    "sca": "application/x-supercard",
    "scd": "application/x-msschedule",
    "sct": "text/scriptlet",
    "sdf": "application/e-score",
    "sea": "application/x-stuffit",
    "setpay": "application/set-payment-initiation",
    "setreg": "application/set-registration-initiation",
    "sgm": "text/x-sgml",
    "sgml": "text/x-sgml",
    "sh": "application/x-sh",
    "shar": "application/x-shar",
    "shtml": "magnus-internal/parsed-html",
    "shw": "application/presentations",
    "si6": "image/si6",
    "si7": "image/vnd.stiwap.sis",
    "si9": "image/vnd.lgtwap.sis",
    "sis": "application/vnd.symbian.install",
    "sit": "application/x-stuffit",
    "skd": "application/x-Koan",
    "skm": "application/x-Koan",
    "skp": "application/x-Koan",
    "skt": "application/x-Koan",
    "slc": "application/x-salsa",
    "smd": "audio/x-smd",
    "smi": "application/smil",
    "smil": "application/smil",
    "smp": "application/studiom",
    "smz": "audio/x-smd",
    "snd": "audio/basic",
    "spc": "application/x-pkcs7-certificates",
    "spl": "application/futuresplash",
    "spr": "application/x-sprite",
    "sprite": "application/x-sprite",
    "sdp": "application/sdp",
    "spt": "application/x-spt",
    "src": "application/x-wais-source",
    "sst": "application/vnd.ms-pkicertstore",
    "stk": "application/hyperstudio",
    "stl": "application/vnd.ms-pkistl",
    "stm": "text/html",
    "svg": "image/svg+xml",
    "sv4cpio": "application/x-sv4cpio",
    "sv4crc": "application/x-sv4crc",
    "svf": "image/vnd",
    "svg": "image/svg+xml",
    "svh": "image/svh",
    "svr": "x-world/x-svr",
    "swf": "application/x-shockwave-flash",
    "swfl": "application/x-shockwave-flash",
    "t": "application/x-troff",
    "tad": "application/octet-stream",
    "talk": "text/x-speech",
    "tar": "application/x-tar",
    "taz": "application/x-tar",
    "tbp": "application/x-timbuktu",
    "tbt": "application/x-timbuktu",
    "tcl": "application/x-tcl",
    "tex": "application/x-tex",
    "texi": "application/x-texinfo",
    "texinfo": "application/x-texinfo",
    "tgz": "application/x-compressed",
    "thm": "application/vnd.eri.thm",
    "tif": "image/tiff",
    "tiff": "image/tiff",
    "tki": "application/x-tkined",
    "tkined": "application/x-tkined",
    "toc": "application/toc",
    "toy": "image/toy",
    "tr": "application/x-troff",
    "trk": "x-lml/x-gps",
    "trm": "application/x-msterminal",
    "tsi": "audio/tsplayer",
    "tsp": "application/dsptype",
    "tsv": "text/tab-separated-values",
    "ttf": "application/octet-stream",
    "ttz": "application/t-time",
    "txt": "text/plain",
    "uls": "text/iuls",
    "ult": "audio/x-mod",
    "ustar": "application/x-ustar",
    "uu": "application/x-uuencode",
    "uue": "application/x-uuencode",
    "vcd": "application/x-cdlink",
    "vcf": "text/x-vcard",
    "vdo": "video/vdo",
    "vib": "audio/vib",
    "viv": "video/vivo",
    "vivo": "video/vivo",
    "vmd": "application/vocaltec-media-desc",
    "vmf": "application/vocaltec-media-file",
    "vmi": "application/x-dreamcast-vms-info",
    "vms": "application/x-dreamcast-vms",
    "vox": "audio/voxware",
    "vqe": "audio/x-twinvq-plugin",
    "vqf": "audio/x-twinvq",
    "vql": "audio/x-twinvq",
    "vre": "x-world/x-vream",
    "vrml": "x-world/x-vrml",
    "vrt": "x-world/x-vrt",
    "vrw": "x-world/x-vream",
    "vts": "workbook/formulaone",
    "wav": "audio/x-wav",
    "wax": "audio/x-ms-wax",
    "wbmp": "image/vnd.wap.wbmp",
    "wcm": "application/vnd.ms-works",
    "wdb": "application/vnd.ms-works",
    "web": "application/vnd.xara",
    "wi": "image/wavelet",
    "wis": "application/x-InstallShield",
    "wks": "application/vnd.ms-works",
    "wm": "video/x-ms-wm",
    "wma": "audio/x-ms-wma",
    "wmd": "application/x-ms-wmd",
    "wmf": "application/x-msmetafile",
    "wml": "text/vnd.wap.wml",
    "wmlc": "application/vnd.wap.wmlc",
    "wmls": "text/vnd.wap.wmlscript",
    "wmlsc": "application/vnd.wap.wmlscriptc",
    "wmlscript": "text/vnd.wap.wmlscript",
    "wmv": "audio/x-ms-wmv",
    "wmx": "video/x-ms-wmx",
    "wmz": "application/x-ms-wmz",
    "wpng": "image/x-up-wpng",
    "wps": "application/vnd.ms-works",
    "wpt": "x-lml/x-gps",
    "wri": "application/x-mswrite",
    "wrl": "x-world/x-vrml",
    "wrz": "x-world/x-vrml",
    "ws": "text/vnd.wap.wmlscript",
    "wsc": "application/vnd.wap.wmlscriptc",
    "wv": "video/wavelet",
    "wvx": "video/x-ms-wvx",
    "wxl": "application/x-wxl",
    "x-gzip": "application/x-gzip",
    "xaf": "x-world/x-vrml",
    "xar": "application/vnd.xara",
    "xbm": "image/x-xbitmap",
    "xdm": "application/x-xdma",
    "xdma": "application/x-xdma",
    "xdw": "application/vnd.fujixerox.docuworks",
    "xht": "application/xhtml+xml",
    "xhtm": "application/xhtml+xml",
    "xhtml": "application/xhtml+xml",
    "xla": "application/vnd.ms-excel",
    "xlc": "application/vnd.ms-excel",
    "xll": "application/x-excel",
    "xlm": "application/vnd.ms-excel",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xlt": "application/vnd.ms-excel",
    "xlw": "application/vnd.ms-excel",
    "xm": "audio/x-mod",
    "xml": "text/plain",
    "xml": "application/xml",
    "xmz": "audio/x-mod",
    "xof": "x-world/x-vrml",
    "xpi": "application/x-xpinstall",
    "xpm": "image/x-xpixmap",
    "xsit": "text/xml",
    "xsl": "text/xml",
    "xul": "text/xul",
    "xwd": "image/x-xwindowdump",
    "xyz": "chemical/x-pdb",
    "yz1": "application/x-yz1",
    "z": "application/x-compress",
    "zac": "application/x-zaurus-zac",
    "zip": "application/zip",
    "json": "application/json"
}
class FileUtil
{
    
    constructor(fullname)
    {
        this.m_filename = "";
        this.m_externname = "";
        this.m_mimename = "";
        this.m_filebuf = "";
        this.m_fullname = fullname;
    }

    ReadfileSync()
    {
        return this.m_filebuf == '' ?  this.m_filebuf = fs.readFileSync(this.m_fullname) : this.m_filebuf;
    }

    ReadfileAsync(callback)
    {
        /*
        fs.readFile(this.m_fullname, function (err,data) 
        {
            
            if(err)
            {
                return console.log(err);
            }
            else 
            {
                console.log(data.toString());
            }
        })
        */
       fs.readFile(this.m_fullname, callback);
    }

    GetFileSize()
    {
        return this.GetUploadfileobj().size;
    }

    GetFilename()
    {
        if(this.m_filename != '')
            return this.m_filename ;
        var pos = this.m_fullname.lastIndexOf('\\');
        this.m_filename = this.m_fullname.substring(pos + 1);
        return this.m_filename;
    }

    GetExtname()
    {
        if(this.m_externname != '')
            return this.m_externname;
        let tmp = this.m_filename.split('').reverse().join('');
        this.m_externname = tmp.substring(0,tmp.search(/\./)).split('').reverse().join('');
        return this.m_externname;
    }

    GetMimename()
    {
        if(this.m_mimename != '')
            return this.m_mimename;
        this.m_mimename = mimestruct[this.GetExtname()];
        return this.m_mimename;
    }

    GetUploadfileobj()
    {
        return new File([this.ReadfileSync()], this.GetFilename(), {type : this.GetMimename()})
    }
}

function fileTypeFromMIME(mimeName){
    var ext = "";
    ext = findKey(mimestruct, mimeName);
    return ext;
}

function fileMIMEFromType(ext){
    var mine = "";
    mine = mimestruct[ext];
    return mine;
}

const faceUtils = {
    alt: [
        '&#128516;',//0
      '&#128515;',//1
      '&#128517;',//2
      '&#128578;',//3
      '&#128541;',//4
      '&#128540;',//5
      '&#128514;',//6
      '&#129396;',//7
      '&#128563;',//8
      '&#128544;',//9
      '&#128562;',//10
      '&#129303;',//11
      '&#128538;',//12
      '&#128557;',//13
      '&#128532;',//14
      '&#128517;',//15
      '&#128564;',//16
      '&#129322;',//17
      '&#128551;',//18
      '&#128567;',//19
      '&#128548;',//20
      '&#129323;',//21
      '&#129395;',//22
      '&#129402;',//23
      '&#128123;',//24
      '&#128554;',//25
      '&#128525;',//26
      '&#128522;',//27
      '&#128526;',//28
      '&#128530;',//29
      '&#128577;',//30
      '&#129296;',//31
      '&#128545;',//32
      '&#129324;',//33
      '&#128520;',//34
      '&#128580;',//35
      '&#128561;',//36
      '&#128531;',//37
      '&#128536;',//38
      '&#129321;',//39
      '&#129327;',//40
      '&#128519;',//41
      '&#129398;',//42
      '&#127769;',//43
      '&#127774;',//44
      '&#9889;',//45
      '&#128068;',//46
      '&#128269;',//47
      '&#128163;',//48
      '&#127867;',//49
      '&#128079;',//50
      '&#128074;',//51
      '&#128170;',//52
      '&#129309;',//53
      '&#128591;',//54
      '&#128076;',//55
      '&#128078;',//56
      '&#128077;',//57
      '&#9996;',//58
      '&#128071;',//59
      '&#128072;',//60
      '&#128073;',//61
      '&#128070;',//62
      '&#9757;',//63
      '&#9994;',//64 
      '&#128068;',//65
      '&#128138;',//66
      '&#128169;',//67
      '&#9917;',//68
      '&#9729;',//69
      '&#128345;',//70
      '&#9748;',//71
    ],
    faces: function() {
      let self = this;
      let arr = {};
      for (let i = 0; i < self.alt.length; i++) {
        arr[self.alt[i]] = './static/Img/Chat/face/' + i + '.png';
      }
      return arr;
    }
}

function insertStr(source, start, newStr) {
    return source.slice(0, start) + newStr + source.slice(start);
}

// https://blog.csdn.net/weixin_41643133/article/details/88118716
function uncodeUtf16(str){
    var reg = /\&#.*?;/g;
    var result = str.replace(reg,function(char){
        var H,L,code;
        if(char.length == 9 ){
            code = parseInt(char.match(/[0-9]+/g));
            H = Math.floor((code-0x10000) / 0x400)+0xD800;
            L = (code - 0x10000) % 0x400 + 0xDC00;
            return unescape("%u"+H.toString(16)+"%u"+L.toString(16));
        }else{
            return char;
        }
    });
    return result;
 }

function getIconPath(ext) {
    var iconDirPath = './static/Img/Chat';
    var distExt = '';
    var distIconPath = '';
    for (var key in iconMap) {
        iconMap[key].forEach((item) => {
            if (ext !== '') {
                if (item === ext) {
                    distExt = key;
                }
            }
        })
    }

    if(distExt == "zip"){
        distIconPath = iconDirPath + "/" + "filesZip@3x.png";
    }
    else if(distExt == "apk"){
        distIconPath = iconDirPath + "/" + "apk@3x.png";
    }
    else if(distExt == "exe"){
        distIconPath = iconDirPath + "/" + "exe@3x.png";
    }
    else if(distExt == "excel"){
        distIconPath = iconDirPath + "/" + "xls@3x.png";
    }
    else if(distExt == "ipa"){
        distIconPath = iconDirPath + "/" + "ipa@3x.png";
    }
    else if(distExt == "iso"){
        distIconPath = iconDirPath + "/" + "dmg@3x.png";
    }
    else if(distExt == "music"){
        distIconPath = iconDirPath + "/" + "voiceAudio@3x.png";
    }
    else if(distExt == "pdf"){
        distIconPath = iconDirPath + "/" + "pdf@3x.png";
    }
    else if(distExt == "ppt"){
        distIconPath = iconDirPath + "/" + "ppt@3x.png";
    }
    else if(distExt == "video"){
        distIconPath = iconDirPath + "/" + "Audio@3x.png";
    }
    else if(distExt == "word"){
        distIconPath = iconDirPath + "/" + "doc@3x.png";
    }
    else if(distExt == "txt"){
        distIconPath = iconDirPath + "/" + "txt@3x.png";
    }
    else{
        distIconPath = iconDirPath + "/" + "unknown@3x.png";
    }
    return distIconPath
}

const iconMap = {
    zip: ['zip', 'rar', '7z', 'gz', 'tar'],
    ai: ['ai', 'eps'],
    apk: ['apk'],
    exe: ['exe'],
    excel: [
      'et',
      'ett',
      'xls',
      'xlt',
      'xlsx',
      'xlsm',
      'csv',
      'dbf',
      'prn',
      'dif',
      'xltx',
      'xltm',
      'xlsb'
    ],
    ipa: ['ipa'],
    iso: ['iso', 'dmg'],
    music: [
      'mp3',
      'aac',
      'ac3',
      'wav',
      'ogg',
      'wma',
      'aif',
      'aifc',
      'aiff',
      'au',
      'mid',
      'rmi',
      'snd',
      'svx',
      'ra',
      'ape',
      'fla',
      'mmf',
      'amr',
      'm4a',
      'm4r',
      'mp2',
      'ram',
      'flac'
    ],
    pdf: ['pdf'],
    ppt: [
      'ppt',
      'pptx',
      'pot',
      'dps',
      'dpt',
      'pps',
      'pptm',
      'pstx',
      'potx',
      'potm',
      'ppsx',
      'ppsm'
    ],
    ps: ['psd'],
    video: [
      'mp4',
      'mkv',
      'mov',
      'avi',
      'wmv',
      'rm',
      'rmvb',
      'ts',
      '3gp',
      'asf',
      'mpg',
      'mpeg',
      'flv',
      'swf',
      'f4v',
      'h264',
      'dat(VCD)',
      'asp',
      'mov',
      'moov',
      'movie',
      'qt',
      'qtm',
      'vob'
    ],
    web: ['html', 'htm'],
    word: ['doc', 'docx', 'wps', 'wpt', 'rtf', 'dot', 'dotm', 'docm', 'dotx'],
    txt: ['txt', 'log', 'xml']
  }
  
export {generalGuid, findKey, Appendzero, pathDeal, FileUtil, getIconPath, faceUtils, fileTypeFromMIME, uncodeUtf16, downloadGroupAvatar, strMsgContentToJson, JsonMsgContentToString, sliceReturnsOfString, getFileNameInPath, getElementTop, getElementLeft, insertStr, fileMIMEFromType};
//exports.generalGuid = generalGuid;
//exports.FileUtil = FileUtil;