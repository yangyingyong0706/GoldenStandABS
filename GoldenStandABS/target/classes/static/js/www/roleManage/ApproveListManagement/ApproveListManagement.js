
define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var kendo = require('kendo.all.min');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    var common = require('common');
    var webProxy = require('gs/webProxy');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages')
    var self = this;
    var winHeight = 500;
    var winWidth = 500;
    var set = "zh-CN"
    var selectedRowIndex = -1;
    var pageIndex = 0;
    var ApproveUser=$.cookie('gs_UserName');
    $(function () {
        winHeight = $(window.parent.document).height();
        winWidth = $(window.parent.document).width();
        runderGrid();
        kendo.culture("zh-CN");
    });

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
                    field: "UserName",
                    title: "提交用户",
                    width: "150px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    }
                }, {
                    field: "SubmiTime",
                    title: "提交时间",
                    width: "190px",
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
                    field: "ApproveState",
                    title: "审批状态",
                    template: '#=self.ApproveStates(ApproveState)#',
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
                    field: "ApproveUser",
                    title: "审批人",
                    width: "150px",
                    headerAttributes: {
                        "class": "ApproveUser",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "ApproveUser",
                        style: "text-align: center"
                    }
                }, {
                    field: "ApplyReasons",
                    title: "原因",
                    width: "150px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    }
                }, {
                    field: "ApplyDate",
                    title: "申请修改开始日期",
                    //template: '#=self.ApproveStartTime(ApplyDate)#',
                    width: "260px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-startTime",
                        style: "text-align: center"
                    }
                }, {
                    field: "ApproveDate",
                    title: "同意时间",
                    width: "190px",
                    headerAttributes: {
                        "class": "table-header-cell",
                        style: "text-align: center"
                    },
                    attributes: {
                        "class": "table-cell",
                        style: "text-align: center"
                    }
                }
            , {
                field: "ProductType",
            title: "资产类型",
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
                , {
                    field: "ApplyEndTime",
                    title: "截止时间",
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
                     field: "TrustId",
                     title: "产品编号",
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
                      template: '#=self.getOperate(ApproveState,TrustId,UserName,SubmiTime,ApplyReasons)#',
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
    this.getOperate = function (ApproveState, TrustId, UserName, SubmiTime, ApplyReasons) {
        var ApproveUser = $.cookie('gs_UserName');//审批人
        var html = "";
        if (SubmiTime) {
            var SubmiTime = SubmiTime.replace(/\s+/g, "");
        }
        if (ApproveState == 'NotTrial' || ApproveState == 'Disagree') {
            html += '<button class="row-number btn btn-link"  onclick=startTimeTest("' + TrustId + '","' + UserName + '","' + ApproveUser + '","' + SubmiTime + '","' + ApplyReasons + '")><i class="icon icon-check" title="同意"></i></button>'
                + '<button class="row-number btn btn-link"  onclick=ApproveReject("' + TrustId + '","' + UserName + '","' + ApproveUser + '","' + SubmiTime + '","' + ApplyReasons + '")><i class="icon icon-close" title="驳回" style="color: #dd0000;"></i></button>';
            html += '&nbsp;&nbsp;';
        } else if (ApproveState == 'Agree') {
            html += '<button class="row-number btn btn-link" onclick=RevokeOperration("' + TrustId + '","' + UserName + '","' + SubmiTime + '")><i class="icon icon-chexiao" title="撤销"></i></button>';
        }
        html += '<button class="row-number btn btn-link" onclick=ShowHistory("' + TrustId + '","' + UserName + '","' + ApproveUser + '","' + SubmiTime + '")><i class="icon icon-tag" title="查看审批记录"></i></button>';
        return html;
    }
    this.ApproveStates = function (ApproveState) {
        var ApproveStates='';
        if (ApproveState == 'NotTrial') {
            ApproveStates = "待审"
        } else if (ApproveState == 'Agree') {
            ApproveStates = "已审"
        } else if (ApproveState == 'Disagree') {
            ApproveStates = "驳回"
        }
        return ApproveStates
    }
    //查看审批记录
    this.ShowHistory = function (TrustId, userName, ApproveUser, SubmiTime) {
        //var url = window.location.protocol + "//" + window.location.host + "/GoldenStandABS/www/roleManage/ApproveListManagement/ApproveListOperationHistory.html";
        window.location.href = 'ApproveListOperationHistory.html?TrustId=' + TrustId
    }
    





    //log申请记录
    this.LogOperation = function (TrustId, userName, ApproveUser, OperationType, ApplyReasons, SubmiTime) {
        var parameterDatas = [
            ["TrustId", TrustId, "int"],
            ["Operator", ApproveUser, "string"],
            ["OperationReason", ApplyReasons, "string"],
            ["OperationTime", SubmiTime, "string"],
            ["Applicant", userName, "string"],
            ["OperationType", OperationType, "int"]
                ]
        var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=QuickFrame&appDomain=QuickFrame&executeParams=";
        var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_LogApproveListOperation');
        promise().then(function (response) {
            var res = JSON.parse(response);
            
            if (res[0].Column1 == 1) {
                GSDialog.HintWindow("成功");
                refreshGrid();
            }
        });


    }

    //同意申请
    this.startTimeTest = function (TrustId, userName, ApproveUser, SubmiTime, ApplyReasons) {
        var parameterDatas = [
             ["UserName", userName, "string"]
           , ["TrustId", TrustId, "string"]
           , ["ApproveUser", ApproveUser,"string"]
           , ["SubmiTime", SubmiTime, "string"]
        ]
        var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=QuickFrame&appDomain=QuickFrame&executeParams=";
        var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_UpdateOperrationType');
        promise().then(function (response) {
            var res = JSON.parse(response);
            if (res[0].u == 1) {
                LogOperation(TrustId, userName, ApproveUser, 1, ApplyReasons, SubmiTime)

                //common.alertMsg("成功", 1);
                //refreshGrid();
            }
        });
    }
    //驳回申请
    this.ApproveReject = function (TrustId, userName, ApproveUser, SubmiTime, ApplyReasons) {
        var parameterDatas = [
           ["UserName", userName, "string"]
         , ["TrustId", TrustId, "string"]
         , ["ApproveUser", ApproveUser, "string"]
         , ["SubmiTime", SubmiTime, "string"]
        ]
        var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=QuickFrame&appDomain=QuickFrame&executeParams=";
        var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_UpdateOperrationTypeApproveReject');
        promise().then(function (response) {
            var res = JSON.parse(response);
            if (res[0].u == 1) {
                LogOperation(TrustId, userName, ApproveUser, 2, ApplyReasons, SubmiTime)
            }
        });
    }
    this.RevokeOperration = function (TrustId, userName, SubmiTime) {
        var parameterDatas = [
             ["UserName", userName, "string"]
           , ["TrustId", TrustId, "string"]
           , ["SubmiTime", SubmiTime, "string"]
        ]
        var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=QuickFrame&appDomain=QuickFrame&executeParams=";
        var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_UpdateRevokeOperration');
        promise().then(function (response) {
            var res = JSON.parse(response);
            if (res[0].u == 1) {
                LogOperation(TrustId, userName, ApproveUser, 3,null,null)

                //common.alertMsg("成功", 1);
                //refreshGrid();
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

                        var orderby = 'SubmiTime desc';
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
                            tableName: RoleOperate.schema + '.[ProdctApproveOperrationState]',
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

