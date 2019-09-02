define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue");
    var common = require('common');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var appGlobal = require('App.Global');
    var GlobalVariable = require('globalVariable');
    var enter = common.getQueryString('enter');
    var permission = require('permission');
    require('app/basicData/Common/basic_interface');
    var liGroups = [
        { PathName: 'BusinessRuleEngine', name: '筛选条件编辑', linkUrl: GlobalVariable.BusinessRuleEngineServiceHostURL + 'index.html' },
        { PathName: 'TaskProcessEngine', name: '任务工具', linkUrl: GlobalVariable.TaskProcessStudioServiceHostURL + 'UITaskStudio/index.html' },
        { PathName: 'CashFlowEngine', name: '现金流预测模型', linkUrl: GlobalVariable.CashFlowEngineServiceHostURL + 'UITaskStudio/index.html' },
        { PathName: 'PythonReport', name: 'python文档工具', linkUrl: '../PythonReport/TrustList.html' },
        { PathName: 'PythonReportSetting', name: '文档工具设置', linkUrl: '../PythonReport/PythonReportSetting/PyManager.html' },
        { PathName: 'PerrationHistory', name: '操作记录', linkUrl: '../../history/history.html' },
        { PathName: 'ContentSettings', name: '内容管理', linkUrl: '../ContentSettings/Categorys/CategorysList.html' },
        { PathName: 'VariableRates', name: '利率管理', linkUrl: '../VariableRates/VIRateSettings.html' },
        { PathName: 'NewAssetSrc', name: '新增资产来源', linkUrl: '../NewAssetSrc/NewAssetSource.html' },
        { PathName: 'ModifyProductCalculation', name: '修改产品计算', linkUrl: '../ModifyProductCalculation/index.html' },
        { PathName: 'TrustImportExport', name: '产品导入导出', linkUrl: '../TrustImportExport/TrustImportExportIndex.html' },
        { PathName: 'StatisticalFieldSettings', name: '新增资产池统计字段', linkUrl: '../../assetFilter/creditfactory/Reports/StatisticalFieldSettings.html' },
        { PathName: 'TaskListVerify', name: '任务单校验功能', linkUrl: '../SystemSettings/TaskListTypeIndex.html' },
        { PathName: 'TaskListVerifyChild', name: '自动回测结果', linkUrl: '../../productManage/TrustManagement/TaskListVerify/TaskListVerifyChild/EntrustedKendoGridPage.html?IsAutoTest=1' },
        { PathName: 'Maintenance', name: '环境清理计划', linkUrl: '../SystemSettings/Maintenance.html' },
         { PathName: 'WorkflowConfiguration', name: '项目与工作流', linkUrl: '../WorkflowConfiguration/WorkflowConfiguration.html' }
    ]

    //内容管理权限控制
    var liGroupsPermission = permission.systemSettingPermission(liGroups);
    var vm = new Vue({
        el: "#app",
        data: {
            enter: enter,
            url: '',
            liSource: [
                {linkUrl: ''}
            ]
        },
        created: function () {
            this.changeLiSource();  
        },
        watch: {
            liSource: function () {
                Vue.nextTick(function () {
                    $(".top_nav_style li").eq(0).trigger('click');
                    $(".top_nav_style li").eq(0).addClass("current_li");
                })
            }
        },
        methods: {
            changeLiSource: function () {
                var self = this;
                switch (self.enter) {
                    case 'toolManage':
                        var arr = [];
                        $.each(liGroupsPermission, function (i, v) {
                            if (v.PathName == 'BusinessRuleEngine' || v.PathName == 'TaskProcessEngine' || v.PathName == 'CashFlowEngine' || v.PathName == 'PythonReport' || v.PathName == 'PythonReportSetting' || v.PathName == 'WorkflowConfiguration') {
                                arr.push(v)
                            }
                        })
                        self.liSource = arr;
                        break;
                    case 'DailyRecord':
                        var arr = [];
                        $.each(liGroupsPermission, function (i, v) {
                            if (v.PathName == 'PerrationHistory') {
                                arr.push(v)
                            }
                        })
                        self.liSource = arr;
                        break;
                    case 'DataManage':
                        var arr = [];
                        $.each(liGroupsPermission, function (i, v) {
                            if (v.PathName == 'ContentSettings' || v.PathName == 'VariableRates' || v.PathName == 'NewAssetSrc' || v.PathName == 'ModifyProductCalculation' || v.PathName == 'TrustImportExport' || v.PathName == 'StatisticalFieldSettings') {
                                arr.push(v)
                            }
                        })
                        self.liSource = arr;
                        break;
                    case 'CheckoutManage':
                        var arr = [];
                        $.each(liGroupsPermission, function (i, v) {
                            if (v.PathName == 'TaskListVerify' || v.PathName == 'TaskListVerifyChild' || v.PathName == 'Maintenance') {
                                arr.push(v)
                            }
                        })
                        self.liSource = arr;
                        break;
                }
            },
            changeIframe: function (nowUrl, $event) {
                var target = $event.target;
                var self = this;
                self.url = nowUrl;
                $(target).removeClass("current_li").addClass("current_li");
                $(target).parent().removeClass("current_li").addClass("current_li");
                $(target).siblings().removeClass("current_li");
                $(target).parent().siblings().removeClass("current_li");
            }
        }
    })
})


