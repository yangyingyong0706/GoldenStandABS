define(function (require) {
    var $ = require('jquery');
    var toast = require('toast');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    require('gs/renderControl');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var TrustId = common.getQueryString('TrustId');
    var TrustCode = common.getQueryString('TrustCode');
    var svcUrlTrustManagement = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
    var schedulePurpose = common.getQueryString('schedulePurpose') ? common.getQueryString('schedulePurpose') : 0;//0-表示拆分工具
    var scheduleDateId = common.getQueryString('ScheduleDateId') ? common.getQueryString('ScheduleDateId') : getCurrentDate();
    var ScenarioId = common.getQueryString('ScenarioId') ? common.getQueryString('ScenarioId') : 1;//1典型压测，0快速压测

    var operationType = common.getQueryString('OperationType') ? common.getQueryString('OperationType') : 1;
    var poolIds = common.getQueryString('PoolIds') ? common.getQueryString('PoolIds') : '';
    var scheduleDate = common.getQueryString('ScheduleDateId');//归集日
    var ReportingDate = common.getQueryString("DimReportingDateId")?common.getQueryString("DimReportingDateId"):"1900-01-01"//基础快照日
    var GSDialog = require("gsAdminPages");
    var rk = common.getQueryString('rk');
    var entry = common.getQueryString('entry');
    require("bootstrap");
    require("ischeck");
    var showMore = false;
    if (entry) {
        showMore = false;
        //$('#more-options').height('495px');   
    } else {
        showMore = true;
    }

    //var scheduleDateId = common.getQueryString('scheduleDate') ? common.getQueryString('scheduleDate') : getCurrentDate();
    var isOpen = false;
    var vue = require('Vue2');
    var webProxy = require('gs/webProxy');
    var splitRuleOptionLi = $($(".splitRuleOptionList>li").get(0));
    var xmlRules = '';
    var data = {};
    var modes = [];
    var modex = [];
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
    var AdjustmentOfprincipal = "";
    var RulesOfCalculationList = "";
    var app = {
        data: {
            showTask: false
        }
    };
    
    $(function () {
        app = new vue({
            el: '#app',
            data: {
                ModelAssetDetailData: [],
                AssteRuleTypeData: [],
                imgUrl: [],
                Isdisable: false,
                showTask: false,
                MustTableThead: [],
                MustItem: '',
                time: '',
                Operater: sessionStorage.getItem("gs_UserName"),
                fileName: '',
                showMore: showMore,
                DataType: [],
                otype: {},
                loading: true,
                DownloadMustWordBoolean: false,
                DownloadButtomHide1: 0,
                DownloadButtomHide2: 0,
                DownloadButtomHide3: 0,
            },
            watch: {
                DownloadButtomHide1:function(newV,oldV) {
            		this.DownloadMustWordBoolean = false
            	},
            	DownloadButtomHide2:function(newV,oldV) {
            		this.DownloadMustWordBoolean = false
            	},
            	DownloadButtomHide3: function (newV, oldV) {
            	    this.DownloadMustWordBoolean = false
            	}
            },
            mounted: function() {
                this.GetDataType();
            },
            methods: {
            	//打开历史记录页面
            	openHistoryRecord:function() {
            		var pageUrl="./HistoryRecord.html";
            		//$("#modal-wrap>div>div", window.parent.document).eq(0).css("background","rgba(0,0,0,.3)")
            		common.showDialogPage(pageUrl, '历史记录', 800, 540, function() {
            			//$("#modal-wrap>div>div", window.parent.document).eq(0).css("background","rgb(243, 245, 250)")
            		});
            	},
                GetMustWord: function ($event) {
                    var self = this;
                    var target = $event.target;
                    var HEinfo = getHEdata();
                    var assetType, filePath, TargetField, ChineseField;
                    if (!entry) {
                        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        var executeParam1 = {
                            'SPName': "dbo.usp_getExcelFromTrustId", 'SQLParams': [
                                      { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' },
                            ]
                        }; 
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam1, function (data) {
                            console.log(data[0].AssetType + "for test");
                            assetType = data[0].AssetType;
                        })
                    }
                    else {
                        assetType = self.otype;
                    }
                    switch (assetType) {
                        case "AUTO":
                            filePath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_车贷.xlsx"
                            self.fileName = "资产导入模板_车贷";
                            break;
                        case "RMBS":
                            filePath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_房贷.xlsx"
                            self.fileName = "资产导入模板_房贷"
                            break;
                        case "CLO":
                            filePath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_CLO.xlsx"
                            self.fileName = "资产导入模板_CLO"
                            break;
                        case "ConsumerLoan":
                            filePath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_消费.xlsx"
                            self.fileName = "资产导入模板_消费"
                            break;
                        case "ABN":
                            filePath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_ABN.xlsx"
                            self.fileName = "资产导入模板_ABN"
                            break;
                        case "CreditCard":
                            filePath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx"
                            self.fileName = "资产导入模板_信用卡"
                            break;
                        case "Receivables":
                            filePath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_应收账款.xlsx"
                            self.fileName = "资产导入模板_应收账款"
                            break;
                        case "MarginTrading":
                            filePath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_融资融券.xlsx"
                            self.fileName = "资产导入模板_融资融券"
                            break;
                        case "FinanceLease":
                            filePath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_融资租赁.xlsx"
                            self.fileName = "资产导入模板_融资租赁"
                            break;
                    }
                    var executeParam = {
                        'SPName': "dbo.usp_getRequiredFieldValues", 'SQLParams': [
                                  { 'Name': 'ConfigurationMethod', 'Value': HEinfo.Step, 'DBType': 'string' },
                                  { 'Name': 'ConfigurationHeadDate', 'Value': HEinfo.H, 'DBType': 'string' },
                                  { 'Name': 'ConfigurationTailDate', 'Value': HEinfo.E, 'DBType': 'string' }
                        ]
                    };
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                        console.log(data[0].TargetField);
                        console.log(data[0].ChineseField);
                        TargetField = data[0].TargetField;
                        ChineseField = data[0].ChineseField;
                        
                    })
                    
                    self.time = (new Date()).getTime();


                    var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\RequireField\\"+self.fileName+ "_" + self.time + ".xlsx";
                    sVariableBuilder.AddVariableItem('filePath', filePath, 'String', 1);
                    sVariableBuilder.AddVariableItem('TargetField', TargetField, 'String' , 1);
                    sVariableBuilder.AddVariableItem('ChineseField', ChineseField, 'String', 1);
                    sVariableBuilder.AddVariableItem('desPath', desPath, 'String', 1);
                    sVariableBuilder.AddVariableItem('HEinfoStep', HEinfo.Step, 'String', 1);
                    sVariableBuilder.AddVariableItem('HEinfoH', HEinfo.H, 'String', 1);
                    sVariableBuilder.AddVariableItem('HEinfoE', HEinfo.E, 'String', 1);
                    sVariableBuilder.AddVariableItem('Operater', self.Operater, 'String', 1);
                    sVariableBuilder.AddVariableItem('assettype', self.fileName, 'String', 1);
                    var sVariable1 = sVariableBuilder.BuildVariables();

                    var tIndicator = new taskIndicator({
                        width: 500,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'ConsumerLoan',
                        taskCode: 'MarkExcelAndExport',
                        sContext: sVariable1,
                        callback: function () {
                        	var sessionId = sessionStorage.getItem('sessionId');
                            webProxy.getSessionProcessStatusList(sessionId, "ConsumerLoan", function(response){
                                for(let i = 0; i < response.GetSessionProcessStatusListResult.List.length; i++) {
                                    if (response.GetSessionProcessStatusListResult.List[i].ActionStatus != "Success") {
                                        self.DownloadMustWordBoolean = false;
                                        return false;
                                    }
                                        
                                }
                                $(target).next().show();
                                self.DownloadMustWordBoolean = true;
                            });
                            sessionStorage.removeItem('sessionId');
                            /*var key = sessionStorage.getItem("MarkSucucess");
                            if (key) {
                                $(target).next().show();
                                self.DownloadMustWordBoolean = true
                            }
                            sessionStorage.removeItem("MarkSucucess");*/
                            //$('#modal-close', parent.document)[0].click()
                            sVariableBuilder.ClearVariableItem();
                            
                        }
                    });

                    tIndicator.show();
                },
                DownloadMustWord: function(){
                    console.log(this.time);
                    //window.open(this.desPath);
                    window.location.href = '/PoolCut/Files/RequireField/' + this.fileName + "_" + this.time + '.xlsx';
                },
                IsShowTask: function () {
                    this.showTask = true;
                },
                GetDataType: function () {
                    var self = this;
                    var executeParam = { SPName: 'dbo.usp_GetDimAssetID', SQLParams: [] };
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;
                    CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                        console.log(data);
                        self.DataType = data;
                        self.otype = data[0]['AssetType'];
                        if (entry) {
                            $(".banner-image-area>li").eq(0).trigger("click");
                        }
                        self.loading = false;
                        //$("input[type='radio']").iCheck({
                        //    radioClass: 'iradio_square-blue'
                        //});
                        //$("input[type='checkbox']").iCheck({
                        //    checkboxClass: 'icheckbox_square-blue'
                        //});

                    });
                }
                
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
        //点击input  radio 下载按钮消失getStepInfo
        $('input').on('ifChecked', function(event) { //ifCreated 事件应该在插件初始化之前绑定 
			$(".DownloadHide").hide()
		});
        //TrustCode = getTrustCodeByTrustId(TrustId);
        initModes();
        initElements();
        reisterEvent();
        storageUnfoldRule();
        LoadSplitList();
        if (!entry) {
            initReportDate();
            getStepInfo(TrustId, ReportingDate, scheduleDate, function (res) {
                console.log(res);
                if (res.length != 0) {
                    //参数类型
                    var typeStep = res[0].Step;
                    var typeE = res[0].E;
                    var typeH = res[0].H
                    //判断渲染页面
                    switch (typeStep) {
                        case "T_C_HISS":
                            $("#groupone").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                            rendOne();
                            $("#payyes").trigger("click")
                            renderEpar(typeE)
                            break;
                        case "T_C_HNTS":
                            $("#groupone").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                            rendOne();
                            $("#paynot").trigger("click")
                            renderEpar(typeE)
                            break;
                        case "H_T_CISL":
                            $("#grouptwo").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                            rendTwo();
                            $("#endyes").trigger("click")
                            renderHpar(typeH);
                            break;
                        case "H_T_CNTL":
                            $("#grouptwo").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                            rendTwo();
                            $("#endnot").trigger("click")
                            renderHpar(typeH);
                            break;
                        case "H_C_T":
                            $("#groupthree").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                            rendThree();
                            renderHpar(typeH);
                            renderEpar(typeE);
                    }
                } else {
                    $("#levesecondarea").hide()
                }
            })
        }
        function CallWCFSvc(svcUrl, isAsync, rqstType, fnCallback) {
            var sourceData;
            $.ajax({
                cache: false,
                type: rqstType,
                async: isAsync,
                url: svcUrl,
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response == 'string')
                        sourceData = JSON.parse(response);
                    else
                        sourceData = response;
                    if (fnCallback) fnCallback(sourceData);
                },
                error: function (response) { alert('Error occursed while requiring the remote source data!'); }
            });

            if (!isAsync) { return sourceData; }
        }
        //首尾参数判断及页面渲染
        function renderEpar(info) {
            switch (info) {
                case "C-1":
                    $("#Ef01").trigger("click");
                    break;
                case "C_C-2":
                    $("#Ef02").trigger("click");
                    break;
                case "C_C-1":
                    $("#Ef03").trigger("click");
                    break;
                case "C":
                    $("#Ef04").trigger("click");
                    break;
                case "C+1":
                    $("#Ef05").trigger("click");
                    break;
                case "C+M":
                    $("#Ef06").trigger("click");
                    break;
                default:
                    $("#Ef01").trigger("click");
            }
        }
        function renderHpar(info) {
            switch (info) {
                case "S+1":
                    $("#Cmethod").trigger("click");
                    break;
                case "S+2":
                    $("#Smethod").trigger("click");
                    break;
                case "S":
                    $("#Dmethod").trigger("click");
                    break;
                case "S+1P":
                    $("#Hmethod").trigger("click");
                    break;
                default:
                    $("#Cmethod").trigger("click");
            }
        }
        function rendOne() {
            $("#levefirstarea").show();
            $("#levesecondarea").hide();
            $("#levefirstareaChild").show();
            $("#levesecondareaChild").hide();
        }
        function rendTwo() {
            $("#levefirstarea").hide();
            $("#levesecondarea").show();
            $("#levefirstareaChild").hide();
            $("#levesecondareaChild").show();
        };
        function rendThree() {
            $("#levefirstarea").show();
            $("#levesecondarea").show();
            $("#levefirstareaChild").hide();
            $("#levesecondareaChild").hide();
        }
        
        //归集规则分类、配置
        for (var i = 0; i < CollectionRuleOptionList.length; i++) {
            (function (i) {
                CollectionRuleOptionList[i].onclick = function () {
                    var thisVal = $(this).find('span').html().trim();
                    var thisActive = $(this).hasClass("active chrome-tab-current");
                    var webProxy = require('gs/webProxy');
                    if (!thisActive) {
                        $(this).addClass("active chrome-tab-current").siblings().removeClass("active chrome-tab-current");
                    }
                    switch (thisVal) {
                        case "定义归集区间":
                            IsBasedOnReportingDate.show();
                            IsRidPrepaid.hide();
                            IsNormalAsset.hide();
                            $(".boxArea").hide();
                            $("#cashgoback").show()
                            break;
                        case "过滤归集数据":
                            IsBasedOnReportingDate.hide();
                            $(".boxArea").show();
                            $("#cashgoback").hide()
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
        //for (var i = 0; i < assetAttributesOptionList.length; i++) {
        //    (function (i) {
        //        $(assetAttributesOptionList).eq(i).find("input")[0].onclick = function () {
        //            var thisVal = $(this).val();
        //            console.log(thisVal);
        //            var thisActive = $(this).parent().hasClass("change_li");
        //            var webProxy = require('gs/webProxy');
        //            if (!thisActive) {
        //                $(this).parent().addClass("change_li").siblings().removeClass("change_li");
        //            }
        //            if (thisVal == "1") {
        //                $(".Hbox").hide();
        //                $(".Hbox").prev().hide();
        //                $(".Ebox").show();
        //                $(".Ebox").prev().show();
        //                $("#levefirstarea").show();
        //                $("#levesecondarea").hide();
        //            } else if (thisVal == "2") {
        //                $(".Ebox").hide();
        //                $(".Ebox").prev().hide();
        //                $(".Hbox").show();
        //                $(".Hbox").prev().show();
        //                $("#levefirstarea").hide();
        //                $("#levesecondarea").show();
        //            } else if (thisVal == "H_C_T") {
        //                $(".Ebox").show();
        //                $(".Ebox").prev().show();
        //                $(".Hbox").show();
        //                $(".Hbox").prev().show();
        //                $("#levefirstarea").hide();
        //                $("#levesecondarea").hide();
        //            }


        //        }
        //    })(i);
        //}
        $("#assetAttributesOption").on("click", ".banner-image-area>li", function () {
            $(this).removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
            var index = $(this).index();
            if (index == 0) {
                $("#levefirstarea").show();
                $("#levesecondarea").hide();
                $("#levefirstareaChild").show();
                $("#levesecondareaChild").hide();
            } else if (index == 1) {
                $("#levefirstarea").hide();
                $("#levesecondarea").show();
                $("#levefirstareaChild").hide();
                $("#levesecondareaChild").show();
            } else if (index == 2) {
                $("#levefirstarea").show();
                $("#levesecondarea").show();
                $("#levefirstareaChild").hide();
                $("#levesecondareaChild").hide();
            }
        })
    })
    
    //初始化模板
    function initModes() {
        for (var i = 0; i < ruleLength; i++) {
            var mode = {};
            switch (i) {
                case 0:
                    mode.ModeName = "等额本息";
                    mode.IsBaseOnLoanTerm = 0;//选择拆分基准
                    mode.CalculateHeadInterestRule = 1;//选择首期利息计算规则
                    //以下值全为-1(表示用不到的规则)
                    mode.CalculateTimeInterestRule = -1;//选择每期利息计算规则
                    mode.AdjustPrincipalByPlan = -1;//是否基于计划值调整本金
                    mode.AdjustmentOfprincipal = -1//是否基于计划值调整本金、手续费
                    mode.IsPrincipalInterestSync = -1;//利息还款日是否和本金还款日同步
                    mode.InterestCutOffDay = -1;//利息计算截止日
                    mode.IsNaturalSeason = -1;//付息日是否要求“自然季节”
                    mode.CalculateTailInterestRule = -1//是否基于计划值调整手续费
                    break;
                case 1:
                    mode.ModeName = "等额本金";
                    mode.IsBaseOnLoanTerm = 0;//选择拆分基准
                    mode.CalculateHeadInterestRule = 1;//选择首期利息计算规则
                    mode.CalculateTimeInterestRule = 1;//选择每期利息计算规则
                    mode.AdjustPrincipalByPlan = 0;//是否基于计划值调整本金
                    //以下值全为-1(表示用不到的规则)
                    mode.AdjustmentOfprincipal = -1//是否基于计划值调整本金、手续费
                    mode.IsPrincipalInterestSync = -1;//利息还款日是否和本金还款日同步
                    mode.InterestCutOffDay = -1;//利息计算截止日
                    mode.IsNaturalSeason = -1;//付息日是否要求“自然季节”
                    mode.CalculateTailInterestRule = -1//是否基于计划值调整手续费
                    break;
                case 2:
                    mode.ModeName = "等本等息";
                    mode.IsBaseOnLoanTerm = 0;//选择拆分基准
                    mode.AdjustmentOfprincipal = 0//是否基于计划值调整本金、手续费
                    //以下值全为-1(表示用不到的规则)
                    mode.CalculateTimeInterestRule =-1;//选择每期利息计算规则
                    mode.IsPrincipalInterestSync = -1;//利息还款日是否和本金还款日同步
                    mode.InterestCutOffDay = -1;//利息计算截止日
                    mode.IsNaturalSeason = -1;//付息日是否要求“自然季节”
                    mode.AdjustPrincipalByPlan = -1;//是否基于计划值调整本金
                    mode.CalculateTailInterestRule = -1//是否基于计划值调整手续费
                    mode.CalculateHeadInterestRule = -1;//选择首期利息计算规则
                    break;
                case 3:
                    mode.ModeName = "按计划还款";
                    mode.IsBaseOnLoanTerm = 0;//选择拆分基准
                    mode.CalculateHeadInterestRule = 1;//选择首期利息计算规则
                    mode.CalculateTimeInterestRule = 1;//选择每期利息计算规则
                    mode.IsPrincipalInterestSync = 0;//利息还款日是否和本金还款日同步
                    mode.InterestCutOffDay = 1;//利息计算截止日
                    mode.IsNaturalSeason = 0;//付息日是否要求“自然季节”
                    //以下值全为-1(表示用不到的规则)
                    mode.AdjustPrincipalByPlan = -1;//是否基于计划值调整本金
                    mode.CalculateTailInterestRule = -1//是否基于计划值调整手续费
                    mode.AdjustmentOfprincipal = -1//是否基于计划值调整本金、手续费
                    break;
                case 4:
                    //mode.ModeName = "按期付息,到期一次性还本";
                    mode.ModeName = "按期付息,到期还本";
                    mode.IsBaseOnLoanTerm = 0;//选择拆分基准
                    mode.CalculateHeadInterestRule = 1;//选择首期利息计算规则
                    mode.CalculateTimeInterestRule = 1;//选择每期利息计算规则
                    mode.IsNaturalSeason = 0;//付息日是否要求“自然季节”
                    //以下值全为-1(表示用不到的规则)
                    mode.AdjustPrincipalByPlan = -1;//是否基于计划值调整本金
                    mode.IsPrincipalInterestSync = -1;//利息还款日是否和本金还款日同步
                    mode.InterestCutOffDay = -1;//利息计算截止日
                    mode.CalculateTailInterestRule = -1//是否基于计划值调整手续费
                    mode.AdjustmentOfprincipal = -1//是否基于计划值调整本金、手续费
                    break;
                case 5:
                    mode.ModeName = "到期一次性还本付息";
                    mode.IsBaseOnLoanTerm = 0;//选择拆分基准
                    //以下值全为-1(表示用不到的规则)
                    mode.CalculateHeadInterestRule = -1;//选择首期利息计算规则
                    mode.CalculateTimeInterestRule = -1;//选择每期利息计算规则
                    mode.AdjustPrincipalByPlan = -1;//是否基于计划值调整本金
                    mode.IsPrincipalInterestSync = -1;//利息还款日是否和本金还款日同步
                    mode.InterestCutOffDay = -1;//利息计算截止日
                    mode.IsNaturalSeason = -1;//付息日是否要求“自然季节”
                    mode.CalculateTailInterestRule = -1//是否基于计划值调整手续费
                    mode.AdjustmentOfprincipal = -1//是否基于计划值调整本金、手续费
                    break;
                default:
            }
            mode.ModeNo = i;
            modes.push(mode);
        }
    }
    console.log(modes);
    //初始化dom元素
    function initElements() {
        //拆分规则配置
        splitRuleOptionList = $(".splitRuleOptionList>li");
        assetAttributesOptionList = $(".assetAttributesOptionList>li");
        //计算规则
        RulesOfCalculationList = $(".banner-image-area>li");
        CollectionRuleOptionList = $(".CollectionRuleOptionList>li");
        IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").parent();
        CalculateHeadInterestByDay = $("#CalculateHeadInterestByDay").parent();
        CalculateInterestByDays = $("#CalculateInterestByDays").parent();
        CountLastInterestPeriodByDay = $("#CountLastInterestPeriodByDay").parent();
        AdjustLastPaymentBalance = $("#AdjustLastPaymentBalance").parent();
        AdjustBalaceDirection = $("#AdjustBalaceDirection").parent();
        AdjustBalacePosition = $("#AdjustBalacePosition").parent();
        TrailPeriodsCalRule = $("#TrailPeriodsCalRule").parent();
        AdjustmentOfprincipal = $("#AdjustmentOfprincipal").parent();

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
        var xd = common.getQueryString('xd');
        executeParam.SQLParams.push({ Name: 'TrustId', Value: TrustId, DBType: 'int' });

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
                        options+= '<option value="' + item.ReportingDate + '">' + item.ReportingDate + '</option>'
                    }
                    if (selectedDate == ItemReportingDate.replace(/\-/g, '') || selectedDate == ItemReportingDate) {
                        options = '<option value="' + item.ReportingDate + '">' + item.ReportingDate + '</option>'
                    }
                    //if (!selectedDate || item.ReportingDate != selectedDate)
                    //    options += '<option value="' + item.ReportingDate + '">' + item.ReportingDate + '</option>';
                    //else
                    //    options += '<option value="' + item.ReportingDate + '" selected>' + item.ReportingDate + '</option>';
                });
                if (xd =="start") {
                    $('#ReportingDate').append(options).css("border", "1px solid #ccc");
                } else {
                    $('#ReportingDate').append(options).attr("disabled", true).css("border","none");
                }
                //$('#ReportingDate').append(options).attr("disabled", true);
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
        //查看拆分规则说明
        $('#checkRules').click(function() {
			GSDialog.open('拆分规则案例', 'checkRules.html', '', function(result) {
				if(result) {
					window.location.reload();
				}
			}, 1100, 580, '', true, true, true, false)
		})
        $('#checkRules2').click(function() {
			GSDialog.open('拆分规则案例', 'checkRules.html', '', function(result) {
				if(result) {
					window.location.reload();
				}
			}, 1100, 580, '', true, true, true, false)
        })
        //
        //显示添加配置项按钮
        $("body").on("click", "#ShowOptionItem", function () {
            $(".OptionInput").eq(1).show()
        })
        //隐藏添加配置项按钮
        $("body").on("click", "#hideOptionItem", function () {
            $(".OptionInput").eq(1).hide()
        })
        //添加配置项
        $("body").on("click", "#AddOptionItem", function () {
            var addName = $(this).prev().val()
            if (!addName) {
                $.toast({ type: 'warning', message: '请填写名称！' })
                return false;
            }else{
                $("#ConfigCode").val(addName);
                createConfigXml();
            }
        })
        //编辑当前配置项 	    
        $("body").on("click", ".icon.icon-edit", function () {
            var value="";
            if ($(this).parents('tr').find('.input_inner_style').attr('disabled')) {
                $(this).parents('tr').find('.input_inner_style').removeAttr('disabled')
                $(this).parents('tr').find('.input_inner_style').next().show();
                value=$(this).parents('tr').find('.input_inner_style').val()
            } else {
                $(this).parents('tr').find('.input_inner_style').prop('disabled', 'disabled')
                $(this).parents('tr').find('.input_inner_style').next().hide();
                value=$(this).parents('tr').find('.input_inner_style').val()
            }
            sessionStorage.setItem("oldValue", value)
        })
        //确定修改值	    
        $("body").on("click", ".maketrue", function () {
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            var oldvalue = sessionStorage.getItem("oldValue");
            var newValue =$(this).prev().val();
            var username = sessionStorage.getItem("gs_UserName")
            if (oldvalue == newValue) {
                $(this).hide()
                $(this).prev().prop('disabled', 'disabled')
                return false
            }
            if (newValue == "") {
                $.toast({ type: 'warning', message: '请填写名称！' })
                return false
            }
            var executeParam = {
                'SPName': "usp_EditCashflowSplitCode", 'SQLParams': [
                          { 'Name': 'oldCashCode', 'Value': oldvalue, 'DBType': 'string' },
                          { 'Name': 'newCashcode', 'Value': newValue, 'DBType': 'string' },
                          { 'Name': 'username', 'Value': username, 'DBType': 'string' },
                ]
            };
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                if (data[0].result == '0') {
                    $.toast({ type: 'warning', message: '配置名称重复！' })
                } else if (data[0].result == '1') {
                    $.toast({ type: 'success', message: '修改配置名称成功！' })
                    LoadSplitList();
                }
            })
        })
        //加载配置
        $("body").on("click", ".icon.icon-cog-alt", function () {
            var value = $(this).parents("tr").find(".input_inner_style").val();
            LoadSplitConfig(value)
        })
        //删除该项
        $("body").on("click", ".icon.icon-trash-empty", function () {
            var code = $(this).parents('tr').find('.input_inner_style').val();
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            var username = sessionStorage.getItem("gs_UserName");
            GSDialog.HintWindowTF('是否确认删除该配置?',function(){
                var executeParam = {
                    'SPName': "usp_DeleteCashflowSplitCode", 'SQLParams': [
                              { 'Name': 'CashCode', 'Value': code, 'DBType': 'string' },
                              { 'Name': 'username', 'Value': username, 'DBType': 'string' },
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    $.toast({type: 'success', message: '删除成功', afterHidden: function () {
                            LoadSplitList();
                    }})
                })
            },'',false)

        })

        $("body").on("click", "#DataOption", function () {
            $.anyDialog({
                width: 900,
                height: 400,
                title: '数据配置',
                html: $("#DataOptionList").clone(true).show(),
            })
        })
        
        $('#btnSubmit').click(function () {
            //$(window.parent.document).find('#modal-close').trigger('click');
            var HEinfo = getHEdata();
            createModeXml(modes, HEinfo.H, HEinfo.E, HEinfo.Step);

            data = {
                IsBaseOnLoanTerm: $("#IsBaseOnLoanTerm").val(),//选择拆分基准
                CalculateInterestByDays: $('#CalculateInterestByDays').val(),//选择每期利息计算规则
                CalculateHeadInterestByDay: $('#CalculateHeadInterestByDay').val(), //选择首期利息计算规则
                TrailPeriodsCalRule: $('#TrailPeriodsCalRule').val(),//是否基于计划值调整本金            
                AdjustmentOfprincipal: $("#AdjustmentOfprincipal").val(),//是否基于计划值调整本金、手续费
                CountLastInterestPeriodByDay: $('#CountLastInterestPeriodByDay ').val(),//是否基于计划值调整手续费
                AdjustLastPaymentBalance: $("#AdjustLastPaymentBalance").val(),//利息还款日是否和本金还款日同步
                AdjustBalaceDirection: $("#AdjustBalaceDirection").val(),//利息计算截止日
                AdjustBalacePosition: $("#AdjustBalacePosition").val(),//付息日是否要求“自然季节”
                //
                IsBasedOnReportingDate: $('input[name="IsBasedOnReportingDate"]:checked').val(),//现金流归集是否从数据日期开始归集
                IsUserStatusNormal: $('#IsUserStatusNormal').is(':checked') ? '1' : '0',//排除用户状态非正常资产
                IsLoanGradeLevelNormal: $('#IsLoanGradeLevelNormal').is(':checked') ? '1' : '0',//排除五级分类非正常资产
                IsNotInArrears: $('#IsNotInArrears').is(':checked') ? '1' : '0',//排除当期逾期天数非0资产
                IsNotMatured: $('#IsNotMatured').is(':checked') ? '1' : '0',//排除数据日期之前已到期资产
                IsRidPrepaid: $('input[name="IsRidPrepaid"]:checked').val() == '是'?'1' : '0',
                ReportingDate: $('#ReportingDate').val()?$('#ReportingDate').val():"",
                PaymentConfiguration: xmlRules,
                ScenarioId: ScenarioId
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
            sVariableBuilder.AddVariableItem('CalculateInterestByDays', data.CalculateInterestByDays, 'Int', 1);
            sVariableBuilder.AddVariableItem('CalculateHeadInterestByDay', data.CalculateHeadInterestByDay, 'Int', 1);
            sVariableBuilder.AddVariableItem('CountLastInterestPeriodByDay', data.CountLastInterestPeriodByDay, 'Int', 1);
            sVariableBuilder.AddVariableItem('TrailPeriodsCalRule', data.TrailPeriodsCalRule, 'Int', 1);
            sVariableBuilder.AddVariableItem('AdjustmentOfprincipal', data.AdjustmentOfprincipal, 'Int', 1);
            sVariableBuilder.AddVariableItem('AdjustLastPaymentBalance', data.AdjustLastPaymentBalance, 'Int', 1);
            sVariableBuilder.AddVariableItem('AdjustBalaceDirection', data.AdjustBalaceDirection, 'Int', 1);
            sVariableBuilder.AddVariableItem('AdjustBalacePosition', data.AdjustBalacePosition, 'Int', 1);
            sVariableBuilder.AddVariableItem('ScenarioId', data.ScenarioId, 'Int', 1);
            //资产属性计算

            sVariableBuilder.AddVariableItem('IsBasedOnReportingDate', data.IsBasedOnReportingDate, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsRidPrepaid', data.IsRidPrepaid, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsUserStatusNormal', data.IsUserStatusNormal, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsLoanGradeLevelNormal', data.IsLoanGradeLevelNormal, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsNotInArrears', data.IsNotInArrears, 'Int', 1);
            sVariableBuilder.AddVariableItem('IsNotMatured', data.IsNotMatured, 'Int', 1);
            sVariableBuilder.AddVariableItem('daysOfYear', '365', 'Int', 1);
            sVariableBuilder.AddVariableItem('OperationType', operationType, 'Int', 1);
            sVariableBuilder.AddVariableItem('adjustLastPaymentBalance', '1', 'Int', 1);
            sVariableBuilder.AddVariableItem('IncludeAPBFPoolCloseDate', 0, 'Int', 1);
            sVariableBuilder.AddVariableItem('PaymentConfiguration', data.PaymentConfiguration, 'String', 1);
            var sVariable = sVariableBuilder.BuildVariables();
            //console.log(getHEdata())
            //tpi.ShowIndicator('ConsumerLoan', TaskCodes[PoolHeader.PoolTypeId], element);
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'ImportTrustAssetByFactLoan_New',//Call new ImportTrustAssetByFactLoan task
                sContext: sVariable,
                callback: function () {
                    //window.location.href = 'basePoolContent.html?PoolId={0}&PoolName={1}'.format(PoolId, sessionStorage.PoolName);
                    //parent.location.href = parent.location.href;
                    $('#modal-close', window.parent.document).trigger('click');
                    sVariableBuilder.ClearVariableItem();
                    if (decodeURI(escape(common.getQueryString('ActionDisplayName'))) && common.getQueryString('SessionId')) {
                        var executeParams = {
                            SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                                { Name: 'SessionId', value: common.getQueryString('SessionId'), DBType: 'string' },
                                { Name: 'ProcessActionName', value: decodeURI(escape(common.getQueryString('ActionDisplayName'))), DBType: 'string' }

                            ]
                        };
                        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                            GSDialog.HintWindow('运行成功');
                        });

                    }
                }
            });

            saveCashFlowSplitInfo(TrustId, data.ReportingDate.replace(new RegExp("-", "gm"), ""), scheduleDateId, HEinfo.Step, HEinfo.H, HEinfo.E, function (res) {
                tIndicator.show();
            });
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
            var thisVal = $(this).find('span').html().trim();
            var thisActive = $(this).hasClass("active chrome-tab-current");
            if (!thisActive) {
                $(this).addClass("active chrome-tab-current").siblings().removeClass("active chrome-tab-current");
            }
            showRulesByModeName(thisVal);
            resetRule(currentRuleNo);
            if (currentRuleNo == 3) {
                var isBaseOnLoanTermV = 0;
                if ($('#AdjustLastPaymentBalance').val() == "1") {
                    showRule(true, true, false, true, false, true, false, false, false)
                } else {
                    showRule(true, true, false, true, false, true, true, true, false)
                    }
            } else {
                var isBaseOnLoanTermV = IsBaseOnLoanTerm.css('display') == 'block' ? $("#IsBaseOnLoanTerm").val() : 0;
            }
            var calculateHeadInterestByDayV = CalculateHeadInterestByDay.css('display') == 'block' ? $("#CalculateHeadInterestByDay").val() : 0;
            var trailPeriodsCalRuleV = TrailPeriodsCalRule.css('display') == 'block' ? $("#TrailPeriodsCalRule").val() : 0;
            var calculateInterestByDaysV = CalculateInterestByDays.css('display') == 'block' ? $("#CalculateInterestByDays").val() : 0;
            var countLastInterestPeriodByDayV = CountLastInterestPeriodByDay.css('display') == 'block' ? $("#CountLastInterestPeriodByDay").val() : 0;
            var adjustLastPaymentBalanceV = AdjustLastPaymentBalance.css('display') == 'block' ? $("#AdjustLastPaymentBalance").val() : 0;
            var adjustBalaceDirectionV = AdjustBalaceDirection.css('display') == 'block' ? $("#AdjustBalaceDirection").val() : 0;
            var adjustBalacePositionV = AdjustBalacePosition.css('display') == 'block' ? $("#AdjustBalacePosition").val() : 0;
            var adjustmentOfprincipalV = AdjustmentOfprincipal.css("display") == "block" ? $("#AdjustmentOfprincipal").val() : 0;
            //if (currentRuleNo == 4) {
            //    var isBaseOnLoanTermV = IsBaseOnLoanTerm.css('display') == 'block' ? $("#IsBaseOnLoanTerm").val(): 0;
            //    if (isBaseOnLoanTermV == 1) {
            //        $('#CalculateHeadInterestByDay').find('option:nth-child(2)').remove();
            //        calculateHeadInterestByDayV = 0;
            //    } else {
            //        var length = $('#CalculateHeadInterestByDay').find('option').length;
            //        if (length == 1) {
            //            $('#CalculateHeadInterestByDay').append('<option value="1">按天</option>')
            //        }
            //    }
            //};
            selectValText(isBaseOnLoanTermV, calculateHeadInterestByDayV, trailPeriodsCalRuleV, calculateInterestByDaysV, countLastInterestPeriodByDayV,currentRuleNo, function (res) {
                getAssetSplitRuleDataCalback(res)
            });
        });
         $('select').change(function () {
            if (currentRuleNo == 0) {
                if ($("#IsBaseOnLoanTerm").val() == 1) {
                    showRule(true, false, false, false, false, false, false, false, false);
                    modes[currentRuleNo].IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").val();
                    modes[currentRuleNo].CalculateHeadInterestRule = -1;
                }
                else {
                    showRule(true, true, false, false, false, false, false, false, false);
                    modes[currentRuleNo].IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").val();
                    modes[currentRuleNo].CalculateHeadInterestRule = $("#CalculateHeadInterestByDay").val();//选择首期利息计算规则
                    if (!$("#CalculateHeadInterestByDay").val()) {
                        modes[currentRuleNo].CalculateHeadInterestRule = 0;
                    }
                }
                $('.splitRuleOptionList>li').eq(currentRuleNo).trigger("click");
            }
            if (currentRuleNo == 1) {
                if ($("#IsBaseOnLoanTerm").val() == 1) {
                    showRule(true, false, false, true, false, false, false, false, false);
                    modes[currentRuleNo].IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").val();//选择拆分基准
                    modes[currentRuleNo].CalculateHeadInterestRule = -1;//选择首期利息计算规则
                    modes[currentRuleNo].CalculateTimeInterestRule = $("#CalculateInterestByDays").val();//选择每期利息计算规则
                    modes[currentRuleNo].AdjustPrincipalByPlan = -1//是否基于计划值调整本金
                }
                else {
                    showRule(true, true, true, true, false, false, false, false, false);
                    modes[currentRuleNo].IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").val();//选择拆分基准
                    modes[currentRuleNo].CalculateHeadInterestRule = $("#CalculateHeadInterestByDay").val();//选择首期利息计算规则
                    modes[currentRuleNo].CalculateTimeInterestRule = $("#CalculateInterestByDays").val();//选择每期利息计算规则
                    modes[currentRuleNo].AdjustPrincipalByPlan = $("#TrailPeriodsCalRule").val();//是否基于计划值调整本金
                    if (!$("#CalculateHeadInterestByDay").val()) {
                        modes[currentRuleNo].CalculateTimeInterestRule = $("#CalculateInterestByDays").val();
                        modes[currentRuleNo].AdjustPrincipalByPlan = 0;
                        modes[currentRuleNo].CalculateHeadInterestRule = 0;
                    }
                }
                if (this.id != 'TrailPeriodsCalRule') {
                    $('.splitRuleOptionList>li').eq(currentRuleNo).trigger("click")
                }
            }
            if (currentRuleNo == 2) {
                if ($("#IsBaseOnLoanTerm").val() == 1) {
                    showRule(true, false, false, false, false, false, false, false, false);
                    modes[currentRuleNo].IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").val();//选择拆分基准
                    modes[currentRuleNo].AdjustmentOfprincipal = -1;//是否基于计划值调整本金、手续费
                    $('.splitRuleOptionList>li').eq(currentRuleNo).trigger("click")
                }
                else {
                    showRule(true, false, false, false, false, false, false, false, true);
                    modes[currentRuleNo].IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").val();//选择拆分基准
                    modes[currentRuleNo].AdjustmentOfprincipal = $("#AdjustmentOfprincipal").val();//是否基于计划值调整本金、手续费
                    if (!$("#AdjustmentOfprincipal").val()) {
                        modes[currentRuleNo].AdjustmentOfprincipal = 0
                    }
                    $('.splitRuleOptionList>li').eq(currentRuleNo).trigger("click")
                }
            }
            if (currentRuleNo == 3) {
                modes[currentRuleNo].IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").val();//选择拆分基准
                //modes[currentRuleNo].IsBaseOnLoanTerm = 0;//选择拆分基准
                
                modes[currentRuleNo].CalculateHeadInterestRule = $("#CalculateHeadInterestByDay").val();//选择首期利息计算规则
                modes[currentRuleNo].CalculateTimeInterestRule = $("#CalculateInterestByDays").val();//选择每期利息计算规则
                modes[currentRuleNo].IsPrincipalInterestSync = $('#AdjustLastPaymentBalance').val();//利息还款日是否和本金还款日同步
                modes[currentRuleNo].InterestCutOffDay = $('#AdjustBalaceDirection').val();//利息计算截止日
                modes[currentRuleNo].IsNaturalSeason = $('#AdjustBalacePosition').val();//付息日是否要求“自然季节”
                $('.splitRuleOptionList>li').eq(currentRuleNo).trigger("click")
                if ($('#AdjustLastPaymentBalance').val() == "1") {
                    showRule(true, true, false, true, false, true, false, false, false)
                    modes[currentRuleNo].InterestCutOffDay = -1;//利息计算截止日
                    modes[currentRuleNo].IsNaturalSeason = -1;//付息日是否要求“自然季节”
                } else {
                    showRule(true, true, false, true, false, true, true, true, false)
                    modes[currentRuleNo].InterestCutOffDay = $('#AdjustBalaceDirection').val();//利息计算截止日
                    modes[currentRuleNo].IsNaturalSeason = $('#AdjustBalacePosition').val();//付息日是否要求“自然季节”
                }
            }
            if (currentRuleNo == 4) {
                modes[currentRuleNo].IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").val();//选择拆分基准
                modes[currentRuleNo].CalculateHeadInterestRule = $("#CalculateHeadInterestByDay").val();//选择首期利息计算规则
                modes[currentRuleNo].CalculateTimeInterestRule = $("#CalculateInterestByDays").val();//选择每期利息计算规则
                modes[currentRuleNo].IsNaturalSeason = $('#AdjustBalacePosition').val();//付息日是否要求“自然季节”
                $('.splitRuleOptionList>li').eq(currentRuleNo).trigger("click")
            }
            if (currentRuleNo == 5) {
                modes[currentRuleNo].IsBaseOnLoanTerm = $("#IsBaseOnLoanTerm").val();//选择拆分基准
                $('.splitRuleOptionList>li').eq(currentRuleNo).trigger("click")
            }
            //console.table(modes);
        })
        //左侧向导click
        var optionsList = $(".options_list>li");
        var splitRuleOption = $("#splitRuleOption");
        var CollectionRuleOption = $("#CollectionRuleOption");
        var assetAttributesOption = $("#assetAttributesOption");
        var MustItemOption = $("#MustItemOption");
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
                            $("#offonarea").show();
                            $(".boxArea").hide();
                            //$('#btnShowImg').show();
                            //$('#btnShowData').show();
                            break;
                        case "归集规则配置":
                            CollectionRuleOption.addClass("OptionActive").siblings().removeClass("OptionActive");
                            $("#AssetSplitOptions").hide();
                            $(".btnsList").css("top", "178px");
                            $(".boxArea").hide();
                            $("#offonarea").hide();
                            $(".CollectionRuleOptionList").find("li").eq(0).trigger("click");
                            //$('#btnShowImg').hide();
                            //$('#btnShowData').hide();
                            break;
                        case "还款期限计算":
                            assetAttributesOption.addClass("OptionActive").siblings().removeClass("OptionActive");
                            $("#AssetSplitOptions").hide();
                            $("#offonarea").hide();
                            $(".btnsList").css("top", "178px");
                            //$('#btnShowImg').hide();
                            //$('#btnShowData').hide();
                            break;
                        case "必需字段":
                            MustItemOption.addClass("OptionActive").siblings().removeClass("OptionActive");
                            $("#AssetSplitOptions").hide();
                            $("#offonarea").hide();
                            $(".btnsList").css("top", "178px");
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
            IsShowOpionContext.on("click", "#knob", function () {
                if ($("#font-offon").html() == "隐藏图例及样例结果") {
                    IsShowBtn.show();
                    $("#knob").addClass("knobon");
                    $("#bar").addClass("baron");
                    $("#font-offon").html("显示图例及样例结果")
                    $('#AssetReferenceImg').show();
                    $(".btnGroupLayer").css("borderBottom", "1px solid #ccc");
                    $("#btnShowImg").addClass("current_btn");
                } else {
                    IsShowBtn.hide();
                    $("#knob").removeClass("knobon");
                    $("#bar").removeClass("baron");
                    $(".btnGroupLayer").css("borderBottom", "none");
                    $("#font-offon").html("隐藏图例及样例结果")
                    $('#AssetReferenceImg').hide();
                    $("#AssteRuleType").hide();
                    $("#ModelAssetDetail").hide();
                }
            })
        }
        IsShowOpionContext();

    }
    function saveCashFlowSplitInfo(TrustId, ReadDate, ScheduleDate, Step, H, E, callback) {
        var parameterDatas = [
              ["ReadDate", ReadDate, "string"]
            , ["ScheduleDate", ScheduleDate, "string"]
            , ["TrustId", TrustId, "int"]
            , ["Step", Step, "string"]
            , ["H", H ? H : '', "string"]
            , ["E", E ? E : '', "string"]
        ]
        var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
        var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_NewSaveCashFlowSplitInfo');

        promise().then(function (response) {
            callback(response)
        });

    }
    //


    function getStepInfo(TrustId, ReadDate, ScheduleDate, callback) {
        if (rk == 3) {

        } else {
            var tempstep = ''
            var parameterDatas = [
                  ["ReadDate", ReadDate, "string"]
                , ["ScheduleDate", ScheduleDate, "string"]
                , ["TrustId", TrustId, "int"]
            ]
            var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
            var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_getStepInfo_New');
            promise().then(function (response) {
                callback(JSON.parse(response));
            });
        }
    }

    function selectValText(
                      isBaseOnLoanTerm, //选择拆分基准
                      calculateHeadInterestByDay,//选择首期利息计算规则
                      trailPeriodsCalRule,//是否基于计划值调整本金
                      calculateInterestByDays,//选择每期利息计算规则
                      countLastInterestPeriodByDay,//是否基于计划值调整手续费
                      //
                      //AdjustLastPaymentBalance,//利息还款日是否和本金还款日同步
                      //AdjustBalaceDirection,//利息计算截止日
                      //AdjustBalacePosition,//付息日是否要求“自然季节”
                      //AdjustmentOfprincipal,//是否基于计划值调整本金、手续费
                      //
                      repaymentMode,
                      callback) {
        isBaseOnLoanTerm = isBaseOnLoanTerm == -1 ? 0 : isBaseOnLoanTerm?isBaseOnLoanTerm:0
        calculateHeadInterestByDay = calculateHeadInterestByDay == -1 ? 0 : calculateHeadInterestByDay?calculateHeadInterestByDay:0
        trailPeriodsCalRule = trailPeriodsCalRule == -1 ? 0 : trailPeriodsCalRule?trailPeriodsCalRule:0
        calculateInterestByDays = calculateInterestByDays == -1 ? 0 : calculateInterestByDays?calculateInterestByDays:0
        countLastInterestPeriodByDay = countLastInterestPeriodByDay == -1 ? 0 : countLastInterestPeriodByDay?countLastInterestPeriodByDay:0
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

    //显示每种拆分方式所有的规则
    function showRulesByModeName(modeName) {
        switch (modeName) {
            case '等额本息':
                showRule(true, true, false, false, false, false, false, false, false)
                currentRuleNo = 0;
                currentRuleName = modeName;
                break;
            case '等额本金':
                showRule(true, true, true, true, false, false, false, false, false);
                currentRuleNo = 1;
                currentRuleName = modeName;
                break;
            case '等本等息':
                showRule(true, false, false, false, false, false, false, false, true);
                currentRuleNo = 2;
                currentRuleName = modeName;
                break;
            case '按计划还款':
                showRule(true, true, false, true, false, true, true, true, false);
                currentRuleNo = 3;
                currentRuleName = modeName;
                break;
            case '按期付息,到期还本':
                showRule(true, true, false, true, false, false, false, true, false);
                currentRuleNo = 4;
                currentRuleName = modeName;
                break;
            case '到期一次性还本付息':
                showRule(true, false, false, false, false, false, false, false, false);
                currentRuleNo = 5;
                currentRuleName = modeName;
                break;
            default:
                break;
        }
    }

    //显示规则
    function showRule(isBaseOnLoanTerm, //选择拆分基准
                          calculateHeadInterestByDay,//选择首期利息计算规则
                          trailPeriodsCalRule,//是否基于计划值调整本金
                          calculateInterestByDays,//选择每期利息计算规则
                          countLastInterestPeriodByDay,//是否基于计划值调整手续费
                          adjustLastPaymentBalance,//利息还款日是否和本金还款日同步
                          adjustBalaceDirection,//利息计算截止日
                          adjustBalacePosition,//付息日是否要求“自然季节”
                          adjustmentOfprincipal) {//是否基于计划值调整本金、手续费
        isBaseOnLoanTerm ? IsBaseOnLoanTerm.show() : IsBaseOnLoanTerm.hide();
        calculateHeadInterestByDay ? CalculateHeadInterestByDay.show() : CalculateHeadInterestByDay.hide();
        trailPeriodsCalRule ? TrailPeriodsCalRule.show() : TrailPeriodsCalRule.hide();
        calculateInterestByDays ? CalculateInterestByDays.show() : CalculateInterestByDays.hide();
        countLastInterestPeriodByDay ? CountLastInterestPeriodByDay.show() : CountLastInterestPeriodByDay.hide();
        adjustLastPaymentBalance ? AdjustLastPaymentBalance.show() : AdjustLastPaymentBalance.hide();
        adjustBalaceDirection ? AdjustBalaceDirection.show() : AdjustBalaceDirection.hide();
        adjustBalacePosition ? AdjustBalacePosition.show() : AdjustBalacePosition.hide();
        adjustmentOfprincipal ? AdjustmentOfprincipal.show() : AdjustmentOfprincipal.hide();
    }

    function resetRule(ruleNo) {
        $("#IsBaseOnLoanTerm")[0].selectedIndex = modes[ruleNo].IsBaseOnLoanTerm;
        $("#CalculateHeadInterestByDay")[0].selectedIndex = modes[ruleNo].CalculateHeadInterestRule;
        $("#TrailPeriodsCalRule")[0].selectedIndex = modes[ruleNo].AdjustPrincipalByPlan;
        $("#CalculateInterestByDays")[0].selectedIndex = modes[ruleNo].CalculateTimeInterestRule;
        $("#CountLastInterestPeriodByDay")[0].selectedIndex = modes[ruleNo].CalculateTailInterestRule;
        $("#AdjustLastPaymentBalance")[0].selectedIndex = modes[ruleNo].IsPrincipalInterestSync;
        $("#AdjustBalaceDirection")[0].selectedIndex = modes[ruleNo].InterestCutOffDay;
        $("#AdjustBalacePosition")[0].selectedIndex = modes[ruleNo].IsNaturalSeason;
        $("#AdjustmentOfprincipal")[0].selectedIndex = modes[ruleNo].AdjustmentOfprincipal;
        if (ruleNo == 0) {
            if ($("#IsBaseOnLoanTerm")[0].selectedIndex == 1) {
                showRule(true, false, false, false, false, false, false, false, false);
            }
            else {
                showRule(true, true, false, false, false, false, false, false, false);

            }
        }
        if (ruleNo == 1) {
            if ($("#IsBaseOnLoanTerm")[0].selectedIndex == 1) {
                showRule(true, false, false, true, false, false, false, false, false);
            }
            else {
                showRule(true, true, true, true, false, false, false, false, false);
            }
        }
        if (ruleNo == 2) {
            if ($("#IsBaseOnLoanTerm")[0].selectedIndex == 1) {
                showRule(true, false, false, false, false, false, false, false, false);
            }
            else {
                showRule(true, false, false, false, false, false, false, false, true);
            }
        }
    }
    //生成现金流拆分规则xml
    function createModeXml(_modes, head, tail, method) {
        var mode = _modes;
        xmlRules = '';
        if (mode && mode.length > 0) {
            $.each(mode, function (i, v) {
                var xmlTemp = '<Mode><ModeNo>{0}</ModeNo>' +//模块序号
                    '<ModeName>{1}</ModeName>' +//拆分方式名称
                    '<IsBaseOnLoanTerm>{2}</IsBaseOnLoanTerm>' +//选择拆分基准
                    '<CalculateHeadInterestRule>{3}</CalculateHeadInterestRule>' +//选择首期利息计算规则
                    '<CalculateTimeInterestRule>{4}</CalculateTimeInterestRule>' +//选择每期利息计算规则
                    '<AdjustPrincipalByPlan>{5}</AdjustPrincipalByPlan>' +//是否基于计划值调整本金
                    '<IsPrincipalInterestSync>{6}</IsPrincipalInterestSync>' +//利息还款日是否和本金还款日同步
                    '<InterestCutOffDay>{7}</InterestCutOffDay>' +//利息计算截止日
                    '<IsNaturalSeason>{8}</IsNaturalSeason>' +//付息日是否要求“自然季节”
                    '<CalculateTailInterestRule>{9}</CalculateTailInterestRule>' +//是否基于计划值调整手续费
                    '<AdjustPrincipalAndInterestByPlan>{10}</AdjustPrincipalAndInterestByPlan>' +//是否基于计划值调整本金、手续费
                    '<ConfigurationHeadDate>{11}</ConfigurationHeadDate>' +//头部规则
                    '<ConfigurationTailDate>{12}</ConfigurationTailDate>' +//尾部规则
                    '<ConfigurationMethod>{13}</ConfigurationMethod>' +//进入规则
                    '</Mode>'
                //console.table(v);
                xmlTemp = xmlTemp.format(v.ModeNo + 1, v.ModeName, v.IsBaseOnLoanTerm, v.CalculateHeadInterestRule, v.CalculateTimeInterestRule, v.AdjustPrincipalByPlan, v.IsPrincipalInterestSync, v.InterestCutOffDay, v.IsNaturalSeason, v.CalculateTailInterestRule, v.AdjustmentOfprincipal, head, tail, method);
                xmlRules += xmlTemp;

            })

            xmlRules = '<![CDATA[<Modes>' + xmlRules + '</Modes>]]>'
        }

    }
    // 生成配置保存xml

    function createConfigXml() {

        var HEinfo = getHEdata();

        var head = HEinfo.H
        var tail = HEinfo.E
        var method = HEinfo.Step
        var mode = modes;
        xmlRules = '';
        if (mode && mode.length > 0) {
           
            $.each(mode, function (i, v) {
                var xmlTemp = '<Mode><ModeNo>{0}</ModeNo>' +//模块序号
                    '<ModeName>{1}</ModeName>' +//拆分方式名称
                    '<IsBaseOnLoanTerm>{2}</IsBaseOnLoanTerm>' +//选择拆分基准
                    '<CalculateHeadInterestRule>{3}</CalculateHeadInterestRule>' +//选择首期利息计算规则
                    '<CalculateTimeInterestRule>{4}</CalculateTimeInterestRule>' +//选择每期利息计算规则
                    '<AdjustPrincipalByPlan>{5}</AdjustPrincipalByPlan>' +//是否基于计划值调整本金
                    '<IsPrincipalInterestSync>{6}</IsPrincipalInterestSync>' +//利息还款日是否和本金还款日同步
                    '<InterestCutOffDay>{7}</InterestCutOffDay>' +//利息计算截止日
                    '<IsNaturalSeason>{8}</IsNaturalSeason>' +//付息日是否要求“自然季节”
                    '<CalculateTailInterestRule>{9}</CalculateTailInterestRule>' +//是否基于计划值调整手续费
                    '<AdjustPrincipalAndInterestByPlan>{10}</AdjustPrincipalAndInterestByPlan>' +//是否基于计划值调整本金、手续费
                    '<ConfigurationHeadDate>{11}</ConfigurationHeadDate>' +//头部规则
                    '<ConfigurationTailDate>{12}</ConfigurationTailDate>' +//尾部规则
                    '<ConfigurationMethod>{13}</ConfigurationMethod>' +//进入规则
                    '</Mode>'
                //console.table(v);
                xmlTemp = xmlTemp.format(v.ModeNo + 1, v.ModeName, v.IsBaseOnLoanTerm, v.CalculateHeadInterestRule, v.CalculateTimeInterestRule, v.AdjustPrincipalByPlan, v.IsPrincipalInterestSync, v.InterestCutOffDay, v.IsNaturalSeason, v.CalculateTailInterestRule, v.AdjustmentOfprincipal, head, tail, method);
                xmlRules += xmlTemp;

            })

            var IsBasedOnReportingDateinfo = $("#IsBasedOnReportingDateinfo").find('input');
            var IsBasedOnReportingDateconfig
            $.each(IsBasedOnReportingDateinfo, function (i, v) {
                if (v.checked) {
                    IsBasedOnReportingDateconfig = v.value
                }
            })

            var IsRidPrepaidinfo = $("#IsRidPrepaidinfo").find('input');
            var IsRidPrepaidconfig
            $.each(IsRidPrepaidinfo, function (i, v) {
                if (v.checked) {
                    IsRidPrepaidconfig = v.value
                }
            })
            var IsUserStatusNormalinfo = $("#IsNormalAsset").find("input[name='IsUserStatusNormal']").prop("checked")?1:0;
            var IsLoanGradeLevelNormal = $("#IsNormalAsset").find("input[name='IsLoanGradeLevelNormal']").prop("checked")?1:0;
            var IsNotInArrears = $("#IsNormalAsset").find("input[name='IsNotInArrears']").prop("checked")?1:0;
            var IsNotMatured = $("#IsNormalAsset").find("input[name='IsNotMatured']").prop("checked")?1:0;



            var collcetionruletemplate = '<cashgoback><IsBasedOnReportingDate>{0}</IsBasedOnReportingDate></cashgoback>'
            var filtercollcetionruletemplate = '<boxArea><IsRidPrepaid>{0}</IsRidPrepaid>'
                + '<IsNormalAsset><IsUserStatusNormal>{1}</IsUserStatusNormal>'
                + '<IsLoanGradeLevelNormal>{2}</IsLoanGradeLevelNormal>'
                + '<IsNotInArrears>{3}</IsNotInArrears>'
                + '<IsNotMatured>{4}</IsNotMatured>'
                + '</IsNormalAsset></boxArea>'

            collcetionruletemplate = collcetionruletemplate.format(IsBasedOnReportingDateconfig)
            filtercollcetionruletemplate = filtercollcetionruletemplate.format(IsRidPrepaidconfig, IsUserStatusNormalinfo, IsLoanGradeLevelNormal, IsNotInArrears, IsNotMatured)

            xmlRules += collcetionruletemplate;
            xmlRules += filtercollcetionruletemplate;

            xmlRules = '<Modes>' + xmlRules + '</Modes>'

            var ConfigCode = $("#ConfigCode").val();
            //save
            if (!ConfigCode) {
                $.toast({ type: 'warning', message: '请填写名称！' })
                return false;
            }

            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'SaveTemplateOfCashflowSplitRules?';
            var svcUrl = svcUrl + "RuleXml=" + encodeURIComponent(xmlRules) + "&UserName=" + sessionStorage.getItem("gs_UserName") + "&ConfigCode=" + ConfigCode;
            $.ajax({
                cache: false,
                type: "POST",
                url: svcUrl,
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                data: {},
                success: function (response) {
                    if (response.SaveTemplateOfCashflowSplitRulesResult == 1) {
                        $.toast({type: 'success', message: '保存成功', afterHidden: function () {
                                $("#ConfigCode").val("")
                                LoadSplitList()
                            }
                        })
                    }
                    else {
                        $.toast({type: 'warning', message: '配置名称重复', afterHidden: function () {
                                $("#ConfigCode").val("")
                                LoadSplitList()
                            }
                        })
                    }
                },
                error: function (response) { alert('Error occursed when fetch the remote source data!'); }
            });


        }

    }
    //加载配置列表
    function LoadSplitList() {
        
        var parameterDatas = [
            ["UserName", sessionStorage.getItem("gs_UserName"), "string"]
        ]
        var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
        var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_GetCashflowSplitHistory');
        promise().then(function (response) {
            var ConfigJson = JSON.parse(response);
            var html = "";
            $.each(ConfigJson, function (i, v) {
                html += '<tr><td><div><i class="icon icon-cog-alt" title="加载配置" style="color:#5767A6;cursor:pointer;margin: 0px 10px;"></i>'
                html += '<i class="icon icon-edit" title="编辑" style="color:#5767A6;cursor:pointer;margin: 0px 10px;"></i>'
                html += '<i class="icon icon-trash-empty" title="删除" style="color:#DC0000;cursor:pointer;margin: 0px 10px;"></i>'
                html += '</div></td><td><input type="text" class="input_inner_style"  disabled="disabled" value="' + v.CashflowSplitConfigCode + '"  id="SplitConfigInfo"/><button class="btn btn-primary maketrue"  style="display:none">确定</button></td></tr>'
            })
            $(".OptionInput").siblings().remove();
            $(".OptionInput").after(html)
            $(".OptionInput").hide()
        });
    }

    //加载选中配置xml
    function LoadSplitConfig(parmas) {
        var ConfigCode = parmas;
        var Username = sessionStorage.getItem("gs_UserName");

        var parameterDatas = [
            ["CashflowSplitConfigCode", ConfigCode, "string"],
            ["UserName", Username, "string"]
        ]
        var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
        var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_GetCashflowSplitHistory');
        promise().then(function (response) {

            var ConfigJson = JSON.parse(response);
            ConfigJson = JSON.parse(ConfigJson[0].CashflowSplitConfigJson);

            var ConfigurationHeadDate;
            var ConfigurationMethod;
            var ConfigurationTailDate;
            var DefiningInterval = ConfigJson.Modes.cashgoback.IsBasedOnReportingDate;//定义归集区间
            var EliminatePrematureAssets = ConfigJson.Modes.boxArea.IsRidPrepaid;//是否剔除早偿资产
            var CashflowAsset = ConfigJson.Modes.boxArea.IsNormalAsset;//现金流归集资产(集合)
            $.each(ConfigJson.Modes.Mode, function (i, v) {
                var index = v.ModeNo - 1;
                modes[index].AdjustPrincipalByPlan = v.AdjustPrincipalByPlan;
                modes[index].AdjustmentOfprincipal = v.AdjustmentOfprincipal ? v.AdjustmentOfprincipal : v.AdjustPrincipalAndInterestByPlan;
                modes[index].CalculateHeadInterestRule = v.CalculateHeadInterestRule;
                modes[index].CalculateTailInterestRule = v.CalculateTailInterestRule;
                modes[index].CalculateTimeInterestRule = v.CalculateTimeInterestRule;
                modes[index].InterestCutOffDay = v.InterestCutOffDay;
                modes[index].IsBaseOnLoanTerm = v.IsBaseOnLoanTerm;
                modes[index].IsNaturalSeason = v.IsNaturalSeason;
                modes[index].IsPrincipalInterestSync = v.IsPrincipalInterestSync;
                ConfigurationHeadDate = v.ConfigurationHeadDate;
                ConfigurationMethod = v.ConfigurationMethod;
                ConfigurationTailDate = v.ConfigurationTailDate;

            });

            $("#groupone").removeClass("ActiveCurrent")
            $("#grouptwo").removeClass("ActiveCurrent")
            $("#groupthree").removeClass("ActiveCurrent")
            //判断渲染页面
            //首尾参数判断及页面渲染
            function renderEpar(info) {
                switch (info) {
                    case "C-1":
                        $("#Ef01").trigger("click");
                        break;
                    case "C_C-2":
                        $("#Ef02").trigger("click");
                        break;
                    case "C_C-1":
                        $("#Ef03").trigger("click");
                        break;
                    case "C":
                        $("#Ef04").trigger("click");
                        break;
                    case "C+1":
                        $("#Ef05").trigger("click");
                        break;
                    case "C+M":
                        $("#Ef06").trigger("click");
                        break;
                    default:
                        $("#Ef01").trigger("click");
                }
            }
            function renderHpar(info) {
                switch (info) {
                    case "S+1":
                        $("#Cmethod").trigger("click");
                        break;
                    case "S+2":
                        $("#Smethod").trigger("click");
                        break;
                    case "S":
                        $("#Dmethod").trigger("click");
                        break;
                    case "S+1P":
                        $("#Hmethod").trigger("click");
                        break;
                    default:
                        $("#Cmethod").trigger("click");
                }
            }
            function rendOne() {
                $("#levefirstarea").show();
                $("#levesecondarea").hide();
                $("#levefirstareaChild").show();
                $("#levesecondareaChild").hide();
            }
            function rendTwo() {
                $("#levefirstarea").hide();
                $("#levesecondarea").show();
                $("#levefirstareaChild").hide();
                $("#levesecondareaChild").show();
            };
            function rendThree() {
                $("#levefirstarea").show();
                $("#levesecondarea").show();
                $("#levefirstareaChild").hide();
                $("#levesecondareaChild").hide();
            }
            switch (ConfigurationMethod) {
                case "T_C_HISS":
                    $("#groupone").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                    rendOne();
                    $("#payyes").trigger("click");
                    renderEpar(ConfigurationTailDate)
                    break;
                case "T_C_HNTS":
                    $("#groupone").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                    rendOne();
                    $("#paynot").trigger("click");
                    renderEpar(ConfigurationTailDate)
                    break;
                case "H_T_CISL":
                    $("#grouptwo").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                    rendTwo();
                    $("#endyes").trigger("click");
                    renderHpar(ConfigurationHeadDate);
                    break;
                case "H_T_CNTL":
                    $("#grouptwo").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                    rendTwo();
                    $("#endnot").trigger("click");
                    renderHpar(ConfigurationHeadDate);
                    break;
                case "H_C_T":
                    $("#groupthree").removeClass("ActiveCurrent").addClass("ActiveCurrent").siblings().removeClass("ActiveCurrent");
                    rendThree();
                    renderHpar(ConfigurationHeadDate);
                    renderEpar(ConfigurationTailDate);
            }

            $('.splitRuleOptionList>li').eq(0).trigger("click");

            //渲染归集配置规则
            if (DefiningInterval == "1") {
                $("#IsBasedOnReportingDate").prop("checked", "checked");
            } else {
                $("#IsBasedOnReportingDate01").prop("checked", "checked");
            }
            if (EliminatePrematureAssets == "0") {
                $("#IsRidPrepaid01").prop("checked", "checked");
            } else {
                $("#IsRidPrepaid").prop("checked", "checked");
            }

            if (CashflowAsset.IsLoanGradeLevelNormal != "0") {
                $("#IsLoanGradeLevelNormal").prop("checked", "checked");
            } else {
                $("#IsLoanGradeLevelNormal").removeAttr("checked")
            }
            if (CashflowAsset.IsNotInArrears != "0") {
                $("#IsNotInArrears").prop("checked", "checked");
            } else {
                $("#IsNotInArrears").removeAttr("checked");
            }
            if (CashflowAsset.IsNotMatured != "0") {
                $("#IsNotMatured").prop("checked", "checked");
            } else {
                $("#IsNotMatured").removeAttr("checked");
            }
            if (CashflowAsset.IsUserStatusNormal != "0") {
                $("#IsUserStatusNormal").prop("checked", "checked");
            } else {
                $("#IsUserStatusNormal").removeAttr("checked");
            }
        });
        //GSDialog.HintWindow("加载配置成功");
        $.toast({ type: 'success', message: '加载配置成功' })
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
    //二级级联隐藏
    $("#selectionMethod").find("input").click(function () {
        var value = $(this).val();
        if (value == "1") {
            $("#selectionMethodChild").show();
        }
        if (value == "HF") {
            $("#selectionMethodChild").hide();
        }
    })
    //获取HE参数
    function getHEdata() {
        var res = {};
        var groupone = $("#groupone");
        var grouptwo = $("#grouptwo");
        var groupthree = $("#groupthree");
        var grouponetop = $("#levefirstareaChild").find("input");
        var grouponedown = $("#selectionEndMethod").find("input");
        var grouptwotop = $("#levesecondareaChild").find("input");
        var grouptwodown = $("#selectionMethod").find("input");
        if (groupone.hasClass("ActiveCurrent")) {
            //计算首期
            $.each(grouponetop, function (i, v) {
                if (v.checked == true) {
                    res.Step = v.value;
                }
            })
            $.each(grouponedown, function (i, v) {
                if (v.checked == true) {
                    res.E = v.value;
                    res.H = "";
                }
            })
        }
        if (grouptwo.hasClass("ActiveCurrent")) {
            //计算尾期
            $.each(grouptwotop, function (i, v) {
                if (v.checked == true) {
                    res.Step = v.value;
                }
            })
            $.each(grouptwodown, function (i, v) {
                if (v.checked == true) {
                    res.H = v.value;
                    res.E = "";
                }
            })
        }
        if (groupthree.hasClass("ActiveCurrent")) {
            res.Step = "H_C_T";
            $.each(grouptwodown, function (i, v) {
                if (v.checked == true) {
                    res.H = v.value;
                }
            })
            $.each(grouponedown, function (i, v) {
                if (v.checked == true) {
                    res.E = v.value;
                }
            })
        }
        //$.each(groupone, function (i, v) {
        //    if (v.checked == true) {
        //        if (i == 0) {//第一项
        //            $.each(grouptwo, function (i, v) {
        //                if (v.checked == true) {
        //                    res.Step = v.value;
        //                }
        //            })
        //            $.each(Endgroup, function (i, v) {
        //                if (v.checked == true) {
        //                    res.E = v.value;
        //                    res.H = "";
        //                }
        //            })
        //        }
        //        if (i == 1) {//第二项
        //            $.each(grouptwochild, function (i, v) {
        //                if (v.checked == true) {
        //                    res.Step = v.value;
        //                }
        //            })
        //            $.each(hgroup, function (i, v) {
        //                if (v.checked == true) {
        //                    res.H = v.value;
        //                    res.E = "";
        //                }
        //            })
        //        }
        //        if (i == 2) {//第三项
        //            res.Step = $("#pThree").val();
        //            $.each(hgroup, function (i, v) {
        //                if (v.checked == true) {
        //                    res.H = v.value;
        //                }
        //            })
        //            $.each(Endgroup, function (i, v) {
        //                if (v.checked == true) {
        //                    res.E = v.value;
        //                }
        //            })
        //        }
        //    }
        //})
        console.log(res);
        return res;
    }
});