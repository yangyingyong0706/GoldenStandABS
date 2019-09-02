
var TrustMngmtRegxCollection = {
    //int: /^[-]{0,1}[1-9]{1,}[0-9]{0,}$/,
    int: /^[-]?[1-9]+\d*$|^0$/,
    //decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$/,
    decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?$/,
    date: /^(\d{4})-(\d{2})-(\d{2})$/,
    datetime: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
};
define(function (require) {
    var $ = require('jquery');
    var ui = require('jquery-ui');
    var GlobalVariable = require('globalVariable');
    var wcfProxy = require('app/productManage/Scripts/wcfProxy');
    var wcfDataServices = new wcfProxy();
    var common = require('common');
    var GSDialog = require('gsAdminPages');
    var ActLogs = require('insertActlogs');
    var AnotherEntry = common.getQueryStringSpecial('AnotherEntry');
    var webProxy = require('gs/webProxy');
    require('asyncbox');
    require('date_input');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var userName = '';
    var TrustInfo, OptionSource, OrganisationSrc;
    var webStorage = require('gs/webStorage');
    var langtx = {};
    var userLanguage = webStorage.getItem('userLanguage');
    var toast = require('toast');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langtx.info1 = 'Is it sure to add a product!';
        langtx.info2 = 'Special program code can not contain Chinese characters!';
    } else {
        langtx.info1 = '是否确定添加产品！';
        langtx.info2 = '专项计划代码不能含有汉字！';
    }
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
    function getLangvtw() {

        var langtli = {};
        var userLanguage = webStorage.getItem('userLanguage');


        if (userLanguage && userLanguage.indexOf('en') > -1) {
            langtli.HideDeleteButton = 'Hide Delete Button';
            langtli.ShowDeleteButton = 'Show Delete Button';
            if (AnotherEntry == '1') {
                langtli.Next = 'Submission';
            } else {
                langtli.Next = 'Next';
            }
          


        } else {
            langtli.HideDeleteButton = '隐藏删除按钮';
            langtli.ShowDeleteButton = '显示删除按钮';
            if (AnotherEntry == '1') {
                langtli.Next = '提交';
            } else {
                langtli.Next = '下一步';
            }


        }


        return langtli;



    }
    function getWcfCommon(param) {
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" + encodeURIComponent(JSON.stringify(param));
        return $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "jsonp",
            crossDomain: true,
            contentType: "application/json;charset=utf-8"
        });
    }
    function viewTrustWizard() {
        this.validControlValue = function (obj) {
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
    }
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
    var newTrustId;
    viewTrustWizard.prototype = {
        stepId: 0,
        ISOPEN: false,
        isShowRemove: false,
        METHODS: [],
        sideNavSwitchVerify: [],
        LoadCount: 0, //从WCF获取数据用到方法getTrustInfoByTrustId，getAllCodeDictionary,getCodeDictionary.返回一个+1，等全部返回后=3时，绑定再数据
        init: function () {
            var self = this;
            self.addUrlEvent();
            self.getTrustInfoByTrustId();
            self.getAllCodeDictionary();
            self.getCodeDictionary();
            self.switchClick = true;
            if (self.switchClick) {
                config.$next.click(function () {
                    self.switchClick = false;
                    if (trustId == 0) {
                        if (self.validStepControlsBeforeLeaving(self.stepId)) {
                            GSDialog.HintWindowTF(langtx.info1, function () {
                                config.$stepBox.eq(self.stepId).removeClass('red-warnMsg');
                                var svcUrl = config.tmsDataProcessBase + "CommonExecuteGet?";
                                var sessionContext = '', sessionContextArray = [];
                                var updateArray = self.METHODS[0].update.apply(self.api);
                                //
                                var IsTopUp = $('input[type=checkbox]:checked').length;
                                updateArray[3].ItemValue = IsTopUp;    //更新循环判断
                                var temptcode = updateArray[0].ItemValue
                                if (/.*[\u4e00-\u9fa5]+.*$/.test(temptcode)) // \u 表示unicode
                                {
                                    $('#loading').hide();
                                    GSDialog.HintWindow(langtx.info2);
                                    return false;
                                }
                                /////
                                $.each(updateArray, function (i, n) {
                                    if (!(n == "" || n == 'undifined' || n == null)) {
                                        n.ItemValue = self.ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
                                        var roleOperate = require('app/productManage/TrustManagement/Common/Scripts/roleOperate');
                                        //获取userName
                                        userName = roleOperate.cookieName();
                                        sessionContextArray.push(self.api.getShotTemplate(n));
                                    }
                                });
                                sessionContext = JSON.stringify(sessionContextArray);

                                sessionContext = "<SessionContext>{0}</SessionContext>".format(sessionContext);

                                self.saveWorkingSessionContext(sessionContext, function (sessionId) {
                                    var executeParam = {
                                        SPName: 'usp_SaveTrustInfoByStep1', SQLParams: [
                                            { Name: 'StepId', value: self.stepId, DBType: 'int' },
                                            { Name: 'WorkSessionId', value: sessionId, DBType: 'string' },
                                            { Name: 'userName', value: userName, DBType: 'string' },
                                            { Name: 'TrustId', value: trustId, DBType: 'int' }
                                        ]
                                    };
                                    var temp = common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                                        if (data && data.length > 0) {
                                            //保存完产品信息后返回新的TrustId
                                            newTrustId = data[0].TrustId;
                                            if (newTrustId != 0) {
                                                //无刷新改变URL的参数
                                                var description = "专项计划：" + newTrustId + "，在新建产品向导功能下，新增了一个产品向导";
                                                var category = "产品管理";
                                                ActLogs.insertActlogs(false, userName, '新增', category, description, ip, '', '');
                                                parent.window.history.pushState({}, 0, webProxy.baseUrl + "/GoldenStandABS/www/productManage/TrustManagement/NewProduct/viewTrust_New.html?tid=" + newTrustId);
                                                var mainContentDisplayer = $("#mainContentDisplayer_0");
                                                //动态改变Iframe里的URl
                                                mainContentDisplayer.context.location.href = webProxy.baseUrl + "/GoldenStandABS/www/productManage/TrustManagement/TrustSPRole/TrustSPRole.html?tid=" + newTrustId;
                                                //"https://abs-dit.goldenstand.cn/GoldenStandABS/www/productManage/TrustManagement/TrustSPRole/TrustSPRole.html?tid=" + newTrustId;
                                                //取得top里的stepList
                                                var stepList = top.stepList;
                                                $(stepList[1]).addClass("active").siblings().removeClass("active");
                                                self.api.alertMsg('添加成功!请稍后...');
                                            } else {
                                                $.toast({ type: 'warning', message: '产品代码为空' });
                                                //GSDialog.HintWindow("产品代码为空")
                                            }
                                        }
                                    });

                                });
                            })
                        } else {
                            config.$stepBox.eq(self.stepId).addClass('red-warnMsg');
                        }

                    } else {
                        //校验
                        if (self.validStepControlsBeforeLeaving(self.stepId)) {
                            GSDialog.HintWindowTF("是否确定更新产品信息！", function () {
                                 
                                //Disable the button，prevent duplicate submit.
                                config.$next.text('提交中...').prop("disabled", true);

                                config.$stepBox.eq(self.stepId).removeClass('red-warnMsg');
                                var svcUrl = config.tmsDataProcessBase + "CommonExecuteGet?";
                                var sessionContext = '', sessionContextArray = [];
                                var updateArray = self.METHODS[0].update.apply(self.api);
                                var IsTopUp = $('input[type=checkbox]:checked').length;//更新循环判断
                                updateArray[3].ItemValue = IsTopUp;
                                $.each(updateArray, function (i, n) {
                                    if (!(n == "" || n == 'undifined' || n == null)) {
                                        n.ItemValue = self.ConvertDataByUtil("get", n.DataType, n.ItemValue, n.UnitOfMeasure, n.Precise);
                                        var roleOperate = require('app/productManage/TrustManagement/Common/Scripts/roleOperate');
                                        //获取userName
                                        userName = roleOperate.cookieName();
                                        sessionContextArray.push(self.api.getShotTemplate(n));
                                    }
                                });

                                sessionContext = JSON.stringify(sessionContextArray);
                                sessionContext = "<SessionContext>{0}</SessionContext>".format(sessionContext);
                                var description = "专项计划：" + trustId + "，在产品维护向导功能下，更新了基础信息中的产品信息"
                                var category = "产品管理";
                                ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                                self.saveWorkingSessionContext(sessionContext, function (sessionId) {

                                    var executeParam = {
                                        SPName: 'usp_SaveTrustInfoByStep1', SQLParams: [
                                            { Name: 'StepId', value: self.stepId, DBType: 'int' },
                                            { Name: 'WorkSessionId', value: sessionId, DBType: 'string' },
                                             { Name: 'userName', value: userName, DBType: 'string' },
                                            { Name: 'TrustId', value: trustId, DBType: 'int' }
                                        ]
                                    };

                                    var temp = common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParam, function (data) {
                                        if (data && data.length > 0 && !AnotherEntry) {
                                            var newTrustId = data[0].TrustId
                                            self.validControlValue($(".datarequired"));
                                            //保存完产品信息后返回新的TrustId
                                            var mainContentDisplayer = $("#mainContentDisplayer_0");
                                            //动态改变Iframe里的URl
                                            mainContentDisplayer.context.location.href = webProxy.baseUrl + "/GoldenStandABS/www/productManage/TrustManagement/TrustSPRole/TrustSPRole.html?tid=" + newTrustId;
                                            $('#loading').hide()
                                            var stepList = top.stepList;
                                            var stepListTustWizard = top.stepListTustWizard; 
                                            $(stepListTustWizard[1]).addClass("active").siblings().removeClass("active");
                                            if (self.stepId == 0) {
                                                if (stepList) {
                                                    $(stepList[1]).addClass("active").siblings().removeClass("active");
                                                }
                                            } else {
                                                $(stepListTustWizard[1]).addClass("active").siblings().removeClass("active");
                                            }
                                            

                                        } else if (AnotherEntry=='1') {
                                            GSDialog.HintWindow("更新成功！", function () {
                                                config.$next.text('提交').removeAttr("disabled");
                                            })
                                        }
                                    });
                                });
                            })
                        } else {
                            config.$stepBox.eq(self.stepId).addClass('red-warnMsg');
                        }

                    }

                });
            }
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
            //datePlugins: function () {
            //    $('.date-plugins').date_input();
            //},
            template: '{"Category":"{0}","SPId":"{1}","SPCode":"{2}","SPRItemCode":"{3}","TBId":"{4}","ItemId":"{5}","ItemCode":"{6}","ItemValue":"{7}"},',
            getTemplate: function (Category, SPId, SPCode, SPRItemCode, TBId, ItemId, ItemCode, ItemValue, DataType, UnitOfMeasure, Precise) {
                return { "Category": Category, "SPId": SPId, "SPCode": SPCode, "SPRItemCode": SPRItemCode, "TBId": TBId, "ItemId": ItemId, "ItemCode": ItemCode, "ItemValue": ItemValue, "DataType": DataType, "UnitOfMeasure": UnitOfMeasure, "Precise": Precise };
            },
            //getShotTemplate增加了一个userName参数
            getShotTemplate: function (arr) {
                return { "Category": arr.Category, "SPId": arr.SPId, "SPCode": arr.SPCode, "SPRItemCode": arr.SPRItemCode, "TBId": arr.TBId, "ItemId": arr.ItemId, "ItemCode": arr.ItemCode, "ItemValue": arr.ItemValue, "username": userName };
            },
            registControlsValueChange: function (objs) {
                $(objs).change(function () {
                    validControlValue($(this));
                });
            },
            validControls: function (obj) {
                var validPass = true;
                var toastPass = true;
                $(obj).each(function (index) {
                    var $this = $(this);
                    //验证产品代码、产品全称是否填写
                    if (index == 0) {
                        var objValue = $this.val();
                        if (!objValue || objValue.length < 1) {
                            $.toast({ type: 'warning', message: '请填写产品代码' });
                            toastPass = false;
                        }
                    } else if (toastPass && index == 1) {
                        var objValue = $this.val();
                        if (!objValue || objValue.length < 1) {
                            $.toast({ type: 'warning', message: '请填写产品全称' });
                        }
                    }
                    if (!validControlValue($this)) { validPass = false; }
                });
                return validPass;
            }
        },


        registerMethods: function (obj) {

            if (typeof obj == 'object') this.METHODS.push(obj);
        },

        RemoveColButtomSHEvent: function () {
            var lang = getLangvtw();
            var self = this;
            if (window.parent.location.href.indexOf("NewProduct") > 0) {
                $("#RemoveColButtomSH", window.parent.document).click(function () {
                    var $this = $(this);
                    self.isShowRemove = !self.isShowRemove;
                    if (self.isShowRemove == true)
                        $this.text(lang.HideDeleteButton);
                    else
                        $this.text(lang.ShowDeleteButton);
                    self.RemoveColButtomSH(self.isShowRemove);
                });
            } else {
                $("#RemoveColButtomSH", window.parent.parent.document).click(function () {
                    var $this = $(this);
                    self.isShowRemove = !self.isShowRemove;
                    if (self.isShowRemove == true)
                        $this.text(lang.HideDeleteButton);
                    else
                        $this.text(lang.ShowDeleteButton);
                    self.RemoveColButtomSH(self.isShowRemove);
                });
            }

        },

        RemoveColButtomSH: function (show) {
            var sytles = document.CSSStyleSheet ? document.CSSStyleSheet : document.styleSheets;
            $.each(sytles, function (i, sheet) {
                if (sheet.href.indexOf("bootstrap.min.css") > -1) {
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
            });
        },

        render: function (step) {
            var lang = getLangvtw();
            var title = config.$stepBox.eq(step).find('.step-title');
            config.$title.find('.title').text(title.text());
            //config.$next.html((step < config.$stepBox.length - 1) ? '下一步<i class="icon icon-right"></i>' : '完成');
            config.$next.html((step < config.$stepBox.length - 1) ? lang.Next + '<i class="icon icon-right"></i>' : lang.Next);
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
                async: true,
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
                    if (self.LoadCount == 3) {
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
                    if (self.LoadCount == 3) {
                        self.registerEvent();
                        self.render(self.stepId);
                    }
                },
                error: function (response) {
                    alert("error:" + response);
                }
            });

        },
        //单独获取Organisation资产来源库的内容
        getCodeDictionary: function () {
            var self = this;
            var executeParam = { SPName: 'dbo.usp_GetDimOrganisationID', SQLParams: [] };
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;
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
                    OrganisationSrc = jQuery.parseJSON(response);
                    self.LoadCount++;
                    if (self.LoadCount == 3) {
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
        validStepControlsBeforeLeaving: function (stepIndex) {
            if (!this.METHODS || this.METHODS.length < 0 || !this.METHODS[stepIndex]) { return true; }
            if (typeof this.METHODS[stepIndex].validation != 'undefined') {
                return this.METHODS[stepIndex].validation.apply(this.api);
            }
            return true;
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
            if (!tid) {
                loc.href = '?tid=0';
                trustId = 0;
            } else {
                trustId = tid;
            }
            if (!sid) { sid = 0; common.setHashValue('step', sid); }

            this.stepId = sid;
        },

        validTrustCodeRemote: function validTrustCodeRemote(obj) {
            var $this = $(obj.target);
            trustCode = $.trim($this.val());
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
                    GSDialog.HintWindow('产品代码: "' + trustCode + '"重复，无法进入下一步保存。');
                } else {
                    $this.removeClass('red-border');
                    $this.data('remote-valid', 'ok');
                    $nextStep.removeProp('disabled');
                }
            });
        },

        getOptionsSource: function (categoryCode) {
            if (OptionSource != null) {
                var items = $.grep(OptionSource, function (item) {
                    return item.CategoryCode == categoryCode;
                });
                return items;
            }
            else {
                return null;
            }

        },
        getOrganisationSource: function () {
            return OrganisationSrc;

        },

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
    };

    return new viewTrustWizard();
});