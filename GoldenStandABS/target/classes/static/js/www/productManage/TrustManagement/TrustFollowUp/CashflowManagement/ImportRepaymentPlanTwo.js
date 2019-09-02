define(function (require) {
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var GSDialog = require("gsAdminPages");
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var webStorage = require('gs/webStorage');
    if (common.getUrlParam('tid')) {
        var trustId = common.getUrlParam('tid')
    } else {
        var trustId = common.getUrlParam('trustId')
    }
    var IsReportGuide = common.getUrlParam('ReportGuide');
    var enter = common.getUrlParam('enter');
    var PoolDBName = common.getUrlParam('PoolDBName');
    var ReportDate = common.getUrlParam('ReportDate');

    var xhrOnProgress = function (fun) {
        xhrOnProgress.onprogress = fun;;
        return function () {
            var xhr = $.ajaxSettings.xhr();
            if (typeof xhrOnProgress.onprogress !== 'function')
                return xhr
            if (xhrOnProgress.onprogress && xhr.upload) {
                xhr.upload.onprogress = xhrOnProgress.onprogress;
            }
            return xhr
        }
    }
    $('#downLoadCFOAPS').click(function () {
        GSDialog.open('模板下载', './PlanTwoDownloadTemplate.html', '', function (result) {
            if (result) {
                window.location.reload();
            }
        }, 600, 280, '', true, true, true, false);
    })
    $("#UpCashflowDetails").click(function () {
        var filePath = $('#ImportCashFlowOAAccounts').val();
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
        var args = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
        if (fileType !== 'xls' && fileType !== 'xlsx' && fileType !== 'csv') {
            GSDialog.HintWindow('文件不是XLS、CSV、XLSX文件');
            return;
        }
        var fileData = document.getElementById('ImportCashFlowOAAccounts').files[0]
        $.ajax({
            url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload?' + args,
            type: 'POST',
            data: fileData,
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
            xhr: xhrOnProgress(function (e) {
                var percent = Math.floor(e.loaded / e.total * 100);
                if (percent > 0) {
                    $(".progress").eq(0).css("display", "block");
                    $(".progress").eq(0).find(".progress-bar").css("width", percent + "%");
                    $(".progress").eq(0).find(".progress-bar>span").html("" + percent + "%");
                }
                if (percent == 100) {
                    $(".progress").eq(0).css("display", "none");
                }
            }),
            success: function (data) {
                var path = data.CommonTrustFileUploadResult;
                if (IsReportGuide == 1) {
                    var executeParams = {
                        SPName: 'TrustManagement.usp_GenerateUploadLog', SQLParams: [
                            { Name: 'TrustId', value: trustId, DBType: 'string' },
                            { Name: 'ReportDate', value: ReportDate, DBType: 'string' },
                            { Name: 'FileName', value: path.slice(path.lastIndexOf("\\") + 1), DBType: 'string' },
                            { Name: 'DownLoadUrl', value: path, DBType: 'string' },
                            { Name: 'UserName', value: webStorage.getItem('gs_UserName'), DBType: 'string' },
                            { Name: 'OperationType', value: 3, DBType: 'string' }

                        ]
                    };
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                        UpCashflowDetailsTaskProcess(path)

                    });
                } else {
                    UpCashflowDetailsTaskProcess(path)
                }



                

            },
            error: function (data) {
                GSDialog.HintWindow('上传文件错误');;
            }
        })
    })
    //调用导入现金流详细信息task
    function UpCashflowDetailsTaskProcess(filePath) {
        var appDomain = 'ConsumerLoan';
        var taskCode = 'ImportCashFlowOAAccountsDue';
        if (enter) {
            appDomain = 'Task';
            taskCode = 'ImportCashFlowOAAccountsDue_Pool';
            sVariableBuilder.AddVariableItem('ConnectionString', 'Data Source=MSSQL;Initial Catalog=' + PoolDBName + ';Integrated Security=SSPI;', 'String', 0, 0, 0);
        }
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\' + fileName;
        sVariableBuilder.AddVariableItem('FilePath', fileDirectory, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('TrustId', trustId, 'String', 0, 0, 0);
        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: appDomain,
            taskCode: taskCode,
            sContext: sVariable,
            callback: function () {
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
                        //GSDialog.HintWindow('运行成功');
                        location.reload();
                    });

                } else {
                    $("#modal-close", window.parent.document).trigger("click");
                    location.reload();
                }
                
            }
        });
        tIndicator.show();

    }
    //选择文件函数
    function inputFileClick() {
        $(".input_file_style").find("input").change(function () {
            var value = $(this)[0].value;
            if (value != "") {
                $(this).next()[0].innerHTML = "浏览";
                value = value.substring(value.lastIndexOf('\\') + 1);
                $(this).parent().prev().html(value);
                $(this).parent().next().show();
            } else {
                $(this).next()[0].innerHTML = "选择文件";
                $(this).parent().prev().html("");
                $(this).parent().next().hide();
            }
        })
    }
    inputFileClick();

    //////OperationType1资产服务报告 2底部资产 3环境计划 4回款数据
    function RenderGrid() {
        var filter = " and OperationType=" + 3;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        this.DownLoadHistory = function (Id) {

            var executeParams = {
                SPName: 'TrustManagement.usp_GetUploadLogDownLoad', SQLParams: [
                    { Name: 'Id', value: Id, DBType: 'int' }
                ]
            };

            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                location.href = location.protocol + "//" + location.host + res[0].DownLoadUrl.split('\\TSSWCFServices')[1];

                //downLoadExcelForSyn(res[0].DownLoadUrl.split('\\TSSWCFServices')[1], t);

            });
        }

        this.DelHistory = function (Id) {
            var executeParams = {
                SPName: 'TrustManagement.usp_DelUploadLog', SQLParams: [
                    { Name: 'Id', value: Id, DBType: 'int' }
                ]
            };
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                GSDialog.HintWindow('删除成功！', function () {
                    location.reload();
                });

            });
        }


        this.Download = function (DownLoadUrl, Id) {
            return '<a chref="javascript:void(0);" onclick="self.DownLoadHistory(' + Id + ')">' + '下载' + '</a>' + '<a href="javascript:void(0);" onclick="self.DelHistory(' + Id + ')" style="margin-left:3%;">' + '删除' + '</a>'
        }

        $("#grid").html("")
        var h = $("body").height() - 70 < 0 ? 400 : $("body").height() - 400;
        var Grid = new kendoGridModel(h);
        var self = this;


        var Options = {
            renderOptions: {
                scrollable: true,
                resizable: true
                , columns: [
                               { field: "ReportDate", title: '当前报告日期', width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                             , { field: "FileName", title: '文件名', width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                             , { field: "CreateDate", title: '上传时间', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                             , { field: "DownLoadUrl", template: '#=DownLoadUrl?this.Download(DownLoadUrl,Id):""#', title: '操作', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                ]
            }
          , dataSourceOptions: {
              pageSize: 20
              , otherOptions: {
                  orderby: "Id desc"
                  , direction: ""
                  , defaultfilter: filter
                  , DBName: 'TrustManagement'
                  , appDomain: 'TrustManagement'
                  , executeParamType: 'extend'
                  , executeParam: function () {
                      var result = {
                          SPName: 'usp_GetUploadLog', SQLParams: [
                              { Name: 'TrustId', value: trustId, DBType: 'string' }

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

    ////
    $(function () {
        if (IsReportGuide == 1) {
            $("#rechis").show();
            RenderGrid();
        } else {
            $("#rechis").hide();
        }



    })


})