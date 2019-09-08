var GSDialog = '';
var GlobalVariable;
var webProxy;
var taskIndicator;
var sVariableBuilder;
var common;
var webStorage;
var langx = {};
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
    taskIndicator = require('gs/taskProcessIndicator');
    sVariableBuilder = require('gs/sVariableBuilder');

    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.Projectindex = 'ProjectIndex'
        langx.Projectall = 'Projectall'
        langx.ProjectApproval = 'ProjectApproval',
        langx.ProjectAdd = 'ProjectAdd'
        langx.IssuePreparation = 'IssuePreparation'
        langx.AssetScreening = 'AssetScreening'
        langx.ProductDesign = 'ProductDesign'
        langx.ProductDefend = 'ProductDefend'
        langx.ProjectSetup = 'ProjectSetup'
        langx.PoolSales = 'PoolSales'
        langx.PoolPacket = 'PoolPacket'
        langx.ProgramPlan = 'ProgramPlan'
        langx.PoolCutUpdate = 'PoolCutUpdate'
        langx.TermProject = 'TermProject'
        langx.CircularBuying = 'CircularBuying'
        langx.EndofProject = 'EndofProject'
        langx.Repurchase = 'Repurchase'
        langx.ProjectSource = "ProjectSource"
        langx.AssetServicesReport = 'AssetServicesReport'
        langx.Revolving = 'Revolving'
        langx.CyclesManage = 'CyclesManage'
        langx.CyclesManageProjections = 'CyclesManageProjections'
        langx.QuickStressTest = 'QuickStressTest'
        langx.StressTest = 'StressTest'
        langx.TransactionManage = 'TransactionManage'
        langx.Accounting = 'Accounting'
        langx.Financialreport = 'Financialreport'
        langx.LastStage = 'LastStage'
        langx.NextStage = 'NextStage'
        langx.Explorer = 'Explorer'
        langx.ProjectStatusHistory = 'ProjectStatusHistory'
        langx.ProjectAssetImport = 'ProjectAssetImport'
        langx.RecyclingListForProject = 'RecyclingListForProject'
        langx.PrijectListForProject = 'PrijectListForProject'
    } else {
        langx.Projectindex = '项目总览'
        langx.Projectall = '项目一览'
        langx.ProjectApproval = '项目立项'
        langx.ProjectAdd = '新建项目'
        langx.IssuePreparation = '发行准备'
        langx.AssetScreening = '资产筛选'
        langx.ProductDesign = '产品设计'
        langx.ProductDefend = '产品维护'
        langx.ProjectSetup = '项目成立'
        langx.PoolSales = '资产池销售'
        langx.PoolPacket = '资产池封包'
        langx.ProgramPlan = '项目计划书'
        langx.PoolCutUpdate = '资产池更新'
        langx.TermProject = '项目存续'
        langx.CircularBuying = '循环购买'
        langx.EndofProject = '项目结束'
        langx.Repurchase = '清仓回购'
        langx.EditProject = '编辑项目'
        langx.Explorer= '发行文档管理'
        langx.AssetTransfer = "资产转让"
        langx.Redemptions = "资产赎回"
        langx.ProjectSource = "项目资源"
        langx.ProjectAssetImport = '资产导入及校验'
        langx.AssetServicesReport = '资产服务报告'
        langx.Revolving = '循环购买向导'
        langx.CyclesManage = '循环购买任务单'
        langx.CyclesManageProjections = '循环购买金额测算'
        langx.QuickStressTest = '快速压力测试'
        langx.StressTest = '压力测试'
        langx.TransactionManage = '交易管理'
        langx.Accounting = '会计核算'
        langx.Financialreport = '财务报告'
        langx.LastStage = '上一阶段'
        langx.NextStage = '下一阶段'
        langx.ProjectStatusHistory = '项目状态记录查询'
        langx.RecyclingListForProject = '循环购买流程任务单'
        langx.PrijectListForProject = '项目文档任务单'
    }

});
function trustAction(callback) {
    var $ = require('jquery');
    var grid = $("#grid").data("kendoExtGrid");
    if (grid.select().length == 0) {
        GSDialog.HintWindow('请选择项目！');
    } else {
        var dataRows = grid.items();
        // 获取行号
        var rowIndex = dataRows.index(grid.select());
        // 获取行对象
        var data = grid.dataItem(grid.select());
        callback(data);
    }
}
////任务单支持函数
function GetTaskListDetail(appDomain, sessionVariables, taskCode, call) {
    var wProxy = webProxy;
    var sContext = {
        appDomain: appDomain,
        sessionVariables: sessionVariables,
        taskCode: taskCode
    };
    var isOver = 0;
    wProxy.createSessionByTaskCode(sContext, function (response) {
        call(response)
    });

}


function TaskListshowDialogPage(url, title, width, height, scrolling, fnCallBack) {
    $.anyDialog({
        width: width,
        height: height,
        title: title,
        url: url,
        scrolling: scrolling,
        onClose: function () {
            if (fnCallBack) { fnCallBack(); }
            else {
                //location.reload(); 
            }
        }
    });
}

////////

