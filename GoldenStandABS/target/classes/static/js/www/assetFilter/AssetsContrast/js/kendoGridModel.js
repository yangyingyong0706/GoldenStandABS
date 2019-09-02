define(function (require) {
    var extGrid = require('gs/Kendo/kendoExtension');
    var gv = require('gs/globalVariable');
    var TrustId;
    var TrustCode;
    var ScheduleDateId;
    var paramsSecond;

    var kendoGridModel = function (height) {
        var winHeight = height, winWidth = 500, gridDomId, renderOptions, dataSourceOptions;

        function init(options) {
            gridDomId = 'grid';
            renderOptions = options.renderOptions;
            dataSourceOptions = options.dataSourceOptions;
        }

        function dataSource() {
            var dataSource = new kendo.data.DataSource($.extend({
                transport: {
                    read: {
                        url: gv.DataProcessServiceUrl + "CommonExecuteGet?",
                        contentType: "application/xml;charset=utf-8",
                        type: "Get",
                        dataType: "jsonp"
                    },
                    parameterMap: function (options, operation) {
                        if (operation == "read") {

                            var orderby = dataSourceOptions.otherOptions.orderby,
                                direction = dataSourceOptions.otherOptions.direction;
                            if (dataSource.sort() != null) {
                                if (dataSource.sort().length > 0) {
                                    orderby = dataSource.sort()[0].field;
                                    direction = dataSource.sort()[0].dir;
                                    orderby = encodeURIComponent(orderby);
                                }
                            };

                            var filter = '';
                            if (dataSourceOptions && dataSourceOptions.otherOptions &&
                                dataSourceOptions.otherOptions.defaultfilter) {
                                if (typeof dataSourceOptions.otherOptions.defaultfilter == 'function')
                                    filter = dataSourceOptions.otherOptions.defaultfilter();
                                else
                                    filter = dataSourceOptions.otherOptions.defaultfilter;
                            }

                            if (dataSource.filter() != null) {
                                var filters = dataSource.filter().filters;
                                $.each(filters, function (i, f) {
                                    filter += KendridFilterToSQL(f.field, f.operator, f.value);
                                });
                            };

                            var start = (options.page - 1) * options.pageSize + 1;
                            var end = options.page * options.pageSize;
                            paramsSecond = dataSourceOptions.params;
                            var executeParamEx = {};
                            if (dataSourceOptions.otherOptions.executeParam) {
                                if (typeof dataSourceOptions.otherOptions.executeParam == 'function')
                                    executeParamEx = dataSourceOptions.otherOptions.executeParam();
                                else
                                    executeParamEx = dataSourceOptions.otherOptions.executeParam
                            }

                            //console.log($.cookie('gs_UserName'));
                            TrustId = executeParamEx.SQLParams[0].Value;
                            TrustCode = executeParamEx.TrustCode;

                            var executeParam = {
                                SPName: executeParamEx.SPName, SQLParams: [
                                    { Name: 'start', Value: start, DBType: 'int' }
                                    , { Name: 'end', Value: end, DBType: 'int' }
                                    , { Name: 'orderby', Value: orderby ? orderby : 'PoolId', DBType: 'string' }
                                    , { Name: 'direction', Value: direction ? direction : null, DBType: 'string' }
                                    , { Name: 'where', Value: filter ? filter : null, DBType: 'string' }
                                    , { Name: 'total', Value: 0, DBType: 'int', IsOutput: true, Size: 100 }
                                ]
                            };
                            localStorage.setItem('contrastFilter',filter ? filter:'');
                            var isDefault = true;
                            if (dataSourceOptions.otherOptions.executeParamType) {
                                switch (dataSourceOptions.otherOptions.executeParamType) {
                                    case 'cover':
                                        executeParam = executeParamEx;
                                        isDefault = false;
                                        break;
                                    case 'extend':
                                    default:
                                        break;
                                }
                            }
                            if (isDefault == true) {
                                $.each(executeParamEx.SQLParams, function (i, n) {
                                    executeParam.SQLParams.push(n);
                                });
                            }
                            var executeParams = encodeURIComponent(JSON.stringify(executeParam));

                            var params = '';
                            params += 'appDomain=' + dataSourceOptions.otherOptions.appDomain + '&executeParams=' + executeParams + '&resultType=DatagridDataSource';
                            return params;
                        }
                    }
                },
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true,
                pageSize: 20,
                schema: {
                    model: {
                        fields: {
                            RoleName: { type: "string" },
                            IsInTrust: { type: "boolean" },
                            Description: { type: "string" },
                        }
                    },
                    data: function (response) {
                        return jQuery.parseJSON(response).data;

                    },
                    total: function (response) {
                        return jQuery.parseJSON(response).total;
                    }

                },
            }, dataSourceOptions));

            return dataSource;
        }

        function KendridFilterToSQL(field, operator, value) {
            switch (operator) {
                case "eq":
                    if (value.constructor == Number) {
                        return " and " + field + " = " + value;
                    }
                    else if (value.constructor == Date) {
                        return " and " + field + " = N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " and " + field + " = N'" + value + "'";
                case "neq ":
                    if (value.constructor == Number) {
                        return " and " + field + " != " + value;
                    }
                    else if (value.constructor == Date) {
                        return " and " + field + " = N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " and " + field + " != N'" + value + "'";
                case "startswith":
                    return " and " + field + " like N'" + value + "%'";
                case "contains":
                    return " and " + field + " like N'%" + value + "%'";
                case "doesnotcontain":
                    return " and " + field + " not like N'%" + value + "%'";
                case "endswith":
                    return " and " + field + " like N'%" + value + "'";
                case "isnull":
                    return " and " + field + " is null";
                case "isnotnull":
                    return " and " + field + " is not null";
                case "isempty":
                    return " and " + field + " = N''";
                case "isnotempty":
                    return " and " + field + " != N''";
                case "gte":
                    if (value.constructor == Date) {
                        return " and " + field + " >= N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " and " + field + " >= " + value;
                case "gt":
                    if (value.constructor == Date) {
                        return " and " + field + " > N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " and " + field + " > " + value;
                case "lte":
                    if (value.constructor == Date) {
                        return " and " + field + " <= N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " and " + field + " <= " + value;
                case "lt":
                    if (value.constructor == Date) {
                        return " and " + field + " < N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " and " + field + " < " + value;
            }
        }

        var selectedRowIndex = -1;
        var pageIndex = 0;

        function runderGrid(isHeight) {
            var fixHeight = isHeight || winHeight;
            $("#" + gridDomId).html("");
            var grid = $("#" + gridDomId).kendoExtGrid($.extend({
                dataSource: dataSource(),
                height: fixHeight,
                selectable: "multiple",
                filterable: true,
                sortable: true,
                reorderable: true,//列的排序,选择一列可以拖动改变她的顺序
                resizable: true,//动态改变列的宽度,在scrollable为true的时候有效,scrollable默认为true
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5,
                    page: 1,
                    pageSize: 20,
                    pageSizes: [5, 20, 50, 100, 500],
                    messages: {
                        display: "显示{0}-{1}条，共{2}条",
                        empty: "没有数据",
                        page: "页",
                        of: "/ {0}",
                        itemsPerPage: "条",
                        first: "第一页",
                        previous: "前一页",
                        next: "下一页",
                        last: "最后一页",
                        refresh: "刷新"
                    }
                },
                columns: [],
                dataBound: function () {
                    var rows = this.items();
                    var page = this.pager.page() - 1;
                    var pagesize = this.pager.pageSize();
                    params = this.dataSource.options.params;
                    var total = this.options.dataSource.total();
                    //var str = "合同笔数：<span>" + total + "笔</span>";
                    //$('.Total').html(str);
                    //$('#showdate').html(eval('new '+this.options.dataSource.data()[0].ReportingDate.replace(new RegExp('\/', 'gm'), '')).dateFormat("yyyyMMdd"))
                    window.total = total;
                    var count;
                    if (page != pageIndex) {
                        selectedRowIndex = -1;
                        pageIndex = page;
                    }
                    $(rows).each(function () {
                        var index = $(this).index();
                        var dataIndex = $(this).index() + page * pagesize;
                        var rowLabel = $(this).find(".row-number");
                        $(rowLabel).attr("index", index);
                        $(rowLabel).attr("dataIndex", dataIndex);
                    });
                    //
                    if (params.length != 0) {
                        count = params.length;
                    }
                    var checkall = window.checkall;
                    if (checkall && $(".tips").css("display") == "block") {
                        $("#opration").html("取消勾选")
                        $("#infomation").html("已勾选全部数据,")
                    } else {
                        $("#infomation").html("已经勾选" + count + "条数据,")
                        $("#opration").html("勾选全部" + total + "条数据");
                    }
                    var arry = $(".selectbox");
                    var off = true;
                    $.each(arry, function (i, v) {
                        if (checkall && $(".tips").css("display") == "block")
                            $(v).prop("checked", true);
                        else {
                            $.each(params, function (j, k) {
                                if (k == $($(v).parent().next().html()).text()) {
                                    $(v).prop("checked", true);
                                    //count++;
                                }
                            })
                        }

                    })
                    $.each(arry, function (i, v) {
                        if (v.checked != true) {
                            off = false;
                        }
                    })
                    if (off && arry.length != 0) {
                        $("#checkAll").prop("checked", true)
                    } else {
                        $("#checkAll").prop("checked", false)
                    }
                    //$("#checkAll").is(":checked") ? $(".tips").show() : $(".tips").hide()
                    if (selectedRowIndex > -1) {
                        selectGridRow(selectedRowIndex);
                    }
                }
            }, renderOptions));
        }

        function refreshGrid() {
            //刷新数据
            $("#" + gridDomId).data('kendoExtGrid').dataSource.read();
            $("#" + gridDomId).data('kendoExtGrid').refresh();
        }
        return {
            Init: init
            , RunderGrid: runderGrid
            , RefreshGrid: refreshGrid
        };
    };
    return kendoGridModel;
});