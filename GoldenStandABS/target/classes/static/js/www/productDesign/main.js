var viewModel = {};
define(function (require) {
    var $ = require('jquery');
    //var ui = require('jquery-ui');
    //require(['app/productDesign/kendoGridModel']);
    //var designMain = require('app/components/assetPoolList/js/main');
    require('gs/moduleExtensions');
    var webProxy = require('gs/webProxy');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    ko.mapping = mapping;
    var anydialog = require('anyDialog');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    require('gs/uiFrame/js/gs-admin-2.pages');
    require('asyncbox');
    var tm = require('gs/parentTabModel');
    var fileUploader = require('gs/fileUploader');
    // Params Initialization
    var ribbonDefaultApp = 'ProductDesign';
    var ribbonDefaultModule = 'Index';
    require('jquery-ui');
    require('bootstrap');
    require('gs/uiFrame/js/gs-admin-2.pages');
    require('asyncbox');
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var Vue = require('Vue');
    var lang = {};
    //var datesModel;
    //var viewModel;

    var ribbonRenderTmpl = {
        tabLi: '<li class="renderli" app="{0}"><a href="#{0}" role="button">{1}</a></li>',
        tabContainer: '<div id="{0}" class="ribbonBox"><ul>{1}</ul></div>',
        groupLi: '<li class="ribbonGroup" module="{0}" style="display: list-item;">{1}<p class="groupTitle">{2}</p></li>',
        maxButton: '<a href="{2}" id="menu-{4}" data-action="{5}" class="ribbonButton disabled" {3} style="display: inline-block;"> <i class="{0}"></i><p>{1}</p></a>',
        mediumButtonContainer: '<div class="ribbonButtonSmall">{0}</div>',
        mediumButton: '<a href="{2}" class="disabled" {3}><i class="{0}"></i><span>{1}</span></a>'
    };
    // -- End of Params Initialization

    function loadRibbon() {
        var xmlUrl = '/GoldenStandABS/www/productDesign/ribbon.json';
        lang.trustList = "资产池列表";
        lang.productList = "产品列表";
        lang.productdesign = "产品设计_";
        lang.pressuretest = "压力测试_";
        lang.fasttest = "快速压力测试_";
        lang.producttest = "动态产品测试_";
        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage && userLanguage.indexOf('en') > -1) {
            lang.trustList = "Asset pool list";
            lang.productList = "Product list";
            lang.productdesign = "product design: ";
            lang.pressuretest = "Pressure test: ";
            lang.fasttest = "Fast pressure test: ";
            lang.producttest = "Dynamic product test: ";
            xmlUrl = '/GoldenStandABS/www/productDesign/ribbon_en.json';
        }
        //var xmlUrl = './ribbon.json';
        GSAdmin.init(xmlUrl, function () {
            ribbonTabClickEventBind();

            tabModel = new tm();
            $('.home-tab').click(function () {
                tabModel.goList();
            });
            viewModel = tabModel.init();

            showAssetPoolTab();   //先添加showId:assetPoolList
            showTrustTab();    //再添加showId:trustList

            //加载产品列表trustList
            viewModel.showId('assetPoolList');
            viewModel.changeShowId(viewModel.tabs()[0]);
            function renderIframe() {
                var flage = true;
                $(".chrome-tabs").on("click", ".chrome-tab", function () {
                    var v = $(this).index();
                    if (v == "1" && flage == true) {
                        var h = $("body").height();
                        $("body").find("iframe").eq(v)[0].contentWindow.location.reload(true);
                        flage = false;
                    }
                })
            }
            renderIframe()
        });
    };

    function showAssetPoolTab() {
        var page = webProxy.baseUrl + '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
        openMainIframe(page, 'assetPoolList', lang.trustList);
    }
    function showTrustTab() {
        var page = webProxy.baseUrl + '/GoldenStandABS/www/components/trustList/TrustList.html';
        openMainIframe(page, 'trustList', lang.productList);
    }

    function design() {
        var poolId = gsRibbonButtonClickedEventTransfer('getCheckedPoolId');
        var page = webProxy.baseUrl + '/GoldenStandABS/www/productDesign/design/productDesign.html?PoolId={0}'.format(poolId);
        if (poolId) {
            openNewIframe(page, poolId + '_design', lang.productdesign + poolId);
        }
        else {
            //alert('此页面无法进行产品设计！')
            return;
        }
    }

    function stresstest() {
        var trustId = gsRibbonButtonClickedEventTransfer('getTrustId'); 
        var page = webProxy.baseUrl + '/GoldenStandABS/www/productDesign/stresstest/stresstest.html?TrustId={0}'.format(trustId);
        if (trustId) {
            openNewIframe(page, trustId + '_stress', lang.pressuretest + trustId);
        }
        else {
            //alert('此页面无法进行压力测试！')
            return;
        }
    }

    function quickStressTest() {
        var trustId = gsRibbonButtonClickedEventTransfer('getTrustId');
        var page = webProxy.baseUrl + '/GoldenStandABS/www/productDesign/quickStresstest/stresstest.html?TrustId={0}'.format(trustId);
        if (trustId) {
            openNewIframe(page, trustId + '_quickstress', lang.fasttest + trustId);
        }
        else {
            return;
        }
    }
    function DynamicProDesign() {
        var trustId = gsRibbonButtonClickedEventTransfer('getTrustId');
        var page = webProxy.baseUrl + '/GoldenStandABS/www/productDesign/dynamicProDesign/dynamicProDesign.html?TrustId={0}'.format(trustId);
        if (trustId) {
            openNewIframe(page, trustId + '_quickstress', lang.producttest + trustId);
        }
        else {
            return;
        }
    }

    //主页面不允许关闭（资产池列表和产品列表）
    function openMainIframe(page, key, desc) {
        var newMainTab = {
            id: key,
            url: page,
            name: desc,
            disabledClose: true
        };
        viewModel.tabs.push(newMainTab);
        //viewModel.showId(key);
    }

    function openNewIframe(page, key, desc) {
        var pass = true;
        viewModel.tabs().forEach(function (v, i) {
            if (v.id == key) {
                pass = false;
                viewModel.changeShowId(v);
            }
        })
        if (pass) {
            var newTab = {
                id: key,
                url: page,
                name: desc,
                disabledClose: false
            };
            viewModel.tabs.push(newTab);
            viewModel.changeShowId(newTab);
        }
    }

    function poolRefresh() {
        var poolId = gsRibbonButtonClickedEventTransfer('getCheckedPoolId');
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



        $.each(availableReportingDates, function (k, v) {
            //datesModel.datesId.push(v.dimreportingdateid);
            optViewModel.datesId.push(v);
        });
        //default selected
        if (optViewModel.datesId().length > 0) {
            optViewModel.selectedDateId(optViewModel.datesId()[0].dimreportingdateid);
        }
        

        $.anyDialog({
            title: '选择日期',
            html: $('#dates').show(),
            height: 200,
            width: 200,
            scrollable: true,
            isMaskClickToClose: false,
            dragable: true,
            onClose: function () {
                sVariableBuilder.AddVariableItem('ParentPoolId', poolId, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('IsParent', 0, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('ActionPoolType', 'PoolRefresh', 'string', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DimOrganisationId', poolHeader[0].DimOrganisationID, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DimAssetTypeID', dimAssetTypeId, 'Int', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DimReportingDateId', optViewModel.selectedDateId(), 'Int', 0, 0, 0);

                var sVariable = sVariableBuilder.BuildVariables();

                var tIndicator = new taskIndicator({
                    width: 600,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'ConsumerLoan',
                    taskCode: 'PoolTargetRefresh',
                    sContext: sVariable,
                    callback: function () {
                        location.reload(true);
                    }
                });
                tIndicator.show();
            }
        });


    }

    function poolClose() {

        var poolId = gsRibbonButtonClickedEventTransfer('getCheckedPoolId');
        $('<div></div>').appendTo('body').dialog({
            buttons: {
                '封包': function () { poolStatusChange(poolId, 'RESERVE'); },
                '解包': function () { poolStatusChange(poolId, 'OPEN'); }
            }
        });
        
    }

    function poolSale() {
        var poolId = gsRibbonButtonClickedEventTransfer('getCheckedPoolId');
        $('<div></div>').appendTo('body').dialog({
            buttons: {
                '销售': function () {
                    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=dbo&executeParams=";
                    var params = [
                        ['PoolId', poolId, 'int'],
                    ];

                    var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeader');
                    promise().then(function (response) {
                        var poolStatus;
                        if (typeof response === 'string') { poolStatus = JSON.parse(response)[0].PoolStatusCode; }
                        else { poolStatus = response[0].PoolStatusCode; }

                        if (poolStatus == 'RESERVE') {
                            poolStatusChange(poolId, 'PUBLISH');
                        }
                        else {
                            alert('请先进行封包！');
                        }
                    });
                },
                '赎回': function () { poolStatusChange(poolId, 'RESERVE'); }
            }
        });
    }

    function productDoc() {
        var poolId = gsRibbonButtonClickedEventTransfer('getCheckedPoolId');
        var trustId; var trustName;

        //get trustid
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
            if (typeof response === 'string') { trustName = JSON.parse(response)[0].TrustName; }
            else { trustName = response[0].TrustName; }
        });

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
                alert('done');
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
            alert('updated');
        });
    }

    function ribbonTabClickEventBind() {
        $('.ribbonGroup a').click(function (event) {
            event.preventDefault();

            var action = $(this).data('action');
            
            if (action == 'ProductDesign') {
                design();
            }
            else if (action == 'StressTest') {
                stresstest();
            }
            else if (action == 'QuickStressTest') {
                quickStressTest();
            }
            else if (action == 'AssetPoolRefresh') {
                poolRefresh();
            }
            else if (action == 'AssetPoolClose') {
                poolClose();
            }
            else if (action == 'AssetPoolSale') {
                poolSale();
            }
            else if (action == 'ProductDoc') {
                productDoc();

            } else if (action == 'DynamicProDesign') {
                DynamicProDesign()
            }
        });
    };


    function gsRibbonButtonClickedEventTransfer(fnName) {
        var ifr = document.getElementById(viewModel.showId());
        var win = ifr.window || ifr.contentWindow;

        if (win && win[fnName] && typeof win[fnName] === 'function') {
            return win[fnName]();
        }
    };

    $(function () {
        $('#selectLanguageDropdown_pdhome').localizationTool({
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

                'id:titlePD': {
                    'en_GB': 'Home'
                }

            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_pdhome').localizationTool('translate', userLanguage);
        }

        $('body').show();


        loadRibbon();

        $(".tab-wrap").sortable();



    });
    function changeWidth(obj) {
        var w = $("#main").width();
        obj.css("width", w + "px");
    }
    changeWidth($(".chrome-tabs-shell"));
    $(".fixed_control").click(function () {
        if (parseInt($("#wrapper").css("paddingLeft")) == "200") {
            $("#wrapper").animate({ "paddingLeft": "0" }, function () {
                changeWidth($(".chrome-tabs-shell"));
                $(".fixed_control").css("left", "200px");
                $(".fixed_control").find("i").css("transform", "rotate(" + 180 + "deg)");
            })

        } else {
            $("#wrapper").animate({ "paddingLeft": "200px" }, function () {
                changeWidth($(".chrome-tabs-shell"));
                $(".fixed_control").css("left", "200px")
                $(".fixed_control").find("i").css("transform", "rotate(" + 0 + "deg)");
            })
        }
    })

    $("#DashBoard").on("click", ".click_direction", function () {
        if ($(this).next().is(":visible")) {
            $(this).find("i").removeClass("rotate_fr");
        } else {
            $(this).find("i").addClass("rotate_fr");
        }
        $(this).next().slideToggle(500);
    })
});