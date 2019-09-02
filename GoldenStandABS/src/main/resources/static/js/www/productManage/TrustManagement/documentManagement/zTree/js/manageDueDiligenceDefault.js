
define(function (require) {
    var $ = require('jquery');
    require('PagerList');
    var common = require('gs/uiFrame/js/common');
    var GlobalVariable = require('globalVariable');



    //loading data
    var vId = common.getQueryString("vid");
    PagerListModule.Init(listCategory.RuleDefault, 'usp_GetMappRuleDefaultWithPager', 0, 0, vId,
        GlobalVariable.DataProcessServiceUrl + 'CommonExecuteGet?',
        '#divDataList');
    PagerListModule.DefaultDataBind(function (haveData) { });





})