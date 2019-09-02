var SubmitFormU;
define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');
    require('vMessage')
    var common = require('common');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var webStore = require('gs/webStorage');
    var PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var GlobalVariable = require('globalVariable');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    //获取链接里面tid的内容
    //var TrustId = common.getQueryString('tid');

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
    


            'id:title1': {
                'en_GB': 'Conversion of accounting records'
            },
            'id:text_submit': {
                'en_GB': 'Uploading files'
            },
            'id:choose_file': {
                'en_GB': 'Select the file'
            },
            'id:content_file': {
                'en_GB': 'Temporary selection of files'
            },
            'id:upload_ail': {
                'en_GB': 'upload'
            },
            'id:tab1': {
                'en_GB': 'Serial number'
            },
            'id:tab2': {
                'en_GB': 'Upload date'
            },
            'id:tab3': {
                'en_GB': 'Original document'
            },
            'id:tab4': {
                'en_GB': 'Converted files'
            }

        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    //验证文件选择必填
    $('.form-control').change(function () {
        common.CommonValidation.ValidControlValue($(this));
    });
    var app = new Vue({
        el: "#main",
        data: {
            fileList: [],
            xmlTemp: "<AccountingCatalog><Catalog><OriginalFilePath>{0}</OriginalFilePath><OriginalFileName>{1}</OriginalFileName><ChangeFilePath>{2}</ChangeFilePath><ChangeFileName>{3}</ChangeFileName><ReportingDateId>{4}</ReportingDateId></Catalog></AccountingCatalog>",
            fileObj:{
                OriginalFileName: '',
                OriginalFilePath: '',
                ChangeFileName: '',
                ChangeFilePath: '',
                ReportingDateId: ""
            },
            companyCode:null,
            loading: true
        },
 
        mounted: function () {
            var self = this;
            self.getList()
            self.loading = false
            //触发文件input时显示文件名
            $("#fileUploadFileU").change(function () {
                var val = $(this).val();
                if (val !== '') {
                    val = val.substring(val.lastIndexOf('\\') + 1);
                    $('.file_name').addClass('filed').text(val).css({ "borderColor": '#ccc' });

                } else {
                    $('.file_name').removeClass('filed').text('暂未选择文件').css({ "borderColor": 'red' })
                }
            })
        },
        methods: {
            getList: function () {
                var self = this;
                var executeParaminfo = {
                    SPName: 'TrustManagement.usp_GetAccountingCatalogHistory', SQLParams: []
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                    if (data && data.length > 0) {
                        $.each(data, function (i,v) {
                            v.ReportingDateId = v.ReportingDateId.toString()
                            v.ReportingDateId = v.ReportingDateId.slice(0, 4) + "-" + v.ReportingDateId.slice(4, 6) + '-' + v.ReportingDateId.slice(6,8)
                        })
                        self.fileList=data
                    }
                })
            },
            SubmitFormU: function () {
                var self = this;
                //必填项验证
                var isFormFieldsAllValid = true;
                $(' .form-control').each(function () {
                    if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
                });
                        if (!isFormFieldsAllValid) {
                            self.$message.error("参数未填写完整！")
                            return false
                        };
                        if (self.companyCode < 0) {
                            self.$message.error("公司代码必须大于0！")
                            return false
                        }
                //获取文件名
                var filePath = $('#fileUploadFileU').val();
         
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                        var myDate = new Date();
                        var SchelDate = myDate.getFullYear().toString() + ('0' + (myDate.getMonth() + 1).toString()).slice(-2) + ('0' + (myDate.getDate().toString())).slice(-2);
                        var SchelDateFormat = myDate.getFullYear().toString() + "-" + ('0' + (myDate.getMonth() + 1).toString()).slice(-2) + "-" + ('0' + (myDate.getDate().toString())).slice(-2);

                        self.fileObj.OriginalFileName = fileName.substr(0, fileName.lastIndexOf('.')) + SchelDate + "_" + self.companyCode + '.xlsx';
                        self.fileObj.ChangeFileName = "调整分录_" + SchelDate + "_" + self.companyCode + '.xlsx';
                        self.fileObj.OriginalFilePath = '/TrustManagementService/ConsumerLoan/AccountingCatalog/' + self.fileObj.OriginalFileName;
                        self.fileObj.ChangeFilePath = '/TrustManagementService/ConsumerLoan/AccountingCatalog/' + self.fileObj.ChangeFileName;
                        self.fileObj.ReportingDateId = SchelDateFormat
                //上传文件
                UploadFile('fileUploadFileU', fileName, 'PoolImportData', function (d) {
                            self.RunTaskU(d.FileUploadResult, fileName);
                });
            },
            RunTaskU: function (sourceFilePath, fileName) {//调用任务进程
                var self=this
                 //存入数组sVariableBuilde.Variables
                sVariableBuilder.AddVariableItem('ContractNo', self.companyCode, 'String', 1, 0, 0);
                sVariableBuilder.AddVariableItem('FilePath', sourceFilePath, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DBName', 'TrustManagement', 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DBServer', 'mssql', 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('sourceFileName', fileName, 'String', 0, 0, 0);

                var myDate = new Date();
                var SchelDate = myDate.getFullYear().toString() + ('0' + (myDate.getMonth() + 1).toString()).slice(-2) + ('0' + (myDate.getDate().toString())).slice(-2);
            
               
                sVariableBuilder.AddVariableItem('DimReportingDateId', SchelDate, 'String', 0, 0, 0);
        
                var sVariable = sVariableBuilder.BuildVariables();

                //上传文件的状态框
                var tIndicator = new taskIndicator({
                    width: 900,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'ConsumerLoan',
                    taskCode: 'AccountingCatalog',
                    sContext: sVariable,
                    callback: function () {
                        sVariableBuilder.ClearVariableItem();

                                var xmlParm = self.xmlTemp.format(self.fileObj.OriginalFilePath, self.fileObj.OriginalFileName, self.fileObj.ChangeFilePath, self.fileObj.ChangeFileName, SchelDate)
                                var executeParaminfo = {
                                    SPName: 'TrustManagement.usp_SaveAccountingCatalogHistory', SQLParams: [
                                    { Name: 'newCatalogXML', value: xmlParm, DBType: 'string' }
                                    ]
                                };
                                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParaminfo, function (data) {
                                    if (data[0].RESULT == 0) {
                                        self.fileList.push(self.fileObj);
                                        self.$message("更新成功");
                                    } else {
                                        self.$message.error("该分录已经存在，插入失败!");
                                        return
                               
                                    }


                            
                                })

                            }
                });
                tIndicator.show();
            }
        }
    })
})