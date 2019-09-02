define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require('app/components/trustList/js/wcfProxy');
    require("kendomessagescn");
    require("kendoculturezhCN");
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GlobalVariable = require('gs/globalVariable');
    var webStorage = require("gs/webStorage");
    var common = require('common');
    var enter = common.getQueryString('enter');
    var ProjectId = common.getQueryString('ProjectId');
    var userName = webStorage.getItem('gs_UserName');  
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
    var kendouiGrid = new kendoGridModel(height);

    var AssetAggregationStatsForTrust = new kendoGridModel(height);

    var CashFlowPoolListOptions = {
        renderOptions: {
            columns: [
                {
                    title: "",
                    width: '50px',
                    //headerTemplate: function () {
                    //    var t = '<input type="checkbox" id="checkAll" onclick="selectAll(this)""/>';
                    //    return t
                    //},
                    template: function () {
                        //var t = '<input type="checkbox" class="selectbox" onclick="selectCurrent(this)"/>';
                        var t = '<input type="radio" class="selectbox" name="single" onclick="selectSingle(this)"/>';
                        return t
                    }
                },
                {
                    field: "TrustId", title: lang.ProductID, width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' }
                }
                    , { field: "TrustCode", title: lang.ProductName, width: "180px" }
                    , { field: "TrustName", title: lang.ProductDescription, width: "220px" }
                    , { field: "SpecialPlanState", title: lang.ProductStatus, width: "120px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                    , { field: "AssetTypeDesc", title: lang.AssetType, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
            ]
        }
           , dataSourceOptions: {
               pageSize: 20
               , otherOptions: {
                   orderby: "TrustId"
                   , direction: "desc"
                    , DBName: 'TrustManagement'
                    , appDomain: 'TrustManagement'
                   , executeParamType: 'extend'
                    , defaultfilter: filter
                   , executeParam: function () {
                       var result = {
                           SPName: 'usp_GetTrustListData',
                           SQLParams: [
                                { Name: 'UserName', Value: userName, DBType: 'string' }
                           ]
                       };
                       return result;
                   }
               }
           },
    }
    //全选框
    //selectAll = function (that) {
    //    var that = that;
    //    window.checkall ? window.checkall = !window.checkall : "";
    //    if ($("#checkAll").is(':checked')) {
    //        var arry = $(".selectbox");
    //        $.each(arry, function (i, v) {
    //            $(v).prop("checked", true);
    //            var aco = $(v).parent().next().html();
    //            if (params.indexOf(aco) == -1) {
    //                params.push(aco);
    //            }
    //        })
    //    } else {
    //        var arry = $(".selectbox");
    //        $.each(arry, function (i, v) {
    //            $(v).prop("checked", false);
    //            params.remove($(v).parent().next().html());
    //        })
    //    }
    //}
    //selectCurrent = function (that) {
    //    var that = that;
    //    var arry = $(".selectbox");
    //    var off = true;
    //    $.each(arry, function (i, v) {
    //        if (!v.checked) {
    //            off = false;
    //        }
    //    })
    //    if (window.checkall) {
    //        window.checkall = false;
    //        $.each(arry, function (i, v) {
    //            var aco = $(that).parent().next().html();
    //            if (v.checked && params.indexOf(aco) == -1) {
    //                params.push(aco);
    //            }
    //        })
    //    }

    //    if ($(that).is(':checked')) {
    //        params.push($(that).parent().next().html());
    //    } else {
    //        params.remove($(that).parent().next().html());
    //    }
    //    if (off) {
    //        $("#checkAll").prop("checked", true);
    //        window.checkall ? window.checkall = !window.checkall : "";
    //    } else {
    //        $("#checkAll").prop("checked", false);
    //    }

    //}
    selectSingle = function (that) {
        var that = that;
        params = $(that).parent().next().html();
    }
    $(window).resize(function () {
        var a = $(window).height() - 75
        $("#grid").height(a);
        $("#grid").children(".k-grid-content").height(a - 80)
        $("#grid").children(".k-grid-content-locked").height(a - 100)
    })
    $(window).resize()

    $(function () {
        
        $('#addProject').click(function () {
            var ProjectId = webStorage.getItem('ProjectId');
            GSDialog.open('选择产品', GlobalVariable.TrustManagementServiceHostURL + 'projectStage/ProjectApproval/SelectProduct.html?ProjectId=' + ProjectId, '', function (res) {
                location.reload()
            }, 1000, 500);           
        })

        kendo.culture("zh-CN");
        //初始化相关资产池
        AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
        AssetAggregationStatsForTrust.RunderGrid();
        $('#loading').hide()

        $('#saveProject').click(function () {
            if (params.length < 1) {
                GSDialog.HintWindow('请选择产品！')
            } else {
                //var trustIdItem = '';
                //$.each(params,function(i,v){
                //    trustIdItem += v + ','
                //})
                //console.log(trustIdItem)
                //var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                //executeParam = {
                //    SPName: "TrustManagement.usp_CreateProjectOnTrust",
                //    SQLParams: [
                //            { 'Name': 'projectId', 'Value': parseInt(ProjectId), 'DBType': 'int' },
                //            { 'Name': 'trustIdItem', 'Value': trustIdItem.slice(0, trustIdItem.length - 1), 'DBType': 'string' }
                //    ]
                //};
                //common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                //    if (data) {
                //        console.log(data)
                //        GSDialog.HintWindow('保存成功！')
                //    }
                //});
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                executeParam = {
                    SPName: "TrustManagement.usp_CreateProjectOnTrust",
                    SQLParams: [
                            { 'Name': 'projectId', 'Value': parseInt(ProjectId), 'DBType': 'int' },
                            { 'Name': 'trustIdItem', 'Value': params, 'DBType': 'string' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data) {
                        GSDialog.HintWindow('保存成功！', function () {
                            $('#modal-close',parent.document).click()
                        })
                    }
                });
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