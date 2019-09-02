var moduleId = null;
var selectedRowIndex = -1;
var pageIndex = 0;
var selectData = [];
$(function () {
    winHeight = $(window.parent.document).height();
    winWidth = $(window.parent.document).width();
    moduleId = getQueryString("moduleId");
    if (moduleId == null) {
        alert("请以正常的方式打开此页面");
    }
    runderGrid();
    renderSelect();
});

function renderSelect()
{
    RoleOperate.getRolesByModuleId(moduleId, function (data) {
        selectData = data;
        $("#roleSelect").kendoMultiSelect({
            dataTextField: "RoleName",
            dataValueField: "RoleId",
            dataSource: selectData
        });
    })
}


function runderGrid() {
    $("#grid").html("");
    var grid = $("#grid").kendoGrid({
        dataSource: dataSource(),
        height: winHeight -250,
        selectable: "multiple",
        filterable: true,
        sortable: true,

        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5,
            page: 1,
            pageSize: 20,
            pageSizes: [20, 50, 100, 500]
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
                template: '#=getOperate(RoleId)#',
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

                    var filter = " and ModuleId='"+moduleId+"'";
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
                        tableName: RoleOperate.schema + '.[ViewModulesRoles]',
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

function getOperate(roleId) {
    var html = "";
    var roleUsersUrl = 'roleUsers.html?roleId=' + roleId;
    html += '<a class="row-number" href="javascript: void(0);" onclick="roleUsers(this,\'' + roleUsersUrl + '\');">用户 </a>';
    html += '&nbsp;&nbsp;&nbsp;';
    html += '&nbsp;&nbsp;&nbsp;';
    html += '<button class="btn btn-delete btn-danger" onclick="deleteRoles(\'' + roleId + '\')">删除</button>';
    return html;
}

function roleUsers(obj, roleUsersUrl) {
    alert('暂无链接页面！');
     
}

function deleteRoles(roleId) {
    if (confirm("确定删除此条记录？")) {
        RoleOperate.deleteModuleRole(moduleId,roleId, function () {

            //刷新数据
            $("#grid").data('kendoGrid').dataSource.read();
            $("#grid").data('kendoGrid').refresh();

            refreshSelect();
        })

    }
}


function addModuleRoles()
{
   
    var multiSelect = $("#roleSelect").data("kendoMultiSelect");
    var roles = multiSelect.value();
    if (roles.length == 0)
    {
        alertMsg("请选择角色", 'icon-warning');
        return;

    }
    var xml = '<Items>';
    $.each(roles, function (i, role) {
        xml += '<Item>';
        xml += '<RoleId>' + role + '</RoleId>';
        xml += '<ModuleId>' + moduleId + '</ModuleId>';
        xml += '</Item>';
    })
    xml += '</Items>';
    RoleOperate.saveModuleRoles(xml, function (result) {
        if (!isNaN(result))
        {
            refreshSelect();
            //刷新数据
            $("#grid").data('kendoGrid').dataSource.read();
            $("#grid").data('kendoGrid').refresh();
        }
        else
        {
            alertMsg("Error:" + result, 'icon-warning');
        }
    })
}

function selectGridRow(rowIndex) {
    var grid = $("#grid").data("kendoGrid");
    grid.clearSelection();
    row = grid.tbody.find(">tr:not(.k-grouping-row)").eq(rowIndex);
    grid.select(row);
}

function refreshSelect()
{
    selectData.length = 0;
    RoleOperate.getRolesByModuleId(moduleId, function (data) {
        $.each(data, function (i, d) {
            selectData.push(d);
        });
        //刷新数据
        $("#roleSelect").data('kendoMultiSelect').dataSource.read();
        $("#roleSelect").data('kendoMultiSelect').refresh();
    });
   
}


