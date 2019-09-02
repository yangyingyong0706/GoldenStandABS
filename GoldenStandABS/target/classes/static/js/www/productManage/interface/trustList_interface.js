var webProxy;

define(function (require) {
    var $ = require('jquery');
    webProxy = require('gs/webProxy');
})

function IFrameReSizeWH(mainFrame) {
    var iframename = mainFrame;
    //iframe高度自适应
    function IFrameReSize(iframename) {
        var pTar = document.getElementById(iframename);
        if (pTar) { //ff
            if (pTar.contentDocument && pTar.contentDocument.body.offsetHeight) {
                pTar.height = pTar.contentDocument.body.offsetHeight;
            } //ie
            else if (pTar.Document && pTar.Document.body.scrollHeight) {
                pTar.height = pTar.Document.body.scrollHeight;
            }
        }
    }
    //iframe宽度自适应
    function IFrameReSizeWidth(iframename) {
        var pTar = document.getElementById(iframename);
        if (pTar) { //ff
            if (pTar.contentDocument && pTar.contentDocument.body.offsetWidth) {
                pTar.width = pTar.contentDocument.body.offsetWidth;
            } //ie
            else if (pTar.Document && pTar.Document.body.scrollWidth) {
                pTar.width = pTar.Document.body.scrollWidth;
            }
        }
    }
}
function trustAction(callback) {
    var $ = require('jquery');
    var grid = $("#" + gridDomId).data("kendoExtGrid");
    if (grid.select().length != 2) {
        alert('请选择一条要操作的数据');
    } else {
        var dataRows = grid.items();
        // 获取行号
        var rowIndex = dataRows.index(grid.select());
        // 获取行对象
        var data = grid.dataItem(grid.select());
        callback(data);
    }
}

//新建产品
function AddTrust() {
    //var GlobalVariable = require('globalVariable');
    var $ = require('jquery');
    require(['gs/childTabModel', 'gs/uiFrame/js/gs-admin-2.pages', 'globalVariable'], function (tm, adminDiaLog, GlobalVariable) {
        adminDiaLog.open(
            '新建产品',
            GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/NewProduct/viewTrust_New.html?tid=0',
            '',
            function () {
                location.reload(true);
            },
            '1050px',
            '600px')
    });
   
}
//管理产品
var viewModel = {};

function MangeTrust() {
    trustAction(function (data) {
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=" + tid;
        var pollId = '{0}_mangeTrust'.format(tid);
        var tabName = '产品信息维护:' + tid;
        openNewIframe(page, pollId, tabName);

    });
}

function Open_WorkBench() {
    trustAction(function (data) {
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //url = 'https://poolcutwcf/TrustManagementService/Clients/HNGTrust/TrustWizard.html?tid=' + tid;
        url = GlobalVariable.SslHost + 'productManage/Clients/HNGTrust/TrustWizard.html?tid=' + tid;
        window.open(url, '_blank');

    });

}
//刷新产品列表
function RefreshTrsustList() {
    self.location.reload();
}

//删除产品
function DeleteTrust() {
    trustAction(function (data) {
        var tid = data.TrustId;
        if (confirm('确定要删除吗？')) {
            require(['goldenstand/taskProcessIndicator', 'goldenstand/sVariableBuilder', 'goldenstand/webProxy', 'common'],
                  function (taskIndicator, sVariableBuilder, webProxy, common) {
                      sVariableBuilder.AddVariableItem('TrustId', tid, 'Int', 1, 0, 0);
                      var sVariable = sVariableBuilder.BuildVariables();
                      var tIndicator = new taskIndicator({
                          width: 600,
                          height: 550,
                          clientName: 'CashFlowProcess',
                          appDomain: 'Task',
                          taskCode: 'RemoveTrust',
                          sContext: sVariable,
                          callback: function () {
                              window.location.reload();
                          }
                      });
                      tIndicator.show();
                  });

        }
    });
}
//文档管理
function ProductFilesManage() {
    var GlobalVariable = require('globalVariable');
    var $ = require('jquery');
    var grid = $("#" + gridDomId).data("kendoExtGrid");
    var dataRows = grid.items();
    // 获取行号
    var rowIndex = dataRows.index(grid.select());
    // 获取行对象
    console.log(dataRows, rowIndex);
    var data = grid.dataItem(grid.select());
    var tcode =grid.select().length == 1? data.TrustCode:'';
    var page = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/Dashboard/DashboardList.html?TaskCode=' + tcode;
    var tabName = '产品文档管理:' + tcode;
    openNewIframe(page, tcode, tabName);

}
//收益分配计算
function TrustCollectionPickerPage() {
    trustAction(function (data) {
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        require(['gs/uiFrame/js/gs-admin-2.pages'], function (GSDialog) {
            GSDialog.open('交易现金流', GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustCollectionPicker/TrustCollectionPicker.html?TrustId=' + tid + '&taskCode=TrustWaterfall&IsDlg=1&random=' + Math.random(),{ a: 1, b: 2 }, function (res) {
                //alert(res);
            }, 600, 350);

        });
    });
}
//收益分配历史数据
function ViewIncomeDistributionHistoryData() {
    trustAction(function (data) {
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/IncomeDistributionHistoryData/IncomeDistributionHistoryData.html?tid=" + tid, '_blank');
        require(['gsAdminPages'], function (GSDialog) {
            GSDialog.open('收益分配历史数据', GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/IncomeDistributionHistoryData/IncomeDistributionHistoryData.html?tid=" + tid, { a: 1, b: 2 }, function (res) {
            }, 768, 600);

        });
    });
}

