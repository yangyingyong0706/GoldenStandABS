var GSDialog = '';
var GlobalVariable;
var webProxy;
var taskIndicator;
var sVariableBuilder;
var common;
var webStorage;
var langx = {};
var TrustId = '';
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
define(function (require) {
    GlobalVariable = require('gs/globalVariable');
    GSDialog = require('gsAdminPages');
    webProxy = require('gs/webProxy');
    require("anyDialog")
    require('jquery.localizationTool');
    common = require('common')
    webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');
    //TrustId = webStorage.getItem('TrustId');
    TrustId = common.getQueryString('TrustId');
    taskIndicator = require('gs/taskProcessIndicator');
    sVariableBuilder = require('gs/sVariableBuilder');

    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.assetTemplate = "Data Templates";
        langx.dataChecksum = "Asset-Data Check";
        langx.importAsset = "Asset-Data Import";
        langx.fuc = "file upload has been cancelled!";
        langx.fut = "file upload timeout!";
        langx.fuf = "file upload failure!";
        langx.assetDetailsRecord = 'asset Select'
        langx.assetFinancialreport = 'asset Financial report'
        langx.assetStatus = 'asset Status'
        langx.assetStatistics = 'asset Statistics'
        langx.productList = 'product List'
        langx.createProduct = 'create Product'
        langx.PaymentDataManage = 'Payment Data Manage'
        langx.bottomAssetManage = 'bottom Asset Manage'
        langx.settingDate = 'setting Date'
    } else {
        langx.assetTemplate = "数据模板文件下载";
        langx.dataChecksum = "数据校验";
        langx.importAsset = "导入资产";
        langx.queryAsset = "资产查询";
        langx.fuc = "文件上传已取消!";
        langx.fut = "文件上传超时!";
        langx.fuf = "文件上传失败!";
        langx.assetDetailsRecord = '资产查询'
        langx.assetFinancialreport = '资产财务报表'
        langx.assetStatus = '资产维度统计'
        langx.assetStatistics = '资产统计视图'
        langx.productList = '产品列表'
        langx.createProduct = '新建产品'
        langx.PaymentDataManage = '回款数据管理'
        langx.bottomAssetManage = '底部资产管理'
        langx.settingDate = '日期设置'
    }

});
//获取表格选中数据
function trustAction(callback) {
    var $ = require('jquery');
    var grid = $("#grid").data("kendoExtGrid");
    if (grid.select().length != 1) {
        GSDialog.HintWindow('请选择数据！');
    } else {
        var dataRows = grid.items();
        // 获取行号
        var rowIndex = dataRows.index(grid.select());
        // 获取行对象
        var data = grid.dataItem(grid.select());
        callback(data);
    }
}
//产品列表
function productList() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "managementDataCenter/ImportDataModul/product.html";
    var pollId = 'iframeMainContent';
    var tabName = langx.productList;
    openNewIframe(page, pollId, tabName);
}
//下载模板
function DownAssetTemplates() {
    GSDialog.open(langx.assetTemplate, GlobalVariable.TrustManagementServiceHostURL + 'basicAsset/AssetTemplates/AssetTemplates.html', 1, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 700, 460);
    GSDialog.getData();
}
//更新切片 
function updateDataSlice() {
    sVariableBuilder.AddVariableItem('TrustId', TrustId, 'int', 0, 0, 0);
    var sVariable = sVariableBuilder.BuildVariables();
    var tIndicator = new taskIndicator({
        width: 500,
        height: 550,
        clientName: 'TaskProcess',
        appDomain: 'Task',
        taskCode: 'UpdateDataSliceStatus',
        sContext: sVariable,
        callback: function () {
            sVariableBuilder.ClearVariableItem();
            $("#modal-close", window.parent.document).trigger("click");
            location.reload(true);
        }
    });
    tIndicator.show();
}
//数据校验
function OpenDataCheckPage() {
    GSDialog.open(langx.dataChecksum, GlobalVariable.SslHost + 'AssetDataCheck/www/DataCheck.html?appDomain=AssetDataCenter', 2, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 900, 500, 1, true, true, true, false);
}
//导入资产
function OpenUploadTrust() {
    GSDialog.open(langx.importAsset, GlobalVariable.TrustManagementServiceHostURL + 'basicAsset/AssetDataImport/UploadImportData.html', 4, function () {
        location.reload(true);
    }, 600, 470);
}
//回款计划导入
function importPaymentPlan() {
    GSDialog.open('回款计划导入', GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustFollowUp/CashflowManagement/ImportFileWithTemplate.html?trustId=' + TrustId + '&uploadType=RepaymentPlan', 4, function () {
        location.reload(true);
    }, 600, 250);
}
//回款数据导入
function importPaymentData() {
    GSDialog.open('回款数据导入', GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustFollowUp/CashflowManagement/ImportFileWithTemplate.html?trustId=' + TrustId + '&uploadType=PaymentData', 4, function () {
        location.reload(true);
    }, 600, 250);
}
//回款数据管理
function PaymentDataManage() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustFollowUp/CashflowManagement/CashflowManagement_New.html?tid=" + TrustId;
    var pollId = 'PaymentDataManage';
    var tabName = langx.PaymentDataManage +'_'+ TrustId;
    openNewIframe(page, pollId, tabName);
}
//资产明细查询
function assetDetailsRecord() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "basicAsset/AssertQuery/loanView.html";
    var pollId = 'assetDetailsRecord';
    var tabName = langx.assetDetailsRecord;
    openNewIframe(page, pollId, tabName);
}
//新建产品
function createProduct() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "basicAsset/AssetNavigator/AssetNavigator.html";
    var pollId = 'createProduct';
    var tabName = langx.createProduct;
    openNewIframe(page, pollId, tabName);
}
//日期设置
function settingDate() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "components/viewDateSet/viewDateSet.html?productPermissionState=1&tid=" + TrustId;
    var pollId = 'settingDate'+TrustId;
    var tabName = langx.settingDate + '_' + TrustId;
    openNewIframe(page, pollId, tabName);
}
//底部资产管理
function bottomAssetManage() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustFollowUp/AssetDetailList.html?tid=" + TrustId;
    var pollId = 'bottomAssetManage' + TrustId;
    var tabName = langx.bottomAssetManage + '_' + TrustId;
    openNewIframe(page, pollId, tabName);
}
//资产统计视图
function assetStatistics() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustFollowUp/statistics/statistics.html?trustId=" + TrustId;
    var pollId = 'assetStatistics' + TrustId;
    var tabName = langx.assetStatistics + '_' + TrustId;
    openNewIframe(page, pollId, tabName);
}
//资产维度统计
function assetStatus() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "managementDataCenter/DataMonitoringAnalysisModul/assetStatus.html?trustId=" + TrustId;
    var pollId = 'assetStatus' + TrustId;
    var tabName = langx.assetStatus + '_' + TrustId;
    openNewIframe(page, pollId, tabName);
}
//资产财务报表
function assetFinancialreport() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "financialReport/Reporting.html";
    var pollId = 'assetFinancialreport';
    var tabName = langx.assetFinancialreport;
    openNewIframe(page, pollId, tabName);
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
        var newTab = {
            id: trustId,
            url: page,
            name: tabName,
            disabledClose: false
        };
        if (page.indexOf('loanView.html') > -1 || page.indexOf('product.html') > -1) {
            newTab.disabledClose = true;
        }
        if (page.indexOf('loanView.html') > -1 || page.indexOf('product.html') > -1) {
            var array = []
            parent.viewModel.tabs.push(newTab);
            parent.viewModel.changeShowId(newTab);
            parent.viewModel.tabs().forEach(function (v, i) {//记录之前的tab
                if (i != parent.viewModel.tabs().length - 1) {
                    array.push(v)
                }
            })
            console.log(array)
            $.each(array, function (j, k) {
                console.log(k);
                parent.viewModel.closeShowId(k);
            })
        } else {
            parent.viewModel.tabs.push(newTab);
            parent.viewModel.changeShowId(newTab);
        }
        $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
        $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
    };
}







