﻿//暴露分层模块出去
var TrustBondModule;
var validControlValue;
var hoverin;
var hoverout;
var isShowRemove = false;//默认删除按钮为隐藏
var formatData;
var MoveNumFormt;
define(function (require) {
    var $ = require('jquery');
    var ko = require('knockout');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    require('date_input');
    require('asyncbox');
    //var asidetest = require('app/transactionManage/script/test');
    require('jquery-ui')
    var mapping = require('knockout.mapping');
    ko.mapping = mapping;
    var GSAdmin = require('gsAdminPages');
    var common = require('gs/uiFrame/js/common');
    var dataOperate = require('app/transactionManage/script/dataOperate');
    var GlobalVariable = require('globalVariable');
    var FormatNumber = require('app/components/Layered/js/formatNumber');
    var TRUST = require('app/components/Layered/js/TrustWizard');
    validControlValue = TRUST.validControlValue;
    inputNull = common.inputNull
    formatData = common.formatData
    MoveNumFormt = common.MoveNumFormt
    require('app/components/Layered/js/renderControl');
    require("app/projectStage/js/project_interface");
    var ActLogs = require('insertActlogs');
    var vue = require('Vue2');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var userName = RoleOperate.cookieName();
    var gsUtil = require('gsUtil');
    var ip;
    var trustId = common.getQueryString('tid');
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
    var Vue = new vue({
        el: '#bold_bod',
        data: {
            selectCompulsory: [],
            selectedCompulsory: ''
        },
        methods: {
        }
    })
    var webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');
    var langx = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.show = 'Show delete button';
        langx.hide = "Hide delete button";
    } else {
        langx.show = "显示删除按钮";
        langx.hide = "隐藏删除按钮";

    }
    hoverin = function (obj) {

        var a = $(obj).prev();
        var tipDivObj = $(obj);
        var res = gsUtil.getChineseNum(a.val());
        tipDivObj.attr("title", res);
        $("[data-toggle='tooltip']").tooltip({});
    };

    TrustBondModule = (function () {
        var TrustInfo, OptionSource;
        var viewModel;
        var defaultTemp;
        var titles = {};
        var myModel = {
            GridView: ko.observableArray(),
            Detail: ko.observableArray(),
            SelectCompulsory: ko.observableArray(), //原选项
            //selectCompulsory: ko.observableArray(), //实际展示选项
            DDL: {
                RatingAgent: [],//评级机构
            },

            IsPrincipalScheduleShow: ko.observable(false),
            PrincipalSchedules: ko.observableArray(),
            MultipleRatings: ko.observableArray(),
            DateAmount: ko.observableArray(),
            //加了这个函数,为所有需要显示成会计格式且取值为ItemValue的项绑定keyup事件。PS：OfferAmount的（募集规模/每份面值）不能超过10位
            logkeyupItemValue: function (indexF, id, data, event) {
                var number = FormatNumber;
                var event = window.event;
                number.checkNumberFunc({}, event, function (v) {
                    data.ItemValue(v.toString())
                });
                var input = $(id);
                TRUST.validControlValue(input);
            },

            logkeyup: function (indexF, data, event) {


                var inputObj = $(event.target);
                tipDivObj = $(event.target).parent().next().children('#field2');
                tipObj = $(event.target).parent().next().find('#fieldtip1');

                common.tipCHNum(inputObj, tipObj, tipDivObj);

                var number1 = FormatNumber;
                var event1 = window.event;
                number1.checkNumberFunc({}, event1, function (v) {
                    data.Amount(v.toString())
                });

                $(event.target).blur();
                $(event.target).focus();

                var index = indexF();
                index = ((index + 1) * 2) - 1;
                var input = $("#principalpaymentschedule").find("input").eq(index);
                TRUST.validControlValue(input);
            },


            formatp: function (p) {
                var number = FormatNumber;
                if (parseFloat(p) == p) {
                    var ret = number.convertNumberN(1, p);
                    return ret;
                }
                else
                    return p;
            },
        }
        //数据绑定
        var dataBinding = function (dealNode, dataGrid, detail, ratingAgent, trustBondRating) {
            defaultTemp = detail;
            myModel.DDL.RatingAgent = ratingAgent;   //给评级机构数组赋值
            $.each(detail, function (i, d) {
                d['IsDisplay'] = false;
                d['IsNew'] = false;
                if (d.IsCompulsory == "True") {
                    d.IsDisplay = true;
                    if (d.ItemCode == "PrincipalSchedule" || d.ItemCode == "PaymentFrequence" || d.ItemCode == "MultipleRatings") {
                        d.IsDisplay = false;
                    }
                }
                else {
                    d.IsDisplay = false;
                    // 精度option只需要1个,将option推到Vue实例中，展示新的下拉选项
                    switch (d.ItemCode) {
                        case 'PrincipalPrecision':
                            Vue.selectCompulsory.push({ name: '单档债券精度', code: d.ItemCode });
                            d.ItemType = 'PrincipalElement';
                            console.log(d);
                            break;
                        case 'InterestPrecision':
                            d.ItemType = 'InterestElement';
                            console.log(d);
                            break;
                        case 'PAIPrincipalPrecision':
                            Vue.selectCompulsory.push({ name: '深交所专用精度', code: d.ItemCode });
                            break;
                        case 'PAIInterestPrecision':
                            break;
                        default:
                            Vue.selectCompulsory.push({ name: d.ItemAliasValue, code: d.ItemCode });
                            break;
                    }
                }
                // 更改本息兑付归属的要素类型
                myModel.SelectCompulsory.push(d);
                titles[d.ItemCode] = d.ItemAliasValue; //用于GridView Header
                myModel.Detail.push(d);
            });
            console.log(myModel.Detail);
            $.each(dataGrid, function (i, d) {
                if (d.ItemCode == 'OfferAmount') {
                    d.ItemValue = myModel.formatp(d.ItemValue);
                }
            });

            jsonToGridView(dataGrid, trustBondRating); //如何Trust id不为空获取所有TrustBondItem       
            viewModel = ko.mapping.fromJS(myModel);
            ko.applyBindings(viewModel, dealNode);
            generateMultipleRatings("");
            setDatePlugins();

        };

        var date = new Date();
        var today = (date.getFullYear()) + '-' + (date.getMonth() + 1) + '-' + date.getDate();

        formatDate = function () {
            var year = date.getFullYear();
            var month = (date.getMonth() + 1);
            var day = date.getDate()
            var l_month = month.toString().length;
            if (l_month < 2) {
                month = "0" + month.toString();
            }
            var l_day = day.toString().length;
            if (l_day < 2) {
                day = "0" + day.toString();
            }
            today = year + '-' + month + '-' + day;
        };

        getItemAliasValueByCode = function (itemCode) {
            var item = getDefaultItem(itemCode);
            if (item == null) {
                return "";
            }
            else {
                return item.ItemAliasValue;
            }
        };

        //创建一个动态字段
        createCompulsory = function (code) {
            var itemCode = $('#tb_CompulsoryDDL').val();
            if (code) itemCode = code;
            if ($("#bn_CouponPaymentReference").val() == "固定利率" && itemCode == "BookKeepingDate") {
                GSDialog.HintWindow("簿记建档日只有利率形式为浮动利率时才可添加")
                return false
            }
            if (itemCode != null) {
                var detail = viewModel.Detail();
                var itemT;
                // 对于深交所精度和一般精度按每档添加的情况特殊判断
                if (itemCode === 'PAIInterestPrecision' || itemCode === 'PAIPrincipalPrecision') {
                    $.each(detail, (function (i, item) {
                        if (item.ItemCode() === 'PAIInterestPrecision' || item.ItemCode() === 'PAIPrincipalPrecision') {
                            item.IsDisplay(true);
                            item.IsNew(true);
                            // viewModel.Detail.remove(item.ItemCode());作用未知，原方法中包含
                            // viewModel.Detail.push(item.ItemCode());
                        }                   
                    }));   
                }
                else if (itemCode === 'InterestPrecision' || itemCode === 'PrincipalPrecision') {
                    $.each(detail, (function (i, item) {
                        if (item.ItemCode() === 'InterestPrecision' || item.ItemCode() === 'PrincipalPrecision') {
                            item.IsDisplay(true);
                            item.IsNew(true);
                        }
                    }));
                }
                else {
                    $.each(detail, (function (i, item) {
                        if (item.ItemCode() == itemCode) {
                            item.IsDisplay(true);
                            item.IsNew(true);
                            itemT = item;
                        }

                    }));
                    viewModel.Detail.remove(itemT);
                    viewModel.Detail.push(itemT);
                }
                $('.date-plugins').date_input();
                $("[data-toggle='tooltip']").tooltip({});
            }
        };

        //删除动态字段
        removeCompulsory = function (obj) {
            var itemCode = $(obj).attr('itemCode') ? $(obj).attr('itemCode') : obj;
            var detail = viewModel.Detail();
            if(itemCode === 'PAIInterestPrecision' || itemCode === 'PAIPrincipalPrecision') {
                $.each(detail, (function (i, item) {
                    if (item.ItemCode() === 'PAIInterestPrecision' || item.ItemCode() === 'PAIPrincipalPrecision') {
                        item.ItemValue("");
                        item.IsDisplay(false);
                        item.IsNew(false);
                    }
                }));
            }
            else if(itemCode === 'InterestPrecision' || itemCode === 'PrincipalPrecision') {
                $.each(detail, (function (i, item) {
                    if (item.ItemCode() === 'InterestPrecision' || item.ItemCode() === 'PrincipalPrecision') {
                        item.ItemValue("");
                        item.IsDisplay(false);
                        item.IsNew(false);
                    }
                }));
            }
            else {
                $.each(detail, (function (i, item) {
                    if (item.ItemCode() == itemCode) {
                        item.ItemValue("");
                        item.IsDisplay(false);
                        item.IsNew(false);
                    }
                }));
            }
            console.log(detail);
        };

        //浮动利率调整
        openBondInterestAdjustment = function (obj) {
            var rowindex = $(obj).attr('rowindex');
            var itemCode = $(obj).attr('itemCode');
            var IssueDate, LegalMaturityDate;
            var detail = viewModel.Detail();
            var tbid = detail.length > 0 ? detail[0].TBId() : '';
            $.each(detail, (function (i, item) {
                //console.log(item.ItemValue())
                if (item.ItemCode() == 'IssueDate') {
                    IssueDate = item.ItemValue();
                } else if (item.ItemCode() == 'LegalMaturityDate') {
                    LegalMaturityDate = item.ItemValue();
                }
            }));
            var wd = $("body").width();
            if (IssueDate == "" || LegalMaturityDate == "") { GSDialog.HintWindow("调整浮动利率，发行日期和预计到期日不能为空") } else {
                var trustId = common.getQueryString("tid");
                GSAdmin.open(
                    '浮动利率调整',
                    GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustWizard/TrustBondInterestAdjustment.html?trustId={0}&trustBondId={1}&start={2}&end={3}'.format(trustId, tbid, IssueDate, LegalMaturityDate),
                    '关闭',
                    function () {
                        //location.reload(true);
                    },
                    '' + parseInt(wd * 0.9),
                    '500', '', true, true, true, false)
                //});
                //window.open('https://abs-dit.goldenstand.cn/GoldenStandABS/www/productManage/TrustManagement/TrustWizard/TrustBondInterestAdjustment.html?trustId={0}&trustBondId={1}&start={2}&end={3}'.format(trustId, tbid, IssueDate, LegalMaturityDate), '_blank');
            }
        };

        addRating = function () {
            var rating = { RatingDate: "", AgentId: "", Rating: "", IsPlus: true };
            var knrating = ko.mapping.fromJS(rating);//转换成knockout能用的类型
            viewModel.MultipleRatings.push(knrating);
            $("#DivRatingDialog").find(".date-plugins").date_input();
        };

        removeRating = function (obj) {
            var index = $(obj).attr('dataIndex');
            var item = viewModel.MultipleRatings()[index];
            viewModel.MultipleRatings.remove(item);
        };

        addPPS = function () {
            var ps = { PaymentDate: "", Amount: '', IsPlus: false };
            var p = ko.mapping.fromJS(ps);//转换成knockout能用的类型
            viewModel.PrincipalSchedules.push(p);
            console.log(viewModel.PrincipalSchedules)
            setDatePlugins();
            $("[data-toggle='tooltip']").tooltip({});
        };

        removePPS = function (obj) {
            var index = $(obj).attr('dataIndex');
            var item = viewModel.PrincipalSchedules()[index];
            viewModel.PrincipalSchedules.remove(item);
        };


        registerEvent = function () {
            $('#bn_PaymentConvention').change(function () {
                var p1 = $(this).children('option:selected').val();//这就是selected的值
                setPrincipalSchedule(p1, "");
                if ($("#bn_PaymentConvention").val() == "固定摊还") {
                    $("#addRepaymentOfPrincipalPlan").show();
                    $("#repaymentOfPrincipalPlan").find("button").removeAttr("disabled");
                    $("#repaymentOfPrincipalPlan").find("input").removeAttr("disabled");
                } else {
                    $("#addRepaymentOfPrincipalPlan").hide();
                    $("#repaymentOfPrincipalPlan").find("button").attr("disabled", true);
                    $("#repaymentOfPrincipalPlan").find("input").attr("disabled", true);
                    viewModel.PrincipalSchedules([]);
                }
            });

            $('#bn_CouponPaymentReference').change(function () {
                var p1 = $(this).children('option:selected').val();//这就是selected的值
                showCouponPaymentReferencePlus(p1);
                if (p1 == "浮动利率") {
                    TrustBondModule.CreateCompulsory('BookKeepingDate')
                } else {
                    TrustBondModule.RemoveCompulsory('BookKeepingDate')
                }


            });

            $("#tb_Add").click(function () {
                if ($(this).val() == "添加") { trustBond_Add(); }
                else { trustBond_Update(); }
                setPrincipalSchedule($("#bn_PaymentConvention").val(), "");
            });

            $("#tb_Clear").click(function () {
                clear();
            });

            $("#btnMutipleRating").click(function () {
                //addRating();
                $.anyDialog({
                    modal: true,
                    dialogClass: "TaskProcessDialogClass",
                    closeText: "",
                    html: $("#DivRatingDialog").fadeIn(),
                    height: 500,
                    width: 1000,
                    onClose: function (event, ui) {
                        //updateDicList();
                    },
                    onMaskClick: function (event, ui) {
                        //();
                    },
                    title: "添加多家评级信息"
                });
            });

            var ratingAgencyManager = new RatingAgencyManager();
            //评级信息
            ratingAgencyManager.init();

        };
        function RatingAgencyManager() {
            var self = this;
            self.$ratingAgencySelects = null;
            self.isInit = false;

            function RatingAgencyViewModel() {
                var that = this;
                this.ratingAgencyData = ko.observableArray([]);
                this.addRatingAgency = function (source, event) {
                    that.ratingAgencyData.push({
                        ServiceProviderId: 0,
                        ServiceProviderCode: '',
                        ServiceProviderName: ''
                    });

                }

                this.removeRatingAgency = function (index, source, event) {
                    getWcfTrustByRatingAgency(source.ServiceProviderId).done(function (response) {

                        var data = JSON.parse(response);
                        if (data.length > 0) {
                            var trustCodes = '';
                            for (var i = 0, length = data.length; i < length; i++) {
                                if (i !== 0) {
                                    trustCodes += ', ';
                                }

                                trustCodes += data[i].TrustCode;
                            }
                            GSDialog.HintWindow('评级机构被专项计划（' + data[0].TrustCode + '）使用, 无法删除。');
                        } else {
                            that.ratingAgencyData.splice(index, 1);
                        }

                    });
                }
                this.saveRatingAgency = function (source, event) {
                    //var messages = that.ratingAgencyData.isValid();
                    //判断机构简称，机构名称不能为空
                    for (var i = 0; i < that.ratingAgencyData().length; i++) {
                        if (that.ratingAgencyData()[i].ServiceProviderCode == '' || that.ratingAgencyData()[i].ServiceProviderName == '') {
                            GSDialog.HintWindowtop('机构简称、机构名称不能为空');
                            return false
                        }
                    }
                    //判断机构简称，机构名称不能重复
                    var newData = [], oldData = [];
                    for (var i = 0; i < that.ratingAgencyData().length; i++) {
                        if (that.ratingAgencyData()[i].ServiceProviderId == 0) {
                            newData.push(that.ratingAgencyData()[i])
                        } else {
                            oldData.push(that.ratingAgencyData()[i])
                        }
                    }
                    for (var i = 0; i < newData.length; i++) {
                        for (var j = 0; j < oldData.length; j++) {
                            if (newData[i].ServiceProviderCode == oldData[j].ServiceProviderCode) {
                                GSDialog.HintWindowtop('机构简称已存在');
                                return false
                            }
                            if (newData[i].ServiceProviderName == oldData[j].ServiceProviderName) {
                                GSDialog.HintWindowtop('机构名称已存在');
                                return false
                            }
                        }
                    }

                    var messages = that.ratingAgencyData;
                    if (messages.length === 0) {
                        createRatingAgency(that.ratingAgencyData);
                    } else {
                        GSDialog.HintWindow(messages.join('，'));
                    }
                }

                // 保存评级机构
                function createRatingAgency(ratingAgencyData) {
                    createWcfRatingAgency(ratingAgencyData).done(function (response) {
                        var data = JSON.parse(response);
                        if (data.length > 0) {
                            if (data[0].Result === 'OK') {
                                var trustId = common.getQueryString("tid");
                                var description = "专项计划：" + trustId + "，在产品维护向导功能下，对分层信息中评级机构进行了更新操作"
                                var category = "产品管理";
                                ActLogs.insertActlogs(false, userName, '更新', category, description, ip, '', '');
                                populateRatingAgencySelectors(ratingAgencyData);
                                $('#modal-close').trigger('click');
                            } else {
                                GSDialog.HintWindow('保存失败');
                            }
                        }
                    }).fail(function (reason) {
                        GSDialog.HintWindow('error' + reason);
                    });
                }

            };
            self.init = function () {
                // 打开新增资产窗口
                var dataModel = new RatingAgencyViewModel();

                ko.applyBindings(dataModel, document.getElementById('addRatingAgencyContainer'));
                getWcfRatingAgency().done(function (response) {
                    var data = JSON.parse(response);
                    for (var i = 0, length = data.length; i < length; i++) {
                        dataModel.ratingAgencyData.push(data[i]);
                    }
                });

                $('#createRatingAgencyBtn').on('click', function (event) {
                    self.$ratingAgencySelects = $('#DivRatingDialog select');
                    var ratingSelect = $(event.target).parent().parent('.autoLayout-plugins').find('select');
                    if (ratingSelect.length !== 0) {
                        self.$ratingAgencySelects.push(ratingSelect.get(0));
                    }
                    self.dialog = $.anyDialog({
                        width: 1000,
                        height: 500,
                        draggable: true,
                        changeallow: true,
                        mask: true,
                        title: '增加评级机构',
                        html: $('#addRatingAgencyContainer').show(),
                        onClose: function () {
                        }
                    });
                });
            }

            // Updaget organsition select controller
            function populateRatingAgencySelectors(ratingAgencyData) {
                for (var j = 0, l = self.$ratingAgencySelects.length; j < l; j++) {
                    var $ratingAgencySelector = $(self.$ratingAgencySelects[j]);
                    var selectedId = $ratingAgencySelector.val();
                    $ratingAgencySelector.html('');
                    for (var i = 0, length = ratingAgencyData().length; i < length; i++) {
                        var item = ratingAgencyData()[i];
                        var $newOption = $("<option>").val(item.ServiceProviderId).text(item.ServiceProviderName);
                        $ratingAgencySelector.append($newOption);
                    }

                    $ratingAgencySelector.val(selectedId);
                }
            }

            function htmlSpecialChars(unsafe) {
                return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
            }

            function getWcfCommon(param) {
                var serviceUrl = TRUST.config.tmsDataProcessBase + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" + encodeURIComponent(JSON.stringify(param));
                return $.ajax({
                    type: "GET",
                    url: serviceUrl,
                    dataType: "jsonp",
                    crossDomain: true,
                    contentType: "application/json;charset=utf-8"
                });
            }

            function getWcfTrustByRatingAgency(ratingAgencyId) {
                var ratingAgencyParam = {
                    "SPName": "usp_GetTrustByRatingAgency",
                    "SQLParams": [
                        {
                            "Name": "ServiceProviderId",
                            "value": ratingAgencyId,
                            "DBType": "int"
                        }
                    ]
                };

                return getWcfCommon(ratingAgencyParam);
            }

            function getWcfRatingAgency() {
                var ratingAgencyParam = {
                    "SPName": "usp_GetServiceProviderByType",
                    "SQLParams": [
                        {
                            "Name": "Type",
                            "value": "RatingAgency",
                            "DBType": "string"
                        }
                    ]
                };

                return getWcfCommon(ratingAgencyParam);
            }

            function createWcfRatingAgency(ratingAgencyData) {
                var itemsXml = '<items>';
                for (var i = 0, length = ratingAgencyData().length; i < length; i++) {
                    var item = ratingAgencyData()[i];
                    itemsXml += '<item>'
                                + '<Id>' + item.ServiceProviderId + '</Id>'
                                + '<Name>' + htmlSpecialChars(item.ServiceProviderName) + '</Name>'
                                + '<Code>' + htmlSpecialChars(item.ServiceProviderCode) + '</Code>'
                            + '</item>';
                }
                itemsXml += '</items>';
                var ratingAgencyParam = {
                    "SPName": "usp_UpdateRatingAgency",
                    "SQLParams": [
                        {
                            "Name": "Item",
                            "value": itemsXml,
                            "DBType": "xml"
                        }
                    ]
                };

                return getWcfCommon(ratingAgencyParam);
            }
        }
        var istbAdd = true;
        //添加新分层
        var SecurityExchangeCodes = [], SecurityExchangeCode;
        trustBond_Add = function () {
            var pass = validation();
            if (pass) {
                var detail = viewModel.Detail();
                var newItem = { TBId: viewModel.GridView().length };
                $.each(viewModel.GridView(), function (i, item) {
                    SecurityExchangeCodes.push(item.SecurityExchangeCode());
                });
                $.each(detail, function (i, item) {

                    if (item.ItemCode() == "SecurityExchangeCode") {
                        SecurityExchangeCode = item.ItemValue();
                    }

                    if (item.ItemCode() == "PrincipalSchedule") {
                        //var principalSchedule = getPrincipalSchedule();
                        //newItem[item.ItemCode()] = principalSchedule;
                        //console.log("This is add planpayamount");
                    }
                    else if (item.ItemCode() == "MultipleRatings") {
                        newItem[item.ItemCode()] = ko.mapping.toJSON(viewModel.MultipleRatings());
                    }
                    else {
                        newItem[item.ItemCode()] = item.ItemValue();
                        if (item.ItemCode() == "OfferAmount") {
                            //console.log("This is item.Value");
                            //console.log(item.ItemValue());
                        }
                    }
                    //处理IE游览器下，取不到值的问题
                    if (item.ItemCode() == "CouponBasis") {
                        var couponBasis = document.getElementById('CouponBasis').childNodes[0].value;
                        newItem[item.ItemCode()] = couponBasis;
                    }
                    //
                });

                if ($.inArray(SecurityExchangeCode, SecurityExchangeCodes) != -1) {
                    GSDialog.HintWindow('分层信息已存在!');
                    return false;
                } else {
                    //转换成knockout需要的
                    newItem = ko.mapping.fromJS(newItem);
                    //这样item里包含模板的所有字段,写入Grid
                    var type = newItem.ClassType();
                    if (type == "SubClass") {
                        $(".typetwo").show()
                    }
                    if (type == 'FirstClass') {
                        $(".typeone").show()
                    }
                    if (type == 'EquityClass') {
                        $(".typethree").show()
                    }
                    viewModel.GridView.push(newItem);
                    //初始化Detail为最初状态
                    initDetail();
                }
                //清空已有显示内容
                clear();
                istbAdd = true;//状态为添加
                $("#next-step").trigger("click");
                $("#closebox").trigger("click");
            }
        };
        //点击编辑获取详情页
        var editIndex = 0;//编辑时设置index
        trustBond_Detail = function (obj) {
            $(".ant-drawer-content-wrapper").css("transform", "translateY(0)");
            istbAdd = false;
            initDetail(); //初始化Detail为最初状态
            clear();//清空已有显示内容
            editIndex = $(obj).attr('dataIndex') ? $(obj).attr('dataIndex') : $(obj).index();
            var item = viewModel.GridView()[editIndex];
            //附加信息利息数据源
            var TrustBondId = item.TBId()
            var trustId = common.getQueryString('tid')
            //var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            //var executeParam = {
            //    'SPName': "usp_GetBondDateAmount", 'SQLParams': [
            //              { 'Name': 'trustId', 'Value': trustId, 'DBType': 'int' },
            //              { 'Name': 'TrustBondId', 'Value': TrustBondId, 'DBType': 'int' }
            //    ]
            //};
            //common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            //    var arry = [];
            //    $.each(JSON.parse(data[0].result), function (i, v) {
            //        if (v.Title == "利息") {
            //            arry.push(v);
            //        }
            //    })
            //    viewModel.DateAmount(arry);
            //})
            for (var key in item) {
                //key就是ItemCode
                if (key != "__ko_mapping__" && key != "PrincipalSchedule" && key != "MultipleRatings") {
                    var detail = viewModel.Detail();
                    $.each(detail, function (i, d) {
                        d.TBId(item.TBId());
                        if (d.ItemCode() == key) {
                            var itemValue = item[key]();

                            if (d.DataType().toLocaleLowerCase() == 'bool' && typeof itemValue == "string") {
                                var c = (itemValue == "1" || itemValue.toLocaleLowerCase() == "true");
                                itemValue = c;
                                //console.log(key + ":" + c);
                            }

                            if (typeof itemValue == 'boolean' || (typeof itemValue == 'string' && itemValue != "")) {
                                d.ItemValue(itemValue);
                                if (d.IsCompulsory() == "False") {
                                    d.IsDisplay(true);
                                    d.IsNew(true);
                                }
                            }
                        }
                    })
                }
            }
            if ($("#bn_PaymentConvention").val() == "固定摊还" && $("#repaymentOfPrincipalPlanTitle").hasClass('tabs_titleActive')) {
                $("#addRepaymentOfPrincipalPlan").show();
                $("#repaymentOfPrincipalPlan").find("button").removeAttr("disabled");
                $("#repaymentOfPrincipalPlan").find("input").removeAttr("disabled");
            } else {
                $("#addRepaymentOfPrincipalPlan").hide();
                $("#repaymentOfPrincipalPlan").find("button").attr("disabled", true);
                $("#repaymentOfPrincipalPlan").find("input").attr("disabled", true);
            }
            //设置附加的那些属性,分期是否显示
            //setPrincipalSchedule(item.PaymentConvention(), item.PrincipalSchedule());
            generateMultipleRatings(item.MultipleRatings());
            showCouponPaymentReferencePlus(item.CouponPaymentReference());
            setDatePlugins();
            // validation();
            // $('#TrustItem_Detail .col-6').eq(2).find('.form-control').attr('disabled', 'disabled');
            $("#tb_Add").val("更新");
            $("#tb_name").html("更新分层");
            //$('#SecurityExchangeCode input').prop("disabled", true);
        };
        //更新新分层
        trustBond_Update = function () {
            var pass = validation();
            if (pass) {
                var item = viewModel.GridView()[editIndex];//里面包含所有属性
                var detail = viewModel.Detail();
                $.each(detail, function (i, d) {
                    var code = d.ItemCode();
                    for (var key in item) {
                        //Key就是ItemCode
                        if (key == code) {
                            item[key](d.ItemValue());
                        }

                        //处理IE游览器下，取不到值的问题
                        if (key == 'CouponBasis' && key == code) {
                            var couponBasis = document.getElementById('CouponBasis').childNodes[0].value;
                            item[key](couponBasis);
                        }
                        //
                    }
                })
                //放在最后否则会为上面循环覆盖掉
                //item.PrincipalSchedule(getPrincipalSchedule());
                item.MultipleRatings(ko.mapping.toJSON(viewModel.MultipleRatings()));
                showCouponPaymentReferencePlus(item.CouponPaymentReference());
                $("#tb_Add").val("更新");
                $("#tb_name").html("更新分层");
                $('#SecurityExchangeCode input').prop("disabled", false);
                //clear();//清空
                //istbAdd = true;//状态变为添加
                $("#next-step").trigger("click");
                $("#closebox").trigger("click");
                var showArry = viewModel.GridView();
                var a = 0, b = 0, c = 0;
                $.each(showArry, function (i, v) {
                    if (v.ClassType() == "FirstClass") {
                        a++;
                    }
                    if (v.ClassType() == "SubClass") {
                        b++;
                    }
                    if (v.ClassType() == "EquityClass") {
                        c++;
                    }
                })
                a == 0 ? $(".typeone").hide() : $(".typeone").show()
                b == 0 ? $(".typetwo").hide() : $(".typetwo").show()
                c == 0 ? $(".typethree").hide() : $(".typethree").show()
                initDetail(); //初始化Detail模板

            }
        };
        //删除一个分层
        trustBond_Delete = function (obj) {
            GSDialog.HintWindowTF("是否确认删除当前信息", function () {
                var index = $(obj).attr('dataIndex');
                var oNew = viewModel.GridView()[index];
                var BondId = oNew.TBId()
                

                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;
                var executeParam = {
                    SPName: 'usp_DeleteUploandBondDateAmount', SQLParams: [
                        { Name: 'trustId', value: trustId, DBType: 'int' },
                        { Name: 'TrustBondId ', value: BondId, DBType: 'int' }
                    ]
                };
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    console.log("获取系统自算数据")
                    console.log(data)



                    viewModel.GridView.remove(oNew);
                    var type = oNew.ClassType();
                    var a = 0, b = 0, c = 0;
                    $.each(viewModel.GridView(), function (i, v) {
                        if (v.ClassType() == "FirstClass") {
                            a++;
                        }
                        if (v.ClassType() == "SubClass") {
                            b++;
                        }
                        if (v.ClassType() == "EquityClass") {
                            c++;
                        }
                    })
                    if (type == 'FirstClass') {
                        a = a - 1;
                        a < 0 ? $(".typeone").hide() : $(".typeone").show()
                    }
                    if (type == "SubClass") {
                        b = b - 1;
                        b < 0 ? $(".typetwo").hide() : $(".typetwo").show()
                    }

                    if (type == 'EquityClass') {
                        c = c - 1;
                        b < 0 ? $(".typethree").hide() : $(".typethree").show()
                    }



                    //状态为添加
                    istbAdd = true;
                    initDetail(); //初始化Detail模板
                    clear();//清空
                    $("#tb_Add").val("添加");
                    $("#tb_name").html("添加分层");
                    $("#next-step").trigger("click");
                    $("#closebox").trigger("click");
                    
                })
            })
        };
        //打开日历信息
        openCalendar = function (obj) {
            var dataindex = $(obj).attr("dataIndex");
            var item = TrustBondModule.mymodel.GridView();
            var trustId = common.getQueryString('tid');
            var TrustBondId = TrustBondModule.mymodel.GridView()[dataindex].TBId;
            var name = TrustBondModule.mymodel.GridView()[dataindex].SecurityExchangeCode;
            var page = location.protocol + '//' + location.host + '/GoldenStandABS/www/components/viewDateSet/DateCalendar.html?tid=' + trustId + "&enter=Layered" + "&title=" + name + "&BondId=" + TrustBondId;
            var tabName = name + "-日历预览模式" + "_" + trustId;
            var pass = true
            parent.parent.viewModel.tabs().forEach(function (v, i) {
                if (v.id == trustId) {
                    pass = false;
                    parent.parent.viewModel.changeShowId(v);
                    return false;
                }
            })
            if (pass) {
                //parent.viewModel.showId(trustId);
                var newTab = {
                    id: trustId,
                    url: page,
                    name: tabName,
                    disabledClose: false
                };
                parent.parent.viewModel.tabs.push(newTab);
                parent.parent.viewModel.changeShowId(newTab);
            };
        };
        //打开附加信息
        subjoinInformation = function (obj) {
            var dataindex = $(obj).attr("dataIndex");
            var item = viewModel.GridView()[dataindex];//里面包含所有属性
            var BondId = item.TBId(), PaymentConvention = item.PaymentConvention();
            if (PaymentConvention == "固定摊还") PaymentConvention = 1
            else PaymentConvention = 0
            //GSDialog.open("系统数据", '/GoldenStandABS/www/components/Layered/subjoinInformation/subjoinInformation.html?trustId=' + trustId + '&BondId=' + BondId + '&PaymentConvention=' + PaymentConvention, '', function (results) { }, 900, 550)
            isUpload(BondId, function (title) {
                GSDialog.open(title, '/GoldenStandABS/www/components/Layered/subjoinInformation/subjoinInformation.html?trustId=' + trustId + '&BondId=' + BondId + '&PaymentConvention=' + PaymentConvention, '', function (results) { }, 1100, 480)
            });
        }
        //判断之前是否上传过文件
        isUpload = function (BondId, callback) {
            var returnData = '';
            var sContent = "{'SPName':'usp_IsUploadBondDateAmount','Params':{" + 'trustId:' + trustId + ", " + 'TrustBondId:' + BondId + "}}";
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "GetTrustData?applicationDomain=TrustManagement&contextInfo=" + sContent;
            $.ajax({
                url: serviceUrl,
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "jsonp",
                crossDomain: true,
                complete: function () { },
                success: function (response) {
                    var result = JSON.parse(response)[0].result
                    if (result == 1) {
                        returnData = "上传数据"
                    } else {
                        returnData = "系统数据"
                    }
                    if (callback) callback(returnData);
                },
                error: function (response) {
                    alert("error:" + response);
                }
            });
            return returnData;
        },
        alertMsg = function (text) {
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
        };
        clear = function () {
            var detail = viewModel.Detail();
            $.each(detail, function (i, item) {
                item.TBId(0);
                var dataType = item.DataType().toLocaleLowerCase();
                if (dataType == "bool") {
                    item.ItemValue("0");
                }
                else {
                    if (dataType != "select") {
                        item.ItemValue("");
                    }
                }
            });

            if (viewModel.IsPrincipalScheduleShow) {
                var ps = viewModel.PrincipalSchedules();
                $.each(ps, function (j, p) {
                    p.PaymentDate("");
                    p.Amount("");
                });
            }

            //清空ratings
            generateMultipleRatings("");

            $('#SecurityExchangeCode input').prop("disabled", false);

        }

        //删除所有动态字段从Detail模板,初始化状态
        initDetail = function (obj) {
            var detail = viewModel.Detail();
            $.each(detail, function (i, item) {
                item.TBId(0);
                if (item.ItemCode() == "PaymentConvention") {
                    var valueShort = getCodeDictionaryFristValueShort("PaymentConvention");
                    item.ItemValue(valueShort);
                }
                else if (item.ItemCode() == "CouponPaymentReference") {
                    var valueShort = getCodeDictionaryFristValueShort("CouponPaymentReference");
                    item.ItemValue(valueShort);
                    showCouponPaymentReferencePlus(valueShort);
                }
                else if (item.ItemCode() == "PaymentFrequence") {
                    var valueShort = getCodeDictionaryFristValueShort("PaymentFrequence");
                    item.ItemValue(valueShort);
                    item.IsDisplay(false);
                }
                else if (item.ItemCode() == "CouponPaymentReference") {
                    var valueShort = getCodeDictionaryFristValueShort("CouponPaymentReference");
                    item.ItemValue(valueShort);
                }
                else if (item.DataType() == "Date") {
                    item.ItemValue("");
                }
                else if (item.ItemCode() == "RatingAgent") {
                    var spid = viewModel.DDL.RatingAgent()[0].SPId();
                    item.ItemValue(spid);
                }

                if (item.IsNew()) {
                    item.IsNew(false);
                    item.IsDisplay(false);
                }
            });



            var grid = viewModel.GridView();
            $.each(grid, function (i, item) {
                item.TBId(i);
                console.log(item.TBId())
            })
            viewModel.IsPrincipalScheduleShow(false);

            //清空附加信心
            var ary = viewModel.PrincipalSchedules();
            ary.splice(0, ary.length);
            //清空多家评级信息
            //generateMultipleRatings("");
            setDatePlugins();
            $("#tb_Add").val("添加");
            $("#tb_name").html("添加分层");
        }

        getCodeDictionaryValueShort = function (categoryCode, codeDictionaryCode) {
            //OptionSource 在viewTrustWizard.js里全局变量
            if (OptionSource != null) {
                var items = $.grep(OptionSource, function (item) {
                    return item.CategoryCode == categoryCode && item.CodeDictionaryCode == codeDictionaryCode;
                });
                if (items.length > 0) {
                    return items[0].ValueShort;
                }
            }
            else {
                return "";
            }
        }

        getCodeDictionaryFristValueShort = function (categoryCode) {
            //OptionSource 在viewTrustWizard.js里全局变量
            if (OptionSource != null) {
                var items = $.grep(OptionSource, function (item) {
                    return item.CategoryCode == categoryCode;
                });
                if (items.length > 0) {
                    return items[0].ValueShort;
                }
            }
            else {
                return "";
            }

        }
        //获取还款方式
        getPrincipalSchedule = function () {
            var ppsStr = "";
            var psShow = viewModel.IsPrincipalScheduleShow();
            if (psShow) {
                var ps = viewModel.PrincipalSchedules();
                $.each(ps, function (i, item) {
                    ppsStr = ppsStr + item.PaymentDate() + item.Amount() + ";";
                });
                ppsStr = ppsStr.substring(0, ppsStr.length - 1);
            }
            return ppsStr;
        };

        setPrincipalSchedule = function (pc, pps) {
            //还款方式
            //var OnceOffPIPaymentValue = getCodeDictionaryValueShort("PaymentConvention", "OnceOffPIPayment");//一次性还本付息
            //var PlanPScheduledValue = getCodeDictionaryValueShort("PaymentConvention", "PlanPScheduledI");//计划还本，按期付息
            //if (pc == "") {
            //    viewModel.IsPrincipalScheduleShow(false);
            //    $.each(viewModel.Detail(), function (i, item) {
            //        if (item.ItemCode() == "PaymentFrequence") {
            //            item.IsDisplay(false);
            //        }
            //    });
            //    return;
            //}
            //else if (pc == OnceOffPIPaymentValue) {
            //    viewModel.IsPrincipalScheduleShow(false);
            //    $.each(viewModel.Detail(), function (i, item) {
            //        if (item.ItemCode() == "PaymentFrequence") {
            //            item.IsDisplay(false);
            //        }
            //    });
            //    return;
            //}
            //else if (pc == PlanPScheduledValue) {
            if (pc != "") {
                viewModel.IsPrincipalScheduleShow(true);

                $.each(viewModel.Detail(), function (i, item) {


                    if (item.ItemCode() == "PaymentFrequence") {



                        item.IsDisplay(true);
                    }
                });
                var ary = viewModel.PrincipalSchedules();
                if (pps == "") {
                    if (ary.length == 0) {
                        if (pc == "固定摊还") {
                            var ps0 = { PaymentDate: "", Amount: "", IsPlus: true };
                            var p0 = ko.mapping.fromJS(ps0);//转换成knockout能用的类型
                            viewModel.PrincipalSchedules.push(p0);
                        } else {
                            viewModel.PrincipalSchedules([]);
                        }

                    }
                }
                else {
                    ary.splice(0, ary.length);
                    //console.log(ary);// 清空
                    var arr = pps.split(';');
                    var length = arr.length;
                    if (length == 1) {
                        var ps1 = { PaymentDate: arr[0].split(':')[0], Amount: arr[0].split(':')[1], IsPlus: true };
                        var p1 = ko.mapping.fromJS(ps1);//转换成knockout能用的类型
                        viewModel.PrincipalSchedules.push(p1);
                    }
                    else {
                        var ps2 = { PaymentDate: arr[0].split(':')[0], Amount: arr[0].split(':')[1], IsPlus: true };
                        var p2 = ko.mapping.fromJS(ps2);//转换成knockout能用的类型
                        viewModel.PrincipalSchedules.push(p2);
                        for (var i = 1; i < length; i++) {

                            var ps3 = { PaymentDate: arr[i].split(':')[0], Amount: arr[i].split(':')[1], IsPlus: false };
                            var p3 = ko.mapping.fromJS(ps3);//转换成knockout能用的类型
                            viewModel.PrincipalSchedules.push(p3);
                        }
                    }
                }
            }
            //else {
            //    viewModel.IsPrincipalScheduleShow(false);
            //    $.each(viewModel.Detail(), function (i, item) {
            //        if (item.ItemCode() == "PaymentFrequence") {
            //            item.IsDisplay(true);
            //        }
            //    });
            //    return;
            //}
            //var pps = $("#repaymentOfPrincipalPlan").find("input");
            //TRUST.TRUST.api.validControls(pps)
            setDatePlugins();

        };
        //新增时候附加信息状态
        clearPlusInfo = function () {
            viewModel.DateAmount([]);
            if ($("#bn_PaymentConvention").val() == "固定摊还" && $("#repaymentOfPrincipalPlanTitle").hasClass('tabs_titleActive')) {
                $("#addRepaymentOfPrincipalPlan").show();
                $("#repaymentOfPrincipalPlan").find("button").removeAttr("disabled");
                $("#repaymentOfPrincipalPlan").find("input").removeAttr("disabled");
                var ps0 = { PaymentDate: "", Amount: "", IsPlus: true };
                var p0 = ko.mapping.fromJS(ps0);//转换成knockout能用的类型
                viewModel.PrincipalSchedules.push(p0);
            } else {
                $("#addRepaymentOfPrincipalPlan").hide();
                $("#repaymentOfPrincipalPlan").find("button").attr("disabled", true);
                $("#repaymentOfPrincipalPlan").find("input").attr("disabled", true);
                viewModel.PrincipalSchedules([]);
            }
            //判断是否有浮动利率标示
            var p1 = $("#bn_CouponPaymentReference").val();//这就是selected的值
            showCouponPaymentReferencePlus(p1);
            if (p1 == "浮动利率") {
                TrustBondModule.CreateCompulsory('BookKeepingDate')
            } else {
                TrustBondModule.RemoveCompulsory('BookKeepingDate')
            }
        }
        //MultipleRatings        
        generateMultipleRatings = function (ratings) {
            if (ratings == "") {
                //默认存在一条空模板   
                viewModel.MultipleRatings().splice(0, viewModel.MultipleRatings().length);
                var rating = { RatingDate: "", AgentId: "", Rating: "", IsPlus: false };
                var knrating = ko.mapping.fromJS(rating);
                //转换成knockout能用的类型
                viewModel.MultipleRatings.push(knrating);
            }
            else {
                viewModel.MultipleRatings().splice(0, viewModel.MultipleRatings().length);
                var ratings = JSON.parse(ratings);
                viewModel.MultipleRatings(ratings);
            }
            $("#DivRatingDialog").find(".date-plugins").date_input();
        };

        showCouponPaymentReferencePlus = function (pc) {
            if (pc == '浮动利率') {
                $('#TrustBondModule_btn_CouponPaymentReference').show();
            } else {
                $('#TrustBondModule_btn_CouponPaymentReference').hide();
            }
        }

        //根据获取到Json组织需要的Json数组
        jsonToGridView = function (trustBondItems, trustBondRating) {
            var go = true;
            var tbId = 0;
            while (go) {
                var row = $.grep(trustBondItems, function (trustItem) {
                    return trustItem.TBId == tbId;
                })

                if (row.length == 0) {
                    go = false;
                }
                else {
                    var gridItem = { TBId: tbId };
                    var spId = 1;
                    //var ocr = "";
                    var tbr = getTrustBondRating(trustBondRating, tbId);
                    if (tbr != null) {
                        spId = tbr.SPId;
                        //ocr = tbr.ItemValue;
                    }
                    //排序
                    row = row.sort(function (a, b) {
                        return parseInt(a.SequenceNo) - parseInt(b.SequenceNo)
                    });

                    for (var i = 0, l = row.length; i < l; i++) {
                        if (row[i].ItemCode == "RatingAgent") {
                            gridItem["RatingAgent"] = spId;
                        }
                            //else if (row[i].ItemCode == "OriginalCreditRating") {
                            //    gridItem["OriginalCreditRating"] = ocr;
                            //}
                        else {
                            gridItem[row[i].ItemCode] = row[i].ItemValue;
                        }
                    }

                    myModel.GridView.push(gridItem);

                }
                tbId++;

            }
        };


        //根据Tbid，获取评级机构和评级
        getTrustBondRating = function (trustBondRating, tbId) {
            if (!trustBondRating || trustBondRating.length < 1) {
                return null;
            }
            var rows = $.grep(trustBondRating, function (tbr) {
                return tbr.TBId == tbId;
            })

            if (rows.length > 0) {
                return rows[0];
            }
            else {
                return null;
            }
        }


        getDefaultItem = function (itemCode) {
            var item = $.grep(defaultTemp, function (trustItem) {
                return trustItem.ItemCode == itemCode;
            });

            if (item.length > 0) {
                return item[0];
            }
            else {
                return null;
            }
        }
        //将TrsutBonds集合转化成Json
        getSubmitJson = function () {
            var ary = [];
            var aryTBR = [];
            var grid = viewModel.GridView();
            //var RatingsArray = [];
            //console.log("This is gridview");
            //console.log(grid);
            $.each(grid, function (j, item) {
                var tbr = { Category: "TrustBondRating", SPId: item.RatingAgent(), SPCode: "", SPRItemCode: "", TBId: j, ItemId: "", ItemCode: "", ItemValue: item.OriginalCreditRating(), DataType: "", UnitOfMeasure: "", Precise: "" };
                aryTBR.push(tbr);
                //var Ratings={ Category:"TrustBondItem",DataType: "",ItemCod:"MultipleRatings"
                //,ItemId:"0"
                //,ItemValue:"[{'RatingDate':'2018-03-15', 'AgentId' : '5' , 'Rating' : 'sd' , 'IsPlus' :false}]"
                //,Precise:""
                //,SPCode:""
                //,SPId:""
                //,SPRItemCode:""
                //,TBId:0
                //,UnitOfMeasure:""}
                //RatingsArray.push(Ratings)
                for (var key in item) {
                    //key就是ItemCode
                    if (key != "__ko_mapping__" && key != "RatingAgent" && key != 'TBId' && key != 'PrincipalSchedule') {
                        //如果ItemValue不为空,就添加到数组里
                        if (item[key]() != "") {
                            var item_d = getDefaultItem(key);
                            if (item_d != null) {
                                var cc = { Category: "TrustBondItem", SPId: "", SPCode: "", SPRItemCode: "", TBId: j, ItemId: item_d.ItemId, ItemCode: key, ItemValue: item[key](), DataType: item_d.DataType, UnitOfMeasure: item_d.UnitOfMeasure, Precise: item_d.Precise };
                                ary.push(cc);
                            }
                            else {
                                GSDialog.HintWindow("TrustBond Error: create submit Json error");
                            }
                        }
                    }
                }
            });

            $.each(aryTBR, function (a, t) {
                ary.push(t);
            });
            //$.each(RatingsArray, function (a, t) {
            //    ary.push(t);
            //})
            var json = ko.mapping.toJSON(ary);
            if (json == "[]") {
                return "";
            }
            json = json.substring(1, json.length - 1) + ",";

            $("#divTrustBondShow").html(json);
            return ary;
        };
        preView = function () {
            var executeParam = {
                SPName: 'usp_GetTrustBondInfo', SQLParams: [
                    //{ Name: 'trustId', value: trustId, DBType: 'int' }
                    { Name: 'trustId', value: trustId, DBType: 'int' }
                ]
            };
            var listData = WcfProxy.GetSourceData(executeParam);
            var div = '<div class="ItemBox"><h3 class="h3">分层信息</h3><div class="ItemInner">{0}</div></div>';
            if (listData && listData[0]) {
                var table = '<table class="table"><tbody>';
                var key = 0;
                $.each(listData[0], function (data) {
                    table += '<tr id="bondkey-' + key + '"><td width="110" style="background:#cadaf6">' + data + '</td></tr>';
                    key++;
                });
                table += '</tbody></table>';
                key = 0;
                $table = $(table);
                $.each(listData, function (i, d) {
                    $.each(d, function (t, b) {
                        $('<td>' + b + '</td>').appendTo($table.find('#bondkey-' + key));
                        key++;
                    });
                    key = 0;
                });
                table = $table[0].outerHTML;
                div = div.format(table);
            } else {
                div = div.format('暂无数据');
            }
            return div;
        };
        setDatePlugins = function () {
            $("body").find('.date-plugins').date_input();
        }
        validation = function () {
            var pass = true;
            var detail = $(".TrustItem_Detail").find("input");
            var pps = $("#repaymentOfPrincipalPlan").find("input");
            pass = TRUST.TRUST.api.validControls(detail);
            var pass2 = TRUST.TRUST.api.validControls(pps);
            if (pass) {
                pass = pass2;
            }
            return pass;
        }
        renderTitle = function (itemCode) {
            return titles[itemCode];
        }
        renderTitleR = function (itemCode) {

            return titles[itemCode].replace(/\*/g, "");
        }
        return {
            DataBinding: dataBinding,
            mymodel: myModel,
            CreateCompulsory: createCompulsory,
            RemoveCompulsory: removeCompulsory,
            OpenBondInterestAdjustment: openBondInterestAdjustment,
            AddPPS: addPPS,
            RemovePPS: removePPS,
            AddRating: addRating,
            RemoveRating: removeRating,
            RegisterEvent: registerEvent,
            FormatDate: formatDate,
            TrustBond_Detail: trustBond_Detail,
            SubjoinInformation: subjoinInformation,
            OpenCalendar: openCalendar,
            TrustBond_Delete: trustBond_Delete,
            SubmitJson: getSubmitJson,
            PreView: preView,
            Validation: validation,
            RenderTitle: renderTitle,
            RenderTitleR: renderTitleR
        };

    })();
    //表格的title
    ko.bindingHandlers.renderTitle = {
        init: function (element, valueAccessor) {
            var itemCode = valueAccessor();
            var html = "<span>" + TrustBondModule.RenderTitle(itemCode) + "</span>";
            $(html).appendTo($(element));
        }
    }
    ko.bindingHandlers.renderTitleR = {
        init: function (element, valueAccessor) {
            var itemCode = valueAccessor();
            var html = "<span>" + TrustBondModule.RenderTitleR(itemCode) + "</span>";
            $(html).appendTo($(element));
        }
    }
    var TrustBond = {
        init: function () {
            var dealNode = document.getElementById('TrustBondDiv');
            var dataGrid = this.getCategoryData("TrustBondItem");
            var ratingAgent = this.getCategoryData("RatingAgency");
            var detail = this.getCategoryData("TrustBondItemDefault");
            var emty = true;
            //给detail排序（按要求排序
            var myDetail = JSON.parse(JSON.stringify(detail))
            var myDetail2 = JSON.parse(JSON.stringify(detail))
            var ClassType, OfferAmount, IssueDate, LegalMaturityDate, Denomination, IsChinabondDelimit, RatingAgent, TotalInterestRoundingRule, IntersetUnpaidDispose;
            for (var i = 0; i < myDetail.length; i++) {
                if (myDetail[i].ItemCode == "ClassType") { //债券类别
                    for (var j = 0; j < myDetail2.length; j++) {
                        if (myDetail2[j].ItemCode == "ClassType") {
                            myDetail2.splice(j, 1);
                            ClassType = myDetail[i];
                            break;
                        }
                    }
                }
                else if (myDetail[i].ItemCode == "OfferAmount") { //发行规模
                    for (var j = 0; j < myDetail2.length; j++) {
                        if (myDetail2[j].ItemCode == "OfferAmount") {
                            myDetail2.splice(j, 1);
                            OfferAmount = myDetail[i]
                            break;
                        }
                    }
                }
                else if (myDetail[i].ItemCode == "IssueDate") { //起息日
                    for (var j = 0; j < myDetail2.length; j++) {
                        if (myDetail2[j].ItemCode == "IssueDate") {
                            myDetail2.splice(j, 1);
                            IssueDate = myDetail[i];
                            break;
                        }
                    }
                }
                else if (myDetail[i].ItemCode == "LegalMaturityDate") { //预期到期日
                    for (var j = 0; j < myDetail2.length; j++) {
                        if (myDetail2[j].ItemCode == "LegalMaturityDate") {
                            myDetail2.splice(j, 1);
                            LegalMaturityDate = myDetail[i];
                            break;
                        }
                    }
                }
                else if (myDetail[i].ItemCode == "Denomination") { //每份面值
                    for (var j = 0; j < myDetail2.length; j++) {
                        if (myDetail2[j].ItemCode == "Denomination") {
                            myDetail2.splice(j, 1);
                            Denomination = myDetail[i];
                            break;
                        }
                    }
                }
                else if (myDetail[i].ItemCode == "IsChinabondDelimit") { //是否由中登兑付 
                    for (var j = 0; j < myDetail2.length; j++) {
                        if (myDetail2[j].ItemCode == "IsChinabondDelimit") {
                            myDetail2.splice(j, 1);
                            IsChinabondDelimit = myDetail[i];
                            break;
                        }
                    }
                }
                else if (myDetail[i].ItemCode == "RatingAgent") { //评级机构 
                    for (var j = 0; j < myDetail2.length; j++) {
                        if (myDetail2[j].ItemCode == "RatingAgent") {
                            myDetail2.splice(j, 1);
                            RatingAgent = myDetail[i];
                            break;
                        }
                    }
                }
                else if (myDetail[i].ItemCode == "TotalInterestRoundingRule") { //总计利息舍入规则
                    for (var j = 0; j < myDetail2.length; j++) {
                        if (myDetail2[j].ItemCode == "TotalInterestRoundingRule") {
                            myDetail2.splice(j, 1);
                            TotalInterestRoundingRule = myDetail[i];
                            break;
                        }
                    }
                }
            };
            myDetail2.splice(2, 0, ClassType)
            myDetail2.splice(3, 0, OfferAmount)
            myDetail2.splice(4, 0, IssueDate)
            myDetail2.splice(5, 0, LegalMaturityDate)
            myDetail2.splice(6, 0, Denomination)
            myDetail2.splice(7, 0, IsChinabondDelimit)
            myDetail2.splice(9, 0, RatingAgent)
            for (var i = 0; i < myDetail2.length; i++) {
                if (myDetail2[i].ItemCode == "IntersetUnpaidDispose") {
                    IntersetUnpaidDispose = i
                }
            }
            if (TotalInterestRoundingRule) {
                myDetail2.splice(IntersetUnpaidDispose, 0, TotalInterestRoundingRule)
            }
            detail = myDetail2;
            //给detail赋值type类型
            $.each(detail, function (i, v) {
                if (v.ItemCode == "SecurityExchangeCode" || v.ItemCode == "ShortName" || v.ItemCode == "IssueDate" || v.ItemCode == "LegalMaturityDate" || v.ItemCode == "CurrencyOfIssuance" || v.ItemCode == "OfferAmount" || v.ItemCode == "Denomination" || v.ItemCode == "ClassType" || v.ItemCode == "IsChinabondDelimit" || v.ItemCode == "RatingAgent" || v.ItemCode == "OriginalCreditRating" || v.ItemCode == "ClassName" || v.ItemCode == "BookKeepingDate" || v.ItemCode == "HoldingPercentage") {
                    v.ItemType = "GradingElement";//分档要素
                } else if (v.ItemCode == "PaymentConvention" || v.ItemCode == "PrincipalRoundingRule" || v.ItemCode == "TotalPrincipalRoundingRule" || v.ItemCode == "PAIPrincipalPrecision" || v.ItemCode == "PrincipalSchedule") {
                    v.ItemType = "PrincipalElement";//本金要素
                } else if (v.ItemCode == "CouponPaymentReference" || v.ItemCode == "CouponBasis" || v.ItemCode == "InterestPaymentType" || v.ItemCode == "InterestDays" || v.ItemCode == "InterestRateCalculation" || v.ItemCode == "InterestRoundingRule" || v.ItemCode == "TotalInterestRoundingRule" || v.ItemCode == "IntersetUnpaidDispose" || v.ItemCode == "PAIInterestPrecision") {
                    v.ItemType = "InterestElement";//利息要素
                } else {
                    v.ItemType = "other"//其他
                    if (v.ItemCode != "MultipleRatings") {
                        emty = false;
                    }
                }
            })
            if (emty) $(".groupfour").hide()
            var trustBondRating = this.getCategoryData("TrustBondRating");
            if (detail.length == 0) {
                GSDialog.HintWindow("TrustBond Error: TrustBondItemDefault未获取到数据");
            }
            if (ratingAgent.length == 0) {
                GSDialog.HintWindow("TrustBond Error: RatingAgency未获取到数据");
            }
            TrustBondModule.FormatDate();
            TrustBondModule.DataBinding(dealNode, dataGrid, detail, ratingAgent, trustBondRating);
            TrustBondModule.RegisterEvent();
            //金额大写提示
            var inputObj = $("#OfferAmount"),
                tipDivObj = $("#field1")
            common.tipCHNums(inputObj, tipDivObj);
            //$(".next").click(function () {
            //    debugger
            //})
            //金额大写提示
            var inputObj = $("#Denomination"),
                tipDivObj = $("#field2");
            common.tipCHNums(inputObj, tipDivObj);
            var Orgheight = $(document).height();
            var Orgwidth = $(document).width();


            function showMask(Orgheight, Orgwidth) {
                $("#mask").css("height", Orgheight);
                $("#mask").css("width", Orgwidth);
                $("#mask").show();
            }
            //隐藏遮罩层  
            function hideMask() {
                $("#mask").hide();
            }

            productPermissionState = common.getQueryString('productPermissionState');
            if (productPermissionState == 2) {
                showMask(Orgheight, Orgwidth);
                $(window).resize(function () {
                    var height = $(document).height();
                    var width = $(document).width();
                    //var width = document.getElementsByTagName("body").offsetWidth();
                    console.log(width);
                    showMask(height, width);
                    //hideMask();
                })
            } else {
                hideMask();
                var ht = Math.round($("body").height());
                $(".ant-drawer-content-wrapper").css("height", ht + "px");
                $(".ant-drawer-content-wrapper").css("transform", "translateY(100%)");
                $("#bannerArea").css("height", $("body").height() - 75 + "px");
                //判断类别是否存在 赋值高度
                var arry = TrustBondModule.mymodel.GridView();
                var typeone, typetwo, typethree
                $.each(arry, function (i, v) {
                    if (v.ClassType == "FirstClass") {
                        typeone = true
                    } else if (v.ClassType == "SubClass") {
                        typetwo = true
                    } else if (v.ClassType == "EquityClass") {
                        typethree = true
                    }
                })
                if (!typeone) {
                    $(".typeone").hide()
                } else {
                    $(".typeone").show()
                }
                if (!typetwo) {
                    $(".typetwo").hide()
                } else {
                    $(".typetwo").show()
                }
                if (!typethree) {
                    $(".typethree").hide()
                } else {
                    $(".typethree").show()
                }
                //当无分层信息的时候，直接显示添加分层信息界面
                if (!typeone && !typetwo && !typethree) {
                    initDetail();
                    clear();
                    clearPlusInfo();
                    istbAdd = true;
                    $(".TrustItem_Detail").find("input.form-control.red-border").removeClass("red-border");
                    $(".ant-drawer-content-wrapper").css("transform", "translateY(0)");
                }

                $("[data-toggle='tooltip']").tooltip({});
            }

        },
        update: function () {
            return TrustBondModule.SubmitJson();
        },
        preview: function () {
            return TrustBondModule.PreView();
        },
        validation: function () {
            return true;
        }
    }
    TRUST.TRUST.registerMethods(TrustBond);
    //显示隐藏删除按钮
    $("#RemoveColButtomSH", window.parent.document).click(function () {
        var $this = $(this);
        isShowRemove = !isShowRemove;
        if (isShowRemove == true)
            $this.text(langx.hide);
        else
            $this.text(langx.show);
        RemoveColButtomSH(isShowRemove);
    });
    $("#RemoveColButtomSH", window.parent.parent.document).click(function () {
        var $this = $(this);
        isShowRemove = !isShowRemove;
        if (isShowRemove == true)
            $this.text(langx.hide);
        else
            $this.text(langx.show);
        RemoveColButtomSH(isShowRemove);
    });
    //隐藏盒子
    $("body").on("click", "#closebox", function () {
        $(".ant-drawer-content-wrapper").css("transform", "translateY(100%)");
    })
    //新增分层信息
    $("body").on("click", "#showbox", function () {
        initDetail();
        clear();
        clearPlusInfo();
        istbAdd = true;
        $(".TrustItem_Detail").find("input.form-control.red-border").removeClass("red-border");
        $(".ant-drawer-content-wrapper").css("transform", "translateY(0)");

    })
    //固定盒子头部
    $(".ant-drawer-content-wrapper").scroll(function (e) {
        var top = this.scrollTop - 1;
        $("#TrustBond").find("h3.h3").css("transform", 'translateY(' + top + 'px)')
        if (top <= 0) {
            $("#bold_bod").css("box-shadow", "none")
        } else {
            $("#bold_bod").css("box-shadow", "rgba(0, 0, 0, 0.1) 0px 3px 3px")
        }
        $("#bold_bod").css("transform", 'translateY(' + top + 'px)');
    })
    //删除债券
    $("body #bannerArea").on("click", ".icon.icon-remove", function () {
        TrustBondModule.TrustBond_Delete(this);
    })
    //浏览分层日历界面
    $("body").on("click", ".icon.icon-calendar", function () {
        //TrustBondModule.OpenCalendar(this);
        TrustBondModule.SubjoinInformation(this);
    })
    //编辑债券
    $("body #bannerArea").on("click", ".icon.icon-edit", function () {
        $(".TrustItem_Detail").find("input.form-control.red-border").removeClass("red-border");
        TrustBondModule.TrustBond_Detail(this);
    })
    //收缩
    $("body").on("click", ".tiltespan", function () {
        if ($(this).find(".icon.icon-bottom").length > 0) {
            //收缩
            $(this).find(".icon.icon-bottom").removeClass("icon-bottom").addClass("icon-top");
            $(this).next().slideUp(30)
        } else {
            //展开
            $(this).find(".icon.icon-top").removeClass("icon-top").addClass("icon-bottom");
            $(this).next().slideDown(30)
        }
    })
    window.onresize = function () {
        var ht = Math.round($("body").height());
        $(".ant-drawer-content-wrapper").css("height", ht + "px");
        $("#bannerArea").css("height", $("body").height() - 75 + "px");
    };
    function RemoveColButtomSH(show) {
        var sytles = document.CSSStyleSheet ? document.CSSStyleSheet : document.styleSheets
        $.each(sytles, function (i, sheet) {
            if (sheet.href.indexOf("Layered.css") > -1) {
                var rs = sheet.cssRules ? sheet.cssRules : sheet.rules;
                $.each(rs, function (j, cssRule) {
                    if (cssRule.selectorText && cssRule.selectorText.indexOf("#AddRating") > -1 && cssRule.selectorText.indexOf("#btn_RemoveCompulsory") > -1) {
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
    }
    $("body #addRepaymentOfPrincipalPlan").hide()
    $("body #repaymentOfPrincipalPlan").hide()
    //点击付息计划
    $("body").on("click", "#payInterestPlanTitle", function () {
        $(this).addClass('tabs_titleActive').siblings().removeClass('tabs_titleActive')
        if ($(this).attr('class') == 'tabs_titleActive') {
            $("body #addRepaymentOfPrincipalPlan").hide()
            $("body #payInterestPlan").show()
            $("body #repaymentOfPrincipalPlan").hide()
        } else {
            $("body #addRepaymentOfPrincipalPlan").show()
            $("body #payInterestPlan").hide()
            $("body #repaymentOfPrincipalPlan").show()
        }
    })
    //点击还本计划
    $("body").on("click", "#repaymentOfPrincipalPlanTitle", function () {
        if ($("#bn_PaymentConvention").val() == "固定摊还") {
            $("#addRepaymentOfPrincipalPlan").show();
            $("#repaymentOfPrincipalPlan").find("button").removeAttr("disabled");
            $("#repaymentOfPrincipalPlan").find("input").removeAttr("disabled");
            if ($("#tb_Add").val() == "添加") {
                setPrincipalSchedule($("#bn_PaymentConvention").val(), "");
            }
        } else {
            $("#addRepaymentOfPrincipalPlan").hide();
            $("#repaymentOfPrincipalPlan").find("button").attr("disabled", true);
            $("#repaymentOfPrincipalPlan").find("input").attr("disabled", true);
        }
        $(this).addClass('tabs_titleActive').siblings().removeClass('tabs_titleActive')
        if ($(this).attr('class') == 'tabs_titleActive') {
            $("body #repaymentOfPrincipalPlan").show()
            $("body #payInterestPlan").hide()
        } else {
            $("body #payInterestPlan").show()
            $("body #repaymentOfPrincipalPlan").hide()
        }
    })
})
