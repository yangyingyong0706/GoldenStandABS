define(function (require) {
    //<script src="../../../../asset/lib/knockout/knockout.binding.rendercontrol.js"></script>
    //<script src="../../../../asset/lib/jquery/jquery-ui-latest.js"></script>

    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    require('date_input');
    var ko = require('knockout');
    var mapping = require('knockout.mapping');
    require('knockout.rendercontrol');
    var common = require('common');
    require('jquery-ui');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var GSDialog = require("gsAdminPages")
    $(function () {
        $('.date-plugins').date_input();
        $('#btnUpload').bind('click', UploadFiles);
    });
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
    //日期校验
    $("#reportingDate").change(function () {
        var obj = $(this)[0];
        common.formatData(obj);
    })
    function UploadFiles() {
        if ($('#reportingDate').val() === '') {
            GSDialog.HintWindow('请选择数据日期！');
            return false;
        }
        if (!common.checkdate($("#reportingDate")[0])) {
            return false;
        }
        if ($('#file_BasePool').val() == '' || $('#file_AssetPayment').val() == '') {
            GSDialog.HintWindow('带星号的选项是必填选项！');
            return false;
        }
        else {
            var $uploadControl = $('.file');
            var isExcels = true;
            $.each($uploadControl, function (index, obj) {
                if ($(obj).attr('id') !== 'file_TopUpPool') {
                    var fileType = $(obj).val().substring($(obj).val().lastIndexOf('.') + 1);
                    if (fileType !== 'xlsx' && fileType !== 'xls') {
                        isExcels = false;
                    }
                }
                else {
                    if ($(obj).val() !== '') {
                        var fileType = $(obj).val().substring($(obj).val().lastIndexOf('.') + 1);
                        if (fileType !== 'xlsx' && fileType !== 'xls') {
                            isExcels = false;
                        }
                    }
                }
            });
            if (isExcels === false) {
                GSDialog.HintWindow('上传文件必须为Excel表格!');
                return false;
            }
        }
        $('#tips').html('正在上传……');
        var TrustId = window.location.href.substring(window.location.href.lastIndexOf('=') + 1);
        var ReportingDate = $('#reportingDate').val();
        var fileDatas = [];
        $('.file').each(function (index, obj) {
            var file = {};
            file.name = $(obj).val().substring($(obj).val().lastIndexOf('\\') + 1);
            file.data = $(obj).get(0).files[0];
            file.url = 'trustId=' + TrustId + '&fileFolder=Asset&fileName=' + encodeURIComponent(file.name);
            if (file.name != '') {
                fileDatas.push(file);
            }
        });
        proitems = 0;
        proitemsign = fileDatas.length;

        $(fileDatas).each(function (index, obj) {
                //var dtd = $.Deferred();
            $.ajax({
                url: GlobalVariable.DataProcessServiceUrl + 'CommonFileUpload' + '?' + fileDatas[index].url,
                type: 'POST',
                data: fileDatas[index].data,
                cache: false,
                dataType: 'json',
                //async: false,
                xhr: xhrOnProgress(function (e) {
                    if ($(fileDatas).length == 2) {
                        if (index == 1) index = 2;
                        var percent = Math.floor(e.loaded / e.total * 100);
                        if (percent > 0) {
                            $(".progress").eq(index).css("display", "block");
                            $(".progress").eq(index).find(".progress-bar").css("width", percent + "%");
                            $(".progress").eq(index).find(".progress-bar>span").html("" + percent + "%");
                        }
                        if (percent == 100) {
                            console.log(e);
                            $(".progress").eq(index).css("display", "none");
                        }
                    } else {
                        var percent = Math.floor(e.loaded / e.total * 100);
                        if (percent > 0) {
                            $(".progress").eq(index).css("display", "block");
                            $(".progress").eq(index).find(".progress-bar").css("width", percent + "%");
                            $(".progress").eq(index).find(".progress-bar>span").html("" + percent + "%");
                        }
                        if (percent == 100) {
                            $(".progress").eq(index).css("display", "none");
                        }
                    }
                   
                }),
                processData: false,
                error: function () {
                   

                    GSDialog.HintWindow("上传文件失败！")
                    },
                success: function (path) {
                    if (proitemsign == 2) {
                        
                        if (index == 2) index = 1;
                    };
                    fileDatas[index].path = path.CommonTrustFileUploadResult;
                    //dtd.resolve();
                    proitems++;
                        console.log(proitems, proitemsign, fileDatas);
                        if (proitems == proitemsign) {
                            RunTask(TrustId, ReportingDate, fileDatas);
                        }
                }
            });

            

        });

        //$.when(proitems.forEach(function (value, index, array) {
        //    value()
        //})).done(function () { RunTask(TrustId, ReportingDate, fileDatas); }).fail(function () { alert("文件上传失败！")})


        //if (Uploaded) {
        //    $('#tips').html('上传成功！');
        //    RunTask(TrustId, ReportingDate, fileDatas);
        //}
    }
    function RunTask(TrustId, ReportingDate, files) {
        console.log(files);
        //var tpi = new TaskProcessIndicatorHelper();
        var TaskCode = '';
        //var dir = GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustFiles/' + TrustId + '/Asset/';
        //var dir = 'E:/TSSWCFServices/TrustManagementService/TrustFiles/'+TrustId+'/Asset/';
        sVariableBuilder.AddVariableItem("TrustId", TrustId, 'NVarChar');
        sVariableBuilder.AddVariableItem("ReportingDate", ReportingDate, "NVarChar");
        sVariableBuilder.AddVariableItem("SourceFilePath_BasePool", files[0].path, "NVarChar");
        if (files.length === 2) {
            TaskCode = 'ExportAssetStatistics';
            sVariableBuilder.AddVariableItem("SourceFilePath_AssetPayment", files[1].path, "NVarChar");
        }
        else {
            //TaskCode = 'ExportAssetStatistics_TopUp';
            TaskCode = 'ExportAssetStatistics';
            sVariableBuilder.AddVariableItem("SourceFilePath_TopUpPool", files[1].path, "NVarChar");
            sVariableBuilder.AddVariableItem("SourceFilePath_AssetPayment", files[2].path, "NVarChar");
        }
        //tpi.ShowIndicator("Task", TaskCode);

        var sVariable = sVariableBuilder.BuildVariables();
        //tpi.ShowIndicator('ConsumerLoan', TaskCodes[PoolHeader.PoolTypeId], element);
        var tIndicator = new taskIndicator({
            width: 500,
            height: 550,
            clientName: 'TaskProcess',
            appDomain: 'Task',
            taskCode: TaskCode,
            sContext: sVariable,
            callback: function () {
                //window.location.href = 'basePoolContent.html?PoolId={0}&PoolName={1}'.format(PoolId, sessionStorage.PoolName);
                parent.location.href = parent.location.href;
                $('#modal-close', window.parent.document).trigger('click');
                sVariableBuilder.ClearVariableItem();
            }
        });
        tIndicator.show();
    }
    function inputFileClick() {
        $(".input_file_style").find("input").change(function () {
            var value = $(this)[0].value;
            if (value != "") {
                $(this).next()[0].innerHTML = "浏览"
                value = value.substring(value.lastIndexOf('\\') + 1);
                $(this).parent().parent().children('.file_name').html(value);
            } else {
                $(this).next()[0].innerHTML = '选择文件';
                $(this).parent().parent().children('.file_name').html("");
            }
        })
    }
    inputFileClick()
    //重载PopupTaskProcessIndicator函数，调用父窗口的div
    //function PopupTaskProcessIndicator(fnCallBack) {
    //    $("#taskIndicatorArea", parent.window.document).dialog({
    //        modal: true,
    //        dialogClass: "TaskProcessDialogClass",
    //        closeText: "",
    //        //closeOnEscape:false,
    //        height: 550,
    //        width: 450,
    //        close: function (event, ui) {
    //            if (typeof fnCallBack === 'function') { fnCallBack(1); }
    //            else { parent.window.location.reload(); }
    //            close();
    //            //$mask.trigger('click');
    //            //self.onClose();
    //        }, // refresh report repository while close the task process screen.
    //        //open: function (event, ui) { $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide(); },
    //        title: "任务处理"
    //    });
    //}
    //String.prototype.format = function () {
    //    var args = arguments;
    //    return this.replace(/{(\d+)}/g, function (match, number) {
    //        return typeof args[number] != 'undefined'
    //        ? args[number]
    //        : match
    //        ;
    //    });
    //};
    //var TaskProcessIndicatorHelper = function () {
    //    this.Variables = [];
    //    this.VariableTemp = '<SessionVariable><Name>{0}</Name><Value>{1}</Value><DataType>{2}</DataType><IsConstant>{3}</IsConstant><IsKey>{4}</IsKey><KeyIndex>{5}</KeyIndex></SessionVariable>';

    //    this.AddVariableItem = function (name, value, dtatType, isConstant, isKey, keyIndex) {
    //        this.Variables.push({ Name: name, Value: value, DataType: dtatType, IsConstant: isConstant || 0, IsKey: isKey || 0, KeyIndex: keyIndex || 0 });
    //    };

    //    this.BuildVariables = function () {
    //        var pObj = this;

    //        var vars = '';
    //        $.each(this.Variables, function (i, item) {
    //            vars += pObj.VariableTemp.format(item.Name, item.Value, item.DataType, item.IsConstant, item.IsKey, item.KeyIndex);
    //        });

    //        var strReturn = "<SessionVariables>{0}</SessionVariables>".format(vars);
    //        return strReturn;
    //    };

    //    this.ShowIndicator = function (app, code, fnCallBack) {
    //        sContext = {
    //            appDomain: app,
    //            sessionVariables: this.BuildVariables(),
    //            taskCode: code,
    //        };

    //        this.CreateSessionByTaskCode(sContext, function (response) {
    //            sessionID = response;
    //            taskCode = code;
    //            IndicatorAppDomain = app;

    //            if (IsSilverlightInitialized) {
    //                PopupTaskProcessIndicator(fnCallBack);
    //                InitParams();
    //            } else {
    //                PopupTaskProcessIndicator(fnCallBack);
    //            }
    //        });
    //    };


    //    this.CreateSessionByTaskCode = function (sContext, callback) {
    //        console.log(sContext.sessionVariables);
    //        var sessionVariables_p = encodeURIComponent(sContext.sessionVariables);
    //        var uriHostInfo = location.protocol + "//" + location.host;
    //        var TaskProcessEngineServiceURL = uriHostInfo + '/TaskProcessEngine/SessionManagementService.svc/jsAccessEP/';
    //        var serviceUrl = TaskProcessEngineServiceURL + "CreateSessionByTaskCode?applicationDomain=" + sContext.appDomain + "&sessionVariable=" + sessionVariables_p + "&taskCode=" + sContext.taskCode;
    //        //var serviceUrl = TaskProcessEngineServiceURL + "CreateSessionPostByTaskCode";
    //        var obj = {};
    //        obj.appDomain = sContext.appDomain;
    //        obj.sessionVariables = sContext.sessionVariables;
    //        obj.taskCode = sContext.taskCode;
    //        $.ajax({
    //            type: "GET",                    //modify to POST method
    //            url: serviceUrl,
    //            dataType: "jsonp",
    //            crossDomain: true,
    //            contentType: "application/json;charset=utf-8",
    //            success: function (sessionId) {
    //                callback(sessionId);
    //            },
    //            error: function (response) { alert(response); }
    //        });
    //    };
    //};

    //var sessionID, taskCode, IndicatorAppDomain;
    //var clientName = 'TaskProcess';

    //var IsSilverlightInitialized = false;
    //function InitParams() {
    //    if (!IsSilverlightInitialized) {
    //        IsSilverlightInitialized = true;
    //    }

    //    document.getElementById("TaskProcessCtl").Content.SL_Agent.InitParams(sessionID, IndicatorAppDomain, taskCode, clientName);
    //}
});