define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    require('bootstrap');
    require("ischeck");
    var kendoGridModel = require('app/assetFilter/AssetsContrast/js/kendoGridModel');
    var GSDialog = require('gsAdminPages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');

    var CallApi = require("callApi");
    var webStore = require('gs/webStorage');
    var assetTree = null;
    var kendouGrid;
    var webProxy = require('gs/webProxy');
    var self = this;
    var PoolId = common.getQueryString('PoolId');//GSDialog.getData().Pool.PoolId;
    var IsTask = common.getQueryString('IsTask');
    var CbkPoolId;
    if (IsTask == 1) {
        CbkPoolId = PoolId;
    } else {
        CbkPoolId = GSDialog.getData().Pool.PoolId;
    }
    
    var params = [];
    var params1 = [];
    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
    var PoolDBName;
    var poolHeader;
    require("kendomessagescn");
    var paramS = [
        ['PoolId', PoolId, 'int']
    ];
    var promise = webProxy.comGetData(paramS, svcUrl, 'usp_GetPoolHeaderById');
    promise().then(function (response) {
        if (typeof response === 'string') { poolHeader = JSON.parse(response); }
        else { poolHeader = response; }
        PoolDBName = poolHeader[0].PoolDBName;

        if (IsTask == 1) {
            initKendouGridByPoolIdIsTask(PoolDBName);
        } else {
        initKendouGridByPoolId(PoolDBName);
        }
        
    })
    function GetAmount(PoolDBName, accountNoItem) {
        var filter = localStorage.getItem('contrastFilter'),
            resData;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "PoastData?" + 'appDomain=' + PoolDBName + '&executeParams=2&resultType=commom';
        if (IsTask == 1) {
            svcUrl = GlobalVariable.DataProcessServiceUrl + "PoastData?" + 'appDomain=TrustManagement&executeParams=2&resultType=commom';
        var executeParam = {
                SPName: 'dbo.usp_TmpGetAssetDetailsAmount', SQLParams: [
                    { name: 'DimPoolId', value: CbkPoolId, DBType: 'int' },
                    { name: 'accountNoItem', value: accountNoItem ? accountNoItem : '', DBType: 'string' },
                    { name: 'where', value: filter, DBType: 'string' }
                ]
            };
        }
        else{
            var executeParam = {
	        SPName: 'dbo.usp_GetAssetDetailsAmount', SQLParams: [
		        { name: 'DimPoolId', value: CbkPoolId, DBType: 'int' },
                { name: 'accountNoItem', value: accountNoItem ? accountNoItem : '', DBType: 'string' },
		        { name: 'where', value: filter, DBType: 'string' }
	        ]
        };
        }

        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        $.ajax({
	        cache: false,
	        type: "POST",
	        async: false,
            url: svcUrl + 'appDomain=' + PoolDBName + '&executeParams=2&resultType=commom',
	        dataType: "json",
	        processData: false,
	        data: "[{executeParams:\"" + executeParams + "\"}," +
			        "{appDomain:\"" + (IsTask == 1 ? 'TrustManagement' : PoolDBName) + "\"}," +
			        "{resultType:\"commom\"}]",
	        success: function (response) {
                if (typeof response.PoastDataResult === 'string') {
                    resData = JSON.parse(response.PoastDataResult);
                }
                else {
                    resData = response.PoastDataResult;
                }
                if (resData[0].Total == "0") {
                    $(".tips").hide()
                }
                $('#showdate').html(common.getStringDate(resData[0].ReportingDate).dateFormat("yyyyMMdd"))
                var str = "合同笔数：<span>" + resData[0].Total + "笔</span> 合同金额合计：<span>" + common.numFormt(resData[0].Total_ApprovalAmount) + "元</span> 剩余本金合计：<span>" + common.numFormt(resData[0].Total_CurrentPrincipalBalance) + "元</span>";
                $('.Total').html(str);
	        },
            error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
        });
       //var parm = [
       //    ['DimPoolId', CbkPoolId, 'int']
       //    , ['accountNoItem', accountNoItem?accountNoItem:'', 'string']
       //    , ['where', filter, 'string']
       //];
       //var url = webProxy.dataProcessServiceUrl + "CommonGetExecuteForPool?poolname=" + PoolDBName + "&appDomain=dbo&executeParams=";
       //var promise = webProxy.comGetDataNew(parm, url, 'usp_GetAssetDetailsAmount');
       //promise().then(function (response) {
       //    if (typeof response === 'string') {
       //        resData = JSON.parse(response);
       //    }
       //    else {
       //        resData = response;
       //    }
       //    if (resData[0].Total=="0") {
       //        $(".tips").hide()
       //    }
       //    $('#showdate').html(common.getStringDate(resData[0].ReportingDate).dateFormat("yyyyMMdd"))
       //    var str = "合同笔数：<span>" + resData[0].Total + "笔</span> 合同金额合计：<span>" + common.numFormt(resData[0].Total_ApprovalAmount) + "元</span> 剩余本金合计：<span>" + common.numFormt(resData[0].Total_CurrentPrincipalBalance) + "元</span>";
       //    $('.Total').html(str);
       //})
    }
    //渲染select框
    function RenderSelect() {
        var data;
        var html = "";
        var serviceUrl = GlobalVariable.CommonServicesUrl + 'ExecuteDataSet';
        var objParam = { SPName: 'config.usp_GetBasePoolContent', SQLParams: [{ Name: 'BasePoolId', Value: PoolId, DBType: 'int' }, { Name: 'total', Value: 0, DBType: 'int' }] };
        var strParam = encodeURIComponent(JSON.stringify(objParam));
        var obj = { connectionName: "DAL_SEC_PoolConfig", param: strParam }
        $.ajax({
            url: serviceUrl,
            async: false,
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(obj),
            success: function (res) {
                data = JSON.parse(res)
            },
            error: function (msg) {
                console.error(msg);
            }
        });
        $.each(data, function (i, v) {
            html += "<option value='" + v.PoolId + "'>" + v.PoolName + "</option>"
        })
        $("#poolbase").append(html);
        $("#poolbase").val(CbkPoolId)
    }
    RenderSelect();
    function initKendouGridByPoolId(PoolDBName) {
        var height = $(window).height() - 150;
        kendouGrid = new kendoGridModel(height);
        kendouGrid.Init({
            renderOptions: {
                reorderable: false,
                columns: [
                    {
                        title: "", width: '50px', headerTemplate: function () {
                            var t = '<input type="checkbox" id="checkAll" onclick="self.selectAll(this)"/>';
                            return t
                        }, template: function () {
                            var t = '<input type="checkbox" class="selectbox" onclick="self.selectCurrent(this)"/>';
                            return t
                        }, locked: true
                    },
                    { field: "AccountNo", title: '资产编号', width: "150px", locked: true, template: '<a href="loanDetails.html?AccountNo=#=AccountNo#&PoolId=#=DimPoolID#&PoolDBName=' + PoolDBName + '&AssetType=#=AssetType#">#=AccountNo#</a>' },
                    { field: "CustomerCode", title: '客户编号', width: "150px" },
                    { field: "TrustCode", title: '产品标识', width: "250px" },
                    { field: "LoanStartDate", title: '起始日', width: "135px", template: '#=LoanStartDate?self.getStringDate(LoanStartDate).dateFormat("yyyy-MM-dd"):""#', },
                    { field: "LoanMaturityDate", title: '到期日', width: "135px", template: '#=LoanMaturityDate?self.getStringDate(LoanMaturityDate).dateFormat("yyyy-MM-dd"):""#', },
                    { field: "ApprovalAmount", title: '合同金额(元)', width: "150px", format: "{0:n}" },
                    { field: "CurrentPrincipalBalance", title: '贷款本金余额（元）', width: "150px", format: "{0:n}" },
                    { field: "PaymentType", title: '还款方式', width: "240px" },
                    { field: "CurrentRate", title: '当前执行利率（%）', width: "150px" },
                    { field: "PayDay", title: '每期还款日', width: "150px" },
                    { field: "LoanTerm", title: '合同期数（月）', width: "150px" },
                    { field: "Seasoning", title: '账龄（月）', width: "120px" },
                    { field: "RemainingTerm", title: '剩余期数（月）', width: "150px" },
                    { field: "InterestBasis", title: '计息基础', width: "150px" },
                    { field: "InterestPaymentType", title: '计息周期', width: "150px" },
                    { field: "", title: '', width: "auto" },
                ]
            }
            , dataSourceOptions: {
                pageSize: 20,
                params: params,
                params1: params1,
                otherOptions: {
                    orderby: "AccountNo"
                    , direction: ""
                    , defaultfilter: filterConditions
                    , appDomain: PoolDBName
                    , executeParamType: 'extend'
                    , executeParam: function () {
                        var result = {
                            SPName: 'dbo.usp_GetAssetDetails', SQLParams: [
                                { Name: 'DimPoolId', Value: CbkPoolId, DBType: 'int' },
                            ]
                        };
                        return result;
                    }
                }
            }
        });
        kendouGrid.RunderGrid();
        GetAmount(PoolDBName);
        $("#loading").hide();

    }
    //TaskList版本模式的初始化函数，字段多一些
    function initKendouGridByPoolIdIsTask(PoolDBName) {
        var height = $(window).height() - 150;
        kendouGrid = new kendoGridModel(height);
        kendouGrid.Init({
            renderOptions: {
                reorderable: false,
                columns: [
                    {
                        title: "", width: '50px', headerTemplate: function () {
                            var t = '<input type="checkbox" id="checkAll" onclick="self.selectAll(this)"/>';
                            return t
                        }, template: function () {
                            var t = '<input type="checkbox" class="selectbox" onclick="self.selectCurrent(this)"/>';
                            return t
                        }, locked: true
                    },
                    { field: "AccountNo", title: '资产编号', width: "150px", locked: true, template: '<a href="loanDetails.html?AccountNo=#=AccountNo#&PoolId=#=DimPoolID#&PoolDBName=' + PoolDBName + '&AssetType=#=AssetType#">#=AccountNo#</a>' },
                    { field: "CustomerCode", title: '客户编号', width: "150px" },
                    { field: "TrustCode", title: '产品标识', width: "250px" },
                    { field: "LoanStartDate", title: '起始日', width: "135px", template: '#=LoanStartDate?self.getStringDate(LoanStartDate).dateFormat("yyyy-MM-dd"):""#', },
                    { field: "LoanMaturityDate", title: '到期日', width: "135px", template: '#=LoanMaturityDate?self.getStringDate(LoanMaturityDate).dateFormat("yyyy-MM-dd"):""#', },
                    { field: "ApprovalAmount", title: '合同金额(元)', width: "150px", format: "{0:n}" },
                    { field: "CurrentPrincipalBalance", title: '贷款本金余额（元）', width: "150px", format: "{0:n}" },
                    { field: "PaymentType", title: '还款方式', width: "240px" },
                    { field: "CurrentRate", title: '当前执行利率（%）', width: "150px" },
                    { field: "PayDay", title: '每期还款日', width: "150px" },
                    { field: "LoanTerm", title: '合同期数（月）', width: "150px" },
                    { field: "Seasoning", title: '账龄（月）', width: "120px" },
                    { field: "RemainingTerm", title: '剩余期数（月）', width: "150px" },
                    { field: "InterestBasis", title: '计息基础', width: "150px" },
                    { field: "InterestPaymentType", title: '计息周期', width: "150px" },
                    { field: "FirstCalculationDate", title: '初始起算日', width: "150px" },
                    { field: "IsInTrust", title: '入池状态', width: "150px" },
                    { field: "FirstPaymentDate", title: '首个还款日', width: "150px" },
                    { field: "FeeOutstanding", title: '未还手续费（元）', width: "150px" },
                    { field: "LastPaymentDate", title: '最后一个还款日', width: "150px" },
                    { field: "NextPaymentDate", title: '下一还款日', width: "150px" },
                    { field: "SecondLastPaymentDate", title: '倒数第二个还款日', width: "150px" },
                    { field: "PaymentSchedule", title: '还款计划', width: "150px" },
                    { field: "RepaymentTerm", title: '还款期限（月）', width: "150px" },
                    { field: "PMT", title: '每期还款额（元）', width: "150px" },
                    { field: "PrincipalPayment", title: '每期偿还本金（元）', width: "150px" },
                    { field: "InterestPayment", title: '每期偿还利息（元）', width: "150px" },
                    { field: "PrincipalPaymentFrequency", title: '还本频率（月）', width: "150px" },
                    { field: "InterestPaymentFrequency", title: '付息频率（月）', width: "150px" },
                    { field: "LoanPeriod", title: '合同期限', width: "150px" },
                    { field: "RemainingPeriod", title: '剩余期限', width: "150px" },
                    { field: "DivisionName", title: '分支行', width: "150px" },
                    { field: "InterestRateBase", title: '基准利率（%）', width: "150px" },
                    { field: "InterestAdjustmentRate", title: '浮动比例（%）', width: "150px" },
                    { field: "Spread", title: '利差（BP）', width: "150px" },
                    { field: "InterestType", title: '利率类型', width: "150px" },
                    { field: "DataSource", title: '数据来源', width: "150px" },
                    { field: "LoanType", title: '业务品种', width: "150px" },
                    { field: "ProductType", title: '借款用途', width: "150px" },
                    { field: "CurrencyType", title: '币种', width: "150px" },
                    { field: "CollateralMethod", title: '担保方式', width: "150px" },
                    { field: "InterestAdjustmentType", title: '利率调整方式', width: "150px" },
                    { field: "InterestAdjustment", title: '利率浮动方式', width: "150px" },
                    { field: "ArrearsIndicator", title: '逾期程度', width: "150px" },
                    { field: "DaysInArrears", title: '当前逾期天数（天）', width: "150px" },
                    { field: "IsArrears", title: '是否发生过逾期', width: "150px" },
                    { field: "HistoricalCumulativeTimesInArrears", title: '历史累计逾期次数（次）', width: "150px" },
                    { field: "UserStatus", title: '账户状态', width: "150px" },
                    { field: "CreditScore", title: '信用评分', width: "150px" },
                    { field: "", title: '', width: "auto" },
                ]
            }
            , dataSourceOptions: {
                pageSize: 20,
                params: params,
                params1: params1,
                otherOptions: {
                    orderby: "AccountNo"
                    , direction: ""
                    , defaultfilter: filterConditions
                    , appDomain: 'TrustManagement'//PoolDBName
                    , executeParamType: 'extend'
                    , executeParam: function () {
                        var result = {
                            SPName: 'dbo.usp_TmpGetAssetDetails', SQLParams: [
                                { Name: 'DimPoolId', Value: CbkPoolId, DBType: 'int' },
                            ]
                        };
                        return result;
                    }
                }
            }
        });
        kendouGrid.RunderGrid();
        GetAmount(PoolDBName);
        $("#loading").hide();

    }


    //全选框
    self.selectAll = function (that) {
        var that = that;
        window.checkall ? window.checkall = !window.checkall : "";
        if ($("#checkAll").is(':checked')) {
            var arry = $(".selectbox");
            $.each(arry, function (i, v) {
                $(v).prop("checked", true);
                var aco = $($(v).parent().next().html()).text();
                if (params.indexOf(aco) == -1) {
                    params.push(aco);
                }
            })
            $("#infomation").html("已经勾选当前" + params.length + "条数据,")
            $("#opration").html("勾选全部" + window.total + "条数据");
            $(".tips").show()
        } else {
            var arry = $(".selectbox");
            $(".tips").hide()
            $.each(arry, function (i, v) {
                $(v).prop("checked", false);
                params.remove($($(v).parent().next().html()).text());
            })
            $("#infomation").html("已经勾选" + params.length + "条数据,")
            $("#opration").html("勾选全部" + window.total + "条数据");
        }
        var str = "";

        $.each(params, function (i, v) {
            str += v + ","
        })
        var len = str.length - 1;
        str = str.substring(0, len)
        GetAmount(PoolDBName, str)
    }
    self.selectCurrent = function (that) {
        var that = that;
        var arry = $(".selectbox");
        var off = true;
        $.each(arry, function (i, v) {
            if (!v.checked) {
                off = false;
            }
        })
        if (window.checkall && $(".tips").css("display") == "block") {
            window.checkall = false;
            $.each(arry, function (i, v) {
                var aco = $($(v).parent().next().html()).text();
                if (v.checked && params.indexOf(aco) == -1) {
                    params.push(aco);
                }
            })
        }
        
        if ($(that).is(':checked')) {
            params.push($($(that).parent().next().html()).text());
        } else {
            params.remove($($(that).parent().next().html()).text());
        }
        $("#infomation").html("已经勾选" + params.length + "条数据,");
        $("#opration").html("勾选全部" + window.total + "条数据");
        if (params.length > 0) {
            $(".tips").show()
        } else {
            $(".tips").hide()
        }
        if (off) {
            $("#checkAll").prop("checked", true);
            window.checkall ? window.checkall = !window.checkall : "";
        } else {
            $("#checkAll").prop("checked", false);
        }
        var str = "";

        $.each(params, function (i, v) {
            str += v + ","
        })
        var len = str.length - 1;
        str = str.substring(0, len)
        GetAmount(PoolDBName, str)
    }
    self.getStringDate = function (strDate) {
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        return eval('new ' + str);
    };
    //过滤条件
    function filterConditions() {
        var RemainingTerm = $("#RemainingTerm").val();
        var CurrentRate = $("#CurrentRate").val();
        var filter = "";
        if (RemainingTerm != "") {
            filter += "and RemainingTerm<=" + RemainingTerm;
        }
        if (CurrentRate != "") {
            filter += "and CurrentRate<=" + CurrentRate;
        }
        return filter
    }
    //弹出筛选框
    $("#searchboxBtn").click(function () {
        $("#seachbox").toggle();
    })
    //过滤条件渲染kendo
    $("#filterKendo").click(function () {
        var a = $(window).height() - 150;
        if ($("#modal-win", window.parent.document).hasClass("icon icon-window-restore")) {
            a -= 40;
        }
        params = [];
        kendouGrid.RunderGrid(a);
        var str = "";
        if (params.length > 0) {
            $(".tips").show()
        } else {
            $(".tips").hide()
        }
        $.each(params, function (i, v) {
            str += v + ","
        })
        var len = str.length - 1;
        str = str.substring(0, len)
        GetAmount(PoolDBName, str)
        
        $("#seachbox").toggle();
    })
    //清除筛选条件
    $("#clearFilter").click(function () {
        localStorage.removeItem('contrastFilter');
        $("#RemainingTerm").val("");
        $("#CurrentRate").val("");
        $("#filterKendo").click();
        params = [];
        var str = "";
        if (params.length > 0) {
            $(".tips").show()
        } else {
            $(".tips").hide()
        }
        $.each(params, function (i, v) {
            str += v + ","
        })
        var len = str.length - 1;
        str = str.substring(0, len)
        GetAmount(PoolDBName, str)
    })
    //ToExcel
    $("#ToExcel").click(function () {

        if (!window.checkall && params.length == 0) {
            GSDialog.HintWindow("请勾选资产");
            return false;
        }
        var str = "";

        $.each(params, function (i, v) {
            str += v + ","
        })
        var len = str.length - 1;
        str = str.substring(0, len)

        var sPName = 'dbo.usp_GetAssetDetailsDownload';
        var randomNum = (new Date()).getTime();

        sVariableBuilder.AddVariableItem('poolDBName', PoolDBName, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('sPName', sPName, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('dimPoolId', CbkPoolId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('accountNoItem', str, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('randomNum', randomNum, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('where', filterConditions(), 'String', 0, 0, 0);
        var sVariable = sVariableBuilder.BuildVariables();

        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: 'ExportPoolData',
            sContext: sVariable,
            callback: function () {
                var sessionId = sessionStorage.getItem('sessionId');
                webProxy.getSessionProcessStatusList(sessionId, "Task", function (response) {
                    for (let i = 0; i < response.GetSessionProcessStatusListResult.List.length; i++){
                        if (response.GetSessionProcessStatusListResult.List[i].ActionStatus != "Success") {
                            return false;
                        }
        }
                    //download
                    var t = $("<a><span id='ac'></span></a>");
                    var url = "/TrustManagementService/TrustFiles/DownLoadFiles/AssetInfo_" + randomNum + ".xlsx";
                    t.attr("href", url);
                    t.appendTo($("body"));
                    $('#ac').trigger("click");
                    t.remove();
                });

                sessionStorage.removeItem('sessionId');

    }
        });
        tIndicator.show();
    })

    function dataClick() {
        $("#grid").on("click", function (e) {
            var that = e.target;
            var offset = $(".filter_box.filterBox_hider").position();
            var offsetParent = $(".filter_box.filterBox_hider").offsetParent();
            parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? { top: 0, left: 0 } : offsetParent.offset();
            var t = offset.top + parentOffset.top, l = offset.left + parentOffset.left;
            var b = t + $(".filter_box.filterBox_hider").outerHeight(), r = l + $(".filter_box.filterBox_hider").outerWidth();
            var result = event.pageY < b && event.pageY > t && event.pageX < r && event.pageX > l;
            if (!result && that != $("#searchboxBtn")[0]) {
                $(".filter_box.filterBox_hider").hide()
            }
        })
    }
    dataClick();

    $(window).resize(function () {
        var a = $(window).height() - 150;
        if ($("#modal-win", window.parent.document).hasClass("icon icon-window-restore")) {
            a -= 40;
        }
        $("#grid").height(a);
        $("#grid").children(".k-grid-content").height(a - 75)
        $("#grid").children(".k-grid-content-locked").height(a - 75)
    })
    $(window).resize()
    //勾选全部数据
    $("#opration").click(function () {
        if (!window.checkall) {
            $(this).html("取消勾选")
            $(this).prev().html("已勾选全部数据,")
            var arry = $(".selectbox");
            $("#checkAll").prop("checked", true);
            $.each(arry, function (i, v) {
                $(v).prop("checked", true);
            })
            params.splice(0, params.length);
            window.checkall = true;
            GetAmount(PoolDBName)
        } else {
            window.checkall = false;
            var arry = $(".selectbox");
            $("#checkAll").prop("checked", false);
            $.each(arry, function (i, v) {
                $(v).prop("checked", false);
            })
            $(".tips").hide();
            $(this).prev().html("已经勾选" + params.length + "条数据,")
            $(this).html("勾选全部" + window.total + "条数据");
        }
    })
});