function StatusChange(PID, Pdes, operate, callback) {
    var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
    executeParam = {
        SPName: "dbo.usp_StageQuicklyChange",
        SQLParams: [
            { 'Name': 'projectid', 'Value': PID, 'DBType': 'int' },
            { 'Name': 'Statusdes', 'Value': Pdes, 'DBType': 'string' },
            { 'Name': 'operate', 'Value': operate, 'DBType': 'string' },
            { 'Name': 'username', 'Value': webStorage.getItem('gs_UserName'), 'DBType': 'string' }
        ]
    };
    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
        var enter;
        var tabname



        switch (data[0].result) {
            case 1:
                enter = "ProjectApproval"
                tabname = langx.ProjectApproval
                break;
            case 2:
                enter = "IssuePreparation"
                tabname = langx.IssuePreparation
                break;
            case 3:
                enter = "ProjectSetup"
                tabname = langx.ProjectSetup
                break;
            case 4:
                enter = "TermProject"
                tabname = langx.TermProject
                break;
            case 5:
                enter = "EndofProject"
                tabname = langx.EndofProject
                break;
        }
        if (enter && data[0].result) {
            callback(tabname, enter, data[0].result);
        } else {
            GSDialog.HintWindow('状态变更错误！');
        }


    });

}
//下一阶段
function NextStage() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var StatusDes = data.StatusDesc;
        var status = common.getQueryString('enter');
        var ProjectIdEX = status + "_" + ProjectId;
        var pass = true;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
           executeParam = {
               SPName: "dbo.usp_WKStatusConfirm",
               SQLParams: [
               { 'Name': 'ProjectId', 'Value': ProjectIdEX, 'DBType': 'string' }
               ]
           };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (!data[0].result) {
                var WKid = data[0].WKid
                var WKtype = data[0].WKtype
                var WorkFLowID = data[0].WorkFLowID
                pass = false;
                var url = GlobalVariable.WorkflowBase + '?objId=' + WKid + '&objType=' + WKtype + '&workFlowId=' + WorkFLowID;
                GSDialog.open('工作流操作', url, '', function () {
                    //检测目标值
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                      executeParam = {
                          SPName: "dbo.usp_WKStatusConfirm",
                          SQLParams: [
                          { 'Name': 'ProjectId', 'Value': ProjectIdEX, 'DBType': 'string' }
                          ]
                      };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                        if (data[0].result == '1') {

                            StatusChange(ProjectId, StatusDes, 'Next', function (tabname, enter, data) {
                                var index = ""
                                var arry = $("body", window.parent.document).find("#DashBoard li").eq(2).find("a");
                                $.each(arry, function (i, v) {
                                    if ($(v).hasClass("active")) {
                                        index = parseInt(i) + 1 > 4 ? 4 : parseInt(i) + 1;
                                        console.log(index)
                                    }
                                })
                                $(arry[index]).find("i").trigger("click");
                                $(arry[index]).addClass("active");
                                $(arry[index]).siblings().removeClass("active")
                            })
                        }

                    })


                }, 800, 500);
            }
        })
        if (!pass) {
            return false;
        }

        StatusChange(ProjectId, StatusDes, 'Next', function (tabname, enter, data) {
            var index = ""
            var arry = $("body", window.parent.document).find("#DashBoard li").eq(2).find("a");
            $.each(arry, function (i, v) {
                if ($(v).hasClass("active")) {
                    index = parseInt(i) + 1 > 4 ? 4 : parseInt(i) + 1;
                    console.log(index)
                }
            })
            $(arry[index]).find("i").trigger("click");
            $(arry[index]).addClass("active");
            $(arry[index]).siblings().removeClass("active")
        })

    });

}

//上一阶段
function LastStage() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var StatusDes = data.StatusDesc;
        var status = common.getQueryString('enter');
        var ProjectIdEX = status + "_" + ProjectId;
        var pass = true;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
           executeParam = {
               SPName: "dbo.usp_WKStatusConfirm",
               SQLParams: [
               { 'Name': 'ProjectId', 'Value': ProjectIdEX, 'DBType': 'string' }
               ]
           };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (!data[0].result) {//result不存在
                var WKid = data[0].WKid
                var WKtype = data[0].WKtype
                var WorkFLowID = data[0].WorkFLowID
                pass = false;
                var url = GlobalVariable.WorkflowBase + '?objId=' + WKid + '&objType=' + WKtype + '&workFlowId=' + WorkFLowID;
                GSDialog.open('工作流操作', url, '', function () {
                    //检测目标值
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                      executeParam = {
                          SPName: "dbo.usp_WKStatusConfirm",
                          SQLParams: [
                          { 'Name': 'ProjectId', 'Value': ProjectIdEX, 'DBType': 'string' }
                          ]
                      };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                        if (data[0].result == '1') {

                            StatusChange(ProjectId, StatusDes, 'Next', function (tabname, enter, data) {
                                var index = ""
                                var arry = $("body", window.parent.document).find("#DashBoard li").eq(2).find("a");
                                $.each(arry, function (i, v) {
                                    if ($(v).hasClass("active")) {
                                        index = parseInt(i) + 1 > 4 ? 4 : parseInt(i) + 1;
                                        console.log(index)
                                    }
                                })
                                $(arry[index]).find("i").trigger("click");
                                $(arry[index]).addClass("active");
                                $(arry[index]).siblings().removeClass("active")
                            })
                        }

                    })

                }, 800, 500);
            }
        })
        if (!pass) {
            return false;
        }

        StatusChange(ProjectId, StatusDes, 'Last', function (tabname, enter, data) {
            var index = ""
            var arry = $("body", window.parent.document).find("#DashBoard li").eq(2).find("a");
            $.each(arry, function (i, v) {
                if ($(v).hasClass("active")) {
                    index = parseInt(i) - 1 < 0 ? 0 : parseInt(i) - 1;
                    console.log(index)
                }
            })
            $(arry[index]).find("i").trigger("click");
            $(arry[index]).addClass("active");
            $(arry[index]).siblings().removeClass("active")

        })

    });

}

