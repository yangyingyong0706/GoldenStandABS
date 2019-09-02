define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var RoleOperate = require('roleOperate');
    var GSDialog = require("gsAdminPages");
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    var DataProcessServiceUrl = GlobalVariable.SslHost + 'TrustManagementService/DataProcessService.svc/jsAccessEP/';
    var svcUrl = GlobalVariable.DataProcessServiceUrl;
    var height = $(window).height() - 170;
    var self = this;
    //var filter = (appName === "productManage") ? "and SpecialPlanState = N'已发行'" : "and SpecialPlanState = N'设计中'";
    function filterConfig() {
        var filter;
        //if ($(".ConfigBtn").children().html().trim() == '业务审批人') {
        //    filter=' '
        //} else {
        //filter = 'and SpecialPlanState = 2';
        filter = '';
        //}
        return filter
    }
    var userName = $.cookie('gs_UserName');
    var kendouiGrid = new kendoGridModel(height);
    var AssetPoolGrid = new kendoGridModel(height);
    this.OpreationType = function (operationTypeId,isCheck) {
        if (isCheck==null) {
            return '';
        }
        else if (operationTypeId == '2'&&!isCheck) {
            return ' <select id="UserOperation" class="form-control" style="padding:4px 10px;">' +
                       '<option value="1">只读</option>' +
                       '<option value="2" selected>可申请编辑</option>' +
                   '</select>'
        }
        else {
            return ' <select id="UserOperation" class="form-control" style="padding:4px 10px;" >' +
                       '<option value="1" selected>只读</option>' +
                       '<option value="2">可申请编辑</option>' +
                   '</select>'
        }
    }
    this.ObjectTypeGroup = function (ObjectType) {
        if (ObjectType == 'Pool') {
            return '资产池'
        } else if (ObjectType == 'Trust') {
            return '产品'
        } else {
            return ''
        }
    }
    self.onChange=function(selectedRow) {
        //$(e).closest("tr").addClass("k-state-selected");
        var row = $(selectedRow).closest("tr");
        var item = $("#grid").data('kendoExtGrid').dataItem(row);
        item.set("IsCheck", $(selectedRow).is(":checked") ? 0 : null);
        //if (!($(selectedRow).is(":checked"))) {
        //    row.
        //}

    } 
    var AssetPoolGridOptions = {
        userName:'',
        renderOptions: {
            //change: onChange,
            columns: [
                 //{ selectable: false, width: "50px", template: "<input name='AccountNoCkbox' class='ob-paid' id='#=ObjectId#' type='checkbox' data-bind='checked:ObjectId' #=ObjectId#/>" },
                
                 { field: "ObjectId", title: '产品标识', width: "150px", locked: true, attributes: { style: 'text-align:center' } }
               , { field: "ObjectType", title: '产品类型', template: "#=this.ObjectTypeGroup(ObjectType)#", width: "200px", attributes: { style: 'text-align:center' } }
               , { field: "UserName", title: '创建者', width: "220px" }
               , { field: "TrustCode", title: '产品名称', width: "180px" }
               , { field: "TrustName", title: '产品描述', width: "280px" }
               , { selectable: false, title: '是否选中', width: "100px", template: "<input name='#=UserName#' class='checkbox' id='#=ObjectId#' type='checkbox' data-bind='checked: IsCheck==0' #= IsCheck==0 ? checked='checked' : '' # onchange='self.onChange(this)'/>" }
               , { field: "Operation", title: "操作", template: "#=this.OpreationType(OperationTypeId,IsCheck)#", width: "160px", attributes: { style: 'text-align:center' } }
               , { field: "", title: "", width: "auto" }
            ],
        }
           , dataSourceOptions: {
               pageSize: 20
               , otherOptions: {
                   orderby: "ObjectId"
                   , direction: "desc"
                   , DBName: 'TrustManagement'
                   , appDomain: 'dbo'
                   , executeParamType: 'extend'
                   , defaultfilter: filterConfig()
                   , executeParam: function () {
                       var result = {
                           SPName: 'usp_GetOperationPermissionByUserName',
                           SQLParams: [
                                  { Name: 'UserName', Value: AssetPoolGridOptions.userName, DBType: 'string', }
                           ],
                       };
                       return result;
                   },

               }
           },

    }
    function runderGrid() {
        AssetPoolGridOptions.userName = userName;
        kendo.culture("zh-CN");
        //初始化Grid表格
        AssetPoolGrid.Init(AssetPoolGridOptions);
        AssetPoolGrid.RunderGrid();
        $("#grid").data('kendoExtGrid').hideColumn("Operation");
    }
    function GetUserOperations(userName) {
        common.ExecuteGetData(false, svcUrl + "CommonExecuteGet?", 'dbo', {
            SPName: 'usp_GetUserOperations', SQLParams: [
                { name: 'AuditorUserName', value: userName, DBType: 'string' }
            ]
        }, function (res) {
            $.each(res, function (i, v) {
                var id = v.ObjectId;
                $('#' + id).prop("checked", true);
                //绑定事件
                $('.checkbox').click(function (e) {
                    var UserSelect = $("#UserSelect").val()
                    var $this = $(this); CreatorName = $this.attr('name');
                    if (CreatorName.toLocaleLowerCase() === UserSelect.toLocaleLowerCase()) {
                        GSDialog.HintWindow('不能为创建人自己的产品配置权限!');
                        e.preventDefault();
                    }
                })
            })
        });
    }
    function GerUserOperationTypeData(userName, OperationId) {
        common.ExecuteGetData(false, svcUrl + "CommonExecuteGet?", 'dbo', {
            SPName: 'usp_GetUserOperationType', SQLParams: [
                { name: 'UserName', value: userName, DBType: 'string' },
                { name: 'OperationTypeId', value: OperationId, DBType: 'int' }
            ]
        }, function (res) {
            $.each(res, function (i, v) {
                var id = v.ObjectId;
                $('#' + id).prop("checked", true);
            })
        });
    }
    function GetOperationPermissionByUserName(userName) {
        //common.ExecuteGetData(false, svcUrl + "CommonExecuteGet?", 'dbo', {
        //    SPName: 'usp_GetOperationPermissionByUserName', SQLParams: [
        //        { name: 'UserName', value: userName, DBType: 'string' }
        //    ]
        //}, function (res) {
        //    //$.each(res, function (i, v) {
        //    //    var id = v.ObjectId;
        //    //    $('#' + id).prop("checked", true);
        //    //})
        //    AssetPoolGrid.RefreshGrid();
        //});
        //AssetPoolGridOptions.
        AssetPoolGridOptions.userName = userName;
        //console.table(AssetPoolGridOptions.dataSourceOptions.otherOptions.executeParam().SQLParams);
        AssetPoolGrid.Init(AssetPoolGridOptions);
        //AssetPoolGrid.RunderGrid();
        AssetPoolGrid.RefreshGrid();
    }
    function NoCheck() {
        $('.checkbox').prop("checked", false);
    }
    $(function () {
        runderGrid();
        //选择用户
        RoleOperate.getAllUsers(function (res) {
            var $userSelects = $('#UserSelects');
            var $userSelect = $('#UserSelect');
            var $UserOperation = $('#UserOperation');
            var option = '';
            $.each(res, function (i, d) {
                option += '<option value="' + d.UserName + '">' + d.UserName + '</option>';
            });
            $userSelects.html(option);
            $userSelect.html(option)
            $userSelects.change(function (e) {
                userName = $(this).val();
                OperationId = $('#UserOperation').val();
                NoCheck();
                //GerUserOperationTypeData(userName, OperationId);
                GetOperationPermissionByUserName(userName)
            });
            //$UserOperation.change(function (e) {
            //    OperationId = $(this).val();
            //    userName = $('#UserSelects').val();
            //    NoCheck();
            //    GerUserOperationTypeData(userName, OperationId)
            //})
            $userSelect.change(function (e) {
                userName = $(this).val();
                NoCheck();
                GetUserOperations(userName);
            });
        });
        var BtnList = $("#BtnList>li");
        var OperationId = '';

        //切换业务审批人和业务操作配置
        BtnList.click(function () {
            var $this = $(this);
            var $thisChildren = $this.children().html().trim();
            if (!($this.hasClass("ConfigBtn"))) {
                $this.addClass("ConfigBtn").siblings().removeClass("ConfigBtn");
                if ($thisChildren == "配置业务审批人") {
                    $("#OperationPersion").addClass("activeOpertion");
                    $("#OperationType").removeClass("activeOpertion");
                    $("#saveOperation").show();
                    $("#saveOperationColfig").hide();
                    $("#grid").data('kendoExtGrid').hideColumn("Operation");
                    var userName = $("#UserSelect").val();
                    NoCheck();
                    GetUserOperations(userName);
                } else {
                    $("#OperationPersion").removeClass("activeOpertion");
                    $("#OperationType").addClass("activeOpertion");
                    $("#saveOperationColfig").show();
                    $("#saveOperation").hide();
                    $("#grid").data('kendoExtGrid').showColumn("Operation");
                    var userName = $("#UserSelects").val();
                    var OperationId = $('#UserOperation').val()?$('#UserOperation').val():null;
                    NoCheck();
                    GetOperationPermissionByUserName(userName)
                }
            }

        })

        //保存业务审批操作
        $('#saveOperation').click(function () {
            if (!userName) {
                GSDialog.HintWindow('请选择审批人!');
                return false;
            }
            userName = $('#UserSelects').val();
            var items = '<items>{0}</items>',
                itemTemplate = '<item><objectType>{0}</objectType><objectId>{1}</objectId></item>',
                item = '';
            $('.checkbox:checked').each(function () {
                (function (v) {
                    var Ary = [];
                    Ary.push($(v).attr("id"))
                    Ary.push($(v).attr("data-bind"))
                    item += itemTemplate.format(Ary[1], Ary[0]);
                })($(this));
            });
            items = items.format(item);
            common.ExecutePostData(true, svcUrl + "CommonExecutePost?", 'dbo', {
                SPName: 'usp_SaveUserOperation', SQLParams: [
                    { name: 'userName', value: userName, DBType: 'string' },
                    { name: 'items', value: items, DBType: 'xml' }
                ]
            });
            GSDialog.HintWindow('保存成功!');
        })
        //保存业务操作配置
        $('#saveOperationColfig').click(function () {
            if (!userName) {
                GSDialog.HintWindow('请选择用户');
                return false;
            }
            userName = $('#UserSelects').val();
            //OperationId = $('#UserOperation').val()

            var items = '<items>{0}</items>',
                itemTemplate = '<item><objectType>{0}</objectType><objectId>{1}</objectId><operationId>{2}</operationId></item>',
                item = '';
            $('.checkbox:checked').each(function () {
                (function (v) {
                    var selectedRow = $(v).closest("tr");
                    var selectedItem = $("#grid").data('kendoExtGrid').dataItem(selectedRow);
                    //var Ary = [];
                    //Ary.push(item.ObjectId)
                    //Ary.push($(v).attr("data-bind"))
                    item += itemTemplate.format(selectedItem.ObjectType, selectedItem.ObjectId, selectedRow.find('select').val());
                })($(this));
            });
            items = items.format(item);
            common.ExecutePostData(true, svcUrl + "CommonExecutePost?", 'dbo', {
                SPName: 'usp_SaveUserOperationType', SQLParams: [
                    { name: 'userName', value: userName, DBType: 'string' },
                    //{ name: 'Operationid', value: OperationId, DBType: 'int' },
                    { name: 'items', value: items, DBType: 'xml' }
                ]
            });
            GSDialog.HintWindow('保存成功!');
        })

        //$('input.checkbox').change(function () {
        //    console.log(this)
        //})


    })



})

