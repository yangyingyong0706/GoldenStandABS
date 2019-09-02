define(function (require) {
    var FormatNumber = require('app/components/Layered/js/formatNumber');
    function gsUtil() {
    }
    gsUtil.prototype = {
        getURLParameter: function (name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
        },
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },

        getHashValue: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.hash.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },


        getChineseNum: function (strNum) {
            var isCHCapital = false; //是否是中文大写
            if (!strNum || strNum == null || strNum == '') {
                return "请输入金额";
            }
            strNum = strNum.replace(/,/g, '').replace(/\s/g, ''); //去逗号和空
            if (isNaN(strNum) || (strNum.length > 1 && strNum.charAt(0) == '0' && strNum.charAt(1) != '.')) {
                //验证输入的字符是否为数字,开头不能为零
                return "请检查输入金额是否正确";
            }
            var chineseNum = "";
            var num_Integer, num_Decimal;
            var num_CH = isCHCapital ? "零壹贰叁肆伍陆柒捌玖" : "零123456789";
            var num_Unit = "拾兆仟佰拾亿仟佰拾万仟佰拾元";   //百万亿以内
            if (strNum.indexOf('.') > -1) {
                //判断是否存在小数位
                num_Integer = strNum.split('.')[0];
                num_Decimal = strNum.split('.')[1];
            }
            else {
                num_Integer = strNum;
            }
            //var tempValue = num_Integer.length > 1 ?
            //    () + "." + num_Integer[1] :
            //    (num_Integer.length > 14 ? tempValue.substr(0, 14) : tempValue);
            //console.log(tempValue);

            if (num_Integer.length > 14) {
                //百万亿以内截取,配合前端控件的截取功能,只保留14位(十万亿级)
                num_Integer = num_Integer.substr(0, 14);
                //return '输入金额过大';
            }


            num_Unit = num_Unit.substr(num_Unit.length - num_Integer.length, num_Integer.length);
            //先转换整数
            for (i = 0; i < num_Integer.length ; i++) {
                chineseNum += num_CH.charAt(num_Integer.charAt(i)) + num_Unit.charAt(i);
            }
            //再转换小数
            if (num_Decimal && num_Decimal.length > 0) {
                if (num_Decimal >= 2) {
                    //保留小数点后两位
                    num_Decimal = num_Decimal.substr(0, 2);
                }
                var tempDime = num_CH.charAt(num_Decimal.charAt(0)) + '角';
                var tempCent = num_CH.charAt(num_Decimal.charAt(1)) + '分';
                chineseNum += tempDime;
                chineseNum += tempCent;
            }
            else {
                chineseNum += '整';
            }

            chineseNum = chineseNum.replace(/零角零分$/g, '整')
                .replace(/零[仟佰拾角]/g, '零')
                .replace(/(零)+/g, '零')
                .replace(/零(兆|亿|万)/g, '$1')
                .replace(/兆亿万/g, '兆')
                .replace(/亿万/g, '亿')
                .replace(/兆/g, '万亿');
            if (chineseNum.split('亿').length - 1 == 2) {
                //表示表达式有两个亿字存在
                chineseNum = chineseNum.replace(/万亿/, '万');//把第一个亿去掉
            }

            return chineseNum;

        },
        //验证必填项
        validControlValue: function (obj) {
            var $this = $(obj);
            var objValue = $this.val();
            var valids = $this.attr('data-valid');

            //无data-valid属性，不需要验证
            if (!valids || valids.length < 1) { return true; }

            //如果有必填要求，必填验证
            if (valids.indexOf('Required') >= 0) {
                if (!objValue || objValue.length < 1) {
                    $this.addClass('red-border');
                    return false;
                } else {
                    $this.removeClass('red-border');
                }
            }
            //暂时只考虑data-valid只包含两个值： 必填和类型
            var dataType = valids.replace('Required', '').toLocaleLowerCase().trim();

            // Remote ajax 验证
            if (dataType === 'remote') {
                if ($this.data('remote-valid') === 'error') {
                    $this.addClass('red-border');
                    return false;
                } else {
                    $this.removeClass('red-border');
                }
            }

            var TrustMngmtRegxCollection = {
                //int: /^[-]{0,1}[1-9]{1,}[0-9]{0,}$/,
                int: /^[-]?[1-9]+\d*$|^0$/,
                //decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$/,
                decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?$/,
                date: /^(\d{4})-(\d{2})-(\d{2})$/,
                datetime: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
            };


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
        },
        //, to add


        //控制金额输入长度
        NumValue: function (strNum) {
            strNum = strNum.replace(/,/g, '').replace(/\s/g, '');//去掉逗号和空格
            var num_Integer = strNum.split('.')[0];//获取金额整数部分
            var num_Decimal = strNum.split('.')[1];
            var inputObjVal;
            if (num_Decimal == undefined) {
                inputObjVal = num_Integer.length > 14 ? num_Integer.substr(0, 14) : num_Integer;
            } else {
                inputObjVal = (num_Integer.length > 14 ? num_Integer.substr(0, 14) : num_Integer) + "." + num_Decimal;
            }
            return inputObjVal;
        },
        //金额千分位
        moneyFormat: function (n) {
            FormatNumber.checkNumberFunc({}, window.event, function (v) {
                n(v);
            });
        }
    };

    return new gsUtil();
});