define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var kendo = require('kendo.all.min');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    var common = require('common');
    var GSDialog = require("gsAdminPages")
    var self = this;
    var winHeight = 500;
    var winWidth = 500;

    $(function () {
        winHeight = $(window.parent.document).height();
        winWidth = $(window.parent.document).width();
        runderGrid();
        kendo.culture("zh-CN");
    });
    function dataSource() {
        var dataSource = new kendo.data.DataSource({
            transport: {

                read: {
                    url: RoleOperate.roleService + 'DataReadKendoGrid',
                    contentType: "application/json",
                    type: "POST",
                    dataType: "jsonp"
                },

                parameterMap: function (options, operation) {
                    if (operation == "read") {
                        var orderby = 'ApplicationName';
                        if (dataSource.sort() != null) {
                            if (dataSource.sort().length > 0) {
                                orderby = dataSource.sort()[0].field + " " + dataSource.sort()[0].dir;
                                orderby = encodeURIComponent(orderby);
                            }
                        };

                        var filter = '';
                        if (dataSource.filter() != null) {
                            var filters = dataSource.filter().filters;
                            $.each(filters, function (i, f) {
                                filter += KendridFilterToSQL(f.field, f.operator, f.value);
                            });
                            filter = encodeURIComponent(filter);
                        };

                        var parameter = {
                            dbName: RoleOperate.dbName,
                            schema: RoleOperate.schema,
                            spName: 'usp_GetDataWithPager',
                            tableName: RoleOperate.schema + '.[ViewPaths]',
                            page: options.page,
                            pageSize: options.pageSize,
                            filter: filter,
                            orderby: orderby
                        };
                        return kendo.stringify(parameter);
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
                        ApplicationName: { type: "string" },
                        ApplicationDescription: { type: "string" },
                        PathDescription: { type: "string" },
                        Path: { type: "string" },
                    }
                },
                data: function (response) {
                    return jQuery.parseJSON(response.DataReadKendoGridResult).data;
                },
                total: function (response) {
                    return jQuery.parseJSON(response.DataReadKendoGridResult).total;
                }

            },
        });


        return dataSource;
    }

    function KendridFilterToSQL(field, operator, value) {
        var hasZH = false;
        if (/[\u4E00-\u9FA5]/g.test(value)) {
            hasZH = true;
        }

        switch (operator) {
            case "eq":
                if (value.constructor == Number) {
                    return " and " + field + " = " + value;
                }
                else if (value.constructor == Date) {
                    return " and " + field + " = '" + value.dateFormat("yyyy-MM-dd") + "'";
                }

                if (hasZH) {
                    return " and " + field + " = N'" + value + "'";
                }
                return " and " + field + " = '" + value + "'";
            case "neq ":
                if (value.constructor == Number) {
                    return " and " + field + " != " + value;
                }
                else if (value.constructor == Date) {
                    return " and " + field + " = '" + value.dateFormat("yyyy-MM-dd") + "'";
                }
                if (hasZH) {
                    return " and " + field + " != N'" + value + "'";
                }
                return " and " + field + " != '" + value + "'";
            case "startswith":
                if (hasZH) {
                    return " and " + field + " like N'" + value + "%'";
                }
                return " and " + field + " like '" + value + "%'";
            case "contains":
                if (hasZH) {
                    return " and " + field + " like N'%" + value + "%'";
                }
                return " and " + field + " like '%" + value + "%'";
            case "doesnotcontain":
                if (hasZH) {
                    return " and " + field + " not like N'%" + value + "%'";
                }
                return " and " + field + " not like '%" + value + "%'";
            case "endswith":
                if (hasZH) {
                    return " and " + field + " like N'%" + value + "'";
                }
                return " and " + field + " like '%" + value + "'";
            case "isnull":
                return " and " + field + " is null";
            case "isnotnull":
                return " and " + field + " is not null";
            case "isempty":
                return " and " + field + " = ''";
            case "isnotempty":
                return " and " + field + " != ''";
            case "gte":
                if (value.constructor == Date) {
                    return " and " + field + " >= '" + value.dateFormat("yyyy-MM-dd") + "'";
                }
                return " and " + field + " >= " + value;
            case "gt":
                if (value.constructor == Date) {
                    return " and " + field + " > '" + value.dateFormat("yyyy-MM-dd") + "'";
                }
                return " and " + field + " > " + value;
            case "lte":
                if (value.constructor == Date) {
                    return " and " + field + " <= '" + value.dateFormat("yyyy-MM-dd") + "'";
                }
                return " and " + field + " <= " + value;
            case "lt":
                if (value.constructor == Date) {
                    return " and " + field + " < '" + value.dateFormat("yyyy-MM-dd") + "'";
                }
                return " and " + field + " < " + value;
        }
    }

    var selectedRowIndex = -1;
    var pageIndex = 0;
    function runderGrid() {
        $("#grid").html("");
        var grid = $("#grid").kendoGrid({
            dataSource: dataSource(),
            height: winHeight - 30,
            selectable: "multiple",
            filterable: true,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5,
                page: 1,
                pageSize: 20,
                pageSizes: [20, 50, 100, 500],
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
            columns: [
                {
                    field: "ApplicationName",
                    title: '应用名称',
                    width: "150px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    }
                },
                {
                    field: "ApplicationDescription",
                    title: '应用描述',
                    width: "150px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    }
                },
                {
                    field: "PathName",
                    title: '子应用名称',
                    width: "150px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    }
                },
                {
                    field: "PathDescription",
                    title: '子应用描述',
                    width: "150px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    }
                },
                {
                    title: '路径链接',
                    template: '#=self.getURL(Path)#',
                    width: "260px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    }
                },
                {
                    title: '操作',
                    template: '#=self.getOperate(PathId,ApplicationId)#',
                    width: "350px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    }
                }
            ],
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
        });

    }

    this.getURL = function (path) {
        return '<a class="row-number" target="_top" href="' + path + '"> ' + path + '</a>';
    }
    this.getOperate = function (PathId, ApplicationId) {
        var html = "";
        //var modulesUrl = 'pathModules.html?pathId=' + pathId;
        //html += '<button class="row-number  btn btn-primary"  onclick="pathModules(this,\'' + modulesUrl + '\');">模块 </button>';
        //html += '&nbsp;&nbsp;&nbsp;';
        //if (!IsRoot) {
            var editPageUrl = 'ChildrenAppDetail.html?flag=1&appId=' + PathId;
            html += '<button class="row-number btn btn-link"  onclick="self.rowEdit(this,\'' + editPageUrl + '\');"><i class="icon icon-edit" title="编辑"></i></button>';
                html += '&nbsp;&nbsp;';
            //}
        var appPathsUrl = 'ChildrenAppPath.html?appId=' + PathId;//需要修改
        html += '<button class="row-number  btn btn-link" onclick="self.appPathsPage(this,\'' + appPathsUrl + '\');"><i class="icon icon-user-add" title="子菜单"></i></button>';
            html += '&nbsp;&nbsp;';
            var appRolesUrl = 'ChildrenAppRoles.html?appId=' + PathId;//需要修改
            html += '<button class="row-number btn btn-link" onclick="self.appRoles(this,\'' + appRolesUrl + '\');"><i class="icon icon-user-circle-o" title="角色"></i></button>';
            //if (!IsRoot) {
                html += '&nbsp;&nbsp;';
                html += '<button class=" btn btn-link" onclick="self.deleteApp(\'' + PathId + '\')"><i class="fa fa-trash-o fa-fw" title="删除"></i></button>';
            //}
        //var pathRolesUrl = 'pathRoles.html?pathId=' + pathId + '&flag=1';
        //html += '<button class="row-number  btn btn-primary"  onclick="self.pathRoles(this,\'' + pathRolesUrl + '\');"> 角色</button>';
        return html;
    }
    this.appPathsPage = function (obj, appPathsUrl) {
        //alert('暂无链接页面！');
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(appPathsUrl, '添加子菜单', winWidth * 3 / 5, winHeight * 4 / 5, function () { },null,false);
    }
    this.rowEdit = function (obj, editPageUrl) {
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(editPageUrl, '编辑', 820, 346, function () {
            //var haveDoneAction = window.frames["dialogIframe"].HaveDoneAction;
            //if (haveDoneAction) {
            //    //刷新数据
            //    $("#grid").data('kendoGrid').dataSource.read();
            //    $("#grid").data('kendoGrid').refresh();
            //}
            $("#grid").data('kendoGrid').dataSource.read();
            $("#grid").data('kendoGrid').refresh();
        },"",false);
    }
    this.appRoles = function (obj, appRoleUrl) {
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(appRoleUrl, '角色管理', winWidth * 3 / 5, winHeight * 4 / 5, function () { },null,false);
    }
    this.pathRoles = function (obj, pathRolesUrl) {
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(pathRolesUrl, '角色', winWidth * 3 / 5, winHeight * 4 / 5, function () { });
    }
    this.deleteApp = function (pathId) {
        GSDialog.HintWindowTF("确定删除此条记录？", function () {
            RoleOperate.deleteChildrenAppById(pathId, function (response) {
                //刷新数据
                $("#grid").data('kendoGrid').dataSource.read();
                $("#grid").data('kendoGrid').refresh();
            })
        })
    }
    function pathModules(obj, modulesUrl) {
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(modulesUrl, '页面模块', winWidth * 3 / 5, winHeight * 4 / 5, function () { });
    }
    this.refreshGrid = function () {
        closeWindow();
        $("#grid").data('kendoGrid').dataSource.read();
        $("#grid").data('kendoGrid').refresh();
    }
    function closeWindow() {
        $('#modal-close').trigger('click');
    }
    function selectGridRow(rowIndex) {
        var grid = $("#grid").data("kendoGrid");
        grid.clearSelection();
        row = grid.tbody.find(">tr:not(.k-grouping-row)").eq(rowIndex);
        grid.select(row);
    }

});
