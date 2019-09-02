


define(function (require) {

    var webStorage;

    var $ = require('jquery');
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');


    $(document).on("scroll", function (e) {
        console.log(e)
    })

    $('#selectLanguageDropdown_vll').localizationTool({
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


            'id:errorRatio_vll': {
                'en_GB': "Error Ratio"
            },
            'id:errorColumn_vll': {
                'en_GB': "Error Column"
            },
            'v-bind::id:proportion_vll': {
                'en_GB': "{'data-label':'Proportion '+v.percents}"
            },
            'v-bind::id:seeRecommendations_vll': {
                'en_GB': "{'data-hover':'See Recommendations'}"
            },
            'id:downloadChecksumResults_vll': {
                'en_GB': 'Download Results'
            },
            'id:recommendation_vllx': {
                'en_GB': ' Recommendation（{{errorAdvise.total}}）'
            },
            'v-text::id:fieldError_vll': {
                'en_GB': "columnName + ' Field Error'"
            },
            'id:hide_vll': {
                'en_GB': 'Hide'
            },
            'id:checkLine_vll': {
                'en_GB': 'Check Line: '
            },
            'id:checkType_vll': {
                'en_GB': 'Check Type: '
            },
            'id:recommendation_vll': {
                'en_GB': 'Recommendation: '
            },
            'v-text::id:more_vll': {
                'en_GB': "'More'"
            }


        }
    });

    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage) {
        $('#selectLanguageDropdown_vll').localizationTool('translate', userLanguage);
    }
    $('body').show();

    function downLoadExcel(filePath, innerText, desName, id) { //文件下载字节流转换
        var oReq = new XMLHttpRequest();
        //var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx";
        var url = GlobalVariable.DataProcessServiceUrl + "getStream?" + 'filePath=' + filePath;
        oReq.open("POST", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var content = oReq.response;

            var elink = document.createElement('a');
            elink.innerHTML = innerText;
            elink.download = desName;
            elink.id = "downLoad"
            //elink.style.display = 'none';

            var blob = new Blob([content]);
            elink.onload = function (e) {
                window.URL.revokeObjectURL(e.href); // 清除释放

            };
            elink.href = URL.createObjectURL(blob);
            document.getElementById(id).appendChild(elink);
            //elink.click();

            //document.body.removeChild(elink);
        };
        oReq.send();
    }
    //字节流下载,对IE浏览器不工作的部分进行了调整
    function downLoadExcelForSyn(filePath, innerText, desName, id) {
        var oReq = new XMLHttpRequest();
        //var desPath = "E:\\TSSWCFServices\\PoolCut\\Files\\AssetTypeTemplates\\资产导入模板_信用卡.xlsx";
        var uriHostInfo = location.protocol + "//" + location.host;
        var url = encodeURI(uriHostInfo + "/GoldenStandABS/service/DataProcessService.svc/jsAccessEP/" + "getStream?" + 'filePath=' + filePath);
        oReq.open("POST", url, true);
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var content = oReq.response;

            var elink = document.createElement('a');
            elink.innerHTML = innerText;
            elink.download = desName;
            elink.id = "downLoad"
            //elink.style.display = 'none';

            var blob = new Blob([content]);
            elink.onload = function (e) {
                window.URL.revokeObjectURL(e.href); // 清除释放
            };
            if (window.navigator && window.navigator.msSaveOrOpenBlob) { //判断是否为IE浏览器
                document.getElementById(id).appendChild(elink);
                $('body').on('click', '#' + id, function () {
                    downLoanExcelInIE(blob, filePath);
                })
            }
            else {
                elink.href = URL.createObjectURL(blob);
                document.getElementById(id).appendChild(elink);
            }
        };
        oReq.send();
    }
    function downLoanExcelInIE(blob, desName) {
        window.location.href = desName;
        
    }

    var PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    var common = require('common');

    var jDatagrid = require('jquery.datagrid');
    var jdOptions = require('jquery.datagrid.options');
    var Cashflow = common.getQueryString("Cashflow")
    var GlobalVariable = require('gs/globalVariable');
    var Vue = require('Vue');
    var filename;
    if (Cashflow == "1") {
            filename = common.getQueryString('filename');
    } else {
        if (window.navigator && window.navigator.msSaveOrOpenBlob)
            filename = common.getQueryStringSpecial('filename');
        else
            filename = common.getQueryString('filename');
    }
    new Vue({
        el: '#app',
        data: {
            SessionId: common.getQueryString('SessionId'),
            errorDetails: {
                total: 0,
                data: []
            },
            errorDetails2: {
                total: 0,
                data: []
            },
            errorAdvise: {
                total: 0,
                data: []
            },
            columnName: '',
            verifyType: 0,
            scrollTop: 0,
            current: 1,
            pageSize: 20,
            isIE: false,
            view: false,
            obj: '',
            index: '',
        },
        created: function () {
            this.ajax([
                { Name: 'SessionId', Value: this.SessionId, DBType: 'string' }
                , { Name: 'total', Value: 0, DBType: 'int', IsOutput: true }
            ], function (res) {
                var n = 0, m = 0;
                for (var i = 0; i < res.data.length; i++) {
                    if (res.data[i].VerifyType == "Missing Column" || res.data[i].VerifyType == "NULL" || res.data[i].VerifyType == "ErrorColumn" || res.data[i].VerifyType == "错误") {
                        var sign = false;
                        if (i == 0) {
                            this.errorDetails.data.push(res.data[i]);
                            n++;
                            continue;
                        }

                        
                        for (var c = 0; c < this.errorDetails.data.length; c++) {
                            if (this.errorDetails.data[c].columnName == res.data[i].columnName) {
                                this.errorDetails.data[c].VerifyType = this.errorDetails.data[c].VerifyType + "_" + res.data[i].VerifyType;
                                this.errorDetails.data[c].percents = (parseFloat(this.errorDetails.data[c].percents) + parseFloat(res.data[i].percents)).toFixed(2) + "%";
                                this.errorDetails.data[c].counts = this.errorDetails.data[c].counts + res.data[i].counts;
                                n++;
                                sign = true;
                            }
                            
                        }
                        if (sign) {
                            continue;
                        } else {
                            this.errorDetails.data.push(res.data[i]);
                            n++;
                        }
                        




                       
                    } else {
                        this.errorDetails2.data.push(res.data[i]);
                        m++;
                    }
                }
                this.errorDetails.total = n;
                this.errorDetails2.total = m;
                if (n != 0) {
                    //$("#proportion_title").hide();
                    $("#proportion_title>legend").addClass("c_active");
                    $("#errorArea").addClass("color_font");
                    $("#p1").show();
                    $("#p2").hide();
            }else {
                $("#proportion_title2>legend").addClass("c_active");
                $("#friends").addClass("color_font");
                $("#p2").show();
                $("#p1").hide();
                }
                filename = filename.substring(0, filename.lastIndexOf("."));
                downLoadExcelForSyn(('/PoolCut/Files/DataCheck/' + filename + '_' + this.SessionId + '.csv'), '下载校验结果', filename + '_' + this.SessionId + '.csv', 'downloadChecksumResults');

               $("#loading").fadeOut()
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
            changeTab:function($event){
                var target = $event.currentTarget;
                $(target).addClass("c_active");
                $(target).find("font").addClass("color_font")
                if ($(target).parent()[0].id == "proportion_title2") {
                    $("#proportion_title>legend").removeClass("c_active")
                    $("#errorArea").removeClass("color_font");
                    $("#p1").hide();
                    $("#p1").find(".error-list").hide();
                    $("#p1").find(".error-list").parent().find(">div:first").removeClass("remove_bo");
                    $("#p2").show();
                } else {
                    $("#proportion_title2>legend").removeClass("c_active")
                    $("#friends").removeClass("color_font");
                    $("#p2").hide();
                    $("#p2").find(".error-list").hide();
                    $("#p2").find(".error-list").parent().find(">div:first").removeClass("remove_bo");
                    $("#p1").show();
                }
            },
            viewDetail: function ($event, columnName, verifyType, $index) {
                this.current =1;
                if (!columnName) return;
                var target = $event.currentTarget;
                if ($(target).parent()[0] == this.obj) {
                    $(target).parent().find(".error-list").toggle();
                    if ($(target).parent().find(".error-list").css("display") == "none") {
                        $(target).parent().find(">div:first").removeClass("remove_bo");
                    } else {
                        $(target).parent().find(">div:first").addClass("remove_bo");
                    }
                    var oPos = $(target).parent()[0].offsetTop
                    window.scrollTo(0, oPos - 36)
                } else {
                    this.obj = $(target).parent()[0];
                    $(target).parent().find(">div:first").addClass("remove_bo");
                    $(target).parent().siblings().find(">div:first").removeClass("remove_bo");
                    if ($(target).parent().siblings().find(".error-list").length == 0) {
                        $(target).parent().find(".error-list").slideDown(50);
                            var oPos = target.offsetTop
                            window.scrollTo(0, oPos - 36)
                    } else {
                        $(target).parent().siblings().find(".error-list").slideUp(50, function () {
                            $(target).parent().find(".error-list").slideDown(50);
                            var oPos = $(target).parent()[0].offsetTop
                            window.scrollTo(0, oPos - 36)
                        });
                    }
                  
                }
                this.columnName = columnName;
                this.verifyType = verifyType;
                //this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                //this.isIE = document.documentElement.scrollTop;
            },
            closeView: function () {
                this.view = false;
                this.columnName = '';
                this.verifyType = '';
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
                //downLoadExcel('/PoolCut/Files/DataCheck/' + this.filename + '_' + this.SessionId + '.xlsx', '下载', this.filename + '_' + this.SessionId + '.xlsx', 'downloadChecksumResults');
                console.log(this.SessionId)
                //return GlobalVariable.SslHost + 'PoolCut/Files/DataCheck/' + this.filename + '_' + this.SessionId + '.xlsx';
            },
            states: function () {
                if (!this.view && this.columnName == '') return false;
                var start = (this.current - 1) * this.pageSize + 1,
                    end = this.current * this.pageSize;

                this.ajax([{ Name: 'SessionId', Value: this.SessionId, DBType: 'string' }
                    , { Name: 'column', Value: this.columnName, DBType: 'string' }
                     , { Name: 'verifyType', Value: this.verifyType, DBType: 'int' }
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

