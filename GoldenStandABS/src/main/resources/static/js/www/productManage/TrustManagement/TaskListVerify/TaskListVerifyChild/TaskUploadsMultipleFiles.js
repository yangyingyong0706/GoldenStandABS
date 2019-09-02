define(function (require) {
    var $ = require("jquery");
    var common = require("common");
    var GlobalVariable = require('globalVariable');
    var GSDialog = require("gsAdminPages");
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var sVariableBuilder = require('gs/sVariableBuilder');
    var taskIndicator = require('gs/taskProcessIndicator');
    var TaskCode = common.getQueryString("TaskCode");
    var SessionId = common.getQueryString("SessionId");
    var trustId=sessionStorage.getItem("trustIds" + SessionId);
    var StartPeriodId = sessionStorage.getItem("ComparisonPeriod" + SessionId);
    var LivePeriod=sessionStorage.getItem("liveperiod" + SessionId);
    var Vue = require("Vue2");
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
    $(function () {
        var Vm = new Vue({
            el:"#app",
            data: {
                selectList: [],//渲染选择框的数量
                ids: [],
                array: [],
                result: [],
                arrayupload: [],
                str:""
            },
            created: function () {
                var self = this;
                self.RenderFiled()
            },
            mounted: function () {
                var self = this;
            },
            methods: {
                //渲染选择文件框
                RenderFiled: function () {
                    var self = this;
                    
                    var executeParams = {
                        SPName: 'TrustManagement.GetCaldateImportAsset', SQLParams: [
                            { Name: 'TrustId', value: trustId, DBType: 'int' },
                            { Name: 'StartPeriodId', value: StartPeriodId, DBType: 'string' },
                            { Name: 'LivePeriod', value: LivePeriod, DBType: 'int' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParams, function (eventData) {
                        self.selectList = eventData;
                        $.each(eventData, function (i, v) {
                            self.ids.push(v.dateinfo);
                        })

                    });
                },
                //选择文件
                inputFileClick: function ($event) {
                    var target = $event.target;
                    var value = $(target).val();
                    if (value != "") {
                        $(target).next()[0].innerHTML = "浏览";
                        value = value.substring(value.lastIndexOf('\\') + 1);
                        $(target).parent().prev().html(value);
                    } else {
                        $(target).next()[0].innerHTML = "选择文件";
                        $(target).parent().prev().html("");
                    }
                },
                //上传文件
                UpfileExcels: function () {
                    var self = this;
                    self.array = [];
                    self.result = [];
                    self.arrayupload = [];
                    self.str = "";
                    var spaceflag = 0;
                    $.each(self.ids, function (i, v) {
                        var filePath = $("#" + v).val();
                        var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                        var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
                        if (fileType == 'xls' || fileType == 'xlsx' || fileType == 'xml' ) {
                            //GSDialog.HintWindow('文件不是XLS、XLSX或者XML文件');
                            self.array.push(1);
                            self.arrayupload.push(1);

                        } else if( fileType==""){
                            self.array.push(2)
                        } else {
                            self.array.push(3)
                        }
                        if (i == self.ids.length - 1 && self.array.indexOf(3)>0) {
                            GSDialog.HintWindow('文件不是XLS、XLSX或者XML文件');
                            return false;
                        } else if (i == self.ids.length - 1 && self.array.indexOf(3)==-1) {
                            $.each(self.ids, function (i, v) {
                                var filePath = $("#" + v).val();
                                if (filePath == "") return true;
                                console.log(self.result)
                                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                                var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
                                var args = 'trustId=' + SessionId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);
                                var fileData = $("#" + v)[0].files[0]
                                $.ajax({
                                    url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload?' + args,
                                    type: 'POST',
                                    data: fileData,
                                    cache: false,
                                    dataType: 'json',
                                    processData: false, // Don't process the files
                                    //contentType: "application/octet-stream", // Set content type to false as jQuery will tell the server its a query string request SessionId
                                    xhr: xhrOnProgress(function (e) {
                                        var percent = Math.floor(e.loaded / e.total * 100);
                                        if (percent > 0) {
                                            $(".progress").eq(i).css("display", "block");
                                            $(".progress").eq(i).find(".progress-bar").css("width", percent + "%");
                                            $(".progress").eq(i).find(".progress-bar>span").html("" + percent + "%");
                                        }
                                        if (percent == 100) {
                                            $(".progress").eq(i).css("display", "none");
                                        }
                                    }),
                                    success: function (data) {
                                        var filePath = data.CommonTrustFileUploadResult;
                                        var array = [];
                                        var obj = {};
                                        obj.DimReportingDate = v;
                                        obj.DimReportingDateId = v.replace(/-/g,"");
                                        obj.ReportingDate = v;
                                        obj.SourceFilePath = filePath;
                                        obj.TrustId = trustId;
                                        array.push(obj);
                                        self.result.push(array);
                                        if (self.result.length == self.arrayupload.length) {
                                            $.each(self.result, function (i, v) {
                                                if (i == 0) {
                                                    self.str += '['+JSON.stringify(v).substring(1, JSON.stringify(v).lastIndexOf("]")) 
                                                } else if (i == self.result.length-1) {
                                                    self.str += "," + JSON.stringify(v).substring(1, JSON.stringify(v).lastIndexOf("]"))+']'
                                                } else {
                                                    self.str += ","+JSON.stringify(v).substring(1, JSON.stringify(v).lastIndexOf("]"))
                                                }
                                                
                                            })
                                            self.saveData("trust", trustId, 23, [], function (r) {
                                                sVariableBuilder.AddVariableItem("script",self.str, 'String', 0, 0, 0);
                                                sVariableBuilder.AddVariableItem("TrustInfo", trustId, 'String', 0, 0, 0);
                                                sVariableBuilder.AddVariableItem("SessionIdUS", SessionId, 'String', 0, 0, 0);
                                                sVariable = sVariableBuilder.BuildVariables();

                                                var tIndicator = new taskIndicator({
                                                    width: 900,
                                                    height: 550,
                                                    clientName: 'TaskProcess',
                                                    appDomain: 'Task',
                                                    taskCode: 'MultipleAssetreport',
                                                    sContext: sVariable,
                                                    callback: function () {
                                                        window.location.reload();
                                                    }
                                                });
                                                tIndicator.show();

                                            });
                                        }
                                    },
                                    error: function (data) {
                                        GSDialog.HintWindow('上传文件错误');;
                                    }
                                })
                            })
                        }

                    })          

                },
                //
                saveData: function (businessCode, businessIdentifier, pageId, array, callback) {
                        var itemsTmpl = '<is>{0}</is>';
                        var itemTmpl = '<i><id>{0}</id><v>{1}</v><g1>{2}</g1><g2>{3}</g2><si>{4}</si></i>';

                        var items = '';
                        $.each(array, function (i, v) {
                            var grouId01 = (typeof v.GroupId01 == 'undefined') ? '' : v.GroupId01;//存在GroupId01==0 情况
                            items += itemTmpl.format(v.ItemId, v.ItemValue || '', grouId01, v.GroupId02 || '', v.SectionIndex || 0);
                        });
                        items = itemsTmpl.format(items);
                        items = encodeURIComponent(items);

                        var json = "{'DBName':'QuickWizard','Schema':'QuickWizard','SPName':'usp_SavePageItems',"
                        + "'Params':{'BusinessCode':'" + businessCode + "','BusinessIdentifier':'" + businessIdentifier + "',"
                        + "'PageId':'" + pageId + "','PageItemXML':'" + items + "','OutSessionId':''}}";

                        json = "<SessionContext>{0}</SessionContext>".format(json);

                        var serviceUrl = GlobalVariable.QuickWizardServiceUrl + 'DataCUD';
                        $.ajax({
                            type: "POST",
                            url: serviceUrl,
                            dataType: "json",
                            contentType: "application/xml;charset=utf-8",
                            data: json,
                            success: function (data) {
                                callback(data);
                            },
                            error: function (data) {
                                alert("error is :" + data);
                            }
                    });
                }
            }
        })

        //上传文件
        //$("#UpTrustBeeExcl").click(function () {
        //    var filePath = $('#ImportCashFlowOAAccounts').val();
        //    var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
        //    var fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
        //    var args = 'trustId=' + SessionId + '&fileFolder=Asset&fileName=' + encodeURIComponent(fileName);//'trustId=' + trustId +
        //    if (fileType !== 'xls' && fileType !== 'xlsx' && fileType !== 'xml') {
        //        GSDialog.HintWindow('文件不是XLS、XLSX或者XML文件');
        //        return;
        //    }
        //    var fileData = document.getElementById('ImportCashFlowOAAccounts').files[0]

        //})
        //run task
        function UpCashflowDetailsTaskProcess(filePath) {
            var request = getRequest();
            var SessionId = request.SessionId;
            var ActionDisplayName = request.ActionDisplayName;
            var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
            var Dimreport = sessionStorage.getItem("ComparisonPeriod" + SessionId);
            var dimreportdateid = Dimreport.replace(/-/g, '');
            var TrustCode = sessionStorage.getItem("trustCodes" + SessionId);
            var fileDirectory = filePath.substring(0, filePath.lastIndexOf('\\')) + '\\';
            if (TaskCode == 'TaskOrderImport') {
                sVariableBuilder.AddVariableItem('shoubepath', fileDirectory + '\\' + fileName, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('SessionId', SessionId, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('ProcessActionName', ActionDisplayName, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DimReportDateId', dimreportdateid, 'String', 0, 0, 0);
            } else {
                sVariableBuilder.AddVariableItem('ShouldbeFilePath', fileDirectory, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('FileName', fileName, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DBName', "TrustManagement", 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('SessionId', SessionId, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('ProcessActionName', ActionDisplayName, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('DimReportDateId', dimreportdateid, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('TrustCode', TrustCode, 'String', 0, 0, 0);
                sVariableBuilder.AddVariableItem('ScenarioId', request.ScenarioId, 'String', 0, 0, 0);
            }

            var sVariable = sVariableBuilder.BuildVariables();
            var tIndicator = new taskIndicator({
                width: 500,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'task',
                taskCode: TaskCode,
                sContext: sVariable,
                callback: function () {
                    sVariableBuilder.ClearVariableItem();
                    //location.reload(true);
                }
            });
            tIndicator.show();
        }
    })
})