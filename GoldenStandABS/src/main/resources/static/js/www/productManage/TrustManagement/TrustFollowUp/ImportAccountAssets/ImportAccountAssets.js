define(function (require) {
    //<script src="../../../../asset/lib/knockout/knockout.binding.rendercontrol.js"></script>
    //<script src="../../../../asset/lib/jquery/jquery-ui-latest.js"></script>
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    require('date_input');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    require('knockout.rendercontrol');
    var common = require('common');
    require('jquery-ui');
    require('date_input');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var GSDialog = require("gsAdminPages")
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
    $(function () {
        var planAsset = false;
        var accountAsset = false;
        var importAsset;
        var assetType = '';
        var trustId = common.getQueryString('trustId');
        var trustCode = common.getQueryString('TrustCode');;
        var trustPoolCloseDate = '';
        var FileVaraible = {
            count: 0,
            filePath: ""
        }
        specialType = "RMBS";
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
        $('#AccountAssetReportingDate').date_input();
        var svcUrlConsumerLoan = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&";
        var executeParam = {
            SPName: 'usp_getAssetTypeByTrustId', SQLParams: [
                { Name: 'trustId', value: trustId, DBType: 'int' }
            ]
        };
        var data = common.ExecuteGetData(false, svcUrlConsumerLoan, "TrustManagement", executeParam);
        $.each(data, function (i, item) {
            if (item["AssetType"] != undefined && item["AssetType"] != null && item["AssetType"] != '')
                assetType = item["AssetType"];
        })
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
        importAsset = true;
        function callImportAssetDataTaskProcess(filePath, filePathEx) {
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var fileNameEx = filePathEx.substring(filePath.lastIndexOf('\\') + 1);
            var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\';
            var rDate = $('#BasicAssetReportingDate').val();
            var rDateId = rDate.replace(/-/g, '');
            var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
            var executeParam = { SPName: 'usp_GetTrustTaskConfig', SQLParams: [] };
            var fileNumber = ($("#uploadSelect").next().find("input:checked").val() == "1") ? 1 : 2;
            if (fileNumber == 1)
                assetType = "RMBS";
            else
                assetType = "AUTO";                                                //修改上传方式的选择，从资产类型决定上传方式改为上传数量决定上传方式。
            executeParam.SQLParams.push({ Name: 'AssetType', value: assetType, DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var sourceData = {};
            $.ajax({
                cache: false,
                type: "GET",
                async: false,
                url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=commom',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                    if (sourceData && sourceData.length > 0) {
                        wcfProxyInvokeTask(fileName, fileNameEx, fileDirectory, rDate, rDateId, sourceData[0].TaskCode);
                    } else {
                        GSDialog.HintWindow('Get Import TaskCode Error!\n Can not find TaskCode for Current Trust.');
                    }
                },
                error: function (response) { GSDialog.HintWindow('Error occursed while requiring the TaskCode!1'); }
            });
        }
        function callImportAccountPaymentDataTaskProcess(filePath) {
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\';
        var reportingDate = $('#AccountAssetReportingDate').val();
        sVariableBuilder.AddVariableItem('ExcelPath', fileDirectory, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DimReportingDateId', reportingDate, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ExcelFileName', fileName, 'String', 0, 0, 0);

        var sVariable = sVariableBuilder.BuildVariables();
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: 'AssetAccountImport',
            sContext: sVariable,
            callback: function () {
                $('#modal-close', window.parent.document).trigger('click');
                sVariableBuilder.ClearVariableItem();
            }
        });
        tIndicator.show();
    }
        function uploadAssetFile(args, fileData) {
            var fileNumber = ($("#uploadSelect>input:checked").val() == "1") ? 1 : 2;
            //var fileData = document.getElementById('BasicAssetSourceFileUpload').files[0];
            $.ajax({
                url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload' + '?' + args,
                type: 'POST',
                data: fileData,
                cache: false,
                dataType: 'json',
                processData: false, // Don't process the files
                //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
                xhr: xhrOnProgress(function (e) {
                    var percent = Math.floor(e.loaded / e.total * 100);
                    if (percent > 0) {
                        $("#test_progress").css("display", "block");
                        $("#test_progress").find(".progress-bar").css("width", percent + "%");
                        $("#test_progress").find(".progress-bar>span").html("" + percent + "%");
                    }
                    if (percent == 100) {
                        $("#test_progress").css("display", "none");
                    }
                }),
                success: function (data) {
                    if (planAsset) {
                        callImportPlanPaymentDataTaskProcess(data.CommonTrustFileUploadResult);
                    }
                    else if (accountAsset) {
                        //console.log("data.CommonTrustFileUploadResult:" + data.CommonTrustFileUploadResult);
                        callImportAccountPaymentDataTaskProcess(data.CommonTrustFileUploadResult);
                    }
                    else {
                        if (importAsset) {
                            if (fileNumber == 1) {
                                callImportAssetDataTaskProcess(FileVaraible.filePath, data.CommonTrustFileUploadResult);
                            }

                            if (args.indexOf('fileType=2') != -1) {
                                FileVaraible.filePath = data.CommonTrustFileUploadResult;
                            }
                            else {
                                FileVaraible.filePathEx = data.CommonTrustFileUploadResult;
                            }

                            if (FileVaraible.count > 0) {
                                //当两个文件都上传成功时开始TASK
                                FileVaraible.count = 0;
                                callImportAssetDataTaskProcess(FileVaraible.filePath, FileVaraible.filePathEx);
                            }

                            FileVaraible.count++;
                        }
                        else {
                            callImportActualPaymentDataTaskProcess(data.CommonTrustFileUploadResult);
                        }
                    }
                },
                error: function (data) {
                    $('#spanUploadProgressMsg').html('文件上传出现错误。');
                }
            });
        }
        importAsset = true;
        $('#btnUploadAccountAssetSourceFile').click(function () {
            var rDate = $('#AccountAssetReportingDate').val();
            if (!rDate) { GSDialog.HintWindow('请输入日期'); return; }
            var filePath = $('#AccountAssetSourceFileUpload').val();
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
            if (fileType !== 'xls' && fileType !== 'xlsx' && assetType != specialType) {
                GSDialog.HintWindow('文件不是XLS或XLSX文件');
                return;
            }
            accountAsset = true;
            var args = 'trustId=' + trustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
            var fileData = document.getElementById('AccountAssetSourceFileUpload').files[0];
            uploadAssetFile(args, fileData);
        })
        function wcfProxyInvokeTask(fileName, fileNameEx, fileDirectory, rDate, rDateId, taskCode) {
            sVariableBuilder.AddVariableItem('ExcelFileName', fileNameEx, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ExcelPath', fileDirectory, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('TrustCode', trustCode, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('BusinessDate', rDate, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('DimReportingDateId', rDateId, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('PoolCloseDate', trustPoolCloseDate, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ExcelFileNameEx', fileName, 'String', 0, 0, 0);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: taskCode,
                sContext: sVariable,
                callback: function () {
                    //window.location.href = window.location.href;
                    $('#modal-close', window.parent.document).trigger('click');
                    sVariableBuilder.ClearVariableItem();
                }
            });
            tIndicator.show();
        }
    })

});