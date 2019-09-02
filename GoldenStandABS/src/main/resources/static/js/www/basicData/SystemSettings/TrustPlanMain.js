define(function (require) {
    var $ = require('jquery');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');

    require('gs/globalVariable');
    var GSAdmin = require('gs/uiFrame/js/gs-admin-2');
    require('app/components/trustList/js/wcfProxy');
    require("kendomessagescn");
    require("kendoculturezhCN");
    require('app/components/trustList/js/trustList_Interface');
    GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var tm = require('gs/childTabModel');
    var GlobalVariable = require('gs/globalVariable');
    var webStorage = require("gs/webStorage");
    var userName = webStorage.getItem('gs_UserName');
    var appName = webStorage.getItem('showId');
    var common = require('common');
    var enter = common.getQueryString('enter');
    var ProjectId = common.getQueryString('ProjectId');
    var other = common.getQueryString('other');

    var state = common.getQueryString("state");
    window.state = state;
    webProxy = require('gs/webProxy');
    require('jquery.localizationTool');
    require('bootstrap');


    $('body').show();

    var lang = {};
    var userLanguage = webStorage.getItem('userLanguage');
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        //lang.filter = "and SpecialPlanState = N'designing'";
        lang.approveprocess = "Approval Process";
        lang.published = 'published';
        lang.ApplyForModification = '")>Apply For Modification</button>';
        lang.approving = "<span>Approving</span>";
        lang.approved = "<span>Approved</span>";
        lang.Reject = '<span>Reject</span>';
        lang.ProductManagement = 'Product Management';
        lang.ProductID = 'Product ID';
        lang.ProductName = 'Product Name';
        lang.ProductDescription = 'Product Description';
        lang.ProductStatus = 'Product Status';
        lang.Organisation = 'Organisation';
        lang.AssetType = 'Asset Type';
        lang.Creator = 'Creator';
        lang.Handle = 'Handle';
        lang.HandleStatus = 'Handle Status';
        lang.CreatedTime = 'Created date';

    }
    else {
        //lang.filter = "and SpecialPlanState = N'设计中'";
        lang.filter = "and (userName = '" + userName + "' or IsCheck=0)";
        lang.approveprocess = "审批流程";
        lang.published = '已发行';
        lang.ApplyForModification = '")>申请修改</button>';
        lang.approving = "<span>待审核</span>";
        lang.approved = "<span>已审</span>";
        lang.Reject = '<span>驳回</span>';
        lang.ProductManagement = '产品管理';
        lang.ProductID = '产品ID';
        lang.ProductName = '产品名称';
        lang.ProductDescription = '产品描述';
        lang.ProductStatus = '产品状态';
        lang.Organisation = '资产来源';
        lang.AssetType = '资产类型';
        lang.Creator = '创建人';
        lang.Handle = '操作';
        lang.HandleStatus = '操作状态';
        lang.CreatedTime = '创建日期';

    }

    var filter = (IsAdministrator == '1') ? " " : lang.filter;
    var height = $(window).height() - 85;
    var kendouiGrid = new kendoGridModel(height);

    this.SetCheckBox = function (IsReserved) {
        var checkedAttr = IsReserved ? ' checked="checked" ' : '';
        var html = '<input type="checkbox" "' + checkedAttr + '" class="IsReserved" onclick="selectCurrent(this)"/>';
        return html;
    };

    this.SetReserveDays = function (TrustId, TrustCode, TrustName, IsReserved, days) {
        var disabledAttr = !IsReserved ? ' disabled="disabled" ' : '';
        var inputValue = days?days:'';

        var html = '<input type="text" value="' + inputValue + '" data-trustId="' + TrustId + '" data-trustCode="' + TrustCode + '" data-trustName="' + TrustName + '" class="reserveDays" onblur="checkInput(this)" "' + disabledAttr + '"/>'
        return html;
    };

    var SQLParams = [
            { Name: 'UserName', Value: userName, DBType: 'string' }
    ];
    var SPName = 'usp_GetTrustListDataForReserve';
    var orderby = 'TrustId';
    var direction = 'desc';
    var columns = [
                {
                    title: "",
                    width: '60px',
                    headerTemplate: function () {
                        var t = '<input type="checkbox" id="checkAll" onclick="selectAll(this)""/>';
                        return t
                    },
                    template: "#=SetCheckBox(IsReserved)#",
                    locked: true
                },

               {
                   title: "",
                   width: '100px',
                   headerTemplate: function () {
                       var t = '保留天数';
                       return t
                   },
                   template: "#=SetReserveDays(TrustId,TrustCode,TrustName,IsReserved,DaysLaterBeDeleted)#",
                   locked: true
               },
            { field: "TrustId", title: lang.ProductID, width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "TrustCode", title: lang.ProductName, width: "250px" },
            { field: "TrustName", title: lang.ProductDescription, width: "280px" },
            { field: "CreatedTime", title: lang.CreatedTime, width: "120px" },
            { field: "UserName", title: lang.Creator, width: "130px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } }
    ];



    var AssetAggregationStatsForTrust = new kendoGridModel(height);

    var CashFlowPoolListOptions = {
        renderOptions: {
            columns: columns
        }
           , dataSourceOptions: {
               pageSize: 20
               , otherOptions: {
                   orderby: orderby
                   , direction: direction
                    , DBName: 'TrustManagement'
                    , appDomain: 'TrustManagement'
                   , executeParamType: 'extend'
                    , defaultfilter: filter
                   , executeParam: function () {
                       var result = {
                           SPName: SPName,
                           SQLParams: SQLParams
                       };
                       return result;
                   }
               }
           },
    }

    //全选框
    selectAll = function (that) {

        var arry = $(".IsReserved");
        var isCheckAll = $("#checkAll").is(':checked');
        var checkedAttr = isCheckAll ? ' checked="checked" ' : '';
        if (isCheckAll) {
            $.each(arry, function (i, v) {
                $(v).prop("checked", isCheckAll);
                $(v).parent().parent().children().find('.reserveDays').removeAttr("disabled").val(1);
            })

        } else {
            $.each(arry, function (i, v) {
                $(v).prop("checked", isCheckAll);
                $(v).parent().parent().children().find('.reserveDays').attr("disabled", "disabled").val('');
            })
        }

        refreshAllCheck();

    }

    selectCurrent = function (ck) {
        var that = ck;
        var ischecked = $(that).prop("checked");
        var txtReserveDays = $(that).parent().parent().find('.reserveDays');
        if (ischecked) {
            txtReserveDays.removeAttr("disabled");
        } else {
            txtReserveDays.attr("disabled", "disabled");
            txtReserveDays.val('');
            txtReserveDays.removeClass('require');
        }

        refreshAllCheck();
    }

    refreshAllCheck = function myfunction() {
        var arry = $(".IsReserved");
        var allChecked = true;
        $.each(arry, function (i, v) {
            if (!$(v).prop("checked")) {
                allChecked = false;
            }
        })

        $("#checkAll").prop("checked", allChecked);
    }

    //校验输入的保留天数是否合法
    checkInput = function (ip) {
        var that = $(ip);
        var reg = /^[1-9]\d*$/;//正整数
        if (!reg.test(that.val())) {
            that.val('');
        }
    }


    $(function () {

        //Render the grid
        AssetAggregationStatsForTrust.Init(CashFlowPoolListOptions);
        AssetAggregationStatsForTrust.RunderGrid();

        //save data 
        $('.btnSave').click(function () {
            var btn = $(this);
            var reserveList = $('.reserveDays');
            var pass = true;
            var plans = [];
            $.each(reserveList, function (i, v) {
                var isChecked = $(v).parent().parent().find('.IsReserved').prop("checked");
                var trustId = $(v).attr('data-trustId');
                var trustCode = $(v).attr('data-trustCode');
                var trustName = $(v).attr('data-trustName');
                var days = $(v).val();

                if (isChecked && !days) {
                    pass = false;
                    $(v).addClass('require');
                } else {
                    $(v).removeClass('require');
                    plans.push({ TrustId: trustId, TrustCode: trustCode, TrustName: trustName, Delete: isChecked, DaysLaterBeDeleted: days })
                }
            })

            if (pass) {
                btn.text('保存中...').prop("disabled", true);
                $.ajax({
                    type: "get",
                    url: GlobalVariable.DataProcessServiceUrl + 'ReservedTrusts?connectionName=TrustManagement&plans=' + JSON.stringify(plans),
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    success: function (data) {
                        btn.text('保存').prop("disabled", false);
                        if (data) {
                            GSDialog.HintWindow('保存成功');
                        } else {
                            GSDialog.HintWindow('保存失败');
                        }
                    },
                    error: function (data) {
                        GSDialog.HintWindow('服务器异常，请重试！');
                        btn.text('保存').prop("disabled", false);
                    }
                });
            }

        });


    });

});