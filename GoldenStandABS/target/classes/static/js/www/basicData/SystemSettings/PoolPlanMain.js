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

    var userLanguage = webStorage.getItem('userLanguage');
    var IsAdministrator = webStorage.getItem("IsAdministrator");//判断用户是否为管理员


    var filter = (IsAdministrator == '1') ? " " : lang.filter;
    var height = $(window).height() - 85;
    var kendouiGrid = new kendoGridModel(height);

    this.SetCheckBox = function (IsReserved) {
        var checkedAttr = IsReserved ? ' checked="checked" ' : '';
        var html = '<input type="checkbox" "' + checkedAttr + '" class="IsReserved" onclick="selectCurrent(this)"/>';
        return html;
    };

    this.SetReserveDays = function (PoolId, PoolDescription, PoolDBName, IsReserved, days) {
        var disabledAttr = !IsReserved ? ' disabled="disabled" ' : '';
        var inputValue = days ? days : '';

        var html = '<input type="text"  value="' + inputValue + '" data-PoolId="' + PoolId + '" data-PoolDescription="' + PoolDescription + '" data-PoolDBName="' + PoolDBName + '" class="reserveDays" onblur="checkInput(this)" "' + disabledAttr + '"/>'
        return html;
    };


    var SPName = 'usp_GetPoolListDataForReserve';
    var orderby = 'PoolId';
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
                   template: "#=SetReserveDays(PoolId,PoolDescription,PoolDBName,IsReserved,DaysLaterBeDeleted)#",
                   locked: true
               },
            { field: "PoolId", title: '资产池ID', width: "100px", attributes: { style: 'text-align:left' }, headerAttributes: { style: 'text-align:left' } },
            { field: "PoolDescription", title: '资产池名', width: "200px" },
            { field: "PoolDBName", title: '资产池库', width: "200px" },
            { field: "TrustCode", title: '隶属产品', width: "250px" },
            { field: "CreatedDate", title: '创建日期', width: "120px" }
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
                           SPName: SPName
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
                var PoolId = $(v).attr('data-PoolId');
                var PoolDescription = $(v).attr('data-PoolDescription');
                var PoolDBName = $(v).attr('data-PoolDBName');
                var days = $(v).val();

                if (isChecked && !days) {
                    pass = false;
                    $(v).addClass('require');
                } else {
                    $(v).removeClass('require');
                    plans.push({ PoolId: PoolId, PoolDescription: PoolDescription, PoolDBName: PoolDBName, Delete: isChecked, DaysLaterBeDeleted: days })
                }
            })


            if (pass) {
                btn.text('保存中...').prop("disabled", true);
                $.ajax({
                    type: "get",
                    url: GlobalVariable.DataProcessServiceUrl + 'ReservedPools?connectionName=TrustManagement&plans=' + JSON.stringify(plans),
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