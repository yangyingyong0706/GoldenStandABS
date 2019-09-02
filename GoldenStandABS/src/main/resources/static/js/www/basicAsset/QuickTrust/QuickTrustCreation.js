var $;
var GlobalVariable;
var GSDialog;
var Vue;
var webProxy;
var app;
var RoleOperate;
var PoolCutCommon;
var common;
var webStorage;
var ActLogs;
var ip;
var userName;
var enter;
var CheckStyle;
var toast;
var checkStatus = true;

var TrustMngmtRegxCollection = {
    //int: /^[-]{0,1}[1-9]{1,}[0-9]{0,}$/,
    int: /^[-]?[1-9]+\d*$|^0$/,
    //decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$/,
    decimal: /^[-]?[1-9]+\d*(\.{1}\d+){0,1}$|^[-]{1}0\.\d*[1-9]\d*$|^0(\.\d+)?$/,
    date: /^(\d{4})-(\d{2})-(\d{2})$/,
    datetime: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
};
var validTrustCodeRemote;
validTrustCodeRemote = function validTrustCodeRemote(obj, callback) {
    var trustCode = obj;
    var tmpTrustId = 0;//(!trustId || parseInt(trustId) === 0) && newTrustId ? newTrustId : trustId;

    var trustCodeParam = {
        "SPName": "usp_IsExistTrustCode",
        "SQLParams": [
            {
                "Name": "TrustCode",
                "value": trustCode,
                "DBType": "string"
            }, {
                "Name": "TrustId",
                "value": tmpTrustId,
                "DBType": "int"
            }
        ]
    };

    $nextStep = $('#next-step');
    $nextStep.prop('disabled', 'disabled');
    getWcfCommon(trustCodeParam).done(function (response) {
        var data = JSON.parse(response);
        if (!data[0].IsValid) {
            GSDialog.HintWindow('产品代码: "' + trustCode + '"重复，不能创建。');
            $('#loading').hide();
        } else {
            callback();
        }

    });
}


