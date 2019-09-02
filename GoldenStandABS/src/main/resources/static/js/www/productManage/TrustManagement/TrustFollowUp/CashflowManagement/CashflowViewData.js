define(function (require) {
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var webProxy = require("webProxy");
    var trustId = common.getUrlParam('tid');
    var adminDiaLog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GSDialog = require("gsAdminPages");
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    require("kendomessagescn");
    $(function () {
        $("#loading").hide();
        var filter = " and TrustId="+ trustId +" and DimReportingDateId=19000101 and PoolId=-1 and rScheduleDateId=CONVERT(INT,REPLACE(CONVERT(VARCHAR,GETDATE(),23),'-',''))"
        //导出数据";
        
        $(".exportData").click(function () {
            var date = new Date();
            var FileName = '现金流归集数据_' + date.getHours() + date.getMinutes() + date.getSeconds() + date.getFullYear() + (date.getMonth()+1)+ date.getDate();
            sVariableBuilder.AddVariableItem('FileName', FileName+'.xlsx', 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'RepaymentCashflowDownloadExcel',
                sContext: sVariable,
                callback: function () {
                    sVariableBuilder.ClearVariableItem();
                    downFile(FileName)
                }
            });
            tIndicator.show();
        });
        function downFile(FileName) {
            window.FileName = FileName;
            $.ajax({
                url: webProxy.baseUrl + "/PoolCut/Files/Reports/RepaymentCashflowDown" + "/" + FileName+".xlsx",
                async: false,
                type: 'HEAD',
                error: function () {
                    GSDialog.HintWindow('生成下载文件失败');
                },
                success: function () {
                    var filepath = webProxy.baseUrl + "/PoolCut/Files/Reports/RepaymentCashflowDown" + "/" + window.FileName + ".xlsx";
                    var a = document.createElement('a'); // 创建a标签
                    a.setAttribute('download', window.FileName);// download属性
                    a.setAttribute('href', filepath);// href链接
                    a.click();
                }
            });
        }
        function RenderGrid() {
            var h = $("body").height() - 110;
            var Grid = new kendoGridModel(h);
            var self = this;


            var Options = {
                renderOptions: {
                    scrollable: true,
                    resizable: true
                    , columns: [
                                   { field: "StartDate", title: '开始时间', width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                                 , { field: "EndDate", title: '结束时间', width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                                 , { field: "PrincipalAmount", title: '本金（元）', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                                , { field: "InterestAmount", title: '利息（元）', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                                , { field: "sumPriInter", title: '总和（元）', width: "300px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                                , { field: "ScheduleDateId", title: '导入日期', width: "300px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                    ]
                }
              , dataSourceOptions: {
                  pageSize: 20
                  , otherOptions: {
                      orderby: "StartDate asc"
                      , direction: ""
                      , defaultfilter: filter
                      , DBName: 'TrustManagement'
                      , appDomain: 'TrustManagement'
                      , executeParamType: 'extend'
                      , executeParam: function () {
                          var result = {
                              SPName: 'usp_viewQuickStressTestImportView', SQLParams: [
                                  { Name: 'tableOrView', value: 'dbo.View_RepaymentImutationInfo', DBType: 'string' },
                              ]
                          };

                          return result;
                      }
                  }
              }
            };


            Grid.Init(Options, 'grid');
            Grid.RunderGrid();

        }
        RenderGrid()
    })
})