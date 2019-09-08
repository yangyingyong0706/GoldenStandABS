var GSDialog;
var webProxy;

define(function (require) {
    var $ = require('jquery');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages')
    webProxy = require('gs/webProxy');
})

function getLangtli() {

    var webStorage = require('gs/webStorage');
    var langtli = {};
    var userLanguage = webStorage.getItem('userLanguage');


    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langtli.select = 'Please select an item';
        langtli.ProductCreation = 'Product Creation';
        langtli.ProductMaintain = 'Product Maintain_';
        langtli.reportGuide = 'Report Guide';
        langtli.Explorer = 'Explorer_';
        langtli.Revolving = 'Revolving_';
        langtli.Designing = "Designing";
        langtli.approveprocess = "Approval Process";
        langtli.delete = "You don't need it?";
        langtli.Transactioncashflow = 'Transaction Cash Flow';
        langtli.CashFlowAllocationData = 'Cash Flow Allocation Data';
        langtli.CashFlowForecastModel = 'Cash Flow Forecast Model';
        langtli.ProFolloManagement = 'ProFollo Management_';
        langtli.OrininatorManagement = 'Orininator Management_';
        langtli.CashflowManagement = 'Cashflow Management'
        langtli.CyclesManage = 'CyclesManage';
        langtli.AssetTransfer = 'AssetTransfer';
        langtli.Redemptions = 'Redemptions';
        langtli.AssetServicesReport = 'AssetServicesReport';
        langtli.AssetManageNewRules = 'AssetManageNewRules';
        langtli.InvestManagement = 'InvestManagement_';
        langtli.Repurchase = "Repurchase_"
        langtli.FlowChart = 'FlowChart';
        langtli.FlowChartSinger = 'FlowChart';
        langtli.GenerationReport = 'GenerationReport';
        langtli.fileManagement = 'FileManagement';
        langtli.SubscriberManagement = 'SubscriberManagement';
        langtli.BeneficialTransfer = 'Beneficial transfer';

    } else {
        langtli.select = '请选择要操作的数据！';
        langtli.ProductCreation = '新建产品向导';
        langtli.ProductMaintain = '产品维护_';
        //langtli.ProductMaintain = '产品信息维护_';
        langtli.reportGuide = '存续报告向导_';   
        langtli.Explorer = '文档管理_';
        langtli.Revolving = '循环购买_';
        langtli.Designing = '设计中';
        langtli.approveprocess = "审批流程";
        langtli.delete = '确定要删除吗?';
        langtli.Transactioncashflow = '交易现金流';
        //langtli.CashFlowAllocationData = '收益分配历史数据_';
        langtli.CashFlowAllocationData = '收益历史_';
        langtli.CashFlowForecastModel = '现金流预测模型';
        langtli.ProFolloManagement = '底部管理_';
        //langtli.ProFolloManagement = '底部资产管理:';
        langtli.OrininatorManagement = '权益管理_';
        //langtli.OrininatorManagement = '原始权益人管理_';
        langtli.CashflowManagement = '回款核对_'
        //langtli.CashflowManagement = '回款管理_'
        langtli.CyclesManage = '循环任务_';
        langtli.AssetServicesReport = '资产服务报告_';
        langtli.AssetTransfer = '资产转让_';
        langtli.Redemptions = '资产赎回_';
        langtli.Repurchase="清仓回购_"
        //langtli.CyclesManage = '循环购买任务';
        langtli.AssetManageNewRules = '资管新规';
        langtli.InvestManagement = '投资管理_';
        langtli.FlowChart = '流动视图_';
        langtli.FlowChartSinger = '流动视图_';
        langtli.GenerationReport = '生成报告';
        langtli.fileManagement = '文档管理_';
        langtli.SubscriberManagement = '认购人信息管理';
    }


    return langtli;



}


/*
function trustAction() {
    //var grid = $("#" + gridDomId).data("kendoExtGrid");
    var langtli = getLangtli();
    var grid = $("#grid").data("kendoExtGrid");
    if (grid.select().length != 2) {
        GSDialog.HintWindow(langtli.select);
    } else {
        //// 获取行对象
        var data = grid.dataItem(grid.select());
        return data;
    }
        }
*/

