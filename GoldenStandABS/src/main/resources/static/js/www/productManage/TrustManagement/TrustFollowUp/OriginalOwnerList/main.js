define(function (require) {
    var $ = require('jquery');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    require('gs/FilePathConfig');
    var GlobalVariable = require('globalVariable');
    var gsUtil = require('gsUtil');
    var pageList = require('app/productManage/TrustManagement/TrustFollowUp/js/PagerList');

    var PagerListModule = pageList.PagerListModule;
    var listCategory = pageList.listCategory;

    var trustId = gsUtil.getQueryString('tid');

    PagerListModule.Init(listCategory.Originator, 'usp_GetOriginatorsWithPager', trustId,
        GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
        '#divDataList');
    PagerListModule.DataBind(function (haveData) { });

    $('#btnReset').click(function () {
        $('.list-filters .filter').val('');
        PagerListModule.Filter({});
    });
    $('#btnSearch').click(function () {
        PagerListModule.searchWhere();
        PagerListModule.Filter({ 'where': PagerListModule.getWhere() });
    });
    //function searchWhere() {
    //    var filterWhere = getWhere();
    //    PagerListModule.Filter({ 'where': filterWhere });
    //}
    //function getWhere() {
    //    var filterWhere = '';
    //    $('.list-filters .filter').each(function () {
    //        var $this = $(this);
    //        var value = $this.val();
    //        if (!value || value.length < 1) { return true; }

    //        var param = $this.attr('name');
    //        if ($this.hasClass('like')) {
    //            filterWhere += ' and ' + param + ' like N\'%' + value + '%\'';
    //        } else {
    //            filterWhere += ' and ' + param + ' = N\'' + value + '\'';
    //        }
    //    });
    //    return filterWhere;
    //}
    $(function () {
        if (typeof trustId != "undefined" && trustId > 0) {
            $("#btnAddNew").anyDialog({
                width: 900,	// 弹出框内容宽度
                height: 460, // 弹出框内容高度
                title: '原始权益人',	// 弹出框标题
                url: '../OriginalOwner/OriginalOwner.html?tid=' + trustId,
                onClose: function () {
                    //关闭的回调 list 的刷新方法
                    PagerListModule.Filter({});
                }
            });
        }
    });
});