define(['jquery', 'globalVariable', 'common', 'kendo.all.min', 'callApi'], function ($, gv, common, kendo, CallApi) {

    return {
        getFilterSql: function (field, operator, value) {

            var result = field;

            switch (operator) {
                case "eq":
                    if (value.constructor == Number) {
                        result += " = " + value;
                    }
                    else if (value.constructor == Date) {
                        result += " = '" + value.dateFormat("yyyy-MM-dd") + "'";
                    } else {
                        result += " = N'" + value + "'";
                    }
                    break;

                case "neq":
                    if (value.constructor == Number) {
                        result += " != " + value;
                    }
                    else if (value.constructor == Date) {
                        result += " = '" + value.dateFormat("yyyy-MM-dd") + "'";
                    } else {
                        result += " != N'" + value + "'";
                    }
                    break;

                case "startswith":
                    result += " like N'" + value + "%'";
                    break;

                case "contains":
                    result += " like N'%" + value + "%'";
                    break;

                case "doesnotcontain":
                    result += " not like N'%" + value + "%'";
                    break;

                case "endswith":
                    result += " like N'%" + value + "'";
                    break;

                case "isnull":
                    result += " is null";
                    break;

                case "isnotnull":
                    result += " is not null";
                    break;

                case "isempty":
                    result += " = ''";
                    break;

                case "isnotempty":
                    result += " != ''";
                    break;

                case "gte":
                    if (value.constructor == Date) {
                        result += " >= '" + value.dateFormat("yyyy-MM-dd") + "'";
                    } else {
                        result += " >= " + value;
                    }
                    break;

                case "gt":
                    if (value.constructor == Date) {
                        result += " > '" + value.dateFormat("yyyy-MM-dd") + "'";
                    } else {
                        result += " > " + value;
                    }
                    break;

                case "lte":
                    if (value.constructor == Date) {
                        result += " <= '" + value.dateFormat("yyyy-MM-dd") + "'";
                    } else {
                        result += " <= " + value;
                    }
                    break;

                case "lt":
                    if (value.constructor == Date) {
                        result += " < '" + value.dateFormat("yyyy-MM-dd") + "'";
                    } else {
                        result += " < " + value;
                    }
                    break;

                default:
                    result = '';
                    break;
            }

            return result;
        }

        , listWhereString: ''

        , filterBuilder: function (filterObj) {
            var self = this;

            var logic = filterObj.logic;
            var filters = filterObj.filters;

            var conditions = [];
            $.each(filters, function (i, f) {
                conditions.push(self.getFilterSql(f.field, f.operator, f.value));
            });
            return '(' + conditions.join(' ' + logic + ' ') + ')';
        }

        , KendoGrid: function (o) {
            var self = this;
            winHeight = $(window.parent.document).height();

            var cfgOptions = {
                dataSource: self.KendoDataSource(o),
                height: (typeof (o.height) == "undefined" || o.height == null) ? (winHeight - 130) : o.height,
                //width: winWidth,
                filterable: (typeof (o.filterable) == "undefined" || o.filterable == null) ? true : o.filterable,
                sortable: {
                    mode: "single",
                    allowUnsort: true
                },
                resizable: true,
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 5,
                    page: 1,
                    pageSize: 30,
                    pageSizes: o.pageSizes ? o.pageSizes : [30, 50, 100, 200]
                },
                columns: o.columns,
                autoFitColumn: o.autoFitColumn ? o.autoFitColumn : 4
            };

            if (o.custEvents) {
                for (var k in o.custEvents) {
                    cfgOptions[k] = o.custEvents[k]
                }
            }
            if (cfgOptions.autoFitColumn) {
                var fnDataBound = cfgOptions.dataBound;

                cfgOptions.dataBound = function (e) {
                    if (typeof fnDataBound === 'function') {
                        fnDataBound(e);
                    }

                    var grid = $(o.domId).data("kendoGrid");
                    if (typeof cfgOptions.autoFitColumn == 'number') {
                        for (var i = 0, columnLen = grid.columns.length, fitLen = cfgOptions.autoFitColumn; i < fitLen && i < columnLen ; i++) {
                            grid.autoFitColumn(i);
                        }
                    }
                    if (typeof cfgOptions.autoFitColumn == 'object') {
                        for (var i = 0, len = cfgOptions.autoFitColumn.length; i < len; i++) {
                            grid.autoFitColumn(cfgOptions.autoFitColumn[i]);
                        }
                    }
                }
            }
            if (o.noRecords) {
                cfgOptions.noRecords = o.noRecords;
            }

            return $(o.domId).empty().kendoGrid(cfgOptions);
        }

        , KendoDataSource: function (o) {
            var self = this;

            var dataSourceOptions = {
                transport: {
                    read: {
                        url: gv.CommonServicesUrl + 'ExecuteDataTable',
                        contentType: "application/json",
                        type: "POST",
                        dataType: "jsonp"
                    },
                    update: {
                        url: gv.CommonServicesUrl + 'ExecuteDataTable',
                        contentType: "application/json",
                        type: "POST",
                        dataType: "jsonp"
                    },
                    destroy: {
                        url: gv.CommonServicesUrl + 'ExecuteDataTable',
                        contentType: "application/json",
                        type: "POST",
                        dataType: "jsonp"
                    },
                    create: {
                        url: gv.CommonServicesUrl + 'ExecuteDataTable',
                        contentType: "application/json",
                        type: "POST",
                        dataType: "jsonp"
                    },
                    parameterMap: function (options, operation) {
                        var svcArgs = '';

                        if (operation == "read") {
                            var orderby = o.orderBy || '';
                            if (options.sort && options.sort.length > 0) {
                                orderby = options.sort[0].field + " " + options.sort[0].dir;
                            };
                            //orderby = encodeURIComponent(orderby);

                            var whereString = o.fnCustomizeFilter() || '';
                            if (options.filter && options.filter.filters.length > 0) {
                                var filters = options.filter.filters;

                                var conditions = [];
                                $.each(filters, function (i, f) {
                                    var filterSql;
                                    if (f.filters && f.logic) {
                                        filterSql = self.filterBuilder(f)
                                    } else {
                                        filterSql = self.getFilterSql(f.field, f.operator, f.value);
                                    }
                                    conditions.push(filterSql);
                                });
                                conditions = conditions.join(' and ');

                                //whereString = (whereString) ? whereString + ' and (' + conditions + ')' : conditions;
                                whereString += ' and ' + conditions;
                            };
                            //filter = encodeURIComponent(filter);
                            self.listWhereString = whereString;

                            var start = (options.page - 1) * options.pageSize + 1;
                            var end = options.page * options.pageSize;

                            var callApi = new CallApi(o.dataSource.connectionName, o.dataSource.spName);
                            callApi.AddParam({ Name: 'tableOrView', Value: o.dataSource.tableName, DBType: 'string' });
                            callApi.AddParam({ Name: 'start', Value: start, DBType: 'int' });
                            callApi.AddParam({ Name: 'end', Value: end, DBType: 'int' });
                            callApi.AddParam({ Name: 'orderby', Value: orderby, DBType: 'string' });
                            callApi.AddParam({ Name: 'where', Value: whereString, DBType: 'string' });
                            callApi.AddParam({ Name: 'total', Value: '0', DBType: 'int', IsOutput: true, Size: 100 });
                            svcArgs = kendo.stringify(callApi.PostData());
                        } else if (operation == "create" || operation == "update" || operation == "destroy") {
                            if (o.fnBuildSvcArgs) {
                                svcArgs = o.fnBuildSvcArgs(options, operation);
                            }
                        }

                        return svcArgs;
                    }

                },
                requestEnd: function (e) {
                    var result = JSON.parse(e.response);
                    if (result.resultCode == "1") {
                        window.top.location.href = gv.CreditFactoryHostURL + '500.html';
                    }
                    else if (result.resultCode == "2") {
                        // alert("登录失效，点击确定后会跳转到登录页面。");
                        window.top.location.href = gv.CreditFactoryHostURL + 'login.html?appDomain=' + common.appDomain();
                    }

                    if (e.type == "create" && e.response) {
                        this.read();
                    }
                },
                serverPaging: true,
                serverFiltering: true,
                serverSorting: true,
                pageSize: o.pageSize ? o.pageSize : 30,
                schema: {
                    model: {},
                    data: function (response) {
                        return $.parseJSON(response).resultData.data;
                    },
                    total: function (response) {
                        if (o.custEvents && o.custEvents.filter) {
                            o.custEvents.filter();
                        }
                        return $.parseJSON(response).resultData.total;
                    }
                }
            };
            if (o.fieldsSchema) {
                dataSourceOptions.schema.model['fields'] = o.fieldsSchema;
            }

            if (o.model) {
                dataSourceOptions.schema['model'] = o.model;
            }

            return new kendo.data.DataSource(dataSourceOptions);
        }

        , kendoHierachyDetail: function (e, o) {
            var kds = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: gv.CommonServicesUrl + 'ExecuteDataTable',
                        contentType: "application/json",
                        type: "POST",
                        dataType: "jsonp"
                    },
                    parameterMap: function (options, operation) {
                        if (operation != "read") { return; }

                        var orderby = o.orderBy || '';
                        if (options.sort && options.sort.length > 0) {
                            orderby = options.sort[0].field + " " + options.sort[0].dir;
                        };

                        var whereString = ' and ' + o.detailFilter + ' ';
                        if (options.filter && options.filter.filters.length > 0) {
                            var filters = options.filter.filters;

                            var conditions = [];
                            $.each(filters, function (i, f) {
                                var filterSql;
                                if (f.filters && f.logic) {
                                    filterSql = self.filterBuilder(f)
                                } else {
                                    filterSql = self.getFilterSql(f.field, f.operator, f.value);
                                }
                                conditions.push(filterSql);
                            });
                            conditions = conditions.join(' and ');

                            whereString += ' and (' + conditions + ')';
                        };

                        var start = (options.page - 1) * options.pageSize + 1;
                        var end = options.page * options.pageSize;

                        var callApi = new CallApi(o.dataSource.connectionName, o.dataSource.spName);
                        callApi.AddParam({ Name: 'tableOrView', Value: o.dataSource.tableName, DBType: 'string' });
                        callApi.AddParam({ Name: 'start', Value: start, DBType: 'int' });
                        callApi.AddParam({ Name: 'end', Value: end, DBType: 'int' });
                        callApi.AddParam({ Name: 'orderby', Value: orderby, DBType: 'string' });
                        callApi.AddParam({ Name: 'where', Value: whereString, DBType: 'string' });
                        callApi.AddParam({ Name: 'total', Value: '0', DBType: 'int', IsOutput: true, Size: 100 });

                        return kendo.stringify(callApi.PostData());
                    }
                },
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true,
                pageSize: 8,
                schema: {
                    model: { fields: o.fieldsSchema },
                    data: function (response) {
                        return $.parseJSON(response).resultData.data;
                    },
                    total: function (response) {
                        return $.parseJSON(response).resultData.total;
                    }
                }
            });

            var cfgOptions = {
                dataSource: kds,
                scrollable: true,
                sortable: true,
                pageable: true,
                filterable: true,
                columns: o.columns
            };

            if (o.custEvents) {
                for (var k in o.custEvents) {
                    cfgOptions[k] = o.custEvents[k]
                }
            }

            $("<div/>").appendTo(e.detailCell).kendoGrid(cfgOptions);
        }

        , kendoComboBox: function (o) {
            var obj = new Object();
            obj.ItemAliasValue = "所有";
            obj.ItemCode = 'all';
            o.Data.unshift(obj);
            $(o.DomId).empty().kendoComboBox({
                dataTextField: "ItemAliasValue",
                dataValueField: "ItemCode",
                dataSource: o.Data,
                select: onSelect,
                value: o.Value,
                filter: "contains",
                suggest: true,
                index: 0,
            });

            function onSelect(e) {
                if (o.onSelect) {
                    o.onSelect(e);
                }
            }

        }

        , DialogPage: function (dom, title, url, width, height, fnClosed, isMax) {

            var $dialog = $(dom).data("kendoWindow");
            if (!$dialog) {
                var windowOptions = {
                    width: width,
                    height: height,
                    title: title,
                    modal: true,
                    content: url,
                    iframe: true,
                    visible: false,
                    actions: ["Maximize", "Close"],
                    close: fnClosed
                }
                $(dom).kendoWindow(windowOptions);
                $dialog = $(dom).data("kendoWindow");
            }
            else {
                $dialog.title(title);
                $dialog.setOptions({
                    width: width,
                    height: height
                });
                $dialog.refresh({
                    url: url,
                    iframe: true,
                    close: fnClosed
                });
            }

            //var $windowTitle = $('.k-window>.k-window-titlebar>.k-window-title');
            //var $restoreIcon = $('.k-window>.k-window-titlebar>.k-window-actions>a[aria-label="window-restore"]');
            //if ($windowTitle) { $windowTitle.text(title); }
            //if ($restoreIcon.length > 1) { $restoreIcon.eq(0).siblings().remove(); }



            if (isMax) { $dialog.maximize() }
            $dialog.center().open();

        }

        , DialogDiv: function (dom, title, width, height, fnClosed, isMax) {
            var windowOptions = {
                width: width,
                height: height,
                title: title,
                modal: true,
                actions: ["Maximize", "Close"],
                close: fnClosed
            }

            //var $restoreIcon = $('.k-window>.k-window-titlebar>.k-window-actions>a[aria-label="window-restore"]');
            //if ($restoreIcon.length > 1) { $restoreIcon.eq(0).siblings().remove(); }

            $(dom).kendoWindow(windowOptions).data("kendoWindow").center().open();
            if (isMax) { $(dom).data("kendoWindow").maximize() }
        }
    };

})