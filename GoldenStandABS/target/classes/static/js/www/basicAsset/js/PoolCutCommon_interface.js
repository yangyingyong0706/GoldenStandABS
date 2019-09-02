

var GSDialog = '';
var GlobalVariable;
var webProxy;
var taskIndicator;
var sVariableBuilder;

var langx = {};
var xhrOnProgress = function (fun) {
    xhrOnProgress.onprogress = fun;
    return function () {
        var xhr = $.ajaxSettings.xhr();
        if(typeof xhrOnProgress.onprogress!=='function')
            return xhr
        if (xhrOnProgress.onprogress && xhr.upload) {
            xhr.upload.onprogress = xhrOnProgress.onprogress;
        }
        return xhr
    }
}
define(function (require) {

    taskIndicator = require('gs/taskProcessIndicator');
    sVariableBuilder = require('gs/sVariableBuilder');
    GlobalVariable = require('gs/globalVariable');
    GSDialog = require('gsAdminPages');
    webProxy = require('gs/webProxy');
    require("anyDialog")
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');
    var common = require('common');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.assetImportGuide = 'Asset Import Wizard';
        langx.assetTemplate = "Data Templates";
        langx.quickCreateTrust = "Quickly Create Product";
        langx.dataChecksum = "Asset-Data Check";
        langx.importAsset = "Asset-Data Import";
        langx.assetReport = "Pivot Table";
        langx.UpdateBaseAssetInfo = "Update BaseAsset Info";
        langx.
        langx.fuc = "file upload has been cancelled!";
        langx.fut = "file upload timeout!";
        langx.fuf = "file upload failure!";
        langx.assetTemplateInput = 'Asset Template Select Wizard';
        langx.AssetDocumentMatching = 'Document Matching';
    }else{
        langx.assetImportGuide = "资产导入向导";
        langx.assetTemplate = "数据模板文件下载";
        langx.quickCreateTrust = "快速新建产品";
        langx.dataChecksum = "数据校验";
        langx.importAsset = "导入资产";
        langx.assetReport = "透视报表";
        langx.queryAsset = "资产查询";
        langx.UpdateBaseAssetInfo = "刷新基础资产信息";
        langx.fuc = "文件上传已取消!";
        langx.fut = "文件上传超时!";
        langx.fuf = "文件上传失败!";
        langx.assetTemplateInput = '数据模板选择向导';
        langx.AssetDocumentMatching = '数据导入字段匹配';
        
    }
   
});
function ImportAssetNavigator() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "basicAsset/AssetNavigator/AssetNavigator.html";
    var pollId = '{0}_ImportAssetNavigator';
    var tabName = langx.assetImportGuide ? langx.assetImportGuide : '资产导入向导';
    openNewIframe(page, pollId, tabName);
    //GSDialog.open(langx.assetImportGuide, '../AssetNavigator/AssetNavigator.html', 99, function () {
    //    location.reload(true);
    //}, 900, 580);

}

function DataTemplateImportNavigator() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "components/NewCashflowSplit/NewCashflowSplit.html?entry=entry";
    var pollId = '{0}_DataTemplateImportNavigator';
    var tabName = langx.assetTemplateInput ? langx.assetTemplateInput : '数据模板选择向导';
    openNewIframe(page, pollId, tabName);
}

function DownAssetTemplates() {
    GSDialog.open(langx.assetTemplate, '../AssetTemplates/AssetTemplates.html', 1, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 700, 600);
    GSDialog.getData();
}
function OpenDataCheckPage() {
    GSDialog.open(langx.dataChecksum, '../AssetDataCheck/DataCheck.html', 2, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 900, 500);
}
function OpenQuickTrustCreation() {
    GSDialog.open(langx.quickCreateTrust, '../QuickTrust/QuickTrustCreation.html', 3, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 600, 380);
}


function OpenUploadTrust() {
    GSDialog.open(langx.importAsset, '../AssetDataImport/UploadImportData.html', 4, function () {     
        location.reload(true);
    }, 600, 470);     
}

function DownloadReport() {

    GSDialog.open(langx.assetReport, '../AssetReport/assetReport.html', null, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 600, 410);
}


