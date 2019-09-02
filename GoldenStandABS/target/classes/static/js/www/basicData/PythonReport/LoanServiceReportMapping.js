var objs = [];
var dates = [];
var TrustCode;
define(function (require) {
    var $ = require('jquery');
    var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/basicData/TrustManagementService/TrustManagement/common/Scripts/kendoGridModel');
    var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    var roleOperate = require('gs/uiFrame/js/roleOperate');
    var GSDialog = require("gsAdminPages")
    //require('app/productManage/interface/trustList_interface');
    var self = this;
    var userName = roleOperate.cookieName();
    var isAdmin = false;
    var filter = '';
    var height = $(window).height() - 100;
    var common = require('common');
    var tid = common.getQueryString('tid');
    TrustCode = common.getQueryString('TrustCode');
    var GlobalVariable = require('gs/globalVariable');
    var NewRull = common.getQueryString("NewRull");
    if (NewRull == "1") {
        $("#getReportDate").hide();
        $("#btnImportExcel").hide();
    }
    setProjectName();
    self.downLoad = function (url) {
        var html;
        html = '<a style= "cursor:pointer;" href ="{0}">下载</a>'.format(url);;
        return html;
    }
    self.BtnAdd = function(SessionId,Code) {
        var html;
        html = '<a style="cursor:pointer" onclick="ReRunTask(' + '\'' + SessionId + '\');">重新生成</a>';
        //if (Code == "Completed") {
        //    html += '&nbsp; <a style="cursor:pointer" onclick="UpLoadExcel(' + '\'' + SessionId + '\');">上传转置报告</a>';
        //}
        return html;
    }
    self.datetime = function (StartTime) {
        var html = '<label>' + getStringDate(StartTime).dateFormat('yyyy-MM-dd hh:mm:ss'); +'</label>';
        return html;
    }
    roleOperate.getRolesByUserName(userName, function (data) {  //检查用户是否是管理员
        $.each(data, function (i, item) {
            if (item.IsRoot) {
                isAdmin = true;
            }
        })

        var kendouiGrid = new kendoGridModel(height);
        kendouiGrid.Init({
            renderOptions: {
                columns: [
                         { field: "FunctionName", title: '解析模板', width: "100", headerAttributes: { "class": "table-header-cell", style: "text-align: center;" }, attributes: { "class": "table-cell", style: "text-align: center;" } }
                        , { field: "ReportingDate", title: '报告日期', width: "70", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "", title: '原始贷款服务报告', template: '#=SourceFileUrl?self.downLoad(SourceFileUrl):""#', width: "70", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "", title: '转置报告', template: '#=ExcelUrl?self.downLoad(ExcelUrl):""#', width: "60", headerAttributes: { "class": "table-header-cell", style: "text-align: center;" }, attributes: { "class": "table-cell", style: "text-align: center;" } }
                        , { field: "CodeDictionaryCode", title: '状态', width: "50", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "", title: '时间', template: '#=self.datetime(StartTime)#', width: "100", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                        , { field: "", title: '操作', template: '#=self.BtnAdd(SessionId,CodeDictionaryCode)#', width: "20%", headerAttributes: { "class": "table-header-cell", style: "text-align: center" }, attributes: { "class": "table-cell", style: "text-align: center" } }
                ]
            }
            , dataSourceOptions: {

                otherOptions: {
                    orderby: "StartTime"
                    , direction: "desc"
                    , DBName: 'TrustManagement'
                    , appDomain: 'TrustManagement'
                    , executeParamType: 'extend'
                    , defaultfilter: filter
                    , executeParam: function () {
                        var result = {
                            SPName: 'usp_GetLoanServiceReportHistoryGrid'
                            , SQLParams: [
                                { Name: 'TrustId', value: tid, DBType: 'int' }
                            ]
                        };
                        return result;
                    }
                }
            }
        });
        kendouiGrid.RunderGrid();
    });

    $(function () {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
           executeParam = {
               SPName: "TrustManagement.usp_GetLoanServiceReportHistory",
               SQLParams: [
                   { Name: 'TrustId', value: tid, DBType: 'int' }
               ]
           };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            objs = data;
        })
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
          executeParam = {
              SPName: "TrustManagement.usp_GetTrusteeReportDate",
              SQLParams: [
                  { Name: 'TrustId', value: tid, DBType: 'int' }
              ]
          };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            dates = data;
        })

        $("#getReportDate").click(function () {
                GSDialog.HintWindowTF('确认获取报告日？', function () {
                    $("#loading").show();
                    var executeParam = {
                        SPName: 'dbo.usp_InsertTrusteeReportPeriod', SQLParams: [
                             { 'Name': 'TrustId', 'Value': tid, 'DBType': 'int' }
                        ]
                    };
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
                    CallWCFSvc(serviceUrl, true, 'GET', function (datas) {
                        $("#loading").fadeOut();
                        GSDialog.HintWindowtop("获取成功！")
                        location.reload();
                    });
                }, "", false)
        });

        $("#btnImport").anyDialog({
            width: 600,	// 弹出框内容宽度
            height: 340, // 弹出框内容高度
            title: '解析原始服务贷款报告',	// 弹出框标题
            url: './Dashboard/UploadImportData.html?tid=' + tid,
            changeallow: true,
            scrolling: false,
            draggable: true
        });

        $("#btnImportExcel").anyDialog({
            width: 600,	// 弹出框内容宽度
            height: 340, // 弹出框内容高度
            title: '上传转置报告',	// 弹出框标题
            url: './Dashboard/UploadImportExcelData.html?tid=' + tid,
            changeallow: true,
            scrolling: false,
            draggable: true
        });
        
        $("#deleteBtn").click(function () {
            trustAction(function (data) {
                GSDialog.HintWindowTF('确认删除该条解析报告记录？', function () {
                    $("#loading").show();
                    var executeParam = {
                        SPName: 'Task.usp_deletePythonList', SQLParams: [
                             { 'Name': 'SessionId', 'Value': data.SessionId, 'DBType': 'string' }
                        ]
                    };
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParams;
                    CallWCFSvc(serviceUrl, true, 'GET', function (datas) {
                        $("#loading").fadeOut();
                        GSDialog.HintWindowtop("删除成功！")
                        location.reload();
                    });
                }, "", false)
            })
        });
    });
    
    self.getStringDate = function (strDate) {
        //var str = '/Date(1408464000000)/';
        if (!strDate) {
            return '';
        }
        var str = strDate.replace(new RegExp('\/', 'gm'), '');
        return eval('new ' + str);
    }

});

