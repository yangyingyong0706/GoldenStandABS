

function getVersion() {
    return (sessionStorage && sessionStorage.getItem('absVersion')) || 1024;;
}

require.config({
    baseUrl: '/GoldenStandABS/asset/lib',
    urlArgs: "bust=" + getVersion(),// 发布时固定
    paths: {
        'jquery': './jquery/jquery-1.12.1.min', //$
        'easing':'./jquery/jquery.easing.1.3',
        'wresize': './jquery/jquery.wresize',
        'jquery.cookie': 'jquery/jquery.cookie',
        'jquery.localizationTool': 'jquery/jquery.localizationTool.min',
        'knockout': 'knockout/knockout-3.4.2', //ko
        'knockout.mapping': 'knockout/knockout.mapping', //mapping
        'knockout-old': 'knockout/knockout-3.4.0',
        'knockout.rendercontrol': 'knockout/knockout.binding.rendercontrol',
        'gs': './goldenstand', // goldenstand common modules
        'anyDialog': 'goldenstand/anyDialog', //dialog 
        'asyncbox': 'asyncbox/asyncbox',
        'bootstrap': 'bootstrap/dist/js/bootstrap.min',
        'bootstrap_table': 'bootstrap/dist/js/bootstrap-table.min',
        'bootstrap_table_edit': 'bootstrap/dist/js/bootstrap-table-edit',
        'bootstrap_select': 'bootstrap/dist/js/bootstrap-select',
        'metisMenu': 'metisMenu/dist/metisMenu',
        'moment': 'fullCalendar/moment.min',
        'fullCalendar': 'fullCalendar/fullCalendar.min',
        'date_input': 'fullCalendar/calendar.min',
        'kendo.all.min': './Kendo/js/kendo.all.min',
        'jquery.datagrid': './jquery/jquery.datagrid',
        'jquery.searchSelect': './jquery/jquery.searchableSelect',
        'jquery.datagrid.options': './jquery/jquery.datagrid.options',
        'jquery-ui': './jquery/jquery-ui-latest',
        'jquery-1': './jquery/jquery-2.2.3.min',
        'app': '../../www', // app path
        'kendoculturecn': './Kendo/js/kendo.culture.zhCN',
        'kendoculturezhCN': './Kendo/js/kendo.culture.zh-CN',
        'kendomessagescn': './Kendo/js/kendo.messages.zh-CN',
        'permission': 'goldenstand/permission',
        'Vue': './vue/vue',
        'Vue2': './vue/vue2',
        'd3': './d3/d3.min',
        'd3v3': './d3/d3v3.min',
        'dagreD3': './d3/dagre-d3',
        'tipsy': './d3/tipsy',
        'vMessage': 'goldenstand/vueMessage',
        'vLoading': 'goldenstand/vueLoading',
        'loading':'./vue/loading',
        'sortablejs': './vue/sortable',
        'vuedraggable': './vue/vuedraggable',
        'moment': './fullCalendar/moment.min',
        'calendar': './fullCalendar/calendar.min',
        'highcharts': './charts/highcharts',
        'highstock': './highcharts/highstock',
        'echarts': 'charts/echarts',
        'macarons': 'charts/macarons',
        'highchartsexporting': './charts/highcharts_exporting',
        'highstockexporting': './charts/highcharts_exporting',
        'jquery1.7.2': './jquery/jquery-1.7.2.min',
        'common': 'goldenstand/uiFrame/js/common',
        'gsAdmin': 'goldenstand/uiFrame/js/gs-admin-2',
        'gsAdminPages': 'goldenstand/uiFrame/js/gs-admin-2.pages',
        'globalVariable': 'goldenstand/globalVariable',
        'callApi': 'goldenstand/callApi',
        'taskProcessIndicator': 'goldenstand/taskProcessIndicator',
        'sVariableBuilder': 'goldenstand/sVariableBuilder',
        'jquery.md5': './jquery/jquery.md5',
        'tree.jquery': 'jquery/tree.jquery',
        'App.Global': 'goldenstand/App.Global',
        'jquery.hash': './jquery/jquery.hash',
        'roleOperate': 'goldenstand/roleOperate',
        'kendoExtension': 'goldenstand/kendo/kendoExtension',
        'KendoHelper': 'goldenstand/kendo/KendoHelper',
        'gsUtil': 'goldenstand/gsUtil',
        'jquery.color': 'jquery/jquery.color-2.1.2.min',
        'autoComplete': 'goldenstand/autoComplete',
        'knockout.validation.min': 'knockout/knockout.validation.min',
        'webProxy': 'goldenstand/webProxy',
        'webProxyTask': 'goldenstand/webProxyTask',
        'jquery.mousewheel': 'jquery/jquery.mousewheel',
        'jquery.scroll': 'jquery/jquery.scroll',
        'lodash': 'goldenstand/lodash.min',
        'Sortable': 'goldenstand/Sortable',
        'uuid': 'uuid/Math.uuid',
        'fullCalendar-zh-cn': './fullCalendar/zh-cn',
        'jquery.ztree.core': './jquery/jquery.ztree.core',
        'jquery.ztree.excheck': './jquery/jquery.ztree.excheck',
        'jquery.ztree.exedit': './jquery/jquery.ztree.exedit',
        'bwizard': './bwizard/bwizard.min',
        'PagerList': 'goldenstand/PagerList',
        'devExtreme.dx.all': './devExtreme/dx.all',
        'devExtreme.jszip.min': './devExtreme/jszip.min',
        'globalize.currency.min': './devExtreme/globalize.currency.min',
        'globalize.date.min': './devExtreme/globalize.date.min',
        'globalize.message.min': './devExtreme/globalize.message.min',
        'globalize.min': './devExtreme/globalize.min',
        'globalize.number.min': './devExtreme/globalize.number.min',
        'linq': 'app/productManage/TrustManagement/Common/Scripts/linq.min',
        'dxWeb': 'app/financialReport/common/js/DevExtreme/dx.web',//以下是财务报表涉及脚本
        'globalize': 'app/financialReport/common/js/DevExtreme/globalize.min',
        'message': 'app/financialReport/common/js/DevExtreme/globalize/message.min',
        'number': 'app/inancialReport/common/js/DevExtreme/globalize/number.min',
        'date': 'app/financialReport/common/js/DevExtreme/globalize/date.min',
        'cldrs': 'app/financialReport/common/js/DevExtreme/cldr.min',
        'event': 'app/financialReport/common/js/DevExtreme/cldr/event.min',
        'supplemental': 'app/financialReport/common/js/DevExtreme/cldr/supplemental.min',
        'turn': './turnJs/turn',
        'insertActlogs': 'goldenstand/InsertActLogs',
        'permissionProxy': 'goldenstand/permissionProxy',
        'ischeck': 'bootstrap/ischecked/icheck.min',
        'toast': 'toast/toast'
    },
    shim: {
        'jquery.cookie': ['jquery'],
        'jquery.searchSelect': ['jquery'],
        'jquery.localizationTool': ['jquery'],
        'jquery.datagrid': ['jquery'],
        'jquery.datagrid.options': ['jquery', 'jquery.datagrid'],
        'jquery-ui': ['jquery'],
        'jquery.hash': ['jquery'],
        'jquery.mousewheel': ['jquery'],
        'jquery.scroll': ['jquery'],
        'bootstrap_table': ['bootstrap'],
        'bootstrap_table_edit': ['bootstrap', 'bootstrap_table', 'bootstrap_select'],
        'bootstrap_select': ['bootstrap'],
        'jquery.ztree.excheck': {
            deps: ['jquery'],
            exports: 'jquery.ztree.excheck'
        },
        'jquery.ztree.core': {
            deps: ['jquery'],
            exports: 'jquery.ztree.core'
        },
        'PagerList': {
            deps: ['jquery.datagrid.options', 'jquery.datagrid', 'common'],
            exports: 'PagerList'
        },
        'anyDialog': {
            deps: ['jquery'],
            exports: 'anyDialog'
        },
        'toast': {
            deps: ['jquery'],
            exports: 'toast'
        },
        'easing': {
            deps: ['jquery'],
            exports: 'easing'
        },
        'wresize': {
            deps: ['jquery'],
            exports: 'wresize'
        },
        'asyncbox': {
            deps: ['jquery'],
            exports: 'asyncbox'
        },
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        },
        'turn': {
            deps: ['jquery'],
            exports:"turn"
        },
        'ischeck':{
            deps: ['jquery'],
            exports: 'ischeck'
        },
        'dagreD3':{
            deps: ['d3'],
            exports: "dagreD3"
        },
        'tipsy': {
            deps: ['d3'],
            exports: "tipsy"
        },
        'metisMenu': {
            exports: 'metisMenu'
        },
        'fullCalendar': {
            deps: ['moment'],
            exports: 'fullCalendar'
        },
        'date_input': ['jquery', 'jquery-ui'],
        'kendoculturecn': {
            exports: 'kendoculturecn'
        },
        'kendoculturezhCN': {
            deps: ['kendo.all.min'],
            exports: 'kendoculturezhCN'
        },
        'kendomessagescn': {
            deps: ['kendo.all.min'],
            exports: 'kendomessagescn'
        },
        'calendar': {
            deps: ['jquery'],
            exports: 'calendar'
        },
        'highcharts': {
            exports: 'highcharts'
        },
        'highstock': {
            exports: 'highstock'
        },
        'echarts': {
            exports: 'echarts'
        },
        'macarons': {
            exports: 'macarons'
        },
        'highchartsexporting': {
            deps: ['highcharts'],
            exports: 'highchartsexporting'
        },
        'highstockexporting': {
            deps: ['highstock'],
            exports: 'highstockexporting'
        },
        'kendo.all.min': {
            exports: 'kendo.all.min'
        },
        
        'kendoExtension': {
            deps: ['kendo.all.min'],
            exports: 'kendoExtension'
        },
        'KendoHelper': {
            deps: ['kendo.all.min'],
            exports: 'KendoHelper'
        },
        'jquery.md5': ['jquery'],
        'tree.jquery': ['jquery'],
        'jquery.color': ['jquery'],
        'autoComplete': ['jquery', 'jquery-ui'],
        'knockout.rendercontrol': {
            deps: ['jquery', 'knockout'],
            exports: 'knockout.rendercontrol'
        },
        'knockout.validation.min': {
            deps: ['jquery', 'knockout'],
            exports: 'knockout.validation.min'
        },
        'Sortable': {
            deps: ['jquery'],
            exports: 'Sortable'
        },
        'uuid': {
            exports: 'uuid'
        },
        'fullCalendar-zh-cn': {
            deps: ['fullCalendar']
        },
        'jquery.ztree.core': ['jquery'],
        'jquery.ztree.excheck': ['jquery.ztree.core'],
        'jquery.ztree.exedit': ['jquery.ztree.core'],
        'bwizard': {
            deps: ['jquery'],
        },
        'devExtreme.dx.all': ['jquery'],
        'devExtreme.jszip.min': ['jquery'],
        'globalize.currency.min': ['jquery'],
        'globalize.date.min': ['jquery'],
        'globalize.message.min': ['jquery'],
        'globalize.min': ['jquery'],
        'globalize.number.min': ['jquery'],
        'vuedraggable': {
            deps: ['sortablejs'],
        },
        'laoding': {
            deps: ['Vue2'],
        },
        'dxWeb': {
            deps: ['jquery'],
        },
        'globalize': {
            deps: ['jquery', 'cldrs', 'event'],
        },
        'message': { deps: ['jquery', 'globalize', 'date', 'number', ], },
        'number': { deps: ['jquery', 'globalize', 'message', 'date', ], },
        'date': { deps: ['jquery', 'globalize', 'message', 'number',], },
        'cldrs': { deps: ['jquery', 'globalize', 'message', 'number', 'date'], },
        'event': { deps: ['jquery', 'globalize', 'message', 'number', 'date'], },
        'supplemental': { deps: ['jquery'] }

    },
    waitSeconds: 0//防止模块加载超时报错require默认加载等待时间是7s超了就会报错
});