define(function(require) {
	var $ = require('jquery');
	var GlobalVariable = require('globalVariable');
	var common = require('common');
	var taskIndicator = require('gs/taskProcessIndicator');
	var sVariableBuilder = require('gs/sVariableBuilder');
	var GSDialog = require("gsAdminPages");
	var rk = common.getQueryString('rk');
	var entry = common.getQueryString('entry');
	var kendoGrid = require('kendo.all.min');
	var webProxy = require('gs/webProxy');
	require("kendomessagescn");
	var self = this;
	self.getStringDate = common.getStringDate;
	var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
	var height = $(window).height() - 233;
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
	};
    //渲染kendo
	function RenderGrid(height) {
	    var executeParam = {
	        SPName: 'TrustManagement.usp_GetFileMatchHistory',
	        SQLParams: [{
	            Name: 'UnUsefulParam',
	            value: 1,
	            DBType: 'int'
	        }]
	    }
	    common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
	        var grid = $("#grid").kendoGrid({
	            dataSource: data,
	            height: height,
	            selectable: "multiple",
	            filterable: true,
	            sortable: true,
	            pageable: {
	                refresh: true,
	                pageSizes: true,
	                buttonCount: 5,
	                page: 1,
	                pageSize: 10,
	                pageSizes: [10, 20, 30, 50],
	            },
	            columns: [{
	                field: "SourceFilePath",
	                title: '外部数据文件',
	                width: "100px",
	                template: function (data) {
	                    var str = data.SourceFilePath.substring(data.SourceFilePath.lastIndexOf("\\")).replace(/\\/g, "");
	                    var len = str.lastIndexOf(".");
	                    str=str.substring(0, len);
	                    return str;
	                }
	            },
                {
                    field: "DestinationFilePath",
                    title: '系统模板文件',
                    width: "100px",
                    template: function (data) {
                        var str = data.DestinationFilePath.substring(data.SourceFilePath.lastIndexOf("\\")).replace(/\\/g, "");
                        var len = str.lastIndexOf(".");
                        str=str.substring(0, len);
                        return str;
                    }
                },
                {
	                field: "CreateTime",
	                title: '匹配时间',
	                width: "100px",
	                attributes: {
	                    style: 'text-align:left'
	                }
	            }, {
	                title: '查看',
	                width: "100px",
	                template: function (dataItem) {
	                    var SourceFilePath = dataItem.SourceFilePath
	                    var DestinationFilePath = dataItem.DestinationFilePath
	                    var Url = 'DocumentMatchingDetailsNow.html?SessionId=' + dataItem.SessionId;
	                    var html = '<div style="color: #45569c;cursor: pointer;" onclick="self.SaveFiled(this)" data-SourceFilePath=' + '"' + SourceFilePath + '"' + ' data-DestinationFilePath=' + '"' + DestinationFilePath + '"' + ' data-Url=' + '"' + Url + '"' + '>' + '查看</div>';
	                    return html;
	                }
	            }],
	            dataBound: function () {

	            }
	        });
	    });

	}	
	this.SaveFiled = function (that) {
	    var SourceFilePath = $(that).attr("data-SourceFilePath");
	    var DestinationFilePath = $(that).attr("data-DestinationFilePath")
	    var Url=$(that).attr("data-Url");
	    sessionStorage.setItem("SourceFilePath", SourceFilePath);
	    sessionStorage.setItem("DestinationFilePath", DestinationFilePath);
	    window.location.href = Url
	}
	inputFileClick();
	$(function () {
	    RenderGrid(height)
	    $('#loading').hide();
		$('#upload_ail').click(function() {
			var filePath1 = $('#fileUploadFileU1').val();
			var filePath2 = $('#fileUploadFileU2').val();
			var fileName1 = filePath1.substring(filePath1.lastIndexOf('\\') + 1);
			var fileName2 = filePath2.substring(filePath2.lastIndexOf('\\') + 1);
			var FileUploadResult1 = '';
			var FileUploadResult2 = '';
			if(filePath1 == "") {
				GSDialog.HintWindow('请上传源文件!');
				return false
			}
			if(filePath2 == "") {
				GSDialog.HintWindow('请上传目标文件!');
				return false
			}
			//$('#loadingSmall').show();
			$('#AssetDocumentMatching').addClass('pointerEvents');
			UploadFile('fileUploadFileU1', fileName1, 'PoolImportData', 'test_progress1', function (d) {
			    var str = "E:\\TSSWCFServices\\PoolCut\\Files\\PoolImportData\\" + d.substring(d.lastIndexOf("\\") + 1)
			    FileUploadResult1 = str;
			    if(FileUploadResult2 != '') {
			    	$('#loadingSmall').hide();
					$('#AssetDocumentMatching').removeClass('pointerEvents');
					console.log('我先执行了1')
					console.log(FileUploadResult1);
					console.log(FileUploadResult2);
				    RunTaskU(FileUploadResult1, FileUploadResult2)
			    }
			});
			UploadFile('fileUploadFileU2', fileName2, 'PoolImportData', 'test_progress2', function (d) {
			    var str = "E:\\TSSWCFServices\\PoolCut\\Files\\PoolImportData\\" + d.substring(d.lastIndexOf("\\") + 1)
			    FileUploadResult2 = str;
			    if(FileUploadResult1 != '') {
			    	$('#loadingSmall').hide();
					$('#AssetDocumentMatching').removeClass('pointerEvents');
					console.log('我先执行了2');
					console.log(FileUploadResult1);
					console.log(FileUploadResult2);
				    RunTaskU(FileUploadResult1, FileUploadResult2)
			    }
			});
		})
		/*refreshKendouGrid = function() {
			kendouiGrid.RefreshGrid();
		}*/
	});

	function inputFileClick() {
		$(".input_file_style").find("input").change(function() {
			var value = $(this)[0].value;
			if(value != "") {
				var tempfileinfo = value.split('\\')[value.split('\\').length - 1];
				$(this).next()[0].innerHTML = "浏览";
				$(this).parent().parent().children('.file_name').html(tempfileinfo).css("");
			} else {
				$(this).next()[0].innerHTML = '选择文件';
				$(this).parent().parent().children('.file_name').html('');
			}
		})
	}

	function UploadFile(fileCtrlId, fileName, folder,progressID, fnCallback) {
		var fileData = document.getElementById(fileCtrlId).files[0];
		var svcUrl = webProxy.poolCutServiceURL + 'FileUpload?fileName={0}&fileFolder={1}'.format(encodeURIComponent(fileName), encodeURIComponent(folder));
		$.ajax({
			url: svcUrl,
			type: 'POST',
			data: fileData,
			cache: false,
			dataType: 'json',
			processData: false,
			xhr: xhrOnProgress(function (e) {
			    var percent = Math.floor(e.loaded / e.total * 100);
			    if (percent > 0) {
			        $("#" + progressID).css("display", "block");
			        $("#" + progressID + ">.progress-bar").css("width", percent + "%");
			        $("#" + progressID + ">.progress-bar>span").html("" + percent + "%");
			    }
			    if (percent == 100) {
			        $("#" + progressID).css("display", "none");
			    }
			}),
			success: function(response) {
				var sourceData;
				if(typeof response == 'string')
					sourceData = JSON.parse(response);
				else
					sourceData = response;
				if(fnCallback) fnCallback(sourceData.FileUploadResult);

			},
			error: function(data) {
				GSDialog.HintWindow('文件上传失败!');
			}
		});
	}

	function RunTaskU(SourceFilePath, DestinationFilePath) {
	    var info=$("#IsBasedOnReportingDate")[0].checked?1:0//1是 0否
		sVariableBuilder.AddVariableItem('SourceFilePath', SourceFilePath, 'String');
		sVariableBuilder.AddVariableItem('DestinationFilePath', DestinationFilePath, 'String');
		sVariableBuilder.AddVariableItem('IsContainEnglishHeader', info, 'String');
		if (!sessionStorage.getItem('SourceFilePath') || sessionStorage.getItem('SourceFilePath') != '')
		    sessionStorage.removeItem('SourceFilePath')
		sessionStorage.setItem('SourceFilePath', SourceFilePath)
		if (!sessionStorage.getItem('DestinationFilePath') || sessionStorage.getItem('DestinationFilePath') != '')
		    sessionStorage.removeItem('DestinationFilePath')
		sessionStorage.setItem('DestinationFilePath', DestinationFilePath)

		var sVariable = sVariableBuilder.BuildVariables();
		var tIndicator = new taskIndicator({
			width: 900,
			height: 550,
			clientName: 'TaskProcess',
			appDomain: 'Task',
			taskCode: 'FileMatchImportFIle',
			sContext: sVariable,
			callback: function () {
			    var sessionId = sessionStorage.getItem("sessionId")
			    sessionStorage.removeItem("sessionId")

			    webProxy.getSessionProcessStatusList(sessionId, "Task", function (response) {
			        for (let i = 0; i < response.GetSessionProcessStatusListResult.List.length; i++) {
			            if (response.GetSessionProcessStatusListResult.List[i].ActionStatus != "Success") {
			                return;
			            }
			        }
			        window.location.href = './DocumentMatchingDetailsNow.html?SessionId=' + sessionId;
			    });
			}
		});
		tIndicator.show();
	}
	$(window).resize(function() {
		var a = $(window).height() - 233;
		/*if ($("#modal-win", window.parent.document).hasClass("icon icon-window-restore")) {
		    a -= 40;
		}*/
		$("#grid").height(a);
		$("#grid").children(".k-grid-content").height(a - 75)
		$("#grid").children(".k-grid-content-locked").height(a - 75)
	})
	$(window).resize()
});