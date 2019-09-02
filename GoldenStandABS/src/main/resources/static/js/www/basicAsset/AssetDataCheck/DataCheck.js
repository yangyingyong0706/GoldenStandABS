var $;
var PoolCutCommon;
var common;
var GlobalVariable;
var GSDialog;
var calendar;
var taskIndicator;
var sVariableBuilder;
var viewVerify;
var webStorage;
var toast;
define(function (require) {
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function (predicate) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }

                // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                var thisArg = arguments[1];

                // 5. Let k be 0.
                var k = 0;

                // 6. Repeat, while k < len
                while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                    // d. If testResult is true, return kValue.
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    // e. Increase k by 1.
                    k++;
                }

                // 7. Return undefined.
                return undefined;
            }
        });
    }
    ////////////////////////
    $ = require('jquery');
    toast = require('toast');
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    common = require('common');
    GlobalVariable = require('gs/globalVariable');
    GSDialog = require('gsAdminPages');
    calendar = require('calendar');
    taskIndicator = require('gs/taskProcessIndicator');
    sVariableBuilder = require('gs/sVariableBuilder');
    var kendoGrid = require('kendo.all.min');
    require("kendomessagescn");
    $('#selectLanguageDropdown_dcl').localizationTool({
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
            'v-text::id:selectFile_dcl': {
                'en_GB': "'Enter File'"
            },
            'v-text::id:selectedFile_dcl': {
                'en_GB': "'Enter File'"
            },
            'id:cancel_dcl': {
                'en_GB': 'Cancel'
            },
            'element:legend': {
                'en_GB': 'checksumErrorHistory'
            },
            'id:checksumResult_dcl': {
                'en_GB': 'Results'
            },
            'id:fileName_dcl': {
                'en_GB': 'File Name'
            },
            'id:checksumTime_dcl': {
                'en_GB': 'Time'
            },
            'id:checkOperator_dcl': {
                'en_GB': 'User Name'
            },
            'id:export_dcl': {
                'en_GB': 'Report'
            },
            'id:viewResult_dcl1': {
                'en_GB': 'View Results'
            },
            'id:download_dcl1': {
                'en_GB': 'DownLoad'
            },
            'id:viewResult_dcl2': {
                'en_GB': 'View Results'
            },
            'id:download_dcl2': {
                'en_GB': 'DownLoad'
            },
            'id:jumpPage_dcl': {
                'en_GB': 'Jump Page'
            }
        }
    });



    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_dcl').localizationTool('translate', userLanguage);
    }
    $('body').show();

    var lang = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.checksum = 'Check';
        lang.fileUpload_successfully = '” file upload successfully.';
        lang.waiting_for_checking = 'waiting for checking';
        lang.file_uploading = '” file uploading...';
        lang.checksumResult = 'Results';
    } else {
        lang.checksum = '校验';
        lang.fileUpload_successfully = '” 文件上传成功。';
        lang.waiting_for_checking = '等待校验';
        lang.file_uploading = '” 文件正在上传中...';
        lang.checksumResult = '校验结果-错误占比统计';
    }



    var params = []
    var Vue = require('Vue');
    var vm = new Vue({
        el: '#app',
        data: {
            options: []
            , result: {
                total: 0
                , data: []
            }
            , current: 1
            , pageSize: 10
            , jump: 1
            , file: null
            , filename: ''
            , sourceFilePath: ''
            , sessionId: ''
            , selected: {}
            , percent: 0
            , flag: false
            , xhr: null
            , uploadBtn: lang.checksum
            , uploadBtnDisable: true
            , runTaskStatus: false
            , runTaskHtml: '',
            loading: true,
            show: false
        },
        created: function () {
            this.getAssetTypes();
            this.file = document.getElementById('fileUploadFile');
        },
        methods: {
            uploadFile: function () {
                if (this.filename === '') return;



                if (this.sourceFilePath) {
                    this.runTask();
                    return;
                }

                if (navigator.userAgent.toLowerCase().indexOf('edge') != -1) {
                    $('.progress').css('display', 'block');
                    $('.progress-bar').css('width', '0%');
                    $('#spanprogress').text('0%');
                }

                this.xhr = MultipartUploadFile('fileUploadFile', this.filename, 'DataCheck', function (file) {


                    if (navigator.userAgent.toLowerCase().indexOf('edge') != -1) {
                        //$('.progress').css('display', 'block');
                        $('.progress-bar').css('width', '100%');
                        $('#spanprogress').text('100%');
                    }

                    this.xhr = null;
                    this.percent = 0;
                    this.runTaskHtml = '“' + this.filename + lang.fileUpload_successfully;
                    this.sourceFilePath = file;
                    this.runTask();

                }.bind(this)
                ,
                function (percent) {
                    this.uploadBtn = lang.waiting_for_checking;
                    this.runTaskStatus = true;
                    this.runTaskHtml = '“' + this.filename + lang.file_uploading;
                    this.percent = percent;
                    this.uploadBtnDisable = true;
                }.bind(this));
            },
            selectFile: function () {
                var filePath = this.file.value;
                if (filePath != '') {
                    this.filename = filePath.substring(filePath.lastIndexOf('\\') + 1);
                    this.uploadBtnDisable = false;
                }
            },
            runTask: function () {
                var reportDate = (new Date()).dateFormat('yyyy-M-dd');
                //var val = this.selected;

                var val = $('#dcAssetType').val();
                var selecte = this.options.find(function (v) {
                    return v.AssetType == val;
                });

                var assetType = selecte.AssetType,
                    assetTemplateVerificationTable = selecte.AssetTemplateVerificationTable,
                    criteriaSetname = selecte.CriteriaSetname,
                    organisationCode = selecte.OrganisationCode,
                    verifySourceTable = 'AssetVerification_{0}_{1}_{2}'.format(organisationCode, assetType, (new Date()).dateFormat('yyyy_MM_dd_hh_mm_ss_S'));


                sVariableBuilder.AddVariableItem('connectionString', 'Server=MSSQL;Database=SFM_DAL_ConsumerLoan;Trusted_Connection=True;', 'String', 1);
                sVariableBuilder.AddVariableItem('ReportingDate', reportDate, 'String');
                sVariableBuilder.AddVariableItem('CriteriaSetName', criteriaSetname, 'String');
                sVariableBuilder.AddVariableItem('VerifySourceTable', verifySourceTable, 'String');
                sVariableBuilder.AddVariableItem('VerifyTargetTable', assetTemplateVerificationTable, 'String');
                sVariableBuilder.AddVariableItem('excelFilePath', this.sourceFilePath, 'String');

                var sVariable = sVariableBuilder.BuildVariables();
                console.log(sVariable)
                var taskCode = 'AssetDataVerificationTask';
                //若是消费贷CSV模板
                if (assetType == 'ConsumerLoan' && this.sourceFilePath.substring(this.sourceFilePath.length - 3, this.sourceFilePath.length).toLowerCase() == 'csv')
                    taskCode = 'AssetDataVerificationTask_CSV'
                var tIndicator = new taskIndicator({
                    width: 800,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: taskCode,
                    sContext: sVariable,
                    callback: function () {
                        this.sessionId = sessionStorage.getItem('sessionId');
                        this.uploadBtn = lang.checksum;
                        this.uploadBtnDisable = false;
                    }.bind(this)
                });
                tIndicator.show();
            },
            cancel: function () {
                if (this.xhr != null) {
                    this.xhr.abort();
                    this.xhr = null;
                }
                this.file.value = '';
                this.filename = '';
                this.sourceFilePath = '';
                this.percent = 0;
                this.uploadBtn = lang.checksum;
                this.runTaskStatus = false;
                this.uploadBtnDisable = true;
            },
            removeItem: function () {
                if (params.length < 1) {
                    $.toast({ type: 'warning', message: '请选择数据！' })
                } else {
                    var str = "";
                    $.each(params, function (i, v) {
                        if (i == 0) {
                            str += v
                        } else {
                            str += ";" + v
                        }
                    })
                    sVariableBuilder.AddVariableItem('TaskType', 'Asset', 'String');
                    sVariableBuilder.AddVariableItem('SessionIds', str, 'String');
                    var sVariable = sVariableBuilder.BuildVariables();
                    var taskCode = 'DeleteVerificationResult';
                    var tIndicator = new taskIndicator({
                        width: 800,
                        height: 550,
                        clientName: 'TaskProcess',
                        appDomain: 'Task',
                        taskCode: taskCode,
                        sContext: sVariable,
                        callback: function () {
                            location.reload(true);
                        }.bind(this)
                    });
                    tIndicator.show();
                }
            },
            jumpToPage: function () {
                var page = parseInt(this.jump),
                    totalPage = this.totalPage,
                    current = this.current;
                if (page < 1 || page > totalPage) {
                    this.current = (current === totalPage) ? totalPage : 1;
                    this.jump = this.current;
                } else {
                    this.current = page;
                }
            },

            getAssetTypes: function () {
                var executeParam = {
                    SPName: 'dbo.usp_GettblAssetType', SQLParams: [
                        { 'Name': 'Language', 'Value': 'zh-CN', 'DBType': 'string' }
                                //, { 'Name': 'TrustPeriodType', 'Value': 'PaymentDate_CF', 'DBType': 'string' }
                    ]
                };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    this.options = data;

                    this.selected = this.options[0].AssetType;
                }.bind(this));
            },
        },
        watch: {
            sessionId: function (SessionId) {
                console.log(SessionId)
                var self = this;
                var go;
                if (SessionId === '') return;
                //验证task是否成功
                var executeParamEX = {
                    SPName: 'Verification.usp_GetVerificationStatus', SQLParams: [
                        { Name: 'SessionId', Value: SessionId, DBType: 'string' }
                    ]
                };
                var executeParamEXs = encodeURIComponent(JSON.stringify(executeParamEX));
                var serviceUrlEX = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParamEXs;
                CallWCFSvc(serviceUrlEX, false, 'GET', function (res) {
                    if (res[0].Result == "Success") {//task运行成功
                        go = true
                    } else {
                        go = false
                    }
                }.bind(this));
                if (go) {
                    GSDialog.HintWindow("校验成功", function () {
                        $("body", window.parent.document).find("#importAsset_anl").trigger("click")
                    })
                    return false
                }
                var executeParam = {
                    SPName: 'Verification.usp_GetVerificationDetailList', SQLParams: [
                        { Name: 'SessionId', Value: SessionId, DBType: 'string' }
                        , { Name: 'total', Value: 0, DBType: 'int', IsOutput: true }
                    ]
                };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));

                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParams;

                CallWCFSvc(serviceUrl, true, 'GET', function (res) {
                    if (res.total > 0 || res.data.length > 0) {
                        var filename = this.filename
                        viewVerify(SessionId, filename);
                    }
                }.bind(this));

                var start = (this.current - 1) * this.pageSize + 1,
                    end = this.current * this.pageSize;

                executeParam = {
                    SPName: 'Verification.usp_GetVerificationList', SQLParams: [
                         { Name: 'resultType', Value: 'Asset', DBType: 'string' }
                        //,{ Name: 'start', Value: start, DBType: 'int' }
                        //, { Name: 'end', Value: end, DBType: 'int' }
                        //, { Name: 'orderby', Value: 'StartTime', DBType: 'string' }
                        //, { Name: 'direction', Value: 'desc', DBType: 'string' }
                        , { Name: 'total', Value: 0, DBType: 'int', IsOutput: true }
                    ]
                };

                executeParams = encodeURIComponent(JSON.stringify(executeParam));

                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParams;

                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    this.result = data;
                    $("#grid").html("")
                    var grid = $("#grid").kendoGrid({
                        dataSource: self.result,
                        height: document.body.clientHeight - 60,
                        selectable: "multiple",
                        filterable: true,
                        sortable: true,
                        resizable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            page: 1,
                            pageSize: 10,
                            pageSizes: [10, 20, 30, 50],
                        },
                        columns: [
                            {
                                title: "", width: '50px', headerTemplate: function () {
                                    var t = '<input type="checkbox" id="checkAll" onclick="self.selectAll(this)" style="position:relative;top:-2px;left:-1px"/>';//
                                    return t
                                }, template: function (data) {
                                    var info = data.SessionId
                                    var t = '<input type="checkbox" class="selectbox"  onclick="self.selectCurrent(this)" data-info=' + info + '>';//
                                    return t
                                }, locked: true
                            },
                            {
                                title: "校验结果",
                                width: "auto",
                                template: function (data) {
                                    var t = "<a id='viewResult_dcl1'  href=" + 'javascript:viewVerify(' + "'" + data.SessionId + "'" + "," + "'" + encodeURI(data.fileName) + "'" + ')' + ">查看结果</a>"

                                    return t
                                }
                            },
                            {
                                title: "文件名",
                                field: "fileName",
                                width: "auto",
                            },
                            {
                                title: "校验时间",
                                field: "StartTime",
                                width: "auto",
                            },
                            {
                                title: "校验人",
                                field: "UserId",
                                width: "auto",
                            },
                            {
                                title: "导出",
                                width: "auto",
                                template: function (data) {
                                    //var id = 'downLoad' + data.SessionId
                                    //var t = "<div id=" + id + ">"
                                    var fileName = data.fileName.substring(0, data.fileName.lastIndexOf("."))
                                    //common.downLoadExcelForSyn('/PoolCut/Files/DataCheck/' + fileName + '_' + data.SessionId + '.csv', '下载', fileName + '_' + data.SessionId + '.csv', 'downLoad' + data.SessionId);
                                    var t = '<a href="/PoolCut/Files/DataCheck/{0}_{1}.csv">下载</a>'.format(fileName, data.SessionId);
                                    return t
                                }
                            },
                        ],
                        dataBound: function () {
                            var arry = $(".selectbox");
                            var off = true;
                            $.each(arry, function (i, v) {
                                $.each(params, function (j, k) {
                                    if (k == $(v).attr("data-info")) {
                                        $(v).prop("checked", true);
                                        //count++;
                                    }
                                })
                            })
                            $.each(arry, function (i, v) {
                                if (v.checked != true) {
                                    off = false;
                                }
                            })
                            if (off && arry.length != 0) {
                                $("#checkAll").prop("checked", true)
                            } else {
                                $("#checkAll").prop("checked", false)
                            }

                        }
                    });
                }.bind(this));

            },
            selected: function (selected) {
                sessionStorage.setItem("nav.AssetType", selected);
                $('#AssetTypeU').val(sessionStorage.getItem("nav.AssetType"));
                $('#AssetType').val(sessionStorage.getItem("nav.AssetType"));
            },
            // result: function (result) {
            //     var len = result.data.length;
            //     for (var i = 0; i < len ; i++) {  
            //         common.downLoadExcelForSyn('/PoolCut/Files/DataCheck/' + result.data[i].fileName + '_' + result.data[i].SessionId + '.csv', '下载', result.data[i].fileName + '_' + result.data[i].SessionId + '.csv', 'downLoad' + result.data[i].SNO);
            //     }
            //}

        },

        computed: {
            states: function () {
                var self = this;
                var start = (this.current - 1) * this.pageSize + 1,
                    end = this.current * this.pageSize;

                var executeParam = {
                    SPName: 'Verification.usp_GetVerificationList', SQLParams: [
                        { Name: 'resultType', Value: 'Asset', DBType: 'string' }
                        //,{ Name: 'start', Value: start, DBType: 'int' }
                        //, { Name: 'end', Value: end, DBType: 'int' }
                        // { Name: 'orderby', Value: 'StartTime', DBType: 'string' }
                        //, { Name: 'direction', Value: 'desc', DBType: 'string' }
                        , { Name: 'total', Value: 0, DBType: 'int', IsOutput: true }
                    ]
                };

                var executeParams = encodeURIComponent(JSON.stringify(executeParam));

                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                    this.result = data;
                    var grid = $("#grid").kendoGrid({
                        dataSource: self.result,
                        height: document.body.clientHeight - 60,
                        selectable: "multiple",
                        filterable: true,
                        sortable: true,
                        resizable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            page: 1,
                            pageSize: 10,
                            pageSizes: [10, 20, 30, 50],
                        },
                        columns: [
                            {
                                title: "", width: '50px', headerTemplate: function () {
                                    var t = '<input type="checkbox" id="checkAll" onclick="self.selectAll(this)" style="position:relative;top:-2px;left:-1px"/>';//
                                    return t
                                }, template: function (data) {
                                    var info = data.SessionId
                                    var t = '<input type="checkbox" class="selectbox"  onclick="self.selectCurrent(this)" data-info=' + info + '>';//
                                    return t
                                }, locked: true
                            },
                            {
                                title: "校验结果",
                                width: "auto",
                                template: function (data) {
                                    var t = "<a id='viewResult_dcl1'  href=" + 'javascript:viewVerify(' + "'" + data.SessionId + "'" + "," + "'" + encodeURI(data.fileName) + "'" + ')' + ">查看结果</a>"

                                    return t
                                }
                            },
                            {
                                title: "文件名",
                                field: "fileName",
                                width: "auto",
                            },
                            {
                                title: "校验时间",
                                field: "StartTime",
                                width: "auto",
                            },
                            {
                                title: "校验人",
                                field: "UserId",
                                width: "auto",
                            },
                            {
                                title: "导出",
                                width: "auto",
                                template: function (data) {
                                    //var id = 'downLoad' + data.SessionId
                                    //var t = "<div id=" + id + ">"
                                    var filedName = data.fileName.substring(0, data.fileName.lastIndexOf("."))
                                    //common.downLoadExcelForSyn('/PoolCut/Files/DataCheck/' + filedName + '_' + data.SessionId + '.csv', '下载', filedName + '_' + data.SessionId + '.csv', 'downLoad' + data.SessionId);
                                    var t = '<a href="/PoolCut/Files/DataCheck/{0}_{1}.csv">下载</a>'.format(filedName, data.SessionId);

                                    return t
                                }
                            },
                        ],
                        dataBound: function () {
                            var arry = $(".selectbox");
                            var off = true;
                            $.each(arry, function (i, v) {
                                $.each(params, function (j, k) {
                                    if (k == $(v).attr("data-info")) {
                                        $(v).prop("checked", true);
                                        //count++;
                                    }
                                })
                            })
                            $.each(arry, function (i, v) {
                                if (v.checked != true) {
                                    off = false;
                                }
                            })
                            if (off && arry.length != 0) {
                                $("#checkAll").prop("checked", true)
                            } else {
                                $("#checkAll").prop("checked", false)
                            }

                        }
                    });
                    if (this.result.length == 0) {
                        self.show = true;
                    }
                    self.loading = false;
                }.bind(this));
                $(window).resize(function () {
                    var a = $(window).height() - 80
                    $("#grid").height(a);
                    $("#grid").children(".k-grid-content").height(a - 80)
                    $("#grid").children(".k-grid-content-locked").height(a - 100)
                })
                $(window).resize()
                return 1;

            },
            totalPage: function () {
                return Math.round(this.result.total / this.pageSize);
            }
        }
    });
    this.selectAll = function (that) {
        if ($("#checkAll").is(':checked')) {
            var arry = $(".selectbox");
            $.each(arry, function (i, v) {
                $(v).prop("checked", true);
                var aco = $(v).attr("data-info");
                if (params.indexOf(aco) == -1) {
                    params.push(aco);
                }
            })
        } else {
            var arry = $(".selectbox");
            $.each(arry, function (i, v) {
                $(v).prop("checked", false);
                params.remove($(v).attr("data-info"));
            })
        }
        //if (params.length != 0) {
        //    $("#removeItem").show();
        //} else {
        //    $("#removeItem").hide();
        //}
    }
    this.selectCurrent = function (that) {
        var that = that;
        var arry = $(".selectbox");
        var off = true;
        $.each(arry, function (i, v) {
            if (!v.checked) {
                off = false;
            }
        })
        //$.each(arry, function (i, v) {
        //    var aco = $(v).attr("data-info");
        //    if (v.checked && params.indexOf(aco) == -1) {
        //        params.push(aco);
        //    }
        //})
        if ($(that).is(':checked')) {
            params.push($(that).attr("data-info"));
        } else {
            params.remove($(that).attr("data-info"));
        }
        if (off) {
            $("#checkAll").prop("checked", true);
        } else {
            $("#checkAll").prop("checked", false);
        }
        if (params.length != 0) {
            $("#removeItem").show();
        } else {
            $("#removeItem").hide();
        }
    }
    viewVerify = function (SessionId, fileName) {
        if (!SessionId) return;

        var width = $("body").width() / 1.4;
        var height = $("body").height() / 1.3;
        console.log($("body"));
        var url = GlobalVariable.TrustManagementServiceHostURL + 'basicAsset/AssetDataCheck/VerificationList.html?SessionId=' + SessionId + '&filename=' + escape(fileName) + '&cache=' + Math.ceil(Math.random() * 100 * 380)
        GSDialog.topOpen(lang.checksumResult, url, null, function (result) {
            if (result) {
                window.location.reload();
            }
        }, 800, 500, "", true, true, "", false);
    };
    //
})
