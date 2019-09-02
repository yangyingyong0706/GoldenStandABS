


define(function (require) {
    var $ = require('jquery');
    require('PagerList');
    var common = require('gs/uiFrame/js/common');
    var GlobalVariable = require('globalVariable');


    //loading data
    var trustId = common.getQueryString("trustId");
    var isPlanWord = common.getQueryString("isPlanWord");
    PagerListModule.Init(listCategory.DiffWordHistory, '[TrustManagement].[GetDiffWordHistory]', trustId, 0, isPlanWord,
        GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
        '#divDataList');
    PagerListModule.DiffWordHistoryDataBind(function (haveData) { });



})