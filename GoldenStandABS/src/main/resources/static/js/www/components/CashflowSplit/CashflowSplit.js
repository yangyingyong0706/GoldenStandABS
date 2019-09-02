define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var TrustId = common.getQueryString('TrustId');
    var TrustCode = common.getQueryString('TrustCode');
    var svcUrlTrustManagement = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
    var schedulePurpose = common.getQueryString('schedulePurpose') ? common.getQueryString('schedulePurpose') : 0;//0-表示拆分工具
    var scheduleDateId = common.getQueryString('ScheduleDateId') ? common.getQueryString('ScheduleDateId') : getCurrentDate();
    var operationType = common.getQueryString('OperationType') ? common.getQueryString('OperationType') : 1;
    var poolIds = common.getQueryString('PoolIds') ? common.getQueryString('PoolIds') : '';
    //var scheduleDate = common.getQueryString('ScheduleDateId');//归集日
    //var scheduleDateId = common.getQueryString('scheduleDate') ? common.getQueryString('scheduleDate') : getCurrentDate();
    var isOpen = false;
    var vue = require('Vue2');
    var webProxy = require('gs/webProxy');
    var splitRuleOptionLi = $($(".splitRuleOptionList>li").get(0));
    var xmlRules = '';
    var data = {};
    var modes = [];
    var ruleLength = 6;
    var currentRuleNo = 0;
    var currentRuleName = '';

    var splitRuleOptionList = '';
    var assetAttributesOptionList = '';
    var CollectionRuleOptionList = '';
    var IsBaseOnLoanTerm = '';
    var CalculateHeadInterestByDay = '';
    var CalculateInterestByDays = '';
    var CountLastInterestPeriodByDay = '';
    var AdjustLastPaymentBalance = '';
    var AdjustBalaceDirection = '';
    var AdjustBalacePosition = '';
    var TrailPeriodsCalRule = '';

    var app = '';
    $(function () {
        app = new vue({
            el: '#app',
            data: {
                ModelAssetDetailData: [],
                AssteRuleTypeData: [],
                imgUrl: [],
                Isdisable: false
            },
            filters: {
                //vue时间格式化
                time: function (value) {
                    function add0(m) {
                        return m < 10 ? '0' + m : m
                    }
                    //var time = new Date(parseInt(value.replace(/[^0-9]/ig, "")));
                    var time = new Date(parseInt(value.replace(/[^0-9]/ig, "")));
                    var y = time.getFullYear();
                    var m = time.getMonth() + 1;
                    var d = time.getDate();

                    return y + '-' + add0(m) + '-' + add0(d);
                },
                //金额格式化
                formatCurrency: function (num) {
                    if (!num == "") {
                        num = num.toString().replace(/\$|\,/g, '');
                    }
                    if (isNaN(num))
                        num = "0";
                    sign = (num == (num = Math.abs(num)));
                    num = Math.floor(num * 100 + 0.50000000001);
                    cents = num % 100;
                    num = Math.floor(num / 100).toString();
                    if (cents < 10)
                        cents = "0" + cents;
                    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3) ; i++)
                        num = num.substring(0, num.length - (4 * i + 3)) + ',' +
                        num.substring(num.length - (4 * i + 3));
                    return (((sign) ? '' : '') + num + '.' + cents);
                }
            }
        })


        //TrustCode = getTrustCodeByTrustId(TrustId);
        initModes();
        initElements();
        reisterEvent();
        storageUnfoldRule();
        initReportDate();



        //归集规则分类、配置
        for (var i = 0; i < CollectionRuleOptionList.length; i++) {
            (function (i) {
                CollectionRuleOptionList[i].onclick = function () {
                    var thisVal = $(this).html().trim();
                    var thisActive = $(this).hasClass("change_li");
                    var webProxy = require('gs/webProxy');
                    if (!thisActive) {
                        $(this).addClass("change_li").siblings().removeClass("change_li");
                    }
                    switch (thisVal) {
                        case "定义归集区间":
                            IsBasedOnReportingDate.show();
                            IsRidPrepaid.hide();
                            IsNormalAsset.hide();
                            break;
                        case "过滤归集数据":
                            IsBasedOnReportingDate.hide();
                            IsRidPrepaid.show();
                            IsNormalAsset.show();
                            break;
                        default:
                            IsBasedOnReportingDate.show();
                            IsRidPrepaid.hide();
                            IsNormalAsset.hide();

                    }
                    //var parameterData = [
                    //]
                    //var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
                    //var promise = webProxy.comGetData(parameterData, svcUrl, 'usp_SaveAssetDate');
                    //promise().then(function (response) {
                    //    $(".k-i-refresh").trigger("click");
                    //});
                }
            })(i);
        }
        //计算属性配置
        for (var i = 0; i < assetAttributesOptionList.length; i++) {
            (function (i) {
                assetAttributesOptionList[i].onclick = function () {
                    var thisVal = $(this).html().trim();
                    var thisActive = $(this).hasClass("change_li");
                    var webProxy = require('gs/webProxy');
                    if (!thisActive) {
                        $(this).addClass("change_li").siblings().removeClass("change_li");
                    }
                    switch (thisVal) {
                        case "资产剩余期数计算":
                            CalculateRTBySystem.show();

                            var $RTCalculationRuleOptions = $('#RTCalculationRule-Options');
                            if ($('#CalculateRTBySystem').is(':checked')) {
                                $RTCalculationRuleOptions.show();
                            } else {
                                $RTCalculationRuleOptions.hide();
                            }

                            PeriodsCalRule.hide();
                            break;
                        case "现金流还款期限计算":
                            CalculateRTBySystem.hide();
                            RTCalculationRuleOptions.hide();
                            PeriodsCalRule.show();
                            break;
                        default:
                            CalculateRTBySystem.show();
                            PeriodsCalRule.hide();

                    }
                    //var parameterData = [
                    //]
                    //var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
                    //var promise = webProxy.comGetData(parameterData, svcUrl, 'usp_SaveAssetDate');
                    //promise().then(function (response) {
                    //    $(".k-i-refresh").trigger("click");
                    //});
                }
            })(i);
        }
    })

    //初始化模板
    function initModes() {
        for (var i = 0; i < ruleLength; i++) {
            var mode = {};
            switch (i) {
                case 0:
                    mode.ModeName = "等额本息";
                    break;
                case 1:
                    mode.ModeName = "等额本金";
                    break;
                case 2:
                    mode.ModeName = "等本等息";
                    break;
                case 3:
                    mode.ModeName = "按计划还款";
                    break;
                case 4:
                    mode.ModeName = "按期付息,到期一次性还本";
                    break;
                case 5:
                    mode.ModeName = "到期一次性还本付息";
                    break;
                default:
            }
            mode.CalculateHeadInterestRule = 0;
            mode.CalculateTailInterestRule = 0;
            mode.CalculateTimeInterestRule = 0;
            mode.IsBaseOnLoanTerm = 0;
            mode.AdjustLastPaymentBalance = 0;
            mode.AdjustBalaceDirection = 1;
            mode.AdjustBalacePosition = 1;
            mode.ModeNo = i;
            mode.TrailPeriodsCalRule = 0;
            modes.push(mode);
        }
    }

    //初始化dom元素
    function initElements() {
        //拆分规则配置
        splitRuleOptionList = $(".splitRuleOptionList>li");
        assetAttributesOptionList = $(".assetAttributesOptionList>li");
        CollectionRuleOptionList = $(".CollectionRuleOptionList>li");
        IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").parent();
        CalculateHeadInterestByDay = $("#CalculateHeadInterestByDay").parent();
        CalculateInterestByDays = $("#CalculateInterestByDays").parent();
        CountLastInterestPeriodByDay = $("#CountLastInterestPeriodByDay").parent();
        AdjustLastPaymentBalance = $("#AdjustLastPaymentBalance").parent();
        AdjustBalaceDirection = $("#AdjustBalaceDirection").parent();
        AdjustBalacePosition = $("#AdjustBalacePosition").parent();
        TrailPeriodsCalRule = $("#TrailPeriodsCalRule").parent();


        //归集规则配置
        IsBasedOnReportingDate = $("#IsBasedOnReportingDate").parent();
        IsRidPrepaid = $("#IsRidPrepaid").parent();
        IsNormalAsset = $("#IsNormalAsset").parent();

        //资产属性计算
        PeriodsCalRule = $("#PeriodsCalRule").parent();
        CalculateRTBySystem = $("#CalculateRTBySystem").parent();
        RTCalculationRuleOptions = $('#RTCalculationRule-Options');

        //现金流拆分初始化显示
        IsBaseOnLoanTerm.show();
        CalculateHeadInterestByDay.show();
        //归集规则初始化显示
        IsBasedOnReportingDate.show();
        //资产属性显示
        CalculateRTBySystem.show();
    }
    //基础资产快照日期
    function initReportDate() {
        var selectedDate; //默认选中日期
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = { SPName: 'usp_GetSelectedFactLoanDate', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: TrustId, DBType: 'int' });
        var xd = common.getQueryString('xd');
        executeParams = encodeURIComponent(JSON.stringify(executeParam));
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain=dbo&executeParams=' + executeParams,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                var sourceData;
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
                selectedDate = sourceData[0] != undefined && sourceData[0].SelectedDate != undefined ? sourceData[0].SelectedDate : common.getQueryString("DimReportingDateId");
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });

        executeParam = { SPName: 'usp_GetFactLoanDate', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TrustId', Value: TrustId, DBType: 'int' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain=dbo&executeParams=' + executeParams,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                var sourceData;
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
                var options = "";
                $.each(sourceData, function (i, item) {
                    var ItemReportingDate = item.ReportingDate;
                    var selectedDate = common.getQueryString("DimReportingDateId");
                    if (xd == "start") {
                        options += '<option value="' + item.ReportingDate + '">' + item.ReportingDate + '</option>'
                    }
                    if (selectedDate == ItemReportingDate.replace(/\-/g, '') || selectedDate == ItemReportingDate) {
                        options = '<option value="' + item.ReportingDate + '">' + item.ReportingDate + '</option>'
                    }
                    //if (!selectedDate || item.ReportingDate != selectedDate)
                    //    options += '<option value="' + item.ReportingDate + '">' + item.ReportingDate + '</option>';
                    //else
                    //    options += '<option value="' + item.ReportingDate + '" selected>' + item.ReportingDate + '</option>';
                });
                if (xd == "start") {
                    $('#ReportingDate').append(options).css("border", "1px solid #ccc");
                } else {
                    $('#ReportingDate').append(options).attr("disabled", true).css("border", "none");
                }
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });
    }

    //注册事件
    function reisterEvent() {
        $('#PeriodsCalRule').on('change', function () {
            var value = $(this).val(), $Direction = $('#Direction');
            if (value == 0) {
                $Direction.html(
                    '<option value="1">从资产到期日开始往前推算，资产到期日到前一还款日的区间作为单独一期</option>' +
                    '<option value="2">从资产到期日开始往前推算，资产到期日到前一还款日的区间不作为单独一期</option>' +
                    '<option value="3">从资产到期日开始往前推算，资产到期日所在月的还款日为最后一期还款日</option>'
                );
            } else {
                $Direction.html(
                    '<option value="1">以导入剩余期数（remaining term）为准，从下一个还款日开始往后推算</option>'
                );
            }
        });
        $('#CalculateRTBySystem').on('change', function () {
            var $RTCalculationRuleOptions = $('#RTCalculationRule-Options');
            if ($(this).is(':checked')) {
                $RTCalculationRuleOptions.show();
            } else {
                $RTCalculationRuleOptions.hide();
            }
        });
        $('#btnSubmit').click(function () {
            //$(window.parent.document).find('#modal-close').trigger('click');

            createModeXml(modes);
            data = {
                IsBaseOnLoanTerm: $('#IsBaseOnLoanTerm').val(),//本金计算规则
                CalculateInterestByDays: $('#CalculateInterestByDays').val(),//每期利息计算规则
                CalculateHeadInterestByDay: $('#CalculateHeadInterestByDay').val(), //头部利息计算规则
                CountLastInterestPeriodByDay: $('#CountLastInterestPeriodByDay ').val(),//尾部利息计算规则
                TrailPeriodsCalRule: $('#TrailPeriodsCalRule').val(),//等本等息的尾差调整规则



                PeriodsCalRule: $('#PeriodsCalRule').val(),//现金流期限计算方法,正向/反向
                Direction: $('#Direction').val(),//现金流期限计算方法,从资产到期日开始往前推算，资产到期日到前一还款日的区间作为单独一期
                CalculateRTBySystem: $('#CalculateRTBySystem').is(':checked') ? '1' : '0',//系统计算剩余期限


                IsRidPrepaid: $('#IsRidPrepaid').val(),//是否剔除早偿资产
                IsBasedOnReportingDate: $('input[name="IsBasedOnReportingDate"]:checked').val(),//现金流归集是否从数据日期开始归集
                IsUserStatusNormal: $('#IsUserStatusNormal').is(':checked') ? '1' : '0',//排除用户状态非正常资产
                IsLoanGradeLevelNormal: $('#IsLoanGradeLevelNormal').is(':checked') ? '1' : '0',//排除五级分类非正常资产
                IsNotInArrears: $('#IsNotInArrears').is(':checked') ? '1' : '0',//排除当期逾期天数非0资产
                IsNotMatured: $('#IsNotMatured').is(':checked') ? '1' : '0',//排除数据日期之前已到期资产
                RTCalculationRule: $('input[name="RTCalculationRule"]:checked').val(),//剩余期限计算方式
                ReportingDate: $('#ReportingDate').val()?$('#ReportingDate').val():"",
                PaymentConfiguration: xmlRules,
            }
            sVariableBuilder.AddVariableItem('ScheduleDateId', scheduleDateId, 'String', 1);
            sVariableBuilder.AddVariableItem('ScheduleDate', changeToDate('-', scheduleDateId), 'String', 1);
            sVariableBuilder.AddVariableItem('SchedulePurpose', schedulePurpose, 'Int', 1);
            sVariableBuilder.AddVariableItem('PoolIds', poolIds, 'String', 1);

            if (window.localStorage) localStorage.setItem('splitOptions', JSON.stringify(data));
            sVariableBuilder.AddVariableItem('TrustId', TrustId, 'Int', 1, 0, 0);
            sVariableBuilder.AddVariableItem('TrustCode', TrustCode, 'String', 1, 0, 0);
            sVariableBuilder.AddVariableItem('ReportingDate', data.ReportingDate, 'String', 1, 0, 0);
            sVariableBuilder.AddVariableItem('DimReportingDateId', data.ReportingDate.replace(/-/g, ''), 'String', 1, 0, 0);
            //sVariableBuilder.AddVariableItem('IsBasedOnFullTerm', data.IsBaseOnLoanTerm, 'Int', 1, 0, 0);//IsBasedOnFullTerm和IsBaseOnLoanTerm取得值都是IsBaseOnLoanTerm
            sVariableBuilder.AddVariableItem('IsBaseOnLoanTerm', data.IsBaseOnLoanTerm, 'Int', 1, 0, 0);
            sVariableBuilder.AddVariableItem('CalculateInterestByDays', data.CalculateInterestByDays, 'Int', 1);//考虑拿掉
            sVariableBuilder.AddVariableItem('CalculateHeadInterestByDay', data.CalculateHeadInterestByDay, 'Int', 1);//考虑拿掉
            sVariableBuilder.AddVariableItem('CountLastInterestPeriodByDay', data.CountLastInterestPeriodByDay, 'Int', 1);//考虑拿掉
            sVariableBuilder.AddVariableItem('TrailPeriodsCalRule', data.TrailPeriodsCalRule, 'Int', 1);//考虑拿掉

            //资产属性计算
            sVariableBuilder.AddVariableItem('RangeCalculateRule', data.PeriodsCalRule, 'Int', 1);
            sVariableBuilder.AddVariableItem('PeriodsCalRule', data.PeriodsCalRule, 'Int', 1); //考虑拿掉
            sVariableBuilder.AddVariableItem('LastPayDateRule', data.Direction, 'Int', 1);
            sVariableBuilder.AddVariableItem('CalculateRTBySystem', data.CalculateRTBySystem, 'Int', 1);




            sVariableBuilder.AddVariableItem('IsBasedOnReportingDate', data.IsBasedOnReportingDate, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsRidPrepaid', data.IsRidPrepaid, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsUserStatusNormal', data.IsUserStatusNormal, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsLoanGradeLevelNormal', data.IsLoanGradeLevelNormal, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsNotInArrears', data.IsNotInArrears, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsNotMatured', data.IsNotMatured, 'Int', 1);
            sVariableBuilder.AddVariableItem('RTCalculationRule', data.RTCalculationRule, 'Int', 1);
            sVariableBuilder.AddVariableItem('daysOfYear', '365', 'Int', 1);
            sVariableBuilder.AddVariableItem('OperationType', operationType, 'Int', 1);

            sVariableBuilder.AddVariableItem('adjustLastPaymentBalance', '1', 'Int', 1);
            sVariableBuilder.AddVariableItem('IncludeAPBFPoolCloseDate', 0, 'Int', 1);
            sVariableBuilder.AddVariableItem('PaymentConfiguration', data.PaymentConfiguration, 'String', 1);
            var sVariable = sVariableBuilder.BuildVariables();
            //tpi.ShowIndicator('ConsumerLoan', TaskCodes[PoolHeader.PoolTypeId], element);
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'ImportTrustAssetByFactLoan',
                sContext: sVariable,
                callback: function () {
                    //window.location.href = 'basePoolContent.html?PoolId={0}&PoolName={1}'.format(PoolId, sessionStorage.PoolName);
                    //parent.location.href = parent.location.href;
                    $('#modal-close', window.parent.document).trigger('click');
                    sVariableBuilder.ClearVariableItem();
                }
            });
            tIndicator.show();




            //parent.window.TaskProcessWProxy.CreateSessionShowTask("Task", sessionVariables_p, "ImportTrustAssetByFactLoan");
        });
        $('#btnShowImg').click(function () {
            var self = $(this);
            self.addClass("current_btn").next().removeClass("current_btn");
            $('#ModelAssetDetail').hide();
            $("#AssteRuleType").hide();
            $('#AssetReferenceImg').show();
        })
        $('#btnShowData').click(function () {
            var self = $(this);
            self.addClass("current_btn").prev().removeClass("current_btn");
            $('#AssetReferenceImg').hide();
            $('#ModelAssetDetail').show();
            $("#AssteRuleType").show();
        })
        //拆分方式切换
        $('.splitRuleOptionList>li').click(function () {
            var thisVal = $(this).html().trim();
            var thisActive = $(this).hasClass("change_li");
            if (!thisActive) {
                $(this).addClass("change_li").siblings().removeClass("change_li");
            }
            showRulesByModeName(thisVal);

            resetRule(currentRuleNo);

            var isBaseOnLoanTermV = IsBaseOnLoanTerm.css('display') == 'block' ? $("#IsBaseOnLoanTerm").val() : 0;
            var calculateHeadInterestByDayV = CalculateHeadInterestByDay.css('display') == 'block' ? $("#CalculateHeadInterestByDay").val() : 0;
            var trailPeriodsCalRuleV = TrailPeriodsCalRule.css('display') == 'block' ? $("#TrailPeriodsCalRule").val() : 0;
            var calculateInterestByDaysV = CalculateInterestByDays.css('display') == 'block' ? $("#CalculateInterestByDays").val() : 0;
            var countLastInterestPeriodByDayV = CountLastInterestPeriodByDay.css('display') == 'block' ? $("#CountLastInterestPeriodByDay").val() : 0;
            var adjustLastPaymentBalanceV = AdjustLastPaymentBalance.css('display') == 'block' ? $("#AdjustLastPaymentBalance").val() : 0;
            var adjustBalaceDirectionV = AdjustBalaceDirection.css('display') == 'block' ? $("#AdjustBalaceDirection").val() : 0;
            var adjustBalacePositionV = AdjustBalacePosition.css('display') == 'block' ? $("#AdjustBalacePosition").val() : 0
            selectValText(isBaseOnLoanTermV, calculateHeadInterestByDayV, trailPeriodsCalRuleV, calculateInterestByDaysV, countLastInterestPeriodByDayV, currentRuleNo, function (res) {
                getAssetSplitRuleDataCalback(res)
            });
        });
        $('select').change(function () {
            if (currentRuleNo == 0) {
                if ($("#IsBaseOnLoanTerm").val() == 1) {
                    showRule(true, false, false, false, false, false, false, false);
                }
                else {
                    showRule(true, true, false, false, false, false, false, false);
                }
            }

            getModeByCurrentRule(currentRuleNo, currentRuleName)
        })
        //左侧向导click
        var optionsList = $(".options_list>li");
        var splitRuleOption = $("#splitRuleOption");
        var CollectionRuleOption = $("#CollectionRuleOption");
        var assetAttributesOption = $("#assetAttributesOption");
        for (var i = 0; i < optionsList.length; i++) {
            (function (i) {
                optionsList[i].onclick = function () {
                    var thisActive = $(this).hasClass("listActive");
                    var thisVal = $(this).html().trim();
                    if (!thisActive) {
                        $(this).addClass("listActive").siblings().removeClass("listActive");
                    }
                    switch (thisVal) {
                        case "拆分规则配置":
                            splitRuleOption.addClass("OptionActive").siblings().removeClass("OptionActive");
                            $($(".splitRuleOptionList>li").get(0)).trigger("click");
                            $("#AssetSplitOptions").show();
                            $(".btnsList").css("top", "auto");
                            //$('#btnShowImg').show();
                            //$('#btnShowData').show();
                            break;
                        case "归集规则配置":
                            CollectionRuleOption.addClass("OptionActive").siblings().removeClass("OptionActive");
                            $("#AssetSplitOptions").hide();
                            $(".btnsList").css("top", "178px");
                            //$('#btnShowImg').hide();
                            //$('#btnShowData').hide();
                            break;
                        case "资产属性计算":
                            assetAttributesOption.addClass("OptionActive").siblings().removeClass("OptionActive");
                            $("#AssetSplitOptions").hide();
                            $(".btnsList").css("top", "178px");
                            //$('#btnShowImg').hide();
                            //$('#btnShowData').hide();
                            break;
                        default:
                            splitRuleOption.addClass("OptionActive").siblings().removeClass("OptionActive");
                    }
                }
            })(i);
        }
        //显示图例及样例结果
        function IsShowOpionContext() {
            var IsShowOpionContext = $("#IsShowOpionContext");
            var IsShowBtn = $(".IsShowBtn");
            IsShowOpionContext.on("click", function () {
                if ($(this).html() == "显示图例及样例结果") {
                    IsShowBtn.show();
                    $(this).html("隐藏图例及样例结果");
                    getchangeHeight()
                    $('#AssetReferenceImg').show();
                } else {
                    IsShowBtn.hide();
                    $(this).html("显示图例及样例结果");
                    $('#AssetReferenceImg').hide();
                    $("#AssteRuleType").hide();
                    $("#ModelAssetDetail").hide();
                }
            })
        }
        IsShowOpionContext();

    }

    function selectValText(
                      isBaseOnLoanTerm,
                      calculateHeadInterestByDay,
                      trailPeriodsCalRule,
                      calculateInterestByDays,
                      countLastInterestPeriodByDay,
                      repaymentMode,
                      callback) {
        var parameterDatas = [
          ["PrincipalCount", isBaseOnLoanTerm, "string"]
        , ["HeadInterestCount", calculateHeadInterestByDay, "string"]
        , ["OnScheduleInterestCount", calculateInterestByDays, "string"]
        , ["FooterInterestCount", countLastInterestPeriodByDay, "string"]
        , ["AdjustmentTailRule", trailPeriodsCalRule, "string"]
        , ["RepaymentMode", repaymentMode, "string"]
        ]
        var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=dbo&executeParams=";
        var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_GetAssetSplitRuleData');
        promise().then(function (response) {
            callback(response)
        });
    }

    function getAssetSplitRuleDataCalback(res) {
        var resData = JSON.parse(res);
        app.AssteRuleTypeData.length = 0;
        app.AssteRuleTypeData.push((resData[0]));
        app.ModelAssetDetailData.length = 0;
        app.ModelAssetDetailData.push((resData[1]));
        if (resData[2]) {
            app.imgUrl.length = 0;
            app.imgUrl.push((resData[2])[0].Column1);
        }

    }
    //获取高度函数
    function getchangeHeight() {
        var goh = $("#more-options>.options_list").height();
        var h1 = $("#splitRuleOption").height();
        var h = goh - h1
        console.log(goh, h1, h);
        $("#AssetSplitOptions").css({"height":h+"px","overflow":"auto"})
    }

    //显示每种拆分方式所有的规则
    function showRulesByModeName(modeName) {
        switch (modeName) {
            case '等额本息':
                showRule(true, true, false, false, false, false, false, false);
                currentRuleNo = 0;
                currentRuleName = modeName;
                getchangeHeight()
                break;
            case '等额本金':
                showRule(true, true, true, true, false, false, false, false);
                currentRuleNo = 1;
                currentRuleName = modeName;
                getchangeHeight()
                break;
            case '等本等息':
                showRule(true, true, true, false, true, true, true, true);
                currentRuleNo = 2;
                currentRuleName = modeName;
                getchangeHeight()
                break;
            case '按计划还款':
                showRule(false, true, false, true, false, false, false, false);
                currentRuleNo = 3;
                currentRuleName = modeName;
                getchangeHeight()
                break;
            case '按期付息,到期一次性还本':
                showRule(true, true, false, true, false, false, false, false);
                currentRuleNo = 4;
                currentRuleName = modeName;
                getchangeHeight()
                break;
            case '到期一次性还本付息':
                showRule(true, false, false, false, false, false, false, false);
                currentRuleNo = 5;
                currentRuleName = modeName;
                getchangeHeight()
                break;
            default:
                break;
        }
    }

    //显示规则
    function showRule(isBaseOnLoanTerm, //本金计算规则
                          calculateHeadInterestByDay,//头部利息计算规则
                          trailPeriodsCalRule,//.尾差调整规则
                          calculateInterestByDays,//每期调整规则
                          countLastInterestPeriodByDay,//尾部利息计算规则
                          adjustLastPaymentBalance,
                          adjustBalaceDirection,
                          adjustBalacePosition) {
        isBaseOnLoanTerm ? IsBaseOnLoanTerm.show() : IsBaseOnLoanTerm.hide();
        calculateHeadInterestByDay ? CalculateHeadInterestByDay.show() : CalculateHeadInterestByDay.hide();
        trailPeriodsCalRule ? TrailPeriodsCalRule.show() : TrailPeriodsCalRule.hide();
        calculateInterestByDays ? CalculateInterestByDays.show() : CalculateInterestByDays.hide();
        countLastInterestPeriodByDay ? CountLastInterestPeriodByDay.show() : CountLastInterestPeriodByDay.hide();
        adjustLastPaymentBalance ? AdjustLastPaymentBalance.show() : AdjustLastPaymentBalance.hide();
        adjustBalaceDirection ? AdjustBalaceDirection.show() : AdjustBalaceDirection.hide();
        adjustBalacePosition ? AdjustBalacePosition.show() : AdjustBalacePosition.hide();
    }

    //根据当前所处的拆分方式，获取对应的规则的值
    function getModeByCurrentRule(currentRuleNo, currentRuleName) {
        var isBaseOnLoanTermV = IsBaseOnLoanTerm.css('display') == 'block' ? $("#IsBaseOnLoanTerm").val() : 0;
        var calculateHeadInterestByDayV = CalculateHeadInterestByDay.css('display') == 'block' ? $("#CalculateHeadInterestByDay").val() : 0;
        var trailPeriodsCalRuleV = TrailPeriodsCalRule.css('display') == 'block' ? $("#TrailPeriodsCalRule").val() : 0;
        var calculateInterestByDaysV = CalculateInterestByDays.css('display') == 'block' ? $("#CalculateInterestByDays").val() : 0;
        var countLastInterestPeriodByDayV = CountLastInterestPeriodByDay.css('display') == 'block' ? $("#CountLastInterestPeriodByDay").val() : 0;
        var adjustLastPaymentBalanceV = AdjustLastPaymentBalance.css('display') == 'block' ? $("#AdjustLastPaymentBalance").val() : 0;
        var adjustBalaceDirectionV = AdjustBalaceDirection.css('display') == 'block' ? $("#AdjustBalaceDirection").val() : 0;
        var adjustBalacePositionV = AdjustBalacePosition.css('display') == 'block' ? $("#AdjustBalacePosition").val() : 0
        selectValText(isBaseOnLoanTermV, calculateHeadInterestByDayV, trailPeriodsCalRuleV, calculateInterestByDaysV, countLastInterestPeriodByDayV, currentRuleNo, function (res) {
            getAssetSplitRuleDataCalback(res)
        });

        var rulesInMode = {};
        rulesInMode.ModeName = currentRuleName;
        rulesInMode.ModeNo = currentRuleNo;
        rulesInMode.IsBaseOnLoanTerm = isBaseOnLoanTermV;
        rulesInMode.CalculateHeadInterestRule = calculateHeadInterestByDayV;
        rulesInMode.TrailPeriodsCalRule = trailPeriodsCalRuleV;
        rulesInMode.CalculateTimeInterestRule = calculateInterestByDaysV;
        rulesInMode.CalculateTailInterestRule = countLastInterestPeriodByDayV;
        rulesInMode.AdjustLastPaymentBalance = adjustLastPaymentBalanceV;
        rulesInMode.AdjustBalaceDirection = adjustBalaceDirectionV;
        rulesInMode.AdjustBalacePosition = adjustBalacePositionV;
        modes[currentRuleNo] = rulesInMode;
        console.table(modes);
    }

    function resetRule(ruleNo) {
        $("#IsBaseOnLoanTerm")[0].selectedIndex = modes[ruleNo].IsBaseOnLoanTerm;
        $("#CalculateHeadInterestByDay")[0].selectedIndex = modes[ruleNo].CalculateHeadInterestRule;
        $("#TrailPeriodsCalRule")[0].selectedIndex = modes[ruleNo].TrailPeriodsCalRule;
        $("#CalculateInterestByDays")[0].selectedIndex = modes[ruleNo].CalculateTimeInterestRule;
        $("#CountLastInterestPeriodByDay")[0].selectedIndex = modes[ruleNo].CalculateTailInterestRule;
        $("#AdjustLastPaymentBalance")[0].selectedIndex = modes[ruleNo].AdjustLastPaymentBalance;
        $("#AdjustBalaceDirection")[0].selectedIndex = modes[ruleNo].AdjustBalaceDirection;
        $("#AdjustBalacePosition")[0].selectedIndex = modes[ruleNo].AdjustBalacePosition;
    }
    //生成现金流拆分规则xml
    function createModeXml(_modes) {
        xmlRules = '';
        if (_modes && _modes.length > 0) {
            $.each(_modes, function (i, v) {
                var xmlTemp = '<Mode><ModeNo>{0}</ModeNo>' +
                    '<ModeName>{1}</ModeName>' +
                    '<IsBaseOnLoanTerm>{2}</IsBaseOnLoanTerm>' +
                    '<CalculateHeadInterestRule>{3}</CalculateHeadInterestRule>' +
                    '<CalculateTimeInterestRule>{4}</CalculateTimeInterestRule>' +
                    '<TrailPeriodsCalRule>{5}</TrailPeriodsCalRule>' +
                    '<AdjustLastPaymentBalance>{6}</AdjustLastPaymentBalance>' +
                    '<AdjustBalaceDirection>{7}</AdjustBalaceDirection>' +
                    '<AdjustBalacePosition>{8}</AdjustBalacePosition>' +
                    '<CalculateTailInterestRule>{9}</CalculateTailInterestRule></Mode>'
                xmlTemp = xmlTemp.format(v.ModeNo + 1, v.ModeName, v.IsBaseOnLoanTerm, v.CalculateHeadInterestRule, v.CalculateTimeInterestRule, v.TrailPeriodsCalRule, v.AdjustLastPaymentBalance, v.AdjustBalaceDirection, v.AdjustBalacePosition, v.CalculateTailInterestRule);
                xmlRules += xmlTemp;

            })
            xmlRules = '<![CDATA[<Modes>' + xmlRules + '</Modes>]]>'
        }

    }
    // 缓存拆分规则
    function storageUnfoldRule() {
        if (window.localStorage) {
            var splitOptions = localStorage.getItem('splitOptions');
            if (splitOptions) {
                splitOptions = JSON.parse(splitOptions);
                $.each(splitOptions, function (k, v) {
                    var obj = $('#' + k);
                    if (obj[0]) {
                        if (obj[0].tagName.toLowerCase() == 'input') {
                            var type = obj.attr('type');
                            if (type == 'radio') {
                                $("input[name='" + k + "'][value='" + v + "']").prop('checked', true);
                            } else {
                                obj.prop('checked', (v === '1') ? true : false);
                                if (k === 'CalculateRTBySystem') {
                                    if (v == '1') {
                                        obj.trigger('change');
                                    }
                                }
                            }
                        } else {
                            obj.val(v);
                            if (k === 'PeriodsCalRule') {
                                if (v == '1') {
                                    obj.trigger('change');
                                }
                            }
                        }
                    }
                });
            }
        }
        //var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        //var TrustId = common.getQueryString('TrustId');
        //var executeParam = { SPName: 'usp_GetFactLoanDate', SQLParams: [] };
        //executeParam.SQLParams.push({ Name: 'TrustId', Value: TrustId, DBType: 'int' });

        //var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        //$.ajax({
        //    cache: false,
        //    type: "GET",
        //    async: false,
        //    url: svcUrl + 'appDomain=dbo&executeParams=' + executeParams,
        //    dataType: "json",
        //    contentType: "application/xml;charset=utf-8",
        //    data: {},
        //    success: function (response) {
        //        var sourceData;
        //        if (typeof response === 'string') { sourceData = JSON.parse(response); }
        //        else { sourceData = response; }
        //        var options = "";
        //        $.each(sourceData, function (i, item) {
        //            options += '<option value="' + item.ReportingDate + '">' + item.ReportingDate + '</option>';
        //        });
        //        $('#ReportingDate').append(options);
        //    },
        //    error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        //});
    }

    //根据trustid获取trustcode
    function getTrustCodeByTrustId(trustid) {
        var executeParam = {
            SPName: 'usp_GetTrustInfo', SQLParams: [
                { Name: 'trustId', value: trustid, DBType: 'int' }
            ]
        };

        var result = common.ExecuteGetData(false, svcUrlTrustManagement, 'TrustManagement', executeParam);

        var res = ''
        if (result.length > 0) {
            result.forEach(function (v, i) {
                if (v.ItemCode == 'TrustCode') {
                    res = v.ItemValue;
                    return;
                }
            });
        }
        return res;
    }

    //获取当前时间
    function getCurrentDate() {
        var currentDate = '';
        var now = new Date();
        var y = now.getFullYear();
        var m = (now.getMonth() + 1 < 10) ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1);
        var d = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
        currentDate = y + '' + m + '' + d;
        return currentDate;
    }

    //yyyyMMdd转成指定形式，如yyyy-MM-dd
    function changeToDate(spe, strDate) {
        if (strDate.length != 8) {
            return;
        }
        var y = strDate.substring(0, 4);
        var m = strDate.substring(4, 6);
        var d = strDate.substring(6, 8);

        spe = spe.trim();

        return y + spe + m + spe + d;
    }

});