define(function (require) {
    var $ = require('jquery');
    var kendoGrid = require('kendo.all.min');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require('app/components/trustList/js/wcfProxy');
    require("kendomessagescn");
    require("kendoculturezhCN");
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GlobalVariable = require('gs/globalVariable');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var webStorage = require("gs/webStorage");
    var common = require('common');
    var enter = common.getQueryString('enter');
    var ProjectId = common.getQueryString('ProjectId');
    var userName = webStorage.getItem('gs_UserName');
    var sVariableBuilder = require('gs/sVariableBuilder'); 
    var taskIndicator = require('gs/taskProcessIndicator');
    require('jquery.localizationTool');
    require('bootstrap');
    var params = [];

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

    var height = $(window).height() - 75;

    function initKendo() {
        var h = $(window).height() - 75;
        var cashflowListOne = []
        var executeParams = {
            SPName: 'usp_GetTrustListDataForRiskManagement', SQLParams: [
                 { Name: 'UserName', Value: userName, DBType: 'string' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'RiskManagement', executeParams, function (data) {
            cashflowListOne = data;
            params = [];
            $.each(cashflowListOne, function (i,v) {
                if (v.Checked == 1) {
                    params.push(v.TrustId)
                }
            })
        });
        var pageIndex = 0;
        var selectedRowIndex = -1;
        var gridOptions = {
            dataSource: cashflowListOne,
            scrollable: true,
            sortable: true,
            selectable: "multiple",
            filterable: true,
            reorderable: true,//列的排序,选择一列可以拖动改变她的顺序
            resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
            height: h,
            orderBy: 'TrustId',
            pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5,
                page: 1,
                pageSize: 5,
                pageSizes: [5,15, 30, 45, 60, 80, 100],
            },
            dataBound: function () {
                var rows = this.items();
                var page = this.pager.page() - 1;
                var pagesize = this.pager.pageSize();
                if (page != pageIndex) {
                    selectedRowIndex = -1;
                    pageIndex = page;
                }
                $(rows).each(function () {
                    var index = $(this).index();
                    var dataIndex = $(this).index() + page * pagesize;
                    var rowLabel = $(this).find(".row-number");
                    $(rowLabel).attr("index", index);
                    $(rowLabel).attr("dataIndex", dataIndex);
                });

                if (selectedRowIndex > -1) {
                    selectGridRow(selectedRowIndex);
                }
            },
            filterable: true,
            columns: [
                {
                    title: "",
                    width: '50px',
                    headerTemplate: function () {
                        var t = '<input type="checkbox" id="checkAll" onclick="selectAll(this)"" />';
                        return t
                    },
                    template: "#if(Checked == 1){#" +
                            '<input type="checkbox" name="checkbox" checked class="selectbox" onclick="selectCurrent(this)"/>' +
                        "#}else{#" +
                            '<input type="checkbox" name="checkbox" class="selectbox" onclick="selectCurrent(this)"/>' +
                        "#}#"
                },
                {
                    field: "TrustId", title: lang.ProductID, width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' }
                },
                { field: "TrustCode", title: lang.ProductName, width: "180px" },
                { field: "TrustName", title: lang.ProductDescription, width: "220px" },
                { field: "SpecialPlanState", title: lang.ProductStatus, width: "120px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
                { field: "AssetTypeDesc", title: lang.AssetType, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
            ]
        }
        var element = $("#grid").kendoGrid(gridOptions)
    }
    initKendo()
    
    selectAll = function (that) {
        var that = that;
        window.checkall ? window.checkall = !window.checkall : "";
        if ($("#checkAll").is(':checked')) {
            var arry = $(".selectbox");
            $.each(arry, function (i, v) {
                $(v).prop("checked", true);
                var aco = parseInt($(v).parent().next().html());
                if (params.indexOf(aco) == -1) {
                    params.push(aco);
                }
            })
        } else {
            var arry = $(".selectbox");
            $(".tips").hide()
            $.each(arry, function (i, v) {
                $(v).prop("checked", false);
                params.remove(parseInt($(v).parent().next().html()));
            })
        }
    }
    selectCurrent = function (that) {
         
        var that = that;
        var arry = $(".selectbox");
        var off = true;
        $.each(arry, function (i, v) {
            if (!v.checked) {
                off = false;
            }
        })
        if (window.checkall && $(".tips").css("display") == "block") {
            window.checkall = false;
            $.each(arry, function (i, v) {
                var aco = parseInt($(v).parent().next().html());
                if (v.checked && params.indexOf(aco) == -1) {
                    params.push(aco);
                }
            })
        }

        if ($(that).is(':checked')) {
            params.push(parseInt($(that).parent().next().html()));
        } else {
            params.remove(parseInt($(that).parent().next().html()));
        }
        if (off) {
            $("#checkAll").prop("checked", true);
            window.checkall ? window.checkall = !window.checkall : "";
        } else {
            $("#checkAll").prop("checked", false);
        }
    }
    $(window).resize(function () {
        var a = $(window).height() - 75
        $("#grid").height(a);
        $("#grid").children(".k-grid-content").height(a - 80)
        $("#grid").children(".k-grid-content-locked").height(a - 100)
    })
    $(window).resize()

    $(function () {
        kendo.culture("zh-CN");
        $('#loading').hide()
       
        $('#saveProject').click(function () {
            if (params.length < 1) {
                GSDialog.HintWindow('请选择产品！')
            } else {
                var trustIds = params.join(',');
                sVariableBuilder.AddVariableItem('TrustIds', trustIds, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('UserName', userName, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: 'RiskManagementReportDataReady',
                    sContext: sVariable,
                    callback: function (response) {
                    }
                });
                tIndicator.show();
            }
        })

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