//产品管理获取TrustId方法
function trustAction2(callback) {
    var langtli = getLangtli();
    var $ = require('jquery');
    var grid = $("#" + gridDomId).data("kendoExtGrid");
    
    if (grid.select().length != 2) {
        GSDialog.HintWindow(langtli.select);
    } else {
        var dataRows = grid.items();
        // 获取行号
        var rowIndex = dataRows.index(grid.select());
        // 获取行对象
        var data = grid.dataItem(grid.select());
        callback(data);
    }
}

//压力测试获取TrustId
function getTrustId() {
    var langtli = getLangtli();
    var grid = $("#grid").data("kendoExtGrid");
    if (grid.select().length != 2) {
            GSDialog.HintWindow(langtli.select);
        }
   else {
            //// 获取行对象
            var data = grid.dataItem(grid.select());
            if (!data.TrustId) return;
            return data.TrustId;
        } 
}

//新建产品
function AddTrust() {
    var GlobalVariable = require('globalVariable');
    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/NewProduct/viewTrust_New.html?tid=0";
    var pollId = '{0}_AddTrust';
    var langtli = getLangtli();
    var tabName = langtli.ProductCreation;
    console.log(tabName, self);
    openNewIframe(page, pollId, tabName);
    //});


}
//管理产品
var viewModel = {};
//var SPState;
function ProPermissionOp(tid, ResData, langtli) {
    require(['globalVariable'], function (GlobalVariable) {
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=" + tid + "&productPermissionState=" + ResData;
        var pollId = '{0}_mangeTrust'.format(tid);
        var tabName = langtli.ProductMaintain + tid;
        openNewIframe(page, pollId, tabName);
    });

}
function MangeTrust() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var CreateName = data.UserName;
        var $ApproveState = data.ApproveState;
        var permission = require('gs/permission');
        var webStorage = require('gs/webStorage');
        var userName = webStorage.getItem('gs_UserName');
        //SPState = data.SpecialPlanState;
        permission.productPermission(tid, userName, productPermissionData)
        function productPermissionData(res) {
            //res==1,可编辑
            //res==2,只读(已发行)、如果产品状态是设计中则是直接可编辑
            //res==3,修改时间不在时间段内,可重新修改或者是只读产品信息
            //var SPStates=SPState == '设计中' || SPState == langtli.Designing
            //if (SPStates) {
            //            ProPermissionOp(tid, 1, langtli);
            //}else{
            switch (res) {
                case "1":
                    ProPermissionOp(tid, res, langtli);
                    break;
                case "2":
                    ProPermissionOp(tid, res, langtli);
                    break;
                case "3":
                    if (confirm("不在约定的修改期限内,如需修改,请重新申请")) {
                        require(['gs/uiFrame/js/gs-admin-2.pages', 'globalVariable'], function (adminDiaLog, GlobalVariable) {
                            adminDiaLog.open(
                                    langtli.approveprocess,
                        GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/ApprovalProcess/ApprovalProcess.html?userName={0}&TrustId={1}&Applicant={2}&ApproveState={3}'.format(CreateName, tid, userName, $ApproveState),
                            ' ',
                                    function () { },
                        '560px',
                                    '440px', ' ', ' ', '', ' '
                                    )
                        })
                    } else {
                        ProPermissionOp(tid, 2, langtli)
                    }
                    break;
                default:
                    ProPermissionOp(tid, 1, langtli)
            }
        }
        //};
    })
}

//产品发行文档管理
function DocumentManagement() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/documentManagement/viewTrust.html?tid=" + tid;
        var pollId = '{0}_documentManagement'.format(tid);
        var tabName = langtli.Explorer + tid;
        openNewIframe(page, pollId, tabName);
    });
}
//关联产品
function SelectProduct() {     
    var GlobalVariable = require('globalVariable');
    var ProjectId = webStorage.getItem('ProjectId')
    //GSDialog.open('选择产品', GlobalVariable.TrustManagementServiceHostURL + 'projectStage/ProjectApproval/SelectProduct.html?ProjectId=' + ProjectId, function (res) {
    //    location.reload()
    //}, 900, 500);
    var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/projectStage/ProjectApproval/SelectProduct.html?ProjectId=' + ProjectId;
    openNewIframe(tarpage, 'FlowChart', '选择产品');
}
//报告向导
function ReportManagement() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var tCode = data.TrustCode;    
        var GlobalVariable = require('globalVariable');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/reportGuide/reportGuide.html?trustId=" + tid + "&&TrustCode=" + tCode + '&reportEntry=guide';
        var pollId = '{0}_reportGuide'.format(tid);   
        var tabName = langtli.reportGuide + tid;
        openNewIframe(page, pollId, tabName);
    });
}