//项目状态记录查询
function ProjectStatusHistory() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var StatusDes = data.StatusDesc;
        common.showDialogPage(GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectSource/ProjectStageHistory.html?ProjectId=" + ProjectId, '状态记录', 1200, 640, function () {

        });


    });


}

////循环购买流程任务单_old
//function RecyclingListForProject() {
//    trustAction(function (data) {
//        var ProjectId = data.ProjectId;
//        var StatusDes = data.StatusDesc;
//        var RecyclingListItem = {
//            "TaskListName": langx.RecyclingListForProject,
//            //"TasklListType": "RecyclingListForProject",
//            "TaskCode": "RecyclingListForProject",
//            "ScenarioCode": "RecyclingList"
//        }

//        var TrustId, TrustCode;
//        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
//            executeParam = {
//                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
//                SQLParams: [
//                    { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
//                ]
//            };
//        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
//            if (data[0]) {
//                TrustId = data[0].TrustId;
//                TrustCode = data[0].TrustCode;
//        var TaskCode = RecyclingListItem.TaskCode
//                sVariableBuilder.AddVariableItem('TaskCode', RecyclingListItem.TaskCode, 'String', 1, 1, 1);
//        var sVariable = sVariableBuilder.BuildVariables();
//        GetTaskListDetail('Task', sVariable, TaskCode, function (sessionid) {
//            var pageUrl = '../StageList/TaskList.html?appDomain=Task&Taskinfo={0}&ScenarioCode={1}&TaskType={2}&TrustId={3}&tid={4}&ProjectId={5}';
//            pageUrl = pageUrl.format(sessionid, RecyclingListItem.ScenarioCode, RecyclingListItem.TaskCode, TrustId, TrustId, ProjectId);
//            TaskListshowDialogPage(pageUrl, '任务列表', 1000, 630);
//        })

//            } else {
//                GSDialog.HintWindow('当前项目没有产品！')
//            }
//        });









//    });


//}


//循环购买流程任务单
function RecyclingListForProject() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var StatusDes = data.StatusDesc;
        var TrustId, TrustCode;
        var RecyclingListItem = {
            "TaskListName": langx.RecyclingListForProject,
            //"TasklListType": "RecyclingListForProject",
            "TaskCode": "RecyclingListForProject",
            "ScenarioCode": "RecyclingList"
        }
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
        executeParam = {
            SPName: "TrustManagement.usp_getTrustIdFromProjectId",
            SQLParams: [
            { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0]) {
                    TrustId = data[0].TrustId;
                    GetTrustItemByTrustId(TrustId, function (val) {
                        if (TrustId && val == true) {
                            TrustCode = data[0].TrustCode;
                            var pageUrl = '../StageList/RecyclingPurchase.html?TrustId={0}&tid={1}&ProjectId={2}&taskCode={3}&trustId={4}&ScenarioCode={5}';
                            pageUrl = pageUrl.format(TrustId, TrustId, ProjectId, RecyclingListItem.TaskCode, TrustId, RecyclingListItem.ScenarioCode);
                            TaskListshowDialogPage(pageUrl, '任务列表', 1300, 630, false);
                        } else {
                            GSDialog.HintWindow("请确认产品支持循环购买！");
                        }
                    })
                } else {
                    GSDialog.HintWindow("请绑定产品！");
                }
            } else {
                GSDialog.HintWindow("请绑定产品！");
            }
        });
    })


}









//项目文档任务单
function PrijectListForProject() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var StatusDes = data.StatusDesc;
        var TrustId, TrustCode;
        var RecyclingListItem = {
            "TaskListName": langx.PrijectListForProject,
            //"TasklListType": "AssetReportCaculationImcome",
            "TaskCode": "PrijectListForProject",
            "ScenarioCode": "RecyclingDocList"
        }
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
        executeParam = {
            SPName: "TrustManagement.usp_getTrustIdFromProjectId",
            SQLParams: [
            { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0]) {
                    TrustId = data[0].TrustId;
                    TrustCode = data[0].TrustCode;
                    var pageUrl = '../StageList/RecyclingPurchase.html?TrustId={0}&tid={1}&ProjectId={2}&taskCode={3}&trustId={4}&ScenarioCode={5}';
                    pageUrl = pageUrl.format(TrustId, TrustId, ProjectId, RecyclingListItem.TaskCode, TrustId, RecyclingListItem.ScenarioCode);
                    TaskListshowDialogPage(pageUrl, '任务列表', 1300, 630, false);
                } else {
                    GSDialog.HintWindow("请绑定产品！");
                }
            } else {
                GSDialog.HintWindow("请绑定产品！");
            }
        });


    });


}


