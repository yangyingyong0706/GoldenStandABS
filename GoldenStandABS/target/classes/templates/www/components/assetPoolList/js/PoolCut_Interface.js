
////////////Ribbon Button Events Regisition////////////

var GSDialog = '';//= require('gs/uiFrame/js/gs-admin-2.pages');
var tm;
var taskIndicator
var sVariableBuilder;
var common;
var webProxy;
var langx = {};
var basePoolId;
var CallApi;

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
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    GlobalVariable = require('gs/globalVariable');
    taskIndicator = require('gs/taskProcessIndicator');
    sVariableBuilder = require('gs/sVariableBuilder');
    common = require('gs/uiFrame/js/common');
    webProxy = require('gs/webProxy');
    CallApi = require("callApi")
    //return tabModel;

    require("anyDialog")
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');

    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.assetImportGuide = 'Data template file download';
        langx.assetTemplate = "Data verification";
        langx.quickCreateTrust = "Import data";
        langx.asssfilter = 'Query Asset';
        langx.assetContrast = 'Contrast Asset';
        langx.filtrateResult = 'EC filtrate result';
        langx.dataChecksum = "Import circular purchase assets";
        langx.importAsset = "Project planning paper";
        langx.assetReport = "Cash flow calendar";
        langx.queryAsset = "Base asset pool";
        langx.fuc = "Pre sale";
        langx.targetpool = 'Targeted asset pool_';
        langx.marketpool = 'Marketable asset pool_';
        langx.report = 'Asset pool dimension Report_';
        langx.CashflowSplit = 'langx';
        langx.adjust = 'Asset pool distribution adjustment_';
        langx.screen = 'Asset screening_';
        langx.poolreport = 'Asset pool Report_';
        langx.pooladjust = 'Asset pool distribution adjustment_';
        langx.calculator = 'collection time calculator_'
        langx.CashflowSelecter = 'Selecter_'
        langx.NoPrincipalSplit = 'No Principal Split_'
        langx.ReimbursementManagement = 'ReimbursementManagement_'


    } else {
        langx.assetImportGuide = "数据模板文件下载";
        langx.assetTemplate = "数据校验";
        langx.quickCreateTrust = "导入数据";
        langx.asssfilter = '资产查询';
        langx.assetContrast = '资产池对比';
        langx.filtrateResult = 'EC筛选结果';
        langx.dataChecksum = "导入循环购买资产";
        langx.importAsset = "项目计划书";
        langx.assetReport = "现金流日历";
        langx.queryAsset = "基础资产池";
        langx.fuc = "预销售";
        langx.targetpool = '资产池目标化_';
        langx.marketpool = '资产池额度调整_';
        langx.report = '维度报告_';
        langx.CashflowSplit = '现金流拆分_';
        //langx.report = '资产池维度报告_';
        langx.adjust = '分布调整_';
        //langx.adjust = '资产池分布调整 -';
        langx.screen = '资产筛选_';
        langx.poolreport = '资产池报告_';
        langx.pooladjust = '分布调整_';
        langx.calculator = '归集向导_'
        langx.CashflowSelecter = '选择器_'
        langx.NoPrincipalSplit = '信用卡抛帐拆分'
        langx.ReimbursementManagement = '回款现金流管理_'

    }

    basePoolId = common.getQueryString('PoolId');

})

function DownAssetTemplates() {
    GSDialog.open(langx.assetImportGuide, 'Pages/AssetTemplates.html', null, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 600, 300);

}
function OpenDataCheckPage() {
    GSDialog.open(langx.assetTemplate, 'Pages/DataCheck.html', null, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 600, 300);
}
function OpenUploadPage() {
    GSDialog.open(langx.quickCreateTrust, 'Pages/UploadImportData.html', 0, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 600, 400);
}

function OpenUploadTrustPage() {
    GSDialog.open(langx.dataChecksum, 'Pages/UploadImportData.html', 1, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 600, 400);
}
function DownloadReport() {
    //下载'透视报表'

    var fileUrl = location.protocol + '//' + location.host + '/PoolCut/Files/Reports/DailyReport/资产池日统计报表.xlsm';

    window.location.href = fileUrl;
}
function GenerateDoc() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    GSDialog.open(langx.importAsset, 'Pages/AssignTrust.html'
        , { title: '生成项目计划书', TaskCode: 'DocxCreation', Pool: ckdPool }
        , function (result) {
            if (result) {
                window.location.reload();
            }
        }
        , 600, 400);
}
function OpenBusinessRuleStudioPage() {
    var pageUrl = webProxy.baseUrl + '/BusinessRuleEngine/index.html';//'https://abs-dit.goldenstand.cn/BusinessRuleEngine/index.html';
    window.open(pageUrl, '_blank');
}

