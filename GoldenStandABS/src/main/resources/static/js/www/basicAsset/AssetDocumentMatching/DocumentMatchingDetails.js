/// <reference path="E:\TFS-Local\SFM\Products\PoolCut\PoolCut\Scripts/PoolCutCommon.js" />
define(function(require) {
    var $ = require('jquery');
	var GlobalVariable = GlobalVariable = require('gs/globalVariable');
	var dataProcess = require('app/assetFilter/js/dataProcess');
	var common = require('gs/uiFrame/js/common');
	var gsUtil = require('gs/gsUtil');
	var taskIndicator = require('gs/taskProcessIndicator');
	var sVariableBuilder = require('gs/sVariableBuilder');
	var webStorage = require('gs/webStorage');
	var gsAdmin = require('gs/uiFrame/js/gs-admin-2.pages');
	var gsUtil = require('gsUtil');
	var GSDialog = require("gsAdminPages")
	var Vue = require('Vue2');
	var sessionId = common.getUrlParam('SessionId')
	var kendoGrid = require('kendo.all.min');
	var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
	var SourceFilePath=sessionStorage.getItem("SourceFilePath");
	var DestinationFilePath=sessionStorage.getItem("DestinationFilePath");
	console.log(SourceFilePath,DestinationFilePath)
	require("kendomessagescn");
	require("jquery.searchSelect");
	var self;
	var DimAssetTypeID = '';
    var SourceFileListLength=""//源文件数据源个数
    var DestinationFileListLength=""//目标文件数据源个数
	window.vm=new Vue({
		el: "#AssetDocumentMatching",
		data: {

		},
		methods: {
			//kendo grid
			kendoGrid: function() {
			    var height = $(window).height() - 305;
				var executeParam = {
				    SPName: 'TrustManagement.usp_GetFileMatchColumnsBySessionId',
				    SQLParams: [{
				        Name: 'SessionId',
				        value: sessionId,
				        DBType: 'string'
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
				            field: "SourceFileColumnsName",
				            title: '源文件',
				            width: "70px"
				        }, {
				            field: "DestinationFileColumns",
				            title: '目标文件',
				            width: "70px"
				        }, {
				            field: "IsEssentialColumn",
				            title: '是否必须',
				            width: "40px",
				            template: function (data) {

				                var IsEssentialColumn = data.IsEssentialColumn;
				                var t;
				                if (data.IsEssentialColumn == 1) {
				                    t = "<span style='color: #dd0000;'>是</span>";
				                } else {
				                    t = "<span>否</span>";
				                }
				                return t
				            },
				        }, {
				            field: "SimilarityDegree",
				            title: '匹配度',
				            width: "100px",
				            template: function (data) {
				                var percent = data.SimilarityDegree;
				                var t;
				                if (data.SimilarityDegree) {
				                    t = "<div style='position:relative'><div class='percentbar'>";
				                    t += "<div class='por' style='width:" + percent + "'>" + "</div></div>"
				                    t += "<div class='por_text'>" + percent + "</div></div>"
				                } else {
                                    t="<div></div>"
				                }
				                return t
				            },
				        }, {
				            title: '操作',
				            width: "30px",
				            template: function (data) {
				                var id=data.MapId;
				                var SessionId=data.uid;
				                var t = '<div  class="removeStyle" onclick="self.removeItem(this)" id=' + '"' + id + '"' + ' data-info=' + '"' + SessionId + '"' + '>' + '<i class="icon icon-trash-empty"></i>' + '</div>';
				                return t
				            },
				        }],
				        dataBound: function () {

				        }
				    });
				});
				$('#loading').hide();
			},
			//Windows窗口改变事件
			windowsChange: function() {
				window.onresize = function() {
					let a = $(window).height() - 305;
					/*if($("#modal-win", window.parent.document).hasClass("icon icon-window-restore")) {
						a -= 40;
					}*/
					$("#grid").height(a);
					$("#grid").children(".k-grid-content").height(a - 75)
					$("#grid").children(".k-grid-content-locked").height(a - 75)
				}
			},
			//获取源文件下拉菜单
			getOldeSelect: function() {
				var self = this,
					svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
					executeParam = {
						'SPName': 'TrustManagement.usp_GetFileMatchUnMatchedSourceFIleColumnsBySessionId',
						'SQLParams': [{
							'Name': 'SessionId',
							'Value': sessionId,
							'DBType': 'string'
						}]
					},
					appDomain = 'TrustManagement';
				common.ExecuteGetData(false, svcUrl, appDomain, executeParam, function (data) {
				    var html = "";
				    $.each(data, function (i, v) {
				        html += "<option>" + v.ColumnName_CN + "</option>"
				    })
				    SourceFileListLength = data.length
				    self.renderNumber()
				    $("#SourceFile").html("");
				    $("#SourceFile").append(html);

				});
			},
			getNeweSelect: function() {
				var self = this,
					svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
					executeParam = {
					    'SPName': "TrustManagement.usp_GetFileMatchUnMatchedDestinationFIleColumnsBySessionId",
						'SQLParams': [{
							'Name': 'SessionId',
							'Value': sessionId,
							'DBType': 'string'
						}]
					},
					appDomain = 'TrustManagement';
				common.ExecuteGetData(false, svcUrl, appDomain, executeParam, function (data) {
				    var html = "";
				    $.each(data, function (i, v) {
				        if (v.IsEssentialColumn == 1) {
				            html += "<option value=" + v.ColumnName_CN + ">" + v.ColumnName_CN + '[必须]' + "</option>"
				        } else {
				            html += "<option value=" + v.ColumnName_CN + ">" + v.ColumnName_CN + "</option>"
				        }
				        
				    })
				    DestinationFileListLength = data.length
				    self.renderNumber()
				    $("#DestinationFile").html("");
				    $("#DestinationFile").append(html);
				    //self.DestinationFileListLength=data.length;
				});
			},
			goback:function(){
			    window.location.href = 'AssetDocumentMatching.html';
			},
			renderNumber:function(){
			    var selft = this;
			    var info = "(源文件未匹配数量:" + SourceFileListLength + "&nbsp;&nbsp;&nbsp;&nbsp;" + "目标文件未匹配数量:" + DestinationFileListLength + ")"
			    $("#infotext").html(info)
			},
			addItem:function(){
			    var self=this;
			    var SourceFile = $("#SourceFile").next().find('.searchable-select-holder').text();
			    var DestinationFile = $("#DestinationFile").next().find('.searchable-select-holder').text();
			    DestinationFile = DestinationFile.split('[')[0];
			    var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?'
			    var executeParam = {
			        'SPName': 'TrustManagement.usp_InsertFileMatchMap',
			        'SQLParams': [
                        {'Name': 'SessionId','Value': sessionId,'DBType': 'string'},
                        {'Name': 'SourceFileColumnsName','Value': SourceFile,'DBType': 'string'},
                        {'Name': 'DestinationFileColumns','Value': DestinationFile,'DBType': 'string'},
			        ]
			    }
			    common.ExecuteGetData(false, svcUrl,'TrustManagement', executeParam, function(data) {
			        self.getOldeSelect();
			        self.getNeweSelect();
			        self.kendoGrid();
			        self.randerSelect();
			        GSDialog.HintWindow("添加成功")
			    });
			   
			},
			saveUpload: function() {
			    sVariableBuilder.AddVariableItem('SessionId', sessionId, 'String');
			    sVariableBuilder.AddVariableItem('SourceFilePath', SourceFilePath, 'String');
			    sVariableBuilder.AddVariableItem('DestinationFilePath', DestinationFilePath, 'String');
				var sVariable = sVariableBuilder.BuildVariables();
				var tIndicator = new taskIndicator({
					width: 900,
					height: 550,
					clientName: 'TaskProcess',
					appDomain: 'Task',
					taskCode: 'FileMatchExportFIle',
					sContext: sVariable,
					callback: function() {
					    var tempsessionId = sessionStorage.getItem("sessionId")
					    sessionStorage.removeItem("sessionId")
					    webProxy.getSessionProcessStatusList(tempsessionId, "Task", function (response) {
					        for (let i = 0; i < response.GetSessionProcessStatusListResult.List.length; i++) {
					            if (response.GetSessionProcessStatusListResult.List[i].ActionStatus != "Success") {
					                return;
					            }
					        }
					        var reg = /([.]\w+)$/;    
					        var fileName = SourceFilePath.substring(SourceFilePath.lastIndexOf("\\")).replace(/\\/g, "")
					        var fileExtension = fileName.match(reg)[0];
					        fileName = fileName.replace(reg,"");
					        var filepath = webProxy.baseUrl + "/PoolCut/Files/FIleMatch" + "/" + fileName + "_" + sessionId.replace(/[_]/,"") + fileExtension;
					        console.log(filepath);
					        const a = document.createElement('a'); // 创建a标签
					        a.setAttribute('download', '');// download属性
					        a.setAttribute('href', filepath);// href链接
					        a.click();	
					    })					
					}
				});
				tIndicator.show();
			},
			randerSelect: function () {
			    $('.searchable-select').remove();
			    $('#DestinationFile').searchableSelect();
			    $('#SourceFile').searchableSelect();
			    var $selectItem = $('.searchable-select-item');
			    $.each($selectItem, function (i, v) {
			        if ($(this).text().indexOf('[必须]') > -1) {
			            $(this).css('color', '#d0000')
			        }
			    })
			}
	    },
		mounted:function() {
		    this.kendoGrid();
			this.windowsChange();
			this.getOldeSelect();
			this.getNeweSelect();
			this.randerSelect();
        }
    })
	this.removeItem = function (that) {
	    var id = that.id;
	    var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?'
	    var executeParam = {
	        'SPName': 'TrustManagement.usp_DeleteFileMatchMap',
	        'SQLParams': [
                { 'Name': 'SessionId', 'Value': sessionId, 'DBType': 'string' },
                { 'Name': 'Id', 'Value': id, 'DBType': 'string' },
	        ]
	    }
	    GSDialog.HintWindowTF("是否删除本条数据", function () {
	        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
	            vm.$options.methods.getNeweSelect();
	            vm.$options.methods.getOldeSelect();
	            vm.$options.methods.kendoGrid();
	            vm.$options.methods.randerSelect();
	        });
	    })
	}
})