define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    require("kendomessagescn");
    require("kendoculturezhCN");
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var GSDialog = require('gsAdminPages');
    var Webstorage = require('gs/webStorage');

    var TrustId = common.getQueryString('trustId');
    var nowStatus = Webstorage.getItem('nowStatus') ? Webstorage.getItem('nowStatus') : 'Creation';
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var height = $(window).height() - 145;
    var kendouiGrid = new kendoGridModel(height);
    var ProjectName= '';

    var xhrOnProgress = function (fun) {
        xhrOnProgress.onprogress = fun;
        return function () {
            var xhr = $.ajaxSettings.xhr();
            if (typeof xhrOnProgress.onprogress !== 'function')
                return xhr
            if (xhrOnProgress.onprogress && xhr.upload) {
                xhr.upload.onprogress = xhrOnProgress.onprogress;
            }
            return xhr
        }
    }
    
    var app = new Vue({
        el: '#PageMainContainer',
        data: {
            fileStatus: [],
            DocType: [],
            uploadMessage: {
                Status: 'Creation',
                docType: 'Report',
                version: '',
                personName: '',
                filePath: ''
            },
        },
        watch: {
            nowStatus: function (nowValue) {
                Webstorage.setItem('nowStatus', nowValue);
            }
        },
        created: function(){
            this.GetfileStatus()
        },
        methods: {
            getfocus: function(){
                $('#docName').removeClass('red-border')
            },
            GetfileStatus: function () {
                var self = this;
                var executeParam = {
                    'SPName': "dbo.usp_getProjectStatus", 'SQLParams': []
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {   
                    //获取文件的所有状态。共七种
                    self.fileStatus = data;
                })
                var executeParam = {
                    'SPName': "dbo.usp_getProjectDocType", 'SQLParams': []
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    //获取文件的所有类型。共2种
                    self.DocType = data;
                })
                var executeParam = {
                    'SPName': "dbo.usp_getProjectName", 'SQLParams': [
                    { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' }
                    ]
                };
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    //获取文件的专项计划名称。
                    ProjectName = data[0].TrustCode;
                })
            },
            OpenUploadWindow: function () {     
                var uploadWindow = $('#uploadFileWindow')
                $.anyDialog({
                    width: 600,	// 弹出框内容宽度
                    height: 444, // 弹出框内容高度
                    title: '上传文件',	// 弹出框标题
                    html: uploadWindow.show(),
                    onClose: function () {
                    }
                });
            },
            DeleteFile: function(){
                var grid = $("#grid").data("kendoGrid");
                if (grid.select().length == 0) {
                    GSDialog.HintWindow("请选择需要删除的文档！");
                } else {
                    //// 获取选中的对象
                    GSDialog.HintWindowTF("确定要删除吗?", function () {
                        var ProjectStatus, DocName, DocType;
                        for (var i = 0; i < grid.select().length; i++) {
                            var data = grid.dataItem(grid.select()[i]);
                            ProjectStatus = data.ProjectStatus;
                            DocName = data.DocName;
                            DocType = data.DocType;
                            var executeParam = {
                                'SPName': "dbo.usp_DeleteFileFromName", 'SQLParams': [
                                { 'Name': 'ProjectStatus', 'Value': ProjectStatus, 'DBType': 'string' },
                                { 'Name': 'DocName', 'Value': DocName, 'DBType': 'string' },
                                { 'Name': 'DocType', 'Value': DocType, 'DBType': 'string' }
                                ]
                            };
                            common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function () {
                                //获取文件的专项计划名称。
                            })
                            //alert(ProjectStatus+DocName+DocType);
                        }
                        GSDialog.HintWindow("删除成功！");
                        window.location.reload(true);
                    })
                }
            },
            UploadFile: function (fileCtrlId, fileName, folder, fnCallback) {
                var fileData = document.getElementById(fileCtrlId).files[0];
                var args = 'trustId=' + TrustId + '&fileFolder=' + folder + '&fileName=' + encodeURIComponent(fileName);
                $.ajax({
                    url: GlobalVariable.DataProcessServiceUrl + 'CopyFile?' + args,
                    type: 'POST',
                    data: fileData,
                    cache: false,
                    dataType: 'json',
                    processData: false, // Don't process the files
                    //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
                    xhr: xhrOnProgress(function (e) {
                        var percent = Math.floor(e.loaded / e.total * 100);
                        if (percent > 0) {
                            $(".progress").css("display", "block");
                            $(".progress").find(".progress-bar").css("width", percent + "%");
                            $(".progress").find(".progress-bar>span").html("" + percent + "%");
                        }
                        if (percent == 100) {
                            $(".progress").css("display", "none");
                        }
                    }),
                    success: function (data) {
                        var path = data.CopyFileResult;
                        fnCallback(path);
                    },
                    error: function (data) {
                        GSDialog.HintWindowtop("上传文件错误！");
                    }
                })
            },
            ShowFilePath: function () {
                var self = this;
                $(".input_file_style").find("input").change(function () {
                    var value = $('#fileUploadFileU').val();
                    var fileName = value.substring(value.lastIndexOf('\\') + 1);
                    if (value != "") {
                        var fmtvalue = (value.split('\\'))[value.split('\\').length - 1]
                        $('.EnterFile_ail').html('浏览');
                        value = value.substring(value.lastIndexOf('\\') + 1);
                        $('.file_name').html(value);
                    } else {      
                        $('.EnterFile_ail').html('选择文件');
                        $('.file_name').html('');
                    }
                })
            },
            UploadFileNew: function () {
                var self = this;
                var value = $('#fileUploadFileU').val();
                var fileName = value.substring(value.lastIndexOf('\\') + 1);
                self.UploadFile('fileUploadFileU', fileName, 'FileManagement', function (data) {
                    self.uploadMessage.filePath = data;
                    var Status = self.uploadMessage.Status;
                    var desPath = self.uploadMessage.filePath;
                    var docType = self.uploadMessage.docType;
                    var version = self.uploadMessage.version;
                    var personName = self.uploadMessage.personName;
                    var docName = $('.file_name').html();

                    if (Status && docType && version && personName && docName) {
                        var times = desPath.split('\\')
                        var history = times[times.length - 1];
                        var executeParam = {
                            'SPName': "dbo.usp_InsertProjectDocInfo", 'SQLParams': [
                                      { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' },
                                      { 'Name': 'ProjectStatus', 'Value': Status, 'DBType': 'string' },
                                      { 'Name': 'DocName', 'Value': docName, 'DBType': 'string' },
                                      { 'Name': 'DocType', 'Value': docType, 'DBType': 'string' },
                                      { 'Name': 'DocVersion', 'Value': version, 'DBType': 'string' },
                                      { 'Name': 'InputPerson', 'Value': personName, 'DBType': 'string' },
                                      { 'Name': 'DocPath', 'Value': desPath, 'DBType': 'string' },
                                      { 'Name': 'History', 'Value': history, 'DBType': 'string' },
                            ]
                        };
                        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function () {
                            GSDialog.HintWindow("上传成功！");
                            window.location.reload(true);
                        })
                    } else {
                        GSDialog.HintWindowtop("请填写完正确信息再上传！")
                    }
                });
            }
        }
    })
    this.OpenHistoryWindow = function (ProjectStatus, DocType, DocName) {
        RendGridHistory(ProjectStatus, DocName, DocType)
        $('#historyData').height(425);
        $('#historyData .k-grid-content').height(338)
        var historyDataWindow = $('#historyData');
        $.anyDialog({
            width: 900,	// 弹出框内容宽度
            height: 500, // 弹出框内容高度
            title: '历史记录',	// 弹出框标题
            html: historyDataWindow.show(),
            onClose: function () {
            }
        });
    },
    $('body').on('click', '#modal-win', function () {
        var maxOr = $('#modal-win').hasClass('icon-window-maximize');
        if (!maxOr) {
            var height = $(window).height() - 100;
            $('#historyData').height(height);
            $('#historyData .k-grid-content').height(height - 87)
        } else {
            $('#historyData').height(425);
            $('#historyData .k-grid-content').height(338)
        }
    })
    this.getStringDate = common.getStringDate;
    this.HistoryButton = function (ProjectStatus, DocName, DocType) {
        return '<button type="button" class="btn btn-link openHistory" onclick="OpenHistoryWindow(\'' + ProjectStatus + '\',\'' + DocType + '\',\'' + DocName + '\')">历史记录</button>';
    }
    this.OpenUpdateFileWindow = function (ProjectStatus, DocName, DocType) {
        var self = this;
        $('#Status').val(ProjectStatus);
        $('#docType').val(DocType);
        $('#docName').val(DocName);
        Webstorage.setItem('Status', ProjectStatus);
        Webstorage.setItem('docType', DocType);
        Webstorage.setItem('docName', DocName);
        var UpdateFileWindow = $('#UpdateFileWindow');
        $.anyDialog({
            width: 600,	
            height: 300, 
            title: '更改文档信息',
            html: UpdateFileWindow.show(),
            onClose: function () {

            }
        });
    }
    $('#UpdateFile').click(function () {
        UpdateFile();
    })
    //更改文档信息
    function UpdateFile() {
        var self = this;
        var ProjectStatus = Webstorage.getItem('Status');
        var DocType = Webstorage.getItem('docType');
        var DocName = Webstorage.getItem('docName');
        var ProjectStatusNew = $('#Status').val();
        var DocTypeNew = $('#docType').val();
        var DocNameNew = $('#docName').val();
        if (DocNameNew == '' || DocNameNew == null) {
            $('#docName').addClass('red-border')
            return false;
        }
        var executeParam = {
            'SPName': "dbo.usp_updateProjectDocInfo",
            'SQLParams': [
                      { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' },
                      { 'Name': 'ProjectStatus', 'Value': ProjectStatus, 'DBType': 'string' },
                      { 'Name': 'DocName', 'Value': DocName, 'DBType': 'string' },
                      { 'Name': 'DocType', 'Value': DocType, 'DBType': 'string' },
                      { 'Name': 'ProjectStatusNew', 'Value': ProjectStatusNew, 'DBType': 'string' },
                      { 'Name': 'DocNameNew', 'Value': DocNameNew, 'DBType': 'string' },
                      { 'Name': 'DocTypeNew', 'Value': DocTypeNew, 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            GSDialog.HintWindow("更改成功！");
            window.location.reload(true);
        })
    }
    this.UpdateButton = function (ProjectStatus, DocName, DocType) {
        return '<button type="button" class="btn btn-link" onclick="OpenUpdateFileWindow(\'' + ProjectStatus + '\',\'' + DocName + '\',\'' + DocType + '\')"s>更改文档信息</button>';
    }
    this.UpdateDocButton = function (ProjectStatus,DocName, DocType) {
        return '<button type="button" class="btn btn-link" onclick="OpenUpdateFileWindowForDoc(\'' + ProjectStatus  + '\',\'' + DocName + '\',\'' + DocType + '\')"s>更新</button>';
    }
    this.OpenUpdateFileWindowForDoc = function (ProjectStatus,DocName, DocType) {
        var self = this;
        $('#Status1').val(ProjectStatus);
        $('#docType1').val(DocType);
        
        Webstorage.setItem('Status1', ProjectStatus);
        Webstorage.setItem('DocName1', DocName);
        Webstorage.setItem('docType1', DocType);
        var UpdateFileWindowForDoc = $('#UpdateFileWindowForDoc');
        $.anyDialog({
            width: 600,
            height: 444,
            title: '更新文档',
            html: UpdateFileWindowForDoc.show(),
            onClose: function () {

            }
        });
    }
    $('#updateFileForDoc').click(function () {
        UpdateFileForDoc();
    })
    //处理文档路径转到服务器
    function UploadFile(fileCtrlId, fileName, folder, fnCallback) {
        var fileData = document.getElementById(fileCtrlId).files[0];
        var args = 'trustId=' + TrustId + '&fileFolder=' + folder + '&fileName=' + encodeURIComponent(fileName);
        $.ajax({
            url: GlobalVariable.DataProcessServiceUrl + 'CopyFile?' + args,
            type: 'POST',
            data: fileData,
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request
            xhr: xhrOnProgress(function (e) {
                var percent = Math.floor(e.loaded / e.total * 100);
                if (percent > 0) {
                    $(".progress").css("display", "block");
                    $(".progress").find(".progress-bar").css("width", percent + "%");
                    $(".progress").find(".progress-bar>span").html("" + percent + "%");
                }
                if (percent == 100) {
                    $(".progress").css("display", "none");
                }
            }),
            success: function (data) {
                var path = data.CopyFileResult;
                fnCallback(path);
            },
            error: function (data) {
                GSDialog.HintWindow('上传文件错误');
            }
        })
    }
    //更新文档操作
    function UpdateFileForDoc() {
        var self = this;
        var value = $('#fileUploadFileU').val();
        if (value) {
            var fileName = value.substring(value.lastIndexOf('\\') + 1);
            UploadFile('fileUploadFileU', fileName, 'FileManagement', function (data) {
                var Status = $('#Status1').val();
                var desPath = data;
                var docType = $('#docType1').val();
                var version = $('#fileEdition1').val();
                var personName = $('#uploadPeople1').val();
                //var docName = Webstorage.getItem('DocName1');
                var docName = fileName;
                if (Status && docType && version && personName && docName) {
                    var times = desPath.split('\\')
                    var history = times[times.length - 1];
                    var executeParam = {
                        'SPName': "dbo.usp_InsertProjectDocInfo", 'SQLParams': [
                                  { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' },
                                  { 'Name': 'ProjectStatus', 'Value': Status, 'DBType': 'string' },
                                  { 'Name': 'DocName', 'Value': docName, 'DBType': 'string' },
                                  { 'Name': 'DocType', 'Value': docType, 'DBType': 'string' },
                                  { 'Name': 'DocVersion', 'Value': version, 'DBType': 'string' },
                                  { 'Name': 'InputPerson', 'Value': personName, 'DBType': 'string' },
                                  { 'Name': 'DocPath', 'Value': desPath, 'DBType': 'string' },
                                  { 'Name': 'History', 'Value': history, 'DBType': 'string' },
                        ]
                    };
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function () {
                        GSDialog.HintWindow("更新成功！");
                        window.location.reload(true);
                    })
                } else {
                    GSDialog.HintWindowtop("请填写完正确信息再上传！")
                }
            });
        }
        else {
            GSDialog.HintWindowtop("请填写完正确信息再上传！")
        }
    }
    //下载文件路径处理
    this.DownloadFile = function (link, docName) {
        var path = link.split("TrustManagementService")[1];
        var filePath = '\\TrustManagementService' + path;
        var elink = document.createElement('a');
        elink.download = docName;
        elink.href = filePath;
        elink.click();
        //downLoadExcelForSyn(filePath, docName)
    }
    //历史记录文档下载按钮
    this.downloadButton = function (DocPath, DocName) {
        DocPath = DocPath.replace(/\\/g, "/");
        return '<button type="button" class="btn btn-link" onclick="DownloadFile(\'' + DocPath + '\',\'' + DocName + '\')">下载</button>';
    }
    //文档名下载按钮
    this.fileDownload = function (DocName, DocPath) { 
        DocPath = DocPath.replace(/\\/g, "/");
        return '<button type="button" class="btn btn-link beyondHidden" title="\'' + DocName + '\'" onclick="DownloadFile(\'' + DocPath + '\',\'' + DocName + '\')">' + DocName + '</button>';
    }
    RendGrid() //文档全部列表显示
    setProjectName(); //当前专项计划名称显示
    function RendGrid() { //显示文档列表
        var cashflowListOne;
        var executeParam = {
            'SPName': "dbo.usp_getProjectDocInfoFromStatus", 'SQLParams': [
                      { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (datas) {
            
            cashflowListOne = datas;
        })

        var prepareLogs = {
            dataSource: cashflowListOne,
            scrollable: true,
            sortable: true,
            selectable: "multiple",
            filterable: true,
            reorderable: true,//列的排序,选择一列可以拖动改变她的顺序
            resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
            height: height,
            orderBy: 'InputDate',
            pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5,
                page: 1,
                pageSize: 15,
                pageSizes: [15, 30, 45, 60, 80, 100],
            },
            columns: [
                         {
                             field: "StatusDesc",
                             title: '项目状态',
                             width: "10%",
                             headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                             attributes: { "class": "table-cell", style: "text-align: center" }
                         },
                        {
                            field: "DocName",
                            title: '文档名称',
                            width: "20%",
                            template: "#=this.fileDownload(DocName, DocPath)#",
                            headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                            attributes: { "class": "table-cell", style: "text-align: center" }
                        },
                        {
                            field: "DocTypeDesc",
                            title: '文档类别',
                            width: "10%",
                            headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                            attributes: {"class": "table-cell", style: "text-align: center"}
                        },
                        {
                            field: "DocVersion",
                            title: '文档版本',
                            width: "10%",
                            headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                            attributes: { "class": "table-cell", style: "text-align: center" }
                        },
                        {
                            field: "InputPerson",
                            title: '上传人员',
                            width: "10%",
                            headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                            attributes: { "class": "table-cell", style: "text-align: center" }
                        },
                        {
                            field: "InputDate",
                            title: '上传时间',
                            template: '#=InputDate?this.getStringDate(InputDate).dateFormat("yyyy-MM-dd  hh:mm:ss"):""#',
                            width: "12%",
                            headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                            attributes: { "class": "table-cell", style: "text-align: center" }
                        },
                        {
                            field: "", title: "历史记录",
                            template: "#=this.HistoryButton(ProjectStatus, DocName, DocType)#",
                            width: "10%",
                            headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                            attributes: {style: 'text-align:center'}
                        },
                       {
                           field: "",
                           title: "更改文档信息",
                           template: "#=this.UpdateButton(ProjectStatus, DocName, DocType)#",
                           width: "10%",
                           headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                           attributes: {style: 'text-align:center'}
                       },
                       {
                           field: "",
                           title: "更新",
                           template: "#=this.UpdateDocButton(ProjectStatus,DocName, DocType)#",
                           width: "8%",
                           headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                           attributes: { style: 'text-align:center' }
                       }
            ],
            filterable: true
        }
        $("#grid").kendoGrid(prepareLogs);
        $('#mask').hide();
    }
    function setProjectName() { //设置当前专项计划名称
        var label= '';
        label = "<label>" + ProjectName + "</label>";
        $('#ProjectNameNow').append(label).css("border", "0px solid #ccc")
    }
    function RendGridHistory(ProjectStatus, DocName, DocType) { //历史记录框
        var cashflowListOne;
        var executeParam = {
            'SPName': "dbo.usp_getHistoryByDocName",
            'SQLParams': [
                      { 'Name': 'TrustId', 'Value': TrustId, 'DBType': 'int' },
                      { 'Name': 'Status', 'Value': ProjectStatus, 'DBType': 'string' },
                      { 'Name': 'DocName', 'Value': DocName, 'DBType': 'string' },
                      { 'Name': 'DocType', 'Value': DocType, 'DBType': 'string' }
            ]
        };
        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
            //根据文件名称获取历史记录，需要显示的数据包括上传人员，上传时间，版本，历史记录，下载按钮
            for (var i = 0; i < data.length; i++) {
                data[i].InputDate = common.getStringDate(data[i].InputDate).dateFormat("yyyy-MM-dd hh:mm:ss");
            }
            cashflowListOne = data;
        })
        var height = 425;
        var prepareLogs = {
            dataSource: cashflowListOne,
            scrollable: true,
            sortable: true,
            selectable: "multiple",
            filterable: true,
            reorderable: true,//列的排序,选择一列可以拖动改变她的顺序
            resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
            height: height,
            orderBy: 'InputDate',
            pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5,
                page: 1,
                pageSize: 15,
                pageSizes: [15, 30, 45, 60, 80, 100],
            },
            columns: [
                         {
                             field: 'InputPerson',
                             title: '上传人员',
                             width: '15%',
                             headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                             attributes: { "class": "table-cell", style: "text-align: center" }
                         },
                         {
                             field: "InputDate",
                             title: '上传时间',
                             width: "25%",
                             headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                             attributes: { "class": "table-cell", style: "text-align: center" }
                         },
                        {
                            field: "DocVersion",
                            title: '文档版本',
                            width: "15%",
                            headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                            attributes: { "class": "table-cell", style: "text-align: center" }
                        },
                        {
                            field: "DocName",
                            title: '历史记录',
                            width: "35%",
                            headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                            attributes: { "class": "table-cell", style: "text-align: center" }
                        },
                       {
                           field: "DocPath",
                           title: "操作",
                           template: "#=this.downloadButton(DocPath,DocName)#",
                           width: "10%",
                           headerAttributes: { "class": "table-header-cell", style: "text-align: center" },
                           attributes: { style: 'text-align:center' }
                       }
            ],
            filterable: true
        }
        $("#historyData").kendoGrid(prepareLogs)
    }
    
})