//资产查询
function QueryAsset() {
    
    GSDialog.open(langx.queryAsset, '../AssertQuery/loanView.html', null, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 1000, 580);

}
//刷新基础资产信息
function UpdateBaseAssetInfo() {
    sVariableBuilder.AddVariableItem('TrustId', '0', 'String', 0, 0, 0);
    var sVariable = sVariableBuilder.BuildVariables();
    var tIndicator = new taskIndicator({
        width: 500,
        height: 550,
        clientName: 'TaskProcess',
        appDomain: 'Task',
        taskCode: 'UpdateBaseAssetInfo',
        sContext: sVariable,
        callback: function () {
            sVariableBuilder.ClearVariableItem();
            $("#modal-close", window.parent.document).trigger("click");
            location.reload(true);
        }
    });
    tIndicator.show();
}
//文档匹配
function DocumentMatching() {
    GSDialog.open(langx.AssetDocumentMatching, '../AssetDocumentMatching/AssetDocumentMatching.html', 1, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 1000, 580);
}




function GetCheckedPool() {

    var Pool = getPoolHeader();

    return Pool;
}
function UploadFile(fileCtrlId, fileName, folder, fnCallback) {
    var fileData = document.getElementById(fileCtrlId).files[0];
    var svcUrl = GlobalVariable.PoolCutServiceURL + 'FileUpload?fileName={0}&fileFolder={1}'.format(
        encodeURIComponent(fileName), encodeURIComponent(folder));
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
            if (fnCallback) fnCallback(sourceData);
        },
        error: function (data) {
            $("#upload_ail").attr("disabled", false);
            GSDialog.HintWindow('File upload failed!');
        }
    });
}

function MultipartUploadFile(fileCtrlId, fileName, folder, fnCallback, fnProcess) {
    var fileData = document.getElementById(fileCtrlId).files[0];
    var svcUrl = webProxy.poolCutServiceURL;

    fileName = encodeURIComponent(fileName);
    folder = encodeURIComponent(folder);

    var options = {
        type: 'POST',
        cache: false,
        async: true,
        dataType: 'json',
        processData: false,
        error: function (xhr, status) {
            if (xhr) {
                if (status === 'abort') {
                    GSDialog.HintWindow(langx.fuc);
                } else if (status == 'timeout') {
                    GSDialog.HintWindow(langx.fut);
                } else {
                    GSDialog.HintWindow(langx.fuf);
                }
            }
        }
    };

    if (window.FormData) { // 如果支持H5的FormData API
        var data = new FormData();
        data.append('file', fileData);

        $.extend(options, {
            url: svcUrl + 'MultipartFileUpload?fileName=' + fileName + '&fileFolder=' + folder,
            data: data,
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.onprogress = function (e) {
                        var loaded = e.loaded || e.position;
                        var total = e.total || e.totalSize;
                        var percent = 0;
                        if (e.lengthComputable) {
                            percent = Math.floor(loaded / total * 100); // 转换成百分比
                        }
                        if (fnProcess) fnProcess(percent);
                    }
                    return xhr;
                }
            },
            success: function (response) {
                var sourceData;
                if (typeof response == 'string')
                    sourceData = JSON.parse(response);
                else
                    sourceData = response;
                if (fnCallback) fnCallback(sourceData.MultipartFileUploadResult);
            }
        });
    } else {
        $.extend(options, {
            url: svcUrl + 'FileUpload?fileName=' + fileName + '&fileFolder=' + folder,
            data: fileData,
            success: function (response) {
                var sourceData;
                if (typeof response == 'string')
                    sourceData = JSON.parse(response);
                else
                    sourceData = response;
                if (fnCallback) fnCallback(sourceData.FileUploadResult);
            }
        });
    }

    return $.ajax(options);
}

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
        error: function (response) { GSDialog.HintWindow('在需要远程源数据时发生错误！'); }
    });

    if (!isAsync) { return sourceData; }
}

function openNewIframe(page, trustId, tabName, cb) {
    
    var pass = true;
    parent.viewModel.tabs().forEach(function (v, i) {
        if (v.id == trustId) {
            pass = false;
            parent.viewModel.changeShowId(v);
            return false;
        }
    })
    if (pass) {
        //parent.viewModel.showId(trustId);
        var newTab = {
            id: trustId,
            url: page,
            name: tabName,
            disabledClose: false
        };
        parent.viewModel.tabs.push(newTab);
        parent.viewModel.changeShowId(newTab);
        if (tabName == "新建产品向导") {
            var btn = $('.chrome-tabs-shell', parent.document).find(".chrome-tab-current").find(".chrome-tab-close");
            btn.click(function () {
                var rel = $(frameElement).contents().find(".main").find("#DashBoard").find('.productManage').find("button:first").find("a");
                if (rel.find('span').text() == '刷新') {
                    rel[0].click();
                }
            })
        }
        $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
        $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
    };
}