//文档管理
function FileManagement() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var tCode = data.TrustCode;
        var GlobalVariable = require('globalVariable');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/fileManagement/fileManagement.html?trustId=" + tid;
        var pollId = '{0}_fileManagement'.format(tid);
        var tabName = langtli.fileManagement + tid;
        openNewIframe(page, pollId, tabName);
    });
}

function GetTrustItemByTrustId(trustid, callback) {

    var GlobalVariable = require('globalVariable');
    var config = {
        tmsSessionServiceBase: GlobalVariable.TrustManagementServiceUrl,
    };

    var sContent = "{'SPName':'usp_GetTrustInfoFromWizard','Params':{" +
                "'TrustId':'" + trustid +
                "'}}";
    //TODO YANGYINGYONG 需要的unicode转码信息
    sContent=encodeURIComponent(sContent);
    var serviceUrl = config.tmsSessionServiceBase + "GetItemsPlus?applicationDomain=TrustManagement&contextInfo=" + sContent;
    $.ajax({
        type: "GET",
        url: serviceUrl,
        async: false,
        dataType: "jsonp",
        crossDomain: true,

        contentType: "application/json;charset=utf-8",
        success: function (response) {
            //callBack(response);
            //TrustInfo = response;
            //console.table(response);
            //console.table(response);
            $.each(response, function (i, e) {
                if (e['ItemCode'] == 'IsTopUpAvailable') {
                    if (e['ItemValue'] == "1") {
                        var passign = true;
                        callback(passign);
                    } else {
                        var passign = false;
                        callback(passign)
                    }


                }

            })
        },
        error: function (response) { GSDialog.HintWindow("error:" + response); }
    });
}

//循环购买
function RevolvePurchase() {

    trustAction2(function (data) {
        var langtli = getLangtli();
        var trustId = data.TrustId;
        var page = webProxy.baseUrl + '/GoldenStandABS/www/productManage/TrustManagement/revolvePurchase/revolvePurchase.html?TrustId={0}'.format(trustId);
        var passsign;
        GetTrustItemByTrustId(trustId, function (val) {
            if (trustId && val == true) {
                console.log(val);
                openNewIframe(page, trustId + '_revolvePurchase', langtli.Revolving + trustId);
            } else {
                GSDialog.HintWindow("请先确认该产品支持循环购买！")
            }
        });

    });
}

//循环购买任务
function CyclesManage() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var trid = data.TrustId;
        var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/productManage/TrustManagement/TaskList/RecyclingPurchase.html?taskCode=TaskListTaskCode&trustId={0}'.format(trid);
        GetTrustItemByTrustId(trid, function (val) {
            if (trid && val == true) {
                openNewIframe(tarpage, trid + '_CyclesManage', langtli.CyclesManage + trid);
            } else {
                GSDialog.HintWindow("请先确认该产品支持循环购买！")
            }
        });

    })
}
////资产转让
//function AssetTransfer() {
//    trustAction2(function (data) {
//        var langtli = getLangtli();
//        var trid = data.TrustId;
//        var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/transactionManage/assetTransfer/viewAssetTransfer.html?tid={0}'.format(trid);
//        GetTrustItemByTrustId(trid, function (val) {
//            openNewIframe(tarpage, trid + '_AssetTransfer', langtli.AssetTransfer + trid);
//        });

//    })
//}

////资产赎回
//function Redemptions() {
//    trustAction2(function (data) {
//        var langtli = getLangtli();
//        var trid = data.TrustId;
//        var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/transactionManage/assetRedemption/viewAssetRedemption.html?tid={0}'.format(trid);
//        GetTrustItemByTrustId(trid, function (val) {
//            openNewIframe(tarpage, trid + '_Redemptions', langtli.Redemptions + trid);
//        });

//    })
//}

