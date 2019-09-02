define(function (require) {
    var $ = require('jquery');
    var kendoGrid = require('kendo.all.min');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    var set = 'zh-CN';
    var UserName = decodeURIComponent(common.getUrlParam('UserName'))
    require("kendomessagescn");
    require("kendoculturezhCN");
    var dialogHeight = window.innerHeight - 30 //刷新按钮-28.4;
    if (document.readyState == "complete") //当页面加载状态 
    {
        $("#loading").fadeOut();
    }

    initLoginLogs();
    kendo.culture("zh-CN");
    function initLoginLogs() {
        var executeParams = {
            SPName: 'QuickFrame.usp_GetSystemLoginLogs', SQLParams: [
                { Name: 'UserName', value: UserName, DBType: 'string' }]
        }
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?';
        common.ExecuteGetData(true, svcUrl, 'QuickFrame', executeParams, function (datas) {
            var selectedRowIndex = -1;
            var pageIndex = 0;
            // $("#grid").html("");
            var grid = $("#grid").kendoGrid({
                dataSource: datas,
                height: dialogHeight,
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
                    attributes: {
                        style: 'background-color:blue'
                    }
                },
                columns: [
                    {
                        field: "UserName",
                        title: "用户名",
                        width: "120px",
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
                         field: "Act",
                         title: "动作",
                         width: "120px",
                         headerAttributes: {
                             "class": "table-header-cell",
                             style: "text-align: center"
                         },
                         attributes: {
                             "class": "table-cell",
                             style: "text-align: center"
                         },
                     },
                     {
                         field: "IPAddress",
                         title: "IP地址",
                         width: "120px",
                         headerAttributes: {
                             "class": "table-header-cell",
                             style: "text-align: center"
                         },
                         attributes: {
                             "class": "table-cell",
                             style: "text-align: center"
                         },
                     },
                     {
                         field: 'Time',
                         title: "时间",
                         //template: '#=Time?getStringDate(Time).dateFormat("hh:mm:ss"):""#',
                         width: "120px",
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
                          field: "Date",
                          title: "日期",
                          //template: '#=CreateTime?getStringDate(CreateTime).dateFormat("yyyy-MM-dd"):""#',
                          width: "120px",
                          headerAttributes: {
                              "class": "table-header-cell",
                              style: "text-align: center"
                          },
                          attributes: {
                              "class": "table-cell",
                              style: "text-align: center"
                          }
                      },
                ],
                dataBound: function () {
                    document.querySelector('.k-pager-wrap').style.fontSize = '13px';
                    document.querySelector('.k-pager-refresh').innerHTML = '<i id="btnRefresh" class="icon icon-arrows-ccw"></i>';
                    //刷新按钮事件
                    //$('#btnRefresh').off();
                    $('#btnRefresh').click(function () {
                        // $('#grid').html('');
                        location.reload();
                        //initLoginLogs();
                        //document.querySelector('#btnRefresh').firstElementChild.style.backgroundColor='white';

                    })
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

        });

    }
});