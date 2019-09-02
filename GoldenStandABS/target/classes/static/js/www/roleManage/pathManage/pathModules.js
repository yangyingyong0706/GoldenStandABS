var pathId = null;
var moduleList = [];
define(function (require) {
    var GSDialog = require("gsAdminPages")
    $(function () {
        pathId = getQueryString("pathId");
        if (pathId == null) {
            GSDialog.HintWindow("请以正常的方式打开此页面");
        }
        renderSelect();
        RoleOperate.getModulesByPathId(pathId, function (data) {
            moduleList = data;
            renderGrid();
        });
    })

    function renderSelect() {
        var moduleTypes = RoleOperate.getModuleTypes("zh-CN");
        var html = '';//'<option value="">所有</option>';
        $.each(moduleTypes, function (i, option) {
            html += '<option value="' + option.ModuleTypeId + '">' + option.ModuleType + '</option>';
        });
        $('#moduleType').html(html);
    }
    function renderGrid() {
        $("#grid").kendoGrid({
            dataSource: {
                data: moduleList,
                schema: {
                    model: {
                        fields: {
                            Module: { type: "string" },
                            Descriptione: { type: "string" },
                            ModuleType: { type: "string" }
                        }
                    }
                },
                pageSize: 20
            },
            height: 300,
            scrollable: true,
            sortable: true,


            columns: [
                { field: "Module", title: "模块", width: "130px" },
                { field: "Description", title: "模块描述", width: "130px" },
                { field: "ModuleType", title: "模块类型", width: "130px" },
                {
                    title: '操作',
                    template: '#=getOperate(ModuleId)#',
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
            ]
        });

    }

    function getOperate(moduleId) {

        return '<button class="btn btn-delete btn-danger" onclick="deleteModule(\'' + moduleId + '\')">删除</button>';

    }

    function addModule() {
        var pass = validation();
        if (!pass) {
            return;
        }

        var moduleCode = $("#moduleCode").val();
        var moduleTypeId = $("#moduleType").val();
        var moduleDescription = $("#moduleDescription").val();
        var xml = "<Item>";
        xml += "<PathId>" + pathId + "</PathId>"
        xml += "<Module>" + moduleCode + "</Module>";
        xml += "<Description>" + moduleDescription + "</Description>";
        xml += "<ModuleTypeId>" + moduleTypeId + "</ModuleTypeId>";
        xml += "</Item>";
        RoleOperate.saveModule(xml, function (result) {
            if (!isNaN(result)) {
                if (result == '-1') {
                    alertMsg("已经存在", 'icon-warning');
                }
                else if (result == '1') {
                    RoleOperate.getModulesByPathId(pathId, function (data) {
                        moduleList.length = 0;
                        $.each(data, function (i, d) {
                            moduleList.push(d);
                        });
                        //刷新数据
                        $("#grid").data('kendoGrid').dataSource.read();
                        $("#grid").data('kendoGrid').refresh();
                    });
                    alertMsg("Save Sucessful");
                }
            }
            else {
                alertMsg("Error:" + result, 'icon-warning');
            }

        });
    }

    function deleteModule(moduleId) {
        GSDialog.HintWindowTF("确定要删除吗", function () {
            RoleOperate.deleteModuleById(moduleId, function () {
                RoleOperate.getModulesByPathId(pathId, function (data) {
                    moduleList.length = 0;
                    $.each(data, function (i, d) {
                        moduleList.push(d);
                    });
                    //刷新数据
                    $("#grid").data('kendoGrid').dataSource.read();
                    $("#grid").data('kendoGrid').refresh();
                });
            })
        })
    }


    function validation() {
        var pass = true;
        var detail = $("#addDiv").find("input");
        pass = validControls(detail);
        return pass;
    }
})
