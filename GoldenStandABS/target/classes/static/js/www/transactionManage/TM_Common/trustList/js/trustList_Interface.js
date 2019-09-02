var GlobalVariable = require('globalVariable');
function trustAction() {
    var webStorage = require('gs/webStorage');
    var alertmsg = '请选择要操作的数据';
    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        alertmsg = 'Please select on item';
    }

    var grid = $("#" + gridDomId).data("kendoExtGrid");
    if (grid.select().length != 2) {
        GSDialog.HintWindow(alertmsg);
    } else {
        //var dataRows = grid.items();
        //// 获取行号
        //var rowIndex = dataRows.index(grid.select());
        //// 获取行对象
        var data = grid.dataItem(grid.select());
        return data;
    }
}
//产品管理获取TrustId方法
function trustAction2(callback) {
    var webStorage = require('gs/webStorage');
    var alertmsg = '请选择要操作的数据';
    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        alertmsg = 'Please select on item';
    }

    var $ = require('jquery');
    var grid = $("#" + gridDomId).data("kendoExtGrid");
    if (grid.select().length != 2) {
        GSDialog.HintWindow(alertmsg);
    } else {
        var dataRows = grid.items();
        // 获取行号
        var rowIndex = dataRows.index(grid.select());
        // 获取行对象
        var data = grid.dataItem(grid.select());
        callback(data);
    }
}
function openNewIframe(page, pollId, tabName) {
    var pass = true;
    parent.viewModel.tabs().forEach(function (v, i) {
        if (v.id == pollId) {
            pass = false;
            parent.viewModel.changeShowId(v);
            return false;
        }
    })
    if (pass) {
        //parent.viewModel.showId(trustId);
        var newTab = {
            id: pollId,
            url: page,
            name: tabName,
            disabledClose: false
        };
        parent.viewModel.tabs.push(newTab);
        parent.viewModel.changeShowId(newTab);
        $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
        $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
    };
}


//交易管理 功能向导列表
//信托对价分配
//function viewAllocationTrust() {
//    trustAction2(function (data) {
//        var webStorage = require('gs/webStorage');
//        var tabName = '信托对价分配记录:';
//        var userLanguage = webStorage.getItem('userLanguage');
//        if (userLanguage && userLanguage.indexOf('en') > -1) {
//            tabName = 'Allocation Trust List:';
//        }
//        var tid = data.TrustId;
//        var GlobalVariable = require('globalVariable');
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
//        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/allocationTrust/viewAllocationTrust.html?tid=" + tid;
//        var pollId = '{0}viewAllocationTrust'.format(tid);
//        tabName   += tid;
//        openNewIframe(page, pollId, tabName);
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
//    });
//}
//资产转让
function viewAssetTransfer() {
    trustAction2(function (data) {
        var webStorage = require('gs/webStorage');
        var tabName = '资产转让管理:';
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            tabName = 'Asset Assignment List:';
        }
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/assetTransfer/viewAssetTransfer.html?tid=" + tid;
        var pollId = '{0}viewAssetTransfer'.format(tid);
        tabName += tid;
        openNewIframe(page, pollId, tabName);
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
    });
} 
//资产回收
//function viewAssetRecovery() {
//    trustAction2(function (data) {
//        var webStorage = require('gs/webStorage');
//        var tabName = '资产回收:';
//        var userLanguage = webStorage.getItem('userLanguage');
//        if (userLanguage && userLanguage.indexOf('en') > -1) {
//            tabName = 'Asset Recovery List:';
//        }
//        var tid = data.TrustId;
//        var GlobalVariable = require('globalVariable');
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
//        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/assetRecovery/viewAssetRecovery.html?tid=" + tid;
//        var pollId = '{0}viewAssetRecovery'.format(tid);
//        tabName += tid;
//        openNewIframe(page, pollId, tabName);
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
//    });
//}
////资产回收上划
//function viewBuyBack() {
//    trustAction2(function (data) {
//        var webStorage = require('gs/webStorage');
//        var tabName = '资产回收上划记录:';
//        var userLanguage = webStorage.getItem('userLanguage');
//        if (userLanguage && userLanguage.indexOf('en') > -1) {
//            tabName = 'Buy Back List:';
//        }
//        var tid = data.TrustId;
//        var GlobalVariable = require('globalVariable');
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
//        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/buyBack/viewBuyBack.html?tid=" + tid;
//        var pollId = '{0}viewBuyBack'.format(tid);
//        tabName += tid;
//        openNewIframe(page, pollId, tabName);
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
//    });
//}
////资产回收转付
//function viewRecoveryTransfer() {
//    trustAction2(function (data) {
//        var webStorage = require('gs/webStorage');
//        var tabName = '资产回收转付记录:';
//        var userLanguage = webStorage.getItem('userLanguage');
//        if (userLanguage && userLanguage.indexOf('en') > -1) {
//            tabName = 'Recovery Transfer List:';
//        }
//        var tid = data.TrustId;
//        var GlobalVariable = require('globalVariable');
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
//        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/recoveryTransfer/viewRecoveryTransfer.html?tid=" + tid;
//        var pollId = '{0}viewRecoveryTransfer'.format(tid);
//        tabName += tid;
//        openNewIframe(page, pollId, tabName);
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
//    });
//}
//资产赎回管理
function viewAssetRedemption() {
    trustAction2(function (data) {
        var webStorage = require('gs/webStorage');
        var tabName = '资产赎回管理:';
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            tabName = 'Asset Redemption List:';
        }
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/assetRedemption/viewAssetRedemption.html?tid=" + tid;
        var pollId = '{0}viewAssetRedemption'.format(tid);
        tabName += tid;
        openNewIframe(page, pollId, tabName);
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
    });
}
//清仓回购管理
function viewClearanceBuyBack() {
    trustAction2(function (data) {
        var webStorage = require('gs/webStorage');
        var tabName = '清仓回购管理:';
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            tabName = 'Clearance Buy Back List:';
        }
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/clearanceBuyBack/viewClearanceBuyBack.html?tid=" + tid;
        var pollId = '{0}viewClearanceBuyBack'.format(tid);
        tabName += tid;
        openNewIframe(page, pollId, tabName);
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
    });
}
////回购上划管理
//function viewRecycleMark() {
//    trustAction2(function (data) {
//        var webStorage = require('gs/webStorage');
//        var tabName = '回购上划管理:';
//        var userLanguage = webStorage.getItem('userLanguage');
//        if (userLanguage && userLanguage.indexOf('en') > -1) {
//            tabName = 'Recycle Mark List:';
//        }
//        var tid = data.TrustId;
//        var GlobalVariable = require('globalVariable');
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
//        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/recycleMark/viewRecycleMark.html?tid=" + tid;
//        var pollId = '{0}viewRecycleMark'.format(tid);
//        tabName += tid;
//        openNewIframe(page, pollId, tabName);
//        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
//    });
//}