//产品收益分配模型
var OpenCashflow = function () {
    trustAction(function (data) {
        var tcode = data.TrustCode;
        var GlobalVariable = require('globalVariable');
        window.open(GlobalVariable.CashFlowEngineServiceHostURL + "UITaskStudio/index.html?appDomain=Task&taskCode=" + tcode, '_blank');
    });
}
//添加现金流模型ribbon
var OpenCashflowAddMessage = function () {
    trustAction(function (data) {
        var tcode = data.TrustCode
        var GlobalVariable = require('globalVariable');
        window.open(GlobalVariable.CashFlowEngineServiceHostURL + "UITaskStudio/index.html?appDomain=Task&taskCode=" + (tcode + '_Cashflow'), '_blank');
    });
}
//现金流预测结果
var ShowCashFlowResult = function () {
    trustAction(function (data) {
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        require(['gsAdminPages'], function (GSDialog) {
            GSDialog.open('现金流预测模型', GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/CashFlowResult/CashFlowResult.html?trustId=" + tid, { a: 1, b: 2 }, function (res) {
            }, 1000, 600);
        });
        //window.open(GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/CashFlowResult/CashFlowResult.html?trustId=" + tid, '_blank');
    });
}

function TrustCalendar() {
    var GlobalVariable = require('globalVariable');
    window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustCalendar/TrustCalendar.html');
}

//底部资产管理
function AssetDetail() {
    trustAction(function (data) {
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustFollowUp/AssetDetailList.html?tid=" + tid;
        var trustId = '{0}_assetDetail'.format(tid);
        var tabName = '底部资产管理:'+tid;
        openNewIframe(page, trustId, tabName);
    });
}

//原始权益人管理
function OriginalOwner() {
    trustAction(function (data) {
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustFollowUp/OriginalOwnerList/OriginalOwnerList.html?tid=" + tid;
        var trustId = '{0}_OriginalOwner'.format(tid);
        var tabName = '原始权益人管理:'+tid;
        openNewIframe(page, trustId, tabName);
    });
}

function RevolvePurchase() {
    trustAction(function (data) {
        var trustId = data.TrustId;
        var page = webProxy.baseUrl + '/GoldenStandABS/www/productManage/TrustManagement/revolvePurchase/revolvePurchase.html?TrustId={0}'.format(trustId);
        if (trustId) {
            openNewIframe(page, trustId + '_revolvePurchase', '循环购买: ' + trustId);
        }
        else {
            return;
        }
    });
}

function RunTrustWaterFall(reportingDate, periods) {
    //var serviceUrl = GlobalVariable.SessionManagementServiceUrl + "/CreateSessionByTaskCode";
    //var r = PagerListModule.GetRows(true);
    //var tid = r.attr('TrustId'), tCode = r.attr('TrustCode');
    var $ = require('jquery');
    var grid = $("#" + gridDomId).data("kendoExtGrid");
    var dataRows = grid.items();
    // 获取行号
    var rowIndex = dataRows.index(grid.select());
    // 获取行对象
    var data = grid.dataItem(grid.select());
    var tid = data.TrustId;
    var tCode = data.TrustCode;
    var dparts = reportingDate.split('-');
    var DimReportingDateId = dparts[0] + dparts[1] + dparts[2];
    var startPeriod = 0;
    var endPeriod = 0;
    var period = 1;
    if (periods.length != 0) {
        if (periods.indexOf(',') != -1) {
            var parts = periods.split(',');
            startPeriod = parts[0];
            endPeriod = parts[1];
            period = parseInt(endPeriod) + 1;
        }
        else {
            period = parseInt(periods);
            endPeriod = period - 1;
        }
    }

    require(['goldenstand/taskProcessIndicator', 'goldenstand/sVariableBuilder', 'goldenstand/webProxy', 'common'],
        function (taskIndicator, sVariableBuilder, webProxy, common) {
            sVariableBuilder.AddVariableItem('TrustId', tid, 'Int', 0, 0, 0);
            sVariableBuilder.AddVariableItem('ReportingDate', reportingDate, 'String', 0, 0, 0);
            sVariableBuilder.AddVariableItem('StartPeriod', startPeriod, 'Int', 1, 0, 0);
            sVariableBuilder.AddVariableItem('EndPeriod', endPeriod, 'Int', 1, 0, 0);
            sVariableBuilder.AddVariableItem('Period', period, 'Int', 1, 0, 0);
            sVariableBuilder.AddVariableItem('CashFlowECSet', tCode, 'Int', 1, 0, 0);
            sVariableBuilder.AddVariableItem('InterestRate', 0.05, 'Int', 1, 0, 0);
            sVariableBuilder.AddVariableItem('DimReportingDateId', DimReportingDateId, 'Int', 1, 0, 0);

            var sVariable = sVariableBuilder.BuildVariables();

            var tIndicator = new taskIndicator({
                width: 600,
                height: 550,
                clientName: 'CashFlowProcess',
                appDomain: 'Task',
                taskCode: tCode,
                sContext: sVariable,
                callback: function () {
                    //alert('done');
                }
            });
            tIndicator.show();
        });
}

function openNewIframe(page, trustId, tabName,cb) {
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
        $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
        $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
    };
}