/*
function trustAction2(callback) {
    var webStorage = require('gs/webStorage');
    var alertmsg = '请选择要操作的数据';
    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        alertmsg = 'Please select on item';
    }

    var $ = require('jquery');
    var grid = $("#grid").data("kendoExtGrid");
    if (grid.select().length != 1) {
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
*/
//项目总览
function ProjectIndex() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectIndex.html";
    var pollId = 'iframeMainContent';
    var tabName = langx.Projectindex;
    openNewIframeProject(page, pollId, tabName);
}
//项目一览
function ProjectAll() {
    webStorage.setItem('showId', 'productManage');
    var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectAll.html?refresh=refresh";
    var pollId = 'iframeMainContentAll';
    var tabName = langx.Projectall;
    openNewIframeProject(page, pollId, tabName);
}
//交易管理
function TransactionManage() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/TM_Common/trustList/TrustList.html";
    //transactionManage / TM_Common / trustList / TrustList.html
    // "transactionManage/index.html";
    var pollId = 'TransactionManage';
    var tabName = langx.TransactionManage;
    openNewIframeProject(page, pollId, tabName);
}
//会计核算
function Accounting() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "accounting/index.html";
    var pollId = 'Accounting';
    var tabName = langx.Accounting;
    openNewIframeProject(page, pollId, tabName);
}
//财务报告
function Financialreport() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "financialReport/Reporting.html";
    var pollId = 'Financialreport';
    var tabName = langx.Financialreport;
    openNewIframeProject(page, pollId, tabName);
}
//项目立项      
function ProjectApproval() {
    webStorage.setItem('showId', 'productManage');
    var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectApproval.html?enter=ProjectApproval&refresh=refresh";
    var pollId = '{0}_ProjectApproval';
    var tabName = langx.ProjectApproval;
    openNewIframeProject(page, pollId, tabName);
}
//新建项目
function AddProject() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectAdd.html";
    var pollId = '{0}_ProjectAdd';
    var tabName = langx.ProjectAdd;
    openNewIframeProject(page, pollId, tabName);
}
//编辑项目
function EditProject() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectAdd.html?enter=EditProject&ProjectId=" + ProjectId;
        var pollId = '{0}_EditProject' + ProjectId;
        var tabName = langx.EditProject + '_' + ProjectId;
        openNewIframeProject(page, pollId, tabName);
    });
}
//删除项目
function DeleteProject() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        GSDialog.HintWindowTF('确定删除项目吗？', function () {
            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_DeleteProject",
                SQLParams: [
                               { 'Name': 'projectId', 'Value': ProjectId, 'DBType': 'string' }
                ]
            };
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                if (data) {
                    location.reload()
                }
            });
        })
    });
}

//资产导入及校验
function ProjectAssetImport() {
    GSDialog.open(langx.ProjectAssetImport, GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectAssetImport.html", null, function (result) {
        if (result) {
            window.location.reload();
        }
    }, 950, 650, "", "", true, "", false);
}

//项目资源
function ProjectSource() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectSource/ProjectSource.html?ProjectId=" + ProjectId;
        var pollId = '{0}_ProjectSource' + ProjectId;
        var tabName = langx.ProjectSource + '_' + ProjectId;
        openNewIframeProject(page, pollId, tabName);
    });
}

//工作流配置
function WorkflowConfiguration() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var status = common.getQueryString('enter');
        ProjectId = status + "_" + ProjectId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
        executeParam = {
            SPName: "dbo.usp_WKisbuild",
            SQLParams: [
                { 'Name': 'ProjectId', 'Value': ProjectId, 'DBType': 'string' },
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data[0].result == '0') {
                var page = GlobalVariable.WorkflowConfig + '?ProjectID=' + ProjectId;
                window.open(page, "_blank")
            } else if (data[0].WorkFLowID) {
                var WKid = data[0].WorkFLowID;
                var WKtype = data[0].WKtype;
                var page = GlobalVariable.WorkflowConfig + '?WorkFLowID=' + WKid + '&WorkFlowCode=' + WKtype + '&ProjectID=' + ProjectId;
                window.open(page, "_blank")
            } else {
                var WKid = data[0].WKid;
                var WKtype = data[0].WKtype;
                var workFlowId = data[0].WorkFLowID;
                var page = GlobalVariable.WorkflowBase + '?objId=' + WKid + '&objType=' + WKtype + '&workFlowId=' + workFlowId;
                window.open(page, "_blank")
            }
        })
    });
}
//报告向导
function ReportManagement() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var TrustCode;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    TrustCode = data[0].TrustCode;
                    var GlobalVariable = require('globalVariable');
                    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/reportGuide/reportGuide.html?trustId=" + TrustId + "&&TrustCode=" + TrustCode + '&reportEntry=guide';
                    var pollId = '{0}_reportGuide'.format(TrustId);
                    var tabName = '报告向导_' + TrustId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//收益分配计算
