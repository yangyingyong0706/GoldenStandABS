define(function (require) {
    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    require('jquery.ztree.core');
    require('jquery.ztree.excheck');
    var common = require('gs/uiFrame/js/common');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');

    var webProxy = require('webProxy');
    var setting = {
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        }
    };

    $(function () {
        trustId = common.getQueryString('tid');
        getData();

        $("#btnUpdate").click(function () { update(); });
        $("#btnValidityCheck").click(function () { validityCheck(); });
        $("#btnDownLoadPackage").click(function () { downLoadPackage(); });
    });

    function update() {
        var v = webProxy.Verif('NameShort', trustId);
        if (!v) {
            GSDialog.HintWindow('请设置专项计划简称');
            return false;
        };

        //



        var htmlurl = GlobalVariable.TrustManagementServiceHostURL + '/productManage/TrustManagement/documentManagement/EditCatalog.html';
        GSDialog.topOpen('编辑目录', htmlurl, null, function (res) {
        }, 800, 500, null, true, true, true, false);
    }

    function getData() {
        var serviceUrl = GlobalVariable.DocumentServiceUrl + "GetLastData";
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: null,
            success: function (data) {

                var zNodes = [];
                if (data != null && data != undefined) {
                    $.each(data, function (i, key) {
                        zNodes.push({ id: key.CatalogCode, pId: key.ParentCode, name: key.CatalogName, open: true });
                    });
                }
                $.fn.zTree.init($("#treeDemo"), setting, zNodes);
            },
            error: function (response) {
                GSDialog.HintWindow(response.statusText);
            }
        });

    }

    function validityCheck() {

        var v = webProxy.Verif('NameShort', trustId);
        if (!v) {
            GSDialog.HintWindow('请设置专项计划简称');
            return false;
        };

        //

        var serviceUrl = GlobalVariable.DocumentServiceUrl + "VlidaityAllCheck";
        $.ajax({
            async: false,
            url: serviceUrl,
            dataType: "json",
            success: function (data) {
                if (data != null && data != undefined) {
                    if (data.Status == 0) {
                        var zipPath = GlobalVariable.TrustManagementService + "/TrustFiles/Compress/" + data.Data + "";
                        window.location.href = zipPath;
                    } else {
                        GSDialog.HintWindow(data.ErrorMessage);
                    }
                }
            },
            error: function (response) {
                GSDialog.HintWindow(response.statusText, 1);
            }
        });
    }

    var selectedName = [];

    function downLoadPackage() {

        var v = webProxy.Verif('NameShort', trustId);
        if (!v) {
            GSDialog.HintWindow('请设置专项计划简称');
            return false;
        };

        //
        selectedName = [];
        var selectedNodes = [];
        var treeObject = $.fn.zTree.getZTreeObj("treeDemo");
        if (treeObject != undefined && treeObject != null) {
            var nodes = treeObject.getNodesByFilter(filter, false);
            if (nodes != undefined && nodes != null) {
                getMinSelectedNode(nodes, selectedName);
                $.each(selectedName, function (i, k) {
                    var exist = $.inArray(k, selectedNodes);
                    if (exist < 0)
                        selectedNodes.push(k);
                });
            }
        }
        if (selectedNodes.length == 0) {
            GSDialog.HintWindow("请选择至少一个节点");
            return;
        }
        var serviceUrl = GlobalVariable.DocumentServiceUrl + "MulTrustsZip?nodes=" + encodeURI(selectedNodes) + "";
        $.ajax({
            url: serviceUrl,
            dataType: "json",
            success: function (data) {
                if (data != null & data != "" && data != undefined) {
                    if (data.Status == 0) {
                        var zipPath = GlobalVariable.TrustManagementService + "/TrustFiles/Compress/" + data.Data + "";
                        window.location.href = zipPath;
                    } else {
                        GSDialog.HintWindow(data.ErrorMessage);
                    }
                }
            },
            error: function (response) {
                GSDialog.HintWindow(response.statusText, 1);
            }
        });
    }

    function filter(node) {
        return (node.checked == true && node.level == 0);
    }

    function getMinSelectedNode(nodes) {
        if (nodes == null) return "";
        for (var i = 0; i < nodes.length; i++) {
            var selected = nodes[i].checked
            if (selected == true) {
                if (nodes[i].children == undefined) {
                    var nodeName = nodes[i].name;
                    selectedName.push(nodeName.substr(0, nodeName.indexOf('.')));
                }
                if (nodes[i].children != undefined)
                    getMinSelectedNode(nodes[i].children);
            }
        }
    }

});