//资管新规
function AssetManageNewRules() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var trid = data.TrustId;
        var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/productManage/TrustManagement/AssetManageNewRules/AssetManageNewRules.html?taskCode=ExecuteAssetTask&trustId={0}'.format(trid);
        GetTrustItemByTrustId(trid, function (val) {          
            openNewIframe(tarpage, trid + '_AssetManageNewRules', langtli.AssetManageNewRules + trid);
        });

    })

}
//资管服务报告
function AssetServicesReport() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var trid = data.TrustId;
        var TrustCode = data.TrustCode;
        var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/productManage/reportGuide/reportGuide.html?reportEntry=guide&taskCode={0}&trustId={1}'.format(TrustCode, trid);
        GetTrustItemByTrustId(trid, function (val) {
            openNewIframe(tarpage, trid + '_AssetServicesReport', langtli.AssetServicesReport + trid);
        });

    })

}
//清仓回购
function Repurchase() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var trid = data.TrustId;
        var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/transactionManage/clearanceBuyBack/viewClearanceBuyBack.html?tid={0}'.format(trid);
        GetTrustItemByTrustId(trid, function (val) {
            openNewIframe(tarpage, trid + '_Repurchase', langtli.Repurchase + trid);
        });

    })

}
//流动视图
function FlowChart() {
        var langtli = getLangtli();
        var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/productManage/TrustManagement/flowChart/diagram.html';
            openNewIframe(tarpage,'FlowChart', langtli.FlowChart);

}
//选择单个专项计划流动视图
function FlowChartSinger() {
    //todo 选择单个专项计划
    trustAction2(function (data) {
        var trid = data.TrustId;
        var langtli = getLangtli();
        var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/productManage/TrustManagement/flowChart/diagram.html?trustId=' + trid;
        GetTrustItemByTrustId(trid, function (val) {
            openNewIframe(tarpage, trid + '_FlowChartSinger', langtli.FlowChartSinger + trid);
        })
        
    });
}
//生成报告
function GenerationReport() {
    trustAction2(function (data) {
        var trid = data.TrustId;
        var langtli = getLangtli();
        var webStorage = require('gs/webStorage');
        var tarpage = webProxy.baseUrl + '/GoldenStandABS/www/productManage/reportGuide/reportGuide.html?trustId=' + trid + '&reportEntry=report';
        GetTrustItemByTrustId(trid, function (val) {
            openNewIframe(tarpage, trid + '_GenerationReport', langtli.GenerationReport + trid);
        })
    });
}
function Open_WorkBench() {
    trustAction2(function (data) {
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

    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        GSDialog.HintWindowTF(langtli.delete, function () {
            require(['goldenstand/taskProcessIndicator', 'goldenstand/sVariableBuilder', 'goldenstand/webProxy', 'common'], function (taskIndicator, sVariableBuilder, webProxy, common) {
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
                        self.location.reload();
                    }
                });
                tIndicator.show();
            });
        })
    });
}
//文档管理
function ProductFilesManage() {
    var langtli = getLangtli();
    var GlobalVariable = require('globalVariable');
    var $ = require('jquery');
    var grid = $("#" + gridDomId).data("kendoExtGrid");
    var dataRows = grid.items();
    // 获取行号
    var rowIndex = dataRows.index(grid.select());
    // 获取行对象
    var data = grid.dataItem(grid.select());
    //console.table(data);
    //console.table("firdcol");
    var tcode = grid.select().length == 2 ? data.TrustCode : '';
    var page = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/Dashboard/DashboardList.html?TaskCode=' + tcode;   
    trustAction2(function (data) {
        var tid = data.TrustId;
        var tabName = langtli.Explorer + tid;
        openNewIframe(page, tcode, tabName);
    })
}
//收益分配计算
function TrustCollectionPickerPage() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //require(['gs/uiFrame/js/gs-admin-2.pages'], function (GSDialog) {
        //    GSDialog.open(langtli.Transactioncashflow, GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustCollectionPicker/TrustCollectionPicker.html?TrustId=' + tid + '&taskCode=TrustWaterfall&IsDlg=1&random=' + Math.random(), { a: 1, b: 2 }, function (res) {
        //        //alert(res);
        //    }, 600, 340);

        //});
        GSDialog.open(langtli.Transactioncashflow, GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustCollectionPicker/TrustCollectionPicker.html?TrustId=' + tid + '&taskCode=TrustWaterfall&IsDlg=1&random=' + Math.random(), { a: 1, b: 2 }, function (res) {
            //alert(res);
        }, 600, 340);
    });
}

//文档对比
function ProductDiff() {
    //trustAction2(function (data) {
    var GlobalVariable = require('globalVariable');
    //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/ProductDiff/ProductDiff.html";

    var tabName = '文档对比';
    openNewIframe(page, 0, tabName);
    //});
}

