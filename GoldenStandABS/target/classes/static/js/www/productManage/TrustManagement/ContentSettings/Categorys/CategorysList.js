/// <reference path="../../TrustWizard/Scripts/jquery-1.7.2.min.js" />
/// <reference path="jquery.datagrid.js" />
/// <reference path="jquery.datagrid.options.js" />
/// <reference path="../../TrustWizard/Scripts/common.js" />
var listCategory = {
    Originator: 'Originator'//原始权益人列表
};
var displayColumns = {
    Originator: [
        {
            field: "CategoryCode", title: "编码", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
        },
        {
            field: "CategoryValue", title: "值", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
        },
        { field: "SequenceNo", title: "顺序号", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd },
        {
            field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                var html = '<a style="cursor:pointer" onclick="PagerListModule.Edit(' + data.row.CategoryId + ');">编辑</a>';
                html += '&nbsp; <a style="cursor:pointer" onclick="PagerListModule.Del(' + data.row.CategoryId + ');">删除</a>';
                return html;
            }
        }
    ]
};

var PagerListModule = function () {
    var listCate, spName, trustId, svcUrl, $dtGrid;

    var initArgs = function (cate, sp, tId, url, continerId) {
        listCate = cate;
        spName = sp;
        trustId = tId,
        svcUrl = url;
        $dtGrid = $(continerId);
    };

    var dataBind = function (fnCallBack) {
        $dtGrid.datagrid({
            source: function () {
                var params = this.params();
                return syncGetRemoteData(params)
            },
            col: displayColumns[listCate],
            attr: 'mytable',
            paramsDefault: { paging: 30 },
            noData: "<p class='noData'>当前视图没有可显示记录。</p>",
            pagerPosition: "bottom",
            pager: "mypager",
            sorter: "mysorter",
            /*onBefore: function() {
      
            },
            onData: function() {
      
            },
            onRowData: function(data) {
      
            },*/
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

        var start = (gridParams.page - 1) * gridParams.paging + 1;
        var end = gridParams.page * gridParams.paging;
        //TrustManagement.tblAssetDetails
        executeParam.SQLParams.push({ Name: 'tableName', Value: 'TrustManagement.ItemCategory', DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : 'CategoryId', DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'direction', Value: (gridParams.direction) ? gridParams.direction : null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'where', Value: ((gridParams.where) ? gridParams.where : ''), DBType: 'string' });

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

    var filterData = function (filters) {
        $dtGrid.datagrid('reset');
        $dtGrid.datagrid("fetch", filters);
    };

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

    function edit(id) {
        $.anyDialog({
            width: 900,	// 弹出框内容宽度
            height: 500, // 弹出框内容高度
            title: '任务设置',	// 弹出框标题
            url: './SystemSettings/TrustTaskConfig.html?id=' + id,
            onClose: function () {
                //关闭的回调 list 的刷新方法
                //searchByWhere();
            }
        });
    }
    function del(id) {
        if (confirm("确定删除？")) {
            var executeParam = {
                SPName: 'usp_DeleteTrustTaskConfig', SQLParams: [
                    { Name: 'id', value: id, DBType: 'int' }
                ]
            };
            fetchMetaData(executeParam, function (result) {
                if (result[0].Result) {
                    searchByWhere();
                    //alert('删除成功！');
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
        FetchMetaData: fetchMetaData,
        Edit: edit,
        Del: del
    };

}();