function OpenCashflowPage() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;

    var pageUrl = 'Pages/CashflowPage.html';
    //var pageUrl = 'https://poolcutwcf/TaskProcessServices/UITaskStudio/paymentSchedule.html?PoolId=' + ckdPool.PoolId;
    GSDialog.open(langx.assetReport, pageUrl, ckdPool, null, 950, 550);

}
function OpenPoolCreationPage() {
    var ProjectId = window.location.href.split('=')[2]; //判断是从哪个地方进入，项目管理还是资产筛选
    if (ProjectId) {
        GSDialog.open(langx.queryAsset, '/GoldenStandABS/www/assetFilter/poolCreationN/poolCreation.html?ProjectId='+ProjectId, null, function (result) {
            if (result) {
                window.location.reload();
            }
        }, 600, 374);
    }
    else {
        GSDialog.open(langx.queryAsset, '/GoldenStandABS/www/assetFilter/poolCreationN/poolCreation.html', null, function (result) {
            if (result) {
                window.location.reload();
            }
        }, 600, 374);
    }
   
}
function RefreshAssetPoolList() {
    location.reload(true);
}
function OpenPoolTargetingPage() {//generate a subpool
    if (window.location.href.indexOf('basePoolContent') < 0) {
        GSDialog.HintWindow('此页面不能操作这个动作');
        return;
    }
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    if (ckdPool.PoolTypeId != 4) {
        if (ckdPool.PoolTypeId != 20269) {
            GSDialog.HintWindow("所选择的资产池不适用于该操作!")
            return;
        }
    }
    var actionType = 'PoolTargetChild';
    if (ckdPool.PoolTypeId == 4 || ckdPool.PoolTypeId == 20269) {
        actionType = 'PoolTargetParent';
    }
    if ($(".k-state-selected")[0].innerHTML.indexOf("<i>") < 0) {
        $($(".k-state-selected")[0]).append("<i style='padding:2px;position:relative;left:-20px;top:13px' class='fa fa-lock'><i>");
    }
    var page = '/GoldenStandABS/www/assetFilter/poolTargeting/poolTargeting.html?PoolId={0}&ActionPoolType={1}'.format(ckdPool.PoolId, actionType);
    var pollId = '{0}'.format(ckdPool.PoolId + '_Target');
    var tabName = langx.targetpool + ckdPool.PoolId
    //var tabModel = new tm();
    openNewIframe(page, pollId, tabName);
    //window.open(page, '_blank');
}
function OpenSalablePoolPage() {//make pool salable
    if (window.location.href.indexOf('basePoolContent') < 0) {
        GSDialog.HintWindow('此页面不能操作这个动作');
        return;
    }
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    if (!ckdPool.CurrentPrincipalBalance && !ckdPool.LoanCount) {
        GSDialog.HintWindow("所选择的资产池的信贷数据和规模为0, 不适用于该操作！")
        return;
    }
    if (ckdPool.PoolTypeId == 20268) {
        GSDialog.HintWindow("所选择的资产池不适用于该操作!")
        return;
    }
    if ($(".k-state-selected")[0].innerHTML.indexOf("<i>") < 0) {
        $($(".k-state-selected")[0]).append("<i style='padding:2px;position:relative;left:-20px;top:13px' class='fa fa-lock'><i>");
    }
    var page = '/GoldenStandABS/www/assetFilter/poolTargeting/poolTargeting.html?PoolId={0}&ActionPoolType=PoolTargetChild'.format(ckdPool.PoolId);
    var pollId = '{0}'.format(ckdPool.PoolId + '_SaleCan');
    var tabName = langx.marketpool + ckdPool.PoolId;
    openNewIframe(page, pollId, tabName);
    //window.open(page, '_blank');
    //GSDialog.open('目标资产池', '/GoldenStandABS/www/assetFilter/html/PoolTargeting.html?PoolId=' + ckdPool.PoolId, null, function (result) {
    //    if (result) {
    //        window.location.reload();
    //    }
    //}, 950, 550);
}
function AssetFilter() {
    if (window.location.href.indexOf('basePoolContent') < 0) {
        GSDialog.HintWindow("此页面不能操作这个动作")
        return;
    }

    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var rcvData = GSDialog.getData();

    GSDialog.open(langx.asssfilter, '../AssetsContrast/loanView.html?PoolId=' + basePoolId, { Pool: ckdPool }, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 1000, 580, '', true, true, true, false);
}

function AssetContrast() {
    if (window.location.href.indexOf('basePoolContent') < 0) {
        GSDialog.HintWindow("此页面不能操作这个动作")
        return;
    }

    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var rcvData = GSDialog.getData();

    GSDialog.open(langx.assetContrast, '../AssetsContrast/loanContrast.html?PoolId=' + basePoolId, { Pool: ckdPool }, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 1000, 580, '', true, true, true, false);

}


//资产现金流归集向导
function OpenCollectionGuidePage() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var poolId = ckdPool.PoolId;
    var page = '/GoldenStandABS/www/assetFilter/calculatorDimensionality/collectionGuide.html?PoolId=' + poolId;
    openNewIframe(page, 'CollectionGuidePage' + poolId, langx.calculator + poolId);
}