function TrustCollectionPickerPage() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var GlobalVariable = require('globalVariable');
                    GSDialog.open('交易现金流', GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustCollectionPicker/TrustCollectionPicker.html?TrustId=' + TrustId + '&taskCode=TrustWaterfall&IsDlg=1&random=' + Math.random(), { a: 1, b: 2 }, function (res) {
                    }, 600, 350,"",true,true,true,false);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        })
       
    });
}
//收益分配历史数据
function ViewIncomeDistributionHistoryData() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
           executeParam = {
               SPName: "TrustManagement.usp_getTrustIdFromProjectId",
               SQLParams: [
                              { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
               ]
           };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var GlobalVariable = require('globalVariable');
                    GSDialog.open('收益分配历史数据', GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/IncomeDistributionHistoryData/IncomeDistributionHistoryData.html?tid=" + TrustId, { a: 1, b: 2 }, function (res) {
                    }, 768, 600,'bigwindow',true, true, true, false);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        })
       
    });
}
//前期接触沟通
function PreliminaryContact() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var GlobalVariable = require('globalVariable');
                    var url = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/StageList/RecyclingPurchase.html?TrustId=" + TrustId + "&tid=" + TrustId + "&trustId=" + TrustId + "&ProjectId=" + ProjectId + "&taskCode=PrijectListForProject&ScenarioCode=RecyclingDocList";
                    GSDialog.open('前期接触沟通_' + ProjectId, url, '', '', 1300, 600, '', true, true, true, false)
                   
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//方案设计
function Projectdesign() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var GlobalVariable = require('globalVariable');
                    var url = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/StageList/RecyclingPurchase.html?TrustId=" + TrustId + "&tid=" + TrustId + "&trustId=" + TrustId + "&ProjectId=" + ProjectId + "&taskCode=PrijectListForProject&ScenarioCode=RecyclingDocList";
                    GSDialog.open('方案设计_' + ProjectId, url, '', '', 1300, 600, '', true, true, true, false)

                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}

//产品发行文档管理
function DocumentManagement() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var GlobalVariable = require('globalVariable');
                    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/documentManagement/viewTrust.html?tid=" + TrustId;
                    var pollId = '{0}_documentManagement'.format(TrustId);
                    var tabName = langtli.Explorer + TrustId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//申报合规意见书
function ComplianceReport() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var GlobalVariable = require('globalVariable');
                    var url = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/StageList/RecyclingPurchase.html?TrustId=" + TrustId + "&tid=" + TrustId + "&trustId=" + TrustId + "&ProjectId=" + ProjectId + "&taskCode=PrijectListForProject&ScenarioCode=RecyclingDocList";
                    GSDialog.open('申报合规意见书_' + ProjectId, url, '', '', 1300, 600, '', true, true, true, false)

                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//证券路演及销售
function SecuritiesRoadshowSales() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var GlobalVariable = require('globalVariable');
                    var url = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/StageList/RecyclingPurchase.html?TrustId=" + TrustId + "&tid=" + TrustId + "&trustId=" + TrustId + "&ProjectId=" + ProjectId + "&taskCode=PrijectListForProject&ScenarioCode=RecyclingDocList";
                    GSDialog.open('证券路演及销售_' + ProjectId, url, '', '', 1300, 600, '', true, true, true, false)

                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//产品备案挂牌
function ProductListing() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var GlobalVariable = require('globalVariable');
                    var url = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/StageList/RecyclingPurchase.html?TrustId=" + TrustId + "&tid=" + TrustId + "&trustId=" + TrustId + "&ProjectId=" + ProjectId + "&taskCode=PrijectListForProject&ScenarioCode=RecyclingDocList";
                    GSDialog.open('产品备案挂牌_' + ProjectId, url, '', '', 1300, 600, '', true, true, true, false)

                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//计划募集成立
