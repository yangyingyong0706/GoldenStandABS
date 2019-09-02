var listCategory = {
    RuleList: 'RuleList', //尽调底稿列表
    RuleDefault: 'RuleDefault',//尽调底稿明细
    DiffWordHistory: "DiffWordHistory",
    PlanHistory: "PlanHistory"
};

var common = require('common');
var displayColumns = {
    RuleList: [
        {
            field: "", title: "序号", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) { return data.rowindex; }
        },
        {
            field: "VersionDateTime", title: "创建时间", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                return data.value ? common.getStringDate(data.value).dateFormat('yyyy-MM-dd') : '';
            }
        },
        { field: "VersionNumber", title: "版本号", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
        { field: "CreatedBy", title: "创建者", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd },
        {
            field: "Remark", title: "备注", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                $(this).attr("title", data.value)
                return data.value.length > 30 ? common.splitString(data.value, 30) : data.value;
            }
        },
        {
            field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                var html = '<a class="RuleListA" href="#" data-id = "' + data.row.VersionId + '">详情</a>';
                html += '&nbsp;&nbsp;&nbsp;';
                return html;
            }
        }
        //{
        //    field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
        //    render: function (data) {
        //        var defaultPageUrl = 'manageDueDiligenceDefault.html?vid=' + data.row.VersionId + '';
        //        var html = '<a href="javascript: common.topOpen(\'详情\',\'' + defaultPageUrl + '\',null,function(){},800,500,null,true,true,true,false);">详情</a>';
        //        html += '&nbsp;&nbsp;&nbsp;';
        //        return html;
        //    }
        //}
    ],
    RuleDefault: [
        {
            field: "", title: "序号", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) { return data.rowindex; }
        },
        { field: "ChapterValue", title: "章节编码", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
        {
            field: "ChapterTitle", title: "章节名称", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                $(this).attr("title", data.value)
                return data.value.length > 30 ? common.splitString(data.value, 30) : data.value;
            }
        },
        { field: "RuleValue", title: "映射对象", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
    ],
    DiffWordHistory: [
        {
            field: "", title: "序号", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) { return data.rowindex; }
        },
        {
            field: "VNumber", title: "版本号", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) { return data.value.toString(); }
        },
        {
            field: "WordType", title: "类型", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) { return data.value==1?"经办":"复核"; }
        },
        {
            field: "RootPath", title: "根路径", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                $(this).attr("title", data.value)
                return data.value == null ? "" : data.value.length > 40 ? common.splitString(data.value, 40) : data.value
            }
        },
        { field: "CreatedDate", title: "更新时间", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
        {
            field: "CreatedBy", title: "更新者", attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) { return data.value == "null" ? "" : data.value; }
        },
        //{
        //    field: "WordPath", title: "文件路径", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
        //    render: function (data) {
        //        return data.value == null ? "" : data.value;//data.value.length > 40 ? common.splitString(data.value, 40) : 
        //    }
        //},
    ],
    PlanHistory: [
        {
            field: "", title: "序号", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) { return data.rowindex; }
        },
        {
            field: "RootPath", title: "文件路径", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                $(this).attr("title", data.value)
                return data.value.length > 40 ? common.splitString(data.value, 40) : data.value;
            }
        },
        { field: "CreatedBy", title: "更新者", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
        { field: "CreatedDate", title: "更新时间", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd },
        {
            field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
            render: function (data) {
                var html = "<a onclick=\"loadSpecFileCatalog('" + encodeURIComponent(data.row.RootPath) + "')\" href='javascript:void(0);'>获取该版本目录</a>";
                return html;
            }
        }
    ],

};

