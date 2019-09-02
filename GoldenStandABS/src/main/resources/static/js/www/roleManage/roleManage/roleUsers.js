define(function (require) {
   // <script src="../Scripts/wcfProxy.js"></script>
   //<script src="../Scripts/jquery-1.7.2.min.js"></script>
   //<script src="../Scripts/jquery-ui.min.js"></script>
   //<script src="../Scripts/common.js"></script>
   //<script src="../Scripts/anyDialog.js"></script>
   //<script src="../Scripts/Kendo/js/kendo.all.min.js"></script>

   //<script src="../Scripts/Kendo/js/kendo.culture.zh-CN.js"></script>
   //<script src="../Scripts/Kendo/js/kendo.messages.zh-CN.js"></script>
   //<script src='../Scripts/roleOperate.js'></script>
   //<script src="roleList.js"></script>
    //<script src="roleUsers.js"></script>

    var $ = require('jquery');
    require('jquery-ui');
    var kendo = require('kendo.all.min');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    var common = require('common');
    var GSDialog = require("gsAdminPages")
    var self = this;
    var roleId;
    var winHeight = 500;
    var winWidth = 500;
    var UserList = [];
    $(function () {
        winHeight = $(window.parent.document).height();
        winWidth = $(window.parent.document).width();
        roleId = common.getQueryString("roleId");
        RoleOperate.getUsersByRoleId(roleId, function (data) {
            $.each(data, function (i, d) {
                UserList.push(d);
            });
            MultiSelect(UserList);
        });
        runderGrid();
        registerEvent();

    })

    function MultiSelect(data) {
        $("#Users").kendoMultiSelect({
            dataTextField: "UserName",
            dataValueField: "UserId",
            dataSource: data
        });

    }


    function registerEvent() {
        //添加用户
        var multiSelect = $("#Users").data("kendoMultiSelect");
        $("#btnAddUsers").click(function () {
            var UserIds = multiSelect.value();
            if (UserIds.length > 0) {
                var xml = '';
                for (var i = 0; i < UserIds.length; i++) {
                    xml += '<item><RoleId>' + roleId + '</RoleId><UserId>' + UserIds[i] + '</UserId></item>';
                }
                var exml = encodeURIComponent(xml);
                RoleOperate.saveUsersRoles(exml, function (r) {
                    if (!isNaN(r)) {
                        GSDialog.HintWindow("添加成功，可继续添加!");
                        refreshSelect();
                        //刷新数据
                        $("#grid").data('kendoGrid').dataSource.read();
                        $("#grid").data('kendoGrid').refresh();
                    } else {
                        GSDialog.HintWindow("Error：" + r);
                    }
                });
            }
            else {
                GSDialog.HintWindow("请选择用户");
            };

        });
    }

    //function addUsers() {

    //}


    function dataSource() {
        var dataSource = new kendo.data.DataSource({
            transport: {

                read: {
                    url: RoleOperate.roleService + 'DataReadKendoGrid',
                    contentType: "application/json",
                    type: "POST",
                    dataType: "jsonp",

                },

                parameterMap: function (options, operation) {
                    if (operation == "read") {

                        var orderby = 'UserId';
                        if (dataSource.sort() != null) {
                            if (dataSource.sort().length > 0) {
                                orderby = dataSource.sort()[0].field + " " + dataSource.sort()[0].dir;
                                orderby = encodeURIComponent(orderby);
                            }
                        };

                        var filter = " and RoleId='" + roleId + "'";
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
                        UserName: { type: "string" },
                        IsAnonymous: { type: "string" },
                        LastActiveDate: { type: "date" },
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
                    field: "UserName",
                    title: "用户名称",
                    width: "200px",
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
                    field: "IsAnonymous",
                    title: "是否匿名",
                    width: "200px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    },
                    template: "# if (IsAnonymous == 'true' ) { # 是 # } else { # 否 # } #"
                },

                {
                    field: "LastActiveDate",
                    title: "最新活跃日期",
                    format: "{0:yyyy-MM-dd}",
                    width: "200px",
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

                       title: "操作",
                       template: '#=self.getOperate(UserId,RoleId,UserIsRoot)#',
                       width: "150px",
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


    this.getOperate = function (UserId, RoleId, UserIsRoot) {
        var html = '';
        if (UserIsRoot == 0) {
            html = '<button class="btn btn-link" onclick="self.deleteUsersRoles(\'' + UserId + '\',\'' + RoleId + '\')"><i class="fa fa-trash-o" title="删除"></i></button>';
            return html;
        }

        else if (UserIsRoot == 1) {
            html = '<button class="btn btn-link" style=" display:none;" onclick="self.deleteUsersRoles(\'' + UserId + '\',\'' + RoleId + '\')"><i class="fa fa-trash-o" title="删除"></i></button>';
            return html;
        }
    }


    this.deleteUsersRoles = function (UserId, RoleId) {
        GSDialog.HintWindowTF("确定要删除吗？", function () {
            RoleOperate.deleteUsersRoles(UserId, RoleId, function (result) {
                if (!isNaN(result)) {
                    //刷新数据
                    $("#grid").data('kendoGrid').dataSource.read();
                    $("#grid").data('kendoGrid').refresh();
                    refreshSelect();
                }
                else {
                    GSDialog.HintWindow("Error：" + result);
                }

            })
        })
    }
    this.selectGridRow = function (rowIndex) {
        var grid = $("#grid").data("kendoGrid");
        grid.clearSelection();
        row = grid.tbody.find(">tr:not(.k-grouping-row)").eq(rowIndex);
        grid.select(row);
    }

    function refreshSelect() {
        UserList.length = 0;
        RoleOperate.getUsersByRoleId(roleId, function (data) {
            $.each(data, function (i, d) {
                UserList.push(d);
            });
            //刷新数据
            $("#Users").data('kendoMultiSelect').dataSource.read();
            $("#Users").data('kendoMultiSelect').refresh();
        });
    }
});
