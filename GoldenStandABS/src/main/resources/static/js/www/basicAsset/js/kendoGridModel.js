/* 
 * 
 * ExtGrid 
 * 
 */

define(['jquery', 'kendo.all.min'], function ($, kendo) {

    var ExtGrid = kendo.ui.Grid.extend({

        init: function (element, options) {
            var that = this;

            that._orderNumber(options);

            kendo.ui.Grid.fn.init.call(that, element, options);
            that._RegisterRowNumber(options);
        },
        _orderNumber: function (options) {
            if (options.rowNumber) {
                var that = this;
                var rowTemplate = '#= count #';
                var renderRowCount = function () {

                    that.options._count += 1;
                    return kendo.render(kendo.template(rowTemplate), [{ count: that.options._count }]);
                }

                if (options.rowNumber) {
                    if (options.columns) {
                        //1. 添加行号列  
                        options.columns.splice(0, 0, { attributes: { 'class': 'tight-cell rowNoPadding' }, editor: null, editable: false, title: '', template: renderRowCount, width: "50px" });
                    }
                }
            }
        },
        _RegisterRowNumber: function () {
            var that = this;
            if (that.options.rowNumber) {
                var that = this;
                that.bind('dataBinding', function () {
                    that.options._count = (that.dataSource.page() - 1) * that.dataSource.pageSize();
                    that.options._count = isNaN(that.options._count) ? 0 : that.options._count;
                });
            }
        },
        options: {
            name: 'ExtGrid',
            _count: 0,
            rowNumber: false
        }
    });

    kendo.ui.plugin(ExtGrid);

    var kendoGridModel = function (height) {
        var winHeight = height, winWidth = 500, girdDomId, renderOptions, dataSourceOptions;

        function init(options) {
            gridDomId = 'grid';
            renderOptions = options.renderOptions;
            dataSourceOptions = options.dataSourceOptions;
        }

        function dataSource() {
            var dataSource = new kendo.data.DataSource($.extend({
                transport: {

                    read: {
                        url: GlobalVariable.DataProcessServiceUrl + 'DataReadKendoGridEx',
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
                                $.each(filters, function (i, f) {
                                    filter += KendridFilterToSQL(f.field, f.operator, f.value);
                                });

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
                                    , { Name: 'where', Value: filter ? filter : 'where ParentPoolId=0', DBType: 'string' }
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
                            params += '<root connConfig="DAL_SEC_PoolConfig" appDomain="' + dataSourceOptions.otherOptions.appDomain + '" resultType="DatagridDataSource">'
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

        function runderGrid() {
            $("#" + gridDomId).html("");
            var grid = $("#" + gridDomId).kendoExtGrid($.extend({
                dataSource: dataSource(),
                height: winHeight,
                selectable: "multiple",
                filterable: true,
                sortable: true,

                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5,
                    page: 1,
                    pageSize: 20,
                    pageSizes: [5, 20, 50, 100, 500]
                },
                columns: [],
                dataBound: function () {
                    var rows = this.items();
                    var page = this.pager.page() - 1;
                    var pagesize = this.pager.pageSize();
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





