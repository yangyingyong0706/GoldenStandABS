define(function (require) {
    var $ = require('jquery');
    //var kendo = require('kendo.all.min');
    //var common = require('gs/uiFrame/js/common');
    //var dataOperate = require('app/transactionManage/script/dataOperate');
    var jQui = require('jquery-ui');
    require('date_input');
    var taskProcessIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    require('app/components/assetPoolList/js/PoolCut_Interface');
    require('date_input');
    var GSDialog = require("gsAdminPages")
    var AllocationTrust;
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    webProxy = require('gs/webProxy');
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


            'id:data': {
                'en_GB': 'Import accounting data'
            },
            'id:date': {
                'en_GB': 'Import date'
            },
            'id:type': {
                'en_GB': 'Data type'
            },
            'id:tab1': {
                'en_GB': 'Accounting voucher'
            },
            'id:tab2': {
                'en_GB': 'Accounting subjects'
            },
            'id:tab3': {
                'en_GB': 'Voucher details'
            },
            'id:choose': {
                'en_GB': 'Select the file'
            },
            'id:file': {
                'en_GB': 'Import file'
            },
            'id:btnUpload': {
                'en_GB': 'upload'
            }

        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();

    (function AllocationTrust() {
        $('.date-plugins').date_input();
        function inputFileClick() {
            $(".input_file_style").find("input").change(function () {
                var value = $(this)[0].value;
                if (value != "") {
                    var fmtvalue = (value.split('\\'))[value.split('\\').length - 1]
                    $(this).next()[0].innerHTML = "浏览";
                    value = value.substring(value.lastIndexOf('\\') + 1);
                    $(this).parent().parent().children('.file_name').html(value);
                } else {
                    $(this).next()[0].innerHTML = "选择文件";
                    $(this).parent().parent().children('.file_name').html('');
                }
            })
        }
        inputFileClick();
        $("#btnUpload").click(function () {
            //debugger
            //alert("test for !!!"); 
            var reportingDate = $("#reportingDate").val();
            var myselect = document.getElementById("select");
            var index = myselect.selectedIndex;
            var op = myselect.options[index].value;

            if (reportingDate == "" || reportingDate == null || reportingDate == undefined) {
                GSDialog.HintWindow("请先添加日期！");
            } else {
                var filePath = $('#fileBasePool').val();
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                if (fileName === '' || fileName === undefined || fileName === null) {
                    GSDialog.HintWindow("请添加文件！");
                    return;
                }
                UploadFile("fileBasePool", fileName, 'accountingData', function () {
                    var TrustId = window.location.href.substring(window.location.href.lastIndexOf('=') + 1);
                    var ReportingDate = $('#reportingDate').val();
                    var dir = 'E:/TSSWCFServices/TrustManagementService/TrustFiles/' + TrustId + '/Asset/';
                    sVariableBuilder.AddVariableItem("TrustId", TrustId, 'NVarChar');
                    sVariableBuilder.AddVariableItem("ReportingDate", ReportingDate, "NVarChar");
                    //sVariableBuilder.AddVariableItem("SourceFilePath_BasePool", dir + files[0].name, "NVarChar");
                    var sVariable = sVariableBuilder.BuildVariables();
                    var TaskCode;
                    if (op == 1) {
                        var TaskCode = 'certificate';
                    } else if (op == 2) {
                        var TaskCode = 'account_subject';
                    } else if (op == 3) {
                        var TaskCode = 'accountDetails';
                    } else {
                        var TaskCode = 'certificate';
                    }
                    var tIndicator = new taskProcessIndicator({
                        width: 600,
                        height: 500,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: TaskCode,
                        sContext: sVariable,
                        callback: function () {
                            window.location.href = webProxy.baseUrl + '/GoldenStandABS/www/accounting/updata/viewAccountingUpdata.html';
                            //"http://abs-dit.goldenstand.cn/GoldenStandABS/www/accounting/updata/viewAccountingUpdata.html"
                        }
                    });
                    tIndicator.show();
                });
            }

            //if (reportingDate != null || reportingDate != "") {
            //    var filePath = $('#fileBasePool').val();
            //    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            //    if (fileName === ' ' || fileName === 'undefined' || fileName === null) {
            //        GSDialog.HintWindow("请添加文件！");
            //        return;
            //    }
                //UploadFile("fileBasePool", fileName, 'accountingData', function () {
                //    var TrustId = window.location.href.substring(window.location.href.lastIndexOf('=') + 1);
                //    var ReportingDate = $('#reportingDate').val();
                //    var dir = 'E:/TSSWCFServices/TrustManagementService/TrustFiles/' + TrustId + '/Asset/';
                //    sVariableBuilder.AddVariableItem("TrustId", TrustId, 'NVarChar');
                //    sVariableBuilder.AddVariableItem("ReportingDate", ReportingDate, "NVarChar");
                //    //sVariableBuilder.AddVariableItem("SourceFilePath_BasePool", dir + files[0].name, "NVarChar");
                //    var sVariable = sVariableBuilder.BuildVariables();
                //    var TaskCode;
                //    if (op == 1) {
                //        var TaskCode = 'certificate';
                //    } else if (op == 2) {
                //        var TaskCode = 'account_subject';
                //    } else if (op == 3) {
                //        var TaskCode = 'accountDetails';
                //    } else {
                //        var TaskCode = 'certificate';
                //    }
                //    var tIndicator = new taskProcessIndicator({
                //        width: 600,
                //        height: 500,
                //        clientName: 'TaskProcess',
                //        appDomain: 'Task',
                //        taskCode: TaskCode,
                //        sContext: sVariable,
                //        callback: function () {
                //            window.location.href = location.protocol + '//' + location.hostname + '/GoldenStandABS/www/accounting/updata/viewAccountingUpdata.html';
                //            //"http://abs-dit.goldenstand.cn/GoldenStandABS/www/accounting/updata/viewAccountingUpdata.html"
                //        }
                //    });
                //    tIndicator.show();
                //});
               
            //} else {
            //    GSDialog.HintWindow("输入有误！");
            //    return false;
            //}
           
        })
    })();
})