var CheckStyle;



define(function (require) {

    var $ = require('jquery');
    var anydialog = require('anyDialog');
    //var kendoGridModel = require('app/components/assetPoolList/js/kendoGridModel');require('gs/Kendo/kendoGridModel');
    var kendoGridModel = require('gs/Kendo/kendoGridModel');
    common = require('common');
    var ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    require('asyncbox');
    var GSDialog = require("gsAdminPages")
    calendar = require('calendar');
    //require('jquery.shCircleLoader-min');
    var number = require('app/productManage/TrustManagement/Common/Scripts/format.number');
    var viewTrustWizard = require('app/productManage/TrustManagement/ViewTrustItem/viewTrustWizard');
    require('app/productManage/TrustManagement/ViewTrustItem/renderControl');
    require('knockout.validation.min');
    var GlobalVariable = require('gs/globalVariable');
    PoolCutCommon = require('app/basicAsset/js/PoolCutCommon_interface');
    //var gsUtil = require('gsUtil');
    var webStorage = require('gs/webStorage');

    var organsiationManager = new OrgansiationManager();
    organsiationManager.init();
    
    CheckStyle = function (obj) {
        var $this = $(obj);
        //var objValue = $this.val().replace(/,/g, "");
        var id = $this.parent().attr("id");
        var objValue = $this.val();
        console.log(id)

        //var regOne = new RegExp("[^-_|0-9|A-Za-z]");
        //if (regOne.test(objValue)) {
        //    $this.val("请输入合法的证券代码")
        //    objValue = "请输入合法的证券代码"
        //}
        if ($this.hasClass("theInputBorderRed")) {
            $this.removeClass("theInputBorderRed")
        }
        if (objValue.length > 10) {
            $this.val("资产方编码长度不能超过10个字节");
            $this.addClass("theInputBorderRed");
            $this.blur();
            return false
        }

        //var pattern = new RegExp("[^0-9a-zA-Z-_]");
        //var testfirst = new RegExp("[_-]");
        //if (testfirst.test(objValue.substring(0, 1))) {
        //    $this.val("首字母只能是数据或者字母");
        //    $this.addClass("theInputBorderRed");
        //    $this.blur();
        //    return false
        //}
        //if (pattern.test(objValue)) {
        //    $this.val("只能输入数字,字母,下划线,破折号的组合");
        //    $this.addClass("theInputBorderRed");
        //    $this.blur();
        //    return false
        //}
    }
    //document.getElementById("saveOrganisation").disabled = true;
    function OrgansiationManager() {
        $('#loading').hide();

        var self = this;
        self.$organisationSelect = null;
        self.isInit = false;

        function OrganisationViewModel() {
            var that = this;
            this.organisationData = {
                code: ko.observable('').extend({ required: { params: true, message: '请输入资产方编码' } })
                    .extend({ pattern: { params: '^[a-zA-Z0-9_-]*$', message: '资产方编码只能输入数字、字母和下划线' } }),
                name: ko.observable('').extend({ required: { params: true, message: '请输入资产方名称' } })
            };

            this.saveOrganisation = function (source, event) {
                //alert("test for !!");
                var authentication = webStorage.getItem('IsAdministrator');
                if (authentication == null) { }
                else {
                    var messages = that.organisationData.isValid();
                    if (messages.length === 0) {
                        $('#loading').show();
                        document.getElementById("saveOrganisation").disabled = true;
                        createOrganisation(that.organisationData, false);
                    } else {
                        GSDialog.HintWindow(messages.join('，'), "", false);
                    }
                }
            }
            this.showAssetSrc = function () {
                console.log("test for showSrc!");
                //(title, url, data, fnCallBack, width, height, size, draggable, changeallow, mask, scrolling)
                GSDialog.open('现有资产来源', './showAssetSource.html?UserName=' + 'goldenstand', 1, function (result) {
                }, parseInt(window.parent.innerWidth * 3 / 5), parseInt(window.parent.innerHeight * 4 / 5),null,true,true,true,false);
            }

            // 保持资产来源
            function createOrganisation(organisationData, override) {
                createWcfOrganisation(that.organisationData, override).done(function (response) {
                    
                    var data = JSON.parse(response);
                    if (data.length > 0) {
                        if (data[0].Result === 'OK') {
                            setOrganisationSelect(that.organisationData.code(), that.organisationData.name());
                            $('#modal-close').trigger('click');
                            $('#loading').hide();
                            GSDialog.HintWindow('新建资产来源成功！', "", false);
                            document.getElementById("saveOrganisation").disabled = false;
                        } else if (data[0].Result === 'CODEEXIST') {
                            $('#loading').hide();
                            document.getElementById("saveOrganisation").disabled = false;
                            GSDialog.HintWindowTF('资产方编码(' + data[0].OrganisationCode + ')已经存在，点击确定更新该资产来源？', function () {
                                createOrganisation(organisationData, true);
                                $('#loading').show();
                                document.getElementById("saveOrganisation").disabled = true;
                            }, "", false)
                        } else if (data[0].Result === 'NAMEEXIST') {
                            $('#loading').hide();
                            document.getElementById("saveOrganisation").disabled = false;
                            GSDialog.HintWindow('资产方名称('  + data[0].OrganisationDesc + ')已经存在。', "", false);
                        } else if (data[0].Result === 'ASSETEXIST') {
                            $('#loading').hide();
                            console.log("test for yif in assetexist");
                            document.getElementById("saveOrganisation").disabled = false;
                            GSDialog.HintWindow('资产来源(' + data[0].OrganisationCode + ', ' + data[0].OrganisationDesc + ')已经存在。', "", false);
                        }
                    }
                }).fail(function (reason) {
                    GSDialog.HintWindow('error' + reason);
                });
            }
            
        };
        
        self.init = function () {
            // 打开新增资产窗口
           
                self.$organisationSelect = $(event.target).parent().parent('.autoLayout-plugins').find('select');
                console.log(self.$organisationSelect);
                if (self.$organisationSelect.length === 0) {
                    console.log('ERROR to get organisation selector!!');
                    console.log(self.$organisationSelect + "enter if");
                }

                if (!self.isInit) {
                    var knockoutValidationSettings = {
                        insertMessages: false,
                        decorateElement: true,
                        errorMessageClass: 'red-border',
                        errorElementClass: 'red-border',
                        errorClass: 'red-border',
                        decorateInputElement: true
                    };

                    var orgViewModel = new OrganisationViewModel();
                    ko.applyBindingsWithValidation(orgViewModel, document.getElementById('addOrganisation'), knockoutValidationSettings);
                    orgViewModel.organisationData.isValid = ko.validation.group(orgViewModel.organisationData);
                    self.isInit = true;
                }

                //self.dialog = $.anyDialog({
                //    width: 450,
                //    height: 200,
                //    title: lang.AddOrganisation,
                //    html: $('#addOrganisation').show(),
                //    onClose: function () {
                //    }
                //});

        }

        // Updaget organsition select controller
        function setOrganisationSelect(code, name) {
            var $option = self.$organisationSelect.find('option[value=' + code + ']');
            if ($option.length > 0) {
                $option.html(name);
            } else {
                var $newOption = $("<option>").val(code).text(name);
                self.$organisationSelect.append($newOption);
            }

            self.$organisationSelect.val(code);
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

        function createWcfOrganisation(orgData, override) {
            var sequenceNo = 0;
            var executeParam = { SPName: 'dbo.usp_GetDimOrganisation', SQLParams: [] };
            var executeParams = encodeURIComponent(JSON.stringify(executeParam));
            var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;
            CallWCFSvc(serviceUrl, false, 'GET', function (datas) {
                sequenceNo = datas.length+1;
            });
            console.log(sequenceNo + 'yif test for');
            var itemXml = '<item>'
                            + '<CategoryCode>OrganisationName</CategoryCode>'
	                        + '<CodeDictionaryCode>' + orgData.code() + '</CodeDictionaryCode>'
	                        + '<Value>' + orgData.name() + '</Value>'
                            + '<SequenceNo>' + sequenceNo + '</SequenceNo>'
                        + '</item>';
            var orgParam = {
                "SPName": "usp_InsertDimOrganisation",
                "SQLParams": [
                    {
                        "Name": "Item",
                        "value": itemXml,
                        "DBType": "xml"
                    },
                    {
                        "Name": "Override",
                        "value": override,
                        "DBType": "bool"
                    }
                ]
            };

            return getWcfCommon(orgParam);
        }
        //var executeParam = { SPName: 'dbo.usp_GetDimOrganisationID', SQLParams: [] };
        //var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        //var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=TrustManagement&exeParams=' + executeParams;
        //CallWCFSvc(serviceUrl, true, 'GET', function (data) {
        //    var $sel = $('#organisationCodeU')
        //    var options = '';
        //    $.each(data, function (i, v) {
        //        options += '<option value="{0}">{1}</options>'.format(v.OrganisationCode, v.OrganisationCode);
        //    });
        //    $sel.append(options);

        //});

        //$('#nowOrganisation .form-control').change(function () {
        //    common.CommonValidation.ValidControlValue($(this));
        //});
        //var $org = $('#organisationCodeU')
        //$org.change(function (e) {
        //    var selectedorg = e.target.value;
        //    sessionStorage.setItem("nav.organisationCodeU", selectedorg);
        //    $('#organisationCodeU').val(sessionStorage.getItem("nav.organisationCodeU"));
        //})
        
        //function reloadTrusdId() {
        //    //现有资产来源获取
        //    var executeParam = { SPName: 'dbo.usp_GetDimOrganisationID', SQLParams: [] };
        //    var executeParams = encodeURIComponent(JSON.stringify(executeParam));
        //    var serviceUrl = GlobalVariable.PoolCutServiceURL + 'CommonGet?connName=PoolCut_Database&exeParams=' + executeParams;

        //    CallWCFSvc(serviceUrl, true, 'GET', function (data) {

        //        var $sel = $('#organisationNameU')
        //        var options = '';
        //        //data = data.reverse();
        //        $.each(data, function (i, v) {
        //            if (v.DimOrganisationID != '0') {
        //                options += '<option value="{0}">{1}</options>'.format(v.OrganisationCode, v.OrganisationDesc);
        //            }
        //        });
        //        $sel.append(options);
        //        $sel.val(data[0].OrganisationDesc);
        //        $('#organisationCodeU').val(data[0].OrganisationCode);
                
        //        $sel.change(function (e) {
        //            var selected = e.target.value;
        //            var dataItem = data.filter(function (v) {
        //                return v.OrganisationCode == selected
        //            })
        //            $('#organisationCodeU').val(dataItem[0].OrganisationCode);
        //            $('#organisationNameU').attr('OrganisationDesc', dataItem[0].OrganisationDesc)
        //        })
        //        $sel.change();
        //        $('#loading').hide();
        //    });
        //}
    }

});