function EstablishPlannedFundraising(){
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var GlobalVariable = require('globalVariable');
                    var url = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/StageList/RecyclingPurchase.html?TrustId=" + TrustId + "&tid=" + TrustId + "&trustId=" + TrustId + "&ProjectId=" + ProjectId + "&taskCode=PrijectListForProject&ScenarioCode=RecyclingDocList";
                    GSDialog.open('计划募集成立_' + ProjectId, url, '', '', 1300, 600, '', true, true, true, false)

                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//发行准备      
function IssuePreparation() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectApproval.html?enter=IssuePreparation";
    var pollId = '{0}_IssuePreparation';
    var tabName = langx.IssuePreparation;
    openNewIframeProject(page, pollId, tabName);
}
//资产筛选      
function AssetScreening() {
    trustAction(function (data) {
        webStorage.setItem('showId', 'projectManage');
        var ProjectId = data.ProjectId;
        var page = GlobalVariable.TrustManagementServiceHostURL + "components/assetPoolList/AssetPoolList.html?enter=projectManage&ProjectId=" + ProjectId;
        var pollId = '{0}_AssetScreening' + ProjectId;
        var tabName = langx.AssetScreening + '_' + ProjectId;
        openNewIframeProject(page, pollId, tabName);
    });
}
//产品设计      
function ProductDesign() {
    trustAction(function (data) {
        webStorage.setItem('showId', 'IssuePreparation');
        var ProjectId = data.ProjectId;
        var page = GlobalVariable.TrustManagementServiceHostURL + "components/assetPoolList/AssetPoolList.html?enter=projectManage&status=all&ProjectId=" + ProjectId;
        var pollId = '{0}_ProductDesign' + ProjectId;
        var tabName = langx.ProductDesign + '_' + ProjectId;
        openNewIframeProject(page, pollId, tabName);
    });
}
//产品维护     
function ProductDefend() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    webStorage.setItem('showId', 'productManage');
                    TrustId = data[0].TrustId;
                    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?ProjectId=" + ProjectId + "&tid=" + TrustId + '&productPermissionState=1';
                    var pollId = '{0}_ProductDefend' + ProjectId;
                    var tabName = langx.ProductDefend + '_' + ProjectId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
        //www/productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=1381&productPermissionState=1

    });
}
//压力测试     
function StressTest() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    webStorage.setItem('showId', 'productDesign');
                    TrustId = data[0].TrustId;
                    var page = GlobalVariable.TrustManagementServiceHostURL + "productDesign/stresstest/stresstest.html?ProjectId=" + ProjectId + "&TrustId=" + TrustId;
                    var pollId = '{0}_StressTest' + ProjectId;
                    var tabName = langx.StressTest + '_' + ProjectId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//快速压力测试     
function QuickStressTest() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    webStorage.setItem('showId', 'productDesign');
                    TrustId = data[0].TrustId;
                    var page = GlobalVariable.TrustManagementServiceHostURL + "productDesign/quickStresstest/stresstest.html?ProjectId=" + ProjectId + "&TrustId=" + TrustId;
                    var pollId = '{0}_QuickStressTest' + ProjectId;
                    var tabName = langx.QuickStressTest + '_' + ProjectId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//项目成立      
function ProjectSetup() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectApproval.html?enter=ProjectSetup";
    var pollId = '{0}_ProjectSetup';
    var tabName = langx.ProjectSetup;
    openNewIframeProject(page, pollId, tabName);
}
//资产池销售   
function PoolSales() {
    trustAction(function (data) {
        webStorage.setItem('showId', 'productDesign');
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0]) {
                    TrustId = data[0].TrustId;
                    var page = GlobalVariable.TrustManagementServiceHostURL + "assetFilter/basePoolContentKendo/basePoolContent.html?enter=projectManage&ProjectId=" + ProjectId + "&tid=" + TrustId;
                    var pollId = '{0}_PoolSales' + ProjectId;
                    var tabName = langx.PoolSales + '_' + ProjectId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//资产池封包   
function PoolPacket() {
    trustAction(function (data) {
        webStorage.setItem('showId', 'productDesign');
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var page = GlobalVariable.TrustManagementServiceHostURL + "assetFilter/basePoolContentKendo/basePoolContent.html?enter=projectManage&ProjectId=" + ProjectId + "&tid=" + TrustId;
                    var pollId = '{0}_PoolPacket' + ProjectId;
                    var tabName = langx.PoolPacket + '_' + ProjectId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//项目计划书   
function ProgramPlan() {
    trustAction(function (data) {
        webStorage.setItem('showId', 'productDesign');
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0]) {
                    TrustId = data[0].TrustId;
                    var page = GlobalVariable.TrustManagementServiceHostURL + "assetFilter/basePoolContentKendo/basePoolContent.html?enter=projectManage&ProjectId=" + ProjectId + "&tid=" + TrustId;
                    var pollId = '{0}_ProgramPlan' + ProjectId;
                    var tabName = langx.ProgramPlan + '_' + ProjectId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }

        });
    });
}
//资产池更新     
function PoolCutUpdate() {
    trustAction(function (data) {
        webStorage.setItem('showId', 'productDesign');
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                               { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    TrustId = data[0].TrustId;
                    var page = GlobalVariable.TrustManagementServiceHostURL + "assetFilter/basePoolContentKendo/basePoolContent.html?enter=projectManage&ProjectId=" + ProjectId + "&tid=" + TrustId;
                    var pollId = '{0}_AssetScreening' + ProjectId;
                    var tabName = langx.PoolCutUpdate + '_' + ProjectId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}
//项目存续      
function TermProject() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectApproval.html?enter=TermProject";
    var pollId = '{0}_TermProject';
    var tabName = langx.TermProject;
    openNewIframeProject(page, pollId, tabName);
}
//循环购买跳转   
function CircularBuying() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var page = GlobalVariable.TrustManagementServiceHostURL + "components/trustList/TrustList.html?enter=projectManage&ProjectId=" + ProjectId + "&state=TermProject";
        var pollId = '{0}_ProductDesign' + ProjectId;
        var tabName = langx.CircularBuying + '_' + ProjectId;
        openNewIframeProject(page, pollId, tabName);
    });
}

