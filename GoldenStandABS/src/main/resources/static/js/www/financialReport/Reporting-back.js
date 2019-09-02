var selectedDate = $("#selected-date").dxDateBox({
    value: new Date(),
    width: "100%"
}).dxDateBox("instance");
var selectedDate = $("#selected-date2").dxDateBox({
    value: new Date(new Date() - 48 * 60 * 60 * 1000),
    width: "100%"
}).dxDateBox("instance");
var selectedDate = $("#selected-date3").dxDateBox({
    value: new Date(),
    width: "100%"
}).dxDateBox("instance");
var selectedDate = $("#selected-date4").dxDateBox({
    value: new Date(new Date() - 48 * 60 * 60 * 1000),
    width: "100%"
}).dxDateBox("instance");

var selectedDate = $("#reportingDate").dxDateBox({
    value: new Date(new Date() - 24 * 60 * 60 * 1000),
    width: "100%"
}).dxDateBox("instance");
var dataGridHeaderFilterConfig = {
    allowSearch: true,
    height: 325,
    visible: true,
    width: 252
};
   
var products = [];
var executeParam = { SPName: 'usp_GetAllTrustName', SQLParams: [] };
var executeParams = encodeURIComponent(JSON.stringify(executeParam));
var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
CallWCFSvc(serviceUrl, true, 'GET', function (data) {
    if (data.length > 0) {
        products = data;
    } else {
        products = [];
    }
    $("#list").dxSelectBox({
        items: products,
        displayExpr: "TrustName",
        valueExpr: "TrustCode",
        searchEnabled: true
    });
    $("#list2").dxSelectBox({
        items: products,
        displayExpr: "TrustName",
        valueExpr: "TrustCode",
        searchEnabled: true
    });

})
$(function () {
    var reportingObj = {
        getReport1: function () {
            $(".list_time_chose2").hide();
            $(".list_time_chose3").hide();
            $(".list_time_chose").hide();
            $(".list_time_chose4").show();
            $('.change_box_service .change_box_each').removeClass('change_box_each_active')
            $('.change_box_service .change_box_each:eq(0)').addClass('change_box_each_active')
        },
        getReport2: function () {
            $(".list_time_chose").hide();
            $(".list_time_chose3").hide();
            $(".list_time_chose2").hide();
            $(".list_time_chose4").hide();
            $('.change_box_taizhang .change_box_each2').removeClass('change_box_each_active')
            $('.change_box_taizhang .change_box_each2:eq(0)').addClass('change_box_each_active')
            this.getTrustInfoData();
        },
        getReport3: function () {
            $(".list_time_chose").hide();
            $(".list_time_chose2").hide();
            $(".list_time_chose3").show();
            $(".list_time_chose4").hide();
        },
        getReport4: function () {
            $(".list_time_chose2").hide();
            $(".list_time_chose3").hide();
            $(".list_time_chose").show();
            $(".list_time_chose4").hide();
            this.getAssetMonthlyData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
        },
        getReport5: function () {
            $(".list_time_chose").hide();
            $(".list_time_chose2").hide();
            $(".list_time_chose3").show();
            $(".list_time_chose4").hide();
        },
        getReport6: function () {
            $(".list_time_chose").hide();
            $(".list_time_chose3").hide();
            $(".list_time_chose2").show();
            $(".list_time_chose4").hide();
            this.getCashFlowByDayData($("#reportingDate input[type='hidden']").val());
        },
        getReport7: function () {
            $(".list_time_chose2").hide();
            $(".list_time_chose3").hide();
            $(".list_time_chose").show();
            $(".list_time_chose4").hide();
            $('.change_boxMI .change_box_each3').removeClass('change_box_each_active')
            $('.change_boxMI .change_box_each3:eq(0)').addClass('change_box_each_active')
            this.getCapitalMIAssetData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
        },
        getReport8: function () {
            $(".list_time_chose").hide();
            $(".list_time_chose3").hide();
            $(".list_time_chose2").show();
            $(".list_time_chose4").hide();
            this.getABSRepaymentDetailsData($("#reportingDate input[type='hidden']").val());
        },
        getAssetServiceReportData: function (startDate, endDate, TrustCode) {
            var Asset = [];
            var executeParam = { SPName: 'ReportView.usp_GetAssetService_AssetData', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'TrustCode', Value: TrustCode, DBType: 'string' });

            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    Asset.push(
                       {
                           "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                           "Attribute": "期初剩余贷款余额", "Count": data[0].OpenCounts, "Money": data[0].OpeningPrincipalBalance, "Percentage": '/'
                       },
                       {
                           "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                           "Attribute": "期末剩余贷款余额", "Count": data[0].CloseCounts, "Money": data[0].ClosePrincipalBalance, "Percentage": '/'
                       },
                       {
                           "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                           "Attribute": "期间实收本金", "Count": '-', "Money": data[0].ScheduledPrincipal, "Percentage": '/'
                       },
                       {
                           "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                           "Attribute": "期间代偿", "Count": '-', "Money": data[0].ActualPrincipal, "Percentage": '/'
                       },
                       {
                           "TrustName": data[0].TrustName, "tableType": '基础信息', "StartTime": data[0].StartTime, "EndTime": data[0].EndTime,
                           "Attribute": "期间实收利罚等", "Count": '-', "Money": data[0].ActualTotablFee, "Percentage": '/'
                       }
                   )

                }
                var executeParamAsset = { SPName: 'ReportView.usp_ClassificationCompensationData', SQLParams: [] };
                executeParamAsset.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
                executeParamAsset.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
                executeParamAsset.SQLParams.push({ Name: 'TrustCode', Value: TrustCode, DBType: 'string' });

                var executeParamAsset = encodeURIComponent(JSON.stringify(executeParamAsset));
                var serviceUrlAsset = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParamAsset;
                CallWCFSvc(serviceUrlAsset, true, 'GET', function (dataAsset) {
                    if (dataAsset.length > 0) {
                        Asset.push(
                            {
                                "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                "Attribute": "代偿类", "Count": dataAsset[0].CompensationLoanCount, "Money": dataAsset[0].CompensationPrincipal, "Percentage": dataAsset[0].CompensationPercentage
                            },
                            {
                                "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                "Attribute": "可疑类", "Count": dataAsset[0].DoubtLoanCount, "Money": dataAsset[0].DoubtAmount, "Percentage": dataAsset[0].DoubtPercentage
                            },
                            {
                                "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                "Attribute": "逾期类", "Count": dataAsset[0].InArrearsLoanCount, "Money": dataAsset[0].PrincipalInArrears, "Percentage": dataAsset[0].InArrearsPercentage
                            },
                            {
                                "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                "Attribute": "关注类", "Count": dataAsset[0].InterestLoanCount, "Money": dataAsset[0].InterestAmount, "Percentage": dataAsset[0].InterestPercentage
                            },
                            {
                                "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                "Attribute": "损失类", "Count": dataAsset[0].LossLoanCount, "Money": dataAsset[0].LossAmount, "Percentage": dataAsset[0].LossPercentage
                            },
                            {
                                "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                "Attribute": "正常类", "Count": dataAsset[0].NormalLoanCount, "Money": dataAsset[0].NormalAmount, "Percentage": dataAsset[0].NormalPercentage
                            },
                            {
                                "TrustName": dataAsset[0].TrustName, "tableType": '五级分类', "StartTime": dataAsset[0].StartTime, "EndTime": dataAsset[0].EndTime,
                                "Attribute": "次级类", "Count": dataAsset[0].SecondaryLoanCount, "Money": dataAsset[0].SecondaryAmount, "Percentage": dataAsset[0].SecondaryPercentage
                            }
                        )
                    }
                    $("#Asset").dxPivotGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        MinHeight: 440,
                        showBorders: true,
                        showRowGrandTotals: false,
                        showColumnGrandTotals: false,
                        fieldChooser: {
                            enabled: true
                        },
                        scrolling: {
                            mode: "virtual"
                        },
                        "export": {
                            enabled: true,
                            fileName: "资产服务报告_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: {
                            fields: [
                                {
                                    caption: "资管计划名称",
                                    dataField: "TrustName",
                                    area: "row",
                                    showTotals: false,
                                    expanded: true,
                                },
                                {
                                    caption: "开始时间",
                                    dataField: "StartTime",
                                    area: "column",
                                    showTotals: false,
                                    expanded: true,
                                },
                                {
                                    caption: "结束时间",
                                    dataField: "EndTime",
                                    area: "column",
                                    showTotals: false,
                                    expanded: true,
                                },
                                {
                                    caption: "表名",
                                    dataField: "tableType",
                                    area: "row",
                                    showTotals: false,
                                    expanded: true,
                                },
                                {
                                    caption: "属性",
                                    width: 200,
                                    dataField: "Attribute",
                                    dataType: "string",
                                    summaryType: 'custom',
                                    calculateCustomSummary: function (options) {
                                        if (options.summaryProcess == 'start') {
                                            // 初始化
                                        }
                                        if (options.summaryProcess == 'calculate') {
                                            //修改 "totalValue" here
                                            options.totalValue = options.value;
                                        }
                                        if (options.summaryProcess == 'finalize') {
                                            // 最终结果 value to "totalValue" here
                                        }
                                    },
                                    area: "row"
                                },
                                 {
                                     caption: "金额",
                                     dataField: "Money",
                                     dataType: "number",
                                     summaryType: "sum",
                                     format: { type: 'fixedPoint', precision: 2 },
                                     area: "data"
                                 },
                                {
                                    caption: "笔数",
                                    dataField: "Count",
                                    dataType: "string",
                                    summaryType: 'custom',
                                    calculateCustomSummary: function (options) {
                                        if (options.summaryProcess == 'start') {
                                            // 初始化
                                        }
                                        if (options.summaryProcess == 'calculate') {
                                            //修改 "totalValue" here
                                            options.totalValue = options.value;
                                        }
                                        if (options.summaryProcess == 'finalize') {
                                            // 最终结果 value to "totalValue" here
                                        }
                                    },
                                    area: "data"
                                },

                                 {
                                     caption: "占比",
                                     dataField: "Percentage",
                                     dataType: "string",
                                     summaryType: 'custom',
                                     calculateCustomSummary: function (options) {
                                         if (options.summaryProcess == 'start') {
                                             // 初始化
                                         }
                                         if (options.summaryProcess == 'calculate') {
                                             //修改 "totalValue" here
                                             options.totalValue = options.value;
                                         }
                                         if (options.summaryProcess == 'finalize') {
                                             // 最终结果 value to "totalValue" here
                                         }
                                     },
                                     area: "data"
                                 }
                            ],
                            store: Asset
                        }
                    })
                })
                console.log(Asset)
            })

        },
        getClassificationCompensationData: function (startDate, endDate, TrustCode) {
            var ClassificationCompensation = [];
            var executeParamAsset = { SPName: 'ReportView.usp_ClassificationCompensationData', SQLParams: [] };
            executeParamAsset.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
            executeParamAsset.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
            executeParamAsset.SQLParams.push({ Name: 'TrustCode', Value: TrustCode, DBType: 'string' });

            var executeParamAsset = encodeURIComponent(JSON.stringify(executeParamAsset));
            var serviceUrlAsset = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParamAsset;
            CallWCFSvc(serviceUrlAsset, true, 'GET', function (data) {
                if (data.length > 0) {
                    ClassificationCompensation = data;
                } else {
                    ClassificationCompensation = [];
                }
                $("#ClassificationCompensation").dxPivotGrid({
                    allowSortingBySummary: true,
                    allowSorting: true,
                    allowFiltering: true,
                    allowExpandAll: true,
                    MinHeight: 440,
                    showBorders: true,
                    showRowGrandTotals: false,
                    showColumnGrandTotals: false,
                    scrolling: {
                        mode: "virtual"
                    },
                    fieldChooser: {
                        enabled: true
                    },
                    "export": {
                        enabled: true,
                        fileName: "资产服务报告_五级分类表和逾期代偿_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                    },
                    dataSource: {
                        fields: [
                            {
                                caption: "资管计划名称",
                                width: 120,
                                dataField: "TrustName",
                                area: "row"
                            },
                            {
                                caption: "正常类金额",
                                dataField: "NormalAmount",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 2 },
                                area: "data"
                            },
                            {
                                caption: "关注类金额",
                                dataField: "InterestAmount",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 2 },
                                area: "data"
                            },
                            {
                                caption: "次级类金额",
                                dataField: "SecondaryAmount",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 2 },
                                area: "data"
                            },
                            {
                                caption: "可疑类金额",
                                dataField: "DoubtAmount",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 2 },
                                area: "data"
                            },
                            {
                                caption: "损失类金额",
                                dataField: "LossAmount",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 2 },
                                area: "data"
                            },
                             {
                                 caption: "正常类笔数",
                                 dataField: "NormalLoanCount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "关注类笔数",
                                 dataField: "InterestLoanCount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "次级类笔数",
                                 dataField: "SecondaryLoanCount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "可疑类笔数",
                                 dataField: "DoubtLoanCount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "损失类笔数",
                                 dataField: "LossLoanCount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "逾期本金余额",
                                 dataField: "PrincipalInArrears",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "逾期笔数",
                                 dataField: "InArrearsLoanCount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "代偿本金余额",
                                 dataField: "CompensationPrincipal",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "代偿笔数",
                                 dataField: "InArrearsLoanCount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },

                             {
                                 caption: "正常类百分比",
                                 dataField: "NormalPercentage",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "关注类百分比",
                                 dataField: "InterestPercentage",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "次级类百分比",
                                 dataField: "SecondaryPercentage",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "可疑类百分比",
                                 dataField: "DoubtPercentage",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "损失类百分比",
                                 dataField: "LossPercentage",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "逾期占比",
                                 dataField: "InArrearsPercentage",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                              {
                                  caption: "代偿占比",
                                  dataField: "CompensationPercentage",
                                  dataType: "number",
                                  summaryType: "sum",
                                  format: { type: 'fixedPoint', precision: 2 },
                                  area: "data"
                              },
                        ],
                        store: ClassificationCompensation
                    }
                })
            })
        },
        getTrustInfoData: function () {
            var TrustInfoB = [];
            var executeParam = { SPName: 'usp_GetTrustInfoBData', SQLParams: [] };
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    TrustInfoB = data;
                } else {
                    TrustInfoB = [];
                }
                assetControl = $("#TrustInfoB").dxDataGrid({
                    allowSortingBySummary: true,
                    allowSorting: true,
                    allowFiltering: true,
                    allowExpandAll: true,
                    allowColumnReordering: true,
                    allowColumnResizing: true,
                    headerFilter: dataGridHeaderFilterConfig,
                    scrolling: {
                        mode: "virtual"
                    },
                    paging: { pageSize: 5 },
                    pager: {
                        showPageSizeSelector: true,
                        allowedPageSizes: [5, 15, 25]
                    },
                    MinHeight: 440,
                    searchPanel: {
                        visible: true,
                        width: 240,
                        placeholder: "Search..."
                    },
                    showBorders: true,
                    fieldChooser: {
                        enabled: true
                    },
                    "export": {
                        enabled: true,
                        fileName: "出表融资台账B端_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                    },
                    dataSource: TrustInfoB,
                    columns: [//{ caption: '资产计划标识', width: '130', dataField: "TrustCode" },
                        { caption: '资管计划名称', width: '130', dataField: "TrustName" },
                        //{ caption: '系统中名称', width: '200', dataField: "ProductName" },
                        { caption: 'Way', width: '130', dataField: "SaleMethod" },
                        { caption: '归属法人', width: '130', dataField: "OrganizationName" },
                        { caption: '资金源', width: '130', dataField: "FundSource" },
                        { caption: '通道商', width: '130', dataField: "FundChannel" },
                        { caption: '公私', width: '130', dataField: "PublicOrPrivate" },
                        { caption: '出表规模', width: '130', dataField: "OfferAmount", format: { type: 'fixedPoint', precision: 2 } },
                        { caption: '封包日', width: '130', dataField: "CloseDate" },
                        { caption: '封包日实际资产余额', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "SaleDateRemainingPrincipal" },
                        { caption: '封包日应收利息', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "CurrentInterestBalance" },
                        { caption: '出表损益', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "SaleProfit" },
                        { caption: '出表日期', width: '130', dataField: "SaleDate" },
                        { caption: '到期日', width: '130', dataField: "LoanMaturityDate" },
                        { caption: '计息基数', width: '130', dataField: "DayCount" },
                        { caption: '打包价(%)', width: '130', dataField: "PackageInterestRate" },
                        { caption: '底层资产', width: '130', dataField: "ProductType" },

                        { caption: '所在系统', width: '130', dataField: "DataSource" },

                        { caption: '归集方式', width: '130', dataField: "CollectionMethod" },
                        { caption: '兑付/归集日', width: '130', dataField: "PaymentDate" },
                        { caption: '是否实收归集', width: '130', dataField: "IsActualCollected" },
                        { caption: '是否生成归集记录', width: '130', dataField: "IsGenerateLog" },
                        { caption: '首次线下归集金额', width: '130', dataField: "FirstUnderlineTotalCollectAmount" },
                        { caption: '其中本金', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "Principal" },
                        { caption: '其中利息', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "Interest" },
                        { caption: '其中罚息', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "DefautFee" }
                    ]
                })
            })
        },
        getTrustInfoCData: function () {
            var TrustInfoC = [];
            var executeParamC = { SPName: '[ReportView].[usp_GetTrustInfoCData]', SQLParams: [] };
            var executeParamsC = encodeURIComponent(JSON.stringify(executeParamC));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParamsC;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    TrustInfoC = data;
                } else {
                    TrustInfoC = [];
                }
                classAssetControl = $("#TrustInfoC").dxDataGrid({
                    allowSortingBySummary: true,
                    allowSorting: true,
                    allowFiltering: true,
                    allowExpandAll: true,
                    allowColumnReordering: true,
                    allowColumnResizing: true,
                    scrolling: {
                        mode: "virtual"
                    },
                    MinHeight: 440,
                    searchPanel: {
                        visible: true,
                        width: 240,
                        placeholder: "Search..."
                    },
                    paging: { pageSize: 5 },
                    pager: {
                        showPageSizeSelector: true,
                        allowedPageSizes: [5, 15, 25]
                    },
                    showBorders: true,
                    fieldChooser: {
                        enabled: true
                    },
                    "export": {
                        enabled: true,
                        fileName: "出表融资台账C端_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                    },
                    dataSource: TrustInfoC,
                    columns: [  //{caption: '资产计划标识', width:'130',dataField: "TrustCode"}, 
                                //{caption: '产品名称',width:'200', dataField: "ProductName"},
                                { caption: '资管计划名称', width: '130', dataField: "TrustName" },
                                { caption: '归属法人', width: '130', dataField: "OrganizationName" },
                                { caption: '资金源', width: '130', dataField: "FundSource" },
                                { caption: '通道商', width: '130', dataField: "FundChannel" },
                                { caption: '新做/续接', width: '130', dataField: "NewOrExtended" },
                                { caption: '被续接资管计划', width: '130', dataField: "ExtendedTrust" },
                                { caption: '底层资产', width: '130', dataField: "ProductType" },
                                { caption: '所在系统', width: '130', dataField: "DataSource" },
                                { caption: '底层资产原始期限', width: '130', dataField: "LoanTerm" },
                                { caption: '本次出表前剩余期限', width: '130', dataField: "BeforeSaleRemainingTerm" },
                                { caption: '本次出表期限', width: '130', dataField: "SaleTerm" },
                                { caption: '出表后剩余期限', width: '130', dataField: "AfterSaleRemainingTerm" },
                                { caption: '续接ta的资管计划', width: '130', dataField: "ExtendingTrust" },
                                { caption: '超额收益', width: '130', dataField: "ExcessIncome" },
                                { caption: '出表规模', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "OfferAmount" },
                                { caption: '资管计划建立日', width: '130', dataField: "CloseDate" },
                                { caption: '资管计划到期日', width: '130', dataField: "LoanMaturityDate" },
                                { caption: '续存期', width: '130', dataField: "RenewalPeriod" },
                                { caption: '资金价格(%)', width: '130', dataField: "PackageInterestRate" },
                                { caption: '借款利息', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "interest" },
                                { caption: '通道费率', width: '130', dataField: "ChannelFeeRate" },
                                { caption: '通道费', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "ChannelFee" },
                                { caption: '托管费率', width: '130', dataField: "TrusteeRate" },
                                { caption: '托管费', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "TrusteeFee" },
                                { caption: '财顾费', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "FinicialAnalysisFee" },
                                { caption: '到期资金端兑付总额', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "TotalPayment" },
                                { caption: '到期续接金额', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "MaturityExtendedAmount" },
                                { caption: '到期小贷支付金额', width: '130', format: { type: 'fixedPoint', precision: 2 }, dataField: "MaturityMicroLoanPaymentAmount" }
                    ]
                })
            })
        },
        getProfitAmortizationData: function (code) {
            var ProfitAmortization = [];
            var executeParam = { SPName: '[ReportView].[usp_getProfitAmortization]', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'TrustCode', Value: code, DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    var newList = [];
                    for (var i = 0; i < data.length; i++) {
                        var AmortizationYear, AmortizationMonth, AmortizationDay;
                        if (data[i].AmortizationDate) {
                            var dueDate = data[i].AmortizationDate;
                            AmortizationYear = dueDate.substring(0, 4);
                            AmortizationMonth = dueDate.substring(5, 7);
                            AmortizationDay = dueDate.substring(8);
                        }
                        newList.push({
                            "TrustName": data[i].TrustName, "OfferAmount": data[i].OfferAmount, "SaleDate": data[i].SaleDate, "LoanMaturityDate": data[i].LoanMaturityDate
                                    , "SaleDateRemainingPrincipal": data[i].SaleDateRemainingPrincipal, "CurrentInterestBalance": data[i].CurrentInterestBalance, "FairValueAdjustment": data[i].FairValueAdjustment
                                    , "CurrentPrincipalBalance_Adjusted": data[i].CurrentPrincipalBalance_Adjusted, "SaleProfit": data[i].SaleProfit, "ExcessIncome": data[i].ExcessIncome, "TotalProfit": data[i].TotalProfit
                                    , "AmortizationAmount": data[i].AmortizationAmount, "AmortizationYear": AmortizationYear, "AmortizationMonth": AmortizationMonth, "AmortizationDay": AmortizationDay
                        })
                    }
                    ProfitAmortization = newList;
                } else {
                    ProfitAmortization = [];
                }
                $("#ProfitAmortization").dxPivotGrid({
                    allowSortingBySummary: true,
                    allowSorting: true,
                    allowFiltering: true,
                    allowExpandAll: true,
                    allowColumnReordering: true,
                    allowColumnResizing: true,
                    showColumnGrandTotals: false,
                    showRowGrandTotals: false,
                    scrolling: {
                        mode: "virtual"
                    },
                    MinHeight: 440,
                    showBorders: true,
                    fieldChooser: {
                        enabled: true
                    },
                    "export": {
                        enabled: true,
                        fileName: "损益摊销_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                    },
                    dataSource: {
                        fields: [
                            { caption: "资管计划名称", dataField: "TrustName", area: "row" },
                            { caption: "年", dataField: "AmortizationYear", dataType: "AmortizationYear", area: "column" },
                            { caption: "月", dataField: "AmortizationMonth", dataType: "AmortizationMonth", area: "column" },
                            { caption: "日", dataField: "AmortizationDay", dataType: "AmortizationDay", area: "column" },
                            { caption: "出表规模", dataField: "OfferAmount", dataType: "OfferAmount", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                            { caption: "封包日实际资产余额", dataField: "SaleDateRemainingPrincipal", dataType: "SaleDateRemainingPrincipal", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                            { caption: "封包日应收利息", dataField: "CurrentInterestBalance", dataType: "CurrentInterestBalance", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                            { caption: "公允价值调整", dataField: "FairValueAdjustment", dataType: "FairValueAdjustment", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                            { caption: "调整后的当前本金余额", dataField: "CurrentPrincipalBalance_Adjusted", dataType: "CurrentPrincipalBalance_Adjusted", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                            { caption: "出表损益", dataField: "SaleProfit", dataType: "SaleProfit", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                            { caption: "超额收益", dataField: "ExcessIncome", dataType: "ExcessIncome", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                            { caption: "合计损益", dataField: "TotalProfit", dataType: "TotalProfit", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                            { caption: "摊销金额", dataField: "AmortizationAmount", dataType: "AmortizationAmount", summaryType: "sum", format: { type: 'fixedPoint', precision: 2 }, area: "data" },
                        ],
                        store: ProfitAmortization
                    }
                })
            })
        },
        getAssetMonthlyData: function (startDate, endDate) {
            var AssetMonthly = [];
            var executeParam = { SPName: '[ReportView].[usp_GetAssetMonthly]', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    AssetMonthly = data;
                } else {
                    AssetMonthly = [];
                }
                $("#AssetMonthly").dxPivotGrid({
                    allowSortingBySummary: true,
                    allowSorting: true,
                    allowFiltering: true,
                    allowExpandAll: true,
                    MinHeight: 440,
                    showBorders: true,
                    showRowGrandTotals: false,
                    showColumnGrandTotals: false,
                    fieldChooser: {
                        enabled: true
                    },
                    "export": {
                        enabled: true,
                        fileName: "月结_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                    },
                    dataSource: {
                        fields: [
                            {
                                caption: "出表资产",
                                dataField: "ProductType",
                                area: "row"
                            },
                            {
                                caption: "结束时间",
                                dataField: "EndDate",
                                dataType: "EndDate",
                                area: "column"
                            },
                            {
                                caption: "法人主体",
                                dataField: "OrganizationCode",
                                dataType: "OrganizationCode",
                                area: "row"
                            },
                            {
                                caption: "出表状态",
                                dataField: "AssetStatus",
                                dataType: "AssetStatus",
                                area: "row"
                            },
                          /*  {
                                caption: "抵押类型",
                                dataField: "MortageType",
                                dataType: "MortageType",
                                area: "row"
                            },
                             {
                                 caption: "资金模式",
                                 dataField: "FundMode",
                                 dataType: "FundMode",
                                 area: "row"
                             },
                             {
                                 caption: "期数",
                                 dataField: "Term",
                                 dataType: "Term",
                                 area: "row"
                             },
                              {
                                  caption: "担保机构",
                                  dataField: "GuaranteeCorporation",
                                  dataType: "GuaranteeCorporation",
                                  area: "row"
                              },*/

                            {
                                caption: "出表金额",
                                dataField: "NewSaleAmount",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 2 },
                                area: "data"
                            },
                            {
                                caption: "出表资产贷款余额",
                                dataField: "SaleDateRemainingPrincipal",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 2 },
                                area: "data"
                            },
                             {
                                 caption: "利息收入",
                                 dataField: "InterestIncome",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             }],
                        store: AssetMonthly
                    }
                })
            })
        },
        getFinancingCostData: function (TrustName, BorC) {
            var FinancingCost = [];
            var executeParam = { SPName: '[ReportView].[usp_GetFinancingCostData]', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'trustcode', Value: TrustName, DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    FinancingCost = data;
                } else {
                    FinancingCost = [];
                }
                if (BorC) {
                    $("#FinancingCost").dxDataGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        MinHeight: 440,
                        allowColumnReordering: true,
                        allowColumnResizing: true,
                        headerFilter: dataGridHeaderFilterConfig,
                        scrolling: {
                            mode: "virtual"
                        },
                        paging: { pageSize: 5 },
                        pager: {
                            showPageSizeSelector: true,
                            allowedPageSizes: [5, 15, 25]
                        },
                        searchPanel: {
                            visible: true,
                            width: 240,
                            placeholder: "Search..."
                        },
                        showBorders: true,
                        fieldChooser: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: "资金成本C端_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: FinancingCost,
                        columns: [{ caption: '资产计划标识', width: 120, dataField: "TrustName" },
                            { caption: 'B/C', width: 100, dataField: "BorC" },
                            { caption: '法人名称', width: 200, dataField: "OrganizationName" },
                            { caption: '成立日', width: 120, dataField: "StartDate" },
                            { caption: '兑付日', width: 120, dataField: "EndDate" },
                            { caption: '期限', width: 120, dataField: "Term" },

                            { caption: '利率(%)', width: 120, dataField: "PackageInterestRate" },
                            { caption: '应付利息', width: 120, dataField: "Interest" },
                            { caption: '应付本金', width: 120, dataField: "Principal" },

                            { caption: '通道费', width: 120, dataField: "ChannelFee" },
                            { caption: '托管费', width: 120, dataField: "TrusteeFee" },
                            { caption: '财顾费', width: 120, dataField: "FinacialAnalysisFee" },
                            { caption: '兑付总计', width: 120, dataField: "TotalPayment" },

                            { caption: '日资金成本', width: 120, dataField: "DayCost" },
                            { caption: '年化资金成本率', width: 120, dataField: "AnnualizedCostRate" },

                            { caption: '资金成本', width: 120, dataField: "Cost" },
                            { caption: '摊还天数', width: 120, dataField: "Days" },
                            { caption: '资本折算', width: 120, dataField: "CapitalConversion" },
                        ],
                    })
                } else {
                    $("#FinancingCost").dxDataGrid({
                        allowSortingBySummary: true,
                        allowSorting: true,
                        allowFiltering: true,
                        allowExpandAll: true,
                        allowColumnReordering: true,
                        allowColumnResizing: true,
                        headerFilter: dataGridHeaderFilterConfig,
                        scrolling: {
                            mode: "virtual"
                        },
                        MinHeight: 440,
                        searchPanel: {
                            visible: true,
                            width: 240,
                            placeholder: "Search..."
                        },
                        paging: { pageSize: 5 },
                        pager: {
                            showPageSizeSelector: true,
                            allowedPageSizes: [5, 15, 25]
                        },
                        showBorders: true,
                        fieldChooser: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: "资金成本B端_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                        },
                        dataSource: FinancingCost,
                        columns: [{ caption: '资产计划标识', width: 120, dataField: "TrustName" },
                            { caption: 'B/C', width: 100, dataField: "BorC" },
                            { caption: '法人名称', width: 200, dataField: "OrganizationName" },
                            { caption: '出表日期', width: 120, dataField: "SaleDate" },
                            { caption: '到期日', width: 120, dataField: "LoanMaturityDate" },
                            { caption: '兑付日期', width: 120, dataField: "PaymentDate" },

                            { caption: '期限', width: 120, dataField: "Term" },
                            { caption: '利息', width: 120, dataField: "Interest" },
                            { caption: '变动费用', width: 120, dataField: "VariableFee" },

                            { caption: '固定费用', width: 120, dataField: "FixedFee" },
                            { caption: '当期总成本', width: 120, dataField: "CurrentTotalCost" },
                            { caption: '摊还日期', width: 120, dataField: "AmortizationDate" },
                            { caption: '摊还金额', width: 120, dataField: "AmortizationAmount" }
                        ],
                    })
                }
            })
        },
        getCashFlowByDayData: function (day) {
            var CashFlow = [];
            var executeParam = { SPName: '[ReportView].[usp_GetCashFlowByDayData]', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'days', Value: day, DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    var newData = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].ActualorSchedule == 'Actual') {
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '本金', "Money": data[i].Principal, "Date": data[i].Date, "AttributeColumn": '实际' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '利息', "Money": data[i].Interest, "Date": data[i].Date, "AttributeColumn": '实际' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '罚息', "Money": data[i].DefautFee, "Date": data[i].Date, "AttributeColumn": '实际' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '现金流出', "Money": data[i].FinancingPayment, "Date": data[i].Date, "AttributeColumn": '实际' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '现金流入', "Money": data[i].MatureAssets, "Date": data[i].Date, "AttributeColumn": '实际' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '收支净额', "Money": data[i].AssetsTrustGap, "Date": data[i].Date, "AttributeColumn": '实际' });
                        } else if (data[i].ActualorSchedule == 'Schedule') {
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '本金', "Money": data[i].Principal, "Date": data[i].Date, "AttributeColumn": '预期' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '利息', "Money": data[i].Interest, "Date": data[i].Date, "AttributeColumn": '预期' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '罚息', "Money": data[i].DefautFee, "Date": data[i].Date, "AttributeColumn": '预期' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '现金流出', "Money": data[i].FinancingPayment, "Date": data[i].Date, "AttributeColumn": '预期' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '现金流入', "Money": data[i].MatureAssets, "Date": data[i].Date, "AttributeColumn": '预期' });
                            newData.push({ "ProductType": data[i].ProductType, "AttributeRow": '收支净额', "Money": data[i].AssetsTrustGap, "Date": data[i].Date, "AttributeColumn": '预期' });
                        }
                    }
                    CashFlow = newData;
                } else {
                    CashFlow = [];
                }
                $("#CashFlowByDay").dxPivotGrid({
                    allowSortingBySummary: true,
                    allowSorting: true,
                    allowFiltering: true,
                    allowExpandAll: true,
                    MinHeight: 440,
                    showBorders: true,
                    showRowGrandTotals: false,
                    showColumnGrandTotals: false,
                    scrolling: {
                        mode: "virtual"
                    },
                    fieldChooser: {
                        enabled: true
                    },
                    "export": {
                        enabled: true,
                        fileName: "表外流动性_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                    },
                    dataSource: {
                        fields: [
                            {
                                caption: "产品类型",
                                dataField: "ProductType",
                                width: 200,
                                area: "row",
                                expanded: true,
                            },
                            {
                                caption: "名称",
                                width: 200,
                                dataField: "AttributeRow",
                                area: "row"
                            },
                            {
                                caption: "预期或实际",
                                dataField: "AttributeColumn",
                                area: "column",
                                showTotals: false,
                                expanded: true,
                            },
                            {
                                caption: "归集日期",
                                dataField: "Date",
                                area: "column"
                            },
                            {
                                caption: "本金",
                                dataField: "Money",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 2 },
                                area: "data"
                            }
                        ],
                        store: CashFlow
                    }
                })
            })
        },
        getCapitalMIAssetData: function (startDate, endDate) {
            var CapitalMI_Asset = [];
            var executeParam = { SPName: '[ReportView].[usp_GetCapitalMI_Asset]', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    CapitalMI_Asset = data;
                } else {
                    CapitalMI_Asset = [];
                }
                $("#CapitalMI_Asset").dxPivotGrid({
                    allowSortingBySummary: true,
                    allowSorting: true,
                    allowFiltering: true,
                    allowExpandAll: true,
                    MinHeight: 440,
                    showBorders: true,
                    showRowGrandTotals: false,
                    showColumnGrandTotals: false,
                    fieldChooser: {
                        enabled: true
                    },
                    scrolling: {
                        mode: "virtual"
                    },
                    "export": {
                        enabled: true,
                        fileName: "资金部MI_资产_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                    },
                    dataSource: {
                        fields: [
                            {
                                caption: "法人",
                                dataField: "OrganizationName",
                                area: "row"
                            },
                            {
                                caption: "资产类型",
                                dataField: "AssetType",
                                area: "row"
                            },
                            {
                                caption: "产品类型",
                                dataField: "ProductType",
                                area: "row"
                            },
                            {
                                caption: "资金模式",
                                dataField: "FundMode",
                                area: "row"
                            },
                            {
                                caption: "出表期限",
                                dataField: "SaleTerm",
                                area: "row"
                            },
                            {
                                caption: "B/C",
                                dataField: "BorC",
                                area: "row"
                            },
                            {
                                caption: "新做/续接",
                                dataField: "NewOrExtended",
                                area: "row"
                            },
                            {
                                caption: "新出表笔数",
                                dataField: "NewSaleCount",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 0 },
                                area: "data"
                            },
                             {
                                 caption: "新出表金额",
                                 dataField: "NewSaleAmount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "期间回收金额",
                                 dataField: "Collection",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "期末表外资产本金余额",
                                 dataField: "OffBalanceSheetENR",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             }


                        ],
                        store: CapitalMI_Asset
                    }
                })
            })
        },
        getCapitalMITrustData: function (startDate, endDate) {
            var CapitalMI_Trust = [];
            var executeParam = { SPName: '[ReportView].[usp_GetCapitalMI_Trust]', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'StartDate', Value: startDate, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'EndDate', Value: endDate, DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    CapitalMI_Trust = data;
                } else {
                    CapitalMI_Trust = [];
                }
                $("#CapitalMI_Trust").dxPivotGrid({
                    allowSortingBySummary: true,
                    allowSorting: true,
                    allowFiltering: true,
                    allowExpandAll: true,
                    MinHeight: 440,
                    showBorders: true,
                    showRowGrandTotals: false,
                    showColumnGrandTotals: false,
                    fieldChooser: {
                        enabled: true
                    },
                    scrolling: {
                        mode: "virtual"
                    },
                    "export": {
                        enabled: true,
                        fileName: "资金部MI_资管计划_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                    },
                    dataSource: {
                        fields: [
                            {
                                caption: "法人",
                                dataField: "OrganizationName",
                                area: "row"
                            },
                            {
                                caption: "资产类型",
                                dataField: "AssetType",
                                area: "row"
                            },
                            {
                                caption: "产品类型",
                                dataField: "ProductType",
                                area: "row"
                            },
                            {
                                caption: "期限",
                                dataField: "Term",
                                area: "row"
                            },
                            {
                                caption: "B/C",
                                dataField: "BorC",
                                area: "row"
                            },
                            {
                                caption: "新做/续接",
                                dataField: "NewOrExtended",
                                area: "row"
                            },
                            {
                                caption: "新增资管计划数",
                                dataField: "NewTrustCount",
                                dataType: "number",
                                summaryType: "sum",
                                format: { type: 'fixedPoint', precision: 0 },
                                area: "data"
                            },
                             {
                                 caption: "新增资管计划金额",
                                 dataField: "NewTrustAmount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             },
                             {
                                 caption: "期末存量资管计划数",
                                 dataField: "ExistingTrustCount",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 0 },
                                 area: "data"
                             },
                             {
                                 caption: "期末存量资管计划余额",
                                 dataField: "ExistingTrustAmoung",
                                 dataType: "number",
                                 summaryType: "sum",
                                 format: { type: 'fixedPoint', precision: 2 },
                                 area: "data"
                             }


                        ],
                        store: CapitalMI_Trust
                    }
                })
            })
        },
        getABSRepaymentDetailsData: function (reportingData) {
            var ABSRepaymentDetails = [];
            var executeParam = { SPName: '[ReportView].[usp_getABSRepaymentDetailsData]', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'ReportingDate', Value: reportingData, DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=FinancialReporting&executeParams=" + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                if (data.length > 0) {
                    ABSRepaymentDetails = data;
                } else {
                    ABSRepaymentDetails = [];
                }
                $("#ABSRepaymentDetails").dxDataGrid({
                    allowSortingBySummary: true,
                    allowSorting: true,
                    allowFiltering: true,
                    allowExpandAll: true,
                    MinHeight: 440,
                    headerFilter: {
                        visible: true
                    },
                    filterRow: {
                        visible: true,
                        applyFilter: "auto"
                    },
                    allowColumnReordering: true,
                    allowColumnResizing: true,
                    headerFilter: dataGridHeaderFilterConfig,
                    scrolling: {
                        mode: "virtual"
                    },
                    paging: { pageSize: 5 },
                    pager: {
                        showPageSizeSelector: true,
                        allowedPageSizes: [5, 15, 25]
                    },
                    searchPanel: {
                        visible: true,
                        width: 240,
                        placeholder: "Search..."
                    },
                    showBorders: true,
                    fieldChooser: {
                        enabled: true
                    },
                    "export": {
                        enabled: true,
                        fileName: "转付明细_" + new Date().dateFormat("yyyy-MM-dd_hh:mm:ss")
                    },
                    dataSource: ABSRepaymentDetails,
                    columns: [{ caption: '资管计划名称', width: '130', dataField: "ProductName" },
                                { caption: '兑付日期', width: '130', dataField: "PaymentDate" },
                                { caption: '续存天数', width: '130', dataField: "InterestDays" },
                                { caption: '通道费', width: '130', dataField: "TrusteeFee" },
                                { caption: '托管费', width: '130', dataField: "ChannelFee" },
                                { caption: '财顾费', width: '130', dataField: "FinaancialAnalysisfee" },
                                { caption: '变动费用', width: '130', dataField: "VariableFee" },
                                { caption: '固定费用', width: '130', dataField: "FixedFee" },
                                { caption: '利息', width: '130', dataField: "InteresPaid" },
                                { caption: '本金', width: '130', dataField: "LeftOverPrincipal" },
                                { caption: '优先级剩余本金', width: '130', dataField: "FirstTierRemainingPrincipal" },
                                { caption: '夹层级剩余本金', width: '130', dataField: "MidTierRemainingPrincipal" },
                                { caption: '劣后级剩余本金', width: '130', dataField: "LastTierRemainingPrincipal" },
                                { caption: '归集日期', width: '130', dataField: "CollectionDate" },
                                { caption: '预期回收', width: '130', dataField: "EstimatedCollectionAmount" },
                                { caption: '实际归集资金', width: '130', dataField: "ActualCollecitonAmount" },
                                { caption: '实际本金', width: '130', dataField: "ActualPrincipal" },
                                { caption: '实际收益', width: '130', dataField: "ActualInterest" },
                                { caption: '实际罚息', width: '130', dataField: "ActualDefaultFee" },
                                { caption: '实际提前还款手续费', width: '130', dataField: "ActualPrepaymentFee" },
                    ]
                });
            })
        },
        reportHandlers: { 0: "getReport1", 1: "getReport2", 2: "getReport3", 3: "getReport4", 4: "getReport5", 5: "getReport6", 6: "getReport7", 7: "getReport8" },
        getIndexNumerNow: function (index) {
            this[this.reportHandlers[index]]();

        }
    };
    var main = '资产服务报告', childMain;
    var listMain = ["出表融资台账", "资金部MI"];
    var hasCookie = $.cookie("Reporting");
    if (hasCookie != null) {
        $(".tab_container li").removeClass("active_li");
        $(".change_main_box .change_main_each").hide();
        var hasChild = $.cookie('ReportingMain');
        if (hasChild == null) {
            $(".tab_container li").each(function (i, v) {
                if ($(this).text() == hasCookie) {
                    $(".tab_container li:eq(" + i + ")").addClass("active_li");
                    $(".change_main_box .change_main_each:eq(" + i + ")").show();
                    reportingObj.getIndexNumerNow(i)
                }
            })
        } else {
            $(".tab_container li").each(function (i, v) {
                if ($(this).text() == hasCookie) {
                    var index = i;
                    $(".tab_container li:eq(" + i + ")").addClass("active_li");
                    $(".change_main_box .change_main_each:eq(" + i + ")").show();
                    reportingObj.getIndexNumerNow(i);
                    for (var j = 0; j < listMain.length; j++) {
                        if (listMain[j] == hasCookie) {
                            if (j == 0) {
                                $('.change_tit_active2 span').removeClass("span_active");
                                $(".change_box_each2").removeClass("change_box_each_active");
                                if (hasChild == '融资台账B端') {
                                    $(".change_tit_active2 span:eq(0)").addClass("span_active");
                                    $('.change_box_taizhang .change_box_each2:eq(0)').addClass('change_box_each_active');
                                } else {
                                    $(".change_tit_active2 span:eq(1)").addClass("span_active");
                                    $('.change_box_taizhang .change_box_each2:eq(1)').addClass('change_box_each_active');
                                    var TrustInfoC = [];
                                    reportingObj.getTrustInfoCData();
                                }
                            } else {
                                $('.change_tit_active3 span').removeClass("span_active");
                                $(".change_box_each3").removeClass("change_box_each_active");
                                if (hasChild == '资金部MI_资产') {
                                    $(".change_tit_active3 span:eq(0)").addClass("span_active");
                                    $('.change_boxMI .change_box_each3:eq(0)').addClass('change_box_each_active');
                                    reportingObj.getCapitalMIAssetData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
                                } else {
                                    $(".change_tit_active3 span:eq(1)").addClass("span_active");
                                    $('.change_boxMI .change_box_each3:eq(1)').addClass('change_box_each_active');
                                    //请求数据Trust
                                    reportingObj.getCapitalMITrustData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
                                }
                            }
                        }
                    }
                }
            })
        }
    } else {
        $(".change_main_box .change_main_each:first-child").show();
    }
   
    $(".tab_container li").click(function () {
        var index = $(this).index();
        main = $(this).text();
        $.cookie('ReportingMain', null);
        $.cookie('Reporting', main, { expires: 1 });
        $(".tab_container li").removeClass("active_li");
        $(this).addClass("active_li");
        $(".change_main_box .change_main_each").hide();
        $(".change_main_box .change_main_each:eq(" + index + ")").show();
        reportingObj.getIndexNumerNow(index)
    })
    
    $(".change_tit_active2 span").click(function () {
        var index = $(this).index();
        childMain = $(this).text();
        $.cookie('ReportingMain', null);
        $.cookie('ReportingMain', childMain, { expires: 1 });
        $(this).addClass("span_active").siblings("span").removeClass("span_active");
        $(".change_box_each2").removeClass("change_box_each_active");
        $(".change_box_each2:eq(" + index + ")").addClass("change_box_each_active")
        var TrustInfoC = [];
        if (index == 1) {
            reportingObj.getTrustInfoCData();
        }
    })
    $(".change_tit_active3 span").click(function () {
        var index = $(this).index();
        childMain = $(this).text();
        $.cookie('ReportingMain', null);
        $.cookie('ReportingMain', "'" + childMain + "'", { expires: 1 });
        $(this).addClass("span_active").siblings("span").removeClass("span_active");
        $(".change_box_each3").removeClass("change_box_each_active");
        $(".change_box_each3:eq(" + index + ")").addClass("change_box_each_active");
        if (index == 1) {
            reportingObj.getCapitalMITrustData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
        }
    })
    $("#DateBtn").click(function () {
        var index;
        $(".tab_container li").each(function (i, v) {
            if ($(this).hasClass("active_li")) {
               index = i;
            }
        })
        //li返回的是页面上各个表的下标
        if (index == 3) {
            reportingObj.getAssetMonthlyData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val())
        } else if (index == 6) {
            $(".change_tit_active3 span").each(function (i, v) {
                if ($(this).hasClass("span_active")) { 
                    var indexNew = $(this).index();
                    if (indexNew == 1) {
                        reportingObj.getCapitalMITrustData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
                    } else {
                        reportingObj.getCapitalMIAssetData($("#selected-date2 input[type='hidden']").val(), $("#selected-date input[type='hidden']").val());
                    }
                }
            })
           
        }
    })
    $("#DateReport").click(function () {
        var index;
        $(".tab_container li").each(function (i, v) {
            if ($(this).hasClass("active_li")) {
                index = i;
            }
        })
        if (index == 1) {
            reportingObj.getTrustInfoData()
        } else if (index == 2) {
            reportingObj.getProfitAmortizationData($("#reportingDate input[type='hidden']").val())
        } else if (index == 5) {
            reportingObj.getCashFlowByDayData($("#reportingDate input[type='hidden']").val())
        } else if (index == 7) {
            reportingObj.getABSRepaymentDetailsData($("#reportingDate input[type='hidden']").val())
        }
    })
    $("#ListTrustCode").click(function () {
        $(".tab_container li").each(function (i, v) {
            if ($(this).hasClass("active_li")) {
                index = i;
            }
        })
        var TrustCode = $("#list input[type='hidden']").val();
        if (TrustCode == '') {
            alert("请选择专项计划名称!");
            return false;
        }
        var isTrustC;
        for (var i = 0; i < products.length; i++) {
            if (products[i].TrustCode == TrustCode) {
                isTrustC = products[i].IsCTrust;
            }
        }

        if (index == 2) {
            reportingObj.getProfitAmortizationData(TrustCode);
        } else if (index == 4) {
            reportingObj.getFinancingCostData(TrustCode, isTrustC);
        }
       
    })
    $("#reportService").click(function () {
        var TrustCode = $("#list2 input[type='hidden']").val();
        if (TrustCode == '') {
            alert("请选择专项计划名称!");
            return false;
        }
        reportingObj.getAssetServiceReportData($("#selected-date4 input[type='hidden']").val(), $("#selected-date3 input[type='hidden']").val(), TrustCode)
    })
})
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