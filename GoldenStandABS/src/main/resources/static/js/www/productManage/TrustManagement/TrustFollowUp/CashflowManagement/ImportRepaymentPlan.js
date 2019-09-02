define(function (require) {
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var GSDialog = require("gsAdminPages");
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    if (common.getUrlParam('tid')) {
        var trustId = common.getUrlParam('tid')
    } else {
        var trustId = common.getUrlParam('trustId')
    }
    var enter = common.getUrlParam('enter');
    var PoolDBName = common.getUrlParam('PoolDBName');
    
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
    $("#UpCashflowDetails").click(function () {
        var filePath = $('#ImportCashFlowOAAccounts').val();
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        var args = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
        if (fileType !== 'xls' && fileType !== 'xlsx' && fileType !== 'csv') {
            GSDialog.HintWindow('文件不是XLS、XLSX、CSV文件');
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
                UpCashflowDetailsTaskProcess(path)

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
            sVariableBuilder.AddVariableItem('ConnectionString','Data Source=MSSQL;Initial Catalog='+ PoolDBName  +';Integrated Security=SSPI;', 'String', 0, 0, 0);
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
                $("#modal-close", window.parent.document).trigger("click");
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
})