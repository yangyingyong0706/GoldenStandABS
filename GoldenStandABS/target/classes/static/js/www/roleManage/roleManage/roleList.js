define(function (require) {

    //<script src="../Config/globalVariable.js"></script>
   
  

    //<script src="../Scripts/anyDialog.js"></script>
    //<script src="../Scripts/calendar.min.js"></script>
    //<script src="../Scripts/Kendo/js/kendo.culture.zh-CN.js"></script>
    //<script src="../Scripts/Kendo/js/kendo.messages.zh-CN.js"></script>
    //<script src="../Scripts/knockout-3.4.0.js"></script>
    //<script src="../Scripts/knockout.mapping-latest.js"></script>
    //<script src="../Scripts/roleOperate.js"></script>
    //<script src="roleList.js"></script>
    //<script src="../Scripts/permission.js"></script>

    var $ = require('jquery');
    require('jquery-ui');
    var kendo = require('kendo.all.min');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    var common = require('common');
    var GSDialog = require("gsAdminPages")
    var self = this;
    var currentReportingDateId = "";
    var winHeight = 500;
    var winWidth = 500;
 

    $(function () {
        winHeight = $(window.parent.document).height();
        winWidth = $(window.parent.document).width();
   
        regsterEvent();

        runderGrid();
        kendo.culture("zh-CN");
    });


    function regsterEvent() {

        $('#btnAdd').click(function () {
            common.showDialogPage('roleDetail.html?flag=0', '添加角色', 600, 350,function () {
                //var haveDoneAction = window.frames["dialogIframe"].HaveDoneAction;
                //if (haveDoneAction) {
                //    runderGrid();
                //}
                runderGrid();
            },null,false);
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
                            tableName: RoleOperate.schema + '.[Roles]',
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
            height: winHeight-60,
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
                    title: '描述信息',
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

                    title: '操作',
                    template: '#=self.getOperate(RoleId,IsRoot)#',
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


 
    this.getOperate = function (roleId, IsRoot) {
        var html = '';
        var myflag;
        var editPageUrl1 = 'roleDetail.html?roleId=' + roleId + '&flag=1';
        var roleUsersUrl = 'roleUsers.html?roleId=' + roleId + '&flag=1';
        var RolePermissionURl = 'RolePermission.html?roleId=' + roleId + '&flag=1';
        if (IsRoot == 0) {}
        else  { myflag = "none"; } 
        html += '<button class="btn btn-link"  style=" display:' + myflag + ';"   onclick="self.rowEdit(this,\'' + editPageUrl1 + '\');"><i class="icon icon-edit" title="编辑"></i></button>';
        html += '&nbsp;&nbsp;';
        html += '<button class="btn btn-link"  style=" display:' + myflag + ';"    onclick="self.roleUsers(this,\'' + roleUsersUrl + '\')"><i class="icon icon-user-add" title="用户"></i></button>';
        html += '&nbsp;&nbsp;';
        html += '<button class="btn btn-link" style=" display:' + myflag + ';"  onclick="self.deleteRole(\'' + roleId + '\')"><i class="fa fa-trash-o fa-fw" style="color: #dd0000;" title="删除"></i></button>';
        html += '&nbsp;&nbsp;';
        html += '<button class="btn btn-link"  onclick="self.rolePermissionOption(this,\'' + RolePermissionURl + '\')"><i class="icon icon-setting"  title="配置权限"></i></button>';
        return html;
    }


    this.deleteRole = function (roleId) {
        GSDialog.HintWindowTF("确定要删除这条记录？", function () {
            RoleOperate.deleteRoleById(roleId, function (result) {
                if (result) {
                    //刷新数据
                    $("#grid").data('kendoGrid').dataSource.read();
                    $("#grid").data('kendoGrid').refresh();
                }
                else {
                    alertMsg("Error：" + result);
                }

            });
        })
    }

    this.rowEdit = function (obj, editPageUrl) {
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(editPageUrl, '编辑', 600,350,function () {
            //var haveDoneAction = window.frames["dialogIframe"].HaveDoneAction;
            //if (haveDoneAction) {
            //    //刷新数据
            //    $("#grid").data('kendoGrid').dataSource.read();
            //    $("#grid").data('kendoGrid').refresh();
            //}
            $("#grid").data('kendoGrid').dataSource.read();
            $("#grid").data('kendoGrid').refresh();
        },null,false);
    }

    this.roleUsers = function (obj, roleUsersUrl) {
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(roleUsersUrl, '用户', winWidth * 3 / 5, winHeight * 4 / 5,function () {
            //var haveDoneAction = window.frames["dialogIframe"].HaveDoneAction;
            //if (haveDoneAction) {
            //    //刷新数据
            //    $("#grid").data('kendoGrid').dataSource.read();
            //    $("#grid").data('kendoGrid').refresh();
            //}
            $("#grid").data('kendoGrid').dataSource.read();
            $("#grid").data('kendoGrid').refresh();
        }, null, false);
    }

    this.rolePermissionOption = function (obj, rolePermissionOption) {
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(rolePermissionOption, '用户操作权限配置', 600,350, function () {
            //var haveDoneAction = window.frames["dialogIframe"].HaveDoneAction;
            //if (haveDoneAction) {
            //    //刷新数据
            //    $("#grid").data('kendoGrid').dataSource.read();
            //    $("#grid").data('kendoGrid').refresh();
            //}
            $("#grid").data('kendoGrid').dataSource.read();
            $("#grid").data('kendoGrid').refresh();
        },null,false);
    }
    function selectGridRow(rowIndex) {
        var grid = $("#grid").data("kendoGrid");
        grid.clearSelection();
        row = grid.tbody.find(">tr:not(.k-grouping-row)").eq(rowIndex);
        grid.select(row);
    }


    this.refreshGrid = function () {
        closeWindow();
        $("#grid").data('kendoGrid').dataSource.read();
        $("#grid").data('kendoGrid').refresh();
    }

    function closeWindow() {
        $('#modal-close').trigger('click');
    }
})