//资管服务报告
function AssetServicesReport() {
    trustAction(function (data) {
        webStorage.setItem('showId', 'productDesign');
        var ProjectId = data.ProjectId;
        var TrustId, TrustCode;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                    { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0]) {
                    TrustId = data[0].TrustId;
                    TrustCode = data[0].TrustCode;
                    var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/reportGuide/reportGuide.html?reportEntry=guide&TrustCode=" + TrustCode + "&trustId=" + TrustId;
                    var pollId = '{0}_AssetServicesReport' + ProjectId;
                    var tabName = langx.AssetServicesReport + '_' + ProjectId;
                    openNewIframeProject(page, pollId, tabName);
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    })

}
//清仓回购
function Repurchase() {
    trustAction(function (data) {
        webStorage.setItem('showId', 'productDesign');
        console.log(data);
        var ProjectId = data.ProjectId;
        var TrustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                    { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function () {
            if (ProjectId) {
                var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/clearanceBuyBack/viewClearanceBuyBack.html?tid=" + ProjectId;
                var pollId = '{0}_Repurchase' + ProjectId;
                var tabName = langx.Repurchase + '_' + ProjectId;
                openNewIframeProject(page, pollId, tabName);
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });

    })
}
//判断是否支持循环购买
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
function RevolvePurchaseForProject() {

    trustAction(function (data) {
        webStorage.setItem('showId', 'productDesign');
        var ProjectId = data.ProjectId;
        var trustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                    { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    trustId = data[0].TrustId;
                    GetTrustItemByTrustId(trustId, function (val) {
                        if (trustId && val == true) {
                            var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/revolvePurchase/revolvePurchase.html?TrustId=" + trustId;
                            var pollId = '{0}_revolvePurchase' + ProjectId;
                            var tabName = langx.Revolving + '_' + ProjectId;
                            openNewIframeProject(page, pollId, tabName);
                        } else {
                            GSDialog.HintWindow("请先确认该产品支持循环购买！")
                        }
                    });

                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}

//循环购买金额测算
function CyclesManageProjections() {

    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var TrustId;
        var TrustCode
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                    { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0]) {
                    TrustId = data[0].TrustId;
                    GetTrustItemByTrustId(TrustId, function (val) {
                        if (TrustId && val == true) {
                            TrustCode = data[0].TrustCode;
                            var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TrustCollectionPicker/TrustCollectionPicker.html?taskCode=TrustWaterfall&TrustId=" + TrustId + "&TrustCode=" + TrustCode;
                            //var pollId = '{0}_CyclesManage' + ProjectId;
                            //var tabName = langx.CyclesManage + '_' + ProjectId;
                            //openNewIframeProject(page, pollId, tabName);

                            common.showDialogPage(page, '循环购买金额测算', 1000, 540, function () {
                            });
                        }
                        else {
                            GSDialog.HintWindow("请先确认该产品支持循环购买！")
                        }
                    })
                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    })
}
//循环购买测算结果查询
function CyclesManageResult() {

    trustAction(function (data) {
        //webStorage.setItem('showId', 'productDesign');
        var ProjectId = data.ProjectId;
        var trustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                    { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    trustId = data[0].TrustId;
                    GetTrustItemByTrustId(trustId, function (val) {
                        if (trustId && val == true) {
                            var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/IncomeDistributionHistoryData/IncomeDistributionHistoryData.html?tid=" + trustId;
                            var pollId = '{0}_ViewIncomeDistributionHistoryData' + ProjectId;
                            var tabName = '测算结果_' + ProjectId;
                            openNewIframeProject(page, pollId, tabName);
                        } else {
                            GSDialog.HintWindow("请先确认该产品支持循环购买！")
                        }
                    });

                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    });
}

//循环购买任务单
function CyclesManageForProject() {
    trustAction(function (data) {
        webStorage.setItem('showId', 'productDesign');
        var ProjectId = data.ProjectId;
        var trustId;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                SQLParams: [
                    { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data != null && data.length > 0) {
                if (data[0].TrustId) {
                    trustId = data[0].TrustId;
                    GetTrustItemByTrustId(trustId, function (val) {
                        if (trustId && val == true) {
                            var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/TaskList/RecyclingPurchase.html?taskCode=TaskListTaskCode&trustId=" + trustId;
                            var pollId = '{0}_CyclesManage' + ProjectId;
                            var tabName = langx.CyclesManage + '_' + ProjectId;
                            openNewIframeProject(page, pollId, tabName);
                        } else {
                            GSDialog.HintWindow("请先确认该产品支持循环购买！")
                        }
                    });

                } else {
                    GSDialog.HintWindow('当前项目没有产品！')
                }
            } else {
                GSDialog.HintWindow('当前项目没有产品！')
            }
        });
    })
}
//项目结束     
function EndofProject() {
    var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectApproval.html?enter=EndofProject";
    var pollId = '{0}_EndofProject';
    var tabName = langx.EndofProject;
    openNewIframeProject(page, pollId, tabName);
}

//资产转让
function AssetTransfer() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/assetTransfer/viewAssetTransfer.html?tid=" + ProjectId + "&isproject=1";
        var pollId = '{0}_AssetTransfer' + ProjectId;
        var tabName = langx.AssetTransfer + '_' + ProjectId;
        openNewIframeProject(page, pollId, tabName);
    });
}

