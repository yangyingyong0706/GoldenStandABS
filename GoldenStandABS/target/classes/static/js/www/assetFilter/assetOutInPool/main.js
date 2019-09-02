define(function (require) {
    var $ = require('jquery');
    //require('jquery-ui');
    //var GlobalVariable = require('gs/globalVariable');
    var common = require('gs/uiFrame/js/common');
    //var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    require('app/components/assetPoolList/js/PoolCut_Interface');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var webProxy = require('gs/webProxy');
    var parentPoolId
    var GSDialog = require("gsAdminPages")
    function inputFileClick() {
        $(".input_file_style").find("input").change(function () {
            var value = $(this)[0].value;
            if (value != "") {
                var tempfileinfo = value.split('\\')[value.split('\\').length - 1];
                $(this).next()[0].innerHTML = "浏览";
                $(this).parent().parent().children('.file_name').html(tempfileinfo).css("");
            } else {
                $(this).next()[0].innerHTML = '选择文件';
                $(this).parent().parent().children('.file_name').html('');
            }
        })
    }
    inputFileClick();

    $(function () {
        var TaskCode = common.getQueryString('TaskCode');
        var PoolId = common.getQueryString('PoolId');
        parentPoolId = common.getQueryString('ParentPoolId');
        if (!TaskCode || !PoolId || isNaN(PoolId)) { return; }

        $('#btnSubmit').click(function () { SubmitPage(TaskCode, PoolId); });
        $('#cancel').click(function () { Cancel(); });
        $('#uploadData').click(function () {
            $('#uploadData').addClass("activeBorderBottom").siblings().removeClass('activeBorderBottom');
            $('#AssetPoolCreationForm').show();
            $('.downloadTemplateContent').hide();
        })
        $('#downloadTemplate').click(function () {
            $('#downloadTemplate').addClass("activeBorderBottom").siblings().removeClass('activeBorderBottom');
            $('#AssetPoolCreationForm').hide();
            $('.downloadTemplateContent').show();
        })
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/Assetino/资产出入池模板.xlsx', '下载', '资产出入池模板.xlsx', 'downLoadAI');
    });
    function downLoadExcelForSyn(filePath, innerText, desName, id) {
        var oReq = new XMLHttpRequest();
        //var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx";
        var uriHostInfo = webProxy.baseUrl;
        var url = encodeURI(uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/" + "getStream?" + 'filePath=' + filePath);
        oReq.open("POST", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var content = oReq.response;

            var elink = document.createElement('a');
            elink.innerHTML = innerText;
            elink.download = desName;
            //elink.style.display = 'none';

            var blob = new Blob([content]);
            elink.onload = function (e) {
                window.URL.revokeObjectURL(e.href); // 清除释放

            };
            if (window.navigator && window.navigator.msSaveOrOpenBlob) { //判断是否为IE浏览器
                document.getElementById(id).appendChild(elink);

                $('body').on('click', '#' + id, function () {
                    downLoanExcelInIE(blob, desName);

                })
            }
            else {
                elink.href = URL.createObjectURL(blob);
                document.getElementById(id).appendChild(elink);
            }
            //elink.click();
            //document.body.removeChild(elink);
        };
        oReq.send();
    }
    function downLoanExcelInIE(blob, desName) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, desName);

        }
    }
    function SubmitPage(taskCode, poolId) {
        var poolHeader;
        var dimAssetTypeId;
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
        var params = [
            ['PoolId', poolId, 'int']
    ];

        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderById');
        promise().then(function (response) {
            if (typeof response === 'string') { poolHeader = JSON.parse(response); }
            else { poolHeader = response; }
        });

        svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=dbo&executeParams=";
        promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderExtById');


        promise().then(function (response) {
            if (typeof response === 'string') { dimAssetTypeId = JSON.parse(response)[0].DimAssetTypeId; }
            else { dimAssetTypeId = response[0].DimAssetTypeId; }
        });


        var filePath = $('#fileUploadFile').val();
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        var sourceFilePath;


        UploadFile('fileUploadFile', fileName, 'PoolImportData', function (data) {
            sourceFilePath = data;
            sVariableBuilder.AddVariableItem('ParentPoolId', poolId, 'Int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('IsParent', 0, 'Int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ActionPoolType', 'PoolIncludeExclude', 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('DimOrganisationId', poolHeader[0].DimOrganisationID, 'Int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('DimAssetTypeID', dimAssetTypeId, 'Int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('DimReportingDateId', poolHeader[0].DimReportingDateID, 'Int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('SourceFilePath', sourceFilePath, 'String', 0, 0, 0);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'ConsumerLoan',
                taskCode: taskCode,
                sContext: sVariable,
                callback: function () {

                    sVariableBuilder.ClearVariableItem();
                    parent.location.href = parent.location.href;
                    $('#modal-close', window.parent.document).trigger('click');
                }
            });
            tIndicator.show();


        });


        
    }
    function Cancel() {

        $('#modal-close', parent.document).trigger('click');
    }
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
    var UploadFile = function (fileCtrlId, fileName, folder, fnCallback) {
        var fileData = document.getElementById(fileCtrlId).files[0];
        var svcUrl = webProxy.poolCutServiceURL + 'FileUpload?fileName={0}&fileFolder={1}'.format(encodeURIComponent(fileName), encodeURIComponent(folder));

        $.ajax({
            url: svcUrl,
            type: 'POST',
            data: fileData,
            cache: false,
            dataType: 'json',
            processData: false,
            xhr: xhrOnProgress(function (e) {
                var percent = Math.floor(e.loaded / e.total * 100);
                if (percent > 0) {
                    $("#test_progress").css("display", "block");
                    $("#test_progress>.progress-bar").css("width", percent + "%");
                    $("#test_progress>.progress-bar>span").html("" + percent + "%");
                }
                if (percent == 100) {
                    $("#test_progress").css("display", "none");
                }
            }),
            success: function (response) {
                var sourceData;
                if (typeof response == 'string')
                    sourceData = JSON.parse(response);
                else
                    sourceData = response;
                if (fnCallback) fnCallback(sourceData.FileUploadResult);

            },
            error: function (data) {
                GSDialog.HintWindow('文件上传失败!');
            }
        });
    }
})
