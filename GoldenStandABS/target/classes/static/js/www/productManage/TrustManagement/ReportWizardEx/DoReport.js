define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue");
    var common = require('common');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require('gsAdminPages');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');//upload
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var xhr = null; // 保存AJAX请求
    var trustId = common.getQueryString('trustId');
    var reportDate = common.getQueryString('reportDate');
    var SessionId = common.getQueryString('SessionId');
    var IsReportGuide = common.getQueryString('ReportGuide');
    var username = sessionStorage.getItem("gs_UserName");

    

    //获取参数对象
    var request = getRequest();
    var StartPeriodId = sessionStorage.getItem("ComparisonPeriod" + request.SessionId);
    var LivePeriod = sessionStorage.getItem("liveperiod" + request.SessionId);
    if (!trustId) {
        trustId = sessionStorage.getItem("trustIds" + request.SessionId)
    }
    $('#downLoadAP').click(function () {
        GSDialog.open('模板下载', './DownloadTemplate.html', '', function (result) {
            if (result) {
                window.location.reload();
            }
        }, 600, 240, '', true, true, true, false);
    })
    function getRequest() {
        var url = location.search; //获取url中"?"符后的字串   
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    };

    var xhrOnProgress = function (fun) {
        xhrOnProgress.onprogress = fun;
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
    function inputFileClick() {
        $(".input_file_style").find("input").change(function () {
            var value = $(this)[0].value;
            if (value != "") {
                $(this).next()[0].innerHTML = "浏览";
                value = value.substring(value.lastIndexOf('\\') + 1);
                $(this).parent().prev().html(value);
            } else {
                $(this).next()[0].innerHTML = "选择文件";
                $(this).parent().prev().html("");
            }
        })
    }
    $("#btnUpload").click(function () {
        var isFormFieldsAllValid = true;
        $('.layer_each').each(function () {
            if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
        });

        if (!isFormFieldsAllValid) {
            GSDialog.HintWindow("请选择文件")
            return false;
        }


        var filePath = $('#ReportFileUploadEx').val();
        if (filePath == "") {
            GSDialog.HintWindow("请选择文件")
            return false;
        }
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

        xhr = UploadFile('ReportFileUploadEx', fileName, 'PoolImportData', function (sourceFilePath) {

            RunTask(sourceFilePath);
        }, function (percent) {
            $('#btnUpload').prop('disabled', true).text('正在上传（' + percent + '%）');
        });
    })
    function RunTask(sourceFilePath) {
        
        var filePath = sourceFilePath.FileUploadResult;
        var sourceFilePath = filePath;

        var filename = sourceFilePath.slice(sourceFilePath.lastIndexOf("\\") + 1);
        if (SessionId == "" || SessionId) {
            //reportDate = sessionStorage.getItem("ComparisonPeriod" + request.SessionId);
            reportDate = $("#perform").val();
            //reportDate = filePath.substring(filePath.lastIndexOf('\\') + 1).substring(0, 10)
            //sessionStorage.setItem("ReportingDate", reportDate);
        }
        sVariableBuilder.AddVariableItem("TrustId", trustId, 'Int');
        sVariableBuilder.AddVariableItem("SourceFilePath", sourceFilePath, 'NVarChar');
        sVariableBuilder.AddVariableItem("ReportingDate", reportDate, 'NVarChar');

        sVariableBuilder.AddVariableItem("DimReportingDate", reportDate, 'NVarChar');
        sVariableBuilder.AddVariableItem("DimReportingDateId", reportDate.replace(/-/g, ''), 'NVarChar');
        sVariableBuilder.AddVariableItem("ReportTypeId", '1', 'NVarChar'); 
        sVariableBuilder.AddVariableItem("DataSourceId", '0', 'NVarChar');

        sVariableBuilder.AddVariableItem("FileName", filename, 'NVarChar');
        sVariableBuilder.AddVariableItem("DownLoadUrl", sourceFilePath, 'NVarChar');
        sVariableBuilder.AddVariableItem("UserName", username, 'NVarChar');
        sVariableBuilder.AddVariableItem("OperationType", 1, 'NVarChar');

        var sVariable = sVariableBuilder.BuildVariables();
        //tpi.ShowIndicator('ConsumerLoan', TaskCodes[PoolHeader.PoolTypeId], element);
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: 'ImportAssetReport',
            sContext: sVariable,
            callback: function () {

                
                var SessionId = request.SessionId;
                var ActionDisplayName = request.ActionDisplayName;
                if (SessionId && ActionDisplayName) {
                    var executeParams = {
                        SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                            { Name: 'SessionId', value: SessionId, DBType: 'string' },
                            { Name: 'ProcessActionName', value: ActionDisplayName, DBType: 'string' }

                        ]
                    };
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                        console.log(res);
                        location.reload();
                    });

                } else {
                    location.reload();
                }
                //window.location.href = 'basePoolContent.html?PoolId={0}&PoolName={1}'.format(PoolId, sessionStorage.PoolName);
                //parent.location.href = parent.location.href;
                //$('#modal-close', window.parent.document).trigger('click');
                //sVariableBuilder.ClearVariableItem();
            }
        });
        tIndicator.show();
    }
    inputFileClick();
    function RenderSelect() {
        var executeParams = {
            SPName: 'TrustManagement.GetCaldateImportAsset', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'int' },
                { Name: 'StartPeriodId', value: StartPeriodId.replace(/-/g, ''), DBType: 'string' },
                { Name: 'LivePeriod', value: LivePeriod, DBType: 'int' }
            ]
        };
        var html = ""
        var first;
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
            $.each(eventData, function (i, v) {
                if (i == 0) first = v.dateinfo
                html += "<option value='" + v.dateinfo + "'>" + v.dateinfo+"</option>"
            })
            $("#perform").append(html);
            $("#perform").val(first)
        });
    }

    if (SessionId == "" || SessionId) {
        $("#contrldate").css("display", 'flex');
        RenderSelect();

        //reportDate = filePath.substring(filePath.lastIndexOf('\\') + 1).substring(0, 10)
        //sessionStorage.setItem("ReportingDate", reportDate);
    }
    /////
    //字节流下载,对IE浏览器不工作的部分进行了调整
    function downLoadExcelForSyn(filePath,t) {
        var oReq = new XMLHttpRequest();
        //var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx";
        var uriHostInfo = location.protocol + "//" + location.host;
        var url = encodeURI(uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/" + "getStream?" + 'filePath=' + filePath);
        oReq.open("POST", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var content = oReq.response;

            var elink = document.createElement('a');
            elink.download = reportDate + "_资产服务报告.xlsx";
            //elink.style.display = 'none';

            var blob = new Blob([content]);
            elink.onload = function (e) {
                window.URL.revokeObjectURL(e.href); // 清除释放

            };
            elink.href = URL.createObjectURL(blob);
            t.target.appendChild(elink);


            t.target.children[0].click();
            t.target.removeChild(elink);
        };
        oReq.send();
    }




    function RenderGrid() {
        var filter = " and ReportDate='" + reportDate + "'" + " and OperationType=" + 1;

        this.DownLoadHistory = function (Id) {
            var t = event;
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


        this.Download = function (DownLoadUrl,Id) {
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