


define(function (require) {



    var $ = require('jquery');
    var PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    var common = require('common');

    var jDatagrid = require('jquery.datagrid');
    var jdOptions = require('jquery.datagrid.options');
    var Cashflow = common.getQueryString("Cashflow")
    var GlobalVariable = require('gs/globalVariable');
    var Vue = require('Vue');

    new Vue({
        el: '#app',
        data: {
            SessionId: common.getQueryString('SessionId'),
            filename: common.getQueryString('filename'),
            errorDetails: {},
            errorAdvise: {
                total: 0,
                data: []
            },
            columnName: '',
            scrollTop: 0,
            current: 1,
            pageSize: 20,
            isIE: false,
            view: false
        },
        created: function () {
            this.ajax([
                { Name: 'SessionId', Value: this.SessionId, DBType: 'string' }
                , { Name: 'total', Value: 0, DBType: 'int', IsOutput: true }
            ], function (res) {
                this.errorDetails = res;
            }.bind(this));
        },
        methods: {
            ajax: function (params, callback) {
                var executeParams = {
                    spName: 'Verification.usp_GetVerificationDetailList',
                    SQLParams: params
                };
                if (Cashflow == "1") {
                    executeParams.spName = "Verification.usp_GetVerificationDetailList_Cashflow"
                }
                executeParams = encodeURIComponent(JSON.stringify(executeParams));
                var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TaskProcess&exeParams=' + executeParams;
                CallWCFSvc(serviceUrl, true, 'GET', callback);
            },
            viewDetail: function (columnName) {
                if (!columnName) return;
                this.columnName = columnName;
                this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                this.isIE = document.documentElement.scrollTop;
                this.view = true;
            },
            closeView: function () {
                this.view = false;
                this.columnName = '';
                this.current = 1;
                this.$nextTick(function () {
                    if (this.isIE) {
                        document.documentElement.scrollTop = this.scrollTop;
                    } else {
                        document.body.scrollTop = this.scrollTop;
                    }
                });
            }
        },
        computed: {
            download: function () {
                return GlobalVariable.SslHost + 'PoolCut/Files/DataCheck/' + this.filename + '_' + this.SessionId + '.xlsx';
            },
            states: function () {
                if (!this.view && this.columnName == '') return false;
                var start = (this.current - 1) * this.pageSize + 1,
                    end = this.current * this.pageSize;

                this.ajax([{ Name: 'SessionId', Value: this.SessionId, DBType: 'string' }
                    , { Name: 'column', Value: this.columnName, DBType: 'string' }
                    , { Name: 'total', Value: 0, DBType: 'int', IsOutput: true }
                    , { Name: 'start', Value: start, DBType: 'int' }
                   , { Name: 'end', Value: end, DBType: 'int' }], function (res) {
                       this.errorAdvise.total = res.total;
                       if (this.current === 1) {
                           this.errorAdvise.data = res.data;
                       } else {
                           this.errorAdvise.data = [].concat(this.errorAdvise.data, res.data);
                       }
                   }.bind(this));
            },
            totalPage: function () {
                return Math.round(this.errorAdvise.total / this.pageSize)
            }
        }
    })
})

