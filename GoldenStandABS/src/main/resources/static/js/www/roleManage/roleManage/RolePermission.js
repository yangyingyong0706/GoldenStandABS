

define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var RoleOperate = require('gs/uiFrame/js/roleOperate');
    require('anyDialog');
    common = require('common');
    webProxy = require('gs/webProxy');
    var GlobalVariable = require('globalVariable');
    //var roleOperate = require('gs/roleOperate')
    require('jquery.ztree.excheck');
    var GSDialog = require("gsAdminPages")
    var RoleNodes = [], tmpCode = [],RoleAppId=[];
    var flag;
    var userName;
    var RoleAllPermission, CurrentRoleAllPermission;
    $(function () {
        roleId = common.getQueryString("roleId");
        flag = common.getQueryString("flag");
        userName = $.cookie('gs_UserName');

        //树插件配置
        function zTreeObj() {
            var treeDomId, $mySelfDom, $menuContent,treeObj;
            // zTree 的参数配置
            var setting = {
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: { "Y": "ps", "N": "ps" }//父级子级相互联系
                },
                data: {
                    simpleData: {
                        enable: true,
                    }
                }
            };

            function GetCheckedAll(treeDemoId) {
                treeObj = $.fn.zTree.getZTreeObj(treeDemoId);
                var nodes = treeObj.getCheckedNodes(true);
                return nodes
            }
           
            function init(treeDemoId, zNodes) {
                $.fn.zTree.init($("#" + treeDemoId), setting, zNodes);
            }
            return {
                Init: init,
                GetCheckedAll: GetCheckedAll,
            }
        }

        //实例化zTree
        var $tree = new zTreeObj();

        //数组排序
        function sortData(datalist, column, ascOrDesc) {
            ascOrDesc = ascOrDesc ? ascOrDesc : 'asc';
            ascOrDesc = ascOrDesc == 'asc' ? [1, -1] : [-1, 1];
            datalist = datalist.sort(function (b, a) {
                return a[column] > b[column] ? ascOrDesc[0] : ascOrDesc[1];
            });
        }

        //用户所有可配置资源
        function GetRoleAllPermission() {
            var App = '';
            var parameterDatas = [
                ["UserInRoleId", roleId, "string"]
            ]
            var svcUrls = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=QuickFrame&appDomain=QuickFrame&executeParams=";
            var promise = webProxy.comGetData(parameterDatas, svcUrls, 'usp_GetRoleAllPermission');
            promise().then(function (response) {
                App = JSON.parse(response);
            });
            return App
        }
        //生成树
        function InitTree() {
            var GetRoleAllData = GetRoleAllPermission();
            console.log(GetRoleAllData)
            $.each(GetRoleAllData, function (i, n) {
                RoleNodes.push({ id: n.id, pId: n.pId, name: n.name,checked:n.checked,level:n.lvl });
            })
            $tree.Init('treeDemo', RoleNodes);
        }
        InitTree();
        
        //保存
        $("#SavePermission").click(function () {
            var AppName = $tree.GetCheckedAll('treeDemo');
            var items = '<items>{0}</items>',
                itemTemplate = '<item><Id>{0}</Id><level>{1}</level><pId>{2}</pId><name>{3}</name><roleId>{4}</roleId></item>',
                item = '';
            $.each(AppName, function (i, v) {
                (function (v) {
                    item += itemTemplate.format(v.id, v.level+1, v.pId, v.name, roleId);
                }(v))
            })
            items = items.format(item);
            items = encodeURIComponent(items)
            RoleOperate.SavePermission(items, callback)
            function callback(r) {
                if (r == 0) {
                    GSDialog.HintWindow("配置成功")
                }
            }
            
        })

    });

})
