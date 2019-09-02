define(function (require) {
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    //插入用户的操作记录
    insertActlogs = function (async, userName, act, category, description, ip, srcPage, desPage) {
        var executeParam = {
            SPName: 'QuickFrame.usp_InsertSystemActLogs', SQLParams: [
            { Name: 'UserName', value: userName, DBType: 'string' },
            { Name: 'Act', value: act, DBType: 'string' },
            { Name: 'Category', value: category, DBType: 'string' },
            { Name: 'Description', value: description, DBType: 'string' },
            { Name: 'IPAddress', value: ip, DBType: 'string' },
            { Name: 'SourcePage', value: srcPage, DBType: 'string' },
            { Name: 'destinationPage', value: desPage, DBType: 'string' }
            ]
        }
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?';

        common.ExecuteGetData(async, svcUrl, 'QuickFrame', executeParam);
    }
    return {
        insertActlogs:insertActlogs
    }
});