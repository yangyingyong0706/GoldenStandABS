define(function (require) {
    var $ = require("jquery");
    var common = require("common");
    var GlobalVariable = require('globalVariable');
    var GSDialog = require("gsAdminPages");
    var sVariableBuilder = require('gs/sVariableBuilder');
    var taskIndicator = require('gs/taskProcessIndicator');
    var TaskCode = common.getQueryString("TaskCode");
    var SessionId = common.getQueryString("SessionId");
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

    //获取参数对象
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

    $(function () {

        //选择文件
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


        inputFileClick();

        //上传文件
        $("#btnUpload").click(function () {
            var filePath = $('#ImportFile').val();
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
            var args = 'trustId=' + SessionId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
            if (fileType !== 'xls' && fileType !== 'xlsx' && fileType !== 'xml') {
                GSDialog.HintWindow('文件不是XLS、XLSX或者XML文件');
                return;
            }

            var fileData = document.getElementById('ImportFile').files[0]
            $.ajax({
                url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload?' + args,
                type: 'POST',
                data: fileData,
                cache: false,
                dataType: 'json',
                processData: false, // Don't process the files
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
                    var filePath = data.CommonTrustFileUploadResult;
                    ExcuteTask(filePath);
                },
                error: function (data) {
                    GSDialog.HintWindow('上传文件错误');;
                }
            })
        })


        function ExcuteTask(filePath) {
            var request = getRequest();
            var SessionId = request.SessionId;
            var ActionDisplayName = request.ActionDisplayName;
            var ImportTimes = 1;
            
            //get context
            var TrustId = sessionStorage.getItem("TrustId_" + SessionId);
            var reportingDate = sessionStorage.getItem("ReportingDate_" + SessionId);
          
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1); 
            var dimreportdateid = reportingDate.replace(/-/g, '');
            var TrustCode = sessionStorage.getItem("trustCodes" + SessionId);
            var gs_UserName = sessionStorage.getItem("gs_UserName");
            
            var sessionnamecode = sessionStorage.getItem("sessionnamecode" + SessionId);
            var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\';

            sVariableBuilder.AddVariableItem('ShouldbeFilePath', fileDirectory, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('FileName', fileName, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('DBName', "TrustManagement", 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('SessionId', SessionId, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ProcessActionName', ActionDisplayName, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('DimReportDateId', dimreportdateid, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('TrustCode', TrustCode, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ScenarioId', request.ScenarioId, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ImportUser', gs_UserName, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('sessionnamecode', sessionnamecode, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ImportTimes', ImportTimes, 'String', 0, 0, 0);

            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'task',
                taskCode: TaskCode,
                sContext: sVariable,
                callback: function () {

                    sVariableBuilder.ClearVariableItem();
                    //close current dialog
                    $(frameElement).parent().parent().find("#modal-close").click();
                }
            });
            tIndicator.show();
        }
  

    })
})