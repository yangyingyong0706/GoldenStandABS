define(function (require) {
    var $ = require('jquery');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('date_input');
    require('jquery-ui');
    var common = require('common');
    var kendo = require('kendo.all.min');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages')

    var self = this;
    var userId, UserName;
    var winHeight = 500;
    var winWidth = 500;
    var RoleList = [];
    $(function () {
        winHeight = $(window.parent.document).height();
        winWidth = $(window.parent.document).width();
        userId = common.getQueryString("UserId");
        UserName = common.getQueryString("UserName");
        RoleOperate.getRolesByUserId(userId, function (data) {
            $.each(data, function (i, d) {
                if (!d.IsRoot) {//filter the sysadmin role
                    RoleList.push(d);
                }
            });
            MultiSelect(RoleList);
        });
        registerEvent();
        runderGrid();

    })
    function registerEvent() {
        //添加角色 
        $("#btnAddRoles").click(function () {
            var multiSelect = $("#Roles").data("kendoMultiSelect");
            var RoleIds = multiSelect.value();
            if (RoleIds.length > 0) {
                var xml = '';
                for (var i = 0; i < RoleIds.length; i++) {
                    xml += '<item><UserId>' + userId + '</UserId><RoleId>' + RoleIds[i] + '</RoleId></item>';
                }
                var exml = encodeURIComponent(xml);
                RoleOperate.saveUsersRoles(exml, function (r) {
                    if (!isNaN(r)) {
                        GSDialog.HintWindow("Add Successful!");
                        refreshSelect();
                        $("#grid").data('kendoGrid').dataSource.read();
                        $("#grid").data('kendoGrid').refresh();
                    } else {
                        GSDialog.HintWindow("Error：" + r);
                    }
                });
            }
            else {
                GSDialog.HintWindow("请选择角色");
            };
        });
    }
    //自动填充
    function MultiSelect(data) {
        $("#Roles").kendoMultiSelect({
            dataTextField: "RoleName",
            dataValueField: "RoleId",
            dataSource: data
        });
    }

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

                        var orderby = 'RoleName';
                        if (dataSource.sort() != null) {
                            if (dataSource.sort().length > 0) {
                                orderby = dataSource.sort()[0].field + " " + dataSource.sort()[0].dir;
                                orderby = encodeURIComponent(orderby);
                            }
                        };

                        var filter = " and UserId='" + userId + "'";
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
                            tableName: RoleOperate.schema + '.[ViewUserRoles]',
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
                        RoleName: { type: "string" },
                        Description: { type: "string" },
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
            height: winHeight - 320,
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
                    field: "RoleName",
                    title: '角色名称',
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
                    field: "Description",
                    title: '角色描述',
                    width: "230px",
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
                    template: '#=self.getOperate(UserId,RoleId,RoleIsRoot)#',
                    width: "60px",
                    // locked: true,
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

    this.getOperate=function(UserId, RoleId, RoleIsRoot) {
        var html = '';
        var flag;
        if (UserName == 'goldenstand' && RoleIsRoot==1) { flag = "none"; }
        html = '<button class="btn btn-link" style="display:' + flag + ';" onclick="self.deleteUsersRoles(\'' + UserId + '\',\'' + RoleId + '\')"><i class="fa fa-trash-o" title="删除"></i></button>';
        //html = '<button class="delet_normal_small_button public_font_style"" onclick="self.deleteUsersRoles(\'' + UserId + '\',\'' + RoleId + '\')">删除</button>';
        return html;
    }
    this.deleteUsersRoles = function (UserId, RoleId) {
        GSDialog.HintWindowTF("确定要删除吗？", function () {
            RoleOperate.deleteUsersRoles(UserId, RoleId, function (result) {
                if (!isNaN(result)) {
                    common.alertMsg("Delete Successful!");
                    //刷新数据
                    $("#grid").data('kendoGrid').dataSource.read();
                    $("#grid").data('kendoGrid').refresh();
                    refreshSelect();
                }
                else {
                    common.alertMsg("Error：" + result);
                }
            })
        })
    }
    function selectGridRow(rowIndex) {
        var grid = $("#grid").data("kendoGrid");
        grid.clearSelection();
        row = grid.tbody.find(">tr:not(.k-grouping-row)").eq(rowIndex);
        grid.select(row);
    }
    function refreshSelect() {
        RoleList.length = 0;
        RoleOperate.getRolesByUserId(userId, function (data) {
            $.each(data, function (i, d) {
                RoleList.push(d);
            });
            //刷新数据
            $("#Roles").data('kendoMultiSelect').dataSource.read();
            $("#Roles").data('kendoMultiSelect').refresh();
        });

    }
});

