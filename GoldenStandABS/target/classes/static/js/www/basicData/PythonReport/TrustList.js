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

    var filter = (IsAdministrator == '1') ? " " : lang.filter;
    var height = $(window).height() - 100;
    var kendouiGrid = new kendoGridModel(height);

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
            return '<button id="stateOperration"  style="background: #f1f1f1;border: 1px solid #dedede;padding: 2px 5px;border-radius: 3px;"  onclick=stateOperration("' + TrustId + '","' + UserName + '","' + ApproveState + lang.ApplyForModification;
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
            { field: "TrustId", title: lang.ProductID, width: "100px", locked: true, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "TrustCode", title: lang.ProductName, width: "200px" },
            { field: "TrustName", title: lang.ProductDescription, width: "280px" },
            { field: "SpecialPlanState", title: lang.ProductStatus, width: "120px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "OrganisationDesc", title: lang.Organisation, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "AssetTypeDesc", title: lang.AssetType, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "UserName", title: lang.Creator, width: "150px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "operration", title: lang.Handle, template: "#=this.TrustState(ApproveState,TrustId,UserName,IsCreateName,SpecialPlanState)#", width: "160px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "", title: lang.HandleStatus, template: "#=this.PerationState(ApproveState,SpecialPlanState,opId)#", width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "IsTopUpAvailable", title: lang.IsTopUpAvailable, width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "", title: "", width: "auto" }
    ];
        SPName = 'usp_GetTrustListData',
        SQLParams = [
            { Name: 'UserName', Value: userName, DBType: 'string' }
        ];
        orderby = "TrustId";
        direction = 'desc'

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
        $('#btnReport').click(function () {
            trustAction(function (data) {
                var tid = data.TrustId;
                var TrustCode = data.TrustCode;
                var page = GlobalVariable.TrustManagementServiceHostURL + "basicData/PythonReport/LoanServiceReportMapping.html?tid=" + tid + "&TrustCode="+TrustCode;
                var pollId = '{0}_EditReport' + tid;
                var tabName = "贷款服务报告" + '_' + tid;
                openNewIframe(page, pollId, tabName);
            });
        })

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