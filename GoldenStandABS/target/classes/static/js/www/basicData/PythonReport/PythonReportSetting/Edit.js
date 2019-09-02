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

    var Id = common.getQueryString("Id") ? common.getQueryString("Id") : "0";
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
            , newfile: null
            , newfile1: null
            , pyfilename: ''
            , xmlfilename: ''
            , pyfileUrl: ''
            , xmlfileUrl: ''
            , pyFilePath: ''
            , xmlPath: ''
            , sessionId: ''
            , selected: {}
            , FunDesc: ''
            , FileDesc: ''
            , pypercent: 0
            , xmlpercent: 0
            , pyxhr: null
            , xmlxhr: null
            , uploadBtn: '更新'
            , pyuploadBtnDisable: true
            , xmluploadBtnDisable: true
            , runTaskStatus: false
            , runTaskHtml: ''
            , UpdateHtml: ''
            , isShow: true
            , isRunTask: false



        },
        created: function () {

            this.file = document.getElementById('fileUploadFile');
            this.file1 = document.getElementById('fileUploadFile1');
            this.getData();

        },
        methods: {
            uploadFile: function () {
                if (this.pyfilename === '') return;
                if (this.xmlfilename === '') return;


                this.pyxhr = UploadFile('fileUploadFile', this.pyfilename, 'LoanServiceReports\\PythonScripts', function (file) {

                    this.pyxhr = null;
                    this.pypercent = 0;
                    this.runTaskHtml += '“' + this.pyfilename + '” 文件上传成功。\n';
                    this.newfile = file;
                    if (this.newfile && this.newfile1) {
                        this.runTask();
                    }
                }.bind(this)
                , function (pypercent) {
                    this.uploadBtn = '等待上传';
                    this.runTaskStatus = true;
                    this.runTaskHtml += '“' + this.pyfilename + '” 文件正在上传中...' + pypercent + '%\n';
                    this.pypercent = pypercent;


                }.bind(this));

                this.xmlxhr = UploadFile('fileUploadFile1', this.xmlfilename, 'LoanServiceReports\\Configs', function (file1) {

                    this.xmlxhr = null;
                    this.xmlpercent = 0;
                    this.runTaskHtml += '“' + this.xmlfilename + '” 文件上传成功。\n';
                    this.newfile1 = file1;
                    if (this.newfile && this.newfile1) {
                        this.runTask();
                    }
                }.bind(this)
                , function (xmlpercent) {
                    this.uploadBtn = '等待上传';
                    this.runTaskStatus = true;
                    this.runTaskHtml += '“' + this.xmlfilename + '” 文件正在上传中...' + xmlpercent + '%\n';
                    this.xmlpercent = xmlpercent;

                }.bind(this));
            },
            selectFile: function (event) {

                var filePath = event.target.value;
                if (filePath != '') {
                    this.pyfilename = filePath.substring(filePath.lastIndexOf('\\') + 1);
                    this.uploadBtnDisable = false;
                }

            },
            selectFile1: function (event) {

                var filePath1 = event.target.value;
                if (filePath1 != '') {
                    this.xmlfilename = filePath1.substring(filePath1.lastIndexOf('\\') + 1);
                    this.uploadBtnDisable1 = false;
                }

            },

            EnableButton: function () {

                this.uploadBtnDisable = false;
                this.uploadBtnDisable1 = false;

            },
            openVerificationResult: function (index, event) {
                event.preventDefault();
                event.stopPropagation();

                var sessionId = this.result.data[index].SessionId;
                var filename = this.result.data[index].FileName;
                var status = this.result.data[index].Status;
                viewVerifyWithStatus(sessionId, filename, status);
            },

            runTask: function () {

                if (this.newfile.length == 0 && this.newfile1.length == 0) {
                    return;
                }

                var executeParam = {
                    SPName: 'TrustManagement.usp_UpdatePythonTask', SQLParams: [
                        { Name: 'Id', Value: Id, DBType: 'int' }
                         , { Name: 'FunctionName', Value: this.FunDesc, DBType: 'string' }
                         , { Name: 'FunctionDescription', Value: this.FileDesc, DBType: 'string' }
                         , { Name: 'ConfigFilePath', Value: this.SetFiles(this.newfile1), DBType: 'string' }
                         , { Name: 'PythonFilePath', Value: this.SetFiles(this.newfile), DBType: 'string' }
                         , { Name: 'Result', Value: 0, DBType: 'int', IsOutput: true }

                    ]
                };


                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (res) {
                    if (res.Result > 0) {

                        console.log("更新成功！");
                        window.parent.document.getElementById('modal-close').click();
                    }
                    else {
                        alert("更新失败！");
                    }
                }.bind(this));



            },
            ReadFiles: function (name) {

                var indexofname = name.lastIndexOf('\/') + 1;
                var path = '';

                path = name.substring(indexofname);

                return path;
            },
            SetFiles: function (name) {

                var indexofname = name.lastIndexOf('\\') + 1;
                var path = '';

                path = name.substring(indexofname);

                return path;
            },

            getData: function () {
                var executeParam = {
                    SPName: 'TrustManagement.usp_GetPythonListById', SQLParams: [
                        { Name: 'Id', Value: Id, DBType: 'int' }
                    ]
                };


                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', function (res) {
                    this.pyfilename = this.ReadFiles(res[0].PythonFileUrl);
                    this.xmlfilename = this.ReadFiles(res[0].ConfigFileUrl);
                    this.pyfileUrl = res[0].PythonFileUrl;
                    this.xmlfileUrl = res[0].ConfigFileUrl;
                    this.pyFilePath = res[0].PythonFilePath;
                    this.xmlPath = res[0].ConfigFilePath;
                    this.FunDesc = res[0].FunctionName;
                    this.FileDesc = res[0].FunctionDescription;
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