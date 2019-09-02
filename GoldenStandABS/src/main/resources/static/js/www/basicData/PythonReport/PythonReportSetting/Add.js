define(function (require) {
    var $ = require('jquery');
    var anydialog = require('anyDialog');
    var roleOperate = require('gs/uiFrame/js/roleOperate');
    var GSDialog = require("gsAdminPages");
    var common = require('common');
    var Vue = require('Vue2');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var CallWCFSvc = appGlobal.CallWCFSvc;
    /////////////

    var currentPage = window;
    new Vue({
        el: '#app',
        data: {
            options: []
            , result: {
                total: 0
                , data: []
            }
            , current: 1
            , pageSize: 15
            , jump: 1
            , file: null
            , file1: null
            , filename: ''
            , filename1: ''
            , sourceFilePath: ''
            , sourceFilePath1: ''
            , sessionId: ''
            , selected: {}
            , FunDesc: ''
            , FileDesc: ''
            , percent: 0
            , percent1: 0
            , xhr: null
            , uploadBtn: '上传'
            , uploadBtnDisable: true
            , uploadBtnDisable1: true
            , uploadBtnDisable2: true
            , runTaskStatus: false
            , runTaskHtml: ''
            , xhr1: null
            , isShow: true


        },
        created: function () {

            this.file = document.getElementById('fileUploadFile');
            this.file1 = document.getElementById('fileUploadFile1');

        },
        methods: {
            uploadFile: function () {
                if (this.filename === '') return;
                if (this.filename1 === '') return;
                if (!this.uploadBtnDisable2) {
                    this.xhr = UploadFile('fileUploadFile', this.filename, 'LoanServiceReports\\PythonScripts', function (file) {
                        this.xhr = null;
                        this.percent = 0;
                        this.runTaskHtml += '“' + this.filename + '” 文件上传成功。\n';
                        this.sourceFilePath = file;

                    }.bind(this)
                    , function (percent) {
                        this.uploadBtn = '等待上传';
                        this.runTaskStatus = true;
                        this.runTaskHtml += '“' + this.filename + '” 文件正在上传中...' + percent + '%\n';
                        this.percent = percent;

                    }.bind(this));

                    this.xhr1 = UploadFile('fileUploadFile1', this.filename1, 'LoanServiceReports\\Configs', function (file1) {

                        this.xhr1 = null;
                        this.percent1 = 0;
                        this.runTaskHtml += '“' + this.filename1 + '” 文件上传成功。\n';
                        this.sourceFilePath1 = file1;
                        this.runTask();
                    }.bind(this)
                    , function (percent1) {
                        this.uploadBtn = '等待上传';
                        this.runTaskStatus = true;
                        this.runTaskHtml += '“' + this.filename1 + '” 文件正在上传中...' + percent1 + '%\n';
                        this.percent1 = percent1;

                    }.bind(this));

                }
            },
            selectFile: function (event) {

                var filePath = event.target.value;
                if (filePath != '') {
                    this.filename = filePath.substring(filePath.lastIndexOf('\\') + 1);
                    this.uploadBtnDisable = false;
                }

            },
            selectFile1: function (event) {

                var filePath1 = event.target.value;
                if (filePath1 != '') {
                    this.filename1 = filePath1.substring(filePath1.lastIndexOf('\\') + 1);
                    this.uploadBtnDisable1 = false;
                }

            },
            openVerificationResult: function (index, event) {
                event.preventDefault();
                event.stopPropagation();

                var sessionId = this.result.data[index].SessionId;
                var filename = this.result.data[index].FileName;
                var status = this.result.data[index].Status;
                viewVerifyWithStatus(sessionId, filename, status);
            },

            Verification: function () {


                var funNmae = $("#functionName").val();

                if (funNmae.length == 0) {
                    alert("请输入功能名称！");
                    return false;
                }

                else {
                    var executeParam = {
                        SPName: 'TrustManagement.usp_CheckPythonFunctionName', SQLParams: [
                           { Name: 'FunctionName', Value: funNmae, DBType: 'string' }
                         , { Name: 'Result', Value: 0, DBType: 'int', IsOutput: true }
                        ]
                    };
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
                    CallWCFSvc(serviceUrl, true, 'GET', function (res) {

                        if (res.Result == 1) {
                            this.uploadBtnDisable2 = false;
                            return true;
                        }
                        else {
                            alert("功能名称已存在，请修改！");
                            return false;
                        }
                    }.bind(this));
                }
            },
            runTask: function () {

                var executeParam = {
                    SPName: 'TrustManagement.usp_SavePythonTask', SQLParams: [
                       { Name: 'FunctionName', Value: this.FunDesc, DBType: 'string' }
                     , { Name: 'FunctionDescription', Value: this.FileDesc, DBType: 'string' }
                     , { Name: 'ConfigFilePath', Value: this.filename1, DBType: 'string' }
                     , { Name: 'PythonFilePath', Value: this.filename, DBType: 'string' }
                     , { Name: 'Result', Value: 0, DBType: 'int', IsOutput: true }

                    ]
                };
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (res) {

                    if (res.Result == 1) {

                        console.log("保存数据库成功！");
                        window.parent.document.getElementById('modal-close').click();
                    }
                    else {
                        alert("保存数据库失败！");
                    }
                }.bind(this));
            }

        },
        watch: {
            sessionId: function (SessionId) {
                if (SessionId === '') return;
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
                        var filename = this.filename.slice(0, -5);

                        viewVerify(SessionId, filename);
                    }
                    else {
                        GSDialog.Reload(10001);

                    }
                }.bind(this));
            }
        },
        computed: {

            totalPage: function () {
                return Math.round(this.result.total / this.pageSize);
            }
        }
    });

    var closeDialogCallback = function () {
        GSDialog.Reload(10001);
    };

    function viewVerify(SessionId, fileName) {
        openViewVerifyDialog({ SessionId: SessionId, fileName: fileName, cache: Math.ceil(Math.random() * 100 * 380) });
    }

    function viewVerifyWithStatus(SessionId, fileName, Status) {
        openViewVerifyDialog({ SessionId: SessionId, fileName: fileName, Status: Status, cache: Math.ceil(Math.random() * 100 * 380) });
    }

    function openViewVerifyDialog(data) {
        if (!data || !data.SessionId) return;
        var width = $(top).width() / 1.4;
        var height = $(top).height() / 1.3;
        var url = 'Pages/DataCheckDetail.html?SessionId=' + data.SessionId + '&cache=' + data.cache;
        if (data && data.Status) {
            url += '&Status=' + data.Status;
        }
        GSDialog.Open(data.fileName + ' 校验结果', url, null, closeDialogCallback, width, height);
    }



    function UploadFile(fileCtrlId, fileName, folder, fnCallback, fnProcess) {
        var fileData = document.getElementById(fileCtrlId).files[0];
        var svcUrl = GlobalVariable.PoolCutServiceURL;

        fileName = encodeURIComponent(fileName);
        folder = encodeURIComponent(folder);
        var options = {
            type: 'POST',
            cache: false,
            dataType: 'json',
            processData: false,
            error: function (xhr, status) {
                if (xhr) {
                    if (status === 'abort') {
                        alert('文件上传已取消!');
                    } else if (status == 'timeout') {
                        alert('文件上传超时!');
                    } else {
                        alert('文件上传失败!');
                    }
                }
            }
        };

        if (window.FormData) { // 如果支持H5的FormData API
            var data = new FormData();
            data.append('file', fileData);

            $.extend(options, {
                url: svcUrl + 'MultipartFileUpload?fileName=' + fileName + '&fileFolder=' + folder,
                data: data,
                xhr: function () {
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload) {
                        xhr.upload.onprogress = function (e) {
                            var loaded = e.loaded || e.position;
                            var total = e.total || e.totalSize;
                            var percent = 0;
                            if (e.lengthComputable) {
                                percent = Math.floor(loaded / total * 100); // 转换成百分比
                            }
                            if (fnProcess) fnProcess(percent);
                        }
                        return xhr;
                    }
                },
                success: function (response) {
                    var sourceData;
                    if (typeof response == 'string')
                        sourceData = JSON.parse(response);
                    else
                        sourceData = response;
                    if (fnCallback) fnCallback(sourceData.MultipartFileUploadResult);
                }
            });
        } else {
            $.extend(options, {
                url: svcUrl + 'FileUpload?fileName=' + fileName + '&fileFolder=' + folder,
                data: fileData,
                success: function (response) {
                    var sourceData;
                    if (typeof response == 'string')
                        sourceData = JSON.parse(response);
                    else
                        sourceData = response;
                    if (fnCallback) fnCallback(sourceData.FileUploadResult);
                }
            });
        }

        return $.ajax(options);
    }




})