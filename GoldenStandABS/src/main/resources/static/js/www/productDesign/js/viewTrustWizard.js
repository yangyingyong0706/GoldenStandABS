var TRUST,
    validControlValue,
    getWcfCommon,
    validTrustCodeRemote,
    getOptionsSource;

define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var webStore = require('gs/webStorage');
    var TrustInfo, OptionSource;
    // 解决trustCode重复问题，原有的创建专项计划，基于变量trustId=0, 所以新增newTrustId 用于存储第一步生成的trustId；后续用于保存操作和区分trustCode是否存在
    var newTrustId;
    // json data
    var config = {
        tmsDataProcessBase: GlobalVariable.DataProcessServiceUrl,
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
    TRUST = {
        stepId: 3,
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
                self.sideNavSwitchVerifyMemberAdd(self.stepId);
                var trustCode = self.getItemValueByCode('TrustItem', 'TrustCode');
                //var isRevolving = self.getItemValueByCode('TrustItem', 'IsTopUpAvailable');
                if (self.stepId == 3) {
                    //self.render(self.stepId);
                    //self.changeHash(self.stepId);
                    var svcUrl = config.tmsDataProcessBase + "CommonExecuteGet?";
                    var sessionContext = '', sessionContextArray = [];
                    //var updateArray = [];
                    //if (self.stepId == 1) {
                    //    updateArray = self.METHODS[self.stepId - 1].update.apply(self.api);
                    //}
                    //else {
                    //    updateArray = self.METHODS[0].update.apply(self.api).concat(self.METHODS[self.stepId - 1].update.apply(self.api));
                    //}

                    //日期就相当于是原来的stepId=3
                    var updateArray = self.METHODS[0].update.apply(self.api);
                    $.each(updateArray, function (i, n) {
                        if (!(n == "" || n == 'undifined' || n == null)) {
                            n.ItemValue = self.ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
                            sessionContextArray.push(self.api.getShotTemplate(n));
                        }
                    });
                    sessionContext = JSON.stringify(sessionContextArray);
                    sessionContext = "<SessionContext>{0}</SessionContext>".format(sessionContext);
                    self.saveWorkingSessionContext(sessionContext, function (sessionId) {
                        //var executeParam = {
                        //    SPName: 'usp_SaveTrustDateSet', SQLParams: [
                        //        { Name: 'WorkSessionId', value: sessionId, DBType: 'string' },
                        //        { Name: 'TrustId', value: newTrustId || trustId, DBType: 'int' }
                        //    ]
                        //};
                        //var temp = common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                        //    if (data && data.length > 0) {
                        //        newTrustId = data[0].TrustId;
                        //    }
                        //});
                        sVariableBuilder.AddVariableItem('WorkSessionId', sessionId, 'String', 0, 0, 0);
                        sVariableBuilder.AddVariableItem('TrustId', newTrustId || trustId, 'Int', 0, 0, 0);
                        sVariableBuilder.AddVariableItem('TrustCode', trustCode, 'String', 0, 0, 0);
                        //sVariableBuilder.AddVariableItem('IsRevolving', isRevolving, 'String', 0, 0, 0);
                        var sVariable = sVariableBuilder.BuildVariables();
                        var tIndicator = new taskIndicator({
                            width: 500,
                            height: 550,
                            clientName: 'TaskProcess',
                            appDomain: 'Task',
                            taskCode: 'DateInfoWizard',
                            sContext: sVariable,
                            callback: function () {
                                //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                                window.location.href = window.location.href;
                                sVariableBuilder.ClearVariableItem();
                            }
                        });
                        tIndicator.show();

                        //parent.location.href = parent.location.href;
                    });
                    self.api.alertMsg('保存成功!');
                }
            });
            //config.$next.click(function () {
            //    self.sideNavSwitchVerifyMemberAdd(self.stepId);
            //    if (self.validStepControlsBeforeLeaving(self.stepId)) {
            //        config.$stepBox.eq(self.stepId).removeClass('red-warnMsg');
            //    } else {
            //        config.$stepBox.eq(self.stepId).addClass('red-warnMsg');
            //    }
            //    var maxStep = config.$stepBox.length - 1;
            //    if (++self.stepId <= maxStep) {
            //        self.render(self.stepId);
            //        self.changeHash(self.stepId);
            //        var svcUrl = config.tmsDataProcessBase + "CommonExecuteGet?";
            //        var sessionContext = '', sessionContextArray = [];
            //        //var updateArray = [];
            //        //if (self.stepId == 1) {
            //        //    updateArray = self.METHODS[self.stepId - 1].update.apply(self.api);
            //        //}
            //        //else {
            //        //    updateArray = self.METHODS[0].update.apply(self.api).concat(self.METHODS[self.stepId - 1].update.apply(self.api));
            //        //}

            //        //日期就相当于是原来的stepId=3
            //        var updateArray = self.METHODS[2].update.apply(self.api);
            //        $.each(updateArray, function (i, n) {
            //            if (!(n == "" || n == 'undifined' || n == null)) {
            //                n.ItemValue = self.ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
            //                sessionContextArray.push(self.api.getShotTemplate(n));
            //            }
            //        });
            //        sessionContext = JSON.stringify(sessionContextArray);
            //        sessionContext = "<SessionContext>{0}</SessionContext>".format(sessionContext);
            //        self.saveWorkingSessionContext(sessionContext, function (sessionId) {
            //            console.log(sessionId);
            //            var executeParam = {
            //                SPName: 'usp_SaveTrustDateSet', SQLParams: [
            //                    { Name: 'StepId', value: self.stepId, DBType: 'int' },
            //                    { Name: 'WorkSessionId', value: sessionId, DBType: 'string' },
            //                    { Name: 'TrustId', value: newTrustId || trustId, DBType: 'int' }
            //                ]
            //            };
            //            var temp = ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
            //                if (data && data.length > 0) {
            //                    newTrustId = data[0].TrustId;
            //                }
            //            });
            //        });
            //        self.api.alertMsg('添加成功!');
            //    } else {
            //        self.stepId = maxStep;

            //        var canSubmit = true;
            //        //遍历验证所有步骤
            //        for (var i = 0; i <= maxStep; i++) {
            //            self.sideNavSwitchVerifyMemberAdd(i);
            //            if (self.validStepControlsBeforeLeaving(i)) {
            //                config.$stepBox.eq(i).removeClass('red-warnMsg');
            //            } else {
            //                config.$stepBox.eq(i).addClass('red-warnMsg');
            //                canSubmit = false;
            //            }
            //        }
            //        if (!canSubmit) { alert('页面存在输入错误，无法提交！'); return; }
            //        // 上传数据
            //        self.updateTrustData();
            //    }
            //});
            //config.$prev.click(function () {
            //    (--self.stepId >= 0) ? self.render(self.stepId) : self.stepId = 0;
            //    self.changeHash(self.stepId);
            //});
            //config.$stepBox.click(function () {
            //    if (self.sideNavSwitchVerify.indexOf(self.stepId) >= 0) {
            //        if (self.validStepControlsBeforeLeaving(self.stepId)) {
            //            config.$stepBox.eq(self.stepId).removeClass('red-warnMsg');
            //        } else {
            //            config.$stepBox.eq(self.stepId).addClass('red-warnMsg');
            //        }
            //    }
            //    self.stepId = $(this).index();
            //    self.changeHash(self.stepId);
            //    self.render(self.stepId);
            //});
            //config.$preview.click(function () {
            //    var html = self.getPreviewTemplate();
            //    self.previewTrustData(html);
            //});
            self.RemoveColButtomSHEvent();
            self.RemoveColButtomSH(self.isShowRemove);
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
            datePlugins: function () {
                $('.date-plugins').date_input();
            },
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
        sideNavSwitchVerifyMemberAdd: function (sId) {

            if (this.sideNavSwitchVerify.indexOf(sId) < 0) {
                this.sideNavSwitchVerify.push(sId);
            }
        },
        registerMethods: function (obj) {
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
        RemoveColButtomSH: function (show) {
            var sytles = document.CSSStyleSheet ? document.CSSStyleSheet : document.styleSheets;
            $.each(sytles, function (i, sheet) {
                if (sheet && sheet.href) {
                    if (sheet.href.indexOf("trustWizard.css") > -1) {
                        var rs = sheet.cssRules ? sheet.cssRules : sheet.rules;
                        $.each(rs, function (j, cssRule) {
                            if (cssRule.selectorText && cssRule.selectorText.indexOf(".btn") > -1 && cssRule.selectorText.indexOf(".btn-remove") > -1) {
                                if (show == true) {
                                    cssRule.style.display = "inline-block";
                                } else {
                                    cssRule.style.display = "none";
                                }
                                return false;
                            }
                        });
                        return false;
                    }
                }
                else { return false; }
            });
        },
        render: function (step) {
            var title = config.$stepBox.eq(step).find('.step-title');
            (step > 0) ? config.$prev.show() : config.$prev.hide();
            (step == config.$stepBox.length - 1) ? config.$preview.show() : config.$preview.hide();
            config.$title.find('.title').text(title.text());
            config.$next.html((step < config.$stepBox.length - 1) ? '下一步<i class="icon icon-right"></i>' : '完成');
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
        //保存信息到working.SessionContext中
        saveWorkingSessionContext: function (sessionContext, callback) {
            var serviceUrl = config.tmsDataProcessBase + "SaveWorkingSessionContextPlus";

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
        // 获取后端数据
        getTrustInfoByTrustId: function () {
            var self = this;
            var sContent = "{'SPName':'usp_GetTrustInfoFromWizard','Params':{" +
                            "'TrustId':'" + trustId +
                            "'}}";
            //TODO YANGYINGYONG 需要的unicode转码信息
            sContent=encodeURIComponent(sContent);
            var serviceUrl = config.tmsSessionServiceBase + "GetItemsPlus?applicationDomain=TrustManagement&contextInfo=" + sContent;
            $.ajax({
                type: "GET",
                url: serviceUrl,
                dataType: "jsonp",
                crossDomain: true,
                contentType: "application/json;charset=utf-8",
                beforeSend: function () {
                    $('#loading').fadeOut();
                },
                success: function (response) {
                    //callBack(response);
                    //TrustInfo = response;
                    self.sortingSourceData(response);
                    self.SetDataArrayByUtil(response);

                    self.LoadCount++;
                    if (self.LoadCount == 2) {
                        self.registerEvent();
                        //self.render(self.stepId);
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
                //async: (false),
                beforeSend: function () {
                    $('#loading').fadeOut();
                },
                success: function (response) {
                    OptionSource = jQuery.parseJSON(response);
                    self.LoadCount++;
                    if (self.LoadCount == 2) {
                        self.registerEvent();
                        //self.render(self.stepId);
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
        // 预览数据
        previewTrustData: function (html) {
            var $page = $('.page'),
                $topbar = $('.topbar'),
                $print = $('<div class="print am-scale-up">'),
                $content = $('<div class="form">' + html + '</div>'),
                $signature = $('<div class="sign">' +
                                    '<p><label>团队负责人：</label><input type="text" class="full"/></p>' +
                                    '<p><label>项目负责人：</label><input type="text" class="full"/></p>' +
                                    '<p><input type="text" class="date"/><label>年</label><input type="text" class="date"/><label>月</label><input type="text" class="date"/><label>日</label></p>' +
                                '</div>'),
                $button = $('<div class="form-button">' +
                                '<button type="btn" data-dismiss="primary" class="btn btn-default">取消预览</button>' +
                                '<button type="btn" data-dismiss="print" class="btn btn-primary">打印</button>' +
                            '</div>');
            $content.appendTo($print);
            $signature.appendTo($print);
            $button.appendTo($print);
            $page.hide();
            $topbar.hide();
            document.body.style.backgroundColor = "#ddd";
            $(document.body).append($print);
            $('[data-dismiss=primary]').click(function () {
                $print.remove();
                $page.show();
                $topbar.show();
                document.body.style.backgroundColor = "#fff";
            });
            $('[data-dismiss=print]').click(function () {
                window.print();
            });
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
            //var sid = common.getHashValue('step');
            if (!tid) {
                loc.href = '?tid=0';
                trustId = 0;
            } else {
                trustId = tid;
            }
            //if (!sid) { sid = 0; common.setHashValue('step', sid); }

            //this.stepId = sid;
        },
        // 动态改变地址栏
        changeHash: function (step) {
            window.location.hash = '#step=' + step;
        },

        //点击完成事件
        popupTaskProcessIndicator: function (sessionId) {
            //alert("点击完成");
            var trustCode = TrustItemModule.getItemValuebyItemCode('TrustCode');
            var isRevolving = TrustItemModule.getItemValueByCode("IsTopUpAvailable") == true ? "1" : "0";


            var wProxy = new webProxy();
            var sContext = {
                appDomain: "Task",
                sessionVariables: "<SessionVariables>"
                    + "<SessionVariable><Name>WorkSessionId</Name><Value>" + sessionId + "</Value><DataType>UniqueIdentifier</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>TrustCode</Name><Value>" + trustCode + "</Value><DataType>NVarChar</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "<SessionVariable><Name>IsRevolving</Name><Value>" + isRevolving + "</Value><DataType>NVarChar</DataType><IsConstant>0</IsConstant><IsKey>0</IsKey><KeyIndex>0</KeyIndex></SessionVariable>"
                    + "</SessionVariables>",
                taskCode: "TrustWizard"
            };

            wProxy.createSessionByTaskCode(sContext, function (response) {
                isSessionCreated = true;
                sessionID = response;
                taskCode = "TrustWizard";
                IndicatorAppDomain = "Task";
                console.log("response:" + response);
                if (IsSilverlightInitialized) {
                    PopupTaskProcessIndicatorTM();
                    InitParams();
                }
                else {
                    PopupTaskProcessIndicatorTM();
                }
            });
            //alert(sessionId);
        },

        //在TrustInfo[name]中根据itemcode获取itemvalue
        getItemValueByCode: function (name, itemcode) {
            var itemvalue = "";
            if (TrustInfo && name && TrustInfo[name]) {
                TrustInfo[name].map(function (item, index, arr) {
                    if (item.ItemCode == itemcode) {
                        itemvalue = item.ItemValue;
                        return itemvalue;
                    }
                });//index是元素的索引，item是该元素
            }
            return itemvalue;
        },

        //刷新现金流模型
        refreshCashflowModel: function () {
            var trustCode = TRUST.getItemValueByCode('TrustItem', 'TrustCode');
            var isRevolving = TRUST.getItemValueByCode('TrustItem', 'IsTopUpAvailable');

            var Exchangeinfo = TRUST.getItemValueByCode('TrustInfoExtensionItem', 'ExchangeCenter');

            sVariableBuilder.AddVariableItem('TrustCode', trustCode, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('IsRevolving', isRevolving, 'String', 0, 0, 0);

            var schedulePurposeKey = trustId + '_SchedulePurpose';
            var scheduleDateIdKey = trustId + '_ScheduleDateId';
            var schedulePurpose = webStore.getItem(schedulePurposeKey);
            var scheduleDateId = webStore.getItem(scheduleDateIdKey);

            sVariableBuilder.AddVariableItem('SchedulePurpose', schedulePurpose, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ScheduleDateId', scheduleDateId, 'String', 0, 0, 0);

            if (Exchangeinfo == 'ShangHaiExchangeCenter' || Exchangeinfo == 'ShenZhenExchangeCenter') {
                sVariableBuilder.AddVariableItem('ModelXmlPath', 'E:\\TSSWCFServices\\TrustManagementService\\UITaskStudio\\Models\\' + Exchangeinfo + '\\', 'String', 0, 0, 0);
            } else {
                Exchangeinfo = 'InterBankMarket';
                sVariableBuilder.AddVariableItem('ModelXmlPath', 'E:\\TSSWCFServices\\TrustManagementService\\UITaskStudio\\Models\\' + Exchangeinfo + '\\', 'String', 0, 0, 0);
            }

            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'ABSTrustWizard',
                sContext: sVariable,
                callback: function () {
                    //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                    window.location.href = window.location.href;
                    sVariableBuilder.ClearVariableItem();
                }
            });
            tIndicator.show();
        }
    };
    var TrustMngmtRegxCollection = {
        //int: /^[-]{0,1}[1-9]{1,}[0-9]{0,}$/,
        int: /^[-]?[1-9]+\d*$|^0$/,
        //decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$/,
        decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?$/,
        date: /^(\d{4})-(\d{2})-(\d{2})$/,
        datetime: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
    };
    validControlValue = function validControlValue(obj) {
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

    getWcfCommon = function getWcfCommon(param, async) {
        var serviceUrl = config.tmsDataProcessBase + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" + JSON.stringify(param);
        return $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            async: (async === null ? true : false),
            crossDomain: true,
            contentType: "application/json;charset=utf-8"
        });
    }

    validTrustCodeRemote = function validTrustCodeRemote(obj) {
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

    getOptionsSource = function getOptionsSource(categoryCode) {
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

});