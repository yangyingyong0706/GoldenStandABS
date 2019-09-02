
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
var ActionDisplayName;
var SessionId;
var ScenarioCode;
var toast;
define(function (require) {
    $ = require('jquery');
    toast = require('toast');
    RoleOperate = require('gs/roleOperate');
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    common = require('common');
    GlobalVariable = require('gs/globalVariable');
    GSDialog = require('gsAdminPages');

    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require('date_input');
    require("ischeck");
    require("jquery.searchSelect");
    Idcode = common.getQueryString('Idcode');
    ActionDisplayName = common.getQueryString('ActionDisplayName');
    SessionId = common.getQueryString('SessionId');
    ScenarioCode = common.getQueryString('ScenarioCode');

    IsReportGuide = common.getQueryString('ReportGuide');

    console.log(Idcode)
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
    //if (Transform) {
    //    $('.importDataTitle').show();
    //    $('.form').css({
    //        "border": "1px solid #dedede",
    //        "box-shadow": "0 0 5px 0px rgba(0,0,0,.1)",
    //        "background": "#fdfdfd"
    //    })
    //} else {
    //    $('.importDataTitle').hide()
    //}
    function inputFileClick() {
        $(".input_file_style").find("input").change(function () {
            var value = $(this)[0].value;
            if (value != "") {
                var fmtvalue = (value.split('\\'))[value.split('\\').length - 1]
                $(this).next()[0].innerHTML = lang.SelectedFile;
                value = value.substring(value.lastIndexOf('\\') + 1);
                $(this).parent().parent().children('.file_name').html(value).attr('title', value);
            } else {
                $(this).next()[0].innerHTML = lang.EnterFile;
                $(this).parent().parent().children('.file_name').html('');
            }
        })
    }
    inputFileClick();


   var xhrOnProgress = function (fun) {
    xhrOnProgress.onprogress = fun;
    return function () {
        var xhr = $.ajaxSettings.xhr();
        if(typeof xhrOnProgress.onprogress!=='function')
            return xhr
                if (xhrOnProgress.onprogress && xhr.upload) {
                    xhr.upload.onprogress = xhrOnProgress.onprogress;
                    }
        return xhr
        }
    }
    //////
    function RenderGrid() {
        var filter = " and OperationType=" + 2;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        this.DownLoadHistory = function (Id) {

            var executeParams = {
                SPName: 'TrustManagement.usp_GetUploadLogDownLoad', SQLParams: [
                    { Name: 'Id', value: Id, DBType: 'int' }
                ]
            };
            
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                location.href = location.protocol + "//" + location.host + res[0].DownLoadUrl.split('\\TSSWCFServices')[1];

                //downLoadExcelForSyn(res[0].DownLoadUrl.split('\\TSSWCFServices')[1], t);

            });
        }

        this.DelHistory = function (Id) {
            var executeParams = {
                SPName: 'TrustManagement.usp_DelUploadLog', SQLParams: [
                    { Name: 'Id', value: Id, DBType: 'int' }
                ]
            };
            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                $.toast({ type: 'success', message: '删除成功！', afterHidden:function () {
                    location.reload();
                }});
            });
        }


        this.Download = function (DownLoadUrl, Id) {
            return '<a chref="javascript:void(0);" onclick="self.DownLoadHistory(' + Id + ')">' + '下载' + '</a>' + '<a href="javascript:void(0);" onclick="self.DelHistory(' + Id + ')" style="margin-left:3%;">' + '删除' + '</a>'
        }

        $("#grid").html("")
        var h = $("body").height() - 70 < 0 ? 400 : $("body").height() - 270;
        var Grid = new kendoGridModel(h);
        var self = this;


        var Options = {
            renderOptions: {
                scrollable: true,
                resizable: true
                , columns: [
                               { field: "ReportDate", title: '当前报告日期', width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                             , { field: "FileName", title: '文件名', width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                             , { field: "CreateDate", title: '上传时间', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                             , { field: "DownLoadUrl", template: '#=DownLoadUrl?this.Download(DownLoadUrl,Id):""#', title: '操作', width: "250px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                ]
            }
          , dataSourceOptions: {
              pageSize: 20
              , otherOptions: {
                  orderby: "Id desc"
                  , direction: ""
                  , defaultfilter: filter
                  , DBName: 'TrustManagement'
                  , appDomain: 'TrustManagement'
                  , executeParamType: 'extend'
                  , executeParam: function () {
                      var result = {
                          SPName: 'usp_GetUploadLog', SQLParams: [
                              { Name: 'TrustId', value: Idcode, DBType: 'string' }

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
        $('#AssetPoolCreationForm #txtRDate').change(function () {
            common.formatData($(this)[0]);
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
            common.showDialogPage('./DownloadTemplate.html', '下载模板', $("body").width() * 0.5 + 50, 500, function () { }, true, "", true, false, false);
        })
        function reloadTrusdId() {
             //专项计划渲染
            var userName = webStorage.getItem('gs_UserName');
            var executeParam = { SPName: 'TrustManagement.usp_GetTrustsUploadImportData', SQLParams: [{ Name: 'UserName', Value: userName, DBType: 'string' }] };
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
                    //判断资产类型选择显示和隐藏
                    if (dataItem[0].AssetType == "CreditAccountAllAssets") {//隐藏盒子one
                        $("#typeone").hide();
                        $("#typetwo").show();
                        $("#typetwoex").show();
                    } else {
                        $("#typeone").show();
                        $("#typetwo").hide();
                        $("#typetwoex").hide();
                    }
                    $('#AssetTypeU').val(dataItem[0].AssetType);
                    $('#TrustId').attr('trustCode', dataItem[0].TrustCode)
                })
                $sel.change()
                $('#TrustId').searchableSelect();
                $("[data-toggle='tooltip']").tooltip({});


                if (common.getQueryString('ActionDisplayName') && common.getQueryString('SessionId')) {
                    
                    $('#TrustId').val(JSON.parse(sessionStorage.getItem("ReportValue")).TrustId)
                    $('#TrustId').attr(JSON.parse(sessionStorage.getItem("ReportValue")).TrustCode)
                    $('#TrustId').show();
                    //$('#TrustId').attr("disabled", true)
                    $('#TrustId').next().remove()
                }
            });
        }

        if (IsReportGuide == 1) {
            $("#rechis").show();
            RenderGrid();
        } else {
            $("#rechis").hide();
        }

    });
})
function UploadFiles(fileCtrlIdone, fileNameone, folder, prid1, fnCallback1) {
    var fileDataone = document.getElementById(fileCtrlIdone).files[0];
    var svcUrlone = GlobalVariable.PoolCutServiceURL + 'FileUpload?fileName={0}&fileFolder={1}'.format(
        encodeURIComponent(fileNameone), encodeURIComponent(folder));
    $.ajax({
        url: svcUrlone,
        type: 'POST',
        data: fileDataone,
        cache: false,
        dataType: 'json',
        processData: false,
        xhr: xhrOnProgress(function (e) {
            var percent = Math.floor(e.loaded / e.total * 100);
            if (percent > 0) {
                $("#" + prid1).css("display", "block");
                $("#"+prid1).find(".progress-bar").css("width", percent + "%");
                $("#"+prid1).find(".progress-bar>span").html("" + percent + "%");
            }
            if (percent == 100) {
                $("#" + prid1).css("display", "none");
            }
        }),
        success: function (response) {
            var sourceData;
            if (typeof response == 'string')
                sourceData = JSON.parse(response);
            else
                sourceData = response;
            if (fnCallback1) fnCallback1(sourceData);
        },
        error: function (data) {
            GSDialog.HintWindow('File upload failed!');
        }
    });
}

function SubmitFormU() {
    /*
    mengjingui
    增加文件是否上传判断
    */

    //判断资产类型
    if ($("#AssetTypeU").val() == "CreditAccountAllAssets") {//全账户
        if (document.getElementById("fileUploadone").value == null || document.getElementById("fileUploadone").value == "" ) {
            $.toast({ type: 'warning', message: '请选择上传订单文件!' });
            return false;
        }
        if (document.getElementById("fileUploadtwo").value == null || document.getElementById("fileUploadtwo").value == "") {
            $.toast({ type: 'warning', message: '请选择上传账户文件!' });
            return false;
        }
        if(!common.checkdate($("#txtRDate")[0])) {
            return false;
        }
        var filePathone = $('#fileUploadone').val();
        var fileNameone = filePathone.substring(filePathone.lastIndexOf('\\') + 1);
        var filePathTwo=$("#fileUploadtwo").val();
        var fileNameTwo = filePathTwo.substring(filePathTwo.lastIndexOf('\\') + 1);
        UploadFiles('fileUploadone', fileNameone, 'PoolImportData', 'test_progressone', function (d) {
            sessionStorage.setItem("a", d.FileUploadResult);
            UploadFiles('fileUploadtwo', fileNameTwo, 'PoolImportData', 'test_progresstwo', function (d) {
                sessionStorage.setItem("b", d.FileUploadResult);
                var a = sessionStorage.getItem("a");
                var b = sessionStorage.getItem("b");
                sessionStorage.removeItem("a");
                sessionStorage.removeItem("b");
                RunTaskNew(a, b)
            })
        })
      

    } else {

        if (document.getElementById("fileUploadFileU").value == null || document.getElementById("fileUploadFileU").value == "") {
            $.toast({ type: 'warning', message: '请选择上传文件!' });
            return false;
        }

        else if (!common.checkdate($("#txtRDate")[0])) {
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
        document.getElementById("upload_ail").disabled = true;
        UploadFile('fileUploadFileU', fileName, 'PoolImportData', function (d) {
            document.getElementById("upload_ail").disabled = false;

            if (IsReportGuide == 1) {
                var executeParams = {
                    SPName: 'TrustManagement.usp_GenerateUploadLog', SQLParams: [
                        { Name: 'TrustId', value: Idcode, DBType: 'string' },
                        { Name: 'ReportDate', value: $('#txtRDate').val(), DBType: 'string' },
                        { Name: 'FileName', value: d.FileUploadResult.slice(d.FileUploadResult.lastIndexOf("\\") + 1), DBType: 'string' },
                        { Name: 'DownLoadUrl', value: d.FileUploadResult, DBType: 'string' },
                        { Name: 'UserName', value: webStorage.getItem('gs_UserName'), DBType: 'string' },
                        { Name: 'OperationType', value: 2, DBType: 'string' }

                    ]
                };
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                    RunTaskU(d.FileUploadResult);
                });

            } else {
                RunTaskU(d.FileUploadResult);
            }


        });

    }

 
}
function Cancel() {
    if (GSDialog.getData() == 99) {
        sessionStorage.removeItem("nav.OrganisationCode");
        sessionStorage.removeItem("nav.AssetType");
    }
    GSDialog.close(0);
}
function RunTaskU(sourceFilePath) {
    var IsTopUp = $('input[type=checkbox]:checked').length;
    var TrustCode = $('#TrustId').attr('trustCode');
    var TrustId = $('#TrustId').val();
    var AssetType = $('#AssetTypeU').val();
    var reportingDate = $('#txtRDate').val();
    var OrganisationCode = $('#OrganisationCodeU').val();

    var filePath = $('#fileUploadFileU').val();
    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
    var suffix = fileName.substr(fileName.lastIndexOf("."))
    var taskCodes = { 'AUTO': 'ConsumerLoanDataLoad_AUTO', 'RMBS': 'ConsumerLoanDataLoad_RMBS', 'CLO': 'ConsumerLoanDataLoad_CLO', 'ConsumerLoan': 'ConsumerLoanDataLoad_ConsumerLoan', 'ABN': 'ConsumerLoanDataLoad_ABN', 'CreditCard': 'ConsumerLoanDataLoad_CreditCard', 'Receivables': 'ConsumerLoanDataLoad_Receivables', 'MarginTrading': 'ConsumerLoanDataLoad_MarginTrading', 'FinanceLease': 'ConsumerLoanDataLoad_FinanceLease', 'CreditAccountAllAssets': 'ConsumerLoanDataLoad_CreditAccountAllAssets' };
    var taskCode = taskCodes[AssetType];
    //if (suffix == ".csv" || suffix == ".CSV") {
    //    taskCode = "ConsumerLoanDataLoad_CreditCard_CSV";
    //}
    if ((AssetType == "CreditCard" && suffix == ".csv") || (AssetType == "CreditCard" && suffix == ".CSV")) {
        taskCode = "ConsumerLoanDataLoad_CreditCard_CSV";
    }
    if ((AssetType == "ConsumerLoan" && suffix == ".csv") || (AssetType == "ConsumerLoan" && suffix == ".CSV")) {
        taskCode = "ConsumerLoanDataLoad_ConsumerLoan_CSV";
    }
    if ((AssetType == "AUTO" && suffix == ".csv") || (AssetType == "AUTO" && suffix == ".CSV")) {
        taskCode = "ConsumerLoanDataLoad_AUTO_CSV";
    }
    console.log(taskCode);
    if (ActionDisplayName && SessionId && ScenarioCode) {
        var ReportValue = {
            TrustCode: TrustCode,
            TrustId: TrustId,
            tid: TrustId
        };
        sessionStorage.setItem("ReportValue", JSON.stringify(ReportValue));
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
                if (decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))) && common.getQueryString('SessionId')) {
                    var executeParams = {
                        SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                            { Name: 'SessionId', value: common.getQueryString('SessionId'), DBType: 'string' },
                            { Name: 'ProcessActionName', value: decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))), DBType: 'string' }

                        ]
                    };
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                        $(frameElement).parent().parent().find("#modal-close").click();
                        //GSDialog.HintWindow('运行成功');
                        location.reload();
                    });

                } else {
                    $(frameElement).parent().parent().find("#modal-close").click();
                    location.reload();
                }
                
            }
            if (decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))) && common.getQueryString('SessionId')) {
                var executeParams = {
                    SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                        { Name: 'SessionId', value: common.getQueryString('SessionId'), DBType: 'string' },
                        { Name: 'ProcessActionName', value: decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))), DBType: 'string' }

                    ]
                };
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                    location.reload();
                });

            }
            //$ = require('jquery')
            //$('#OrganisationCodeU').attr('disabled', false);
            //$('#AssetTypeU').attr('disabled', false);
            //$('#dcAssetType').attr('disabled', false);
            //$('#AssetType').attr('disabled', false);
            //$('#OrganisationCode').attr('disabled', false);
            

        }
    });
    tIndicator.show();

}