//信用卡未偿本金拆分
function NoPrincipalSplit() {
   
    var poolId = basePoolId;
    var trustId;
    var poolName;
    var executeParam = { SPName: 'config.usp_GetPoolHeaderById', SQLParams: [] };
    executeParam.SQLParams.push({ Name: 'PoolId', Value: poolId, DBType: 'int' });

    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams=' + executeParams;

    CallWCFSvc(serviceUrl, false, 'GET', function (data) {
        var poolHeader = data[0];
        poolName = poolHeader.PoolDBName;
        trustId = poolHeader.DimSourceTrustID;
        poolId = poolHeader.ParentPoolId = 0 ? poolHeader.ParentPoolId : poolId;
    });
    var page = '/GoldenStandABS/www/assetFilter/CreditCardPrincipalSplit/CreditCardPrincipalSplit.html?PoolId=' + poolId + '&PoolName=' + poolName + '&trustId=' + trustId;
    openNewIframe(page, 'NoPrincipalSplit' + poolId, langx.NoPrincipalSplit + poolId);
}

function GeneratingAssets() {
    if (window.location.href.indexOf('basePoolContent') < 0) {
        GSDialog.HintWindow("此页面不能操作这个动作")
        return;
    }

    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var rcvData = GSDialog.getData();

    sVariableBuilder.AddVariableItem('PoolID', ckdPool.PoolId, 'Int', 1, 0);
    sVariableBuilder.AddVariableItem('HostUrl', GlobalVariable.SslHost, 'String', 1, 0);

    var sVariable = sVariableBuilder.BuildVariables();

    var tIndicator = new taskIndicator({
        width: 500,
        height: 550,
        clientName: 'TaskProcess',
        appDomain: 'ConsumerLoan',
        taskCode: 'PreSale_New',
        sContext: sVariable,
        callback: function () {
            //$('iframe[src*=basePoolContent]', parent.document)[0].contentWindow.location.reload(true);
            //$('.ab_close', parent.document)[0].click()
            sVariableBuilder.ClearVariableItem();
            RefreshBasePoolAF();
        }
    });

    tIndicator.show();
}
function PreSales() {
    if (window.location.href.indexOf('basePoolContent') < 0) {
        GSDialog.HintWindow("此页面不能操作这个动作")
        return;
    }

    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    if (ckdPool.PoolTypeId != 6) {
        //if (ckdPool.PoolTypeId == 5 || ckdPool.PoolTypeId == 4) {
        GSDialog.HintWindow("当前所选择的资产池不适用于该操作！")
        return;
    }
    if ($(".k-state-selected")[0].innerHTML.indexOf("<i>") < 0) {
        $($(".k-state-selected")[0]).append("<i style='padding:2px;position:relative;left:-20px;top:13px' class='fa fa-lock'><i>");
    }
    GSDialog.open(langx.fuc, '/GoldenStandABS/www/assetFilter/assignTrust/assignTrust.html'
    , { title: '', TaskCode: 'PreSale', Pool: ckdPool }
    , function (result) {
        if (result) {
            //window.location.reload();
        }
    }
    , 584, 180);
}
function DeleteAssetPool() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var taskCode, warnMsg;
    if (ckdPool.PoolTypeId == 4) {
        taskCode = 'JobRemove';
        GSDialog.HintWindowTF("此资产池集合将被永久删除，请再次确认？", function () {
            sVariableBuilder.AddVariableItem('PoolID', ckdPool.PoolId, 'String', 1, 0, 1);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'ConsumerLoan',
                taskCode: taskCode,
                sContext: sVariable,
                callback: function () {
                    //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                    window.location.reload();
                    sVariableBuilder.ClearVariableItem();
                }
            });
            tIndicator.show();
        })
    } else {
        taskCode = 'PoolRemove';
        GSDialog.HintWindowTF('此资产池及其子资产池将被永久删除，请再次确认？', function () {
            sVariableBuilder.AddVariableItem('PoolID', ckdPool.PoolId, 'String', 1, 0, 1);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'ConsumerLoan',
                taskCode: taskCode,
                sContext: sVariable,
                callback: function () {
                    //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                    window.location.reload();
                    sVariableBuilder.ClearVariableItem();
                }
            });
            tIndicator.show();
        })
    }
    //if ($($($(".k-state-selected")[0]).children().get(1))[0].innerHTML.indexOf("<i>") < 0) {
    //    $($($(".k-state-selected")[0]).children().get(1)).append("<i style='padding-left:3px' class='fa fa-lock'><i>");
    //}
    //tpi.AddVariableItem('PoolID', $('#txtPoolName').val(), 'String', 1, 1, 1);
}

function AssetPoolListReport() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var poolId = ckdPool.PoolId;
    var page = '/GoldenStandABS/www/assetFilter/poolDistributionReport/poolDistributionReport.html?PoolId=' + poolId;
    openNewIframe(page, 'Report' + poolId, langx.report + poolId);
}