function getWcfCommon(param) {
    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" + encodeURIComponent(JSON.stringify(param));
    return $.ajax({
        type: "GET",
        url: serviceUrl,
        dataType: "jsonp",
        crossDomain: true,
        contentType: "application/json;charset=utf-8"
    });
}
define(function (require) {

    $ = require('jquery');
    toast = require('toast');
    require('jquery.localizationTool');
    webStorage = require('gs/webStorage');
    require('jquery.cookie');
    Vue = require('Vue');
    GlobalVariable = require('gs/globalVariable');
    GSDialog = require('gsAdminPages');
    PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    common = require('common');
    webProxy = require('gs/webProxy');

    RoleOperate = require('gs/roleOperate');
    ActLogs = require('insertActlogs');
    userName = RoleOperate.cookieName();

    enter = common.getQueryString('enter');

    ip;
    $.ajax({
        cache: false,
        type: "GET",
        async: false,
        url: GlobalVariable.DataProcessServiceUrl + 'getIP',
        dataType: "json",
        contentType: "application/xml;charset=utf-8",
        data: {},
        success: function (response) {
            if (typeof response === 'string') {
                ip = response;
            }
        },
        error: function () {
            alert: '网络连接异常'
        }
    });

    CheckStyle = function (obj) {
        var $this = $(obj);
        //var objValue = $this.val().replace(/,/g, "");
        var id = $this.parent().attr("id");
        var objValue = $this.val();
        console.log(id)

        if ($this.hasClass("theInputBorderRed")) {
            $this.removeClass("theInputBorderRed")
        }
        var pattern = new RegExp("[^0-9a-zA-Z-_]");
        var testfirst = new RegExp("[_-]");
        if (testfirst.test(objValue.substring(0, 1)) && checkStatus) {
            checkStatus = false;
            $this.attr('placeholder', "首字母只能是数据或者字母");
            $this.val("");
            $this.addClass("theInputBorderRed");
            $this.blur();
            return false
        } else {
            checkStatus = true;
        }
        if (pattern.test(objValue) && checkStatus) {
            checkStatus = false;
            $this.attr('placeholder',"只能输入数字,字母,下划线,破折号的组合");
            //$this.val("只能输入数字,字母,下划线,破折号的组合");
            $this.val("");
            $this.addClass("theInputBorderRed");
            $this.blur();
            return false
        } else {
            checkStatus = true;
        }
    }
    $(function () {
        $('#loading').hide();
        $('#selectLanguageDropdown_qcl').localizationTool({
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


                'id:submit_qcl': {
                    'en_GB': 'Submit'
                },
                'id:cancel_qcl': {
                    'en_GB': 'Cancel'
                },
                'id:trustCode_qcl': {
                    'en_GB': 'Product Name'
                },
                'class:trustName_qcl': {
                    'en_GB': 'Product Description'
                },
                'class:SpecialPlanState_qcl': {
                    'en_GB': 'Product Status'
                },
                'id:assetType_qcl': {
                    'en_GB': 'Asset Type'
                },
                'id:assetOrigin_qcl': {
                    'en_GB': 'Organisation'
                }

            }
        });

        var userLanguage = webStorage.getItem('userLanguage');
        if (userLanguage) {
            $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
        }
        $('body').show();

        $('#QuickTrustCreation .form-control').change(function () {
            common.CommonValidation.ValidControlValue($(this));
        });

        app = new Vue({
            el: '#QuickTrustCreation',
            data: {
                trustCode: '',
                items: [],
                types: [],
                //专项计划状态
                SPS: [],
                ocode: {},
                otype: {}
                , OSPS: {}
                , trustName: ''
            },
            methods: {
                init: function () {
                    if (GSDialog.getData() == 99) {
                        sessionStorage.removeItem("nav.OrganisationCode");
                        sessionStorage.removeItem("nav.AssetType");
                    }
                    var self = this;
                    var executeParam = { SPName: 'dbo.usp_GetDimOrganisationID', SQLParams: [] };
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;
                    CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                        self.items = data;
                        self.ocode = data[0]['OrganisationCode'];
                    });

                    var executeParam = { SPName: 'dbo.usp_GetDimAssetID', SQLParams: [] };
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;
                    CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                        console.log(data);
                        self.types = data;
                        self.otype = data[0]['AssetType'];

                    });

                    //专项计划状态
                    var executeParam = { SPName: 'TrustManagement.usp_GetSpecialPlanState', SQLParams: [] };
                    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
                    CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                        self.SPS = data;
                        self.OSPS = '设计中';
                    });

                },
                //专项计划编码校验
                CodingVerification: function (obj) {
                    common.stripscript(obj.srcElement);
                }
            },
            watch: {
                otype: function (otype) {
                    sessionStorage.setItem("nav.AssetType", otype);
                    $('#AssetTypeU').val(sessionStorage.getItem("nav.AssetType"));
                    $('#dcAssetType').val(sessionStorage.getItem("nav.AssetType"));
                },
                ocode: function (ocode) {
                    sessionStorage.setItem("nav.OrganisationCode", app.ocode);
                    $('#OrganisationCodeU').val(sessionStorage.getItem("nav.OrganisationCode"));
                }

            }

        });
        app.init();

    })


})


function ShowLoad() {
    var deferred = $.Deferred();
    var userLanguage = webStorage.getItem('userLanguage');
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        ret = confirm("Do you confirm  the new trust creating？");
    } else if (checkStatus) {
        ret = confirm("确认新建产品吗？");
    }

    if (userLanguage && userLanguage.indexOf('en') > -1) {
        ret = confirm("Do you confirm  the new trust creating？");
    } else if (checkStatus) {
        ret = confirm("确认新建产品吗？");
    }

    if (!ret) return false;


    $('#loading').show()
    deferred.resolve(ret);
    return deferred.promise
}

function SubmitNew() {
    //var show = ShowLoad()
    //show().then(function () {
    //    setTimeout(function () {
    //        SubmitForm()
    //    }, 500) 
    //})

    var Vflag = common.stripscript($("#trustCode"));
    if (Vflag!=undefined) {
        return false;
    }

    if (!$('#trustCode').val()) {
        if (!$("#trustCode").attr('placeholder')) {
            $.toast({ type: 'warning', message: '请填写产品代码！' });
            return false;
        } else {
            return false;
        }
    }

    if (!$('#trustName').val()) {
        $.toast({ type: 'warning', message: '请填写产品全称！' });
        return false;
    } 
    var deferred = $.Deferred();
    var userLanguage = webStorage.getItem('userLanguage');
	var isFormValid=true;
	$('#QuickTrustCreation .form-control').each(function () {
		if (!common.CommonValidation.ValidControlValue($(this))){
			isFormValid = false;
		}
	});
	if(!isFormValid){
		return;
	}
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        GSDialog.HintWindowTF("Do you confirm  the new trust creating？", function () {
            $('#loading').show();
            deferred.resolve(true);
            deferred.promise().then(function () {
                var tcodeinfo = $('#trustCode').val();
                validTrustCodeRemote(tcodeinfo, function () {
                    SubmitForm();
                })


            }, 500)
        })
    } else if (checkStatus) {

        GSDialog.HintWindowTF("确认新建产品吗？", function () {
            $('#loading').show();
            deferred.resolve(true);
            deferred.promise().then(function () {
                var tcodeinfo = $('#trustCode').val();
                validTrustCodeRemote(tcodeinfo, function () {
                    SubmitForm();
                })


            }, 500)
        })
    }
}



