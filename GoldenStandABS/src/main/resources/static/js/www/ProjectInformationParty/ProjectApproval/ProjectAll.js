define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require('gs/globalVariable');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    require('app/components/trustList/js/wcfProxy');
    require('app/ProjectInformationParty/js/project_interface');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var tm = require('gs/childTabModel');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var appName = webStorage.getItem('showId');
    var common = require('common');
    var enter = common.getQueryString('enter');
    window.state = enter;
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
            /*
             * When the user translates we set the cookie
             */
            webStorage.setItem('userLanguage', languageCode);
            return true;
        },

        /* 
         * Translate the strings that appear in all the pages below
         */
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
    var filter = (IsAdministrator == '1') ? " " : lang.filter;
    var height = $(window).height() - 110;
    var kendouiGrid = new kendoGridModel(height);

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
        var html = '<a href="javascript: ProjectSource(\'' + projectId + '\');" title="项目资源" style="margin-right:5px;"><i style="color:#45569c" class="icon icon-codepen"></i></a>';
        html += '<a href="javascript: EditProject(\'' + projectId + '\');" title="编辑项目" style="margin-right:5px;"><i class="icon icon-edit" style="color: #777;"></i></a>';
        html += '<a href="javascript: DeleteProject(\'' + projectId + '\');" title="删除项目"><i class="icon icon-trash-empty" style="color:#d00000;"></i></a>';
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
    //项目立项
    this.CallBackStatusOne = function (projectStatus) {
        var html = ""
        if (projectStatus == "1") {
            html += "<div style='color:#45569c'><span style='display:inline-block; width:6px;height:6px;background:#45569c;border-radius:50%;margin-right:5px;margin-bottom:2px'></span>进行中</div>"
        } else if (projectStatus > 1) {
            html += "<div style='color:#13b712'><span style='display:inline-block; width:6px;height:6px;background:#13b712;border-radius:50%;margin-right:5px;margin-bottom:2px'></span>完成</div>"
        }

        return html;
    }
    //发行准备
    this.CallBackStatusTwo = function (projectStatus) {
        var html = ""
        if (projectStatus == "2") {
            html += "<div style='color:#45569c'><span style='display:inline-block; width:6px;height:6px;background:#45569c;border-radius:50%;margin-right:5px;margin-bottom:2px'></span>进行中</div>"
        } else if (projectStatus > 2) {
            html += "<div style='color:#13b712'><span style='display:inline-block; width:6px;height:6px;background:#13b712;border-radius:50%;margin-right:5px;margin-bottom:2px'></span>完成</div>"
        }

        return html;
    }
    //项目成立
    this.CallBackStatusThree = function (projectStatus) {
        var html = ""
        if (projectStatus == "3") {
            html += "<div style='color:#45569c'><span style='display:inline-block; width:6px;height:6px;background:#45569c;border-radius:50%;margin-right:5px;margin-bottom:2px'></span>进行中</div>"
        } else if (projectStatus > 3) {
            html += "<div style='color:#13b712'><span style='display:inline-block; width:6px;height:6px;background:#13b712;border-radius:50%;margin-right:5px;margin-bottom:2px'></span>完成</div>"
        }

        return html;
    }
    //项目存续
    this.CallBackStatusFour = function (projectStatus) {
        var html = ""
        if (projectStatus == "4") {
            html += "<div style='color:#45569c'><span style='display:inline-block; width:6px;height:6px;background:#45569c;border-radius:50%;margin-right:5px;margin-bottom:2px'></span>进行中</div>"
        } else if (projectStatus > 4) {
            html += "<div style='color:#13b712'><span style='display:inline-block; width:6px;height:6px;background:#13b712;border-radius:50%;margin-right:5px;margin-bottom:2px'></span>完成</div>"
        }

        return html;
    }
    //项目结束
    this.CallBackStatusFive = function (projectStatus) {
        var html = ""
        if (projectStatus >= "5") {
            html += "<div style='color:#13b712'><span style='display:inline-block; width:6px;height:6px;background:#13b712;border-radius:50%;margin-right:5px;margin-bottom:2px'></span>完成</div>"
        }
        return html;
    }
    //项目资源
    function ProjectSource(ProjectId) {
        var ProjectId = ProjectId;
        var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectSource/ProjectSource.html?ProjectId=" + ProjectId;
        var pollId = '{0}_ProjectSource' + ProjectId;
        var tabName = '项目资源' + '_' + ProjectId;
        openNewIframeProject(page, pollId, tabName);
    }
    //编辑项目
    function EditProject(ProjectId) {
        var ProjectId = ProjectId;
        var page = GlobalVariable.TrustManagementServiceHostURL + "ProjectInformationParty/ProjectApproval/ProjectAdd.html?enter=EditProject&ProjectId=" + ProjectId;
        var pollId = '{0}_EditProject' + ProjectId;
        var tabName = '编辑项目' + '_' + ProjectId;
        openNewIframeProject(page, pollId, tabName);
    }
    //删除项目
    function DeleteProject(ProjectId) {
        var ProjectId = ProjectId;
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
            $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
            $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
        };
    }
    var productManageFunction = '/GoldenStandABS/www/ProjectInformationParty/projectManageFunction.json';
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        productManageFunction = '/GoldenStandABS/www/ProjectInformationParty/projectManageFunction_en.json';
    }

    GSAdmin.init(productManageFunction, function () {
        viewModel = new tm();
        $('.home-tab').click(function () {
            viewModel.goList();
        });
        viewModel.init();
        openMainPage();
    });
    function openMainPage() {
        viewModel.tabs.push({
            id: 'iframeMainContent',
            url: 'TrustManagement/viewTrust_New_iframe/viewTrust.html',
            name: lang.ProductManagement,
        });
    };

    var AssetAggregationStatsForTrust = new kendoGridModel(height);

    var CashFlowPoolListOptions = {
        renderOptions: {
            columns: [
               { field: "", title: '操作', template: '#=this.getOperate(ProjectId)#', width: "120px", locked: true },
                { field: "ProjectName", title: lang.ProjectName, width: "200px" },
                { field: "ProjectShortName", title: lang.ProjectShortName, width: "200px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "", title: '项目立项', template: "#=this.CallBackStatusOne(ProjectStatus)#", width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "", title: '发行准备', template: "#=this.CallBackStatusTwo(ProjectStatus)#", width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "", title: '项目成立', template: "#=this.CallBackStatusThree(ProjectStatus)#", width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "", title: '项目存续', template: "#=this.CallBackStatusFour(ProjectStatus)#", width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "", title: '项目结束', template: "#=this.CallBackStatusFive(ProjectStatus)#", width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "ProjectAlert", title: lang.ProjectAlert, width: '120px', template: "#=this.changeColor(ProjectAlert)#", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "WKstatus", title: lang.WKstatus, template: "#=this.RetrunWKStatus(WKstatus)#", width: '120px', attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "ChargeUserName", title: lang.ChargeUserName, template: "#=this.RetrunTitle(ChargeUserName)#", width: '150px', attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "DurationChargeUserName", title: lang.DurationChargeUserName, template: "#=this.RetrunTitle(DurationChargeUserName)#", width: "150px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "", title: '', width: "auto" },
            ]
        },
        dataSourceOptions: {
            pageSize: 20,
            otherOptions: {
                orderby: "ProjectName",
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
                                { Name: 'ProjectType', Value: 1, DBType: 'int', }
                        ],
                    };
                    return result;
                }
            }
        },
    }
    $(function () {
        kendo.culture("zh-CN");
        //初始化相关资产池
        AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
        AssetAggregationStatsForTrust.RunderGrid();
        $('#loading').hide()
    });
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

});