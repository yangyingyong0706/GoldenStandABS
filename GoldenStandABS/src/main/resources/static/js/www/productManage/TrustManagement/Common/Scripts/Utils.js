/// <reference path="jquery-1.3.2-vsdoc.js" />
function strlen(str) {
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) len += 2; else len++;
    }
    return len;
}
function isNull(str) {
    str = jQuery.trim(str);
    if (str == "" || str == undefined || str == null) {
        return false;
    }
    return true;
}
function validateEmail(email) {
    //对电子邮件的验证
    var reg = reg = /^([0-9a-zA-Z]+[-._+&])*[0-9a-zA-Z]+@([-0-9a-zA-Z]+[.])+[a-zA-Z]{2,6}$/;
    return reg.test(email);
}
function interzone(str, begin, end) {
    if (strlen(str) > end || strlen(str) < begin) {
        return false;
    }
    return true;
}

//校验身份证
function isIdCardNo(num) {
    num = num.toUpperCase();
    //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。   
    if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num))) {
        return false;
    }
    return true
}

function isContainUncode(str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255)
            return false;
    }
    return true;
}

function isNumber(oNum) {
    if (!oNum)
        return false;
    var strP = /^\d+(\.\d+)?$/;
    if (!strP.test(oNum)) return false;
    try {
        if (parseFloat(oNum) != oNum)
            return false;
    }
    catch (ex) {
        return false;
    }
    return true;
}

function isInteger(oNum) {
    if (!oNum) {
        return false;
    }
    if (oNum.indexOf("0") == 0) {
        return false;
    }
    var strP = /^[-\+]?\d+$/;
    if (!strP.test(oNum)) return false;
    try {
        if (parseInt(oNum) != oNum) {
            return false;
        }
    }
    catch (ex) {
        return false;
    }
    return true;
}

function isPositiveInteger(oNum) {
    if (!oNum) {
        return false;
    }
    var strP = /^[0-9]*[1-9][0-9]*$/;
    if (!strP.test(oNum)) return false;
    try {
        if (parseInt(oNum) != oNum) {
            return false;
        }
    }
    catch (ex) {
        return false;
    }
    return true;
}

function trim(str) {
    var count = str.length;
    var st = 0;
    var end = count - 1;
    if (str == "") return str;
    while (st < count) {
        if (str.charAt(st) == " ")
            st++;
        else
            break;
    }
    while (end > st) {
        if (str.charAt(end) == " ")
            end--;
        else
            break;
    }
    return str.substring(st, end + 1);
}

function strLen(inputObj) {
    var str = inputObj.value;
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.substr(i, 1).charCodeAt(0) > 255) {
            len = len + 2;
        }
        else {
            len++;
        }
    }
    return len;
}

