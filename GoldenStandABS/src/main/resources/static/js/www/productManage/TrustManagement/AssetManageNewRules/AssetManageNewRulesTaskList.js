/// <reference path="../Common/Scripts/jquery-1.7.2.min.js" />
/// <reference path="../Common/Scripts/common.js" />


define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var wcfProxy = require('webProxy');
    var GlobalVariable = require('globalVariable');
    require('anyDialog');
    //require('app/productManage/TrustManagement/Common/Scripts/showModalDialog');
    require('gsAdminPages');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var edit_assetTaskId = null;
    var GSDialog = require("gsAdminPages")
    var base = new Base64();

    function loadAssetTask(taskId,callback) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var objArgs = {
            SPName: 'usp_GetAssetTask',
            SQLParams: [
                { Name: 'AssetId', Value: taskId, DBType: 'int' }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(objArgs));
        $.ajax({
            cache: false,
            type: "GET",
            url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                response = JSON.parse(response)
                callback(response)

            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });

    }


    executeAssetTask = function executeAssetTask(taskId) {

        //runtask
            sVariableBuilder.AddVariableItem('TaskId', taskId, 'String', 1, 0, 0);
        
            var sVariable = sVariableBuilder.BuildVariables();
            
            var tIndicator = new taskIndicator({
                width: 900,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: 'ExecuteAssetTask',
                sContext: sVariable,
                callback: function () {
                    sVariableBuilder.ClearVariableItem();
                    window.location.reload();
                }
            });
            tIndicator.show();
           

    }

    
    editAssetTask = function editAssetTask(AssetTaskId, RowNum, Name, Description) {
        var decodeName = base.decode(Name);
        var decodeDescription = base.decode(Description);
        edit_assetTaskId = AssetTaskId;
        $('#AssetTaskrowNum').val(RowNum)
        $('#AssetTaskrowNum').attr("disabled", true);
        $('#AssetTaskName').val(decodeName)
        $('#AssetTaskDescription').val(decodeDescription)
        $.anyDialog({ 
            width: 600,
            height: 'auto',
            title: "任务信息",
            html: $('#assetTaskBound'),
            onClose: function () {
            }
        })
        $("#saveAssetTask").off();
        $("#saveAssetTask").click(function () {
            var flag = true;
            $('#assetTaskBound .form-control').each(function () {
                if (!common.CommonValidation.ValidControlValue($(this))) {
                    flag = false;
                }

            })
            if (!flag) {
                return;
            }
            var AssetTaskName = $('#AssetTaskName').val();
            var AssetTaskDescription = $('#AssetTaskDescription').val();
          
            if (AssetTaskName === decodeName && AssetTaskDescription === decodeDescription) {
                GSDialog.HintWindow('未进行任何有效编辑', function () {
                    window.location.reload();
                });
                return;
            }

            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
            var objArgs = {
                SPName: 'usp_UpdateAssetTask',
                SQLParams: [{ Name: 'TaskId', Value: edit_assetTaskId, DBType: 'int' },
                            { Name: 'TaskName', Value: AssetTaskName, DBType: 'string' },
                            { Name: 'TaskDescription', Value: AssetTaskDescription, DBType: 'string' }]
            };
            var executeParams = encodeURIComponent(JSON.stringify(objArgs));
            $.ajax({
                cache: false,
                type: "GET",
                url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    GSDialog.HintWindow('编辑成功!', function () {
                        window.location.reload();
                    });

                },
                error: function (response) { GSDialog.HintWindow('编辑失败!', function () { window.location.reload(); }); }
            });

        });
    }

   
    function assetTaskIsExist(name, des, assetId) {
        var isExist = true;
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var objArgs = {
            SPName: 'usp_QueryAssetTaskIsExsit',
            SQLParams: [
                { Name: 'AssetId', Value: assetId, DBType: 'int' },
                { Name: 'Name', Value: name, DBType: 'string' },
                { Name: 'Description', Value: des, DBType: 'string' }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(objArgs));
        
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                response = JSON.parse(response)
                if (response[0].Column1 == 0) {
                    isExist = false;
                }
            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });
        return isExist;
    }


    deleteAssetList = function deleteAssetList(sId) {
        GSDialog.HintWindowTF("确定删除？", function () {
            var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
            var objArgs = {
                SPName: 'usp_DeleteAssetTask',//'usp_DeleteSession',
                SQLParams: [{ Name: 'TaskId', Value: sId, DBType: 'int' }]
            };
            var executeParams = encodeURIComponent(JSON.stringify(objArgs));
            $.ajax({
                cache: false,
                type: "GET",
                url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    GSDialog.HintWindow('删除成功!', function () {
                        window.location.reload();
                    });

                },
                error: function (response) { GSDialog.HintWindow('删除失败!', function () { window.location.reload(); }); }
            });
        })
    }

    function renderListItem(source) {
        var gridRowTemplate = "<tr><td class='center'>{0}</td><td class='center'><div class='taskdesc'>{1}</div></td><td><div class='taskdesc'>{2}</div></td><td class='center'>{3}</td><td class='center'>{4}</td><td class='center'>{5}</td></tr>";
        var operatorTemplate = '<a href="{0}">执行</a>&nbsp;{1}&nbsp;<a href="javascript:deleteAssetList(\'{2}\')">删除</a>';
        var editTemplate = '<a href="javascript:editAssetTask(\'{0}\',\'{1}\',\'{2}\',\'{3}\')">编辑</a>&nbsp;';
        var html = '';
        $.each(source, function (i, v) {
            var state = v.state == 1 ? '已完成' : '待执行'
            var operation = v.state == 1 ? 'javascript:;" style="cursor: default;opacity: 0.2' : "javascript:executeAssetTask(" + v.Id + ")";
            var finishTime = v.FinishTime == null?'':v.FinishTime;
            html += gridRowTemplate.format(v.RowNum, v.Name, v.Description, state, finishTime, operatorTemplate.format(operation, editTemplate.format(v.Id, v.RowNum, base.encode(v.Name), base.encode(v.Description)), v.Id));
        });
      
        $('#divProcessStatusList').empty().append(html);
        $("#divLoading").fadeOut();
        $('.taskdesc').click(function () {
            $(this).toggleClass('autoHeight');
        });
    }





    $(function () {
        var request = common.getRequest();
        assetId = request.AssetId;
        if (!request.appDomain || !request.TaskCode) {
            $("#divLoading").fadeOut();
            return;
        }


        loadAssetTask(assetId, function (res) {
             renderListItem(res);
            
        });

        $('#btnViewVariables').anyDialog({
            width: 450,
            height: 500,
            title: '任务变量列表',
            html: $('#divVariablesList'),	// 弹出框内容 支持HTML或对象 $(dom)
            status: null
        });
    });

    $('#btnGenerateNext').click(function () {
        $('#tfootNewSession').toggle();
        if ($("#tfootNewSession").is(":hidden")) {
            $("#btnGenerateNext").html('添加')
        }
        else {
            $("#btnGenerateNext").html('撤销')
        }
    });

    $('#confirm').click(function () {
        var name = $("#TaskName").val();
        var des = $("#TaskDes").val();
        var flag = true;
        $('#tfootNewSession .form-control').each(function () {
            if (!common.CommonValidation.ValidControlValue($(this))) {
                flag = false;
            }

        })
        if (flag) {
            addAssetTask(name, des);
        }

    })



    function addAssetTask(name, des) {

        if (assetTaskIsExist(name, des, assetId)) {
            GSDialog.HintWindow('该记录已存在，请重新输入', function () {
                window.location.reload();
            });
            return;
        }

        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecute?';
        var objArgs = {
            SPName: 'usp_AddAssetTask',
            SQLParams: [
                { Name: 'Name', Value: name, DBType: 'string' },
                { Name: 'AssetId', Value: assetId, DBType: 'int' },
                { Name: 'Description', Value: des, DBType: 'string' }
            ]
        };
        var executeParams = encodeURIComponent(JSON.stringify(objArgs));
        $.ajax({
            cache: false,
            type: "GET",
            url: svcUrl + 'connConfig=TrustManagement&appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                location.reload();
            },
            error: function (response) { GSDialog.HintWindow('Error occursed when fetch the remote source data!'); }
        });

    }
    ////////////////////////////Global Variables and Functions for Silverlight
    var sessionID, taskCode;
    var clientName = 'TaskProcess';
    var IndicatorAppDomain;
    var IsSilverlightInitialized = false;
    function InitParams() {
        if (!IsSilverlightInitialized) {
            IsSilverlightInitialized = true;
        }
        document.getElementById("TaskProcessCtl").Content.SL_Agent.InitParams(sessionID, IndicatorAppDomain, taskCode, clientName);
    }
  

 





    function Base64() {

        // private property 
        _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // public method for encoding 
        this.encode = function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = _utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
            }
            return output;
        }

        // public method for decoding 
        this.decode = function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = _utf8_decode(output);
            return output;
        }
        // private method for UTF-8 encoding 
        _utf8_encode = function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        }

        // private method for UTF-8 decoding 
        _utf8_decode = function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    }
   

})

