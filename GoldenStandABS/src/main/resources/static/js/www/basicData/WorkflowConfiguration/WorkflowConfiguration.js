define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');

    require('gs/globalVariable');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    require('app/components/trustList/js/wcfProxy');

    require('app/components/trustList/js/trustList_Interface');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var tm = require('gs/childTabModel');
    var GlobalVariable = require('gs/globalVariable');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var appName = webStorage.getItem('showId');
    var common = require('common');

    webProxy = require('gs/webProxy');
    require('jquery.localizationTool');
    require('bootstrap');

    $('#selectLanguageDropdown_qcl').localizationTool({
        'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
        'ignoreUnmatchedSelectors': true,
        'showFlag': true,
        'showCountry': false,
        'showLanguage': true,
        'onLanguageSelected': function (languageCode) {

            webStorage.setItem('userLanguage', languageCode);
            return true;
        },
        'strings': {
            'id:select1': {
                'en_GB': 'Continuing Report'
            },
            'id:select2': {
                'en_GB': 'office automation'
            },
            'id:select3': {
                'en_GB': 'Income distribution and results'
            },

            'id:select4': {
                'en_GB': 'Special plan management'
            }
        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();

    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage');
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.ProjectId = 'ProjectId';
        lang.ProjectName = 'ProjectName';
        lang.ProjectShortName = 'ProjectShortName';
        lang.ProjectType = 'ProjectType';
        lang.ChargeUserName = 'ChargeUserName';
        lang.DurationChargeUserName = 'DurationChargeUserName';
        lang.ProjectModel = 'ProjectModel';
        lang.ProjectAlert = 'ProjectAlert';
        lang.AssetCount = 'AssetCount';
        lang.WKstatus = 'WorkFlowStatus';
        lang.ProductCount = 'ProductCount'

    }
    else {
        lang.ProjectId = '项目编号';
        lang.ProjectName = '项目名称';
        lang.ProjectShortName = '项目简称';
        lang.ProjectType = '项目阶段';
        lang.ChargeUserName = '项目负责人';
        lang.DurationChargeUserName = '存续期负责人';
        lang.ProjectModel = '项目管理模式';
        lang.ProductID = '标识';
        lang.ProjectAlert = '预警状态'
        lang.AssetCount = '资产池数量';
        lang.WKstatus = '工作流状态';
        lang.ProductCount = '产品数量'


    }

    var isAdmin = false;

    var filter = '';
    var height = $(window).height() - 100;
    //产品操作状态
    this.PerationState = function (ApproveState, SpecialPlanState, opId) {
        if (SpecialPlanState == lang.published && opId == 2) {
            if (ApproveState == 'NotTrial') {
                return ApproveStates = lang.approving;
            } else if (ApproveState == 'Agree') {
                return ApproveStates = lang.approved;
            } else if (ApproveState == 'Disagree') {
                return ApproveStates = lang.Reject;
            } else {
                return " "
            }
        } else {
            return " "
        }
    }
    this.getOperate = function (projectId) {
        var viewPageUrl = GlobalVariable.TrustManagementServiceHostURL + 'components/trustList/TrustList.html?enter=ProjectApproval&ProjectId=' + projectId;
        var html = '<a href="javascript: openNewIframe(\'' + viewPageUrl + '\', \'getOperate' + projectId + '\', \'关联产品_' + projectId + '\');">关联产品</a>';
        return html;
    };
    this.changeColor = function (ProjectAlert) {
        var html = '';
        if (ProjectAlert == '高危') {
            html = '<span style="color: #dd0000;">' + ProjectAlert + '</span>'
        } else if (!ProjectAlert) {
            html = ''
        } else {
            html = '<span style="color: #13b712;">' + ProjectAlert + '</span>'
        }
        return html;
    };
    this.RetrunTitle = function (parms) {
        var html = '';
        html = '<span title="' + parms + '">' + parms + '</span>';
        return html
    }
    this.RetrunWKStatus = function (parms) {
        if (parms == "0") {
            parms = "暂无";
        }
        return parms;
    }
    kendo.culture("zh-CN");
    var AssetAggregationStatsForTrust = new kendoGridModel(height);
    var CashFlowPoolListOptions = {
        renderOptions: {
            columns: [
                //{ field: "TrustId", title: lang.ProductID, width: "100px", locked: true, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "ProjectId", title: lang.ProjectId, width: "100px" },
                { field: "ProjectName", title: lang.ProjectName, width: "200px" },
                { field: "ProjectShortName", title: lang.ProjectShortName, width: "150px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "StatusDesc", title: lang.ProjectType, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "ProjectAlert", title: lang.ProjectAlert, width: 150, template: "#=this.changeColor(ProjectAlert)#", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "ProductCount", title: lang.ProductCount, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "AssetCount", title: lang.AssetCount, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "WKstatus", title: lang.WKstatus, template: "#=this.RetrunWKStatus(WKstatus)#", width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "ChargeUserName", title: lang.ChargeUserName, template: "#=this.RetrunTitle(ChargeUserName)#", width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "DurationChargeUserName", title: lang.DurationChargeUserName, template: "#=this.RetrunTitle(DurationChargeUserName)#", width: "150px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            ]
        },
        dataSourceOptions: {
            pageSize: 20,
            otherOptions: {
                orderby: "ProjectId",
                direction: "desc",
                DBName: 'TrustManagement',
                appDomain: 'TrustManagement',
                executeParamType: 'extend',
                defaultfilter: filter,
                executeParam: function () {
                    var result = {
                        SPName: 'usp_GetProjectListData',
                        SQLParams: [
                                { Name: 'projectStatus', Value: -1, DBType: 'int', },
                                { Name: 'ProjectType', Value: 0, DBType: 'int', }
                        ],
                    };
                    return result;
                }
            }
        },
    }
    AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
    AssetAggregationStatsForTrust.RunderGrid();
    $(function () {
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
        $('#workline').click(function () {
            trustAction(function (data) {
                var ProjectId = data.ProjectId;
                var enter = data.ProjectStatus;
                var enterName = "";
                var tabName = "项目与工作流";
                var pollId = '{0}_workflow' + ProjectId;
                if (enter=="1") {
                    enterName = "ProjectApproval"
                }else if(enter=='2'){
                    enterName = "IssuePreparation"

                }else if(enter=="3"){
                    enterName = "ProjectSetup"

                }else if(enter=="4"){
                    enterName = "TermProject"

                }else if(enter=="5"){

                    enterName = "EndofProject"
                }
                console.log(enterName)
                ProjectId = enterName + "_" + ProjectId;
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
                        openNewIframe(page, pollId, tabName);
                    } else if (data[0].WorkFLowID) {
                        var WKid = data[0].WorkFLowID;
                        var WKtype = data[0].WKtype;
                        var page = GlobalVariable.WorkflowConfig + '?WorkFLowID=' + WKid + '&WorkFlowCode=' + WKtype + '&ProjectID=' + ProjectId;
                        openNewIframe(page, pollId, tabName);
                    } 
                })
            });
        })

        //初始化相关资产池
        $('.select').hover(function () {
            $(this).find('.ribbonGroup_wrap').stop().slideDown()
        }, function () {
            $(this).find('.ribbonGroup_wrap').stop().slideUp()
        })
    });

    $('.btn-group').each(function () {
        $(this).find('.dropdown-menu').css('min-width', $(this).width())
    })

    function changeWidth(obj) {
        var w = $(".main").width();
        obj.css("width", w + "px");
    }
    //阻止grid滚动条的默认行为
    function preventDef(e) {
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        e.cancelBubble = true;
        e.returnValue = false;
    }
    $(".k-grid-content").scroll(function (e) {
        preventDef(e)
    })
    changeWidth($(".chrome-tabs-shell"));
    function openNewIframe(page, trustId, tabName, cb) {
        var pass = true;
        parent.parent.viewModel.tabs().forEach(function (v, i) {
            if (v.id == trustId) {
                pass = false;
                parent.parent.viewModel.changeShowId(v);
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
            parent.parent.viewModel.tabs.push(newTab);
            parent.parent.viewModel.changeShowId(newTab);

        };
    }
});