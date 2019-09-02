define(function (require) {
    var $ = require('jquery');
    var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/basicData/TrustManagementService/TrustManagement/common/Scripts/kendoGridModel');
    var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');
    var roleOperate = require('gs/uiFrame/js/roleOperate');
    var GSDialog = require("gsAdminPages")
    var GlobalVariable = require('globalVariable');

    var fetchMetaData = function (executeParams, fnCallBack) {
        var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
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
    };


    function RenderGrid() {
        var filter = '';
        $("#grid").html("");
        var h = $("body").height() - 75 < 0 ? 400 : $("body").height() - 75;
        var Grid = new kendoGridModel(h);
        var self = this;


        var Options = {
            renderOptions: {
                scrollable: true,
                resizable: true
                , columns: [
                               { field: "FunctionName", title: '功能名称', width: "300px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                             , { field: "FunctionDescription", title: '功能描述', width: "300px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                             , { field: "PythonFileUrl", title: '解析脚本', template: "#=resolve(PythonFileUrl)#", width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                            , { field: "ConfigFileUrl", title: '配置文件', template: "#=config(ConfigFileUrl)#", width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                            , { field: "Id", title: '操作', template: "#=RetrunTitle(Id)#", width: "100px", headerAttributes: { "class": "table-header-cell", style: "text-align: left" }, attributes: { "class": "table-cell", style: "text-align: left" } }
                ]
            }
          , dataSourceOptions: {
              pageSize: 20
              , otherOptions: {
                  orderby: "Id asc"
                  , direction: ""
                  , defaultfilter: filter
                  , DBName: 'TrustManagement'
                  , appDomain: 'TrustManagement'
                  , executeParamType: 'extend'
                  , executeParam: function () {
                      var result = {
                          SPName: 'usp_GetPythonList', SQLParams: [
                              { Name: 'tableOrView', value: 'TrustManagement.tblPythonScript', DBType: 'string' },
                          ]
                      };

                      return result;
                  }
              }
          }
        };


        Grid.Init(Options, 'grid');
        Grid.RunderGrid();

    }


    this.resolve=function(parms) {
        //var html = '';
        //html = '<a title="' + parms + '">' + parms + '</span>';
        //return html

        var html = '<a href="' + parms + '"  target="_blank" title="右键 另存为..." class="ms-cui-disabled">下载</a>';
        return html;
    }

    this.config=function(parms) {

        var html = '<a href="' + parms + '"  target="_blank" title="右键 另存为..." class="ms-cui-disabled">下载</a>';
        return html;

    }

    this.RetrunTitle = function (parms) {
        var html = '<a style="cursor:pointer" onclick="edit(' + parms + ');">编辑</a>';

        html += '&nbsp; <a style="cursor:pointer" onclick="del(' + parms + ');">删除</a>';
        return html;
    }


    this.edit=function(Id) {

        $.anyDialog({
            width: 900,	// 弹出框内容宽度
            height: 420, // 弹出框内容高度
            title: '编辑',	// 弹出框标题
            url: './Edit.html?Id=' + Id,
            scrolling:false,
            onClose: function () {
                //关闭的回调 list 的刷新方法
                //searchByWhere();
                window.location.reload();
            }
        });
    }

    this.del=function(Id) {

        if (confirm("确定删除？")) {
            var executeParam = {
                SPName: 'usp_DeletePythonTask', SQLParams: [
                    { Name: 'Id', value: Id, DBType: 'int' }
                ]
            };
            fetchMetaData(executeParam, function (result) {
                if (result[0].Result) {
                    window.location.reload();

                } else {
                    alert('删除数据时出现错误！');
                }
            });
        }
    }



    $(function () {
        $("#btnAddNew").anyDialog({
            width: 900,	// 弹出框内容宽度
            height: 400, // 弹出框内容高度
            title: '新增',	// 弹出框标题
            url: './Add.html',
            scrolling:false,
            onClose: function () {
                //searchByWhere();
                window.location.reload();
            }
        });


        RenderGrid();



    });

})

















/// <reference path="../../TrustWizard/Scripts/jquery-1.7.2.min.js" />
/// <reference path="jquery.datagrid.js" />
/// <reference path="jquery.datagrid.options.js" />
/// <reference path="../../TrustWizard/Scripts/common.js" />
        /*
var listCategory = {
    Template: 'Template'//Python脚本列表
};
var displayColumns = {
    Template: [
		
		 {
            field: "FunctionName", title: "功能名称", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
        },
		 {
            field: "FunctionDescription", title: "功能描述", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
        },
		{
            field: "PythonFileUrl", title: "解析脚本", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
			, render: function (data) {
                if (data) {
                    var $html = $('<a href="javascript:void(0)"  target="_blank" title="右键 另存为..." class="ms-cui-disabled">下载</a>');

                      var currentReportUrl = data.row.PythonFileUrl;
                        $html.removeClass('ms-cui-disabled');
                        $html.prop("href", currentReportUrl);
                    
                    
                    return $html;
                }
            }
        },
        {
            field: "ConfigFileUrl", title: "配置文件", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
			, render: function (data) {
                if (data) {
                    var $html = $('<a href="javascript:void(0)"  target="_blank" title="右键 另存为..." class="ms-cui-disabled">下载</a>');

                      var currentReportUrl = data.row.ConfigFileUrl;
                        $html.removeClass('ms-cui-disabled');
                        $html.prop("href", currentReportUrl);             
                    return $html;
                }
            }
        },
        {
            field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                var html = '<a style="cursor:pointer" onclick="PythonModule.Edit(' +data.row.Id+');">编辑</a>';
			
                html += '&nbsp; <a style="cursor:pointer" onclick="PythonModule.Del(' + data.row.Id + ');">删除</a>';
                return html;
            }
        }
    ]
};

var PythonModule = function () {
    var listCate, spName, trustId, svcUrl, $dtGrid;

    var initArgs = function (cate, sp, tId, url, continerId) {
        listCate = cate;
        spName = sp;
        trustId = tId,
        svcUrl = url;
        $dtGrid = $(continerId);
    };

    var dataBind = function (fnCallBack) {
	
		// getFiles();
		
        $dtGrid.datagrid({
            source: function () {
                var params = this.params();
				return syncGetRemoteData(params);
            },
            col: displayColumns[listCate],
            attr: 'mytable',
            paramsDefault: { paging: 30 },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
           
            onComplete: function () {
                $(".mytable").on("click", ".table-td", function () {
                    $(".mytable .table-td").removeClass("active");
                    $(this).addClass("active");
                });

                if (fnCallBack) { fnCallBack(this.settings.recordCount); }
            }
        });
    };
    var syncGetRemoteData = function (gridParams) {
		       

        var executeParam = { SPName: spName, SQLParams: [] };
        executeParam.SQLParams.push({ Name: 'TemplateType', Value: 'Python', DBType: 'string' });
       
	
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
	
		var sourceData = { total: 0, data: [] };
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=DatagridDataSource',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
					
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });
        return sourceData;
    };
	
	
	
	
	var getFiles=function()
	{
		
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		// 获取目录下所有文件，对于该浏览器缓存目录，仅能获取到一个文件
		var path = 'E:\\TSSWCFServices\\TrustManagementService\\TrustManagement\\PythonFiles';
		
		var fldr = fso.GetFolder(path);
		var ff = new Enumerator(fldr.Files);
		var s = '';
		var fileArray = new Array();
		var fileName = '';
		var count = 0;
		for(; !ff.atEnd(); ff.moveNext()){
			fileName = ff.item().Name + '';
			fileName = fileName.toLowerCase();
			fileName = fileName.substring(0,fileName.indexOf('.'));
			fileArray.push(fileName);
			count++;
		}
	
		return fileArray;

	}

    
	
    var fetchMetaData = function (executeParams, fnCallBack) {
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
    };

	 var filterData = function (filters) {
        $dtGrid.datagrid('reset');
        $dtGrid.datagrid("fetch", filters);
    };
    function edit(Id) {
	
        $.anyDialog({
            width: 900,	// 弹出框内容宽度
            height: 500, // 弹出框内容高度
            title: '编辑',	// 弹出框标题
            url: './SystemSettings/Edit.html?Id=' + Id,
            onClose: function () {
                //关闭的回调 list 的刷新方法
                searchByWhere();
            }
        });
    }
    function del(Id) {
		
        if (confirm("确定删除？")) {
            var executeParam = {
                SPName: 'usp_DeletePythonTask', SQLParams: [
                    { Name: 'Id', value: Id, DBType: 'int' }
                ]
            };
            fetchMetaData(executeParam, function (result) {
                if (result[0].Result) {
					 searchByWhere();
					
                } else {
                    alert('删除数据时出现错误！');
                }
            });
        }
    }

    return {
        Init: initArgs,
        DataBind: dataBind,
		Filter: filterData,
        Edit: edit,
        Del: del
    };

}();*/