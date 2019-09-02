define(function (require) {
    var $ = require('jquery'), common = require('common'), globalVariable = require('globalVariable'), webStorage = require('gs/webStorage');
    var svcUrl = globalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    var nodeData = {};

    var permissionProxy = {
        saveOperateHistory: function (trustId, userId, routeId, operate, currentNode, callback) {
            var paraminfo = {
                SPName: "usp_Workflow_OperateHistory", SQLParams: [
                    { Name: 'TrustId', value: trustId, DBType: 'int' },
                    { Name: 'UserId', value: userId, DBType: 'string' },
                    { Name: 'RouteId', value: routeId, DBType: 'int' },
                    { Name: 'Operate', value: operate, DBType: 'string' },
                    { Name: 'CurrentNode', value: currentNode, DBType: 'int' }
                ]
            };
            common.ExecuteGetData(true, svcUrl, 'TrustManagement', paraminfo, function (data) {
                callback && callback(data)
            })
        },
        checkOperatePermission: function (workflowId, moduleId, elementList, callback) {
            var paraminfo = {
                SPName: "usp_Workflow_CheckPermission", SQLParams: [
                    { Name: 'WorkflowId', value: workflowId, DBType: 'int' },
                    { Name: 'ModuleId', value: moduleId, DBType: 'int' },
                    { Name: 'ElementList', value: elementList, DBType: 'string' }
                ]
            };
            common.ExecuteGetData(true, svcUrl, 'TrustManagement', paraminfo, function (data) {
                var result = {};
                if (data.length > 0) {
                    var arry = elementList.split(',');
                    $.each(arry, function (i, v) {
                        result[v] = 0;
                        $.each(data, function (j, vl) {
                            if (v === vl.ItemValue)
                                result[v] = 1;
                        });
                    });
                }
                nodeData = data;
                callback && callback(data, result)
            })
        },
        getNodeName: function (status) {
            var nodeName = "";
            status = status != '' ? parseInt(status) : 1;
            $.each(nodeData, function (i, v) {
                if (v.NodeId === status) {
                    nodeName = v.NodeName;
                    return nodeName;
                }
                if (v.NextNodeId === status) {
                    nodeName = v.NextNodeName;
                    return nodeName;
                }
            });
            return nodeName;
        },
        getNode: function (element, operate, node) {
            var currentNode = {};
            $.each(nodeData, function (i, v) {
                if (v.ItemValue === element && v.Operate === operate && v.NodeId === node) {
                    currentNode = v;
                }
            });
            return currentNode;
        }
    }
    return permissionProxy;
});