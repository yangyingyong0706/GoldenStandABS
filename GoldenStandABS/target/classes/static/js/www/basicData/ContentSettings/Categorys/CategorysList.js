/// <reference path="../../TrustWizard/Scripts/jquery-1.7.2.min.js" />
/// <reference path="jquery.datagrid.js" />
/// <reference path="jquery.datagrid.options.js" />
/// <reference path="../../TrustWizard/Scripts/common.js" />
define(function (require) {
    var $ = require('jquery');
    require('jquery.datagrid');
    require('jquery.datagrid.options');
    var common = require('common');
    var GlobalVariable = require('globalVariable');
    require('jquery.ztree.core');
    require('jquery.ztree.excheck');
    require('jquery.ztree.exedit');
    var ItemListModel = require('app/basicData/ContentSettings/Items/ItemList');

    var trustId = common.getQueryString('tid');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var self = this;

    var listCategory = {
        Originator: 'Originator'//原始权益人列表
    };
    var displayColumns = {
        Originator: [
            {
                field: "CategoryCode", title: "编码", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "CategoryValue", title: "值", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            { field: "SequenceNo", title: "顺序号", sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd },
            {
                field: "", title: "操作", sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd,
                render: function (data) {
                    var html = '<a style="cursor:pointer" onclick="self.PagerListModule.Edit(' + data.row.CategoryId + ');"><i class="icon icon-edit btn btn-link"></i></a>';
                    html += '&nbsp; <a style="cursor:pointer" onclick="self.PagerListModule.Del(' + data.row.CategoryId + ');"><i class="fa fa-trash-o btn btn-link"></i></a>';
                    return html;
                }
            }    
        ]
    };

    var PagerListModule = function () {
        var listCate, spName, trustId, svcUrl, $dtGrid;

        var initArgs = function (cate, sp, tId, url, continerId) {
            listCate = cate;
            spName = sp;
            trustId = tId,
            svcUrl = url;
            $dtGrid = $(continerId);
        };

        var dataBind = function (fnCallBack) {
            $dtGrid.datagrid({
                source: function () {
                    var params = this.params();
                    return syncGetRemoteData(params)
                },
                col: displayColumns[listCate],
                attr: 'mytable',
                paramsDefault: { paging: 30 },
                noData: "<p class='noData'>当前视图没有可显示记录。</p>",
                pagerPosition: "bottom",
                pager: "mypager",
                sorter: "mysorter",
                /*onBefore: function() {
          
                },
                onData: function() {
          
                },
                onRowData: function(data) {
          
                },*/
                onComplete: function () {
                    $(".mytable").on("click", ".table-td", function () {
                        $(".mytable .table-td").removeClass("active");
                        $(this).addClass("active");
                    });

                    if (fnCallBack) { fnCallBack(this.settings.recordCount); }
                }
            });
        };
        var syncGetRemoteData = function (gridParams) {
            var executeParam = { SPName: spName, SQLParams: [] };

            var start = (gridParams.page - 1) * gridParams.paging + 1;
            var end = gridParams.page * gridParams.paging;
            //TrustManagement.tblAssetDetails
            executeParam.SQLParams.push({ Name: 'tableName', Value: 'TrustManagement.ItemCategory', DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : 'CategoryId', DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'direction', Value: (gridParams.direction) ? gridParams.direction : null, DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'where', Value: ((gridParams.where) ? gridParams.where : ''), DBType: 'string' });

            var executeParams = encodeURIComponent(JSON.stringify(executeParam));

            var sourceData = { total: 0, data: [] };
            $.ajax({
                cache: false,
                type: "GET",
                async: false,
                url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=DatagridDataSource',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }
                },
                error: function (response) { alert('Error occursed while requiring the remote source data!'); }
            });
            return sourceData;
        };

        var filterData = function (filters) {
            $dtGrid.datagrid('reset');
            $dtGrid.datagrid("fetch", filters);
        };

        var fetchMetaData = function (executeParams, fnCallBack) {
            var executeParams = encodeURIComponent(JSON.stringify(executeParams));
            $.ajax({
                cache: false,
                type: "GET",
                url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=Common',
                dataType: "json",
                contentType: "application/xml;charset=utf-8",
                data: {},
                success: function (response) {
                    if (typeof response === 'string') { sourceData = JSON.parse(response); }
                    else { sourceData = response; }

                    if (fnCallBack) { fnCallBack(sourceData); }
                },
                error: function (response) { alert('Error occursed when fetch the filter metadata!'); }
            });
        };

        function edit(id) {
            $.anyDialog({
                width: 900,	// 弹出框内容宽度
                height: 500, // 弹出框内容高度
                title: '任务设置',	// 弹出框标题
                url: './SystemSettings/TrustTaskConfig.html?id=' + id,
                onClose: function () {
                    //关闭的回调 list 的刷新方法
                    //searchByWhere();
                }
            });
        }
        function del(id) {
            if (confirm("确定删除？")) {
                var executeParam = {
                    SPName: 'usp_DeleteTrustTaskConfig', SQLParams: [
                        { Name: 'id', value: id, DBType: 'int' }
                    ]
                };
                fetchMetaData(executeParam, function (result) {
                    if (result[0].Result) {
                        searchByWhere();
                        //alert('删除成功！');
                    } else {
                        alert('删除数据时出现错误！');
                    }
                });
            }
        }

        return {
            Init: initArgs,
            DataBind: dataBind,
            Filter: filterData,
            FetchMetaData: fetchMetaData,
            Edit: edit,
            Del: del
        };

    }();

    function getCategoryData() {
        var executeParam = { SPName: 'usp_GetListWithPager', SQLParams: [] };

        //TrustManagement.tblAssetDetails
        executeParam.SQLParams.push({ Name: 'tableName', Value: 'TrustManagement.ItemCategory', DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'start', Value: 0, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'end', Value: 100, DBType: 'int' });
        executeParam.SQLParams.push({ Name: 'orderby', Value: 'CategoryId', DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'direction', Value: null, DBType: 'string' });
        executeParam.SQLParams.push({ Name: 'where', Value: '', DBType: 'string' });
        var executeParams = encodeURIComponent(JSON.stringify(executeParam));

        var sourceData = [];
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl + 'appDomain=TrustManagement&executeParams=' + executeParams + '&resultType=common',
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                if (typeof response === 'string') { sourceData = JSON.parse(response); }
                else { sourceData = response; }
            },
            error: function (response) { alert('Error occursed while requiring the remote source data!'); }
        });
        return sourceData;
    }

    function searchByWhere() {
        var filterWhere = '';
        $('.list-filters .filter').each(function () {
            var $this = $(this);
            var value = $this.val();
            if (value.length < 1) { return true; }

            var param = $this.attr('name');
            if ($this.hasClass('like')) {
                filterWhere += ' and ' + param + ' like N\'%' + value + '%\'';
            } else {
                filterWhere += ' and ' + param + ' = N\'' + value + '\'';
            }
        });
        PagerListModule.Filter({ 'where': filterWhere });
    }

    var setting = {
        edit: {
            enable: true,
            showRemoveBtn: false,
            showRenameBtn: false
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            beforeClick: beforeClick,
            onClick: onClick,
            beforeRemove: beforeRemove,
            onRemove: onRemove,
            onRightClick: OnRightClick
        }
    };



    function beforeClick(treeId, treeNode, clickFlag) {
        return true;
    }

    function onClick(event, treeId, treeNode) {
        ItemListModel.InitData(treeNode.CategoryId);
    }
    function removeTreeNode() {
        hideRMenu();
        var nodes = zTree.getSelectedNodes();
        if (nodes && nodes.length > 0) {
            if (confirm("确定删除分类及其所有内容么？")) {
                var delNode = nodes[0];
                var executeParam = {
                    SPName: 'usp_DeleteCategoryById', SQLParams: [
                           { Name: 'CategoryId', value: delNode.CategoryId, DBType: 'int' }
                    ]
                };
                ExecuteGetData(true, svcUrl, "TrustManagement", executeParam, function (data) {
                    if (data[0].Result == 1) {
                        zTree = $.fn.zTree.getZTreeObj("treeDemo");
                        bindTree();
                        var node = zTree.getNodeByParam('id', treeNodes.length);
                        zTree.selectNode(node);//选择点  
                        zTree.setting.callback.onClick(null, zTree.setting.treeId, node);//调用事件
                    }
                });
            }
        }
    }


    function beforeRemove(treeId, treeNode) {
        if (confirm("确定删除分类及其所有内容么？")) {
            return true;
        }
        else {
            return false;
        }
    }

    function onRemove(event, treeId, treeNode) {
        var executeParam = {
            SPName: 'usp_DeleteCategoryById', SQLParams: [
                   { Name: 'CategoryId', value: treeNode.CategoryId, DBType: 'int' }
            ]
        };
        ExecuteGetData(true, svcUrl, "TrustManagement", executeParam, function (data) {
            if (data[0].Result == 1) {
                zTree = $.fn.zTree.getZTreeObj("treeDemo");
                bindTree();
                var node = zTree.getNodeByParam('id', treeNodes.length);
                zTree.selectNode(node);//选择点  
                zTree.setting.callback.onClick(null, zTree.setting.treeId, node);//调用事件
            }
        });
    }

    function showCode(str) {
        var code = $("#code");
        code.empty();
        for (var i = 0, l = str.length; i < l; i++) {
            code.append("<li>" + str[i] + "</li>");
        }
    }

    var treeNodes = [];
    function bindTree() {
        var data = getCategoryData();
        var i = 1;
        treeNodes = [];
        $.each(data, function (index, ele) {
            treeNodes.push({ id: i, pId: 0, name: ele.CategoryValue, CategoryId: ele.CategoryId, CategoryCode: ele.CategoryCode });
            i++;
        });
        $.fn.zTree.init($("#treeDemo"), setting, treeNodes);
    }

    function InitTree() {
        bindTree();
        zTree = $.fn.zTree.getZTreeObj("treeDemo");//获取ztree对象  
        var node = zTree.getNodeByParam('id', 1);//获取id为1的点  
        zTree.selectNode(node);//选择点  
        zTree.setting.callback.onClick(null, zTree.setting.treeId, node);//调用事件
    }

    var treeObj;
    var zTree;
    var rMenu;
    $(function () {

        InitTree()
        rMenu = $("#rMenu");
        $("#addbtn").anyDialog({
            width: 900,	// 弹出框内容宽度
            height: 430, // 弹出框内容高度
            title: '类型设置',	// 弹出框标题
            url: './CategoryDetail.html?random=' + Math.random(),
            onClose: function () {
                //关闭的回调 list 的刷新方             
            },
            scrolling: false
        });
    });

    function OnRightClick(event, treeId, treeNode) {
        if (treeNode) {
            zTree.selectNode(treeNode);
            showRMenu("node", event.clientX, event.clientY);
        }
    }

    function showRMenu(type, x, y) {
        $("#rMenu ul").show();
        if (type == "root") {
            $("#m_del").hide();
            //$("#m_check").hide();
            //$("#m_unCheck").hide();
        } else {
            $("#m_del").show();
            //$("#m_check").show();
            //$("#m_unCheck").show();
        }
        rMenu.css({ "top": y + "px", "left": x + "px", "visibility": "visible" });

        $("body").bind("mousedown", onBodyMouseDown);
    }
    function hideRMenu() {
        if (rMenu) rMenu.css({ "visibility": "hidden" });
        $("body").unbind("mousedown", onBodyMouseDown);
    }
    function onBodyMouseDown(event) {
        if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length > 0)) {
            rMenu.css({ "visibility": "hidden" });
        }
    }
});
