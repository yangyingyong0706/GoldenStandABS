var $;
var Vue;
var app;
var RoleOperate;
define(function (require) {
    $ = require('jquery');
    //require('jquery.cookie');
    Vue = require('Vue');
    //require('jquery-ui');
    RoleOperate = require('gs/roleOperate');
    var common = require('gs/uiFrame/js/common');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages')
    //require('fullCalendar');
    //require('date_input');
    //require('gs/uiFrame/js/gs-admin-2.pages');
    //require('app/components/assetPoolList/js/PoolCut_Interface')
    var GlobalVariable = require('gs/globalVariable');
    //var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    //require('anyDialog');

    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    require("jquery.searchSelect");
    var ProjectId = common.getQueryString('ProjectId');
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    require('jquery.cookie');
    //PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    webProxy = require('gs/webProxy');
    function CallWCFSvc(svcUrl, isAsync, rqstType, fnCallback) {
        var sourceData;

        $.ajax({
            cache: false,
            type: rqstType,
            async: isAsync,
            url: svcUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response == 'string')
                    sourceData = JSON.parse(response);
                else
                    sourceData = response;
                if (fnCallback) fnCallback(sourceData);
            },
            error: function (response) { GSDialog.HintWindow('在需要远程源数据时发生错误！'); }
        });

        if (!isAsync) { return sourceData; }
    }
    function init() {
        //$('.date-plugins').date_input();
        $('#AssetPoolCreationForm .form-control').change(function () {
            CommonValidation.ValidControlValue($(this));
        });

        var executeParam = { SPName: 'dbo.usp_GetDimOrganisationID', SQLParams: [] };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#OrganisationCode')
            var options = '';
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.DimOrganisationID, v.OrganisationDesc);
            });

            $sel.append(options);
        });

        var executeParam = { SPName: 'dbo.usp_GetDimAssetID', SQLParams: [] };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#AssetType')
            var options = '';
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.DimAssetTypeID, v.AssetTypeDesc);
            });

            $sel.append(options);
        });

        var executeParam = { SPName: 'TrustManagement.usp_GetTrusts', SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'language', Value: 'zh-cn', DBType: 'string' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#TrustId')
            var options = '';
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.TrustId, v.TrustName);
            });

            $sel.append(options);

        });
    }
    function CreatePool() {
        var poolName = $.trim(app.PoolName);
        var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=DAL_SEC_PoolConfig&appDomain=config&executeParams=";
        var params = [
            ['PoolName', poolName, 'string']
        ];
        var promise = webProxy.comGetData(params, svcUrl, 'usp_GetPoolHeaderByName');
        promise().then(function (response) {
            var resjson = JSON.parse(response)
            if (resjson[0]) {
                if (resjson[0].PoolDescription == poolName) {
                    GSDialog.HintWindowtop("资产池名称重复！")
                    return false;
                }
            }
            CreatePoolcon();
        })
    }

    function CreatePoolcon() {
        var poolName = $.trim(app.PoolName);
        var userName = $.cookie('gs_UserName');
        var isFormFieldsAllValid = true;
        var element = $("#taskIndicatorArea", parent.document)
        $('#AssetPoolCreationForm .form-control').each(function () {
            if (!CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
        });

        if (!isFormFieldsAllValid)
            return false;
        sVariableBuilder.AddVariableItem('PoolName', poolName, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DimOrganisationId', app.DimOrganisationId, 'String', 0, 0);
        sVariableBuilder.AddVariableItem('DimAssetTypeId', app.DimAssetTypeId, 'String', 0, 0);
        sVariableBuilder.AddVariableItem('DimReportingDateId', app.RDate.replace(/-/g, ''), 'String', 0);
        sVariableBuilder.AddVariableItem('PoolType', $('#selPoolType').val(), 'String', 0);
        sVariableBuilder.AddVariableItem('PoolCutTypeCode', $('#selPoolCutType').val(), 'String', 0);
        sVariableBuilder.AddVariableItem('SoldUnSoldTypeCode', 'OnlyUnsold', 'String', 0);
        sVariableBuilder.AddVariableItem('TargetTrust', '', 'String', 0);
        sVariableBuilder.AddVariableItem('SourceTrust', ''+app.TrustId, 'String', 0);
        sVariableBuilder.AddVariableItem('UserName', userName, 'String', 0);
        sVariableBuilder.AddVariableItem('Overlap', 'true', 'String', 0);
        sVariableBuilder.AddVariableItem('ConfigSqlConnection', 'Server=DAL_SEC;Database=DAL_SEC_PoolConfig;Trusted_Connection=True;', 'String', 0);

        var sVariable = sVariableBuilder.BuildVariables();

        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'ConsumerLoan',
            taskCode: 'ConsumerLoanPoolBaseInit',
            sContext: sVariable,
            callback: function () {
                parent.window.location.reload();//href = '/GoldenStandABS/www/components/assetPoolList/AssetPoolList.html';
                $('#modal-close', parent.document)[0].click()
                sVariableBuilder.ClearVariableItem();
            }
        });

        tIndicator.show();
    }
    function CancelCreation() {
        GSDialog.close(0);
    }

    $(function () {
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
                'element:title': {
                    'en_GB': 'Base asset pool'
                },
                'id:pool_name': {
                    'en_GB': 'Asset pool name'
                },
                'id:special_plan': {
                    'en_GB': 'Special Plan'
                },
                'id:report_date': {
                    'en_GB': 'Report Date'
                },
                'id:defind_company': {
                    'en_GB': 'Target institutions'
                },
                'id:asset_type': {
                    'en_GB': 'Asset Type'
                },
                'id:createpool': {
                    'en_GB': 'Create'
                }
            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
        }
        $('body').show();

        app = new Vue({
            el: '#AssetPoolCreationForm',
            data: {
                PoolName: '',
                items: [],
                TrustId: {},
                OrganisationCode: '',
                AssetType: '',
                rditems:[],
                RDate:'',
                DimOrganisationId: '',
                DimAssetTypeId: ''
               
            },
            methods: {
                init: function () {
                    var self = this;
                    var executeParam = { SPName: 'TrustManagement.usp_GetTrustsAll', SQLParams: [] };
                    
                    executeParam.SQLParams.push({ Name: 'UserName', Value: RoleOperate.cookieName(), DBType: 'string' });
                    if (ProjectId) {
                        executeParam.SQLParams.push({ Name: 'ProjectId', Value: ProjectId, DBType: 'int' });
                    }
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
                    CallWCFSvc(serviceUrl, false, 'GET', function (data) {
                        if (!data[0]['TrustId']) {
                            alert('专项计划为空');
                            return;
                        }
                        self.items = data;
                        self.TrustId = data[0]['TrustId'];

                        var tmp = app.items.filter(function (currentValue) {
                            return currentValue.TrustId == app.TrustId
                        });
                        self.OrganisationCode = tmp[0]['ODesc'];
                        self.DimOrganisationId = tmp[0]['OId'];

                        self.AssetType = tmp[0]['TDesc'];
                        self.DimAssetTypeId = tmp[0]['TId'];

                        self.rditems = JSON.parse(tmp[0]['values']);
                        self.RDate = self.rditems[0]['DId'];

                        if (!self.RDate) {
                            alert('报告日期为空');
                            return;
                        }
                        Vue.nextTick(function () {
                            $('#TrustId').searchableSelect();
                            $("#TrustId").change(function () {
                                
                                app.selectVal()
                            })
                        })
                     
                    });

                  
                   
                },
                selectVal: function () {
                    var tmp;
                    $.each(app.items, function (i, v) {
                        if (v.TrustCode == $('.searchable-select-holder').text()) {
                            tmp=v
                        }
                    })
                    this.OrganisationCode = tmp.ODesc;
                    this.DimOrganisationId = tmp.OId;
                    this.TrustId = $('#TrustId').val();
                    this.AssetType = tmp.TDesc;
                    this.DimAssetTypeId = tmp.TId;
                    this.rditems = JSON.parse(tmp.values); 
                    this.RDate = this.rditems[0]['DId'];
                }
            }

        });
        app.init();

        //init();
        $('#createpool').click(function () {
            CreatePool();
        });
        $('#cancelcreation').click(function () {
            CancelCreation();
        });
    })
})