function RunTaskNew(sourceFilePathone, sourceFilePathtwo) {
    var IsTopUp = $('input[type=checkbox]:checked').length;
    var TrustCode = $('#TrustId').attr('trustCode');
    var TrustId = $('#TrustId').val();
    var AssetType = $('#AssetTypeU').val();
    var reportingDate = $('#txtRDate').val();
    var OrganisationCode = $('#OrganisationCodeU').val();

    var filePath = $('#fileUploadone').val();
    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
    var suffix = fileName.substr(fileName.lastIndexOf("."))
    var taskCodes = { 'AUTO': 'ConsumerLoanDataLoad_AUTO', 'RMBS': 'ConsumerLoanDataLoad_RMBS', 'CLO': 'ConsumerLoanDataLoad_CLO', 'ConsumerLoan': 'ConsumerLoanDataLoad_ConsumerLoan', 'ABN': 'ConsumerLoanDataLoad_ABN', 'CreditCard': 'ConsumerLoanDataLoad_CreditCard', 'Receivables': 'ConsumerLoanDataLoad_Receivables', 'MarginTrading': 'ConsumerLoanDataLoad_MarginTrading', 'FinanceLease': 'ConsumerLoanDataLoad_FinanceLease', 'CreditAccountAllAssets': 'ConsumerLoanDataLoad_CreditAccountAllAssets' };
    var taskCode = taskCodes[AssetType];

    if ((AssetType == "CreditCard" && suffix == ".csv") || (AssetType == "CreditCard" && suffix == ".CSV")) {
        taskCode = "ConsumerLoanDataLoad_CreditCard_CSV";
    }
    if ((AssetType == "ConsumerLoan" && suffix == ".csv") || (AssetType == "ConsumerLoan" && suffix == ".CSV")) {
        taskCode = "ConsumerLoanDataLoad_ConsumerLoan_CSV";
    }
    if ((AssetType == "AUTO" && suffix == ".csv") || (AssetType == "AUTO" && suffix == ".CSV")) {
        taskCode = "ConsumerLoanDataLoad_AUTO_CSV";
    }
    console.log(taskCode);
    if (ActionDisplayName && SessionId && ScenarioCode) {
        var ReportValue = {
            TrustCode: TrustCode,
            TrustId: TrustId,
            tid: TrustId
        };
        sessionStorage.setItem("ReportValue", JSON.stringify(ReportValue));
    }

    sVariableBuilder.AddVariableItem('Reporting_Date', reportingDate, 'String', 1, 0, 0);
    sVariableBuilder.AddVariableItem('SourceFileName', sourceFilePathone, 'String', 0, 0, 0);
    sVariableBuilder.AddVariableItem('SourceOrderFileName', sourceFilePathtwo, 'String', 0, 0, 0);
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
                if (decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))) && common.getQueryString('SessionId')) {
                    var executeParams = {
                        SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                            { Name: 'SessionId', value: common.getQueryString('SessionId'), DBType: 'string' },
                            { Name: 'ProcessActionName', value: decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))), DBType: 'string' }

                        ]
                    };
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                        $(frameElement).parent().parent().find("#modal-close").click();
                        //GSDialog.HintWindow('运行成功');
                        location.reload();
                    });

                } else {
                    $(frameElement).parent().parent().find("#modal-close").click();
                    location.reload();
                }

            }
            if (decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))) && common.getQueryString('SessionId')) {
                var executeParams = {
                    SPName: 'TrustManagement.usp_UpdateTaskListStatus', SQLParams: [
                        { Name: 'SessionId', value: common.getQueryString('SessionId'), DBType: 'string' },
                        { Name: 'ProcessActionName', value: decodeURIComponent(escape(common.getQueryString('ActionDisplayName'))), DBType: 'string' }

                    ]
                };
                var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (res) {
                    location.reload();
                });

            }
            //$ = require('jquery')
            //$('#OrganisationCodeU').attr('disabled', false);
            //$('#AssetTypeU').attr('disabled', false);
            //$('#dcAssetType').attr('disabled', false);
            //$('#AssetType').attr('disabled', false);
            //$('#OrganisationCode').attr('disabled', false);


        }
    });
    tIndicator.show();

}








