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
    var schedulePurpose = 1;
    //var gt = require('app/components/assetPoolList/js/assetPoolTool');



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
                            TrustId = executeParamEx.SQLParams[0].Value;
                            TrustCode = executeParamEx.TrustCode;
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
                    //获取grid对象
                    //$(".k-grid-content").height($("#grid").height())
                    var gridbtn = $("#grid").find(".btn");
                    var w = $("body", window.parent.document).width();
                    var h = $("body", window.parent.document).height()
                    gridbtn.each(function (i, v) {
                        if ($(v).attr('id') == 'btnResults') {
                            $(this).click(function () {
                                ScheduleDateId = $($(this).parent().siblings().get(1)).html() || $($(this).parent().siblings()).html();
                                var GlobalVariable = require('globalVariable');
                                var GSAdmin = require('gsAdminPages');
                                GSAdmin.topOpen(
                                       '现金流一览',
                                       GlobalVariable.TrustManagementServiceHostURL + 'productManage/TrustManagement/TrustFollowUp/AssetPayMentSchedule/AssetPaymentSchedule.html?trustId={0}&ScheduleDateId={1}'.format(TrustId, ScheduleDateId),
                                       '关闭',
                                       function () {
                                           //location.reload(true);
                                       },
                                       w * 0.95 + 'px',
                                       h * 0.95 + 'px', "", true, "", false)
                            })
                        } else if ($(v).attr('id') == 'openImportTrustAsset') {
                            $(this).click(function () {
                                ScheduleDateId = $($(this).parent().siblings().get(1)).html() || $($(this).parent().siblings()).html();
                                //再次打开拆分界面
                                var page = location.protocol + '//' + location.host + '/GoldenStandABS/www/components/CashflowSplit/CashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}&schedulePurpose={3}'.format(TrustId, TrustCode, ScheduleDateId.replace(/-/g, ''), schedulePurpose)
                                openNewIframe(page, TrustId + '_cashflowsplit', '现金拆分: ' + TrustId, parent.parent.viewModel);
                                //    var GSAdmin = require('gsAdminPages');
                                //    GSAdmin.topOpen(
                                //           '现金流拆分',
                                //           GlobalVariable.TrustManagementServiceHostURL + 'components/CashflowSplit/CashflowSplit.html?TrustId={0}&TrustCode={1}&ScheduleDateId={2}'.format(TrustId, TrustCode, ScheduleDateId),
                                //           '关闭',
                                //           function () {
                                //               location.reload(true);
                                //           },
                                //           w * 0.95 + 'px',
                                //           h *0.95+ 'px', "", true, "", false)
                            })
                        }
                    })
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

        getStringDate = function (strDate) {
            //var str = '/Date(1408464000000)/';
            if (!strDate) {
                return '';
            }
            var str = strDate.replace(new RegExp('\/', 'gm'), '');
            return eval('new ' + str);
        }

        function openNewIframe(page, trustId, tabName, viewModel) {
            var pass = true;
            viewModel.tabs().forEach(function (v, i) {
                if (v.id == trustId) {
                    pass = false;
                    viewModel.changeShowId(v);
                    return false;
                }
            })
            if (pass) {
                //parent.viewModel.showId(trustId);
                var newTab = {
                    id: trustId,
                    url: page,
                    name: tabName,
                    disabledClose: false
                };
                viewModel.tabs.push(newTab);
                viewModel.changeShowId(newTab);
                //$('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
                //$('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
            };
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