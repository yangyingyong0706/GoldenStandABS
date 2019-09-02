var $;
var PoolCutCommon;
var common;
var GlobalVariable;
var GSDialog;
var calendar;
var taskIndicator;
var sVariableBuilder;
var webStorage;
var lang = {};
var userLanguage;

define(function (require) {
    $ = require('jquery');
    RoleOperate = require('gs/roleOperate');
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    common = require('common');
    GlobalVariable = require('gs/globalVariable');
    GSDialog = require('gsAdminPages');
    require('date_input');
    require("ischeck");
    require("jquery.searchSelect");
    var Idcode = common.getQueryString('Idcode');
    taskIndicator = require('gs/taskProcessIndicator');
    sVariableBuilder = require('gs/sVariableBuilder');
    userLanguage = webStorage.getItem('userLanguage');

    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.EnterFile = 'Enter File';
        lang.SelectedFile = 'Selected File'

    } else {
        lang.EnterFile = '选择文件';
        lang.SelectedFile = '浏览'
    }

    var Transform = common.getQueryString('Transform');

    function inputFileClick() {
        $(".input_file_style").find("input").change(function () {
            var value = $(this)[0].value;
            if (value != "") {
                var fmtvalue = (value.split('\\'))[value.split('\\').length - 1]
                $(this).next()[0].innerHTML = lang.SelectedFile;
                value = value.substring(value.lastIndexOf('\\') + 1);
                $(this).parent().parent().children('.file_name').html(value);
            } else {
                $(this).next()[0].innerHTML = lang.EnterFile;
                $(this).parent().parent().children('.file_name').html('');
            }
        })
    }
    inputFileClick();
    $(function () {
        $('#selectLanguageDropdown_ail').localizationTool({
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

                'class:EnterFile_ail': {
                    'en_GB': 'Enter File'
                },
                'id:upload_ail': {
                    'en_GB': 'Upload'
                },
                'id:cancel_ail': {
                    'en_GB': 'Cancel'
                },
                'id:uploadFile_ail': {
                    'en_GB': 'Load File'
                },
                'id:special_plan': {
                    'en_GB': 'Special plan'
                },
                'id:date_ail': {
                    'en_GB': 'Date'
                },
                'id:assetType_ail': {
                    'en_GB': 'Asset Type'
                },
                'id:assetOrigin_ail': {
                    'en_GB': 'Organisation'
                },
                'id:recycleAsset_ail': {
                    'en_GB': 'Recycle Asset'
                }

            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_ail').localizationTool('translate', userLanguage);
        }
        $('body').show();


        $('.date-plugins').date_input();
        $("#checkbox").iCheck({
            checkboxClass: 'icheckbox_square-blue checkbox-position'
        });
        $('#AssetPoolCreationForm .form-control').change(function () {
            common.CommonValidation.ValidControlValue($(this));
        });
        //AssetType
        var executeParam = { SPName: 'dbo.usp_GetDimOrganisationID', SQLParams: [] };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#OrganisationCodeU')
            var options = '';
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.OrganisationCode, v.OrganisationDesc);
            });
            $sel.append(options);


        });
        //organisationCode
        var executeParam = { SPName: 'dbo.usp_GetDimAssetID', SQLParams: [] };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#AssetTypeU')
            var options = '';
            $.each(data, function (i, v) {
                options += '<option value="{0}">{1}</options>'.format(v.AssetType, v.AssetTypeDesc);
            });
            $sel.append(options);

            reloadTrusdId();
        });

        var $sel = $('#AssetTypeU')
        $sel.change(function (e) {
            var selected = e.target.value;
            sessionStorage.setItem("nav.AssetType", selected);
            $('#AssetType').val(sessionStorage.getItem("nav.AssetType"));
            $('#dcAssetType').val(sessionStorage.getItem("nav.AssetType"));
        })


        var $org = $('#OrganisationCodeU')
        $org.change(function (e) {
            var selectedorg = e.target.value;
            sessionStorage.setItem("nav.OrganisationCode", selectedorg);
            $('#OrganisationCode').val(sessionStorage.getItem("nav.OrganisationCode"));
        })
        //下载模板
        $('#downloadTemplate').click(function () {
            common.showDialogPage('./DownloadTemplate.html', '下载模板', $("body").width() * 0.5 + 50, 380, function () { }, true, "", true, false, false);
        })
        function reloadTrusdId() {
            //专项计划渲染
            var executeParam = { SPName: 'TrustManagement.usp_GetTrusts', SQLParams: [] };
            executeParam.SQLParams.push({ Name: 'language', Value: 'zh-cn', DBType: 'string' });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

            CallWCFSvc(serviceUrl, true, 'GET', function (data) {

                var $sel = $('#TrustId')
                var options = '';
                data = data.reverse();
                $.each(data, function (i, v) {
                    if (v.TrustId != '0') {
                        options += '<option value="{0}">{1}</options>'.format(v.TrustId, v.TrustCode);
                    }
                });
                $sel.html('').append(options);
                if (Idcode) {
                    $sel.val(Idcode)
                    $sel.attr("disabled", true);
                    var dataItem = data.filter(function (v) {
                        return v.TrustId == Idcode
                    })
                    $('#OrganisationCodeU').val(dataItem[0].OrganisationCode);
                    $('#AssetTypeU').val(dataItem[0].AssetType);
                    $('#TrustId').attr('trustCode', dataItem[0].TrustCode)
                } else {
                    $sel.val(data[0].TrustId)
                }
                $sel.change(function (e) {
                    var selected = e.target.value;
                    var dataItem = data.filter(function (v) {
                        return v.TrustId == selected
                    })
                    $('#OrganisationCodeU').val(dataItem[0].OrganisationCode);
                    $('#AssetTypeU').val(dataItem[0].AssetType);
                    $('#TrustId').attr('trustCode', dataItem[0].TrustCode)
                })
                $sel.change()
                $('#TrustId').searchableSelect();
                $("[data-toggle='tooltip']").tooltip({});
            });
        }

    });
})

