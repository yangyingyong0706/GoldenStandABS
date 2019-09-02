
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
var tid;

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
    tid = common.getQueryString('tid');
    
    taskIndicator = require('gs/taskProcessIndicator');
    sVariableBuilder = require('gs/sVariableBuilder');
    lang.EnterFile = '选择文件';
    lang.SelectedFile = '浏览'

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
       
        $('body').show();

        $('.date-plugins').date_input();
        $("#checkbox").iCheck({
            checkboxClass: 'icheckbox_square-blue checkbox-position'
        });
        $('#AssetPoolCreationForm .form-control').change(function () {
            common.CommonValidation.ValidControlValue($(this));
        });
        //AssetType
        var executeParam = {
            SPName: 'TrustManagement.usp_GetTrusteeReportDate', SQLParams: [
                { "Name": "trustId", "value": tid, "DBType": "int" }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#ReportDate')
            var options = '';
            if (data.length == 0) {
                var tips = "产品没有报告日";
                options += '<option value="{0}">{1}</options>'.format(tips, tips);
            }
            $.each(data, function (i, v) {
                if (v.TrustId !== 0) {
                    //options += '<option value="{0}">{1}</options>'.format(v.OrganisationCode, v.OrganisationDesc);
                    var datestr = common.getStringDate(v.TrusteeReportingDate).dateFormat('yyyy-MM-dd');
                    options += '<option value="{0}">{1}</options>'.format(datestr, datestr);
                }
            });
            $sel.append(options);

        });
        //organisationCode
        var executeParam = {
            SPName: 'TrustManagement.usp_GetPythonListPage', SQLParams: [
                { "Name": "TemplateType", "value": 'Python', "DBType": "string" }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
            var $sel = $('#DataPlan')
            var options = '';
            $.each(data, function (i, v) {
                if (v.TrustId !== 0) {

                    options += '<option value="{0}">{1}</options>'.format(v.Id, v.FunctionName);
                }
            });
            $sel.append(options);

            //reloadTrusdId();
        });

    });
})

function SubmitFormU() {
    /*
    mengjingui
    增加文件是否上传判断
    */
    if (document.getElementById("fileUploadFileU").value == null || document.getElementById("fileUploadFileU").value == "") {
        GSDialog.HintWindow("请选择上传文件");
        return false;
    }

    var filePath = $('#fileUploadFileU').val();
    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
    document.getElementById("upload_ail").disabled = true;
    UploadFile('fileUploadFileU', fileName, 'PoolImportData', function (d) {
        document.getElementById("upload_ail").disabled = false;
        RunTaskU(d.FileUploadResult);
    });
}

function RunTaskU(sourceFilePath) {
    var ReportingDate = $('#ReportDate').val();
    var PythonScriptId = $('#DataPlan').val();
    
    if (ReportingDate == "产品没有报告日") {
        //alert("产品没有报告日,无法进行解析！");
        GSDialog.HintWindow("产品没有报告日,无法进行解析！");
        return;
    }
    sVariableBuilder.AddVariableItem('TrustId', tid, 'Int', 0, 0, 0);
    sVariableBuilder.AddVariableItem('ReportingDate', ReportingDate, 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('SourceFilePath', sourceFilePath, 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('PythonScriptId', PythonScriptId, 'int', 0, 0, 0);

    var sVariable = sVariableBuilder.BuildVariables();

    var tIndicator = new taskIndicator({
        width: 900,
        height: 550,
        clientName: 'TaskProcess',
        appDomain: 'Task',
        taskCode: 'BuildTrustLoanServiceReportByPython',
        sContext: sVariable,
        callback: function () {
            window.parent.location.reload(true);
        }
    });
    tIndicator.show();

}