function OpenCashflowSelecter() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var poolId = ckdPool.PoolId;
    var callApi = new CallApi('DAL_SEC_PoolConfig', 'dbo.[usp_GetPoolHeader]', true);
    callApi.AddParam({
        Name: 'PoolId',
        Value: poolId,
        DBType: 'int'
    });
    callApi.ExecuteDataSet(function (response) {
        var configInfo = response[0];
        if (configInfo) {
            var executeParam = {
                SPName: 'Trustmanagement.usp_VerifyScheduleIsExists',
                SQLParams: [
                    { Name: 'PoolId', value: poolId, DBType: 'string' }
                ]
            };
            var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonGetExecuteForPool?&connConfig=DAL_SEC_PoolConfig&";

            common.ExecuteGetData(false, serviceUrl, configInfo.PoolDBName, executeParam, function (data) {
                if (data[0].VerifyResult == 0) {
                    GSDialog.HintWindow('当前资产池没有可拼接的计划现金流');
                } else {
                    var page = '/GoldenStandABS/www/assetFilter/calculatorDimensionality/CashflowSelecter.html?PoolDBName=' + configInfo.PoolDBName + '&TrustId=' + configInfo.DimSourceTrustID + '&PoolId=' + configInfo.PoolId;
                    openNewIframe(page, 'CashflowSelecter' + poolId, langx.CashflowSelecter + poolId);
                };
            })
        }
    })
}

function OpenCashflowManagement() {
    //var ckdPool = GetCheckedPool();
    //if (!ckdPool) return;
    var poolId = basePoolId;
    var trustId;
    var dimReportingDateId;
    var executeParam = { SPName: 'config.usp_GetPoolHeaderById', SQLParams: [] };
    executeParam.SQLParams.push({ Name: 'PoolId', Value: poolId, DBType: 'int' });

    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams=' + executeParams;

    CallWCFSvc(serviceUrl, false, 'GET', function (data) {
        var poolHeader = data[0];
        poolCutId = poolHeader.PoolDBName;
        trustId = poolHeader.DimSourceTrustID;
        poolId = poolHeader.ParentPoolId = 0 ? poolHeader.ParentPoolId : poolId;
        dimReportingDateId = poolHeader.DimReportingDateID;
    });
    var page = '/GoldenStandABS/www/assetFilter/cashFlowSplit/CashflowSplit.html?tid=' + trustId + '&poolCutId=' + poolCutId + '&dimReportingDateId=' + dimReportingDateId + '&poolId=' + poolId;
    openNewIframe(page, 'CashflowSplit' + poolId, langx.CashflowSplit + poolId);
}

function ReimbursementManagement() {
    var trustId;
    var PoolDBName;
    var executeParam = { SPName: 'config.usp_GetPoolHeaderById', SQLParams: [] };
    executeParam.SQLParams.push({ Name: 'PoolId', Value: basePoolId, DBType: 'int' });

    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=DAL_SEC_PoolConfig&exeParams=' + executeParams;

    CallWCFSvc(serviceUrl, false, 'GET', function (data) {
        var poolHeader = data[0];
        PoolDBName = poolHeader.PoolDBName;
        trustId = poolHeader.DimSourceTrustID;
    });
    //TrustFollowUp / CashflowManagement / CashflowManagement_New.html
    var page = '/GoldenStandABS/www/productManage/TrustManagement/TrustFollowUp/CashflowManagement/CashflowManagement_New.html?enter=assets' + '&PoolDBName=' + PoolDBName + '&tid=' + trustId;
    //var page = '/GoldenStandABS/www/productManage/TrustManagement/TrustFollowUp/CashflowManagement/CashflowManagementMain.html?enter=assets' + '&PoolDBName=' + PoolDBName + '&tid=' + trustId;
    openNewIframe(page, 'ReimbursementManagement' + basePoolId, langx.ReimbursementManagement + basePoolId);
}

//function DistributionConfig() {
//    var ckdPool = GetCheckedPool();
//    if (!ckdPool) return;
//    var page = location.protocol + '//' + location.host + '/goldenstand/www/assetFilter/creditfactory/Reports/DistributionConfig.html?PoolId=' + ckdPool.PoolId;
//    //openNewIframe(page, '-1', '分布调整');
//    //common.showDialogPage(page, '分布调整', 900, 500, function () {
//    //affterClose();
//    //}, true, "", true, false);
//    var poolId = ckdPool.PoolId;
//    openNewIframe(page, 'Distribution' + poolId, langx.adjust + poolId);
//}

function DeleteAssetPoolList() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    if (window.location.href.indexOf('AssetPoolList') < 0) {
        GSDialog.HintWindow("此页面不能操作这个动作")
        return;
    }
    var taskCode, warnMsg;
    if (ckdPool.PoolTypeId == 4) {
        taskCode = 'JobRemove';
        GSDialog.HintWindowTF("此资产池集合将被永久删除，请再次确认？", function () {
            sVariableBuilder.AddVariableItem('PoolID', ckdPool.PoolId, 'String', 1, 0, 1);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'ConsumerLoan',
                taskCode: taskCode,
                sContext: sVariable,
                callback: function () {
                    //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                    window.location.reload();
                    sVariableBuilder.ClearVariableItem();
                }
            });
            tIndicator.show();
        })
    } else {
        taskCode = 'PoolRemove';
        GSDialog.HintWindowTF('此资产池及其子资产池将被永久删除，请再次确认？', function () {
            sVariableBuilder.AddVariableItem('PoolID', ckdPool.PoolId, 'String', 1, 0, 1);
            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'ConsumerLoan',
                taskCode: taskCode,
                sContext: sVariable,
                callback: function () {
                    //window.location.href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                    window.location.reload();
                    sVariableBuilder.ClearVariableItem();
                }
            });
            tIndicator.show();
        })
    }
    //if ($($($(".k-state-selected")[0]).children().get(1))[0].innerHTML.indexOf("<i>") < 0) {
    //    $($($(".k-state-selected")[0]).children().get(1)).append("<i style='padding-left:3px' class='fa fa-lock'><i>");
    //}
    //tpi.AddVariableItem('PoolID', $('#txtPoolName').val(), 'String', 1, 1, 1);
}


