
function getLangvtaf() {

    var webStorage = require('gs/webStorage');
    var langtli = {};
    var userLanguage = webStorage.getItem('userLanguage');


    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langtli.finished = 'Finished';
        


    } else {
        langtli.finished = '完成';


    }


    return langtli;



}



var TrustMngmtRegxCollection = {
    //int: /^[-]{0,1}[1-9]{1,}[0-9]{0,}$/,
    int: /^[-]?[1-9]+\d*$|^0$/,
    //decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$/,
    decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?$/,
    date: /^(\d{4})-(\d{2})-(\d{2})$/,
    datetime: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
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

    // Remote ajax 验证
    if (dataType === 'remote') {
        if ($this.data('remote-valid') === 'error') {
            $this.addClass('red-border');
            return false;
        } else {
            $this.removeClass('red-border');
        }
    }

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


define(function (require) {

    var $ = require('jquery');
    var ui = require('jquery-ui');
    var GlobalVariable = require('globalVariable');
    var wcfProxy = require('app/productManage/Scripts/wcfProxy');
    var wcfDataServices = new wcfProxy();
    var common = require('common');
    require('asyncbox');
    var ActLogs = require('insertActlogs');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = RoleOperate.cookieName();
    //var webStorage = require('gs/webStorage');
    //var trustId = webStorage.getItem('tid');
    var ip;
    $.ajax({
        cache: false,
        type: "GET",
        async: false,
        url: GlobalVariable.DataProcessServiceUrl + 'getIP',
        dataType: "json",
        contentType: "application/xml;charset=utf-8",
        data: {},
        success: function (response) {
            if (typeof response === 'string') {
                ip = response;
            }
        },
        error: function () {
            alert: '网络连接异常'
        }
    });
    require('calendar');

    var TrustInfo, OptionSource;
    // 解决trustCode重复问题，原有的创建专项计划，基于变量trustId=0, 所以新增newTrustId 用于存储第一步生成的trustId；后续用于保存操作和区分trustCode是否存在
    var newTrustId;
    // json data

    function viewTrustWizard() {
    }



    var config = {
        tmsDataProcessBase: GlobalVariable.DataProcessServiceUrl,
        tmsSessionServiceBase: GlobalVariable.TrustManagementServiceUrl,
        $title: $('#step-title'),
        $prev: $('#prev-step'),
        $next: $('#next-step'),
        $stepBox: $(".step-box ul>li"),
        $preview: $('#preview')
    };

    // 存续期管理全局对象
    viewTrustWizard.prototype = {
        stepId: 0,
        ISOPEN: false,
        isShowRemove: false,
        METHODS: [],
        sideNavSwitchVerify: [],
        LoadCount: 0, //从WCF获取数据用到方法getTrustInfoByTrustId，getAllCodeDictionary.返回一个+1，等全部返回后=2时，绑定再数据

        init: function () {
            var self = this
    
            self.addUrlEvent();
            self.getTrustInfoByTrustId();
            self.getAllCodeDictionary();
            config.$next.click(function () {
                TrustAttatchedFileModel.UploadNewFiles();
                var description = "专项计划：" + trustId + "，在产品维护向导功能下，对基础信息进行了更新操作"
                var category = "产品管理";
                ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                //self.api.alertMsg('保存成功!');
            });

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
            getCategoryData: function (name) {
                if (!TrustInfo || !name) return false;
                return TrustInfo[name] || [];
            },
            // 日期选择器
            //datePlugins: function () {
            //    $('.date-plugins').date_input();
            //},
            template: '{"Category":"{0}","SPId":"{1}","SPCode":"{2}","SPRItemCode":"{3}","TBId":"{4}","ItemId":"{5}","ItemCode":"{6}","ItemValue":"{7}"},',
            getTemplate: function (Category, SPId, SPCode, SPRItemCode, TBId, ItemId, ItemCode, ItemValue, DataType, UnitOfMeasure, Precise) {
                return { "Category": Category, "SPId": SPId, "SPCode": SPCode, "SPRItemCode": SPRItemCode, "TBId": TBId, "ItemId": ItemId, "ItemCode": ItemCode, "ItemValue": ItemValue, "DataType": DataType, "UnitOfMeasure": UnitOfMeasure, "Precise": Precise };
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

        registerMethods: function (obj) {
            if (typeof obj == 'object') this.METHODS.push(obj);
        },


        render: function (step) {
            var lang = getLangvtaf();
            var title = config.$stepBox.eq(step).find('.step-title');
            //(step > 0) ? config.$prev.show() : config.$prev.hide();
            //(step == config.$stepBox.length - 1) ? config.$preview.show() : config.$preview.hide();
            config.$title.find('.title').text(title.text());
            config.$next.html((step < config.$stepBox.length - 1) ? '下一步<i class="icon icon-right"></i>' : lang.finished);
            config.$stepBox.removeClass('active').eq(step).addClass("active");
            // 渲染模板
            $('#step' + step).siblings().hide().end().show();
            //触发所切换到的step的render方法
            if (this.METHODS[step] && this.METHODS[step].render)
                this.METHODS[step].render.apply(this.api);
        },

        registerEvent: function () {
            if (this.METHODS != '') {
                for (var i in this.METHODS) {
                    if (this.METHODS[i].init) {
                        this.METHODS[i].init.apply(this.api);
                    }
                }
            }
        },
      
        // 获取后端数据
        getTrustInfoByTrustId: function () {
            var self = this;
            var sContent = "{'SPName':'usp_GetTrustInfoFromWizard','Params':{" +
                            "'TrustId':'" + trustId +
                            "'}}";
            var serviceUrl = config.tmsSessionServiceBase + "GetItemsPlus?applicationDomain=TrustManagement&contextInfo=" + sContent;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "jsonp",
                crossDomain: true,
                contentType: "application/json;charset=utf-8",
                complete: function () {
                    setTimeout(function () {
                        $('#loading').fadeOut();
                    }, 500)
                },
                success: function (response) {
                    //callBack(response);
                    //TrustInfo = response;
                    self.sortingSourceData(response);
                    self.SetDataArrayByUtil(response);

                    self.LoadCount++;
                    if (self.LoadCount == 2) {
                        self.registerEvent();
                        self.render(self.stepId);
                    }
                },
                error: function (response) { alert("error:" + response); }
            });
        },

        //获取后所有Select数据
        getAllCodeDictionary: function () {
            var self = this;
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
                complete: function () {
                    setTimeout(function () {
                        $('#loading').fadeOut();
                    }, 500)
                },
                success: function (response) {
                    OptionSource = jQuery.parseJSON(response);
                    self.LoadCount++;
                    if (self.LoadCount == 2) {
                        self.registerEvent();
                        self.render(self.stepId);
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
       

        addUrlEvent: function () {
            var loc = parent.window.location;
            var hrefId = function (url, name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var param = url.match(reg);
                if (param != null) return unescape(param[2]);
                return false;
            };
            var tid = hrefId(loc.search.substr(1), 'tid');
            var sid = common.getHashValue('step');
            //var sid = '4';
            if (!tid) {
                loc.href = '?tid=0';
                trustId = 0;
            } else {
                trustId = tid;
            }
            if (!sid) { sid = 0; common.setHashValue('step', sid); }

            this.stepId = sid;
        },
        // 动态改变地址栏
        changeHash: function (step) {
            window.location.hash = '#step=' + step;
        },
    };
    
    return new viewTrustWizard();
});