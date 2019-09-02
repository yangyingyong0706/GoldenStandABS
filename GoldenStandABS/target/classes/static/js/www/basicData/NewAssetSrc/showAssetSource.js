define(function (require) {
    var $ = require('jquery');
    var kendoGrid = require('kendo.all.min');
    var common = require('common');
    var GSDialog = require('gsAdminPages');
    var GlobalVariable = require('globalVariable');
    var set = 'zh-CN';
    var UserName = decodeURIComponent(common.getUrlParam('UserName'))
    require("kendomessagescn");
    require("kendoculturezhCN");
    PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    var dialogHeight = window.innerHeight - 30 //刷新按钮-28.4;
    if (document.readyState == "complete") //当页面加载状态 
    {
        $("#loading").fadeOut();
    }
    $('#modal-win', parent.document).click(function () {
        dialogHeight = window.innerHeight - 30
        showAssetSrc();
    })
    this.deleteCode = function (OrganisationCode) {
        //删除资产来源，仅删除没有产品的资产来源
        //return '<a style="color:red;" onclick="Delete(\'' + OrganisationCode + '\')">删除</a>';
        return '<span class="btn btn-link" style ="height:15px;"><i class="icon icon-trash-empty" style="color:#d00000; " onclick="Delete(\'' + OrganisationCode + '\')"></i></span>';
        
    }
    this.Delete = function (OrganisationCode) {
        GSDialog.HintWindowTF('确认删除资产来源？', function () {
            $("#loading").show();
            var executeParam = {
                SPName: 'TrustManagement.usp_deleteOrganisationByCode', SQLParams: [
                     { 'Name': 'OrganisationCode', 'Value': OrganisationCode, 'DBType': 'string' }
                ]
            };
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
            CallWCFSvc(serviceUrl, true, 'GET', function (datas) {
                //console.log(datas);
                $("#loading").fadeOut();
                if (datas[0].RESULT == "SUCCUSS") {
                    GSDialog.HintWindowtop("删除成功！")
                    //alert("删除成功！");
                    location.reload();
                }
                else if (datas[0].RESULT == "EXIST") {
                    GSDialog.HintWindowtop("资产来源存在相关产品，无法直接删除！")
                    //alert("资产来源存在相关产品，无法直接删除！");
                }

            });
        }, "", false)
    }
    showAssetSrc();
    kendo.culture("zh-CN");
    function showAssetSrc() {

        var executeParam = { SPName: 'dbo.usp_GetDimOrganisation', SQLParams: [] };
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;
        CallWCFSvc(serviceUrl, true, 'GET', function (datas) {
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
                    buttonCount: 4,
                    page: 1,
                    pageSize: 20,
                    pageSizes: [20, 50, 100, 500],
                    attributes: {
                        style: 'background-color:blue'
                    }
                },
                columns: [
                    {
                        field: "DimOrganisationID",
                        title: "ID",
                        width: "100px",
                        headerAttributes: {
                            style: 'text-align:left'
                        },
                        attributes: {
                            style: 'text-align:left'
                        }
                    },
                     {
                         field: "OrganisationCode",
                         title: "资产方编码",
                         width: "100px",
                         headerAttributes: {
                             style: 'text-align:left'
                         },
                         attributes: {
                             style: 'text-align:left'
                         },
                     },
                     {
                         field: "OrganisationDesc",
                         title: "资产方名称",
                         width: "100px",
                         headerAttributes: {
                             style: 'text-align:left'
                         },
                         attributes: {
                             style: 'text-align:left'
                         },
                     },
                     {
                         //field: "OrganisationCode",
                         title: "操作",
                         template: '#=this.deleteCode(OrganisationCode)#',
                         width: "60px",
                         headerAttributes: {
                             style: 'text-align:left'
                         },
                         attributes: {
                             style: 'text-align:left'
                         },
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
                        //showAssetSrc();
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