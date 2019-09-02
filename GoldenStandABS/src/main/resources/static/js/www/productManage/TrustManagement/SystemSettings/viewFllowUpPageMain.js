/// <reference path="../Scripts/jquery-1.7.2.min.js" />


// json data
var TrustInfo, trustId, OptionSource, idList;
var config = {
    tmsDataProcessBase: GlobalVariable.DataProcessServiceUrl,
    tmsSessionServiceBase: GlobalVariable.TrustManagementServiceUrl,
    $next: $('#next-step'),
    getDataConfig: getDataConfig
};
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
Array.prototype.indexOf = function (elt /*, from*/) {
    var len = this.length >>> 0;
    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
        from += len;
    for (; from < len; from++) {
        if (from in this &&
            this[from] === elt)
            return from;
    }
    return -1;
};

// 存续期管理全局对象
var TrustFllowUp = {
    stepId: 0,
    ISOPEN: false,
    isShowRemove: false,
    METHODS: [],
    sideNavSwitchVerify: [],
    LoadCount: 0, //从WCF获取数据用到方法getTrustInfoByTrustId，getAllCodeDictionary.返回一个+1，等全部返回后=2时，绑定再数据

    init: function () {
        var self = this
        //self.addUrlEvent();
        self.getTrustInfoByTrustId();
        self.getAllCodeDictionary();
        config.$next.click(function () {
            self.sideNavSwitchVerifyMemberAdd(self.stepId);

            var canSubmit = true;
            //遍历验证所有步骤
            for (var i = 0; i <= 0; i++) {
                self.sideNavSwitchVerifyMemberAdd(i);
                if (!self.validStepControlsBeforeLeaving(i)) {
                    canSubmit = false;
                }
            }
            if (!canSubmit) { alert('页面存在输入错误，无法提交！'); return; }
            // 上传数据
            self.updateTrustData();
            //}
        });
        self.addColumnsEvent();
        self.initFormMenu();
        self.formMenu();
    },
    // 公用接口
    api: {
        // 正确提示
        alertMsg: function (text) {
            var alert_tip = $('#alert-tip');
            if (!alert_tip[0]) {
                var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
                var $temp = $('<div class="alert_content">' +
                                '<i class="icon icon-roundcheck am-flip"></i>' +
                                '<p>' + text + '</p>' +
                            '</div>');
                $temp.appendTo($alert);
                $alert.appendTo(document.body);
                setTimeout(function () {
                    $('#alert-tip').fadeOut(function () {
                        $(this).remove();
                    });
                }, 1500);
            }
        },
        // 获取指定分类下的数据
        getCategoryData: function () {
            if (!TrustInfo) return false;
            return TrustInfo;
        },
        // 日期选择器
        datePlugins: function () {
            $('.date-plugins').date_input();
        },
        getTemplate: function (itemcode, itemvalue) {
            return "<{0}>{1}</{0}>".format(itemcode, itemvalue);
        },
        getShotTemplate: function (arr) {
            return { "Category": arr.Category, "SPId": arr.SPId, "SPCode": arr.SPCode, "SPRItemCode": arr.SPRItemCode, "TBId": arr.TBId, "ItemId": arr.ItemId, "ItemCode": arr.ItemCode, "ItemValue": arr.ItemValue };
        },
        registControlsValueChange: function (objs) {
            $(objs).change(function () {
                validControlValue($(this));
            });
        },
        validControls: function (obj) {
            var validPass = true;
            $(obj).each(function () {
                var $this = $(this);
                if (!validControlValue($this)) { validPass = false; }
            });
            return validPass;
        }
    },
    sideNavSwitchVerifyMemberAdd: function (sId) {

        if (this.sideNavSwitchVerify.indexOf(sId) < 0) {
            this.sideNavSwitchVerify.push(sId);
        }
    },
    registerMethods: function (obj) {
        if (typeof obj == 'object') this.METHODS.push(obj);
    },
    addColumnsEvent: function (step) {
        var self = this;
        $('.tab-columns>.btn').click(function () {
            var $this = $(this),
            col = $(this).attr('data-col');
            $this.siblings()
                .removeClass('btn-active')
                .end()
                .addClass('btn-active');
            self.autoLayout(self.columns(col));
        });
    },
    registerEvent: function () {
        if (this.METHODS != '') {
            this.METHODS[0].init.apply(this.api);
        }
    },
    // 根据参数显示列
    columns: function (col) {
        if (parseInt(col) >= 4) col = 4;
        return 12 / parseInt(col);
    },
    // 自动布局
    autoLayout: function (col) {
        $('.autoLayout-plugins').each(function () {
            var _class = $(this).attr('class');
            $(this).attr('class', _class.replace(/(\d)/, col));
        });
    },
    //处理页面menu
    formMenu: function (index) {
        if (typeof index == "undefined")
            index = 0;
        $(".menu_target").each(function (i, n) {
            if (i == index)
                $(n).show();
            else
                $(n).hide();
        });
        $("#step-title .title").each(function (i, n) {
            $(n).removeClass("titlecur");
            if (i == index)
                $(n).addClass("titlecur");
        });
    },
    initFormMenu: function () {
        var self = this;
        $("#step-title .title").each(function (i, n) {
            $(n).mousedown(function () {
                self.formMenu(i);
            });
        });
    },
    //保存信息到working.SessionContext中
    saveWorkingSessionContext: function (sessionContext, callback) {
        sessionContext = "{0}".format(encodeURIComponent("<item>" + sessionContext + "</item>"));
        //?appDomain={appDomain}&executeParams={executeParams}&postType={postType}&streamIdentity={streamIdentity}
        var params = getUpdateParams(sessionContext);
        var serviceUrl = config.tmsDataProcessBase + "CommonExecutePost" +
            "?appDomain={0}&executeParams={1}&postType={2}&streamIdentity={3}".format("TrustManagement", JSON.stringify(params), "", "");

        var fileData = null;//document.getElementById(id).files[0];
        $.ajax({
            url: serviceUrl,
            type: 'POST',
            data: fileData,
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            success: function (data) {
                if (data.CommonExecutePostResult == true) {

                    if (callback)
                        callback();
                    else
                        alert("操作成功");
                }

                //uploadedNewFiles -= 1;
                //if (uploadedNewFiles == 0) {
                //    alert('All operations have been successfully completed.');
                //    window.location.reload();
                //}
            },
            error: function (data) {
                alert('Some error Occurred!');
            }
        });
    },
    // 获取后端数据
    getTrustInfoByTrustId: function () {
        var self = this;
        sContent = JSON.stringify(config.getDataConfig);
        var serviceUrl = config.tmsDataProcessBase + 'CommonExecuteGet?appDomain=TrustManagement&executeParams=' +
            sContent + "&resultType=com";

        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/xml;charset=utf-8",
            data: {},
            beforeSend: function () {
                $('#loading').fadeOut();
            },
            success: function (response) {
                if (typeof response == "string")
                    response = JSON.parse(response);
                console.log(response);
                self.sortingSourceData(response);
                //self.SetDataArrayByUtil(response);
                //TrustInfo = response;
                self.LoadCount++;
                if (self.LoadCount == 2) {
                    self.registerEvent();
                }
            },
            error: function (response) { alert("error:" + response); }
        });
    },
    //获取后所有Select数据
    getAllCodeDictionary: function () {
        var self = this;

        OptionSource = [
            { CategoryCode: "InterestToTakeEffectRule", ValueShort: "次年对月对日", Value: "次年对月对日" }
            , { CategoryCode: "InterestToTakeEffectRule", ValueShort: "下一季", Value: "下一季" }
            , { CategoryCode: "InterestToTakeEffectRule", ValueShort: "下一月", Value: "下一月" }
            , { CategoryCode: "InterestToTakeEffectRule", ValueShort: "次年第一天", Value: "次年第一天" }
            , { CategoryCode: "InterestCalculateRule", ValueShort: "前置", Value: "前置" }
            , { CategoryCode: "InterestCalculateRule", ValueShort: "后置", Value: "后置" }
        ];
        idList = [
            { CategoryCode: "PrincipalPaymentType", Value: "前N个月按月还息，自第N+1个月按月等额本息" }
            , { CategoryCode: "PrincipalPaymentType", Value: "按月结息，到期一次性还本" }
            , { CategoryCode: "PrincipalPaymentType", Value: "本金分期摊还" }
            , { CategoryCode: "PrincipalPaymentType", Value: "分期还本，按月付息" }
            , { CategoryCode: "PrincipalPaymentType", Value: "按双月等额本息" }
            , { CategoryCode: "PrincipalPaymentType", Value: "按月结息，按季等额本金" }
            , { CategoryCode: "InterestPaymentType", Value: "前N个月按月还息，自第N+1个月按月等额本息" }
            , { CategoryCode: "InterestPaymentType", Value: "按月结息，到期一次性还本" }
            , { CategoryCode: "InterestPaymentType", Value: "按月付息" }
            , { CategoryCode: "InterestPaymentType", Value: "分期还本，按月付息" }
            , { CategoryCode: "InterestPaymentType", Value: "按双月等额本息" }
            , { CategoryCode: "InterestPaymentType", Value: "按月结息，按季等额本金" }
        ];
        self.LoadCount++;
        if (self.LoadCount == 2) {
            self.registerEvent();
        }
        return;

        var sContent = "{'SPName':'usp_GetAllCodeDictionary','Params':{" +
                 "'AliasSetName':'zh-CN'" +
                 "},}";
        var serviceUrl = config.tmsDataProcessBase + "GetTrustData?applicationDomain=TrustManagement&contextInfo=" + sContent;
        $.ajax({
            url: serviceUrl,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            crossDomain: true,
            beforeSend: function () {
                $('#loading').fadeOut();
            },
            success: function (response) {
                OptionSource = jQuery.parseJSON(response);
                self.LoadCount++;
                if (self.LoadCount == 2) {
                    self.registerEvent();
                }
            },
            error: function (response) {
                alert("error:" + response);
            }
        });
    },
    sortingSourceData: function (sourceData) {
        TrustInfo = {};
        $.each(sourceData, function (i, data) {
            var cate = data.Category;
            if (!TrustInfo[cate]) { TrustInfo[cate] = []; }
            TrustInfo[cate].push(data);
        });

        return;

        for (var item in TrustInfo) {
            TrustInfo[item] = TrustInfo[item].sort(function (a, b) {
                return a.SequenceNo - b.SequenceNo;
            });
        }
    },
    // 初始化数据，根据单位/精度
    SetDataArrayByUtil: function (array) {
        var self = this;

        $.each(array, function (i, n) {
            n.ItemValue = self.ConvertDataByUtil("set", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
        });
    },
    // 根据单位和精度，转化数据
    ConvertDataByUtil: function (GetOrSet, DataType, Value, UnitOfMeasure, Precise) {
        var self = this;
        if (parseFloat(Value) != Value || (DataType != "Decimal" && DataType != "Int"))
            return Value;
        var mathtype = (GetOrSet == "get" ? "*" : (GetOrSet == "set" ? "/" : ""));
        if (mathtype == "")
            return Value;

        var result, xs;
        var UnitOfMeasureArray = ["One", "Ten", "Hundred", "Thousands", "TenThousands", "HundredThousands", "Million", "TenMillion", "HundredMillion", "Billion", "TenBillion"];
        var index = $.inArray(UnitOfMeasure, UnitOfMeasureArray);

        if (index > 0) {
            xs = Math.pow(10, index);
            var result = self.GetMathResult(mathtype, parseFloat(Value), Number(xs));
        } else {
            result = Value;
        }

        if (GetOrSet == "get" && DataType == "Decimal" && parseInt(Precise) == Precise && parseInt(Precise) >= 0)
            return Number(result).toFixed(Precise);
        else
            return result;
    },
    GetMathResult: function (type, arg1, arg2) {
        var result;
        switch (type) {
            case "*":
                result = arg1.mul(arg2);
                break;
            case "/":
                result = arg1.div(arg2);
                break;
            default:
                break;
        }
        return result;
    },
    // 更新数据
    updateTrustData: function () {
        var sessionContext = '', sessionContextArray = [], tmpArray = [];
        if (this.METHODS != '') {
            var updatearray = this.METHODS[0].update.apply(this.api);
            if (typeof updatearray != 'undefined') {
                $.each(updatearray, function (i, n) {
                    tmpArray.push(n);
                });
            }
        }

        var self = this;
        //////根据单位和精度转换为存储所需
        //$.each(tmpArray, function (i, n) {
        //    n.ItemValue = self.ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
        //    sessionContextArray.push(self.api.getShotTemplate(n));
        //});

        sessionContext = tmpArray.join("");
        var cb = (typeof SaveCallBack != "undefined" ? SaveCallBack : null);
        this.saveWorkingSessionContext(sessionContext, cb);
    },
    //validate current step's controls whild click the 'next' button
    validStepControlsBeforeLeaving: function (stepIndex) {
        if (!this.METHODS || this.METHODS.length < 0 || !this.METHODS[stepIndex]) { return true; }
        if (typeof this.METHODS[stepIndex].validation != 'undefined') {
            return this.METHODS[stepIndex].validation.apply(this.api);
        }
        return true;
    },
    getPreviewTemplate: function () {
        var html = '';
        if (this.METHODS != '') {
            for (var i in this.METHODS) {
                if (typeof this.METHODS[i].preview.apply(this.api) != 'undefined') {
                    html += this.METHODS[i].preview.apply(this.api);
                }
            }
        }
        return html;
    },
    addUrlEvent: function () {
        var loc = window.location;
        var hrefId = function (url, name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var param = url.match(reg);
            if (param != null) return unescape(param[2]);
            return false;
        };
        var tid = hrefId(loc.search.substr(1), 'tid');
        if (!tid) {
            loc.href = '?tid=0';
            trustId = 0;
        } else {
            trustId = tid;
        }
    }
};
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

function getOptionsSource(categoryCode) {
    if (OptionSource != null) {
        var items = $.grep(OptionSource, function (item) {
            return item.CategoryCode == categoryCode;
        });
        return items;
    }
    else {
        return null;
    }

}
function getIdList(categoryCode) {
    if (idList != null) {
        var items = $.grep(idList, function (item) {
            return item.CategoryCode == categoryCode;
        });
        return items;
    }
    else {
        return null;
    }
}