var PagerListModule = function () {
    var listCate, spName, trustId, ruleTypeId, versionId, svcUrl, $dtGrid;

    var initArgs = function (cate, sp, tId, rId, vId, url, continerId) {
        listCate = cate;
        spName = sp;
        trustId = tId,
        ruleTypeId = rId,
        versionId = vId,
        svcUrl = url;
        $dtGrid = $(continerId);
    };

    var dataBind = function (fnCallBack) {
        if ($dtGrid.find("table").length > 0)
            $dtGrid.datagrid('destroy');
        $dtGrid.datagrid({
            source: function () {
                var params = this.params();
                return syncGetRemoteData(params);
            },
            col: displayColumns[listCate],
            attr: 'mytable',
            paramsDefault: { paging: 20 },
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

                if (fnCallBack) {
                    var totalCount = this.settings.recordCount;
                    var VersionId = 0;
                    if (totalCount > 0) {
                        VersionId = this.render.arguments[0].data[0].VersionId;
                    }
                    fnCallBack(VersionId);
                }
            }
        });
    };

    var defatult_dataBind = function (fnCallBack) {
        if($dtGrid.find("table").length>0)
		    $dtGrid.datagrid('destroy');
        $dtGrid.datagrid({
            source: function () {
                var params = this.params();
                return syncGetDefaultRemoteData(params);
            },
            col: displayColumns[listCate],
            attr: 'mytable',
            paramsDefault: { paging: 20 },
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

                if (fnCallBack) {
                    fnCallBack(this.settings.recordCount);
                }
            }
        });
    };

    var diffWordHistory_dataBind = function (fnCallBack) {
        $dtGrid.datagrid({
            source: function () {
                var params = this.params();
                return syncGetDiffWordHistory(params);
            },
            col: displayColumns[listCate],
            attr: 'mytable',
            paramsDefault: { paging: 20 },
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

                if (fnCallBack) {
                    fnCallBack(this.settings.recordCount);
                }
            }
        });
    }

    var ReviewHistory_dataBind = function (fnCallBack) {
        $dtGrid.datagrid({
            source: function () {
                var params = this.params();
                return syncGetPlanWordHistory(params);
            },
            col: displayColumns[listCate],
            attr: 'mytable',
            paramsDefault: { paging: 20 },
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

                if (fnCallBack) {
                    fnCallBack(this.settings.recordCount);
                }
            }
        });
    }

    var syncGetRemoteData = function (gridParams) {
        var executeParam = { SPName: spName, SQLParams: [] };

        var start = (gridParams.page - 1) * gridParams.paging + 1;
        var end = gridParams.page * gridParams.paging;
        executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'trustId', Value: trustId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'ruleTypeId', Value: ruleTypeId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'direction', Value: (gridParams.direction) ? gridParams.direction : null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'where', Value: (gridParams.where) ? gridParams.where : null, DBType: 'string' });

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
            error: function (response) {
                alert('获取数据失败!');
            }
        });
        return sourceData;
    };

    var syncGetDefaultRemoteData = function (gridParams) {
        var executeParam = { SPName: spName, SQLParams: [] };

        var start = (gridParams.page - 1) * gridParams.paging + 1;
        var end = gridParams.page * gridParams.paging;
        executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'versionId', Value: versionId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'direction', Value: (gridParams.direction) ? gridParams.direction : null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'where', Value: (gridParams.where) ? gridParams.where : null, DBType: 'string' });

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
            error: function (response) {
                alert('获取数据失败!');
            }
        });
        return sourceData;
    }

    var syncGetDiffWordHistory = function (gridParams) {
        var executeParam = { SPName: spName, SQLParams: [] };

        var start = (gridParams.page - 1) * gridParams.paging + 1;
        var end = gridParams.page * gridParams.paging;
        executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'trustId', Value: trustId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'isPlanWord', Value: versionId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'direction', Value: (gridParams.direction) ? gridParams.direction : null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'where', Value: (gridParams.where) ? gridParams.where : null, DBType: 'string' });

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
            error: function (response) {
                alert('获取数据失败!');
            }
        });
        return sourceData;
    }

    var syncGetPlanWordHistory = function (gridParams) {
        var executeParam = { SPName: spName, SQLParams: [] };

        var start = (gridParams.page - 1) * gridParams.paging + 1;
        var end = gridParams.page * gridParams.paging;
        executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'trustId', Value: trustId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'wordType', Value: ruleTypeId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'isPlanWord', Value: versionId, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'direction', Value: (gridParams.direction) ? gridParams.direction : null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'where', Value: (gridParams.where) ? gridParams.where : null, DBType: 'string' });

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
            error: function (response) {
                alert('获取数据失败!');
            }
        });
        return sourceData;
    }


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
                var sourceData;
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }

                if (fnCallBack) { fnCallBack(sourceData); }
            },
            error: function (response) { alert('Error occursed when fetch the filter metadata!'); }
        });
    };

    return {
        Init: initArgs,
        DataBind: dataBind,
        DefaultDataBind: defatult_dataBind,
        Filter: filterData,
        FetchMetaData: fetchMetaData,
        DiffWordHistoryDataBind: diffWordHistory_dataBind,
        ReviewHistoryDataBind: ReviewHistory_dataBind
    };

}();