//资产赎回
function Redemptions() {
    trustAction(function (data) {
        var ProjectId = data.ProjectId;
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/assetRedemption/viewAssetRedemption.html?tid=" + ProjectId + "&isproject=1";
        var pollId = '{0}_Redemptions' + ProjectId;
        var tabName = langx.Redemptions + '_' + ProjectId;
        openNewIframeProject(page, pollId, tabName);
    })
}
//信托对价分配
function viewAllocationTrust() {
    trustAction(function (data) {
        var webStorage = require('gs/webStorage');
        var tabName = '信托对价分配记录:';
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            tabName = 'Allocation Trust List:';
        }
        var tid = data.ProjectId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/allocationTrust/viewAllocationTrust.html?tid=" + tid;
        var pollId = '{0}viewAllocationTrust'.format(tid);
        tabName += tid;
        openNewIframeProject(page, pollId, tabName);
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
    });
}
//资产回收
function viewAssetRecovery() {
    trustAction(function (data) {
        var webStorage = require('gs/webStorage');
        var tabName = '资产回收:';
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            tabName = 'Asset Recovery List:';
        }
        var tid = data.ProjectId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/assetRecovery/viewAssetRecovery.html?tid=" + tid;
        var pollId = '{0}viewAssetRecovery'.format(tid);
        tabName += tid;
        openNewIframeProject(page, pollId, tabName);
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
    });
}
//资产回收上划
function viewBuyBack() {
    trustAction(function (data) {
        var webStorage = require('gs/webStorage');
        var tabName = '资产回收上划记录:';
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            tabName = 'Buy Back List:';
        }
        var tid = data.ProjectId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/buyBack/viewBuyBack.html?tid=" + tid;
        var pollId = '{0}viewBuyBack'.format(tid);
        tabName += tid;
        openNewIframeProject(page, pollId, tabName);
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
    });
}
//资产回收转付
function viewRecoveryTransfer() {
    trustAction(function (data) {
        var webStorage = require('gs/webStorage');
        var tabName = '资产回收转付记录:';
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            tabName = 'Recovery Transfer List:';
        }
        var tid = data.ProjectId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/recoveryTransfer/viewRecoveryTransfer.html?tid=" + tid;
        var pollId = '{0}viewRecoveryTransfer'.format(tid);
        tabName += tid;
        openNewIframeProject(page, pollId, tabName);
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
    });
}
//回购上划管理
function viewRecycleMark() {
    trustAction(function (data) {
        var webStorage = require('gs/webStorage');
        var tabName = '回购上划管理:';
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            tabName = 'Recycle Mark List:';
        }
        var tid = data.ProjectId;
        var GlobalVariable = require('globalVariable');
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust.html?tid=' + tid, '_blank');
        var page = GlobalVariable.TrustManagementServiceHostURL + "transactionManage/recycleMark/viewRecycleMark.html?tid=" + tid;
        var pollId = '{0}viewRecycleMark'.format(tid);
        tabName += tid;
        openNewIframeProject(page, pollId, tabName);
        //window.open(GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=' + tid, '_blank');
    });
}
////清仓回购跳转      
//function Repurchase() {
//    trustAction(function (data) {
//        var ProjectId = data.ProjectId;
//        var page = GlobalVariable.TrustManagementServiceHostURL + "components/trustList/TrustList.html?enter=projectManage&ProjectId=" + ProjectId + "&state=EndofProject";
//        var pollId = '{0}_AssetRepurchase';
//        var tabName = langx.Repurchase;
//        openNewIframeProject(page, pollId, tabName);
//    });
//}
function openNewIframeProject(page, trustId, tabName, cb) {
    var pass = true;
    parent.viewModel.tabs().forEach(function (v, i) {
        if (v.id == trustId) {
            if (cb != 1) {
                pass = false;
                parent.viewModel.changeShowId(v);
                return false;
            }

        }
    })
    if (pass) {
        var newTab = {
            id: trustId,
            url: page,
            name: tabName,
            disabledClose: false
        };
        if (page.indexOf('ProjectApproval.html') > -1 || page.indexOf('TM_Common') > -1 || page.indexOf('accounting') > -1 || page.indexOf('financialReport') > -1) {
            newTab.disabledClose = true;
        }
        if (page.indexOf('ProjectApproval.html') > -1 || page.indexOf('ProjectIndex.html') > -1 || page.indexOf('TM_Common') > -1 || page.indexOf('accounting') > -1 || page.indexOf('financialReport') > -1 || page.indexOf('ProjectAll.html') > -1) {
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
        if (tabName == "新建项目") {
            var btn = $('.chrome-tabs-shell', parent.document).find(".chrome-tab-current").find(".chrome-tab-close");
            btn.click(function () {
                webStorage.removeItem('ProjectId');
            })
        }
        if (tabName.indexOf("编辑项目") > -1 || tabName.indexOf("新建项目") > -1) {
            var btn = $('.chrome-tabs-shell', parent.document).find(".chrome-tab-current").find(".chrome-tab-close");
            btn.click(function () {
                $('iframe[src*=refresh]', parent.document)[0].contentWindow.location.reload(true);
            })
        }
    };
}