//收益分配历史数据
function ViewIncomeDistributionHistoryData() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/IncomeDistributionHistoryData/IncomeDistributionHistoryData.html?tid=" + tid;        
        var pollId = '{0}_ViewIncomeDistributionHistoryData'.format(tid);
        var tabName = langtli.CashFlowAllocationData + tid;
        console.log(tabName, self);
        openNewIframe(page, pollId, tabName);
        //window.open(GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/IncomeDistributionHistoryData/IncomeDistributionHistoryData.html?tid=" + tid, '_blank');
        //require(['gsAdminPages'], function (GSDialog) {
        //    GSDialog.open(langtli.CashFlowAllocationData + '-' + tid, GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/IncomeDistributionHistoryData/IncomeDistributionHistoryData.html?tid=" + tid, { a: 1, b: 2 }, function (res) {
        //    },"","","bigwindow",false,false);

        //});
    });
}

//产品收益分配模型
var OpenCashflow = function () {
    trustAction2(function (data) {
        var tcode = data.TrustCode;
        var GlobalVariable = require('globalVariable');
        window.open(GlobalVariable.CashFlowEngineServiceHostURL + "UITaskStudio/index.html?appDomain=Task&taskCode=" + tcode, '_blank');
    });
}
//添加现金流模型ribbon
var OpenCashflowAddMessage = function () {
    trustAction2(function (data) {
        var tcode = data.TrustCode
        var GlobalVariable = require('globalVariable');
        window.open(GlobalVariable.CashFlowEngineServiceHostURL + "UITaskStudio/index.html?appDomain=Task&taskCode=" + (tcode + '_Cashflow'), '_blank');
    });
}
//现金流预测结果
var ShowCashFlowResult = function () {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        require(['gsAdminPages'], function (GSDialog) {
            GSDialog.open(langtli.CashFlowForecastModel, GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/CashFlowResult/CashFlowResult.html?trustId=" + tid, { a: 1, b: 2 }, function (res) {
            }, 1000, 500);
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
    trustAction2(function (data) {
        var langtli = getLangtli();
        console.log(data);
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustFollowUp/AssetDetailList.html?tid=" + tid;
        var trustId = '{0}_assetDetail'.format(tid);
        var tabName = langtli.ProFolloManagement + tid;
        openNewIframe(page, trustId, tabName);
    });
}

//原始权益人管理
function OriginalOwner() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustFollowUp/OriginalOwnerList/OriginalOwnerList.html?tid=" + tid;
        var trustId = '{0}_OriginalOwner'.format(tid);
        var tabName = langtli.OrininatorManagement + tid;
        openNewIframe(page, trustId, tabName);
    });
}

//回款管理
function CashflowManagement() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustFollowUp/CashflowManagement/CashflowManagementMain.html?tid=" + tid;
        var trustId = '{0}_CashflowManagement'.format(tid);
        var tabName = langtli.CashflowManagement + tid;
        openNewIframe(page, trustId, tabName);
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
            sVariableBuilder.ClearVariableItem();
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

function StressTest() {
    trustAction2(function (data) {
        var trustId = data.TrustId;
        var page = webProxy.baseUrl + '/GoldenStandABS/www/productDesign/stresstest/stresstest.html?TrustId={0}'.format(trustId);
        if (trustId) {
            openNewIframe(page, trustId + '_stress', '压力测试_' + trustId);
        }
        else {
            //alert('此页面无法进行压力测试！')
            return;
        }

    });

}
//合格投资人管理
function InvestManagement() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/InvestManagement/InvestManagement_New.html?tid=" + tid;
        var trustId = tid + '_InvestManagement_New';//'{0}_investManagement'.format(tid);
        var tabName = langtli.InvestManagement + tid;
        openNewIframe(page, tid, tabName);
    });
}
//认购人信息管理
function SubscriberInfo() {
    trustAction2(function (data) {
        var langtli = getLangtli();
        var tid = data.TrustId;
        var GlobalVariable = require('globalVariable');
        var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/RegulatoryCompliance/SubscriberInfo/SubscriberManagement.html?tid=" + tid;
        var trustId = tid + '_SubscriberManagement';
        var tabName = langtli.SubscriberManagement+'_' + tid;
        openNewIframe(page, tid, tabName);
    });
}
