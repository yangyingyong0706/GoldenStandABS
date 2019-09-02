Date.prototype.dateFormat = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month 
        "d+": this.getDate(), //day 
        "h+": this.getHours(), //hour 
        "m+": this.getMinutes(), //minute 
        "s+": this.getSeconds(), //second 
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
        "S": this.getMilliseconds() //millisecond 
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}
//格式化字符串
String.prototype.StringFormat = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
};
function getStringDate(strDate) {
    //var str = '/Date(1408464000000)/';
    if (!strDate) {
        return '';
    }
    var str = strDate.replace(new RegExp('\/', 'gm'), '');
    return eval('new ' + str);
}
Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            return i;
        }
    }
    return -1;
};
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

function htmlEncodeDom(str) {
    var ele = document.createElement('span');
    ele.appendChild(document.createTextNode(str));
    return ele.innerHTML;
}
function htmlDecodeDom(str) {
    var ele = document.createElement('span');
    ele.innerHTML = str;
    return ele.textContent;
}

function getRequest() {
    var url = location.search; //获取url中"?"符后的字串   
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

function getOperatorByName(oprtName) {
    var operator = 'NA';
    switch (oprtName) {
        case 'gt':
            operator = '>';
            break;
        case 'ge':
            operator = '>=';
            break;
        case 'ne':
            operator = '!=';
            break;
        case 'eq':
            operator = '==';
            break;
        case 'lt':
            operator = '<';
            break;
        case 'le':
            operator = '<=';
            break;
        default:
            break;
    }
    return operator;
}
/* 列切换 */
function tabCloums() {
    $('.tab-columns>.btn').click(function () {
        var $this = $(this),
        col = $(this).attr('data-col');
        $this.siblings()
            .removeClass('btn-active')
            .end()
            .addClass('btn-active');
        autoLayout(columns(col));
    });
    // 根据参数显示列
    var columns = function (col) {
        if (parseInt(col) >= 4) col = 4;
        return 12 / parseInt(col);
    }
    // 自动布局
    var autoLayout = function (col) {
        $('.autoLayout-plugins').each(function () {
            var _class = $(this).attr('class');
            $(this).attr('class', _class.replace(/(\d)/, col));
        });
    }
}
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
function getQueryStringByString(name, search) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function getHashValue(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.hash.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
function setHashValue(name, value) {
    if (!getHashValue(name)) {
        var hash = window.location.hash;
        if (hash)
            window.location.hash = hash + '&' + name + '=' + value;
        else
            window.location.hash = name + '=' + value;
    } else {
        var r = window.location.hash.substr(1);
        //if (r.charAt(r.length - 1) !== "&") { r += '&'; }
        var reg = new RegExp('(' + name + '=).*?(&)', "i");
        var n = r.replace(reg, '$1' + value + '$2');
        window.location.hash = n;
    }
}

function btnCancelClick(url) {
    if (url) {
        window.location.href = url;
    }

    if (window.parent != window.self) {
        SP.SOD.executeFunc(
         'sp.ui.dialog.js',
         'SP.UI.ModalDialog.showModalDialog',
         function () {
             SP.UI.ModalDialog.commonModalDialogClose(SP.UI.DialogResult.cancel)
         });
    } else {
        window.history.back();
    }
}

function openSPDialog(options) {
    SP.SOD.executeFunc(
     'sp.ui.dialog.js',
     'SP.UI.ModalDialog.showModalDialog',
     function () {
         SP.UI.ModalDialog.showModalDialog(options);
     });
}

function getSPWebUrl() { return _spPageContextInfo.webAbsoluteUrl; }
function stringToDate(string) {
    var matches;
    if (matches = string.match(/^(\d{4,4})-(\d{1,2})-(\d{2,2})$/)) {
        return new Date(matches[1], matches[2] - 1, matches[3]);
    } else {
        return null;
    };
}
function dateToString(date) {
    var month = (date.getMonth() + 1).toString();
    var dom = date.getDate().toString();
    if (month.length == 1) month = "0" + month;
    if (dom.length == 1) dom = "0" + dom;
    return date.getFullYear() + "-" + month + "-" + dom;
}

function showDialogPage(url, title, width, height, fnCallBack) {
    $.anyDialog({
        width: width,
        height: height,
        title: title,
        url: url,
        onClose: function () {
            if (fnCallBack) { fnCallBack(); }
            else {
                //location.reload(); 
            }
        }
    });
}

function ExecuteGetData(async, svcUrl, appDomain, executeParam, callback) {
    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
    var sourceData = [];

    $.ajax({
        cache: false,
        type: "GET",
        async: async,
        url: svcUrl + 'appDomain=' + appDomain + '&executeParams=' + executeParams + '&resultType=commom',
        dataType: "json",
        contentType: "application/xml;charset=utf-8",
        data: {},
        success: function (response) {
            if (typeof response === 'string') { sourceData = JSON.parse(response); }
            else { sourceData = response; }
            if (callback)
                callback(sourceData);
        },
        error: function (response) { alert('Error occursed while requiring the remote source data!'); }
    });
    return sourceData;
}
function ExecutePostData(async, svcUrl, appDomain, executeParam, fileData, callback) {
    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
    var sourceData = [];

    //fileData : document.getElementById(id).files[0];
    $.ajax({
        cache: false,
        url: svcUrl + "appDomain={0}&executeParams={1}&postType={2}&streamIdentity={3}".StringFormat(appDomain, executeParams, "",""),
        type: 'POST',
        async: async,
        data: fileData,
        dataType: 'json',
        processData: false, // Don't process the files
        success: function (response) { //if (data.CommonExecutePostResult == true) 
            if (typeof response === 'string') { sourceData = JSON.parse(response); }
            else { sourceData = response; }
            if (callback)
                callback(sourceData);
        },
        error: function (data) {
            alert('Some error Occurred!' + data);
        }
    });

    return sourceData;
}
var CommonValidation = (function () {
    var TrustMngmtRegxCollection = {
        int: /^([-]?[1-9]+\d*$|^0)?$/,
        decimal: /^([-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?)?$/,
        date: /^((\d{4})-(\d{2})-(\d{2}))?$/,
        datetime: /^((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}))?$/
    };
    function validControlValue(obj) {
        var $this = $(obj);
        var objValue = $this.val();
        var valids = $this.attr('data-valid');

        //无data-valid属性，不需要验证
        if (!valids || valids.length < 1) { return true; }

        //如果有必填要求，必填验证
        if (valids.indexOf('required') >= 0) {
            if (!objValue || objValue.length < 1) {
                $this.addClass('red-border');
                return false;
            } else {
                $this.removeClass('red-border');
            }
        }
        //暂时只考虑data-valid只包含两个值： 必填和类型
        var dataType = valids.replace('required', '').toLocaleLowerCase().trim();

        //通过必填验证，做数据类型验证
        var regx = TrustMngmtRegxCollection[dataType];
        if (!regx) { return true; }

        if (!regx.test(objValue)) {
            $this.addClass('red-border');
            return false;
        } else {
            $this.removeClass('red-border');
        }
        return true;
    }
    return { ValidControlValue: validControlValue }
})();