function trustAction(callback) {
    var $ = require('jquery');
    var grid = $("#grid").data("kendoExtGrid");
    if (grid.select().length != 1) {
        GSDialog.HintWindow('请选择项目！');
    } else {
        var dataRows = grid.items();
        // 获取行号
        var rowIndex = dataRows.index(grid.select());
        // 获取行对象
        var data = grid.dataItem(grid.select());
        callback(data);
    }
}
function setProjectName() { //设置当前专项计划名称
    var label = '';
    label = "<label>" + TrustCode + "</label>";
    $('#TrustCode').append(label).css("border", "0px solid #ccc")
}

function ReRunTask(sessionid) {
    var _this = this;
    if (objs.length > 0) {
        $.each(objs, function (i, n) {
            if (objs[i].SessionId.toLowerCase() == sessionid) {
                _this.runTask(objs[i].TrustId, objs[i].ReportingDate, objs[i].SourceFilePath, objs[i].PythonScriptId);
                return;
            }
        });
    }
}

function UpLoadExcel(sessionid) {
    var _this = this;
    if (objs.length > 0) {
        $.each(objs, function (i, n) {
            if (objs[i].SessionId.toLowerCase() == sessionid) {
                _this.runExcelTask(objs[i].TrustId, objs[i].ReportingDate, objs[i].ExcelUrl);
                return;
            }
        });
    }
}
function runTask(tid, ReportingDate, docfilePath, PythonScriptId) {
    require(['goldenstand/taskProcessIndicator', 'goldenstand/sVariableBuilder', 'goldenstand/webProxy', 'common'],
        function (taskIndicator, sVariableBuilder, webProxy, common) {
            sVariableBuilder.ClearVariableItem();
            sVariableBuilder.AddVariableItem('TrustId', tid, 'Int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ReportingDate', ReportingDate, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('SourceFilePath', docfilePath, 'String', 1, 0, 0);
            sVariableBuilder.AddVariableItem('PythonScriptId', PythonScriptId, 'Int', 1, 0, 0);

            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 600,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'BuildTrustLoanServiceReportByPython',
                sContext: sVariable,
                callback: function () {
                    window.location.reload(true);
                }
            });
            tIndicator.show();

        });
}
function runExcelTask(tid, ReportingDate, docfilePath) {
    require(['goldenstand/taskProcessIndicator', 'goldenstand/sVariableBuilder', 'goldenstand/webProxy', 'common'],
        function (taskIndicator, sVariableBuilder, webProxy, common) {
            var date;
            $.each(dates, function (i, n) {
                if (common.getStringDate(dates[i].TrusteeReportingDate).dateFormat('yyyy-MM-dd') == ReportingDate) {
                    date = common.getStringDate(dates[i].PaymentDateEnd).dateFormat('yyyy-MM-dd');
                }
            });
            sVariableBuilder.ClearVariableItem();
            var ExcelPath = 'E:\\TSSWCFServices\\' + docfilePath.replace(/\//g, "\\");
            sVariableBuilder.AddVariableItem('TrustId', tid, 'Int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ReportingDate', date, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('SourceFilePath', ExcelPath, 'String', 1, 0, 0);

            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 600,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'ImportTrustLoanServiceReport',
                sContext: sVariable,
                callback: function () {
                    window.location.reload(true);
                }
            });
            tIndicator.show();

        });
}