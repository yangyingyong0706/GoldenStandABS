//格式化字符串
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
    });
};

String.prototype.startWith = function (str) {
    var reg = new RegExp("^" + str);
    return reg.test(this);
};

String.prototype.endWith = function (str) {
    var reg = new RegExp(str + "$");
    return reg.test(this);
};

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

var RegxCollection = {
    //int: /^[-]{0,1}[1-9]{1,}[0-9]{0,}$/,
    int: /^[-]?[1-9]+\d*$|^0$/,
    //decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$/,
    //decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?$/,
    date: /^(\d{4})-(\d{2})-(\d{2})$/,
    datetime: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
};




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

define(['jquery', 'App.Global', 'gsUtil', 'app/components/Layered/js/formatNumber', 'anyDialog', 'jquery.cookie', 'gsAdminPages'], function ($, appGlobal, gsUtil, FormatNumber, anyDialog, cookie, GSDialog) {
    var GlobalVariable = appGlobal.GlobalVariable;
    Common = function () { };
    Common.prototype = {
        htmlEncodeDom: function (str) {
            var ele = document.createElement('span');
            ele.appendChild(document.createTextNode(str));
            return ele.innerHTML;
        },
        htmlDecodeDom: function (str) {
            var ele = document.createElement('span');
            ele.innerHTML = str;
            return ele.textContent;
        },
        getRequest: function () {
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
        },

        getOperatorByName: function (oprtName) {
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
        },

        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            //var r = decodeURI(window.location.search.substr(1)).match(reg);
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        getQueryStringByString: function (name, search) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = decodeURI(search.substr(1)).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        getQueryStringSpecial: function (name) {
            /* eslint-disable */
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ''])[1].replace(/\+/g, '%20')) || null
            /* eslint-enable */
        },
        getHashValue: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.hash.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        setHashValue: function (name, value) {
            if (!Common.prototype.getHashValue(name)) {
                var hash = window.location.hash;
                if (hash)
                    window.location.hash = hash + '&' + name + '=' + value;
                else
                    window.location.hash = name + '=' + value;
            } else {
                var r = window.location.hash.substr(1);
                if (r.charAt(r.length - 1) !== "&") { r += '&'; }
                var reg = new RegExp('(' + name + '=).*?(&)', "i");
                var n = r.replace(reg, '$1' + value + '$2');
                window.location.hash = n;
            }
        },


        html2Escape: function (sHtml) {
            if (sHtml) {
                return sHtml.replace(/[<>\']/g, function (c) {
                    return {
                        "<": "&lt;",
                        ">": "&gt;",
                        "'": ""
                    }[c];
                });
            }
            return "";
        },
        getUrlParam: function (name) {
            var s = location.search;
            if (s != null && s.length > 1) {
                var sarr = s.substr(1).split("&");
                var tarr;
                for (i = 0; i < sarr.length; i++) {
                    tarr = sarr[i].split("=");
                    if (tarr.length == 2 && tarr[0].toLowerCase() == name.toLowerCase()) {
                        return tarr[1];
                    }
                }
                return null;
            }

            //var url = window.location.search.substr(1).toLowerCase() , reg = new RegExp("(^|&)" + name.toLowerCase() + "=([^&]*)(&|$)");
            //var param = url.match(reg);  //匹配目标参数
            //return (param != null) ? unescape(param[2]) : null; //返回参数值
        },

        btnCancelClick: function (url) {
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
        },
        openSPDialog: function (options) {
            SP.SOD.executeFunc(
             'sp.ui.dialog.js',
             'SP.UI.ModalDialog.showModalDialog',
             function () {
                 SP.UI.ModalDialog.showModalDialog(options);
             });
        },
        getSPWebUrl: function () { return _spPageContextInfo.webAbsoluteUrl; },

        validControls: function (obj) {
            var self = this;
            var validPass = true;
            $(obj).each(function () {
                var $this = $(this);
                if (!self.validControlValue($this)) {
                    validPass = false;
                }
            });
            return validPass;
        },
        validControlValue: function (obj) {
            var $this = $(obj);
            var objValue = $this.val();
            var valids = $this.attr('data-valid');

            //无data-valid属性，不需要验证
            if (!valids || valids.length < 1) {
                return true;
            }

            //如果有必填要求，必填验证
            if (valids.indexOf('Required') >= 0) {

                if (!objValue || objValue.length < 1) {
                    $this.parent().parent().parent().addClass('has-error');
                    return false;
                } else {
                    $this.parent().parent().parent().removeClass('has-error');
                }

                //暂时只考虑data-valid只包含两个值： 必填和类型
                var dataType = valids.replace('Required', '').toLocaleLowerCase().trim();



                //通过必填验证，做数据类型验证
                var regx = RegxCollection[dataType];
                if (!regx) { return true; }

                if (!regx.test(objValue)) {
                    $this.parent().parent().parent().addClass('has-warning');
                    return false;
                } else {
                    $this.parent().parent().parent().removeClass('has-warning');
                }

            }
            return true;
        },

        //alertMsg: function (text, status) {
        //    var alert_tip = $('#alert-tip'),
        //        icon = (status) ? 'icon-warning' : 'icon-roundcheck';
        //    if (!alert_tip[0]) {
        //        var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
        //        var $temp = $('<div class="alert_content">' +
        //                        '<i class="icon ' + icon + '"></i>' +
        //                        '<p>' + text + '</p>' +
        //                    '</div>');
        //        $temp.appendTo($alert);
        //        $alert.appendTo(document.body);
        //        setTimeout(function () {
        //            $('#alert-tip').fadeOut(function () {
        //                $(this).remove();
        //            });
        //        }, 1500);
        //    }
        //},
        //点数求和（解决JS float运算精度问题）
        accAdd: function (num1, num2) {
            //var r1, r2, m;
            //try {
            //    r1 = num1.toString().split('.')[1].length;
            //} catch (e) {
            //    r1 = 0;
            //}
            //try {
            //    r2 = num2.toString().split(".")[1].length;
            //} catch (e) {
            //    r2 = 0;
            //}
            //m = Math.pow(10, Math.max(r1, r2));
            //// return (num1*m+num2*m)/m;
            //return Math.round(num1 * m + num2 * m) / m;
            var r1, r2, m, c;
            try {
                r1 = num1.toString().split(".")[1].length;
            }
            catch (e) {
                r1 = 0;
            }
            try {
                r2 = num2.toString().split(".")[1].length;
            }
            catch (e) {
                r2 = 0;
            }
            c = Math.abs(r1 - r2);
            m = Math.pow(10, Math.max(r1, r2));
            if (c > 0) {
                var cm = Math.pow(10, c);
                if (r1 > r2) {
                    num1 = Number(num1.toString().replace(".", ""));
                    num2 = Number(num2.toString().replace(".", "")) * cm;
                } else {
                    num1 = Number(num1.toString().replace(".", "")) * cm;
                    num2 = Number(num2.toString().replace(".", ""));
                }
            } else {
                num1 = Number(num1.toString().replace(".", ""));
                num2 = Number(num2.toString().replace(".", ""));
            }
            return (num1 + num2) / m;
        },

        //点数相减（解决JS float运算精度问题）
        accSub: function (num1, num2) {
            var r1, r2, m;
            try {
                r1 = num1.toString().split('.')[1].length;
            } catch (e) {
                r1 = 0;
            }
            try {
                r2 = num2.toString().split(".")[1].length;
            } catch (e) {
                r2 = 0;
            }
            m = Math.pow(10, Math.max(r1, r2));
            n = (r1 >= r2) ? r1 : r2;
            return (Math.round(num1 * m - num2 * m) / m).toFixed(n);
        },
        //点数相除（（解决JS float运算精度问题）
        accDiv: function (num1, num2) {
            var t1, t2, r1, r2;
            try {
                t1 = num1.toString().split('.')[1].length;
            } catch (e) {
                t1 = 0;
            }
            try {
                t2 = num2.toString().split(".")[1].length;
            } catch (e) {
                t2 = 0;
            }
            var factor = 100000;
            r1 = Number(num1.toString().replace(".", ""));
            r2 = Number(num2.toString().replace(".", ""));
            var power = Math.pow(10, t2 - t1);
            return (r1 * factor / r2) * power / factor;
        },
        //点数相乘（解决JS float运算精度问题）
        accMul: function (num1, num2) {
            var m = 0, s1 = num1.toString(), s2 = num2.toString();
            try { m += s1.split(".")[1].length } catch (e) { };
            try { m += s2.split(".")[1].length } catch (e) { };
            return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
        },
        tabCloums: function () {
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
        },
        getStringDate: function (strDate) {
            //var str = '/Date(1408464000000)/';
            if (!strDate) {
                return '';
            }
            var str = strDate.replace(new RegExp('\/', 'gm'), '');
            return eval('new ' + str);
        },
        showDialogPage: function (url, title, width, height, fnCallBack, data, scrolling, size, draggable, changeallow, mask) {
            window.anyDialog({
                width: width,
                height: height,
                title: title,
                url: url,
                scrolling: scrolling,
                mask: mask,
                size: size,
                data: data,
                draggable: draggable,
                changeallow: changeallow,
                onClose: function () {
                    if (fnCallBack) { fnCallBack(); }
                    else { location.reload(); }
                }
            });
        },
        topOpen: function (title, url, data, fnCallBack, width, height, size, draggable, changeallow, mask, scrolling) {
            //如果父级的window找不到就会去找父级的父
            window.parent.anyDialog({
                width: width,
                height: height,
                title: title,
                url: url,
                data: data,
                draggable: draggable,
                size: size,
                dialogResult: 0,
                changeallow: changeallow,
                scrolling: scrolling,
                mask: mask,
                page: 2,
                onClose: function () {
                    if (window.frames[0] != undefined) {
                        var results = window.frames[0].frameElement.options;
                    }
                    if (fnCallBack) { fnCallBack(results); }
                    else { location.reload(); }
                }
            });
        },
        LoadLanguage: function (jsName, haskendo) {
            var set = getQueryString("set");
            switch (set) {
                case "en-US":
                    document.write('<script src="../Scripts/Language/en-US/' + jsName + '.en-US.js"></script>');
                    break;
                case "zh-CN":
                default:
                    document.write('<script src="../Scripts/Language/zh-CN/' + jsName + '.zh-CN.js"></script>');
                    if (haskendo) {
                        document.write('<script src="../Scripts/Kendo/js/kendo.messages.zh-CN.js"></script>');
                        document.write('<script src="../Scripts/Kendo/js/kendo.culture.zh-CN.js"></script>');
                    }
                    break;
            }
        },
        tabCloums: function () {
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
        },
        CommonValidation: CommonValidation,
        stringToDate: function (string) {
            var matches;
            if (matches = string.match(/^(\d{4,4})-(\d{1,2})-(\d{2,2})$/)) {
                return new Date(matches[1], matches[2] - 1, matches[3]);
            } else {
                return null;
            };
        },
        dateToString: function (date) {
            var month = (date.getMonth() + 1).toString();
            var dom = date.getDate().toString();
            if (month.length == 1) month = "0" + month;
            if (dom.length == 1) dom = "0" + dom;
            return date.getFullYear() + "-" + month + "-" + dom;
        },
        ExecuteGetData: function (async, svcUrl, appDomain, executeParam, callback) {
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
                error: function (response) {
                    alert('Error occursed while requiring the remote source data!');
                }
            });
            return sourceData;
        },
        ExecutePostDataNew: function (async, svcUrl, appDomain, executeParam, callback) {
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var sourceData = [];
            $.ajax({
                cache: false,
                type: "POST",
                async: async,
                url: svcUrl + 'appDomain=TrustManagement&executeParams=2&resultType=commom',
                dataType: "json",
                //contentType: "application/json;charset=utf-8",
                processData: false,
                data: "[{executeParams:\"" + executeParams + "\"}," +
                        "{appDomain:\"" + appDomain + "\"}," +
                        "{resultType:\"commom\"}]",
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    if (callback)
                        callback(sourceData);
                },
                error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); $('#mask').hide() }
            });

            return sourceData;
        },
        ExecutePostData: function (async, svcUrl, appDomain, executeParam, fileData, callback) {
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var sourceData = [];

            //fileData : document.getElementById(id).files[0];
            $.ajax({
                cache: false,
                url: svcUrl + "appDomain={0}&executeParams={1}&postType={2}&streamIdentity={3}".StringFormat(appDomain, executeParams, "", ""),
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
                    alert('Some error Occurred!');
                }
            });

            return sourceData;
        },
        alertMsg: function (text, status, time) {
            var alert_tip = $('#alert-tip');
            var icon = 'fa fa-exclamation';
            var color = '#f33737';
            var time = 1500;
            switch (status) {

                case 0://提醒
                    icon = 'fa fa-exclamation';
                    break;
                case 1://成功
                    icon = 'fa fa-check';
                    color = '#66bb6a';
                    break;
            }

            if (!alert_tip[0]) {
                var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
                var $temp = $('<div class="alert_content">' +
                                '<i class="' + icon + '" style="color:' + color + '"></i>' +
                                '<p class="warning-text">' + text + '</p>' +
                            '</div>');
                $temp.appendTo($alert);
                $alert.appendTo(document.body);
                setTimeout(function () {
                    $('#alert-tip').fadeOut(function () {
                        $(this).remove();
                    });
                }, time);
            }
        },
        getLanguageSet: function getLanguageSet() {
            var cookieSet = $.cookie(GlobalVariable.Language_Set);
            if (!cookieSet) {
                cookieSet = GlobalVariable.Language_CN;
                $.cookie(GlobalVariable.Language_Set, cookieSet, { expires: 7, path: '/' });
            }

            return cookieSet;
        },
        //初始化中文数字显示金额(参数为输入框和提示框元素对象以及提示框所在DIV)
        tipCHNums: function tipCHNums(inputObj, tipDivObj) {
            tipDivObj.hover(function () {
                var res = gsUtil.getChineseNum(inputObj.val());
                tipDivObj.attr("title", res);
            })

        },
        tipCHNum: function tipCHNum(inputObj, tipObj, tipDivObj) {
            inputObj.focus(function () {
                tipObj.show();
                var res = gsUtil.getChineseNum(this.value);
                tipObj.text(res);
            });
            inputObj.blur(function () {
                var NumValue = inputObj.val();
                inputObj.val(NumValue);
                tipObj.hide();
            });
            inputObj.keyup(function () {
                var resw = gsUtil.moneyFormat(function (res) {
                    $(this).val(res);
                });
            });
            tipDivObj.hover(function () {
                tipObj.show();
                var res = gsUtil.getChineseNum(inputObj.val());
                tipObj.text(res);
            }, function () {
                if (!$(inputObj).is(':focus'))
                    tipObj.hide();
            });
            inputObj.bind('input propertychange', function () {
                var res = "";
                if (gsUtil.validControlValue(this)) {
                    var NumValue = gsUtil.NumValue(inputObj.val());
                    res = gsUtil.getChineseNum(NumValue);
                    inputObj.val(NumValue);
                }
                else {
                    res = "请输入金额";
                }
                tipObj.text(res);
            });
        },
        //表单获取焦点时，val值赋""
        //解决用户输入不合格的日期或者格式，再次获取焦点后“输入日期格式不合法”不消失问题  
        inputNull: function (dataStr) {
            if ($(dataStr).val() == "输入日期格式不合法" || $(dataStr).val() == "请输入整数" || $(dataStr).val() == "请输入数字") {
                $(dataStr).val("")
            }
        },
        //日期格式化
        //输入接受事件对象，字符串，或带有‘value’-key的对象
        //返回json对象code（1正确，2错误），info包括报错信息或正确格式化后的yyyy-MM-dd时间字符串，
        //若输入是对象同时设置对象的value值为格式化后的字符串，事件对象设置event.target.value值
        formatData: function (dataStr, mode) {
            var DataStr;
            var strDate = $(dataStr).val()
            if (mode && $(dataStr).val() == '') {
                $(dataStr).prop("placeholder", "")
                return false
            }
            if (strDate.indexOf('/') > -1) {
                //包含/符号
                strDate = strDate.replace(/\//g, "-");
            }
            try {
                if (typeof dataStr == 'object') {
                    if (dataStr.target) {
                        dataStr.target.value
                    } else {
                        DataStr = dataStr.value;
                    }


                } else if (typeof dataStr == 'string') {
                    DataStr = dataStr;
                } else {
                    result.code = 0;
                    result.info = '输入类型不合法';
                    if (typeof dataStr == 'object') {
                        dataStr.value = "";
                        $(dataStr).prop("placeholder", result.info)
                    }
                    return result;
                }
            } catch (e) {
                throw "错误：" + e
            }
            result = { "code": 0, "info": "" };

            //日期没有加横线
            if (strDate.length == 8) {
                var year = parseInt(strDate.substring(0, 4));
                var month = parseInt(strDate.substring(4, 6));
                var day = parseInt(strDate.substring(6, 8));
               
            } else if (strDate.length != 8 && strDate.length != 10) {
                $(dataStr).val("");
                $(dataStr).prop("placeholder", "输入日期格式不合法");
                return false
            } else if (strDate.length == 10) {
                var year = parseInt(strDate.substring(0, 4));
                var month = parseInt(strDate.substring(5, 7));
                var day = parseInt(strDate.substring(8, 10));
              
            }
          

            if (isNaN(year) || isNaN(month) || isNaN(day)) {
                result.code = 0;
                result.info = '输入日期格式不合法';
                if (typeof dataStr == 'object') {
                    dataStr.value = "";
                    $(dataStr).prop("placeholder", result.info)
                }
                return result;
            }



            if (Number(month) > 12 || Number(month) < 1) {

                result.code = 0;
                result.info = '输入月份不合法';
                if (typeof dataStr == 'object') {
                    dataStr.value = "";
                    $(dataStr).prop("placeholder", result.info)
                }
                return result;

            }

            if (Number(day) > 31 || Number(day) < 1) {
                result.code = 0;
                result.info = '输入天数不合法';
                if (typeof dataStr == 'object') {
                    dataStr.value = "";
                    $(dataStr).prop("placeholder", result.info)
                }
                return result;

            }

            switch (Number(month)) {
                case 2:
                    if (day > 29) {
                        result.code = 0;
                        result.info = '二月份日期不合法';
                        if (typeof dataStr == 'object') {
                            dataStr.value = "";
                            $(dataStr).prop("placeholder", result.info)
                        }
                        return result;
                    }
                    break;
                case 4:
                    if (day > 30) {
                        result.code = 0;
                        result.info = '四月份日期不合法';
                        if (typeof dataStr == 'object') {
                            dataStr.value = "";
                            $(dataStr).prop("placeholder", result.info)
                        }
                        return result;
                    }
                    break;
                case 6:
                    if (day > 30) {
                        result.code = 0;
                        result.info = '六月份日期不合法';
                        if (typeof dataStr == 'object') {
                            dataStr.value = "";
                            $(dataStr).prop("placeholder", result.info)
                        }
                        return result;
                    }
                    break;
                case 9:
                    if (day > 30) {
                        result.code = 0;
                        result.info = '九月份日期不合法';
                        if (typeof dataStr == 'object') {
                            dataStr.value = "";
                            $(dataStr).prop("placeholder", result.info)
                        }
                        return result;
                    }
                    break;
                case 11:
                    if (day > 30) {
                        result.code = 0;
                        result.info = '十一月份日期不合法';
                        if (typeof dataStr == 'object') {
                            dataStr.value = "";
                            $(dataStr).prop("placeholder", result.info)
                        }
                        return result;
                    }
                    break;
                case 12:
                    if (day > 31) {
                        result.code = 0;
                        result.info = '十二月份日期不合法';
                        if (typeof dataStr == 'object') {
                            dataStr.value = "";
                            $(dataStr).prop("placeholder", result.info)
                        }
                        return result;
                    }
                    break;
            }

            var dtDate;
            dtDate = new Date(year, month - 1, day);
            year = dtDate.getFullYear();
            month = dtDate.getMonth() + 1;
            day = dtDate.getDate();
            if (month < 10) {
                month = "0" + month
            }
            if (day < 10) {
                day = "0" + day;
            }
            result.code = 1;
            result.info = year + '-' + month + '-' + day;
            if (typeof dataStr == 'object') {
                if (dataStr.target) {
                    dataStr.target.value = result.info;
                } else {
                    dataStr.value = result.info;
                }

            }
            $(dataStr).prop("placeholder", "")
            return result
        },

        splitString: function (dataStr, strLength) {
            if (dataStr != undefined && dataStr != '')
                return dataStr.substr(0, strLength) + "...";
            else
                return "";
        },

        //当前日期
        currentDateId: function () {
            var date = new Date();
            //date.setDate(date.getDate() - 1);
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + "-" + month.toString() + "-" + strDate.toString();
            return currentdate;
        },
        //输入检测是否含有特殊字符
        stripscript: function (obj) {
            var $this = $(obj);
            var objValue = $this.val();
            if ($this.hasClass("theInputBorderRed")) {
                $this.removeClass("theInputBorderRed")
            }
            //var pattern = new RegExp("[`%~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
            var pattern = new RegExp("[^0-9a-zA-Z-_]");
            var testfirst = new RegExp("[_-]");
            if (testfirst.test(objValue.substring(0, 1))) {
                GSDialog.HintWindow("输入不合法,首字母只能是数据或者字母", function () {
                    $this.val("");
                });
                $this.blur();
                return false
            }
            if (pattern.test(objValue)) {
                GSDialog.HintWindow("输入不合法,只能输入数字,字母,下划线,破折号的组合", function () {
                    $this.addClass("theInputBorderRed");
                });
                $this.blur();
                return false
            }
        },
        //检测日期是否合法
        checkdate: function (obj, mode) {
            var $this = $(obj);
            var strDate = $this.val();
            var tarea = new RegExp("[^-]");
            $this.css("maxlength", 10)
            //var pattern = new RegExp("[`%~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）_/|{}【】‘；：”“'。，、？a-zA-Z]");
            var pattern = new RegExp("[^-0-9]");
            if (mode == "number") {
                strDate = strDate.replace(/,/g, "");
            }
            if (pattern.test(strDate)) {
                GSDialog.HintWindow("不能输入字母,不能输入除了破择号以外的特殊符号")
                //$this.blur();
                $(document).click();
                return false
            }
            var array = strDate.split("-");
            var year = parseInt(strDate.substring(0, 4));
            var yh = strDate.substring(4, 5);
            var Month = parseInt(strDate.substring(5, 7));
            var mh = strDate.substring(7, 8);
            var Day = parseInt(strDate.substring(8, 10));
            //输入日期不正确
            if (yh != "-") {
                GSDialog.HintWindow("请输入yyyy-mm-dd的日期格式");
                //$this.blur();
                $this.addClass("theInputBorderRed")
                $(document).click();
                return false
            }
            if (mh != "-") {
                GSDialog.HintWindow("如果月数是个位数,例如六月,请输入06,日期同理");
                //$this.blur();
                $this.addClass("theInputBorderRed")
                $(document).click();
                return false
            }
            if (strDate.length == 9) {
                GSDialog.HintWindow("如果日期是个位数,例如六号,请输入06,月数同理");
                //$this.blur();
                $this.addClass("theInputBorderRed")
                $(document).click();
                return false
            }
            //检测日期是否超出合法取值(输入格式正确)
            if (array.length == 3) {
                var intYear = parseInt(array[0], 10);
                var intMonth = parseInt(array[1], 10);
                var intDay = parseInt(array[2], 10);
                if (intMonth > 12 || intMonth < 1) {
                    GSDialog.HintWindow("输入日期不合法,月份不能大于12小于1")
                    //$this.blur();
                    $this.addClass("theInputBorderRed")
                    $(document).click();
                    return false
                };
                if (intDay < 1 || intDay > 31) {
                    GSDialog.HintWindow("输入日期不合法,日期不能小于1大于31");
                    //$this.blur();
                    $this.addClass("theInputBorderRed")
                    $(document).click();
                    return false
                }
                if ((intMonth == 4 || intMonth == 6 || intMonth == 9 || intMonth == 11) && (intDay > 30)) {
                    GSDialog.HintWindow("输入日期不合法,此月份只有30天");
                    //$this.blur();
                    $this.addClass("theInputBorderRed")
                    $(document).click();
                    return false
                }
                if (intMonth == 2) {
                    if (intDay > 29) {
                        GSDialog.HintWindow("输入日期不合法,此月份只有29天");
                        //$this.blur();
                        $this.addClass("theInputBorderRed")
                        $(document).click();
                        return false
                    }
                    if ((((intYear % 100 == 0) && (intYear % 400 != 0)) || (intYear % 4 != 0)) && (intDay > 28)) {
                        GSDialog.HintWindow("输入日期不合法,此月份只有28天");
                        //$this.blur();
                        $this.addClass("theInputBorderRed")
                        $(document).click();
                        return false
                    }
                }
            }
            $this.removeClass("theInputBorderRed")
            return true;
        },
        //checkDateNew检验日期是否合法加横线
        checkDateNew: function (obj) {
            var $this = $(obj);
            var strDate = $this.val();
            //换/为-
            if (strDate.indexOf('/') > -1) {
                //包含/符号
                strDate=strDate.replace(/\//g, "-");
            }
            //为空或者为null
            if (strDate == null || strDate == "") {
                $this.prop("placeholder", "");
                return false
            }
            //日期没有加横线
            if (strDate.length == 8) {
                var nYear = parseInt(strDate.substring(0, 4));
                var nMonth = parseInt(strDate.substring(4, 6));
                var nDay = parseInt(strDate.substring(6, 8));
                var dtDate;
                var str;
                if (isNaN(nYear) == true || isNaN(nMonth) == true || isNaN(nDay) == true) {
                    $this.val("");
                    $this.prop("placeholder", "输入日期格式不合法");
                    return false;
                }
                dtDate = new Date(nYear, nMonth - 1, nDay);
                if (nYear != dtDate.getFullYear() || (nMonth - 1) != dtDate.getMonth() || nDay != dtDate.getDate()) {
                    $this.val("");
                    $this.prop("placeholder", "输入日期格式不合法");
                    return false;
                }
                var Ryear = dtDate.getFullYear();
                var RMonth = dtDate.getMonth() + 1;
                var RDay = dtDate.getDate();
                if (RMonth < 10) {
                    RMonth = "0" + RMonth
                }
                if (RDay < 10) {
                    RDay = "0" + RDay;
                }
                str = Ryear + "-" + RMonth + "-" + RDay;
                $this.val(str);
            } else if (strDate.length != 8 && strDate.length != 10) {
                $this.val("");
                $this.prop("placeholder", "输入日期格式不合法");
                return false
            } else if (strDate.length == 10) {
                var nYear = parseInt(strDate.substring(0, 4));
                var nMonth = parseInt(strDate.substring(5, 7));
                var nDay = parseInt(strDate.substring(8, 10));
                var dtDate;
                var str;
                if (isNaN(nYear) == true || isNaN(nMonth) == true || isNaN(nDay) == true) {
                    $this.val("");
                    $this.prop("placeholder", "输入日期格式不合法");
                    return false;
                }
                dtDate = new Date(nYear, nMonth - 1, nDay);
                if (nYear != dtDate.getFullYear() || (nMonth - 1) != dtDate.getMonth() || nDay != dtDate.getDate()) {
                    $this.val("");
                    $this.prop("placeholder", "输入日期格式不合法");
                    return false;
                }
                var Ryear = dtDate.getFullYear();
                var RMonth = dtDate.getMonth() + 1;
                var RDay = dtDate.getDate();
                if (RMonth < 10) {
                    RMonth = "0" + RMonth
                }
                if (RDay < 10) {
                    RDay = "0" + RDay;
                }
                str = Ryear + "-" + RMonth + "-" + RDay;
                $this.prop("placeholder", "");
                $this.val(str);
            }
        },
        //数据渲染加载千分位
        numFormt: function (p) {
            ///console.log(p)
            if (parseFloat(p) == p) {
                //var a1=p().length;
                //var a2 = p().lastIndexOf(".");
                //var len                         
                //if (a2 != -1 && a1 - a2 > 5) {
                //     len = p().length - 1;
                //    return p().substr(0, len);
                //    return false;
                //} else {
                //    return p();
                //}
                var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                    return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                        return $1 + ",";
                    });
                })
                return res;
            }
            else
                return p;
        },
        ReturnNumFormt: function (p) {
            p = p.replace(/,/g, "")
            var res = p.replace(/\d+/, function (n) { // 先提取整数部分
                return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                    return $1 + ",";
                });
            })
            return res;
        },
        //数值校验
        NumberTest: function (obj) {
            var val = $(obj).val()
            var tex = new RegExp("[^.0-9]");
            if (tex.test(val)) {
                $(obj).val("");
            }
            if (parseFloat(val) != val) {
                $(obj).val("");
            }
        },
        //动态渲染千分位
        MoveNumFormt: function (target) {
            var tex = new RegExp("[^.(0-9)]");
            var p = $(target).val();
            p = p.replace(/,/g, "")
            if (tex.test(p)) {
                p = p.replace(/[^\d.]/g, "")
            }
            var res = p.replace(/\d+/, function (n) { // 先提取整数部分
                return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                    return $1 + ",";
                });
            })
            $(target).val(res)
            return false;
        },
        //同步下载文件字节流
        downLoadExcelForAsyn: function (filePath, innerText, desName, id) {
            var xmlRequest = new XMLHttpRequest();
            var uriHostInfo = location.protocol + "//" + location.host;
            var url = uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/" + "getStream?" + 'filePath=' + filePath;

            xmlRequest.open("post", url, false);
            xmlRequest.overrideMimeType('application/vnd.ms-excel;charset=x-user-defined');//这里是关键，不然 this.responseText;的长度不等于文件的长度  charset=blob
            xmlRequest.onreadystatechange = function (e) {
                if (this.readyState == 4 && this.status == 200) {
                    var text = this.responseText;
                    var length = text.length;
                    var array = new Uint8Array(length);
                    var elink = document.createElement('a');
                    elink.innerHTML = innerText;
                    elink.download = desName;

                    for (var i = 0; i < length; ++i) {
                        array[i] = text.charCodeAt(i);
                    }
                    var blob = new Blob([array], { "type": "application/octet-stream" });
                    console.log(blob);
                    elink.href = URL.createObjectURL(blob);
                    document.getElementById(id).appendChild(elink);
                    //img.src = window.URL.createObjectURL(blob);
                }
            }
            xmlRequest.send();
        },
        //异步下载文件字节流
        downLoadExcelForSyn: function (filePath, innerText, desName, id) {
            var oReq = new XMLHttpRequest();
            //var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx";
            var uriHostInfo = location.protocol + "//" + location.host;
            
            var url = uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/" + "getStream?" + 'filePath=' + filePath;
            oReq.open("POST", url, true);
            oReq.responseType = "blob";
            oReq.onload = function (oEvent) {
                var content = oReq.response;

                var elink = document.createElement('a');
                elink.innerHTML = innerText;
                elink.download = desName;
                //elink.style.display = 'none';

                var blob = new Blob([content]);
                elink.onload = function (e) {
                    window.URL.revokeObjectURL(e.href); // 清除释放

                };
                elink.href = URL.createObjectURL(blob);
                document.getElementById(id).appendChild(elink);
                //elink.click();
                //document.body.removeChild(elink);
            };
            oReq.send();
        },
        //自定义select-input组件输入和选取数据
        SelectDateFromDIy: function (parms, mode) {
            var self = this;
            var select_container = $(".Diy-select-input");//确定组件标识
            //默认加载第一项
            if (parms == true) {
                $.each(select_container, function (i, v) {
                    var value = select_container.eq(i).find(".el-select-dropdown .el-select-dropdown-list .el-select-dropdown-item").eq(0).html()
                    select_container.eq(i).find(".el-input-inner").val(value)
                })
            }
            //点击输入框显示下拉列表取消只读属性,输入框可以输入
            select_container.on("click", ".el-input input", function () {
                var selecthandler = $(this).next().find("i");
                var ulList = $(this).parent().parent().find(".el-select-dropdown");
                if (!selecthandler.hasClass("el-icon-reverst")) {
                    $(this).addClass("is_focus");
                    $(this).removeAttr("readonly")
                    selecthandler.addClass("el-icon-reverst");
                    ulList.fadeIn(300);
                } else {
                    $(this).removeClass("is_focus");
                    $(this).attr("readonly", true)
                    selecthandler.removeClass("el-icon-reverst");
                    ulList.fadeOut(300);
                }
            })
            //点击下拉图标显示下拉列表取消只读属性,输入框可以输入
            select_container.on("click", ".el-icon-normal", function () {
                var selecthandler = $(this);
                var ulList = $(this).parents(".el-input").next();
                var input_int = $(this).parents(".el-input").find(".el-input-inner")
                input_int.focus();
                if (!selecthandler.hasClass("el-icon-reverst")) {
                    input_int.addClass("is_focus");
                    input_int.removeAttr("readonly")
                    selecthandler.addClass("el-icon-reverst");
                    ulList.fadeIn(300);
                } else {
                    input_int.removeClass("is_focus");
                    input_int.attr("readonly", true)
                    selecthandler.removeClass("el-icon-reverst");
                    ulList.fadeOut(300);
                }
            })
            //输入框失去焦点隐藏下拉列表
            select_container.on("blur", ".el-input input", function () {
                var selecthandler = $(this).next().find("i");
                var ulList = $(this).parent().parent().find(".el-select-dropdown");
                $(this).removeClass("is_focus");
                $(this).attr("readonly", true)
                selecthandler.removeClass("el-icon-reverst");
                ulList.fadeOut(300);
            })
            //点击下拉列表项input的value赋值
            select_container.find(".el-select-dropdown .el-select-dropdown-list").on("click", ".el-select-dropdown-item", function () {
                var value = $(this).html();
                var input_int = $(this).parents(".Diy-select-input").find(".el-input-inner");
                input_int.val(value)
            })
            //日期类型的自动补全日期横线
            if (mode == "date") {
                select_container.on("change", ".el-input input", function () {
                    self.checkDateNew($(this)[0], true)
                })
            }
        },
        Guid: function (prefix) {
            var counter = 0;
            return (function (prefix) {
                var guid = (+new Date()).toString(32);
                for (var i = 0; i < 5; i++) {
                    guid += Math.floor(Math.random() * 65535).toString(32);
                }
                return (prefix || 'gd') + guid + (counter++).toString(32);
            })(prefix)
        },
        //chrome iframe href失效的问题
        ChromeSrcFix:function(url,id){
            $('#' + id)[0].contentWindow.location.href = "";
            $('#' + id).attr("src", url);
            $('#' + id)[0].contentWindow.location.href = url
        }
    };
    return new Common();
})

//$(function () {
//    tabCloums();
//})



