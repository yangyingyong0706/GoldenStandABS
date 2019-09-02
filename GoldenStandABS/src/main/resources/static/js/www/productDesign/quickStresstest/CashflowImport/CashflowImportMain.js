var SubmitFormU;
var QuickPressureCashFlowView

define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var webProxy = require('gs/webProxy');
    require('date_input');
    var PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    var GSDialog = require('gsAdminPages');
    var webStore = require('gs/webStorage');
    var TrustId = common.getQueryString('tid');
    require('jquery.localizationTool');
    require("kendomessagescn")
    webStorage = require('gs/webStorage');
    var request = getRequest();
    var ScheduleDateId = "";
    var filter = "";
    
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


            'id:cashLoad': {
                'en_GB': 'Cash flow import'
            },
            'id:loadFile': {
                'en_GB': 'Upload files'
            },
            'id:chooseFile': {
                'en_GB': 'Select File'
            },
            'id:noFile': {
                'en_GB': 'No file selected yet'
            },
            'id:date_ail': {
                'en_GB': 'Date'
            },
            'id:info': {
                'en_GB': 'Tip: Use the new special plan to use this feature, otherwise the feature will override the date setting for the special plan.'
            },
            'id:upload_ail': {
                'en_GB': 'Upload'
            }

        }
    });

    $(function () {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            SPName: 'usp_GetQuickPressureDate', SQLParams: [
                { Name: 'TrustId', value: TrustId, DBType: 'string' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (result) {
            ScheduleDateId = result[0].result;
            var schedulePurposeKey = TrustId + '_SchedulePurpose';
            webStore.setItem(schedulePurposeKey, 0);
            var scheduleDateIdKey = TrustId + '_ScheduleDateId';
            webStore.setItem(scheduleDateIdKey, result[0].result);
            //

        });
        $('#downLoadPCFIT2').click(function () {
            GSDialog.open('模板下载', './DownloadTemplate.html', '', function (result) {
                if (result) {
                    window.location.reload();
                }
            }, 600, 240, '', true, true, true, false);
        downLoadExcelForSyn('/PoolCut/Files/AssetTypeTemplates/PaymentScheduleFiles/计划归集现金流导入模板.xlsx', '下载模板', '计划归集现金流导入模板.xlsx', 'downLoadPCFIT2');
        filter = " and TrustId=" + TrustId + " and Purpose=0 and PoolId=-1 and ScheduleDateId= " + "'" + ScheduleDateId + "'" + " and ReportingDate=" + "'" + "1901-01-01" + "'";
    })
    })

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();
    var langx = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.info = 'No file selected yet';
        
    } else {
        langx.info = "暂未选择文件";
        

    }
    $('.date-plugins').date_input()
    $("#fileUploadFileU").change(function () {
        var val = $(this).val();
        if(val !==''){
             val = val.substring(val.lastIndexOf('\\') + 1);
             $('.file_name').addClass('filed').text(val).css({ "borderColor": '#ccc' });

        } else {
            $('.file_name').removeClass('filed').text(langx.info).css({"borderColor":'red'})
        }
        
    })
    //日期校验
    //$("#txtRDate").change(function () {
    //    var $this = this;
    //    common.formatData($this);
    //})
    $('.form-control').change(function () {
        common.CommonValidation.ValidControlValue($(this));
    });
    /////////////
    SubmitFormU = function () {
        //var dateT = $("#txtRDate")[0];
        //if (!common.checkdate(dateT)) {
        //    return false
        //}
        var isFormFieldsAllValid = true;
        $(' .form-control').each(function () {
            if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
        });
        if (!isFormFieldsAllValid) return false;
        var filePath = $('#fileUploadFileU').val();
        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

        UploadFile('fileUploadFileU', fileName, 'PoolImportData', function (d) {
            RunTaskU(d.FileUploadResult);
        });
    }

    QuickPressureCashFlowView = function () {
        console.log(ScheduleDateId)
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        var executeParam = {
            SPName: 'usp_GetQuickPressureDate', SQLParams: [
                { Name: 'TrustId', value: TrustId, DBType: 'string' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (result) {
            ScheduleDateId = result[0].result;
            console.log(filter)
            filter = " and TrustId=" + TrustId + " and Purpose=0 and PoolId=-1 and ScheduleDateId= " + "'" + ScheduleDateId + "'" + " and ReportingDate=" + "'" + "1901-01-01" + "'";
            RenderGrid()
        });
    }
    function RunTaskU(sourceFilePath) {


        var reportingDate = "1901-01-01";//$('#txtRDate').val();

        sVariableBuilder.AddVariableItem('ReportingDate', reportingDate, 'String', 1, 0, 0);
        sVariableBuilder.AddVariableItem('FilePath', sourceFilePath, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('TrustId', TrustId, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DBName', 'TrustManagement', 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('DBServer', 'mssql', 'String', 0, 0, 0);

        var myDate = new Date();
        var SchelDate = myDate.getFullYear().toString() + ('0' + (myDate.getMonth() + 1).toString()).slice(-2) + ('0' + (myDate.getDate().toString())).slice(-2);
        //////////
        var schedulePurposeKey = TrustId + '_SchedulePurpose';
        var scheduleDateIdKey = TrustId + '_ScheduleDateId';
        webStore.setItem(schedulePurposeKey, 0);
        webStore.setItem(scheduleDateIdKey, SchelDate);

        /////////

        sVariableBuilder.AddVariableItem('ScheduleDateId', SchelDate, 'String', 0, 0, 0);
        sVariableBuilder.AddVariableItem('ReportingDateId', reportingDate.replace(new RegExp("-", "gm"), ""), 'String', 0, 0, 0);

        var sVariable = sVariableBuilder.BuildVariables();

        var tIndicator = new taskIndicator({
            width: 900,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'ConsumerLoan',
            taskCode: 'QuicklyImportAssert',
            sContext: sVariable,
            callback: function () {
                sVariableBuilder.ClearVariableItem();
                //RenderGrid()
                QuickPressureCashFlowView();
            }
        });
        tIndicator.show();
    }
    //获取参数对象
    function getRequest() {
        var url = location.search; //获取url中"?"符后的字串   
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    };
    function RenderGrid() {
        $("#grid").html("")
        var h = $("body").height() - 70 < 0 ? 400 : $("body").height() - 70;
        var Grid = new kendoGridModel(h);
        var self = this;


        var Options = {
            renderOptions: {
                scrollable: true,
                resizable: true
                , columns: [
                               { field: "StartDate", title: '开始时间', width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" }}
                             , { field: "EndDate", title: '结束时间', width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                             , { field: "PrincipalAmount", title: '本金（元）', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                            , { field: "InterestAmount", title: '利息（元）', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                            , { field: "sumPriInter", title: '总和（元）', width: "300px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                            , { field: "ScheduleDateId", title: '导入日期', width: "300px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                ]
            }
          , dataSourceOptions: {
              pageSize: 20
              , otherOptions: {
                  orderby: "EndDate asc"
                  , direction: ""
                  , defaultfilter: filter
                  , DBName: 'TrustManagement'
                  , appDomain: 'TrustManagement'
                  , executeParamType: 'extend'
                  , executeParam: function () {
                      var result = {
                          SPName: 'usp_viewQuickStressTestImportView', SQLParams: [
                              { Name: 'tableOrView', value: 'asset.PaymentScheduleImutation', DBType: 'string' },
                          ]
                      };

                      return result;
                  }
              }
          }
        };


        Grid.Init(Options, 'grid');
        Grid.RunderGrid();

    }
})