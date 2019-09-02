define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var GSDialog = require("gsAdminPages");
    require('app/productManage/TrustManagement/Common/Scripts/viewTrustWizard');
    var enter = common.getQueryString('enter');
    if (enter == 'taskList') {
        $('#Refresh').show()
        $("#changeproduct").show()
    }
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
            TrustId: "",//选择列表对应的TrustID
            TrustCode: ''
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
                var userName = sessionStorage.getItem("gs_UserName") == null
                    ? ""
                    : sessionStorage.getItem("gs_UserName");
               
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
                if (filePath == "" || fileName == "" || fileType == "") {
                    GSDialog.HintWindow('请选择上传文件');
                    return false;
                } else {
                    //产品名称验证
                    if ($("#changeproduct").is(":hidden")) {
                        GSDialog.HintWindowTF("是否需要修改导入产品的代码?", function () {
                            //显示修改区域
                            $("#changeproduct").show(300);

                        }, function () {
                            self.UploadTrustFile(fileName, "", userName);
                            /*
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
                                    self.ImportTrustPlan(path, "",userName);

                                },
                                error: function (data) {
                                    GSDialog.HintWindow('上传文件错误');
                                }
                            })
                            */
                        })
                    } else {
                        //产品名称输入校验
                        var $this = $("#productname");
                        var objValue = $this.val();
                      
                        var isExist = "";
                        var executeParams = {
                            SPName: 'usp_CheckTrustCodeExists', SQLParams: [
                                { 'Name': '@trustCode', 'Value': objValue, 'DBType': 'string' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                            isExist=eventData[0].isExists
                        });
                        var pattern = new RegExp("[^0-9a-zA-Z-_]");
                        var testfirst = new RegExp("[_-]");
                        if (objValue == "") {
                            if (enter == 'taskList') {
                                GSDialog.HintWindow('没有检测到输入值，请输入')
                            } else {
                                GSDialog.HintWindowTF("没有检测到输入值,是否放弃更改产品代码", function () {
                                    $("#changeproduct").hide(300);
                                    //Run Task
                                    self.UploadTrustFile(fileName, objValue, userName);
                                })
                                $this.blur();
                            }
                            return false
                        }
                        if (isExist == "1") {
                            GSDialog.HintWindow("产品code已经存在,请重新输入", function () {
                                $this.val("");
                            })
                            $this.blur();
                            return false
                        }
                        if (testfirst.test(objValue.substring(0, 1))) {
                            GSDialog.HintWindow("输入不合法,首字母只能是数据或者字母", function () {
                                $this.val("");
                            });
                            $this.blur();
                            return false
                        }
                        if (pattern.test(objValue)) {
                            GSDialog.HintWindow("输入不合法,只能输入数字,字母,下划线,破折号的组合", function () {
                                $this.val("");
                            });
                            $this.blur();
                            return false
                        }
                        //检验全部通过,上传文件，调用task
                        self.UploadTrustFile(fileName, objValue, userName);
                    }
                  
                }
            },
            UploadTrustFile: function (fileName,objValue, userName) {
                var self = this;
                var args = 'trustId=' +
                self.TrustId +
                '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
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
                        self.ImportTrustPlan(path, objValue, userName)

                    },
                    error: function (data) {
                        GSDialog.HintWindow('上传文件错误');
                    }
                })
            },
            ImportTrustPlan: function (filePath,trustCode,userName) {
                //newTrustCode     userName
                var self = this;
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\' + fileName;
                sVariableBuilder.AddVariableItem('filePath', fileDirectory, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('newTrustCode', trustCode, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('userName', userName, 'String', 0, 0, 0);
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 500,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: 'TrustInfoImport',
                    sContext: sVariable,
                    callback: function (data) {
                        if (enter == 'taskList') {
                            //var executeParams = {
                            //    SPName: 'usp_CheckTrustCodeExists', SQLParams: [
                            //        { 'Name': '@trustCode', 'Value': objValue, 'DBType': 'string' }
                            //    ]
                            //};
                            //common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                            //    isExist = eventData[0].isExists
                            //});
                            self.TrustCode = $("#productname").val();
                            sVariableBuilder.ClearVariableItem(); 
                        } else {
                            sVariableBuilder.ClearVariableItem();
                            location.reload(true);
                        }
                    }
                });
                tIndicator.show();

            },
            Refresh: function () {
                //this.TrustCode = $("#productname").val()
                if (this.TrustCode) {
                    TRUST.refreshCashflowModelTask(this.TrustCode)
                } else {
                    GSDialog.HintWindow('请填写产品代码');
                }
                
            }
        }
    })
})