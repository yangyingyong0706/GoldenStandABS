define(function (require) {
    var webStorage;
   


    var $ = require('jquery');
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');

    var PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    var common = require('common');

    var jDatagrid = require('jquery.datagrid');
    var jdOptions = require('jquery.datagrid.options');

    var GlobalVariable = require('gs/globalVariable');


    var lang = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        lang.checksumTime = 'Time';
        lang.checksumResult = 'Result';
        lang.viewResult = '<a href="VerificationList.html?SessionId={0}">View Result</a>';
        lang.noRecord = "<p class='noData'>No Record.</p>";
        
    } else {
        lang.checksumTime = '校验时间';
        lang.checksumResult = '校验结果';
        lang.viewResult = '<a href="VerificationList.html?SessionId={0}">查看结果</a>';
        lang.noRecord = "<p class='noData'>当前视图没有可显示记录。</p>";

    }


    var VerificationListModule = function () {
        var spName, svcUrl, $dtGrid;
        var displayColumns = [
            {
                field: "StartTime", title: lang.checksumTime, sortable: true, attrHeader: settable.tableTh, attr: settable.tableTd
            },
            {
                field: "SessionId", title: lang.checksumResult, sortable: false, attrHeader: settable.tableTh, attr: settable.tableTd
                , render: function (data) {
                    return lang.viewResult.format(data.row.SessionId);
                }
            }
        ];


        var initArgs = function (sp, continerId, url) {
            spName = sp;
            svcUrl = url;
            $dtGrid = $(continerId);
        };

        var dataBind = function (fnCallBack) {
            $dtGrid.datagrid({
                source: function () {
                    
                    return syncGetRemoteData(this.params())
                },
                col: displayColumns,
                attr: 'mytable',
                paramsDefault: { paging: 15 },
                noData: lang.noRecord,
                pagerPosition: "bottom",
                pager: "mypager",
                sorter: "mysorter",
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

            executeParam.SQLParams.push({ Name: 'start', Value: start, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'end', Value: end, DBType: 'int' });
            executeParam.SQLParams.push({ Name: 'orderby', Value: (gridParams.orderby) ? gridParams.orderby : 'StartTime', DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'direction', Value: (gridParams.direction) ? gridParams.direction : 'desc', DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'where', Value: ((gridParams.where) ? gridParams.where : 'where ParentPoolId=0'), DBType: 'string' });
            executeParam.SQLParams.push({ Name: 'total', Value: 0, DBType: 'int', IsOutput: true });
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));

            var sourceData = { total: 0, data: [] };
            var serviceUrl = svcUrl + 'CommonGet?connName=TaskProcess&exeParams=' + executeParams

            return CallWCFSvc(serviceUrl, false, 'GET');
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

        function getRows(isSelected) {
            var rowlistSelector = 'input[rowindex][name="checkbox"]:checkbox';
            if (isSelected)
                rowlistSelector += ':checked';
            return $dtGrid.find(rowlistSelector);
        }

        return {
            Init: initArgs,
            DataBind: dataBind,
            Filter: filterData,
            FetchMetaData: fetchMetaData,
            GetRows: getRows
        };
    }();


    $(function () {



        $('#selectLanguageDropdown_vrl').localizationTool({
            'defaultLanguage': 'zh_CN', // this is the language that the server is sending anyway
            'ignoreUnmatchedSelectors': true,
            'showFlag': true,
            'showCountry': false,
            'showLanguage': true,
            'onLanguageSelected': function (languageCode) {
                /*
                 * When the user translates we set the cookie
                 */
                webStorage.setItem('userLanguage', languageCode);
                return true;
            },

            /* 
             * Translate the strings that appear in all the pages below
             */
            'strings': {


                'id:checksumResultList_vrl': {
                    'en_GB': 'Result List'
                }


            }
        });

        
        if (userLanguage) {
            $('#selectLanguageDropdown_vrl').localizationTool('translate', userLanguage);
        }
        $('body').show();




        VerificationListModule.Init('Verification.usp_GetVerificationListWithPager', '#VerificationList',
            GlobalVariable.PoolCutServiceURL);
        VerificationListModule.DataBind();
    });


    return VerificationListModule;


})





