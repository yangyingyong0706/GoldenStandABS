


define(function (require) {

    var $ = require('jquery');
    var GlobalVariable = require('globalVariable');
    var common = require('gs/uiFrame/js/common');
    var Vue = require('Vue');
    var RoleOperate = require('roleOperate');
    require('jquery.datagrid');
    require('jquery-ui');

    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');

    require('calendar');
    require('jquery.cookie');
    require('date_input');


    ////////////
    var serbiceList = location.protocol + "//" + location.host + '/QuickWizardService/WizardService.svc/';
    $(document).ready(function () {
        $('.date-plugins').date_input()
    })

    new Vue({
        el: '#app',
        data: {
            TrustName1: '',
            TrustShortName: '',
            trustName: '',
            trustId: common.getQueryString("trustId"),
            selectParticipant: [],
            SelectedParticipant: [],
            RatingAgency: [],
            HistoricalRecordsList: []
        },
        mounted: function () {
            this.getLayeredContent();
            this.getRatingAgency();
            this.getTrustNameByTrustId();
            this.getPreservation();
            this.getPreservation();
        },
        methods: {
            getTrustNameByTrustId: function () {
                var that = this;
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetTrustNameByTrustId', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustID', value: that.trustId, DBType: 'int' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var json = jQuery.parseJSON(data);
                        that.trustName = json[0].TrustName;
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            closeHistoricalRecordsDivDIsplay: function () {
                $(".PopupBackground").css('display', 'none');
                $(".HistoricalRecordsDivDIsplay").css('display', 'none');
            },
            HistoricalRecords: function () {
                $(".PopupBackground").css('display', 'block');
                $(".HistoricalRecordsDivDIsplay").css('display', 'block');
                var that = this;
                that.HistoricalRecordsList = [];
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetSalesDocumentsVerifyHistory', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustId', value: that.trustId, DBType: 'int' });
                executeParam.SQLParams.push({ Name: 'DoucumentType', value: 'Synopsis', DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var json = jQuery.parseJSON(data);
                        that.HistoricalRecordsList = json;
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });

            },
            getPreservation: function () {
                var that = this;
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetSalesDocumentsLastSubmitVerifyInfo', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustId', value: that.trustId, DBType: 'int' });
                executeParam.SQLParams.push({ Name: 'DoucumentType', value: 'Synopsis', DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var json = jQuery.parseJSON(data);
                        if (json.length > 0) {
                            for (var i = 0; i < json.length; i++) {
                                if (json[i].OperationType == 'submit') {
                                    if (json[i].SubmitUser == RoleOperate.cookieName()) {
                                        $('#Preservation').attr('disabled', 'disabled');
                                        $('#Preservation').css('background-color', '#ccc');
                                        $('#Preservation').css('border-color', '#ccc');
                                    }
                                }
                            }
                        }
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            SubmitPreservation: function (type) {
                var that = this;
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_SaveSalesDocumentsVerifyHistory', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustId', value: that.trustId, DBType: 'int' });
                executeParam.SQLParams.push({ Name: 'DoucumentType', value: 'Synopsis', DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'OperationType', value: type, DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'UserName', value: RoleOperate.cookieName(), DBType: 'string' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var json = jQuery.parseJSON(data);
                        if (json[0].Column1 == 1) {
                            return;
                        }
                        if (type == 'submit') {
                            $('#Preservation').attr('disabled', 'disabled');
                            $('#Preservation').css('background-color', '#ccc');
                            $('#Preservation').css('border-color', '#ccc');
                        }
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });
            },
            getRatingAgency: function () {//获取评级机构
                var self = this;
                var trustId = common.getQueryString("trustId");
                var dataList = [];
                var executeParam = { SPName: '[TrustManagement].[usp_GetPageItems_StressTesting]', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'BusinessCode', Value: 'trust', DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'BusinessIdentifier', Value: trustId, DBType: 'string' });
                executeParam.SQLParams.push({ Name: 'ItemAliasSetName', Value: 'zh-CN', DBType: 'string' });
                var serviceUrl = serbiceList + 'CommonGetWithConnName?connName=TrustManagement&exeParams=' + encodeURIComponent(JSON.stringify(executeParam));
                $.ajax({
                    type: "GET",
                    url: serviceUrl,
                    dataType: "jsonp",
                    crossDomain: true,
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                    },
                    success: function (response) {
                        var data = JSON.parse(response);
                        var newList = [];
                        var datalist = [];
                        data.forEach(function (v, i) {
                            for (var j = 0; j < newList.length; j++) {
                                if (newList[j].GroupId01 == v.GroupId01) {
                                    return false;
                                }
                            }
                            newList.push({ "GroupId01": v.GroupId01 });
                        })

                        newList.forEach(function (v, i) {
                            var newArr = [];
                            var str = "{";
                            for (var j = 0; j < data.length; j++) {
                                if (data[j].GroupId01 == v.GroupId01) {
                                    if (data[j].ItemAliasValue == '证券评级') {
                                        str += '"ClassName":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '发行日期') {
                                        str += '"IssueDate":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '发行币种') {
                                        str += '"CurrencyOfIssuance":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '募集规模') {
                                        if (data[j].ItemValue != null) {
                                            str += '"OfferAmount":"' + comdify(data[j].ItemValue) + '",'
                                        } else {
                                            str += '"OfferAmount":"",'
                                        }
                                    }
                                    if (data[j].ItemAliasValue == '票面利率(%)') {
                                        str += '"CouponBasis":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '利率形式') {
                                        str += '"CouponPaymentReference":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '每份面值') {
                                        str += '"Denomination":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '预期到期日') {
                                        str += '"LegalMaturityDate":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '原始评级') {
                                        str += '"OriginalCreditRating":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '还本付息方式') {
                                        str += '"PaymentConvention":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '证券简称') {
                                        str += '"ShortName":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '证券代码') {
                                        str += '"SecurityExchangeCode":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '还本计划') {
                                        str += '"PrincipalSchedule":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '付息频率') {
                                        str += '"PaymentFrequence":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '评级机构') {
                                        str += '"RatingAgent":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '本金摊还开始日') {
                                        str += '"PrincipalPayStartDate":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '每年计息天数') {
                                        str += '"InterestDays":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '计息方式') {
                                        str += '"InterestRateCalculation":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '次级是否挂牌') {
                                        str += '"Islisting_EquityClass":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '未偿还比例(%)') {
                                        str += '"OutstandingPct":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '债券类别') {
                                        str += '"ClassType":"' + data[j].ItemValue + '",'
                                    }
                                    //if (data[j].ItemAliasValue == '多家评级') {
                                    //    str += '"MultipleRatings":"' + data[j].ItemValue + '",'
                                    //}
                                    if (data[j].ItemAliasValue == '最低申报数量') {
                                        str += '"MinDeclareCount":"' + data[j].ItemValue + '",'
                                    }
                                    if (data[j].ItemAliasValue == '未付利息结转方式*') {
                                        str += '"InterestUnpaidDispose":"' + data[j].ItemValue + '"'
                                    }
                                }

                            }
                            str += "}";
                            newArr.push(JSON.parse(str));
                            datalist.push(newArr);
                        })
                        self.RatingAgency = datalist;
                    },
                    error: function (response) { alert("error:" + response); }
                });

            },
            getLayeredContent: function () {
                var self = this;
                var trustId = common.getQueryString("trustId")
                var svcUrlWithConn = GlobalVariable.DataProcessServiceUrl + "CommonGetExecute?";
                var executeParam = { SPName: 'usp_GetSalesIntroductionDocumentInfo', SQLParams: [] };
                executeParam.SQLParams.push({ Name: 'TrustID', value: trustId, DBType: 'int' });
                var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                var serviceUrl = svcUrlWithConn + "connConfig=TrustManagement&appDomain=TrustManagement&executeParams=" + executeParams + '&resultType=Common';
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    success: function (data) {
                        var data = JSON.parse(data);
                        if (data[0].length < 1) { return; }
                        for (var i = 0; i < data[0].length; i++) {
                            if (data[0][i].name == "TrustShortName") {
                                self.TrustShortName = data[0][i].value;
                            }
                            if (data[0][i].name == "TrustName") {
                                self.TrustName1 = data[0][i].value;
                            }
                        }
                        self.selectParticipant = data[2];
                        self.SelectedParticipant = data[1];
                    },
                    error: function (data) {
                        alert('getProductTypeCategory Error !');
                    }
                });



            },
            AddParticipant: function () {
                var ItemCode = $("select").val(), that = this; num = 0;
                for (var i = 0; i < that.SelectedParticipant.length; i++) {
                    if (ItemCode == that.SelectedParticipant[i].ItemCode) {
                        num++;
                    }
                }
                if (num > 0) {
                    alert("请勿重复添加已有的!");
                } else {
                    that.SelectedParticipant.push({ ItemAliasValue: $('#selectParticipant').find('option:selected').html(), ItemCode: $("select").val(), ServiceProviderName: "" });
                }
            },
            toDetail: function () {
                // window.location.href = "/TrustManagementService/TrustManagement/viewTrust.html?tid=" + getQueryString("trustId") + "#step=1";
                var url = "/TrustManagementService/TrustManagement/viewTrust.html?tid=" + common.getQueryString("trustId") + "#step=1";
                window.open(url, '_blank')
            },
            Refresh: function () {
                this.getRatingAgency();
            },
            saveAllItems: function () {
                var haveError = false, that = this;
                $('#app').find('.form-control').each(function () {
                    var $this = $(this);
                    if (!validControlValue($this)) { haveError = true; }
                });
                if (haveError) return;
                var xml = '<xml>';
                xml += '<TrustNameShort>' + this.TrustShortName + '</TrustNameShort>';
                xml += '<RelatedRoles>';
                for (var i = 0; i < that.SelectedParticipant.length; i++) {
                    xml += '<Role>';
                    xml += '<RoleCode>' + that.SelectedParticipant[i].ItemCode + '</RoleCode>';
                    xml += '<RoleValue>' + that.SelectedParticipant[i].ServiceProviderName + '</RoleValue>';
                    xml += '</Role>';
                }
                xml += '</RelatedRoles>';
                xml += '</xml>';
                var trustId = common.getQueryString("trustId")
                var executeParam = {
                    SPName: 'usp_SaveSalesIntroductionDocumentInfo', SQLParams: [
                        { Name: 'TrustID', value: trustId, DBType: 'int' },
                        { Name: 'xml', value: xml, DBType: 'xml' },
                    ]
                };
                var result = ExecuteRemoteData(executeParam, function (data) {
                    if (data) {
                        alert('保存成功');
                        that.getLayeredContent();
                    }
                });


            },
            downloadFile: function () {
                var that = this;
                that.saveAllItems();
                JsonVariableString = "[{'Name':'TrustId','Value':" + that.trustId + "}]";
                //AssemblyPath = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\DLL\\DocxCreationByJson.dll";
                DBName = "TrustManagement";
                TemplateFile = "E:\\TSSWCFServices\\TrustManagementService\\ConsumerLoan\\Document\\销售文档\\专项计划简介.docx";
                DestinationFileName = that.trustName + '_专项计划简介.docx';
                var tpi = new TaskProcessIndicatorHelper(false, false);
                tpi.AddVariableItem('MethodName', 'GenerateDocxByJsonVariable', 'NVarChar');
                tpi.AddVariableItem('TemplateFile', TemplateFile, 'NVarChar');
                //tpi.AddVariableItem('AssemblyPath', AssemblyPath, 'NVarChar');
                tpi.AddVariableItem('JsonVariableString', JsonVariableString, 'NVarChar');
                tpi.AddVariableItem('DBName', DBName, 'NVarChar');
                tpi.AddVariableItem('DestinationFileName', DestinationFileName, 'NVarChar')
                tpi.ShowIndicator('ConsumerLoan', 'DocxCreationByJson', function (result) {
                    if (confirm('确认下载文档？')) {
                        window.location.href = GlobalVariable.TrustManagementServiceHostURL + '/ConsumerLoan/Working/' + DestinationFileName;
                    }
                });
            }
        }
    })
    function isEmail(str) {
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/;
        return reg.test(str);
    }
    function checkTel(tel) {
        var mobile = /^1[3|5|8]\d{9}$/, phone = /^0\d{2,3}-?\d{7,8}$/;
        return mobile.test(tel) || phone.test(tel);
    }
    var TrustMngmtRegxCollection = {
        int: /^([-]?[1-9]+\d*$|^0)?$/,
        decimal: /^([-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?)?$/,
        date: /^((\d{4})-(\d{2})-(\d{2}))?$/,
        datetime: /^((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2}))?$/
    };
    function validControlValue(obj) {
        var $this = $(obj);
        var objValue = $this.val();
        var valids = $this.attr('data-valid');

        //无data-valid属性，不需要验证
        if (!valids || valids.length < 1) { return true; }

        //如果有必填要求，必填验证
        if (valids.indexOf('required') >= 0) {
            if (!objValue || objValue.length < 1) {
                $this.addClass('red-border');
                return false;
            } else {
                $this.removeClass('red-border');
            }
        }

        //暂时只考虑data-valid只包含两个值： 必填和类型
        var dataType = valids.replace('required', '').toLocaleLowerCase().trim();

        //通过必填验证，做数据类型验证
        var regx = TrustMngmtRegxCollection[dataType];
        if (!regx) { return true; }

        if (!regx.test(objValue)) {
            $this.addClass('red-border');
            return false;
        } else {
            $this.removeClass('red-border');
        }
        return true;
    }


    function ExecuteRemoteData(executeParam, callback) {
        //var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        var executeParams = JSON.stringify(executeParam);

        var params = '';
        params += '<root appDomain="TrustManagement" postType="">';// appDomain="TrustManagement"
        params += executeParams;
        params += '</root>';

        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonPostExecute";

        $.ajax({
            type: "POST",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: params,
            processData: false,
            success: function (response) {
                if (callback)
                    callback(response);
            },
            error: function (response) { alert("error is :" + response); }
        });

    }

    var runTask_Dashboard = function (appDomain, sessionId, callback) {
        var serviceUrl = location.protocol + "//" + location.host + "/TaskProcessEngine_Dashboard/SessionManagementService.svc/jsAccessEP/RunTask?vSessionId=" + sessionId + "&applicationDomain=" + appDomain;
        $.ajax({
            type: "GET",
            url: serviceUrl,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                callback(response);
            },
            error: function (response) {
                callback(false);
            }
        });
    };
    function comdify(n) {
        var re = /\d{1,3}(?=(\d{3})+$)/g;
        var n1 = n.replace(/^(\d+)((\.\d+)?)$/, function (s, s1, s2) { return s1.replace(re, "$&,") + s2; });
        return n1;
    }


////////




});