function SubmitFormU() {
    if (!common.checkdate($("#txtRDate")[0])) {
        return false;
    }
    var isFormFieldsAllValid = true;
    $('#AssetPoolCreationForm .form-control').each(function () {
        if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
    });

    if (!isFormFieldsAllValid)
        return false;

    var filePath = $('#fileUploadFileU').val();
    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

    UploadFile('fileUploadFileU', fileName, 'PoolImportData', function (d) {
        RunTaskU(d.FileUploadResult);
    });
}
function Cancel() {
    if (GSDialog.getData() == 99) {
        sessionStorage.removeItem("nav.OrganisationCode");
        sessionStorage.removeItem("nav.AssetType");
    }
    GSDialog.close(0);
}
function RunTaskU(sourceFilePath) {
    var request = getRequest();
    var SessionId = request.SessionId;
    var ActionDisplayName = request.ActionDisplayName

    var IsTopUp = $('input[type=checkbox]:checked').length;
    var TrustCode = $('#TrustId').attr('trustCode');
    var TrustId = $('#TrustId').val();
    var AssetType = $('#AssetTypeU').val();
    var reportingDate = $('#txtRDate').val();
    var OrganisationCode = $('#OrganisationCodeU').val();

    var filePath = $('#fileUploadFileU').val();
    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
    var suffix = fileName.substr(fileName.lastIndexOf("."))
    var taskCodes = { 'AUTO': 'ConsumerLoanDataLoad_AUTO', 'RMBS': 'ConsumerLoanDataLoad_RMBS', 'CLO': 'ConsumerLoanDataLoad_CLO', 'ConsumerLoan': 'ConsumerLoanDataLoad_ConsumerLoan', 'ABN': 'ConsumerLoanDataLoad_ABN', 'CreditCard': 'ConsumerLoanDataLoad_CreditCard', 'Receivables': 'ConsumerLoanDataLoad_Receivables', 'MarginTrading': 'ConsumerLoanDataLoad_MarginTrading' };
    var taskCode = taskCodes[AssetType];
    if ((AssetType == "CreditCard" && suffix == ".csv") || (AssetType == "CreditCard" && suffix == ".CSV")) {
        taskCode = "ConsumerLoanDataLoad_CreditCard_CSV";
    }
    if ((AssetType == "ConsumerLoan" && suffix == ".csv") || (AssetType == "ConsumerLoan" && suffix == ".CSV")) {
        taskCode = "ConsumerLoanDataLoad_ConsumerLoan_CSV";
    }
    sVariableBuilder.AddVariableItem('Reporting_Date', reportingDate, 'String', 1, 0, 0);
    sVariableBuilder.AddVariableItem('SourceFileName', sourceFilePath, 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('Organisation', OrganisationCode, 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('AssetType', AssetType, 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('TrustCode', TrustCode, 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('DimTrustID', TrustId, 'String', 0, 0, 0);
    //sVariableBuilder.AddVariableItem('IsTopUp', GSDialog.getData(), 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('IsTopUp', IsTopUp, 'Int', 0, 0, 0);

    var sVariable = sVariableBuilder.BuildVariables();

    var tIndicator = new taskIndicator({
        width: 900,
        height: 550,
        clientName: 'TaskProcess',
        appDomain: 'ConsumerLoan',
        taskCode: taskCode,
        sContext: sVariable,
        callback: function () {
            if (GSDialog.getData() != 99) {

                //更新任务单状态 
                if (SessionId && ActionDisplayName) {
                    UpdateTaskListStatus(SessionId, ActionDisplayName);
                }

                //save context
                sessionStorage.setItem("TrustId_" + SessionId, TrustId);
                sessionStorage.setItem("trustCodes" + SessionId, TrustCode);
                sessionStorage.setItem("ReportingDate_" + SessionId, reportingDate);
                sessionStorage.setItem("sessionnamecode" + request.SessionId, TrustCode + '$' + TrustId);
                sessionStorage.setItem("currentsession", request.SessionId);
                //close current dialog
                $(frameElement).parent().parent().find("#modal-close").click();
            }
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

function UpdateTaskListStatus(SessionId, ActionDisplayName) {
    var executeParams = {
        SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
            { Name: 'SessionId', value: SessionId, DBType: 'string' },
            { Name: 'ProcessActionName', value: ActionDisplayName, DBType: 'string' }
        ]
    };
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
       
    });
}