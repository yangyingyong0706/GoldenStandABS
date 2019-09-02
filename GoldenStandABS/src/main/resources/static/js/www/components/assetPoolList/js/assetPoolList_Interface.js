/// <reference path="../../../assetFilter/html/BasePoolContent.html" />
var lang = {};
define(function (require) {
    var webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');

    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.name = 'Asset pool list_'

    } else {
        lang.name = '资产池_'
    }
})


function TranToPoolPage(PoolId, PoolName) {
    //var html = '<a href="../../assetFilter/html/BasePoolContent.html?PoolId={0}&PoolName={1}">{1}</a>'.format(PoolId, PoolName);
    var html = '<a href="javascript:addAssetPoolItem({0},\'{1}\');">{1}</a>'.format(PoolId, PoolName);
    return html;
}

function TranToPoolPagehide(PoolId, PoolName) {
    //var html = '<a href="../../assetFilter/html/BasePoolContent.html?PoolId={0}&PoolName={1}">{1}</a>'.format(PoolId, PoolName);
    var html = '<a href="javascript:addAssetPoolItemhd({0},\'{1}\');">{1}</a>'.format(PoolId, PoolName);
    return html;
}

function addAssetPoolItem(PoolId, PoolName) {
    var pass = true;
    parent.viewModel.tabs().forEach(function (v, i) {
        if (PoolId == v.id) {
            pass = false;
            parent.viewModel.changeShowId(v);
            return false;
        }
    })
    if (pass) {
        var url = "../../www/assetFilter/basePoolContentKendo/basePoolContent.html?PoolId=" + PoolId + "&PoolName=" + PoolName;
        var newTab = {
            name: lang.name + PoolId,
            id: PoolId,
            url: url,
            disabledClose: false
        };
        parent.viewModel.tabs.push(newTab)
        parent.viewModel.changeShowId(newTab);
    }
    
    $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
    $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
}

function addAssetPoolItemhd(PoolId, PoolName) {
    var pass = true;
    parent.viewModel.tabs().forEach(function (v, i) {
        if (PoolId == v.id) {
            pass = false;
            parent.viewModel.changeShowId(v);
            return false;
        }
    })
    if (pass) {
        var url = "../../www/assetFilter/basePoolContentKendo/basePoolContent.html?PoolId=" + PoolId + "&PoolName=" + PoolName + "&hidbt=1";
        var newTab = {
            name: lang.name + PoolId,
            id: PoolId,
            url: url,
            disabledClose: false
        };
        parent.viewModel.tabs.push(newTab)
        parent.viewModel.changeShowId(newTab);
    }

    $('.chrome-tabs-shell', parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
    $('.chrome-tabs-shell', parent.document).find('.active').addClass('chrome-tab-current');
}

function TransStatus(PoolStatusId) {
    var status;
    switch (PoolStatusId) {
        case 148:
            status = 'OPEN';
            break;
        case 149:
            status = 'INVALID';
            break;
        case 150:
            status = 'RESERVE'+"<i style='padding-left:3px' class='fa fa-lock'><i>";
            break;
        case 151:
            status = 'PUBLISH';
            break;
        default:
            status = '';
            break;
    }
    return status;
}

function getStringDate(strDate) {
    //var str = '/Date(1408464000000)/';
    if (!strDate) {
        return '';
    }
    var str = strDate.replace(new RegExp('\/', 'gm'), '');
    return eval('new ' + str);
}

function getPoolHeader() {
    var grid = $("#grid").data("kendoExtGrid");
    if (grid.select().length != 2) {
        GSDialog.HintWindow('请选择要操作的资产池');
    } else {
        //var dataRows = grid.items();
        //// 获取行号
        //var rowIndex = dataRows.index(grid.select());
        // 获取行对象
        var data = grid.dataItem(grid.select());
        return data;
    }
}


function getCheckedPoolId() {
    //var $selectedItem=$('#divDataList input.datalist-item:checked');
    var Pool = getPoolHeader();
    //if (!$selectedItem || $selectedItem.length == 0) {
    //    alert('请选择需要操作的资产池！');
    //    return null;
    //}

    //var htmlPoolHeader = decodeURIComponent($selectedItem.attr('poolHeader'));

    if (!Pool) return;

    return Pool.PoolId;
}

function ProductDesign() {
    return getCheckedPoolId();
}