function RefreshBasePool() {
    window.location.reload();
}

function RefreshBasePoolAF() {
    window.location.reload();
}


///////////Others//////////////
function PoolProcess(poolId) {
    //window.open('PoolProcess.html?PoolId=' + poolId, '_blank');
    var page = '/GoldenStandABS/www/assetFilter/poolProcess/poolProcess.html?PoolId={0}'.format(poolId);
    var pollId = '{0}'.format(poolId + '_process');
    var tabName = langx.screen + poolId
    openNewIframe(page, pollId, tabName);
    //GSDialog.Open('资产切割', 'Pages/PoolProcess.html?PoolId=' + poolId, null, function (result) {
    //    if (result) {
    //        window.location.reload();
    //    }
    //}, 950, 550);
}

///////////Others//////////////
function PoolWebReport(poolId) {
    //window.open('PoolProcess.html?PoolId=' + poolId, '_blank');
    var page = '/GoldenStandABS/www/assetFilter/poolWebReport/poolWebReport.html?PoolId={0}'.format(poolId);
    var pId = '{0}'.format(poolId + '_poolWebReport');
    var tabName = langx.poolreport + poolId;
    openNewIframe(page, pId, tabName);
    //GSDialog.Open('资产切割', 'Pages/PoolProcess.html?PoolId=' + poolId, null, function (result) {
    //    if (result) {
    //        window.location.reload();
    //    }
    //}, 950, 550);
}

//////////Common Helper Methods/////////////
function GetCheckedPool() {
    //var $selectedItem=$('#divDataList input.datalist-item:checked');
    var Pool = getPoolHeader();
    //if (!$selectedItem || $selectedItem.length == 0) {
    //    alert('请选择需要操作的资产池！');
    //    return null;
    //}
    //var htmlPoolHeader = decodeURIComponent($selectedItem.attr('poolHeader'));
    return Pool;
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
            if (typeof response == 'string' && response != "")
                sourceData = JSON.parse(response);
            else
                sourceData = response;
            if (fnCallback) fnCallback(sourceData);
        },
        error: function (response) { GSDialog.HintWindow('Error occursed while requiring the remote source data!'); }
    });

    if (!isAsync) {
        return sourceData;
    }
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
        processData: false, // Don't process the files
        //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
        xhr: xhrOnProgress(function (e) {
            var percent = Math.floor(e.loaded / e.total * 100);
            if (percent > 0 && $(".progress").length != 0) {
                $(".progress").css("display", "block");
                $(".progress").find(".progress-bar").css("width", percent + "%");
                $(".progress").find(".progress-bar>span").html("" + percent + "%");
            }
            if (percent == 100) {
                $(".progress").css("display", "none");
            }
        }),
        success: function (response) {
            //上传至E:\\TSSWCFServices\\GoldenStandABS\\www\\basicAsset\\Files\
            var sourceData;
            if (typeof response == 'string')
                sourceData = JSON.parse(response);
            else
                sourceData = response;
            if (fnCallback) fnCallback(sourceData);
        },
        error: function (data) {
            GSDialog.HintWindow('文件上传失败!');
        }
    });
}