//即时验证输入框字数
function IsMaxNumberLen(inputObj, nMaxLen) {
    var str = inputObj.value;
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.substr(i, 1).charCodeAt(0) > 255) {
            len = len + 2;
        }
        else {
            len++;
        }
    }

    //截取最大字符数
    var len2 = 0;
    if (len > nMaxLen) {
        var j = 0;
        for (j = 0; j < str.length; j++) {
            if (str.substr(j, 1).charCodeAt(0) > 255) {
                len2 = len2 + 2;
            }
            else {
                len2++;
            }
            if (len2 >= nMaxLen) {
                break;
            }
        }
        inputObj.value = inputObj.value.substring(0, j)
    }
}
//截取最大字符数并且返回还可以输入的字符数(leftNumId为剩余字符数span标签的id)
function cutAndReturnLeftNum(inputObj, nMaxLen, leftNumId) {
    var str = inputObj.value;
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.substr(i, 1).charCodeAt(0) > 255) {
            len = len + 2;
        }
        else {
            len++;
        }
    }
    var leftnum = nMaxLen - len;
    if (leftnum < 0) {
        leftnum = 0;
    }
    document.getElementById(leftNumId).innerHTML = leftnum;
    //截取最大字符数
    var len2 = 0;
    if (len > nMaxLen) {
        var j = 0;
        for (j = 0; j < str.length; j++) {
            if (str.substr(j, 1).charCodeAt(0) > 255) {
                len2 = len2 + 2;
            }
            else {
                len2++;
            }
            if (len2 >= nMaxLen) {
                break;
            }
        }
        inputObj.value = inputObj.value.substring(0, j)
    }
}
var flag = false;
function DrawImage(ImgD, w, h) {
    var image = new Image();
    image.src = ImgD.src;
    if (image.width > 0 && image.height > 0) {
        flag = true;
        if (image.width / image.height > 1) {
            if (image.width > w) {
                ImgD.width = w;
                ImgD.height = (image.height * w) / image.width;
            } else {
                ImgD.width = image.width;
                ImgD.height = image.height;
            }
        }
        else {
            if (image.height > h) {
                ImgD.height = h;
                ImgD.width = (image.width * h) / image.height;
            } else {
                ImgD.width = image.width;
                ImgD.height = image.height;
            }
        }
    }
}
var iTeim;
function show_date_time(year, month, day, hour, minute, second) {
    var did;
    if (arguments[6])
        did = arguments[6];
    else
        did = "Reciprocal";
    var year = year;
    iTeim = window.setTimeout("show_date_time(" + year + ", " + month + ", " + day + ", " + hour + ", " + minute + ", " + second + ",'" + did + "')", 1000);
    target = new Date(year, month, day, hour, minute, second);
    today = new Date();
    timeold = (target.getTime() - today.getTime());

    sectimeold = timeold / 1000
    secondsold = Math.floor(sectimeold);
    msPerDay = 24 * 60 * 60 * 1000
    e_daysold = timeold / msPerDay
    daysold = Math.floor(e_daysold);
    e_hrsold = (e_daysold - daysold) * 24;
    hrsold = Math.floor(e_hrsold);
    e_minsold = (e_hrsold - hrsold) * 60;
    minsold = Math.floor((e_hrsold - hrsold) * 60);
    seconds = Math.floor((e_minsold - minsold) * 60);
    if (daysold < 0) {
        if (document.getElementById(did) != null) {
            if (did == "LeftVip") {
                document.getElementById("user-head-shezhi").style.display = "none";
                $.getJSON(webhost + "/JsonDomain/DelVip", function() { });
            }
            else {
                document.getElementById(did).style.display = "none";
                //document.getElementById(did).innerHTML = "时间已到，请耐心等待处理。";
            }
            iTeim = null;
        }
    }
    else {
        if (daysold < 10) { daysold = daysold }
        if (daysold < 100) { daysold = daysold }
        if (hrsold < 10) { hrsold = "0" + hrsold }
        if (minsold < 10) { minsold = "0" + minsold }
        if (seconds < 10) { seconds = "0" + seconds }
        if (document.getElementById(did) != null) {
            var s = "";
            if (daysold != 0)
                s += daysold + "天 ";
            if (hrsold != 0)
                s += hrsold + "小时";
            if (minsold != 0)
                s += minsold + "分";
            document.getElementById(did).innerHTML = s + seconds + "秒";
        }
    }
}
function Browser() {
    var ua, s, i;
    this.isIE = false;
    this.isNS = false;
    this.isOP = false;
    this.isSF = false;
    ua = navigator.userAgent.toLowerCase();
    s = "opera";
    if ((i = ua.indexOf(s)) >= 0) {
        this.isOP = true; return;
    }
    s = "msie";
    if ((i = ua.indexOf(s)) >= 0) {
        this.isIE = true; return;
    }
    s = "netscape6/";
    if ((i = ua.indexOf(s)) >= 0) {
        this.isNS = true; return;
    }
    s = "gecko"; if ((i = ua.indexOf(s)) >= 0) {
        this.isNS = true; return;
    }
    s = "safari";
    if ((i = ua.indexOf(s)) >= 0) {
        this.isSF = true; return;
    }
}