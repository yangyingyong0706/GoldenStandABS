define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var kendoGridModel = require('./kendoGridModel');
    var common = require('common');
    require("kendomessagescn");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    require('date_input');
    require("jquery.searchSelect");
    var webStorage = require('gs/webStorage');
    var username = sessionStorage.getItem("gs_UserName");
    console.log(username)
    var filter = ' ';// "where DimSourceTrustID = " + trustId + " and ParentPoolId=0";
    $(function () {
        $('.date-plugins').date_input();
        $("#loading").css("display", "none");
        RenderSelectList()
    });
    //资产明细列表
    function RunderGrid(id, date, TrustCode) {
        var height = $(window).height() - 140;
        var kdGridAssetDetail = new kendoGridModel(height);
        if (id == 'ShouldAlso') {
            var ShouldAlsoOption = {
                renderOptions: {
                    height: height,
                    scrollable: true,
                    resizable: true,
                    filterable: true,
                    sortable: true,
                    columnMenu: false,//可现实隐藏列
                    reorderable: true,//可拖动改变列位置
                    groupable: false,//可拖动分组
                    resizable: true,//可拖动改变列大小
                    columns: [
                       { field: "TrustId", title: "产品编号", width: "150px", },
                       { field: "TrustCode", title: "产品代码", width: "150px", },
                       { field: "PayDate_Due", title: "应还日期", width: "150px", },
                       { field: "AccountNo", title: "资产编号", width: "150px", },
                       { field: "ItemName", title: "科目名称", width: "150px", },
                       { field: "Amount", title: "应还金额", width: "150px", },
                    ],
                },
                dataSourceOptions: {
                    pageSize: 20,
                    schema: {
                        model: {
                            fields: {
                                TrustId: { type: "string" },
                                TrustCode: { type: "string" },
                                AccountNo: { type: "string" },
                                ItemName: { type: "string" },
                                PayDate_Due: { type: "string" },
                                Amount: { type: "string" },
                            }
                        },
                        data: function (response) {
                            return jQuery.parseJSON(response).data;
                        },
                        total: function (response) {
                            return jQuery.parseJSON(response).total;
                        }
                    },
                    otherOptions: {
                        orderby: "TrustId ASC,Paydate_Due",
                        direction: "ASC",
                        DBName: 'TrustManagement',
                        appDomain: 'RiskManagement',
                        executeParamType: 'extend',
                        defaultfilter: filter,
                        executeParam: function () {
                            var result = {
                                SPName: 'usp_GetAccountNoByDate',
                                SQLParams: [
                                { Name: 'EndDate', value: date, DBType: 'string' },
                                { Name: 'TrustCode', value: TrustCode, DBType: 'string' },
                                { Name: 'UserName', value: username, DBType: 'string' },
                                ],
                            };
                            return result;
                        }
                    }
                }
            };
            kdGridAssetDetail.Init(ShouldAlsoOption, 'ShouldAlsoGrid');
        } else {
            var ToCopeWithOption = {
                renderOptions: {
                    height: height,
                    scrollable: true,
                    resizable: true,
                    filterable: true,
                    sortable: true,
                    columnMenu: false,//可现实隐藏列
                    reorderable: true,//可拖动改变列位置
                    groupable: false,//可拖动分组
                    resizable: true,//可拖动改变列大小
                    columns: [
                       { field: "TrustId", title: "产品编号", width: "150px", },
                       { field: "TrustCode", title: "产品代码", width: "150px", },
                       { field: "ReportingDate", title: "应还日期", width: "150px", },
                       { field: "Name", title: "科目名称", width: "150px", },
                        { field: "DueAmount", title: "应还金额", width: "150px", },
                    ],
                },
                dataSourceOptions: {
                    pageSize: 20,
                    schema: {
                        model: {
                            fields: {
                                TrustId: { type: "string" },
                                TrustCode: { type: "string" },
                                Name: { type: "string" },
                                ReportingDate: { type: "string" },
                                DueAmount: { type: "string" },
                            }
                        },
                        data: function (response) {
                            return jQuery.parseJSON(response).data;
                        },
                        total: function (response) {
                            return jQuery.parseJSON(response).total;
                        }
                    },
                    otherOptions: {
                        orderby: "TrustId ASC,ReportingDate ASC,Name",
                        direction: "ASC",
                        DBName: 'TrustManagement',
                        appDomain: 'RiskManagement',
                        executeParamType: 'extend',
                        defaultfilter: filter,
                        executeParam: function () {
                            var result = {
                                SPName: 'usp_GetTrustPaymentDetailsByEndDate',
                                SQLParams: [
                                      { Name: 'endDate', value: date, DBType: 'string' },
                                      { Name: 'TrustCode', value: TrustCode, DBType: 'string' },
                                      { Name: 'UserName', value: username, DBType: 'string' },
                                ],
                            };
                            return result;
                        }
                    }
                }
            };
            kdGridAssetDetail.Init(ToCopeWithOption, 'ToCopeWithGrid');
        }
      
        kdGridAssetDetail.RunderGrid();
    }
    function RenderSelectList() {
        var userName = webStorage.getItem('gs_UserName');
        var executeParam = {
            SPName: 'RiskManagement.usp_GetAllTrustCode', SQLParams: [{ Name: 'UserName', value: userName, DBType: 'string' }]
        };
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;
        common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
            var options = '<option value="-">-</options>'
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.TrustCode, v.TrustCode);
            })
            $("#sel-1").html('').append(options);
            $("#sel-2").html('').append(options);
            $('#sel-1').searchableSelect();
            $('#sel-2').searchableSelect();
        });
    }
    //tab切换
    $("body").on("click", ".changetabs li", function () {
        $(this).removeClass("active").addClass("active").siblings().removeClass("active");
        if ($(this).val() == "1") {
            $(this).parents(".changeTab").find(".ShouldAlso").show();
            $(this).parents(".changeTab").find(".ToCopeWith").hide();
            $("#ToCopeDate").val("")
        } else {
            $(this).parents(".changeTab").find(".ShouldAlso").hide();
            $(this).parents(".changeTab").find(".ToCopeWith").show();
            $("#ShouldDate").val("")
        }
    })
    //检索
    $("body").on("click", ".btn.btn-primary", function () {
        var id = $(this).parent().parent().attr("class");
        var date = $(this).parent().find(".date-plugins").val();
        var TrustCode = $(this).parent().find(".trustcod").val() == '-' ? null : $(this).parent().find(".trustcod").val();
        if (date == "") {
            GSDialog.HintWindow("日期不能为空")
            return false;
        }
        if (common.checkdate($(this).parent().find(".date-plugins")[0])) {
            RunderGrid(id, date, TrustCode)
        }
        console.log(id,date)
    })

});
