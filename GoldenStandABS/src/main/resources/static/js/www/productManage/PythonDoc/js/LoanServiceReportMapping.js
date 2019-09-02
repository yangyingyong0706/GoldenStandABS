
var objs=[];

function fetchMetaData(executeParams, fnCallBack) {
        var executeParams = encodeURIComponent(JSON.stringify(executeParams));
        $.ajax({
            cache: false,
            type: "GET",
            url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }

                if (fnCallBack) { fnCallBack(sourceData); }
            },
            error: function (response) { alert('Error occursed when fetch the filter metadata!'); }
        });
    }

function BindData(tid) {
		
       
		var executeParam = {
			SPName: 'usp_GetLoanServiceReportHistory', SQLParams: [
				{ Name: 'TrustId', value: tid, DBType: 'int' }
			]
		};
		fetchMetaData(executeParam, function (result) {
			console.log(result);
			objs=result;			
			bindAssetPaymentStatisticsList(objs);
		});
        
    }

function ReRunTask(sessionid){
	var _this = this;
	if(objs.length > 0){
		$.each(objs, function (i, n) {
			if(objs[i].SessionId.toLowerCase() == sessionid){
				_this.runTask(objs[i].TrustId,objs[i].ReportingDate,objs[i].SourceFilePath,objs[i].PythonScriptId);
				return;
			}
		});
	}
}
function UpLoadExcel(sessionid)
{
	var _this = this;
	if(objs.length > 0){
		$.each(objs, function (i, n) {
			if(objs[i].SessionId.toLowerCase() == sessionid){
				_this.runExcelTask(objs[i].TrustId,objs[i].ReportingDate,objs[i].ExcelUrl);
				return;
			}
		});
	}
}

function runTask(tid,ReportingDate,docfilePath,PythonScriptId){
			var taskCode = 'BuildTrustLoanServiceReportByPython';
            var tpi = new parent.TaskProcessIndicatorHelper();
			tpi.AddVariableItem('TrustId', tid, 'int');
            tpi.AddVariableItem('ReportingDate', ReportingDate, 'String');
            tpi.AddVariableItem('SourceFilePath', docfilePath, 'String');
            tpi.AddVariableItem('PythonScriptId', PythonScriptId, 'int');			
            tpi.ShowIndicator('Task', taskCode, function() {				
				GSDialog.Close(0);
            });
}

