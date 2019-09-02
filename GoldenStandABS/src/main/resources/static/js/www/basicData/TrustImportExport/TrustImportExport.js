define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var GSDialog = require("gsAdminPages");
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
    var vm = new Vue({
        el: "#app",
        data: {
            productList: [],//专项计划列表
            TrustId:""//选择列表对应的TrustID
        },
        created: function () {
            var self = this;
            self.GetTrustList()
        },
        mounted: function () {
            this.inputFileClick()
        },
        methods: {
            //获取专项计划列表
            GetTrustList: function () {
                var self = this;
                var executeParams = {
                    SPName: 'dbo.usp_GetTrusts', SQLParams: [
                    ]
                };
                common.ExecuteGetData(true, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                    self.productList = eventData
                    self.TrustId=eventData[0].id//默认加载第一个专项计划
                });
            },
            //选择文件函数
            inputFileClick: function () {
                $(".input_file_style").find("input").change(function () {
                    var value = $(this)[0].value;
                    if (value != "") {
                        $(this).next()[0].innerHTML = "浏览";
                        value = value.substring(value.lastIndexOf('\\') + 1);
                        $(this).parent().prev().html(value);
                    } else {
                        $(this).next()[0].innerHTML = "选择文件";
                        $(this).parent().prev().html("");
                    }
                })
            },
            //导出专项计划
            ExportSpecialPlan:function(){
                var self = this;
                sVariableBuilder.AddVariableItem('TrustId', self.TrustId, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var executeParam = {
                    SPName: 'Task.initTaskStatusByTrustId', SQLParams: [
                          { Name: 'trustId', value: self.TrustId, DBType: 'int' }
                    ]
                }
                common.ExecuteGetData(false, svcUrl, 'TaskProcess', executeParam, function (eventData) { })
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: 'TrustInfoExport',
                    sContext: sVariable,
                    callback: function () {
                        //获取task当前状态
                        var executeParams = {
                            SPName: 'Task.checkTaskStatusByTrustId', SQLParams: [
                                  { Name: 'trustId', value: self.TrustId, DBType: 'int' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TaskProcess', executeParams, function (eventData) {
                            if (eventData[0].Status == "1") {
                                var t = $("<a download='TrustInfoImportAndExportModel_" + self.TrustId + ".xml'><span id='ac'></span></a>");
                                var url = "/TrustManagementService/TrustImportAndExportModel/TrustInfoImportAndExportModel_" + self.TrustId + ".xml";;
                                t.attr("href", url);
                                t.appendTo($("body"));
                                $('#ac').click()
                                t.remove()
                            }
                        });
                        sVariableBuilder.ClearVariableItem();
                    }
                });
                tIndicator.show();
            },
            //上传导入专项计划
            UpImportTrustPlan: function () {
                var self = this
                var filePath = $('#ImportTrustPlanDocument').val();
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
                if (filePath == "" || fileName == "" || fileType == "") {
                    GSDialog.HintWindow('请选择上传文件');
                    return false;
                }
                var args = 'trustId=' + self.TrustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
                var fileData = document.getElementById('ImportTrustPlanDocument').files[0]
                $.ajax({
                    url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload?' + args,
                    type: 'POST',
                    data: fileData,
                    cache: false,
                    dataType: 'json',
                    processData: false,
                    xhr: xhrOnProgress(function (e) {
                        var percent = Math.floor(e.loaded / e.total * 100);
                        if (percent > 0) {
                            $(".progress").eq(0).css("display", "block");
                            $(".progress").eq(0).find(".progress-bar").css("width", percent + "%");
                            $(".progress").eq(0).find(".progress-bar>span").html("" + percent + "%");
                        }
                        if (percent == 100) {
                            $(".progress").eq(0).css("display", "none");
                        }
                    }),
                    success: function (data) {
                        var path = data.CommonTrustFileUploadResult;
                        self.ImportTrustPlan(path)

                    },
                    error: function (data) {
                        GSDialog.HintWindow('上传文件错误');
                    }
                })
            },
            ImportTrustPlan: function (filePath) {
                var self = this;
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\' + fileName;
                sVariableBuilder.AddVariableItem('filePath', fileDirectory, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: 'TrustInfoImport',
                    sContext: sVariable,
                    callback: function () {
                        sVariableBuilder.ClearVariableItem();
                        location.reload(true);
                    }
                });
                tIndicator.show();

            },
        }
    })
})