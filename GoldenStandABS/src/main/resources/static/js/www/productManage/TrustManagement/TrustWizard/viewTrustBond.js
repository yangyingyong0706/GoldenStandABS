

define(function (require) {
    var $ = require('jquery');
    var ko = require('knockout');
    var komapping = require('knockout.mapping');
    ko.mapping = komapping;
    var number = require('app/productManage/TrustManagement/Common/Scripts/format.number');
    var viewTrustWizard = require('app/productManage/TrustManagement/TrustWizard/viewTrustWizard');
    require('app/productManage/Scripts/renderControl');
    require('knockout.validation.min');
    var WcfProxy = require('app/productManage/Scripts/wcfProxy');

    var TrustBondModule = (function () {
        var viewModel;
        var defaultTemp;
        var titles = {};
        var myModel = {
            GridView: ko.observableArray(),
            Detail: ko.observableArray(),
            SelectCompulsory: ko.observableArray(),
            DDL: {
                RatingAgent: [],//评级机构
            },
            IsPrincipalScheduleShow: ko.observable(false),
            PrincipalSchedules: ko.observableArray(),
            MultipleRatings:ko.observableArray(),
            //加了这个函数,为所有需要显示成会计格式且取值为ItemValue的项绑定keyup事件。PS：OfferAmount的（募集规模/每份面值）不能超过10位
            logkeyupItemValue: function (indexF, id, data, event) {
                //var number = new FormatNumber();
                number.checkNumberFunc({}, event, function (v) {
                    data.ItemValue(v.toString())
                });
                var input = $(id);
                validControlValue(input);
            },
            logkeyup: function (indexF, data, event) {
                //var number = new FormatNumber();
                number.checkNumberFunc({}, event, data.PlanPayAmount);
                var index = indexF();
                index = ((index + 1) * 2) - 1;
                var input = $("#PrincipalPaymentSchedule").find("input").eq(index);
                validControlValue(input);
            },
            formatp: function (p) {
                //var number = new FormatNumber();
                if (parseFloat(p) == p) {
                    var ret = number.convertNumberN(1, p);
                    return ret;
                }
                else
                    return p;
            },
        }


        //数据绑定
        var dataBinding = function (dealNode, dataGrid, detail, ratingAgent, trustBondRating) {
            defaultTemp = detail;
            editPaymentSequence(); //根据TrustId显示出分层顺序
            myModel.DDL.RatingAgent = ratingAgent;   //给评级机构数组赋值
            $.each(detail, function (i, d) {
                d['IsDisplay'] = false;
                d['IsNew'] = false;
                if (d.IsCompulsory == "True") {
                    d.IsDisplay = true;
                    if (d.ItemCode == "PrincipalSchedule" || d.ItemCode == "PaymentFrequence" || d.ItemCode == "MultipleRatings") {
                        d.IsDisplay = false;
                    }
                }
                else {
                    d.IsDisplay = false;
                    myModel.SelectCompulsory.push(d);
                }
                titles[d.ItemCode] = d.ItemAliasValue; //用于GridView Header

                myModel.Detail.push(d);
            });

            //改动
            /*
            $.each(dataGrid, function (i, d) {
                if (d.ItemCode == 'OfferAmount') {
                    d.ItemValue = myModel.formatp(d.ItemValue);
                    console.log("This is afterTansfer ItemValue");
                    console.log(d.ItemValue);
                }
            });*/     
    
            jsonToGridView(dataGrid, trustBondRating); //如何Trust id不为空获取所有TrustBondItem       
            viewModel = ko.mapping.fromJS(myModel);
            ko.applyBindings(viewModel, dealNode);

            generateMultipleRatings("");
            setDatePlugins();
        };



        var date = new Date();
        var today = (date.getFullYear()) + '-' + (date.getMonth() + 1) + '-' + date.getDate();

        formatDate = function () {
            var year = date.getFullYear();
            var month = (date.getMonth() + 1);
            var day = date.getDate()
            var l_month = month.toString().length;
            if (l_month < 2) {
                month = "0" + month.toString();
            }
            var l_day = day.toString().length;
            if (l_day < 2) {
                day = "0" + day.toString();
            }
            today = year + '-' + month + '-' + day;
        };

        //编辑偿付顺序
        function editPaymentSequence() {
            if (trustId == 0) {
                $("#editPaymentSequence").css('display', 'none');
            }
            else {
                $("#editPaymentSequence").css('display', 'block');
                $("#editPaymentSequenceBtn").click(function () {
                    var url = '../TrustManagement/PaymentSetWizard/PaymentSetWizard.html?tid=' + trustId;
                    //var executeParam = {
                    //    'SPName': "usp_GetCurrentActiveClient", 'SQLParams': []
                    //};

                    //var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

                    //ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    //    if (data.length > 0)
                    //    {
                    //        var clientCode = data[0].ClientCode;
                    //        if (clientCode == "HNGTrust")
                    //        {
                    //            url = '../Clients/HNGTrust/FeeSettings/PaymentSequenceSetting.html?tid=' + trustId;
                    //        }
                    //    }
                    
                    //});

                   window.open(url, '_blank');
               
               
                    //$.showModalDialog({
                    //    title: '维护分层偿付顺序',
                    //    url: url,
                    //    height: 600,
                    //    width: 1100,
                    //    scrollable: false
                    //    //, onClose: function () { var returnedValue = this.returnValue; }
                    //});
                });
                $("#editFeeSettingsBtn").click(function () {
                
                    var url = '../../components/FeeSettings/feesettings.html?tid=' + trustId;
                    window.open(url, '_blank')
                });
            }
        }


        getItemAliasValueByCode = function (itemCode) {
            var item = getDefaultItem(itemCode);
            if (item == null) {
                return "";
            }
            else {
                return item.ItemAliasValue;
            }
        };

        //创建一个动态字段
        createCompulsory = function () {
            var itemCode = $('#tb_CompulsoryDDL').val();
            if (itemCode != null) {
                var detail = viewModel.Detail();
                var itemT;
                $.each(detail, (function (i, item) {
                    if (item.ItemCode() == itemCode) {
                        item.IsDisplay(true);
                        item.IsNew(true);
                        itemT = item;
                    }

                }));
                viewModel.Detail.remove(itemT);
                viewModel.Detail.push(itemT);
            }
        };

        //删除动态字段
        removeCompulsory = function (obj) {
            var itemCode = $(obj).attr('itemCode');
            var detail = viewModel.Detail();
            $.each(detail, (function (i, item) {
                if (item.ItemCode() == itemCode) {
                    item.ItemValue("");
                    item.IsDisplay(false);
                    item.IsNew(false);
                }
            }));
        };

        openBondInterestAdjustment = function (obj) {
            var rowindex = $(obj).attr('rowindex');

            var itemCode = $(obj).attr('itemCode');
            var IssueDate, LegalMaturityDate;
            var detail = viewModel.Detail();
            var tbid = detail.length > 0 ? detail[0].TBId() : '';
            $.each(detail, (function (i, item) {
                if (item.ItemCode() == 'IssueDate') {
                    IssueDate = item.ItemValue();
                } else if (item.ItemCode() == 'LegalMaturityDate') {
                    LegalMaturityDate = item.ItemValue();
                }
            }));
            window.open('TrustWizard/TrustBondInterestAdjustment.html?trustId={0}&trustBondId={1}&start={2}&end={3}'.format(trustId, tbid, IssueDate, LegalMaturityDate), '_blank');
        }

        addRating = function () {
            var rating = { RatingDate: "", AgentId: "", Rating: "", IsPlus: true };
            var knrating = ko.mapping.fromJS(rating);//转换成knockout能用的类型
            viewModel.MultipleRatings.push(knrating);
            $("#DivRatingDialog").find(".date-plugins").date_input();
        }

        removeRating = function (obj) {
            var index = $(obj).attr('dataIndex');
            var item = viewModel.MultipleRatings()[index];
            viewModel.MultipleRatings.remove(item);
        }

        addPPS = function () {
            var ps = { PlanPayDate: "", PlanPayAmount: '', IsPlus: false };
            var p = ko.mapping.fromJS(ps);//转换成knockout能用的类型
            viewModel.PrincipalSchedules.push(p);
            setDatePlugins();
        }

        removePPS = function (obj) {
            var index = $(obj).attr('dataIndex');
            var item = viewModel.PrincipalSchedules()[index];
            viewModel.PrincipalSchedules.remove(item);
        }

        registerEvent = function () {
            
            $.getScript("./Common/Scripts/showModalDialog.js");

            $('#bn_PaymentConvention').change(function () {
                var p1 = $(this).children('option:selected').val();//这就是selected的值
                setPrincipalSchedule(p1, "");
            });
            $('#bn_CouponPaymentReference').change(function () {
                var p1 = $(this).children('option:selected').val();//这就是selected的值
                showCouponPaymentReferencePlus(p1);
            });

            $("#tb_Add").click(function () {
                if (istbAdd) { trustBond_Add(); }
                else { trustBond_Update(); }
            });
            $("#tb_Clear").click(function () {
                clear();
            });
            $("#btnMutipleRating").click(function () {
            
                $.anyDialog({
                    modal: true,
                    dialogClass: "TaskProcessDialogClass",
                    closeText: "",
                    html: $("#DivRatingDialog").show(),
                    height: 350,
                    width: 800,
                    onClose: function (event, ui) {
                        //updateDicList();
                    },
                    onMaskClick: function (event, ui) {
                        //();
                    },
                    title: "添加多家评级信息"
                });
            });

            var ratingAgencyManager = new RatingAgencyManager();
            ratingAgencyManager.init();
        };

        function RatingAgencyManager() {
            var self = this;
            self.$ratingAgencySelects = null;
            self.isInit = false;

            function RatingAgencyViewModel() {
                var that = this;
                this.ratingAgencyData = ko.observableArray([]);

                this.addRatingAgency = function (source, event) {
                    that.ratingAgencyData.push({
                        ServiceProviderId: 0,
                        ServiceProviderCode: '',
                        ServiceProviderName: ''
                    });
                }
                this.removeRatingAgency = function (index, source, event) {
                    getWcfTrustByRatingAgency(source.ServiceProviderId).done(function(response) {
                        var data = JSON.parse(response);
                        if (data.length > 0) {
                            var trustCodes = '';
                            for (var i = 0, length = data.length; i < length; i++) {
                                if (i !== 0) {
                                    trustCodes += ', ';
                                }

                                trustCodes += data[i].TrustCode;
                            }
                            alert('评级机构被专项计划（' + data[0].TrustCode + '）使用, 无法删除。');
                        } else {
                            that.ratingAgencyData.splice(index, 1);
                        }
                    });
                }

                this.saveRatingAgency = function (source, event) {
                    var messages = that.ratingAgencyData.isValid();
                    if (messages.length === 0) {
                        createRatingAgency(that.ratingAgencyData);
                    } else {
                        alert(messages.join('，'));
                    }
                }

                // 保存评级机构
                function createRatingAgency(ratingAgencyData) {
                    createWcfRatingAgency(ratingAgencyData).done(function (response) {
                        var data = JSON.parse(response);
                        if (data.length > 0) {
                            if (data[0].Result === 'OK') {
                                populateRatingAgencySelectors(ratingAgencyData);
                                $('#modal-close').trigger('click');
                            } else {
                                alert('保存失败');
                            }
                        }
                    }).fail(function (reason) {
                        alert('error' + reason);
                    });
                }
            };
            self.ratingViewModel = new RatingAgencyViewModel();
            self.init = function () {
                // 打开新增资产窗口
                $('#createRatingAgencyBtn').on('click', function (event) {
                
                    self.$ratingAgencySelects = $('#DivRatingDialog select');
                    var ratingSelect = $(event.target).parent().parent('.autoLayout-plugins').find('select');
                    if (ratingSelect.length !== 0) {
                        self.$ratingAgencySelects.push(ratingSelect.get(0));
                    }

                    self.ratingViewModel.ratingAgencyData.removeAll();
                    getWcfRatingAgency().done(function (response) {
                        var data = JSON.parse(response);
                        for (var i = 0, length=data.length; i < length; i++) {
                            self.ratingViewModel.ratingAgencyData.push(data[i]);
                        }
                    });

                    if (!self.isInit) {
                        var knockoutValidationSettings = {
                            insertMessages: false,
                            decorateElement: true,
                            errorMessageClass: 'red-border',
                            errorElementClass: 'red-border',
                            errorClass: 'red-border',
                            decorateInputElement: true
                        };

                        ko.applyBindingsWithValidation(self.ratingViewModel, document.getElementById('addRatingAgencyContainer'), knockoutValidationSettings);
                        self.ratingViewModel.ratingAgencyData.isValid = ko.validation.group(self.ratingViewModel.ratingAgencyData);
                        self.isInit = true;
                    }

                    self.dialog = $.anyDialog({
                        width: 800,
                        height: 350,
                        title: '增加评级机构',
                        html: $('#addRatingAgencyContainer').show(),
                        onClose: function () {
                        }
                    });
                });
            }

            // Updaget organsition select controller
            function populateRatingAgencySelectors(ratingAgencyData) {
                for (var j = 0, l = self.$ratingAgencySelects.length; j < l; j++) {
                    var $ratingAgencySelector = $(self.$ratingAgencySelects[j]);

                    var selectedId = $ratingAgencySelector.val();
                    $ratingAgencySelector.html('');
                    for (var i = 0, length = ratingAgencyData().length; i < length; i++) {
                        var item = ratingAgencyData()[i];
                        var $newOption = $("<option>").val(item.ServiceProviderId).text(item.ServiceProviderName);
                        $ratingAgencySelector.append($newOption);
                    }

                    $ratingAgencySelector.val(selectedId);
                }
            }

            function htmlSpecialChars(unsafe) {
                return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
            }

            function getWcfCommon(param) {
                var serviceUrl = config.tmsDataProcessBase + "CommonExecuteGet?appDomain=TrustManagement&resultType=commom&executeParams=" + encodeURIComponent(JSON.stringify(param));
                return $.ajax({
                    type: "GET",
                    url: serviceUrl,
                    dataType: "jsonp",
                    crossDomain: true,
                    contentType: "application/json;charset=utf-8"
                });
            }

            function getWcfTrustByRatingAgency(ratingAgencyId) {
                var ratingAgencyParam = {
                    "SPName": "usp_GetTrustByRatingAgency",
                    "SQLParams": [
                        {
                            "Name": "ServiceProviderId",
                            "value": ratingAgencyId,
                            "DBType": "int"
                        }
                    ]
                };

                return getWcfCommon(ratingAgencyParam);
            }

            function getWcfRatingAgency() {
                var ratingAgencyParam = {
                    "SPName": "usp_GetServiceProviderByType",
                    "SQLParams": [
                        {
                            "Name": "Type",
                            "value": "RatingAgency",
                            "DBType": "string"
                        }
                    ]
                };

                return getWcfCommon(ratingAgencyParam);
            }

            function createWcfRatingAgency(ratingAgencyData) {
                var itemsXml = '<items>';
                for (var i = 0, length = ratingAgencyData().length; i < length; i++) {
                    var item = ratingAgencyData()[i];
                    itemsXml += '<item>'
                                + '<Id>' + item.ServiceProviderId + '</Id>'
                                + '<Name>' + htmlSpecialChars(item.ServiceProviderName) + '</Name>'
                                + '<Code>' + htmlSpecialChars(item.ServiceProviderCode) + '</Code>'
                            + '</item>';
                }   
                itemsXml += '</items>';
                var ratingAgencyParam = {
                    "SPName": "usp_UpdateRatingAgency",
                    "SQLParams": [
                        {
                            "Name": "Item",
                            "value": itemsXml,
                            "DBType": "xml"
                        }
                    ]
                };

                return getWcfCommon(ratingAgencyParam);
            }
        }

        var editIndex = 0;//编辑时设置index
        var istbAdd = true;

        //改了这里，新添加的得到总金额的函数


        //添加新分层
        trustBond_Add = function () {
            var pass = validation();
            if (pass) {
                var detail = viewModel.Detail();
                var newItem = { TBId: viewModel.GridView().length };
                var SecurityExchangeCodes = [], SecurityExchangeCode;
                $.each(viewModel.GridView(), function (i,item) {
                    SecurityExchangeCodes.push(item.SecurityExchangeCode());
                });
                $.each(detail, function (i, item) {

                    if (item.ItemCode() == "SecurityExchangeCode") {
                        SecurityExchangeCode = item.ItemValue();
                    }

                    if (item.ItemCode() == "PrincipalSchedule") {
                        var principalSchedule = getPrincipalSchedule();
                        newItem[item.ItemCode()] = principalSchedule;
                        console.log("This is add planpayamount");
                    }
                    else if (item.ItemCode() == "MultipleRatings") {
                        newItem[item.ItemCode()] = ko.mapping.toJSON(viewModel.MultipleRatings());
                    }
                    else {
                        newItem[item.ItemCode()] = item.ItemValue();
                        if (item.ItemCode() == "OfferAmount") {
                            console.log("This is item.Value");
                            console.log(item.ItemValue());
                        }
                    }
                });

                if ($.inArray(SecurityExchangeCode, SecurityExchangeCodes)!=-1) {
                    alert('分层信息已存在!');
                    return false;
                } else {
                    //转换成knockout需要的
                    newItem = ko.mapping.fromJS(newItem);
                    //这样item里包含模板的所有字段,写入Grid
                    viewModel.GridView.push(newItem);
                    //初始化Detail为最初状态
                    initDetail();
                }
                //清空已有显示内容
                clear();
                istbAdd = true;//状态为添加
            }
        };

        //点击编辑获取详情页
        trustBond_Detail = function (obj) {
            istbAdd = false;
            initDetail(); //初始化Detail为最初状态
            clear();//清空已有显示内容

            editIndex = $(obj).attr('dataIndex');
            var item = viewModel.GridView()[editIndex];
            for (var key in item) {
                //key就是ItemCode
                if (key != "__ko_mapping__" && key != "PrincipalSchedule"&& key!= "MultipleRatings") {
                    var detail = viewModel.Detail();
                    $.each(detail, function (i, d) {
                        d.TBId(item.TBId());
                        if (d.ItemCode() == key) {
                            var itemValue = item[key]();

                            if (d.DataType().toLocaleLowerCase() == 'bool' && typeof itemValue == "string") {
                                var c = (itemValue == "1" || itemValue.toLocaleLowerCase() == "true");
                                itemValue = c;
                                //console.log(key + ":" + c);
                            }

                            if (typeof itemValue == 'boolean' || (typeof itemValue == 'string' && itemValue != "")) {
                                d.ItemValue(itemValue);
                                if (d.IsCompulsory() == "False") {
                                    d.IsDisplay(true);
                                    d.IsNew(true);
                                }
                            }
                        }
                    })
                }
            }
        
            //设置附加的那些属性,分期是否显示
            setPrincipalSchedule(item.PaymentConvention(), item.PrincipalSchedule());
            generateMultipleRatings(item.MultipleRatings());
            showCouponPaymentReferencePlus(item.CouponPaymentReference());
            setDatePlugins();
           // validation();
           // $('#TrustItem_Detail .col-6').eq(2).find('.form-control').attr('disabled', 'disabled');
            $("#tb_Add").val("更新");
            $("#tb_name").html("更新分层");
            $('#SecurityExchangeCode input').prop("disabled", true);
        };

        //更新新分层
        trustBond_Update = function () {
            var pass = validation();
            if (pass) {
                var item = viewModel.GridView()[editIndex];//里面包含所有属性
                var detail = viewModel.Detail();
                $.each(detail, function (i, d) {
                    var code = d.ItemCode();
                    for (var key in item) {
                        //Key就是ItemCode
                        if (key == code) {
                            item[key](d.ItemValue());
                        }
                    }
                })
                //放在最后否则会为上面循环覆盖掉
                item.PrincipalSchedule(getPrincipalSchedule());          
                item.MultipleRatings(ko.mapping.toJSON(viewModel.MultipleRatings()));
                showCouponPaymentReferencePlus(item.CouponPaymentReference());
                $("#tb_Add").val("添加");
                $("#tb_name").html("添加分层");
                initDetail(); //初始化Detail模板
                $('#SecurityExchangeCode input').prop("disabled", false);
                //clear();//清空
                istbAdd = true;//状态变为添加
            }
        };

        //删除一个分层
        trustBond_Delete = function (obj) {
            var index = $(obj).attr('dataIndex');
            var oNew = viewModel.GridView()[index];
            viewModel.GridView.remove(oNew);
            //状态为添加
            istbAdd = true;
            initDetail(); //初始化Detail模板
            clear();//清空
            $("#tb_Add").val("添加");
            $("#tb_name").html("添加分层");
        };

        clear = function () {
            var detail = viewModel.Detail();
            $.each(detail, function (i, item) {
                item.TBId(0);
                var dataType = item.DataType().toLocaleLowerCase();
                if (dataType == "bool") {
                    item.ItemValue("0");
                }
                else {
                    if (dataType != "select") {
                        item.ItemValue("");
                    }
                }
            });

            if (viewModel.IsPrincipalScheduleShow) {
                var ps = viewModel.PrincipalSchedules();
                $.each(ps, function (j, p) {
                    p.PlanPayDate("");
                    p.PlanPayAmount("");
                });
            }

            //清空ratings
            generateMultipleRatings("");

            $('#SecurityExchangeCode input').prop("disabled", false);

        }

        //删除所有动态字段从Detail模板,初始化状态
        initDetail = function (obj) {
            var detail = viewModel.Detail();

            $.each(detail, function (i, item) {
                item.TBId(0);
                if (item.ItemCode() == "PaymentConvention") {
                    var valueShort = getCodeDictionaryFristValueShort("PaymentConvention");
                    item.ItemValue(valueShort);
                }
                else if (item.ItemCode() == "CouponPaymentReference") {
                    var valueShort = getCodeDictionaryFristValueShort("CouponPaymentReference");
                    item.ItemValue(valueShort);
                    showCouponPaymentReferencePlus(valueShort);
                }
                else if (item.ItemCode() == "PaymentFrequence") {
                    var valueShort = getCodeDictionaryFristValueShort("PaymentFrequence");
                    item.ItemValue(valueShort);
                    item.IsDisplay(false);
                }
                else if (item.ItemCode() == "CouponPaymentReference") {
                    var valueShort = getCodeDictionaryFristValueShort("CouponPaymentReference");
                    item.ItemValue(valueShort);
                }
                else if (item.DataType() == "Date") {
                    item.ItemValue("");
                }
                else if (item.ItemCode() == "RatingAgent") {
                    var spid = viewModel.DDL.RatingAgent()[0].SPId();
                    item.ItemValue(spid);
                }

                if (item.IsNew()) {
                    item.IsNew(false);
                    item.IsDisplay(false);
                }
            });

            viewModel.IsPrincipalScheduleShow(false);

            //清空附加信心
            var ary = viewModel.PrincipalSchedules();
            ary.splice(0, ary.length);
            //清空多家评级信息
            generateMultipleRatings("");
            console.log(ary);// 清空
            setDatePlugins();
            $("#tb_Add").val("添加");
            $("#tb_name").html("添加分层");
        }

        getCodeDictionaryValueShort = function (categoryCode, codeDictionaryCode) {
            //OptionSource 在viewTrustWizard.js里全局变量
            if (OptionSource != null) {
                var items = $.grep(OptionSource, function (item) {
                    return item.CategoryCode == categoryCode && item.CodeDictionaryCode == codeDictionaryCode;
                });
                if (items.length > 0) {
                    return items[0].ValueShort;
                }
            }
            else {
                return "";
            }
        }

        getCodeDictionaryFristValueShort = function (categoryCode) {
            //OptionSource 在viewTrustWizard.js里全局变量
            if (OptionSource != null) {
                var items = $.grep(OptionSource, function (item) {
                    return item.CategoryCode == categoryCode;
                });
                if (items.length > 0) {
                    return items[0].ValueShort;
                }
            }
            else {
                return "";
            }

        }
        //获取还款方式
        getPrincipalSchedule = function () {
            var ppsStr = "";
            var psShow = viewModel.IsPrincipalScheduleShow();
            if (psShow) {
                var ps = viewModel.PrincipalSchedules();
                $.each(ps, function (i, item) {
                    ppsStr = ppsStr + item.PlanPayDate() + ":" + item.PlanPayAmount() + ";";
                });
                ppsStr = ppsStr.substring(0, ppsStr.length - 1);
            }
            return ppsStr;
        };

        setPrincipalSchedule = function (pc, pps) {
            //还款方式
            var OnceOffPIPaymentValue = getCodeDictionaryValueShort("PaymentConvention", "OnceOffPIPayment");//一次性还本付息
            var PlanPScheduledValue = getCodeDictionaryValueShort("PaymentConvention", "PlanPScheduledI");//计划还本，按期付息
            if (pc == "") {
                viewModel.IsPrincipalScheduleShow(false);
                $.each(viewModel.Detail(), function (i, item) {
                    if (item.ItemCode() == "PaymentFrequence") {
                        item.IsDisplay(false);
                    }
                });
                return;
            }
            else if (pc == OnceOffPIPaymentValue) {
                viewModel.IsPrincipalScheduleShow(false);
                $.each(viewModel.Detail(), function (i, item) {
                    if (item.ItemCode() == "PaymentFrequence") {
                        item.IsDisplay(false);
                    }
                });
                return;
            }
            else if (pc == PlanPScheduledValue) {
                viewModel.IsPrincipalScheduleShow(true);
                $.each(viewModel.Detail(), function (i, item) {
                    if (item.ItemCode() == "PaymentFrequence") {
                        item.IsDisplay(true);
                    }
                });

                var ary = viewModel.PrincipalSchedules();
                if (pps == "") {
                    if (ary.length == 0) {
                        var ps0 = { PlanPayDate: "", PlanPayAmount: "", IsPlus: true };
                        var p0 = ko.mapping.fromJS(ps0);//转换成knockout能用的类型
                        viewModel.PrincipalSchedules.push(p0);
                    }
                }
                else {
                    ary.splice(0, ary.length);
                    console.log(ary);// 清空
                    var arr = pps.split(';');
                    var length = arr.length;
                    if (length == 1) {
                        var ps1 = { PlanPayDate: arr[0].split(':')[0], PlanPayAmount: arr[0].split(':')[1], IsPlus: true };
                        var p1 = ko.mapping.fromJS(ps1);//转换成knockout能用的类型
                        viewModel.PrincipalSchedules.push(p1);
                    }
                    else {
                        var ps2 = { PlanPayDate: arr[0].split(':')[0], PlanPayAmount: arr[0].split(':')[1], IsPlus: true };
                        var p2 = ko.mapping.fromJS(ps2);//转换成knockout能用的类型
                        viewModel.PrincipalSchedules.push(p2);
                        for (var i = 1; i < length; i++) {

                            var ps3 = { PlanPayDate: arr[i].split(':')[0], PlanPayAmount: arr[i].split(':')[1], IsPlus: false };
                            var p3 = ko.mapping.fromJS(ps3);//转换成knockout能用的类型
                            viewModel.PrincipalSchedules.push(p3);
                        }
                    }
                }
            }
            else {
                viewModel.IsPrincipalScheduleShow(false);
                $.each(viewModel.Detail(), function (i, item) {
                    if (item.ItemCode() == "PaymentFrequence") {
                        item.IsDisplay(true);
                    }
                });
                return;
            }
            setDatePlugins();

        };

        generateMultipleRatings = function (ratings)
        {
            //MultipleRatings        
            if (ratings == "") {
                //默认存在一条空模板   
                viewModel.MultipleRatings().splice(0, viewModel.MultipleRatings().length);
                var rating = { RatingDate: "", AgentId: "", Rating: "", IsPlus: false };
                var knrating = ko.mapping.fromJS(rating);//转换成knockout能用的类型
                viewModel.MultipleRatings.push(knrating);
            }      
            else {
                viewModel.MultipleRatings().splice(0, viewModel.MultipleRatings().length);
                viewModel.MultipleRatings(jQuery.parseJSON(ratings));
            }
            $("#DivRatingDialog").find(".date-plugins").date_input();
        }

        showCouponPaymentReferencePlus = function (pc) {
            if (pc == '浮动利率')
                $('#TrustBondModule_btn_CouponPaymentReference').show();
            else
                $('#TrustBondModule_btn_CouponPaymentReference').hide();
        }

        //根据获取到Json组织需要的Json数组
        jsonToGridView = function (trustBondItems, trustBondRating) {
            var go = true;
            var tbId = 0;
            while (go) {
                var row = $.grep(trustBondItems, function (trustItem) {
                    return trustItem.TBId == tbId;
                })

                if (row.length == 0) {
                    go = false;
                }
                else {
                    var gridItem = { TBId: tbId };
                    var spId = 1;
                    var ocr = "";
                    var tbr = getTrustBondRating(trustBondRating, tbId);
                    if (tbr != null) {
                        spId = tbr.SPId;
                        ocr = tbr.ItemValue;
                    }
                    //排序
                    row = row.sort(function (a, b) {
                        return parseInt(a.SequenceNo) - parseInt(b.SequenceNo)
                    });

                    for (var i = 0, l = row.length; i < l; i++) {
                        if (row[i].ItemCode == "RatingAgent") {
                            gridItem["RatingAgent"] = spId;
                        }
                        else if (row[i].ItemCode == "OriginalCreditRating") {
                            gridItem["OriginalCreditRating"] = ocr;
                        }
                        else {
                            gridItem[row[i].ItemCode] = row[i].ItemValue;
                        }
                    }

                    myModel.GridView.push(gridItem);

                }
                tbId++;

            }
        };


        //根据Tbid，获取评级机构和评级
        getTrustBondRating = function (trustBondRating, tbId) {
            if (!trustBondRating || trustBondRating.length < 1) {
                return null;
            }
            var rows = $.grep(trustBondRating, function (tbr) {
                return tbr.TBId == tbId;
            })

            if (rows.length > 0) {
                return rows[0];
            }
            else {
                return null;
            }
        }


        getDefaultItem = function (itemCode) {
            var item = $.grep(defaultTemp, function (trustItem) {
                return trustItem.ItemCode == itemCode;
            });

            if (item.length > 0) {
                return item[0];
            }
            else {
                return null;
            }
        }



        //将TrsutBonds集合转化成Json
        getSubmitJson = function () {
            var ary = [];
            var aryTBR = [];
            var grid = viewModel.GridView();
            console.log("This is gridview");
            console.log(grid);
            $.each(grid, function (j, item) {
                var tbr = { Category: "TrustBondRating", SPId: item.RatingAgent(), SPCode: "", SPRItemCode: "", TBId: j, ItemId: "", ItemCode: "", ItemValue: item.OriginalCreditRating(), DataType: "", UnitOfMeasure: "", Precise: "" };
                aryTBR.push(tbr);
                for (var key in item) {
                    //key就是ItemCode
                    if (key != "__ko_mapping__" && key != "RatingAgent" && key != 'TBId') {
                        //如果ItemValue不为空,就添加到数组里
                        if (item[key]() != "") {
                            var item_d = getDefaultItem(key);
                            if (item_d != null) {
                                var cc = { Category: "TrustBondItem", SPId: "", SPCode: "", SPRItemCode: "", TBId: j, ItemId: item_d.ItemId, ItemCode: key, ItemValue: item[key](), DataType: item_d.DataType, UnitOfMeasure: item_d.UnitOfMeasure, Precise: item_d.Precise };
                                ary.push(cc);
                            }
                            else {
                                alert("TrustBond Error: create submit Json error");
                            }
                        }
                    }
                }
            });

            $.each(aryTBR, function (a, t) {
                ary.push(t);
            });

            var json = ko.mapping.toJSON(ary);
            if (json == "[]") {
                return "";
            }
            json = json.substring(1, json.length - 1) + ",";

            $("#divTrustBondShow").html(json);
            return ary;
        };

        preView = function () {
            var executeParam = {
                SPName: 'usp_GetTrustBondInfo', SQLParams: [
                    //{ Name: 'trustId', value: trustId, DBType: 'int' }
                    { Name: 'trustId', value: trustId, DBType: 'int' }
                ]
            };
            var listData = WcfProxy.getSourceData(executeParam);
            var div = '<div class="ItemBox"><h3 class="h3">分层信息</h3><div class="ItemInner">{0}</div></div>';
            if (listData && listData[0]) {
                var table = '<table class="table"><tbody>';
                var key = 0;
                $.each(listData[0], function (data) {
                    table += '<tr id="bondkey-' + key + '"><td width="110" style="background:#cadaf6">' + data + '</td></tr>';
                    key++;
                });
                table += '</tbody></table>';
                key = 0;
                $table = $(table);
                $.each(listData, function (i, d) {
                    $.each(d, function (t, b) {
                        $('<td>' + b + '</td>').appendTo($table.find('#bondkey-' + key));
                        key++;
                    });
                    key = 0;
                });
                table = $table[0].outerHTML;
                div = div.format(table);
            }else{
			    div = div.format('暂无数据');
		    }
            return div;
        };

        setDatePlugins = function () {
            $("#TrustBondDiv").find('.date-plugins').date_input();
        }

        validation = function () {
            var pass = true;
            var detail = $("#TrustItem_Detail").find("input");
            var pps = $("#PrincipalPaymentSchedule").find("input");
            pass = viewTrustWizard.api.validControls(detail);
            if (viewModel.IsPrincipalScheduleShow()) {
                var pass2 = viewTrustWizard.api.validControls(pps);
                if (pass) {
                    pass = pass2;
                }
            }
            return pass;
        }

        renderTitle = function (itemCode) {
            return titles[itemCode];
        }

        return {
            DataBinding: dataBinding,
            CreateCompulsory: createCompulsory,
            RemoveCompulsory: removeCompulsory,
            OpenBondInterestAdjustment: openBondInterestAdjustment,
            AddPPS: addPPS,
            RemovePPS: removePPS,
            AddRating: addRating,
            RemoveRating: removeRating,
            RegisterEvent: registerEvent,
            FormatDate: formatDate,
            TrustBond_Detail: trustBond_Detail,
            TrustBond_Delete: trustBond_Delete,
            SubmitJson: getSubmitJson,
            PreView: preView,
            Validation: validation,
            RenderTitle: renderTitle,
        };
    })();

    ko.bindingHandlers.renderTitle = {
        init: function (element, valueAccessor) {
            var itemCode = valueAccessor();
            var html = "<span>" + TrustBondModule.RenderTitle(itemCode) + "</span>";
            $(html).appendTo($(element));
        }
    }

    function TrustBond() {

    }

    TrustBond.prototype = {
        init: function () {
            var dealNode = document.getElementById('TrustBondDiv');
            var dataGrid = this.getCategoryData("TrustBondItem");
            console.log(dealNode);
            console.log("This is dataGrid!");
            console.log(dataGrid);
            var ratingAgent = this.getCategoryData("RatingAgency");

            var detail = this.getCategoryData("TrustBondItemDefault");

            var trustBondRating = this.getCategoryData("TrustBondRating");

            if (detail.length == 0) {
                alert("TrustBond Error: TrustBondItemDefault未获取到数据");
            }
            if (ratingAgent.length == 0) {
                alert("TrustBond Error: RatingAgency未获取到数据");
            }
            TrustBondModule.FormatDate();
            
            TrustBondModule.DataBinding(dealNode, dataGrid, detail, ratingAgent, trustBondRating);
            TrustBondModule.RegisterEvent();
        },

        update: function () {
            return TrustBondModule.SubmitJson();
        },

        preview: function () {
            return TrustBondModule.PreView();
        },

        validation: function () {
            return true;
        }
    }

    return new TrustBond();
    //viewTrustWizard.registerMethods(TrustBond);

});