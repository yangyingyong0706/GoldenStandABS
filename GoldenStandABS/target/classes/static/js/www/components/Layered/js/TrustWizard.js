define(function (require) {
    //var common = require('gs/uiFrame/js/common');
    require('date_input');
    var $ = require('jquery');
    var anydialog = require('anyDialog');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    var common = require('common');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    ko.mapping = mapping;
    require('asyncbox');
    var number = require('app/productManage/TrustManagement/Common/Scripts/format.number');
    var gsUtil = require('gsUtil');
    var GlobalVariable = require('globalVariable');
    var WcfProxy = require('app/productManage/Scripts/wcfProxy');
    require('knockout.validation.min');
    var toast = require('toast');
    var ActLogs = require('insertActlogs');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = RoleOperate.cookieName();
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

    var TrustWizard = function () {
                var trustId;
                var TrustInfo, OptionSource;
                // 解决trustCode重复问题，原有的创建专项计划，基于变量trustId=0, 所以新增newTrustId 用于存储第一步生成的trustId；后续用于保存操作和区分trustCode是否存在
                var newTrustId;
                var uriHostInfo = location.protocol + "//" + location.host;
                var config = {
                    tmsDataProcessBase:GlobalVariable.DataProcessServiceUrl,
                    tmsSessionServiceBase: GlobalVariable.TrustManagementServiceUrl,
                    $title: $('#step-title'),
                    $prev: $('#prev-step'),
                    $next: $('#next-step'),
                    $stepBox: $(".step-box ul>li"),
                    $preview: $('#preview')
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
                var TRUST = {
                stepId: 0,
                stepCode: 'layer',
                ISOPEN: false,
                isShowRemove: false,
                METHODS: [],
                sideNavSwitchVerify: [],
                LoadCount: 0, //从WCF获取数据用到方法getTrustInfoByTrustId，getAllCodeDictionary.返回一个+1，等全部返回后=2时，绑定再数据
                init: function () {
                    var self = this;
                    self.addUrlEvent();
                    self.getTrustInfoByTrustId();
                    self.getAllCodeDictionary();
                    var inputObj = $("#OfferAmount"),
                        tipDivObj = $("#field1"),
                        tipObj = $("#fieldtip");
                    common.tipCHNum(inputObj, tipObj, tipDivObj);
                    //分层新的存储过程
                    config.$next.click(function () {
                        //if ($("#result>tr").length < 1) {
                        //    alert("请先向表格里添加数据！")
                        //} else {
                        $(".ant-drawer-mask").addClass("open");
                        $(".ant-drawer-mask").css("width", $("body").width() + "px");
                            var svcUrl = config.tmsDataProcessBase + "CommonExecuteGet?";
                            var sessionContext = '', sessionContextArray = [];
                            var updateArray = self.METHODS[0].update.apply(self.api);
                            if (updateArray!=""){
                                $.each(updateArray, function (i, n) {
                                    if (!(n == "" || n == 'undifined' || n == null)) {
                                        n.ItemValue = self.ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
                                        sessionContextArray.push(self.api.CommongetShotTemplate(n));
                                    }
                                });
                            }
                            sessionContext = JSON.stringify(sessionContextArray);
                            //保存的数据
                            sessionContext = "<SessionContext>{0}</SessionContext>".format(sessionContext);
                            self.saveWorkingSessionContext(sessionContext, function (sessionId) {
                                var executeParam = {
                                    SPName: 'usp_SaveTrustInfoLayered', SQLParams: [
                                        { Name: 'StepId', value: self.stepId, DBType: 'int' },
                                        { Name: 'WorkSessionId', value: sessionId, DBType: 'string' },
                                        { Name: 'TrustId', value: newTrustId || trustId, DBType: 'int' }
                                    ]
                                };
                                var temp = common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                                    if (data[1][0].result=="1") {
                                        newTrustId = data[0].TrustId;
                                        var description = "专项计划：" + (newTrustId || trustId) + "，在产品维护向导功能下，对分层信息进行了更新操作";
                                        var category = "产品管理";
                                        ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                                        $(".ant-drawer-mask").removeClass("open");
                                        $("#closebox").trigger("click");
                                        $.toast({ type: 'success', message: '保存成功!' });
                                        //self.api.alertMsg('保存成功!');
                                    } else {
                                        $(".ant-drawer-mask").removeClass("open");
                                        self.api.alerterror('保存失败!');
                                    }

                                });
                            });
                        //}
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
                    alerterror:function(text){
                        var alert_tip = $('#alert-tip');
                        if (!alert_tip[0]) {
                            var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
                            var $temp = $('<div class="alert_content">' +
                                            '<i class="icon icon-cancel am-flip"></i>' +
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
                    datePlugins: function () {
                        $('.date-plugins').date_input();
                    },
                    template: '{"Category":"{0}","SPId":"{1}","SPCode":"{2}","SPRItemCode":"{3}","TBId":"{4}","ItemId":"{5}","ItemCode":"{6}","ItemValue":"{7}"},',
                    getTemplate: function (Category, SPId, SPCode, SPRItemCode, TBId, ItemId, ItemCode, ItemValue, DataType, UnitOfMeasure, Precise) {
                        return { "Category": Category, "SPId": SPId, "SPCode": SPCode, "SPRItemCode": SPRItemCode, "TBId": TBId, "ItemId": ItemId, "ItemCode": ItemCode, "ItemValue": ItemValue, "DataType": DataType, "UnitOfMeasure": UnitOfMeasure, "Precise": Precise };
                    },
                    CommongetShotTemplate: function (arr) {
                        if (arr.ItemCode == 'OfferAmount') {
                            return { "Category": arr.Category, "SPId": arr.SPId, "SPCode": arr.SPCode, "SPRItemCode": arr.SPRItemCode, "TBId": arr.TBId, "ItemId": arr.ItemId, "ItemCode": arr.ItemCode, "ItemValue": arr.ItemValue.replace(/,/g, '') };
                        }
                        else {
                            return { "Category": arr.Category, "SPId": arr.SPId, "SPCode": arr.SPCode, "SPRItemCode": arr.SPRItemCode, "TBId": arr.TBId, "ItemId": arr.ItemId, "ItemCode": arr.ItemCode, "ItemValue": arr.ItemValue };
                        }
                    },

                    getShotTemplate: function (arr) {
                        return { "Category": arr.Category, "SPId": arr.SPId, "SPCode": arr.SPCode, "SPRItemCode": arr.SPRItemCode, "TBId": arr.TBId, "ItemId": arr.ItemId, "ItemCode": arr.ItemCode, "ItemValue": arr.ItemValue.replace(/,/g,'') };
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
                    //console.log(obj);
                    if (typeof obj == 'object') this.METHODS.push(obj);
                },
                RemoveColButtomSHEvent: function () {
                    var self = this;
                    $("#RemoveColButtomSH").click(function () {
                        var $this = $(this);
                        self.isShowRemove = !self.isShowRemove;
                        if (self.isShowRemove == true)
                            $this.text("隐藏删除按钮");
                        else
                            $this.text("显示删除按钮");
                        self.RemoveColButtomSH(self.isShowRemove);
                    });
                },
                render: function (step) {
                    var title = config.$stepBox.eq(step).find('.step-title');
                    (step > 0) ? config.$prev.show() : config.$prev.hide();
                    (step == config.$stepBox.length - 1) ? config.$preview.show() : config.$preview.hide();
                    config.$title.find('.title').text(title.text());
                    config.$next.html((step < config.$stepBox.length - 1) ? '下一步<i class="icon icon-right"></i>' : '完成');
                    config.$stepBox.removeClass('active').eq(step).addClass("active");
                    //渲染模板
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
                //保存信息到working.SessionContext中
                saveWorkingSessionContext: function (sessionContext, callback) {
                    var serviceUrl = config.tmsDataProcessBase + "SaveWorkingSessionContextPlus";
                    console.log(serviceUrl);
                    $.ajax({
                        type: "POST",
                        url: serviceUrl,
                        dataType: "json",
                        contentType: "application/xml;charset=utf-8",
                        data: sessionContext,
                        success: function (response) {
                            callback(response);
                        },
                        error: function (response) { alert("error is :" + response); }
                    });
                },
                //获取后所有Select数据
                getAllCodeDictionary: function () {
                    var self = this;
                    
                  //TODO YANGYINGYONG
                    var sContent = "{'SPName':'usp_GetAllCodeDictionary','Params':{" +
                             "'AliasSetName':'zh-CN'" +
                             "}}";
				     //TODO YANGYINGYONG 需要的unicode转码信息
				     sContent=encodeURIComponent(sContent);
                    
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
                        	//TODO YANGYINGYONG
//                            OptionSource = jQuery.parseJSON(response);
                        	OptionSource = response;
                            self.LoadCount++;
                            if (self.LoadCount == 2) {
                                self.registerEvent();
                                self.render(self.stepId);
                            }
                        },
                        error: function (response) {
                            alert("error:" + response);
                            $('#loading').fadeOut();
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
                // 更新数据
                updateTrustData: function () {
                    var sessionContext = '', sessionContextArray = [], tmpArray = [];
                    if (this.METHODS != '') {
                        for (var i in this.METHODS) {
                            if (this.METHODS[i] && typeof this.METHODS[i].update != 'undefined') {
                                var updatearray = this.METHODS[i].update.apply(this.api);
                                if (typeof updatearray != 'undefined') {
                                    //sessionContext += this.METHODS[i].update.apply(this.api);
                                    $.each(updatearray, function (i, n) {
                                        tmpArray.push(n);
                                    });
                                }
                            }
                        }
                    }

                    //sessionContext = sessionContext.substr(0, sessionContext.length - 1);

                    var self = this;
                    ////根据单位和精度转换为存储所需
                    $.each(tmpArray, function (i, n) {
                        n.ItemValue = self.ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
                        sessionContextArray.push(self.api.getShotTemplate(n));
                    });

                    sessionContext = JSON.stringify(sessionContextArray);

                    sessionContext = "<SessionContext>{0}</SessionContext>".format(sessionContext);
                    this.saveWorkingSessionContext(sessionContext, this.popupTaskProcessIndicator);
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
                    for (var i in this.METHODS) {
                        if (i == 0) {
                            if (this.METHODS[i] && typeof this.METHODS[i].preview != 'undefined') {
                                html += this.METHODS[i].preview.apply(this.api);
                            }
                        }
                        if (i == 1) {
                            if (this.METHODS[i] && typeof this.METHODS[i].preview != 'undefined') {
                                html += this.METHODS[i].preview.apply(this.api);
                            }
                        }
                    }
                    return html;
                },
                addUrlEvent: function () {
                    var loc = window.location;
                    //debugger
                    var hrefId = function (url, name) {
                        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                        var param = url.match(reg);
                        if (param != null) return unescape(param[2]);
                        return false;
                    };
                    var tid = hrefId(loc.search.substr(1), 'id') || hrefId(loc.search.substr(1), 'tid');
                    var sid = common.getHashValue('step');
                    if (!tid) {
                        loc.href = '?id=0';
                        trustId = 0;
                    } else {
                        trustId = tid;
                    }

                    if (!sid) { sid = 0; common.setHashValue('step', sid); }
                    this.stepId = sid;
                },
                // 获取后端数据
                getTrustInfoByTrustId: function () {
                    var self = this;
                    // trustId= common.getQueryString("id");
                    //TODO YANGYINGYONG
                    var sContent = "{'SPName':'usp_GetTrustInfoFromWizard','Params':{" +
                                    "'TrustId':'" + trustId+
                                    "'}}";
                     //var sContent = "";
                     //TODO YANGYINGYONG 需要的unicode转码信息
                     sContent=encodeURIComponent(sContent);
                    var serviceUrl = config.tmsSessionServiceBase + "GetItemsPlus?applicationDomain=TrustManagement&contextInfo=" + sContent;
                    //console.log(serviceUrl);
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
                            self.sortingSourceData(response);
                            self.SetDataArrayByUtil(response);
                            self.LoadCount++;
                            if (self.LoadCount == 2) {
                                self.registerEvent();
                                self.render(self.stepId);
                            }
                        },
                        error: function (response) { alert("error:" + response); $('#loading').fadeOut(); }
                    });
                },
                // 动态改变地址栏
                changeHash: function (step) {
                    window.location.hash = '#step=' + step;
                },
            };
            var TrustMngmtRegxCollection = {
                //int: /^[-]{0,1}[1-9]{1,}[0-9]{0,}$/,
                word:/^\w+$/,
                int: /^[-]?[1-9]+\d*$|^0$/,
                //decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$/,
                decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?$/,
                date: /^(\d{4})-(\d{2})-(\d{2})$/,
                datetime: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
            };
            function validControlValue(obj) {
                var $this = $(obj);
                var objValue = $this.val().replace(/,/g,"");
                var id = $this.parent().attr("id");
                console.log(id)
                var regOne=new RegExp("[^-_|0-9|A-Za-z]");
                var regTwo = new RegExp("[^0-9|.]")
                var regThree = new RegExp("[^0-9]")
                //编码验证
                switch (id) {
                    case "SecurityExchangeCode":
                        if (regOne.test(objValue)) {
                            $this.val("请输入合法的证券代码")
                            objValue = "请输入合法的证券代码"
                        }
                        break;
                    case "CouponBasis":
                        if (regTwo.test(objValue)) {
                            $this.val("输入票面利息不合法")
                        } else if (parseFloat(objValue) > 100) {
                            $this.val("票面利息率不能超过100%")
                            objValue = "票面利息率不能超过100%"
                        }
                        break;
                    case "HoldingPercentage":
                        if (regTwo.test(objValue)) {
                            $this.val("输入比例不合法");
                            $this.addClass('red-border');
                        } else if(parseFloat(objValue) > 100){                            
                            $this.val("自持比例率不能超过100%")
                            $this.addClass('red-border');
                        } else {
                            $this.removeClass('red-border');
                        }
                        break;
                    case "InterestDays":
                        if (regThree.test(objValue)) {
                            $this.val("输入每年计息天数不合法");
                            objValue = "输入每年计息天数不合法"
                        }
                        break
                }
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
           
            function getWcfCommon(param, async) {
            	 //TODO YANGYINGYONG
//                var serviceUrl = config.tmsDataProcessBase + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" + JSON.stringify(param);
                var serviceUrl = config.tmsDataProcessBase + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" ;
                return $.ajax({
                    type: "GET",
                    url: serviceUrl,
                    dataType: "jsonp",
                    async: (async === null ? true : false),
                    crossDomain: true,
                    contentType: "application/json;charset=utf-8"
                });
            }

            function validTrustCodeRemote(obj) {
                var $this = $(obj.srcElement);
                var trustCode = $this.val();
                var tmpTrustId = (!trustId || parseInt(trustId) === 0) && newTrustId ? newTrustId : trustId;

                var trustCodeParam = {
                    "SPName": "usp_IsExistTrustCode",
                    "SQLParams": [
                        {
                            "Name": "TrustCode",
                            "value": trustCode,
                            "DBType": "string"
                        }, {
                            "Name": "TrustId",
                            "value": tmpTrustId,
                            "DBType": "int"
                        }
                    ]
                };
                $nextStep = $('#next-step');
                $nextStep.prop('disabled', 'disabled');
                getWcfCommon(trustCodeParam).done(function (response) {
                    var data = JSON.parse(response);
                    if (!data[0].IsValid) {
                        $this.addClass('red-border');
                        $this.data('remote-valid', 'error');
                        alert('产品代码: "' + trustCode + '"重复，无法进入下一步保存。');
                    } else {
                        $this.removeClass('red-border');
                        $this.data('remote-valid', 'ok');
                        $nextStep.removeProp('disabled');
                    }
                });
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
            TRUST.init();
            return {
                TRUST: TRUST,
                config:config,
                OptionSource:OptionSource,
                getOptionsSource: getOptionsSource,
                validTrustCodeRemote: validTrustCodeRemote,
                getWcfCommon: getWcfCommon,
                validControlValue: validControlValue,
                TrustMngmtRegxCollection: TrustMngmtRegxCollection,
            }
    };

    return TrustWizard();
})