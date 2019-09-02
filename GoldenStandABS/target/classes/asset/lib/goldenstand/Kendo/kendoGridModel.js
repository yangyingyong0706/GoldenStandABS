define(function (require) {
    //var kendo = require('Kendo');
    //var kendoculturecn = require('kendoculturecn');
    //kendoculturecn.init(kendo);
    //var kendomessagescn = require('kendomessagescn');

    var extGrid = require('gs/Kendo/kendoExtension');
    var gv = require('gs/globalVariable');
    var TrustId;
    var TrustCode;
    var ScheduleDateId;
    var params
    //var gt = require('app/components/assetPoolList/js/assetPoolTool');



    var kendoGridModel = function (height) {
        var winHeight = height, winWidth = 500, girdDomId, renderOptions, dataSourceOptions;

        function init(options) {
            gridDomId = options.Id ? options.Id : 'grid';
            renderOptions = options.renderOptions;
            dataSourceOptions = options.dataSourceOptions;
        }

        function dataSource() {
            var dataSource = new kendo.data.DataSource($.extend({
                transport: {
                    read: {
                        url: gv.DataProcessServiceUrl + 'DataReadKendoGridEx',
                        contentType: "application/xml;charset=utf-8",
                        type: "POST",
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
                                var logic = dataSource.filter().logic;
                                $.each(filters, function (i, f) {
                                    if (f.field == "IsInTrust") {
                                        f.value = f.value ? 1 : 0;
                                    }
                                })
                                filter += " and ( ";

                                $.each(filters, function (i, f) {
                                    if (i != (filters.length - 1)) {

                                        //f.value == '专项计划' ? f.value = 'Trust' : f.value == '资产池' ? f.value = 'Pool' : '';
                                        //console.log("f.field:" + f.field + "   f.value:" + f.value + "\n");
                                        filter += KendridFilterToSQL(f.field, f.operator, f.value) + ' ' + logic + ' ';
                                    }
                                    else {
                                        //f.value == '专项计划' ? f.value = 'Trust' : f.value == '资产池'? f.value = 'Pool': '';
                                        filter += KendridFilterToSQL(f.field, f.operator, f.value)
                                    }

                                });
                                filter += " ) ";

                                //filter = encodeURIComponent(filter);
                            };

                            //var parameter = $.extend({
                            //    appDomain: 'TrustManagement',
                            //    spName: 'usp_GetListWithPager',
                            //    tableName: 'TrustManagement.Trusts',
                            //    page: options.page,
                            //    pageSize: options.pageSize,
                            //    filter: filter,
                            //    orderby: orderby
                            //}, dataSourceOptions.otherOptions.parameter);


                            var start = (options.page - 1) * options.pageSize + 1;
                            var end = options.page * options.pageSize;
                            params = dataSourceOptions.params;
                            var executeParamEx = {};
                            if (dataSourceOptions.otherOptions.executeParam) {
                                if (typeof dataSourceOptions.otherOptions.executeParam == 'function')
                                    executeParamEx = dataSourceOptions.otherOptions.executeParam();
                                else
                                    executeParamEx = dataSourceOptions.otherOptions.executeParam
                            }
                            //console.log($.cookie('gs_UserName'));
                            var executeParam = {
                                SPName: executeParamEx.SPName, SQLParams: [
                                    { Name: 'start', Value: start, DBType: 'int' }
                                    , { Name: 'end', Value: end, DBType: 'int' }
                                    , { Name: 'orderby', Value: orderby ? orderby : 'PoolId', DBType: 'string' }
                                    , { Name: 'direction', Value: direction ? direction : null, DBType: 'string' }
                                    , { Name: 'where', Value: filter ? filter : null, DBType: 'string' }
                                ]
                            };


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

                            //params += '<root appDomain="{0}" resultType="DatagridDataSource">'.StringFormat(dataSourceOptions.otherOptions.appDomain);
                            params += '<root connConfig="' + dataSourceOptions.otherOptions.DBName + '" appDomain="' + dataSourceOptions.otherOptions.appDomain + '" resultType="DatagridDataSource">'
                            params += executeParams;
                            params += '</root>';

                            return params;//kendo.stringify(parameter);
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
            value == '专项计划' ? value = 'Trust' : value == '资产池' ? value = 'Pool' : '';
            switch (operator) {
                case "eq":
                    if (value.constructor == Number) {
                        return " " + field + " = " + value;
                    }
                    else if (value.constructor == Date) {
                        return " " + field + " = N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " " + field + " = N'" + value + "'";
                case "neq":
                    if (value.constructor == Number) {
                        return " " + field + " != " + value;
                    }
                    else if (value.constructor == Date) {
                        return " " + field + " = N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " " + field + " != N'" + value + "'";
                case "startswith":
                    return " " + field + " like N'" + value + "%'";
                case "contains":
                    return " " + field + " like N'%" + value + "%'";
                case "doesnotcontain":
                    return " " + field + " not like N'%" + value + "%'";
                case "endswith":
                    return " " + field + " like N'%" + value + "'";
                case "isnull":
                    return " " + field + " is null";
                case "isnotnull":
                    return " " + field + " is not null";
                case "isempty":
                    return " " + field + " = N''";
                case "isnotempty":
                    return " " + field + " != N''";
                case "gte":
                    if (value.constructor == Date) {
                        return " " + field + " >= N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " " + field + " >= " + value;
                case "gt":
                    if (value.constructor == Date) {
                        return " " + field + " > N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " " + field + " > " + value;
                case "lte":
                    if (value.constructor == Date) {
                        return " " + field + " <= N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " " + field + " <= " + value;
                case "lt":
                    if (value.constructor == Date) {
                        return " " + field + " < N'" + value.dateFormat("yyyy-MM-dd") + "'";
                    }
                    return " " + field + " < " + value;
            }
        }

        var selectedRowIndex = -1;
        var pageIndex = 0;

        function runderGrid() {




            var webStorage = require('gs/webStorage');
            var lang = {};
            lang.display = '显示{0}-{1}条，共{2}条';
            lang.empty = '没有数据';
            lang.page = '页';
            lang.itemsPerPage = '条';
            lang.first = '第一页';
            lang.previous = '前一页';
            lang.next = '下一页';
            lang.last = '最后一页';
            lang.refresh = '刷新';
            var userLanguage = webStorage.getItem('userLanguage');
            if (userLanguage && userLanguage.indexOf('en') > -1) {
                lang.display = 'Display {0}-{1}，Totle {2}';
                lang.empty = 'Empty';
                lang.page = 'Page';
                lang.itemsPerPage = ' ';
                lang.first = 'First';
                lang.previous = 'Previous';
                lang.next = 'Next';
                lang.last = 'Last';
                lang.refresh = 'Refresh';
            }




            //$("#" + gridDomId).html("");
            var grid = $("#" + gridDomId).kendoExtGrid($.extend({
                dataSource: dataSource(),
                height: winHeight,
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
                        display: lang.display,
                        empty: lang.empty,
                        page: lang.page,
                        of: "/ {0}",
                        itemsPerPage: lang.itemsPerPage,
                        first: lang.first,
                        previous: lang.previous,
                        next: lang.next,
                        last: lang.last,
                        refresh: lang.refresh
                    }
                },
                columns: [],
                dataBound: function () {
                    var $trs = $('table.k-selectable tbody tr');
                    $trs.hover(
                        function () {
                            var i = $(this).index() + 1;
                            $trs.filter(':nth-child(' + i + ')').addClass('k-state-hover');
                        },
                        function () {
                            var i = $(this).index() + 1;
                            $trs.filter(':nth-child(' + i + ')').removeClass('k-state-hover');
                        }
                    );
                    var rows = this.items();
                    var page = this.pager.page() - 1;
                    var pagesize = this.pager.pageSize();
                    params = this.dataSource.options.params
                    var total = this.options.dataSource.total();
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
                    if (params&&params.length != 0) {
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
                                if (k == $(v).parent().next().html()) {
                                    $(v).prop("checked", true);
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
                    $("#checkAll").is(":checked") ? $(".tips").show() : $(".tips").hide()
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
            //,GetOperate: getOperate
            //,MangeTrust: mangeTrust
            //,DeleteTrust: deleteTrust
        };
    };

    return kendoGridModel;
});