function SubmitForm() {
    var tcode = $('#trustCode').val();

    if (/.*[\u4e00-\u9fa5]+.*$/.test(tcode)) // \u 表示unicode
    {
        $('#loading').hide();
        GSDialog.HintWindow("产品代码不能含有汉字！");
        return false;
    }

    var isFormFieldsAllValid = true;
    $('#QuickTrustCreation .form-control').each(function () {

        if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
    });

    if (!isFormFieldsAllValid) {
        $('#loading').hide();
        return false;
    }

    var svcUrl = webProxy.dataProcessServiceUrl + "CommonGetExecute?connConfig=TrustManagement&appDomain=TrustManagement&executeParams=";

    function GetSpecialPlanStateId() {
        if (app.OSPS == '已发行') {
            return 2
        } if (app.OSPS == '设计中') {
            return 1
        } else {
            return 1
        }
    }

    var params = [

           ['OrganisationCode', app.ocode, 'string'],
           ['AssetType', app.otype, 'string'],
            ["TrustCode", app.trustCode, "string"],
            ["TrustName", app.trustName, "string"],
            ["UserName", RoleOperate.cookieName(), "string"],
            ["SpecialPlanState", GetSpecialPlanStateId(), "string"]
    ];
    var timer;
    var promise = webProxy.comGetDataNew(params, svcUrl, 'usp_QuickCreateTrustByCode');
    promise().then(function (response) {
        var sourceData;
        if (typeof response === 'string') {
            sourceData = JSON.parse(response);
            if (GSDialog.getData() == 99) {

                sessionStorage.setItem("nav.OrganisationCode", app.ocode);
                sessionStorage.setItem("nav.AssetType", app.otype);
                $('#OrganisationCodeU').val(sessionStorage.getItem("nav.OrganisationCode"));
                $('#AssetTypeU').val(sessionStorage.getItem("nav.AssetType"));
                $('#dcAssetType').val(sessionStorage.getItem("nav.AssetType"));

                //$('#OrganisationCodeU').attr('disabled', true);
                //$('#AssetTypeU').attr('disabled',true);
                //$('#dcAssetType').attr('disabled', true);
                //$('#AssetType').attr('disabled', true);
                //$('#OrganisationCode').attr('disabled', true);
            }

            var userLanguage = webStorage.getItem('userLanguage');
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (userLanguage && userLanguage.indexOf('en') > -1) {
                    $('#loading').hide();
                    $.toast({type: 'success', message: 'create successfully', afterHidden: function () {
                        //step3资产导入模块的专项计划代号刷新
                        var executeParam = {
                            SPName: 'TrustManagement.usp_GetTrusts', SQLParams: []
                        };
                        executeParam.SQLParams.push({
                            Name: 'language', Value: 'zh-cn', DBType: 'string'
                        });
                        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

                        CallWCFSvc(serviceUrl, true, 'GET', function (data) {
                            var $sel = $('#TrustId')
                            var options = '';
                            data = data.reverse();
                            $.each(data, function (i, v) {
                                if (v.TrustId != '0') {
                                    options += '<option value="{0}">{1}</options>'.format(v.TrustId, v.TrustCode);
                                }
                            });

                            $sel.html('').append(options);
                            $sel.val(data[0].TrustId)

                            var selected = data[0].TrustId;
                            var dataItem = data.filter(function (v) {
                                return v.TrustId == selected
                            })
                            var description = "产品：" + selected + "，在资产导入向导功能下，在基础资产处进行快速新建产品操作"
                            var category = "基础资产";
                            ActLogs.insertActlogs(false, userName, '新增', category, description, ip, '', '');
                            $('#OrganisationCodeU').val(dataItem[0].OrganisationCode);
                            $('#AssetTypeU').val(dataItem[0].AssetType);
                            $('#TrustId').attr('trustCode', dataItem[0].TrustCode)
                            //项目管理下新建产品关联
                            if (enter == 'ProjectApproval') {
                                var ProjectId = webStorage.getItem('ProjectId');
                                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                                    executeParam = {
                                        SPName: "TrustManagement.usp_CreateProjectOnTrust",
                                        SQLParams: [
                                                { 'Name': 'projectId', 'Value': parseInt(ProjectId), 'DBType': 'int' },
                                                { 'Name': 'trustIdItem', 'Value': data[0].TrustId, 'DBType': 'string' }
                                        ]
                                    };
                                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                                    if (data) {
                                        console.log(data)
                                        //新建项目触发下一步点击事件
                                        var nextStepul = $('ul>li.current_li', parent.document).next();
                                        if (nextStepul) {
                                            $(nextStepul).trigger("click");
                                        } else {
                                            parent.document.location.reload();
                                        }
                                        //GSDialog.HintWindow('关联产品成功！', function () {

                                        //})
                                    }
                                });
                            }
                        });

                        //触发下一步点击事件
                        var nextStep = $('ol>li.active', parent.document).next();
                        if (nextStep) {
                            $(nextStep).trigger("click");
                        } else {
                            parent.document.location.reload();
                        }
                        }
                    })
                } else {
                    $('#loading').hide();
                    $.toast({type: 'success', message: '创建成功', afterHidden: function () {
                        //step3资产导入模块的专项计划代号刷新
                        var executeParam = { SPName: 'TrustManagement.usp_GetTrusts', SQLParams: [] };
                        executeParam.SQLParams.push({ Name: 'language', Value: 'zh-cn', DBType: 'string' });
                        var executeParams = encodeURIComponent(JSON.stringify(executeParam));
                        var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;

                        CallWCFSvc(serviceUrl, true, 'GET', function (data) {

                            var $sel = $('#TrustId')
                            var options = '';
                            data = data.reverse();
                            $.each(data, function (i, v) {
                                if (v.TrustId != '0') {
                                    options += '<option value="{0}">{1}</options>'.format(v.TrustId, v.TrustCode);
                                }
                            });

                            $sel.html('').append(options);
                            $sel.val(data[0].TrustId)

                            var selected = data[0].TrustId;
                            var dataItem = data.filter(function (v) {
                                return v.TrustId == selected
                            })
                            var description = "产品：" + selected + "，在资产导入向导功能下，在基础资产处进行快速新建产品操作"
                            var category = "基础资产";
                            ActLogs.insertActlogs(false, userName, '新增', category, description, ip, '', '');
                            $('#OrganisationCodeU').val(dataItem[0].OrganisationCode);
                            $('#AssetTypeU').val(dataItem[0].AssetType);
                            $('#TrustId').attr('trustCode', dataItem[0].TrustCode)
                            //项目管理下新建产品关联
                            if (enter == 'ProjectApproval') {
                                var ProjectId = webStorage.getItem('ProjectId');
                                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
                                    executeParam = {
                                        SPName: "TrustManagement.usp_CreateProjectOnTrust",
                                        SQLParams: [
                                                { 'Name': 'projectId', 'Value': parseInt(ProjectId), 'DBType': 'int' },
                                                { 'Name': 'trustIdItem', 'Value': data[0].TrustId, 'DBType': 'string' }
                                        ]
                                    };
                                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                                    if (data) {
                                        console.log(data)
                                        //新建项目触发下一步点击事件
                                        var nextStepul = $('ul>li.current_li', parent.document).next();
                                        if (nextStepul) {
                                            $(nextStepul).trigger("click");
                                        } else {
                                            parent.document.location.reload();
                                        }
                                        //GSDialog.HintWindow('关联产品成功！', function () {
                                            
                                        //})
                                    }
                                });
                            }
                        });

                        //触发下一步点击事件
                        var nextStep = $('ol>li.active', parent.document).next();
                        console.info(nextStep, 'nextStep')
                        if (nextStep) {
                            $(nextStep).trigger("click");
                        } else {
                            parent.document.location.reload();
                        }
                    }})
                }
            }, 500)
        }
        else {
            sourceData = response;
            if (GSDialog.getData() == 99) {
                sessionStorage.removeItem("nav.OrganisationCode");
                sessionStorage.removeItem("nav.AssetType");
            }
            GSDialog.HintWindow(response);
        }


        app.trustCode = '';
        if (GSDialog.getData() != 99) {
            GSDialog.close(0);
        }
    })
}
function Cancel() {
    if (GSDialog.getData() == 99) {
        sessionStorage.removeItem("nav.OrganisationCode");
        sessionStorage.removeItem("nav.AssetType");
    }
    GSDialog.close(0);
}

