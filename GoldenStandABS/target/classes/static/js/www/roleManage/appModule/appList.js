define(function (require) {
    //<script src="../Config/globalVariable.js"></script>
    //<script src="../Scripts/jquery-1.7.2.min.js"></script>
    //<script src="../Scripts/jquery-ui.min.js"></script>
    //<script src="../Scripts/common.js"></script>
    //<script src="../Scripts/anyDialog.js"></script>
    
    //<script src="../Scripts/Kendo/js/kendo.all.min.js"></script>

    //<script src="../Scripts/Kendo/js/kendo.culture.zh-CN.js"></script>
    //<script src="../Scripts/Kendo/js/kendo.messages.zh-CN.js"></script>
    //<script src="../Scripts/roleOperate.js"></script>
    //<script src="appList.js"></script>
    //<script src="../Scripts/permission.js"></script>
    var $ = require('jquery');
    require('jquery-ui');
    var kendo = require('kendo.all.min');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    var common = require('common');

    var self = this;
    var winHeight = 500;
    var winWidth = 500;
    var set = "zh-CN"
    var selectedRowIndex = -1;
    var pageIndex = 0;
    var GSDialog = require("gsAdminPages")
    $(function () {
        winHeight = $(window.parent.document).height();
        winWidth = $(window.parent.document).width();
        registerEvent();
        runderGrid();
        kendo.culture("zh-CN");
    });

    function registerEvent() {
        $("#btnAppAdd").click(function () {
            common.showDialogPage('appDetail.html?flag=0', '添加应用',600, 350,false,function () {
                //var haveDoneAction = window.frames["dialogIframe"].HaveDoneAction;
                //if (haveDoneAction) {
                //    runderGrid();
                //}
                runderGrid();
            },"",false);

        });
    }


    function runderGrid() {
        $("#grid").html("");
        var grid = $("#grid").kendoGrid({
            dataSource: dataSource(),
            height: winHeight - 60,
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
                    title: "应用名称",
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
                    title: "应用描述",
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

                      title: "操作",
                      template: '#=self.getOperate(ApplicationId,IsRoot)#',
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

    this.getOperate = function (applicationId, isRoot) {
        var html = "";
        if (!isRoot) {
            var editPageUrl = 'appDetail.html?flag=1&appId=' + applicationId;
            html += '<button class="btn btn-link"  onclick="self.rowEdit(this,\'' + editPageUrl + '\');"><i class="icon icon-edit" title="编辑"></i></button>';
            html += '&nbsp;&nbsp;';
        }
        var appPathsUrl = 'appPaths.html?appId=' + applicationId;//需要修改
        //html += '<button class="normal_small_button" onclick="self.appPathsPage(this,\'' + appPathsUrl + '\');">子菜单</button>';
        html += '<button class="btn btn-link" onclick="self.appPathsPage(this,\'' + appPathsUrl + '\');"><i class="icon icon-user-add" title="子应用"></i></button>';
        html += '&nbsp;&nbsp;';
        var appRolesUrl = 'appRoles.html?appId=' + applicationId;//需要修改
        html += '<button class="btn btn-link" onclick="self.appRoles(this,\'' + appRolesUrl + '\');"><i class="icon icon-user-circle-o" title="角色"></i></button>';
        if (!isRoot) {
            html += '&nbsp;&nbsp;';
            html += '<button class="btn btn-link" onclick="self.deleteApp(\'' + applicationId + '\')"><i class="fa fa-trash-o fa-fw" title="删除"></i></button>';
        }
        return html;
    }


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
                            tableName: RoleOperate.schema + '.[Applications]',
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
                        Description: { type: "string" }
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

    this.appPathsPage = function (obj, appPathsUrl) {
        //alert('暂无链接页面！');
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(appPathsUrl, '添加子应用', winWidth * 3 / 5, winHeight * 4 / 5,false,function () { },"",false);
    }

    this.deleteApp = function (ApplicationId) {
        GSDialog.HintWindowTF("确定删除此条记录？", function () {
            RoleOperate.deleteAppById(ApplicationId, function () {
                //刷新数据
                $("#grid").data('kendoGrid').dataSource.read();
                $("#grid").data('kendoGrid').refresh();
            })
        })
    }

    this.appRoles = function (obj, appRoleUrl) {
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(appRoleUrl, '编辑用户角色', winWidth * 3 / 5, winHeight * 4 / 5,false,function () { },"",false);
    }

    this.rowEdit = function (obj, editPageUrl) {
        selectedRowIndex = $(obj).attr("index");
        selectGridRow(selectedRowIndex);
        common.showDialogPage(editPageUrl, '编辑', 600, 350,function () {
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
});







