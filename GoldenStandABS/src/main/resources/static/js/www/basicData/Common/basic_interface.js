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


function ToolManage() {
    var GlobalVariable = require('globalVariable');
    var page = GlobalVariable.TrustManagementServiceHostURL + "basicData/Assortment/toolManage.html?enter=toolManage";
    var pollId = '{0}ToolManage';
    var tabName = '工具';
    openNewIframe(page, pollId, tabName);
}

function DailyRecord() {
    var GlobalVariable = require('globalVariable');
    var page = GlobalVariable.TrustManagementServiceHostURL + "basicData/Assortment/toolManage.html?enter=DailyRecord";
    var pollId = '{0}DailyRecord';
    var tabName = '日志';
    openNewIframe(page, pollId, tabName);
}

function DataManage() {
    var GlobalVariable = require('globalVariable');
    var page = GlobalVariable.TrustManagementServiceHostURL + "basicData/Assortment/toolManage.html?enter=DataManage";
    var pollId = '{0}DataManage';
    var tabName = '数据管理';
    openNewIframe(page, pollId, tabName);
}

function CheckoutManage() {
    var GlobalVariable = require('globalVariable');
    var page = GlobalVariable.TrustManagementServiceHostURL + "basicData/Assortment/toolManage.html?enter=CheckoutManage";
    var pollId = '{0}CheckoutManage';
    var tabName = '测试';
    openNewIframe(page, pollId, tabName);
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

