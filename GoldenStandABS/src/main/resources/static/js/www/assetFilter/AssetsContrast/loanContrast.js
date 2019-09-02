define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    require('bootstrap');
    require("ischeck");
    var kendoGridModel = require('app/assetFilter/AssetsContrast/js/kendoGridModel');
    var GSDialog = require('gsAdminPages');
    var CallApi = require("callApi");
    var webStore = require('gs/webStorage');
    var assetTree = null;
    var kendouGrid;
    var webProxy = require('gs/webProxy');
    var self = this;
    var PoolId = common.getQueryString('PoolId');//GSDialog.getData().Pool.PoolId;
    var CbkPoolId = GSDialog.getData().Pool.PoolId;
    var params = [];
    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
    var PoolDBName;
    var poolHeader;
    var poolbase;
    var ComperPoolbase;
    var poolfilter = 1;
    require("kendomessagescn");
    var paramS = [
        ['PoolId', PoolId, 'int']
    ];
    RenderSelect();
    var promise = webProxy.comGetData(paramS, svcUrl, 'usp_GetPoolHeaderById');
    promise().then(function (response) {
        if (typeof response === 'string') { poolHeader = JSON.parse(response); }
        else { poolHeader = response; }
        PoolDBName = poolHeader[0].PoolDBName;
        initKendouGridByPoolId(PoolDBName);
    })
    function GetAmount(PoolDBName, accountNoItem) {
        var filter = localStorage.getItem('contrastFilter'),
            resData;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "PoastData?";
        var executeParam = {
	        SPName: 'dbo.usp_GetAssetDetailsAmount', SQLParams: [
		        { name: 'DimPoolId', value: CbkPoolId, DBType: 'int' },
                { name: 'accountNoItem', value: accountNoItem?accountNoItem:'', DBType: 'string' },
		        { name: 'where', value: filter, DBType: 'string' },
                { name: 'ContrastPoolId', value: ComperPoolbase, DBType: 'string' },
                { name: 'ResultType', value: poolfilter, DBType: 'string' }
	        ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        $.ajax({
	        cache: false,
	        type: "POST",
	        async: false,
	        url: svcUrl + 'appDomain='+PoolDBName+'&executeParams=2&resultType=commom',
	        dataType: "json",
	        processData: false,
	        data: "[{executeParams:\"" + executeParams + "\"}," +
			        "{appDomain:\""+ PoolDBName +"\"}," +
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
                $('#showdate').html(common.getStringDate(resData[0].ReportingDate).dateFormat("yyyyMMdd"))//eval('new ' + resData[0].ReportingDate.replace(new RegExp('\/', 'gm'), '')).dateFormat("yyyyMMdd"))
                var str = "合同笔数：<span>" + resData[0].Total + "笔</span> 合同金额合计：<span>" +common.numFormt(resData[0].Total_ApprovalAmount) + 
"元</span> 剩余本金合计：<span>" + common.numFormt(resData[0].Total_CurrentPrincipalBalance) + "元</span>";
                $('.Total').html(str);
	        },
	        error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!');  }
        });
        //============
        //var filter = localStorage.getItem('contrastFilter'),
        //    resData;
        //var parm = [
        //    ['DimPoolId', CbkPoolId, 'int']
        //    , ['accountNoItem', accountNoItem ? accountNoItem : '', 'string']
        //    ,['where', filter, 'string']
        //    ,['ContrastPoolId', ComperPoolbase, 'int']
        //    ,['ResultType', poolfilter, 'int']
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
        //    if (resData[0].Total == "0") {
        //        $(".tips").hide()
        //    }
        //    $('#showdate').html(common.getStringDate(resData[0].ReportingDate).dateFormat("yyyyMMdd"))//eval('new ' + resData[0].ReportingDate.replace(new RegExp('\/', 'gm'), '')).dateFormat("yyyyMMdd"))
        //    var str = "合同笔数：<span>" + resData[0].Total + "笔</span> 合同金额合计：<span>" +common.numFormt(resData[0].Total_ApprovalAmount) + "元</span> 剩余本金合计：<span>" + common.numFormt(resData[0].Total_CurrentPrincipalBalance) + "元</span>";
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
        var first;
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
            if (i == 0) first = v.PoolId;
            html += "<option value='" + v.PoolId + "'>" + v.PoolName + "</option>"
        })
        poolbase = CbkPoolId;
        $("#poolbase").append(html);
        $("#poolbase").val(CbkPoolId);
        $("#ComperPoolbase").append(html);
        //
        var pid = webStore.getItem('ComperPoolId')
            , fid = webStore.getItem("PoolFilterType");
        if (pid != 'null' && pid != null)
            first = parseInt(pid);
        ComperPoolbase = first;
        $("#ComperPoolbase").val(first);
        if (fid != 'null' && fid != null) {
            fid = parseInt(fid);
            $("#poolfilter").val(fid)
            poolfilter = fid;
        }
        if (poolfilter == 0)
            $('#ToExcelOutIn').parent().hide();
        webStore.removeItem('ComperPoolId');
        webStore.removeItem('PoolFilterType')
    }

    function initKendouGridByPoolId(PoolDBName) {
        var height = $(window).height() - 150;//460;
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
                params: params
                , otherOptions: {
                    orderby: "AccountNo"
                    , direction: ""
                    , defaultfilter: filterConditions
                    , appDomain: PoolDBName
                    , executeParamType: 'extend'
                    , executeParam: function () {
                        var result = {
                            SPName: 'dbo.usp_GetAssetDetailsContrast', SQLParams: [
                                { Name: 'DimPoolId', Value: CbkPoolId, DBType: 'int' },
                                { Name: 'ContrastPoolId', Value: ComperPoolbase, DBType: 'int' },
                                { Name: 'ResultType', Value: poolfilter, DBType: 'int' },
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
        if (params.length > 0) {
            $(".tips").show()
        } else {
            $(".tips").hide()
        }
        $("#infomation").html("已经勾选" + params.length + "条数据,");
        $("#opration").html("勾选全部" + window.total + "条数据");
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
        //var str = '/Date(1408464000000)/';
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        return eval('new ' + str);
    };
    //过滤条件
    function filterConditions() {
        return ""
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
        sessionStorage.setItem('ComperPoolId', ComperPoolbase)
        sessionStorage.setItem('PoolFilterType', poolfilter)
    })
    //清除筛选条件
    $("#clearFilter").click(function () {
        ComperPoolbase = PoolId;
        poolbase = CbkPoolId;
        poolfilter = 1;
        localStorage.removeItem('contrastFilter');
        $("#poolbase").val(CbkPoolId);
        $("#ComperPoolbase").val(PoolId);
        $("#poolfilter").val(1)
        $("#filterKendo").click();
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
        ExportDataToExcel();

    })
    $("#ToExcelOutIn").click(function () {
        ExportDataToExcelOutIn();
    })
    function ExportDataToExcelOutIn() {
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
        var serviceUrl = GlobalVariable.CommonServicesUrl + 'ExportDataPoolToExcel';
        var objParam = { SPName: 'dbo.usp_GetAssetOutInPool', SQLParams: [{ Name: 'DimPoolId', Value: CbkPoolId, DBType: 'int' }, { Name: 'ContrastPoolId', Value: ComperPoolbase, DBType: 'int' }, { Name: 'ResultType', Value: poolfilter, DBType: 'int' }, { Name: 'AccountNoItem', Value: str, DBType: 'string' }] };
        var strParam = encodeURIComponent(JSON.stringify(objParam));
        var obj = { connectionName: PoolDBName, param: strParam, excelName: poolfilter == '2' ? "入池列表" : '出池列表', sheetName: 'assets' };

        var tempform = document.createElement("form");
        tempform.action = serviceUrl;
        tempform.method = "post";
        tempform.style.display = "none";
        for (var x in obj) {
            var opt = document.createElement("input");
            opt.name = x;
            opt.value = obj[x];
            tempform.appendChild(opt);
        }

        var opt = document.createElement("input");
        opt.type = "submit";
        tempform.appendChild(opt);
        document.body.appendChild(tempform);
        tempform.submit();
        document.body.removeChild(tempform);
    }
    function ExportDataToExcel() {
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
        var serviceUrl = GlobalVariable.CommonServicesUrl + 'ExportDataPoolToExcel';
        var objParam = { SPName: 'dbo.usp_GetAssetDetailsDownload', SQLParams: [{ Name: 'DimPoolId', Value: CbkPoolId, DBType: 'int' }, { Name: 'where', Value: filterConditions(), DBType: 'string' }, { Name: 'AccountNoItem', Value: str, DBType: 'string' }, { Name: 'ContrastPoolId', Value: ComperPoolbase, DBType: 'int' }, { Name: 'ResultType', Value: poolfilter, DBType: 'int' }] };
        var strParam = encodeURIComponent(JSON.stringify(objParam));
        var obj = { connectionName: PoolDBName, param: strParam, excelName: "资产明细", sheetName: 'PoolCut' };

        var tempform = document.createElement("form");
        tempform.action = serviceUrl;
        tempform.method = "post";
        tempform.style.display = "none";
        for (var x in obj) {
            var opt = document.createElement("input");
            opt.name = x;
            opt.value = obj[x];
            tempform.appendChild(opt);
        }

        var opt = document.createElement("input");
        opt.type = "submit";
        tempform.appendChild(opt);
        document.body.appendChild(tempform);
        tempform.submit();
        document.body.removeChild(tempform);

    }
    //
    $("#ComperPoolbase").change(function () {
        ComperPoolbase = $(this).val()
    })
    $("#poolbase").change(function () {
        poolbase = $(this).val();
    })
    $("#poolfilter").change(function () {
        poolfilter = $(this).val();
        if (poolfilter == 0)
            $('#ToExcelOutIn').parent().hide();
        else {
            $('#ToExcelOutIn').parent().show();
        }
    })

    //
    function dataClick() {
        $("body").on("click", function (e) {
            var that = e.target;
            var offset = $(".filter_box.filterBox_hider").position();
            var offsetParent = $(".filter_box.filterBox_hider").offsetParent();
            parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? { top: 0, left: 0 } : offsetParent.offset();
            var t = offset.top + parentOffset.top, l = offset.left + parentOffset.left;
            var b = t + $(".filter_box.filterBox_hider").outerHeight(), r = l + $(".filter_box.filterBox_hider").outerWidth();
            var result = event.pageY < b && event.pageY > t && event.pageX < r && event.pageX > l;
            if (!result && that != $("#searchboxBtn")[0] && that != $("#ComperPoolbase")[0] && that != $("#poolfilter")[0]) {
                $(".filter_box.filterBox_hider").hide()
            }
        })
    }
    dataClick()

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
        if (window.checkall) {
            window.checkall = false;
            var arry = $(".selectbox");
            $("#checkAll").prop("checked", false);
            $.each(arry, function (i, v) {
                $(v).prop("checked", false);
            })
            $(".tips").hide();
            $(this).prev().html("已经勾选" + params.length + "条数据,")
            $(this).html("勾选全部" + window.total + "条数据");
        } else {
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
        }
    })
});