function runExcelTask(tid,ReportingDate,docfilePath){
			var ExcelPath='E:\\TSSWCFServices\\'+docfilePath.replace(/\//g,"\\");
          			
			var taskCode = 'ImportTrustLoanServiceReport';
            var tpi = new parent.TaskProcessIndicatorHelper();
			tpi.AddVariableItem('TrustId', tid, 'int');
            tpi.AddVariableItem('ReportingDate', ReportingDate, 'String');
            tpi.AddVariableItem('SourceFilePath', ExcelPath, 'String');
            tpi.ShowIndicator('Task', taskCode, function() {				
				GSDialog.Close(0);
            });
}
function bindPayData(list) {
    var zNodes = [], tmpCode = [];
    var tcs = $.trim($("#TrustCode").val());
    var tcarray = [];
    if (tcs.length > 0) tcarray = tcs.split(',');
    $.each(list, function (i, n) {
        if ($.inArray(n.TrusteeReportingDate, tmpCode) < 0 && (tcarray.length <= 0 || (tcarray.length > 0 && $.inArray(n.TrustName, tcarray) >= 0))) {
            zNodes.push({ id: i + 1, pId: 0, name: n.TrusteeReportingDate });
            tmpCode.push(n.TrusteeReportingDate);
        }
    })
    sortData(zNodes, 'name', 'desc');
    zTreePayDate.Init("treePayDate", zNodes, $("#menuContentPayDate"));

    $("#PayDate").bind("click", zTreePayDate.ShowMenu).attr('readonly', 'readonly');
}
function bindAssetPaymentStatistics(list) {
	
    list = list.sort(function (a, b) {
        return a.ReportingEndDate > b.ReportingEndDate ? 1 : -1;
    });
    for (var i = list.length - 1; i > 0; i--) {
        if (list[i].TrusteeReportingDate === list[i - 1].TrusteeReportingDate) {
            list.splice(i-1, 1);
        }
    }
    //bindAssetPaymentStatisticsList(list);

	
	
}

function bindAssetPaymentStatisticsList(data) {
    if ($('#divDataList1').datagrid("datagrid"))
        $('#divDataList1').datagrid("destroy");
    $('#divDataList1').datagrid({
        data: data,
        col: [
         {
            field: "SessionId", title: "会话Id", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
			
        },
		{
            field: "UserId", title: "用户", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
			
        },
   
        {
            field: "ReportingDate", title: "报告日期", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
			
        },

        {
            field: "", title: "原始贷款服务报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
            , render: function (data) {
                if (data) {
					
                     var $html = $('<a href="javascript:void(0)"  target="_blank"  class="ms-cui-disabled">下载</a>');

                      var currentReportUrl = data.row.SourceFileUrl;
                        $html.removeClass('ms-cui-disabled');
                        $html.prop("href", currentReportUrl);
                    
                    
                    return $html;
                }
            }
        }, 
		{
            field: "", title: "解析模板", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
			, render: function (data) {
                if (data) {
					if(data.row.FunctionName=='[已删除]')
					{
						
					  var html = '<label style="color:#888888">'+data.row.FunctionName+'</label>';
					  return html;
					}
					
					else{
						 var html = '<label style="color:#000000">'+data.row.FunctionName+'</label>';
					  return html;
					}
                }
            }
			
        },
		{  
            field: "", title: "转置报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
            , render: function (data) {
                if (data) {
					if(data.row.ExcelUrl.length>0){
						
					  var $html = $('<a href="javascript:void(0)"  target="_blank" class="ms-cui-disabled">下载</a>');

						  var currentReportUrl =data.row.ExcelUrl;
							$html.removeClass('ms-cui-disabled');
							$html.prop("href", currentReportUrl);
						
						
						return $html;
					}
                }
            }
        },
		
		
		{
            field: "", title: "状态", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
			, render: function (data) {
                if (data) {
					if(data.row.CodeDictionaryCode=='Completed')
					{
						
					  var html = '<label style="color:#000000">'+data.row.CodeDictionaryCode+'</label>';
					  return html;
					}
					
					else{
						 var html = '<label style="color:#ff0000">'+data.row.CodeDictionaryCode+'</label>';
					  return html;
					}
                }
            }
			
        },
		{
            field: "", title: "时间", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
			 ,render: function (data) {
				  if(data)
				  {
					  var html = '<label>'+getStringDate(data.row.StartTime).dateFormat('yyyy-MM-dd hh:mm:ss');+'</label>';
					  return html;
				  }
			
			 }
        },
		{
            field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
			  ,render: function (data) {
				  if(data)
				  {
					  var html = '<a style="cursor:pointer" onclick="ReRunTask(' +'\'' +data.row.SessionId+'\');">重新生成</a>';
					   if(data.row.CodeDictionaryCode=='Completed')
					   {
					   html += '&nbsp; <a style="cursor:pointer" onclick="UpLoadExcel(' +'\'' +data.row.SessionId+'\');">上传转置报告</a>';
					   }
					  return html;
				  }
              
         
        }
	}
        ],
        attr: 'mytable',
        paramsDefault: { paging: 10 },
        noData: "<p class='noData'>当前视图没有可显示记录。</p>",
        pagerPosition: "bottom",
        pager: "mypager",
        sorter: "mysorter",
        onComplete: function () {
            $(".mytable").on("click", ".table-td", function () {
                $(".mytable .table-td").removeClass("active");
                $(this).addClass("active");
            })
        }
    });
}
function bindAssetPaymentStatisticsList1(data) {
    if ($('#divDataList1').datagrid("datagrid"))
        $('#divDataList1').datagrid("destroy");
    $('#divDataList1').datagrid({
        data: data,
        col: [
            {
                field: "TrustID", title: "信托计划ID", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
        {
            field: "TrustName", title: "信托计划代码", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
        },
        {
            field: "TrusteeReportingDate", title: "报告日期", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
        },

        {
            field: "", title: "信托报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
            , render: function (data) {
                if (data) {
                    var url = GlobalVariable.SslHost + 'WorkFlowEngine/Pages/workflowRun.html?objId={0}_{1}&objType=006'.StringFormat(data.row.TrustID, data.row.TrusteeReportingDate.replace(/-/g, ''));

                    var html = '<iframe id="workflowFrame" src="{0}" style="display:block;float:left;border:none;height:30px;width:230px;padding:0px 3px 0px 3px;"></iframe>'.StringFormat(url);
                    return html;
                }
            }
        }, {  
            field: "", title: "报告", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
            , render: function (data) {
                if (data) {
                    var $html = $('<a href="javascript:void(0)" class="ms-cui-disabled">下载</a>');

                    var reportName = getReportFileNameByReportingDate("Waterfall", "docx", data.row.TrustID, data.row.TrusteeReportingDate);
                    var filepath = fileIsExistByTid(reportName, data.row.TrustID);
                    if (filepath == true) {
                        var currentReportUrl = FilePathConfig.GetFilePath(data.row.TrustID, 'TaskReportFiles', '', reportName);
                        $html.removeClass('ms-cui-disabled');
                        $html.prop("href", currentReportUrl);
                    }

                    return $html;
                }
            }
        }
        ],
        attr: 'mytable',
        paramsDefault: { paging: 10 },
        noData: "<p class='noData'>当前视图没有可显示记录。</p>",
        pagerPosition: "bottom",
        pager: "mypager",
        sorter: "mysorter",
        onComplete: function () {
            $(".mytable").on("click", ".table-td", function () {
                $(".mytable .table-td").removeClass("active");
                $(this).addClass("active");
            })
        }
    });
}
