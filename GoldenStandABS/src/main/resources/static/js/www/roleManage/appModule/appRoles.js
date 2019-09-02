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
    var set = "zh-CN"
    var selectedRowIndex = -1;
    var pageIndex = 0;
    var ApplicationId;
    var RoleArray = [];

    $(function () {
        winHeight = $(window.parent.document).height();
        winWidth = $(window.parent.document).width();
        ApplicationId = common.getQueryString("appId");
        PasthapplicationId = common.getQueryString("appId")
        GetMultiSelectUnit();
        RefreshSelectAppRoles();
        registerEvent();
        runderGrid();
    });

    function RefreshSelectAppRoles() {
        RoleArray.length = 0;
        RoleOperate.getApplicationsRoles(ApplicationId, function (data) {

            $.each(data, function (i, d) {
                if (!d.IsRoot) {//filter the sysadmin role
                    RoleArray.push(d);
                }
            })
        });
        $("#roles").data('kendoMultiSelect').dataSource.read();
        $("#roles").data('kendoMultiSelect').refresh();
    }

    function GetMultiSelectUnit() {
        $("#roles").kendoMultiSelect({
            dataTextField: "RoleName",
            dataValueField: "RoleId",
            dataSource: RoleArray
        });
    }

    function registerEvent() {
        $("#btnRoleAdd").click(function () {
            saveItems();
        });
    }

    function saveItems() {
        var multiSelect = $("#roles").data("kendoMultiSelect");
        var RolesIds = multiSelect.value();
        var xml = '<Items>';
        if (RolesIds.length == 0) { GSDialog.HintWindow("请选择角色！"); }

            for (var i = 0; i < RolesIds.length; i++) {

                xml += '<Item><ApplicationId>' + ApplicationId + '</ApplicationId><RoleId>' + RolesIds[i] + '</RoleId></Item>';
            }
            xml += '</Items>';
            xml = encodeURIComponent(xml);
            //如果是应用
            RoleOperate.saveApplicationsRoles(xml, function (r) {
                if (r == '1') {
                    //$("#roles").val("");
                    GSDialog.HintWindow("角色添加成功！");
                    runderGrid();
                    RefreshSelectAppRoles();
                }
            })
       

    }

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
                    title: "角色名称",
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
                    field: "RoleDescription",
                    title: "角色描述",
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
                      template: '#=self.getOperate(ApplicationId,RoleId,ApplicationIsRoot,RoleIsRoot)#',
                      width: "100px",
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

    this.getOperate = function (applicationId, roleId, appIsRoot, roleIsRoot) {
        var html = "";
        if (appIsRoot && roleIsRoot) {
            html = "";
        }
        else {
            html = '<button class="btn btn-link" onclick="self.deleteRole(\'' + applicationId + '\',\'' + roleId + '\')"><i class="fa fa-trash-o" title="删除"></i></button>';
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

                        var orderby = 'RoleName';
                        if (dataSource.sort() != null) {
                            if (dataSource.sort().length > 0) {
                                orderby = dataSource.sort()[0].field + " " + dataSource.sort()[0].dir;
                                orderby = encodeURIComponent(orderby);
                            }
                        };
                            var filter = " and ApplicationId='" + ApplicationId + "'";
                       
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
                                tableName: RoleOperate.schema + '.[ViewApplicationsRoles]',
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
                        RoleDescription: { type: "string" }
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

    this.deleteRole = function (applicationId, roleId) {
        GSDialog.HintWindowTF("确定删除此角色？", function () {
            RoleOperate.deleteApplicationRoleById(applicationId, roleId, function (r) {
                if (r == '1') {
                    //刷新数据
                    $("#grid").data('kendoGrid').dataSource.read();
                    $("#grid").data('kendoGrid').refresh();

                    RefreshSelectAppRoles();
                } else {
                    GSDialog.HintWindow("Error:" + r, 'icon-warning');
                }
            })
        })
    }
});



