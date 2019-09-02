var FormatNumber = function () { };
FormatNumber.prototype = {
    init: function (settings) {
        var _this = this,
            minus = ''
        settings = $.extend({
            trigger: '[data-type="money"]',
            decimal: 2,
            minus: false, //是否支持负数,默认不支持
            parent: 'body'
        }, settings);
        this.settings = settings;

        var regex = '([1-9]\\d*(\\.\\d{1,2})?|0(\\.\\d{1,2})?)';
        if (settings.decimal <= 0 && settings.minus == true) {
            regex = '(^-?[1-9]\\d*$)|(^[0]$)'; //正负整数
        } else if (settings.decimal == 0) {
            regex = '(^[1-9]\\d*$)|(^[0]$)'; //正整数
        } else if (settings.minus == true) {
            //regex = '^-?([1-9]\\d*(\\.\\d{1,' + settings.decimal + '})?|([^0]{1}(\\.\\d{1,' + settings.decimal + '}))?)';
            regex = '(^-)?((([1-9]d*(\\.\\d{1,' + settings.decimal + '})?)|((^[0]{1}\\.(\\d{1,' + settings.decimal + '})?$))|^[0]$))'
        } else {
            regex = '([1-9]\\d*(\\.\\d{1,' + settings.decimal + '})?|([^0]{1}(\\.\\d{1,' + settings.decimal + '}))?)';
        }
        settings.reg = regex;
    },
    checkNumberFunc: function (settings, eventall, datasource) {
        var _this = this;

        _this.init({});

        var checkNumber = function (e, callback) {
            GetNumberResult(e, e.srcElement, _this.settings.reg);
            var v = _this.getMoneyfloat($(e.srcElement).val());
            callback(v);
        }

        var GetNumberResult = function (e, obj, reg) {
            var valueLength = obj.value.length;
            var position = getTxtCursorPosition(obj);
            var key = window.event ? e.keyCode : e.which;
            var result = _this.convertNumberN(key, obj.value, reg);
            obj.value = result
            position += (result.length - valueLength);
            setTxtCursorPosition(obj, position);
        }

        /**
         *   说明: 获取文本框的光标位置
         *   参数: 文本框对象 {dom object}
         * 返回值: {int}
         */
        var getTxtCursorPosition = function (txtObj) {

            var tempObj = txtObj;
            var cursurPosition = -1;

            if (tempObj.selectionStart != undefined) { //非IE浏览器
                cursurPosition = tempObj.selectionStart;
            } else { //IE
                var range = document.selection.createRange();
                range.moveStart("character", -tempObj.value.length);
                cursurPosition = range.text.length;
            }

            return cursurPosition;
        }

        /**
         *   说明: 设置文本框的光标位置
         *   参数: 文本框对象 {dom object}, 光标的位置 {int}
         * 返回值: {void}
         */
        var setTxtCursorPosition = function (txtObj, pos) {

            var tempObj = txtObj;
            var cursurPosition = -1;

            if (tempObj.selectionStart != undefined) { //非IE浏览器
                tempObj.setSelectionRange(pos, pos);
            } else { //IE
                var range = tempObj.createTextRange();
                range.move("character", pos);
                range.select();
            }
        }

        checkNumber.call(null, eventall, datasource);
    },
    getMoneyfloat: function (s) {
        if (s == '') {
            return null;
        }
        return parseFloat((s + "").replace(/[^\d\.-]/g, ""));
    },
    doFormat: function (s) {
        var _this = this;
        if (!s) return "";

        if ($.isNumeric(s)) {
            s = s.toString();
        }
        if (typeof s === 'string') {
            s = s.replace(/^(\d+)((\.\d*)?)$/, function (v1, v2, v3) {
                return v2.replace(/\d{1,3}(?=(\d{3})+$)/g, '$&,') + (v3.slice(0, _this.settings.decimal + 1) || '.00');
            });
        }

        return s.replace(/^\./, "0.")
    },
    /** convertNumberN
 *   说明: 转换数字为千分位，常用于财务系统
 *   参数: 键盘key {string}，被处理的字符串 {string}
 * 返回值: 返回转换的结果 {string}
 */
    convertNumberN: function (key, value, reg) {
        var _this = this;
        if (_this.checkInactionKey(key)) {
            return value;
        }

        _this.init({});

        if (typeof reg == "undefined")
            reg = _this.settings.reg;

        if ($.isNumeric(value)) {
            value = value.toString();
        }
        var tempValue = value;
        var isminus = false;
        var replaceReg = /[^\d\.]/g;
        if (_this.settings.minus && /^\-/.test(tempValue)) {
            tempValue = tempValue.slice(1);
            isminus = true;
        }
        if (tempValue.indexOf(".") <= 0) {
            //replaceReg = /[^\d]/g;
            tempValue = tempValue.replace(replaceReg, "");
        } else {
            tempValue = tempValue.replace(replaceReg, "");
            var isNaNNum = parseFloat(tempValue + "00");
            if (isNaN(isNaNNum)) {
                tempValue = isNaNNum;
            }
            if (/\./.test(tempValue) && _this.settings.decimal == 0) {
                tempValue = tempValue.toString().replace(/\./g, '');
            }
        }
        var re = new RegExp(reg);
        if (!re.exec(tempValue) && tempValue != "") {
            tempValue = "0";
        }

        var tempValueArray = tempValue.split(".");
        tempValue = tempValueArray.length > 1 ?
            (tempValueArray[0].length > 14 ? tempValueArray[0].substr(0, 14) : tempValueArray[0]) + "." + tempValueArray[1] :
            (tempValue.length > 14 ? tempValue.substr(0, 14) : tempValue);

        var result = _this.doFormat(tempValue);
        if (isminus) result = '-' + result;
        if (result == null) {
            return;
        }

        var resultArray = result.split(".");

        if (tempValue.lastIndexOf(".") >= 0) {
            if (tempValue.lastIndexOf(".") == tempValue.length - 1) {
                tempValue = resultArray[0] + '.';
            } else {
                var subLength = tempValue.length - (tempValue.lastIndexOf(".") + 1);
                tempValue = resultArray[0] + "." + (resultArray[1] ? resultArray[1].substring(0, subLength) : '0');
            }
        } else {
            tempValue = resultArray[0];
        }


        return tempValue;
    },
    /**
     *   说明: 检查不做处理的键盘Key
     *   参数: 键盘KeyCode {string}
     * 返回值: 如果是不做处理的key返回true，反之false {bool}
     */
    checkInactionKey: function (keyCode) {
        var excludeKey = {
            "left": 37,
            "right": 39,
            "top": 38,
            "down": 40,
            "home": 36,
            "end": 35,
            "shift": 16
        };
        for (var key in excludeKey) {
            if (keyCode == excludeKey[key]) {
                return true;
            }
        }
        return false;
    }
};

