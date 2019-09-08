define(function (require) {
	var projectUrl="";
    var $ = require('jquery');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');

    require('gs/globalVariable');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    require('app/components/trustList/js/wcfProxy');
    
    require("kendomessagescn");
    require("kendoculturezhCN");
    require("app/projectStage/js/project_interface");
    require('app/components/trustList/js/trustList_Interface');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var tm = require('gs/childTabModel');
    var GlobalVariable = require('gs/globalVariable');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var appName = webStorage.getItem('showId');
    var common = require('common');
    var enter = common.getQueryString('enter');
    var ProjectId = common.getQueryString('ProjectId');
    var other = common.getQueryString('other');
    
    var state = common.getQueryString("state");
    window.state = state;
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
    $('body').show();

    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage');
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        //lang.filter = "and SpecialPlanState = N'designing'";
        lang.approveprocess = "Approval Process";
        lang.published = 'published';
        lang.ApplyForModification = '")>Apply For Modification</button>';
        lang.approving = "<span>Approving</span>";
        lang.approved = "<span>Approved</span>";
        lang.Reject = '<span>Reject</span>';
        lang.ProductManagement = 'Product Management';
        lang.ProductID = 'Product ID';
        lang.ProductName = 'Product Name';
        lang.ProductDescription = 'Product Description';
        lang.ProductStatus = 'Product Status';
        lang.Organisation = 'Organisation';
        lang.AssetType = 'Asset Type';
        lang.Creator = 'Creator';
        lang.Handle = 'Handle';
        lang.HandleStatus = 'Handle Status';
        lang.IsTopUpAvailable = 'Is Surrport Cycle Buy';

    }
    else {
        //lang.filter = "and SpecialPlanState = N'设计中'";
        lang.filter = "and (userName = '" + userName + "' or IsCheck=0)";
        lang.approveprocess = "审批流程";
        lang.published = '已发行';
        lang.ApplyForModification = '")>申请修改</button>';
        lang.approving = "<span>待审核</span>";
        lang.approved = "<span>已审</span>";
        lang.Reject = '<span>驳回</span>';
        lang.ProductManagement = '产品管理';
        lang.ProductID = '标识';
        lang.ProductName = '产品名称';
        lang.ProductDescription = '产品描述';
        lang.ProductStatus = '产品状态';
        lang.Organisation = '资产来源';
        lang.AssetType = '资产类型';
        lang.Creator = '创建人';
        lang.Handle = '操作';
        lang.HandleStatus = '操作状态';
        lang.IsTopUpAvailable = '能否循环购买';

    }


    var isAdmin = false;
    //var filter = (appName === "productManage") ? "and SpecialPlanState = N'已发行'" : "and SpecialPlanState = N'设计中'";
    //产品管理下面的产品列表暂时先不加筛选条件
    //var filter = (appName === "productManage" && IsAdministrator == '1') ? " " : lang.filter;
    var filter = (IsAdministrator == '1') ? " " : lang.filter;
    var height = $(window).height() - 135;
    var kendouiGrid = new kendoGridModel(height);
    //loading
    //if (document.readyState == "complete") //当页面加载状态 
    //{
    //    $("#loading").fadeOut();
    //}
    var ApproveStates;
    this.stateOperration = function (TrustId, UserName, ApproveState) {
        //var Applicant = $.cookie('gs_UserName');
        var $ApproveState;
        if ($ApproveState == "Disagree") {
            $ApproveState = "Disagree"
        } else {
            $ApproveState = "NotTrial"
        }
        require(['gs/uiFrame/js/gs-admin-2.pages', 'globalVariable'], function (adminDiaLog, GlobalVariable) {
            adminDiaLog.open(
                        lang.approveprocess,
                        GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/ApprovalProcess/ApprovalProcess.html?userName={0}&TrustId={1}&Applicant={2}&ApproveState={3}'.format(UserName, TrustId, userName, $ApproveState),
                        ' ',
                         function () {
                             //location.reload(true);
                         },
                        '560px',
                        '440px', ' ', ' ', '', ''
                        )
        })
    }

    //判断产品列表操作类型和提示
    this.TrustState = function (ApproveState, TrustId, UserName, IsCreateName, SpecialPlanState) {
        if (IsCreateName == 2 && SpecialPlanState == lang.published) {
            //if (ApproveState == 'NotTrial') {
            //    return ApproveStates = "<span>待审核</span>"
            //} else if (ApproveState == 'Agree') {
            //    return ApproveStates = "<span>已审</span>"
            //} else if (ApproveState == 'Disagree') {
            //    return ApproveStates = '<span>驳回</span><button id="stateOperration" onclick=stateOperration("' + TrustId + '","' + UserName + '","' + ApproveState + '")>重新申请</button>'
            //} else {
            return '<button id="stateOperration"  style="background: #f1f1f1;border: 1px solid #dedede;padding: 2px 5px;border-radius: 3px;"  onclick=stateOperration("' + TrustId + '","' + UserName + '","' + ApproveState + lang.ApplyForModification;
            //}
        } else {
            return " "
        }
    }


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

    var SQLParams = [];
    var SPName = '';
    var orderby = '';
    var direction = '';
    var columns = [
            {field: "TrustId", title : lang.ProductID, width : "100px", locked: true, attributes : { style: 'text-align:left'}, headerAttributes: { style: 'text-align:left'}},
            {field: "TrustCode", title: lang.ProductName, width: "200px" },
            {field: "TrustName", title: lang.ProductDescription, width: "280px" },
            {field: "SpecialPlanState", title: lang.ProductStatus, width: "120px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            {field: "OrganisationDesc", title: lang.Organisation, width : 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left'}},
            {field: "AssetTypeDesc", title: lang.AssetType, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            {field: "UserName", title: lang.Creator, width: "150px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            {field: "operration", title: lang.Handle, template: "#=this.TrustState(ApproveState,TrustId,UserName,IsCreateName,SpecialPlanState)#", width: "160px", attributes: { style: 'text-align:left' }, headerAttributes: {style: 'text-align:left'}},
            {field: "", title: lang.HandleStatus, template: "#=this.PerationState(ApproveState,SpecialPlanState,opId)#", width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            {field: "IsTopUpAvailable", title: lang.IsTopUpAvailable, width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            {field: "", title: "", width: "auto"}
        ];
    
    if (enter === 'projectManage' && ProjectId) {
        SPName = 'usp_GetTrustListData';
        orderby = "TrustId";
        direction = 'desc';
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
            executeParam = {
                SPName: "TrustManagement.usp_getFilterFromProject",
                SQLParams: [
                               { 'Name': 'projectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                ]
            };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            if (data) {
                console.log(data)
                SQLParams = [
                    { Name: 'UserName', Value: userName, DBType: 'string' },
                    { Name: 'filter', Value: data[0].TrustFilter, DBType: 'string' }
                ];
            }
        });
        filter = "and (userName = '" + userName + "')";
    } else if (enter === 'ProjectApproval' && ProjectId) {
        SPName = 'usp_GetProjectOnTrust',
        SQLParams = [
            { Name: 'projectId', Value: parseInt(ProjectId), DBType: 'int' }
        ];
        orderby = "b.TrustId";
        direction = 'desc';
        columns = [{ field: "TrustId", title: lang.ProductID, width: "100px", locked: true, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                    , { field: "TrustCode", title: lang.ProductName, width: "200px" }
                    //, { field: "TrustNameShort", title: '专项计划简称', width: "150px" }
                    , { field: "TrustName", title: lang.ProductDescription, width: "280px" }
                    , { field: "SpecialPlanState", title: lang.ProductStatus, width: "120px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                    , { field: "OrganisationDesc", title: lang.Organisation, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                    , { field: "AssetTypeDesc", title: lang.AssetType, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                    , { field: "UserName", title: lang.Creator, width: "150px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                    //, { field: "operration", title: lang.Handle, template: "#=this.TrustState(ApproveState,TrustId,UserName,IsCreateName,SpecialPlanState)#", width: "160px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }

                    //, {
                    //    field: "", title: lang.HandleStatus, template: "#=this.PerationState(ApproveState,SpecialPlanState,opId)#", width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' }
                    //}
                      , { field: "IsTopUpAvailable", title: lang.IsTopUpAvailable, width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                    , { field: "", title: "", width: "auto" }
        ]
        
        
    } else {
        SPName = 'usp_GetTrustListData',
        SQLParams = [
            { Name: 'UserName', Value: userName, DBType: 'string' }
        ];
        orderby = "TrustId";
        direction = 'desc'
    }

    //绑定产品管理的功能
    if (appName === "productDesign") {
        $("#DashBoard .productManage").hide();
        $("#DashBoard .productDesign").show();
        $("#DashBoard .ProjectApproval").hide();
        var height = $(window).height() - 135;
        var kendouiGrid = new kendoGridModel(height);
    } else {
        $("#DashBoard .productManage").show();
        $("#DashBoard .productDesign").hide();
        $("#DashBoard .ProjectApproval").hide();
    }
    if (enter === 'projectManage') {
        $('.body-container').css('height', '100%');
        $('.main').css('height', '100%');
        $("#DashBoard .productManage").show();
        $("#DashBoard .productDesign").hide();
        $("#DashBoard .ProjectApproval").hide();
        var height = $(window).height() - 100;
        var kendouiGrid = new kendoGridModel(height);
    } else if (enter === 'ProjectApproval' && ProjectId && !other) {
        $('.body-container').css('height', '100%');
        $('.main').css('height', '100%');
        $("#DashBoard .productManage").hide();
        $("#DashBoard #MangeTrust").hide();
        $("#DashBoard .productDesign").hide();
        $("#DashBoard .ProjectApproval").show();
        var height = $(window).height() - 100;
        var kendouiGrid = new kendoGridModel(height);
    } else if (enter === 'ProjectApproval' && ProjectId && other === 'EditProject') {
        $('.body-container').css('height', '100%');
        $('.main').css('height', '100%');
        $("#DashBoard .productManage").hide();
        $("#DashBoard .productDesign").hide();
        $("#DashBoard .ProjectApproval").show();
        $("#DashBoard #MangeTrust").show();
        var height = $(window).height() -100;
        var kendouiGrid = new kendoGridModel(height);
    }
    //TODO YYY
/*    var productManageFunction = '/GoldenStandABS/www/productManage/productManageFunction.json';*/
    var productManageFunction = '/js/www/productManage/productManageFunction.json';
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        //productManageFunction = '/GoldenStandABS/www/productManage/productManageFunction_en.json';
        productManageFunction = '/js/www/productManage/productManageFunction_en.json';
    }

    GSAdmin.init(productManageFunction, function () {
        viewModel = new tm();
        //console.log(viewModel);
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
            columns: columns
        }   
           , dataSourceOptions: {
               pageSize: 20
               , otherOptions: {
                   orderby: orderby
                   , direction: direction
                    , DBName: 'TrustManagement'
                    , appDomain: 'TrustManagement'
                   , executeParamType: 'extend'
                    , defaultfilter: filter
                   , executeParam: function () {
                       var result = {
                           SPName: SPName,
                           SQLParams: SQLParams
                           //把TrustCode传到kendoGridModel里
                       };
                       return result;
                   }
               }
           },
    }
    $(function () {
        
        $('#addProject').click(function(){
            var ProjectId = common.getQueryString('ProjectId') || webStorage.getItem('ProjectId');
            //title, url, data, fnCallBack, width, height, size, draggable, changeallow, mask, scrolling
            GSDialog.open('选择产品', GlobalVariable.TrustManagementServiceHostURL + 'projectStage/ProjectApproval/SelectProduct.html?ProjectId=' + ProjectId, '', function (res) {
                location.reload()
            }, 900, 500);
        })
        $('#MangeTrust').click(function () {
            MangeTrust()
        })
        function trustAction(callback) {
            var $ = require('jquery');
            var grid = $("#grid").data("kendoExtGrid");
            if (grid.select().length != 2) {
                GSDialog.HintWindow('请选择产品！');
            } else {
                var dataRows = grid.items();
                // 获取行号
                var rowIndex = dataRows.index(grid.select());
                // 获取行对象
                var data = grid.dataItem(grid.select());
                callback(data);
            }
        }
        function ProPermissionOp(tid, ResData, langtli) {
            require(['globalVariable'], function (GlobalVariable) {
                var page = GlobalVariable.TrustManagementServiceHostURL + "productManage/TrustManagement/viewTrust_New_iframe/viewTrust.html?tid=" + tid + "&productPermissionState=" + ResData;
                var pollId = '{0}_mangeTrust'.format(tid);
                var tabName = langtli.ProductMaintain + tid;
                openNewIframe(page, pollId, tabName);
            });

        }
        function MangeTrust() {
            trustAction(function (data) {
                var langtli = getLangtli();
                var tid = data.TrustId;
                var CreateName = data.UserName;
                var $ApproveState = data.ApproveState;
                var permission = require('gs/permission');
                var webStorage = require('gs/webStorage');
                var userName = webStorage.getItem('gs_UserName');
                webStorage.setItem('showId', 'productManage');
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
        kendo.culture("zh-CN");
        //初始化相关资产池
        AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
        AssetAggregationStatsForTrust.RunderGrid();
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
    console.log($("#DashBoard>ul"));
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
            //$('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
            //$('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
        };
    }
});