var ItemListModel = function () {
    var listCategory = {
        Originator: 'Originator'
    };
    var displayColumns = {
        Originator: [
            {
                field: "ItemCode", title: "编码", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "ItemAliasValue", title: "中文名称", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "IsRequired", title: "关联存续期", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) { return data.value == '1' ? '是' : '否'; }
            },
            {
                field: "DataType", title: "数据类型", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "IsCompulsory", title: "必填", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) { return data.value == '1' ? '是' : '否'; }
            },
            {
                field: "IsCalculated", title: "自动计算", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) { return data.value == '1' ? '是' : '否'; }
            },
            {
                field: "IsPrimary", title: "主计算列", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) { return data.value == '1' ? '是' : '否'; }
            },
            {
                field: "UnitOfMeasure", title: "单位", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "Precise", title: "精度", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            { field: "SequenceNo", title: "顺序号", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd },
            {
                field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    var html = '<a style="cursor:pointer" onclick="ItemListModel.PagerListModule.Edit(' + data.row.ItemId + ',' + data.row.CategoryId + ');">编辑</a>';
                    html += '&nbsp; <a style="cursor:pointer" onclick="ItemListModel.PagerListModule.Del(' + data.row.ItemId + ');">删除</a>';
                    return html;
                }
            }
        ]
    };

    var PagerListModule = function () {
        var listCate, spName, categoryId, svcUrl, $dtGrid;

        var initArgs = function (cate, sp, cId, url, continerId) {
            listCate = cate;
            spName = sp;
            categoryId = cId,
            svcUrl = url;
            $dtGrid = $(continerId);
        };

        var dataBind = function (fnCallBack) {
            if ($dtGrid.datagrid("datagrid"))
                $dtGrid.datagrid("destroy");
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
            gridParams.where = gridParams.where ? gridParams.where : '';
            var autoWhere = " and (ItemCode NOT like '%_CT' AND ItemCode NOT like '%_DC' AND ItemCode NOT like '%_CD' AND ItemCode NOT like '%_FirstDate' AND ItemCode NOT like '%_Frequency' AND ItemCode NOT like '%_WorkingDateAdjustment' AND ItemCode NOT like '%_Calendar' AND ItemCode NOT like '%_Condition' AND ItemCode NOT like '%_ConditionTarget' AND ItemCode NOT like '%_ConditionDay' AND ItemCode NOT like '%_ConditionCalendar')  and categoryId=" + categoryId;
            if (gridParams.where.indexOf(autoWhere) < 0)
                gridParams.where += autoWhere;
            executeParam.SQLParams.push({ Name: 'tableName', Value: 'TrustManagement.view_iteminfo', DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : 'IsRequired desc,SequenceNo', DBType: 'string' });
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

        function edit(id, categoryId) {
            $.anyDialog({
                width: 900,	// 弹出框内容宽度
                height: 430, // 弹出框内容高度
                title: '内容设置',	// 弹出框标题
                url: './ContentSettings/Items/ItemDetail.html?ItemId=' + id + '&CategoryId=' + categoryId + '&random=' + Math.random(),
                onClose: function () {
                    //关闭的回调 list 的刷新方法
                    //searchByWhere();
                }
            });
        }
        function del(id) {
            if (confirm("确定删除？删除后将不可用")) {
                var executeParam = {
                    SPName: 'usp_DeleteItemInfo', SQLParams: [
                        { Name: 'ItemId', value: id, DBType: 'int' }
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
            FetchMetaData: fetchMetaData,
            Edit: edit,
            Del: del
        };

    }();

    //var CategoryId;// = getQueryString("categoryId") ? getQueryString("categoryId") : "";
    function initData(categoryId) {
        //CategoryId=categoryId;
        PagerListModule.Init(listCategory.Originator, 'usp_GetListWithPager', categoryId,
            GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
            '#divDataList');
        PagerListModule.DataBind(function (haveData) { });

        $("#btnAddNew").anyDialog({
            width: 900,	// 弹出框内容宽度
            height: 430, // 弹出框内容高度
            title: '任务设置',	// 弹出框标题
            url: './ContentSettings/Items/ItemDetail.html?CategoryId=' + categoryId + '&random=' + Math.random(),
            onClose: function () {
                //关闭的回调 list 的刷新方法
                ItemListModel.PagerListModule.Filter({});
            }
        });
    }

    $('#btnReset').click(function () {
        $('.list-filters .filter').val('');
        ItemListModel.PagerListModule.Filter({});
    });
    $('#btnSearch').click(function () {
        searchByWhere();
    });
    function searchByWhere() {
        var filterWhere = '';
        $('.list-filters .filter').each(function () {
            var $this = $(this);
            var value = $this.val();
            if (value.length < 1) { return true; }

            var param = $this.attr('name');
            if ($this.hasClass('like')) {
                filterWhere += ' and ' + param + ' like N\'%' + value + '%\'';
            } else {
                filterWhere += ' and ' + param + ' = N\'' + value + '\'';
            }
        });
        ItemListModel.PagerListModule.Filter({ 'where': filterWhere });
    }
    function closeDialog() {
        $.anyDialog('destroy');
        //$("#modal-layout").fadeOut('fast', function () {
        //    $("#modal-mask").remove();
        //    $("#modal-layout").remove();
        //})
    }

    return {
        PagerListModule: PagerListModule
        , InitData: initData
        , CloseDialog: closeDialog
    }
}();

$(function () {
    var index = 0, array = [5, 6, 7];

    $("#btnTest").click(function () {
        if ($('#divDataList').datagrid("datagrid"))
            $('#divDataList').datagrid("destroy");
        ItemListModel.InitData(array[index]);
        index++;

        if (index >= array.length)
            index = 0;
    })
})