// Number formatter utils
function NumberFormatUtils() {
    /*
    amount              -- amount to format
    decimalPlaces       -- number of decimal places, optional, defaults to 2
    decimalSeparator    -- decimal separator string, optional, defaults to '.'
    thousandsSeparator  -- optional
    negativeSign        -- optional
    groupSizes          -- optional, defaults to "3", could be "3,2", see NumberFormatInfo.NumberGroupSizes Property
    */
    function formatMoney(amount, decimalPlaces, decimalSeparator, thousandsSeparator, negativeSign, groupSizes) {
        try {
            if (decimalPlaces == null)
                decimalPlaces = 2;
            if (decimalSeparator == null)
                decimalSeparator = '.';
            if (thousandsSeparator == null)
                thousandsSeparator = ",";
            if (negativeSign == null)
                negativeSign = "-";
            if (groupSizes == null)
                groupSizes = "3";
            var dec = parseInt(decimalPlaces);
            var value = parseFloat(amount);
            if (isNaN(value)) {
                return "";
            }

            groupSizes = groupSizes.split(",");     // convert to array

            var isNegative = false;
            if (value < 0) {
                isNegative = true;
                value = Math.abs(value);
            }
            if (!isNaN(dec)) {
                value = fixNumber(value, dec);
            }

            if (thousandsSeparator != null) {
                value = value + '';     // convert to string
                value = formatGroups(value, groupSizes, thousandsSeparator);
            }

            if (isNegative && parseFloat(value, 10) > 0) {
                value = negativeSign + value;
            }

            value = "" + value;     // ensure value is a string

            if (decimalPlaces > 0)
                return reverse(reverse(value).replace('.', decimalSeparator));
            else
                return value;

        } catch (e) {
            alert(e);
        }
    }

    /*
      make sure toFixed function works correctly on IE and foxfire.
    */
    function fixNumber(num, d) {
        var s = num + ""; if (!d) d = 0;
        if (s.indexOf(".") == -1) s += "."; s += new Array(d + 1).join("0");
        if (new RegExp("^(-|\\+)?(\\d+(\\.\\d{0," + (d + 1) + "})?)\\d*$").test(s)) {
            var s = "0" + RegExp.$2, pm = RegExp.$1, a = RegExp.$3.length, b = true;
            if (a == d + 2) {
                a = s.match(/\d/g); if (parseInt(a[a.length - 1]) > 4) {
                    for (var i = a.length - 2; i >= 0; i--) {
                        a[i] = parseInt(a[i]) + 1;
                        if (a[i] == 10) { a[i] = 0; b = i != 1; } else break;
                    }
                }
                s = a.join("").replace(new RegExp("(\\d+)(\\d{" + d + "})\\d$"), "$1.$2");
            } if (b) s = s.substr(1); return (pm + s).replace(/\.$/, "");
        }
        return num.toFixed(d);
    };

    /*
    This reverses the string and starts counting digits after the decimal.  Once the group size
    is reached, it inserts the separator char and increments the group index.
    */
    function formatGroups(val, groupSizes, groupSeparator) {
        val = reverse(val);
        var groupIndex = 0, groupCharCount = 0;
        var groupSize = getGroupSize(groupIndex, groupSizes);

        var idx = val.indexOf('.') + 1;     // start past . or at beginning of string
        while (idx < val.length) {
            idx++;
            groupCharCount++;

            if (groupCharCount == groupSize && idx < val.length) {
                groupCharCount = 0;
                groupSize = getGroupSize(++groupIndex, groupSizes);
                val = val.substring(0, idx) + groupSeparator + val.substring(idx);
                idx++;
            }
        }

        return reverse(val);
    }

    // return group size or last group size
    function getGroupSize(index, groupSizes) {
        return parseInt((index >= groupSizes.length) ? groupSizes[groupSizes.length - 1] : groupSizes[index]);
    }

    // string reverse
    function reverse(str) {
        if (!str) return '';
        var revstr = '';
        for (i = str.length - 1; i >= 0; i--)
            revstr += str.charAt(i);
        return revstr;
    }

    function roundNumber(value, decimalPlaces) {
        var roundMultiplier = Math.pow(10, decimalPlaces);
        return Math.round(value * roundMultiplier) / roundMultiplier;
    }

    return {
        formatMoney: formatMoney,
        roundNumber: roundNumber
    };
}