
define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('../js/kendoDeal');
    require('gs/globalVariable');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    require('app/components/trustList/js/wcfProxy');
    require('app/projectStage/js/project_interface');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var tm = require('gs/childTabModel');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var common = require('common');
    var ProjectId = common.getQueryString('ProjectId');
    webProxy = require('gs/webProxy');
    require('jquery.localizationTool');
    var Vue = require('Vue2');
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

    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage');
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.ProductID = 'Product ID';
        lang.ProductName = 'Product Name';
        lang.ProductDescription = 'Product Description';
        lang.ProductStatus = 'Product Status';
        lang.Organisation = 'Organisation';
        lang.AssetType = 'Asset Type';
        lang.Revolving = "Revolving"
    }
    else {
        lang.ProductID = '标识';
        lang.ProductName = '产品名称';
        lang.ProductDescription = '产品描述';
        lang.ProductStatus = '产品状态';
        lang.Organisation = '资产来源';
        lang.AssetType = '资产类型';
        lang.Revolving = "是否循环"
    }
    var isAdmin = false;
    var filter = (IsAdministrator == '1') ? " " : lang.filter;
    var height = $(window).height() - 145;
    var kendouiGrid = new kendoGridModel(height);

    var AssetAggregationStatsForTrust = new kendoGridModel(height);

    var CashFlowPoolListOptions = {
        renderOptions: {
            columns: [
                {
                    title: "",
                    width: '50px',
                    headerTemplate: function () {
                        var t = '<input type="checkbox" id="checkAll" onclick="selectAll(this)""/>';
                        return t
                    },
                    template: function () {
                        var t = '<input type="checkbox" class="selectbox" name="check" onclick="selectCurrent(this)"/>';
                        return t
                    }
                },
                {
                    field: "TrustId", title: lang.ProductID, width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' }
                }
                    , { field: "TrustCode", title: lang.ProductName, width: "180px" }
                    , { field: "TrustName", title: lang.ProductDescription, width: "220px" }
                    , { field: "Revolving", title: lang.Revolving, width: "120px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
                    , { field: "PortfolioType", title: lang.AssetType, width: 150, attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
            ]
        },
        dataSourceOptions: {
            pageSize: 20,
            otherOptions: {
                   orderby: "TrustId"
                   , direction: "desc"
                    , DBName: 'PaymentManagement'
                    , appDomain: 'dbo'
                   , executeParamType: 'extend'
                    , defaultfilter: filter
                   , executeParam: function () {
                       var result = {
                           SPName: 'usp_GetDataWithPager',
                           SQLParams: [
                                { "Name": "tableOrView", "Value": "FixedIncomeSuite.dbo.view_Trust", "DBType": "string" }
                           ]
                       };
                       return result;
                   }
               }
           },
    }
    //全选框
    selectAll = function (that) {
        var that = that;
        window.checkall ? window.checkall = !window.checkall : "";
        if ($("#checkAll").is(':checked')) {
            var arry = $(".selectbox");
            $.each(arry, function (i, v) {
                $(v).prop("checked", true);
            })
        } else {
            var arry = $(".selectbox");
            $.each(arry, function (i, v) {
                $(v).prop("checked", false);
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
        if (window.checkall) {
            window.checkall = false;
        }
        if (off) {
            $("#checkAll").prop("checked", true);
            window.checkall ? window.checkall = !window.checkall : "";
        } else {
            $("#checkAll").prop("checked", false);
        }

    }
    $(window).resize(function () {
        var a = $(window).height() - 145
        $("#grid").height(a);
        $("#grid").children(".k-grid-content").height(a - 75)
        $("#grid").children(".k-grid-content-locked").height(a - 95)    
    })
    $(window).resize()
    var app = new Vue({
        el: "#app",
        data: {
            trustList: [],
            loading: true
        },
        created: function(){
            //this.GetTrustLi();
        },
        methods: {
            GetTrustLi: function () {
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                executeParam = {
                    SPName: "TrustManagement.usp_getTrustIdFromProjectId",
                    SQLParams: [
                        { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (aa) {
                    } else {
                        GSDialog.HintWindow('当前项目没有产品！')
                    }
                });
            }
        }
    })

    $(function () {
        kendo.culture("zh-CN");
        //初始化相关资产池
        AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
        AssetAggregationStatsForTrust.RunderGrid();
        initcheckinfo();
        var a = $(window).height() - 145
        $("#grid").children(".k-grid-content").height(a - 75)
        $("#grid").children(".k-grid-content-locked").height(a - 95)
        $('#loading').hide()
        $('#saveProject').click(function () {
            params = []

            var assexml = "<root>";
            var countinfo = 0;
            $("input[name='check']:checked").each(function (i,v) {
                params.push({
                    name: $(this).parent().next().next().html(),
                    code: $(this).parent().next().next().next().html(),
                    number: $(this).parent().next().html()
                });
                var name = $(this).parent().next().next().html();
                var code = $(this).parent().next().next().next().html();
                var number = $(this).parent().next().html();

                var item = "<item><name>{0}</name><code>{1}</code><number>{2}</number></item>"
                var items = "";

                items += item.format(name, code, number);
                countinfo += 1;
                assexml += items;

            });

            if (params.length < 1) {
                GSDialog.HintWindow('请选择产品！')
            } else {
                ///////
                
                assexml += "</root>";
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                executeParam = {
                    SPName: "dbo.usp_SaveQDCashflowCheck",
                    SQLParams: [
                        { 'Name': 'CheckXml', 'Value': assexml, 'DBType': 'xml' },
                        { 'Name': 'Countinfo', 'Value': parseInt(countinfo), 'DBType': 'int' },
                        { 'Name': 'UserName', 'Value': sessionStorage.getItem("gs_UserName"), 'DBType': 'string' },
                        { 'Name': 'ProjectId', 'Value': parseInt(ProjectId), 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    app.trustList = params;
                    $.each(app.trustList, function (i, v) {
                        v.href = location.protocol + "//" + location.host + '//' + "quickdeal/#/incomeAnalysis/detail/" + v.number + "/assetsAndCashflow"
                    })
                    $('.allDealTrust').slideToggle()
                });
                ////////////


            }
        })
        $('#addProject').click(function () {
            $('.allDealTrust').slideToggle()
        })
    });
    function changeWidth(obj) {
        var w = $(".main").width();
        obj.css("width", w + "px");
    }
    function initcheckinfo() {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
        executeParam = {
            SPName: "dbo.usp_GetQDCashflowCheck",
            SQLParams: [
                { 'Name': 'projectid', 'Value': parseInt(ProjectId), 'DBType': 'int' },
                { 'Name': 'username', 'Value': sessionStorage.getItem("gs_UserName"), 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            $.each(data, function (i, v) {
                v.href = location.protocol + "//" + location.host + '//' + "quickdeal/#/incomeAnalysis/detail/" + v.number + "/assetsAndCashflow"

                app.trustList = data;
            })
        });
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