function SalesPool() {
    if (window.location.href.indexOf('basePoolContent') < 0) {//CreateSalesLoansProcess
        GSDialog.HintWindow("此页面不能操作这个动作")
        return;
    }
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    if (ckdPool.PoolTypeId == 20268 || ckdPool.PoolTypeId == 20269) {
        GSDialog.HintWindow("当前所选择的资产池不适用于该操作！")
        return;
    }
    var poolId = ckdPool.PoolId;
    var poolHeader;
    var dimAssetTypeId;

    //get trustid
    if ($(".k-state-selected")[0].innerHTML.indexOf("<i>") < 0) {
        $($(".k-state-selected")[0]).append("<i style='padding:2px;position:relative;left:-20px;top:13px' class='fa fa-lock'><i>");
    }
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

    sVariableBuilder.AddVariableItem('ParentPoolId', poolId, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('IsParent', 0, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('ActionPoolType', 'PoolSales', 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('DimOrganisationId', poolHeader[0].DimOrganisationID, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('DimAssetTypeID', dimAssetTypeId, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('DimReportingDateId', poolHeader[0].DimReportingDateID, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('ActionType', 1, 'String', 0, 0, 0);
    var sVariable = sVariableBuilder.BuildVariables();
    var tIndicator = new taskIndicator({
        width: 500,
        height: 550,
        clientName: 'TaskProcess',
        appDomain: 'ConsumerLoan',
        taskCode: 'CreateSalesLoansProcess',
        sContext: sVariable,
        callback: function () {
            sVariableBuilder.ClearVariableItem();
            refreshCurrentPage();
        }
    });
    tIndicator.show();
}
function AlternativePool() {
    if (window.location.href.indexOf('basePoolContent') < 0) {//CreateSalesLoansProcess
        GSDialog.HintWindow("此页面不能操作这个动作")
        return;
    }
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    if (ckdPool.PoolTypeId == 20268 || ckdPool.PoolTypeId == 20269) {
        GSDialog.HintWindow("当前所选择的资产池不适用于该操作！")
        return;
    }
    var poolId = ckdPool.PoolId;
    var poolHeader;
    var dimAssetTypeId;

    //get trustid
    if ($(".k-state-selected")[0].innerHTML.indexOf("<i>") < 0) {
        $($(".k-state-selected")[0]).append("<i style='padding:2px;position:relative;left:-20px;top:13px' class='fa fa-lock'><i>");
    }
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

    sVariableBuilder.AddVariableItem('ParentPoolId', poolId, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('IsParent', 0, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('ActionPoolType', 'PoolAlternative', 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('DimOrganisationId', poolHeader[0].DimOrganisationID, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('DimAssetTypeID', dimAssetTypeId, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('DimReportingDateId', poolHeader[0].DimReportingDateID, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('ActionType', 0, 'String', 0, 0, 0);
    var sVariable = sVariableBuilder.BuildVariables();
    var tIndicator = new taskIndicator({
        width: 500,
        height: 550,
        clientName: 'TaskProcess',
        appDomain: 'ConsumerLoan',
        taskCode: 'CreateAlternativeLoansProcess',
        sContext: sVariable,
        callback: function () {
            sVariableBuilder.ClearVariableItem();
            refreshCurrentPage();
        }
    });
    tIndicator.show();
}

function AssetOutInPool() {
    if (window.location.href.indexOf('basePoolContent') < 0) {
        GSDialog.HintWindow("此页面不能操作这个动作")
        return;
    }
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    //if (ckdPool.PoolTypeId == 20240) { //合并池不能出入池判断
    //    GSDialog.HintWindow('所选择的资产池不适用于该操作！');
    //    return;
    //}
    //debugger
    if ($(".k-state-selected")[0].innerHTML.indexOf("<i>") < 0) {
        $($(".k-state-selected")[0]).append("<i style='padding:2px;position:relative;left:-20px;top:13px' class='fa fa-lock'><i>");
    }
    var poolId = ckdPool.PoolId;
    var parentPoolId = common.getQueryString('PoolId');
    var page = '/GoldenStandABS/www/assetFilter/assetOutInPool/assetOutInPool.html?PoolId={0}&ParentPoolId={1}&TaskCode=PoolIncludeExcludeLoansProcess'.format(poolId, parentPoolId);
    //var pollId = '{0}'.format(AssetOutInPool);
    //var tabName = '资产出入池'
    //openNewIframe(page, pollId, tabName);

    //GSDialog.open('资产出入池', '/GoldenStandABS/www/assetFilter/html/AssetOutInPool.html'
    //, { title: '资产出入池', TaskCode: 'PoolIncludeExcludeLoansProcess', Pool: ckdPool }
    //, function (result) {
    //    if (result) {
    //        window.location.reload();
    //    }
    //}
    //, 600, 400);
    common.showDialogPage(page, '资产出入池', 600, 230, function () {
        //affterClose();
    }, true, "", true, false, false);
}

//资产池预销售
function PoolPreSales() {
    
}

function AssetPoolMerge() {
    if (window.location.href.indexOf('basePoolContent') < 0) {
        GSDialog.HintWindow('此页面不能操作这个动作');
        return;
    }
    var parentPoolId = common.getQueryString('PoolId');
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    //if (ckdPool.PoolTypeId == 20240) {
    //    alert('所选择的资产池不适用于该操作！');
    //    return;
    //}
    //if ($($($(".k-state-selected")[0]).children().get(1))[0].innerHTML.indexOf("<i>") < 0) {
    //    $($($(".k-state-selected")[0]).children().get(1)).append("<i style='padding-left:3px' class='fa fa-lock'><i>");
    //}
    var page = '/GoldenStandABS/www/assetFilter/assetPoolMerge/assetPoolMerge.html?PoolId={0}&TaskCode=PoolMergeProcess&ParentPoolId={1}'.format(ckdPool.PoolId, parentPoolId);
    common.showDialogPage(page, '资产池合并', 450, 170, function () {
        //affterClose();
    }, true, "", true, false, false);
    //GSDialog.open('资产池合并', '/GoldenStandABS/www/assetFilter/assetPoolMerge/assetPoolMerge.html'
    //, { title: '资产池合并', TaskCode: 'PreSale', PoolId: ckdPool.PoolId, ParentPoolId: parentPoolId}
    //, function (result) {
    //    if (result) {
    //        window.location.reload();
    //    }
    //}
    //, 600, 600);
}
//资产池分布调整
function DistributionConfig() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;

    var page = '/GoldenStandABS/www/assetFilter/creditfactory/Reports/DistributionConfig.html?PoolId=' + ckdPool.PoolId;
    //openNewIframe(page, '-1', '分布调整');
    //common.showDialogPage(page, '分布调整', 900, 500, function () {
    //affterClose();
    //}, true, "", true, false);
    var poolId = ckdPool.PoolId;
    openNewIframe(page, 'Distribution' + poolId, langx.pooladjust + poolId);
}

/*----------------------------------*/
/*------- 产品设计与发行功能  -------*/
/*----------------------------------*/
//资产池刷新
function AssetPoolRefresh() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var poolId = ckdPool.PoolId;
    var actionType = 'PoolRefresh';
    var poolHeader;
    var trustId;
    var dimAssetTypeId;

    // first up, get poolheader obj
    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
    var params = [
        ['PoolId', poolId, 'int']
    ];
    var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderById');
    promise().then(function (response) {
        if (typeof response === 'string') { poolHeader = JSON.parse(response); }
        else { poolHeader = response; }
    });
    trustId = parseInt(poolHeader[0].DimSourceTrustID);

    svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=dbo&executeParams=";
    promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderExtById');
    promise().then(function (response) {
        if (typeof response === 'string') { dimAssetTypeId = JSON.parse(response)[0].DimAssetTypeId; }
        else { dimAssetTypeId = response[0].DimAssetTypeId; }
    });

    // next, get avaiable dimreportingdateid
    var availableReportingDates;
    svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TaskProcess&appDomain=dbo&executeParams=";
    params = [
        ["TrustId", trustId, "int"]
    ];

    promise = webProxy.comGetData(params, svcUrl, 'usp_getAvailableReportingIdByTrustId');
    promise().then(function (response) {
        if (typeof response === 'string') { availableReportingDates = JSON.parse(response); }
        else { availableReportingDates = response; }
    });

    optViewModel.datesId().length = 0;
    $.each(availableReportingDates, function (k, v) {
        //datesModel.datesId.push(v.dimreportingdateid);
        optViewModel.datesId.push(v);
    });
    //default selected
    if (optViewModel.datesId().length > 0) {
        optViewModel.selectedDateId(optViewModel.datesId()[0].dimreportingdateid);
    }

    var content = $('#dates').clone(true);
    $.anyDialog({
        title: '选择日期',
        html: content.show(),
        height: 180,
        width: 350,
        changeallow: false,
        buttonGroup: [{
            text: '确定',
            event: function () {
                var _this = this;
                var selectDate = $('#dates select')[1].value;
                sVariableBuilder.AddVariableItem('ParentPoolId', poolId, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('IsParent', 0, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('ActionPoolType', 'PoolRefresh', 'string', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DimOrganisationId', poolHeader[0].DimOrganisationID, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DimAssetTypeID', dimAssetTypeId, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DimReportingDateId', selectDate, 'Int', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();

                var tIndicator = new taskIndicator({
                    width: 600,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'ConsumerLoan',
                    taskCode: 'PoolTargetRefresh',
                    sContext: sVariable,
                    callback: function () {
                        refreshCurrentPage();
                    }
                });
                tIndicator.show();
                _this.closePopup();
            }
        }],
        type: 'alert',
        scrollable: true,
        isMaskClickToClose: false,
        dragable: true,
    });
}

function refreshCurrentPage() {
    //var poolId = common.getQueryString('PoolId');
    //var iframeString = 'iframe[id={0}]'.format(poolId);
    //$(iframeString, parent.document)[0].contentWindow.location.reload(true);
    //if (window.kendouiGrid) {
    //    window.kendouiGrid.RefreshGrid();
    //}
    if (refreshKendouGrid) {
        refreshKendouGrid();
    }
}

//封包解包
function AssetPoolClose() {

    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var poolId = ckdPool.PoolId;
    $.anyDialog({
        title: '封包解包',
        height: 100,
        width: 350,
        changeallow: false,
        buttonGroup: [{
            text: '封包',
            event: function () {
                //封包
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=dbo&executeParams=";
                var params = [
                    ['PoolId', poolId, 'int'],
                ];

                var _this = this;
                var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeader');
                promise().then(function (response) {
                    var poolStatus;
                    if (typeof response === 'string') {
                        poolStatus = JSON.parse(response)[0].PoolStatusCode;
                    }
                    else {
                        poolStatus = response[0].PoolStatusCode;
                    }

                    if (poolStatus == 'OPEN') {
                        poolStatusChange(poolId, 'RESERVE');
                        _this.closePopup();
                    }
                    else if (poolStatus == 'RESERVE') {
                        GSDialog.HintWindow('尚未进行解包！');
                    } else {
                        GSDialog.HintWindow('无法进行封包');
                    }
                });

            }
        }, {
            text: '解包',
            event: function () {
                //解包
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=dbo&executeParams=";
                var params = [
                    ['PoolId', poolId, 'int'],
                ];

                var _this = this;
                var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeader');
                promise().then(function (response) {
                    var poolStatus;
                    if (typeof response === 'string') {
                        poolStatus = JSON.parse(response)[0].PoolStatusCode;
                    }
                    else {
                        poolStatus = response[0].PoolStatusCode;
                    }

                    if (poolStatus == 'RESERVE') {
                        poolStatusChange(poolId, 'OPEN');
                        _this.closePopup();
                    }
                    else if (poolStatus == 'OPEN') {
                        GSDialog.HintWindow('尚未进行封包！');
                    } else {
                        GSDialog.HintWindow('无法进行解包');
                    }
                });
            }
        }],
        type: 'confirm',
        scrollable: true,
        isMaskClickToClose: false,
        dragable: true
    });

}

//资产池销售
function AssetPoolSale() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var poolId = ckdPool.PoolId;
    $.anyDialog({
        title: '资产池销售',
        height: 100,
        width: 350,
        changeallow: false,
        buttonGroup: [{
            text: '销售',
            event: function () {
                //销售
                var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=dbo&executeParams=";
                var params = [
                    ['PoolId', poolId, 'int'],
                ];

                var _this = this;
                var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeader');
                promise().then(function (response) {
                    var poolStatus;
                    if (typeof response === 'string') {
                        poolStatus = JSON.parse(response)[0].PoolStatusCode;
                    }
                    else {
                        poolStatus = response[0].PoolStatusCode;
                    }

                    if (poolStatus == 'RESERVE') {
                        poolStatusChange(poolId, 'PUBLISH');
                        _this.closePopup();
                    }
                    else {
                        GSDialog.HintWindow('请先进行封包！');
                    }
                });
            }
        }, {
            text: '赎回',
            event: function () {
                //赎回
                var _this = this;
                poolStatusChange(poolId, 'RESERVE');
                _this.closePopup();
            }
        }],
        type: 'confirm',
        scrollable: true,
        isMaskClickToClose: false,
        dragable: true
    });
}

//项目计划书
function ProductDoc() {
    var ckdPool = GetCheckedPool();
    if (!ckdPool) return;
    var poolId = ckdPool.PoolId;
    var trustId; var trustName; var isExistsSP = 1;

    //get trustid
    if ($(".k-state-selected")[0].innerHTML.indexOf("<i>") < 0) {
        $($(".k-state-selected")[0]).append("<i style='padding:2px;position:relative;left:-20px;top:13px' class='fa fa-lock'><i>");
    }
    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
    var params = [
        ['PoolId', poolId, 'int']
    ];
    var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderById');
    promise().then(function (response) {
        if (typeof response === 'string') { trustId = JSON.parse(response)[0].DimSourceTrustID; }
        else { trustId = response[0].DimSourceTrustID; }
    });

    //get trustname
    svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";
    params = [
        ['TrustId', trustId, 'int']
    ];
    promise = webProxy.comGetData(params, svcUrl, 'usp_GetTrustByTrustId');
    promise().then(function (response) {
        if (typeof response === 'string') {
            trustName = JSON.parse(response)[0].TrustName;
            isExistsSP = JSON.parse(response)[0].IsExistsServiceProvider;
        }
        else {
            trustName = response[0].TrustName;
            isExistsSP = response[0].IsExistsServiceProvider;
        }
    });

    if (isExistsSP == 0) {//相关参与方不存在
        GSDialog.HintWindow('相关参与方未录入,无法生成项目计划书');
        return;
    }

    sVariableBuilder.AddVariableItem('DimReportingDateId', (new Date()).dateFormat('yyyyMMdd'), 'Int', 1, 0, 0);
    sVariableBuilder.AddVariableItem('TrustId', trustId, 'Int', 1, 0);
    sVariableBuilder.AddVariableItem('TrustName', trustName, 'String', 1, 0);
    sVariableBuilder.AddVariableItem('PoolID', poolId, 'Int', 1, 0);
    sVariableBuilder.AddVariableItem('TemplateFolder', webProxy.productDocRootPath + trustId, 'Int', 1, 0);
    sVariableBuilder.AddVariableItem('HostUrl', webProxy.baseUrl, 'String', 1, 0);

    var sVariable = sVariableBuilder.BuildVariables();

    var tIndicator = new taskIndicator({
        width: 600,
        height: 550,
        clientName: 'TaskProcess',
        appDomain: 'ConsumerLoan',
        taskCode: 'DocxCreation',
        sContext: sVariable,
        callback: function () {
            refreshCurrentPage();
        }
    });
    tIndicator.show();
}

function poolStatusChange(poolId, status) {
    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=dbo&executeParams=";
    var params = [
        ['PoolId', poolId, 'int'],
        ['PoolStatus', status, 'string']
    ];

    var promise = webProxy.comGetData(params, svcUrl, 'usp_UpdatePoolStatus');
    promise().then(function (response) {
        refreshCurrentPage();
    });
}

/*--------------------------------*/

function getPoolHeader() {
    //if (gridDomId) {
    //    var grid = $("#" + gridDomId).data("kendoExtGrid");
    //} else {

    //}
    var grid = $("#grid").data("kendoExtGrid") ? $("#grid").data("kendoExtGrid") : $("#grid", parent.document).data("kendoExtGrid");
    if (grid.select().length != 2) {
        GSDialog.HintWindow('请选择要操作的资产池');
    } else {
        //var dataRows = grid.items();
        //// 获取行号
        //var rowIndex = dataRows.index(grid.select());
        // 获取行对象
        var data = grid.dataItem(grid.select());
        return data;
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
    }
}
