var hoverin;
define(function (require) {
    var $ = require('jquery');
    var common = require('gs/uiFrame/js/common');
    var CallApi = require("callApi")
    var GlobalVariable = require('globalVariable');
    var taskIndicator = require('gs/taskProcessIndicator');
    var sVariableBuilder = require('gs/sVariableBuilder');
    var webProxy = require('gs/webProxy');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var gsUtil = require('gsUtil');
    var Vue = require('Vue2');
    require('date_input');
    var xhrOnProgress = function (fun) {
        xhrOnProgress.onprogress = fun;
        return function () {
            var xhr = $.ajaxSettings.xhr();
            if (typeof xhrOnProgress.onprogress !== 'function')
                return xhr
            if (xhrOnProgress.onprogress && xhr.upload) {
                xhr.upload.onprogress = xhrOnProgress.onprogress;
            }
            return xhr
        }
    };
    hoverin = function (obj) {
        var a = $(obj).prev();
        var tipDivObj = $(obj);
        var res = gsUtil.getChineseNum(a.val());
        tipDivObj.attr("title", res);
        $("[data-toggle='tooltip']").tooltip({});
    };
    new Vue({
        el: '#App',
        data: {
            a: '',
            b: '',
            trustId: common.getQueryString("trustId"),
            BondId: common.getQueryString('BondId'),
            PaymentConvention: common.getQueryString('PaymentConvention'),
            loading: true,
            TabsTitle: ['还本计划', '付息计划', '利率计划'],
            tabsActiveB: 0,
            isSystemCalculate: true,
            debtPlan: [], //还本计划，(系统自算)
            payInterestPlan: [], //付息计划 (系统自算)
            ratePlan: [], //利率计划, (系统自算)

            debtPlanUpload: [], //还本计划，(客户上传)
            payInterestPlanUpload: [], //付息计划 (客户上传)
            ratePlanUpload: [], //利率计划, (客户上传)

            isSystemData: "系统数据",
            takeEffect: false
        },
        methods: {
            selectChange: function (takeEffect) {
                console.log(this.takeEffect)
            },
            inputFileClick: function () {
                $(".input_file_style").find("input").change(function () {
                    var value = $(this)[0].value;
                    if (value != "") {
                        var tempfileinfo = value.split('\\')[value.split('\\').length - 1];
                        $(this).next()[0].innerHTML = "浏览";
                        $(this).parent().parent().children('.file_name').html(tempfileinfo).css("");
                    } else {
                        $(this).next()[0].innerHTML = '选择文件';
                        $(this).parent().parent().children('.file_name').html('');
                    }
                })
            },
            //上传文件
            uploadFileClick: function () {
                var _this = this;
                var filePath = $('#fileUpload').val();
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
                if (filePath == "") {
                    GSDialog.HintWindow('请上传债券计划!');
                    return false
                }
                this.UploadFile('fileUpload', fileName, 'BondDateAmount\\Upload', 'test_progress', function (d) {
                    var FilePath = "E:\\TSSWCFServices\\PoolCut\\Files\\BondDateAmount\\Upload\\" + d.substring(d.lastIndexOf("\\") + 1)
                    console.log(FilePath)
                    _this.runTask(FilePath)
                });
            },
            UploadFile: function (fileCtrlId, fileName, folder, progressID, fnCallback) {
                var fileData = document.getElementById(fileCtrlId).files[0];
                var svcUrl = webProxy.poolCutServiceURL + 'FileUpload?fileName={0}&fileFolder={1}'.format(encodeURIComponent(fileName), encodeURIComponent(folder));
                $.ajax({
                    url: svcUrl,
                    type: 'POST',
                    data: fileData,
                    cache: false,
                    dataType: 'json',
                    processData: false,
                    xhr: xhrOnProgress(function (e) {
                        var percent = Math.floor(e.loaded / e.total * 100);
                        if (percent > 0) {
                            $("#" + progressID).css("display", "block");
                            $("#" + progressID + ">.progress-bar").css("width", percent + "%");
                            $("#" + progressID + ">.progress-bar>span").html("" + percent + "%");
                        }
                        if (percent == 100) {
                            $("#" + progressID).css("display", "none");
                        }
                    }),
                    success: function (response) {
                        var sourceData;
                        if (typeof response == 'string')
                            sourceData = JSON.parse(response);
                        else
                            sourceData = response;
                        if (fnCallback) fnCallback(sourceData.FileUploadResult);

                    },
                    error: function (data) {
                        GSDialog.HintWindow('文件上传失败!');
                    }
                });
            },
            //点击导航
            tabsClick: function (index) {
                this.tabsActiveB = index
            },
            //点击下载模板
            downLoad: function () {
                GSDialog.open('模板下载', '/GoldenStandABS/www/components/Layered/subjoinInformation/DownloadTemplate.html?trustId=' + this.trustId, '', function (results) { }, 600, 240)
            },
            //task
            runTask: function (FilePath) {
                var _this = this;
                sVariableBuilder.AddVariableItem('trustId', this.trustId, 'Int');
                sVariableBuilder.AddVariableItem('bondId', this.BondId, 'Int');
                sVariableBuilder.AddVariableItem('filepath', FilePath, 'String');
                var sVariable = sVariableBuilder.BuildVariables();
                var tIndicator = new taskIndicator({
                    width: 900,
                    height: 550,
                    clientName: 'TaskProcess',
                    appDomain: 'Task',
                    taskCode: 'LoadPlan2DataBase',
                    sContext: sVariable,
                    callback: function () {
                        //验证task运行是否成功
                        var tempsessionId = sessionStorage.getItem("sessionId"), pass = true;
                        sessionStorage.removeItem("sessionId")
                        webProxy.getSessionProcessStatusList(tempsessionId, "Task", function (response) {
                            for (let i = 0; i < response.GetSessionProcessStatusListResult.List.length; i++) {
                                if (response.GetSessionProcessStatusListResult.List[i].ActionStatus != "Success") {
                                    pass = false
                                }
                            }
                            if (pass) {
                                _this.loading = true
                                _this.getUploadData()
                            }
                        })
                    }
                });
                tIndicator.show();
            },
            //千分符
            thousands: function (Number) {
                var _this = this, p = Number, result = '';
                if (p) {
                    p = p.replace(/,/g, "");
                    if (parseFloat(p) == p) {
                        var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                                return $1 + ",";
                            });
                        })
                        result =  res
                    }
                    else
                        return false
                } 
                return result;
            },
            //获取系统自算数据
            getSystemData: function () {
                var _this = this;
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;
                var executeParam = {
                    SPName: 'usp_GetBondDateAmount', SQLParams: [
                        { Name: 'trustId', value: _this.trustId, DBType: 'int' },
                        { Name: 'TrustBondId ', value: _this.BondId, DBType: 'int' }
                    ]
                };
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    console.log("获取系统自算数据")
                    console.log(data)
                    var debtPlan = data[0], payInterestPlan = data[1], ratePlan = data[2];
                    for (var i = 0; i < debtPlan.length; i++) {
                        debtPlan[i].Amount = _this.thousands(debtPlan[i].Amount)
                        debtPlan[i].PaymentDateNull = false  //判断PaymentDate值是否为空（保存的时候用到）
                        debtPlan[i].AmountNull = false    //判断PaymentDate值是否为空（保存的时候用到）
                    } 
                    _this.debtPlan = debtPlan;
                    _this.payInterestPlan = payInterestPlan;
                    _this.ratePlan = ratePlan;
                    _this.$nextTick(function () {
                        $('.date-plugins').date_input();
                        _this.isSystemCalculate = true
                        _this.loading = false
                    })
                })
            },
            //获取客户上传计算
            getUploadData: function () {
                var _this = this;
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;
                var executeParam = {
                    SPName: 'usp_GetUploadBondDateAmount', SQLParams: [
                        { Name: 'trustId', value: _this.trustId, DBType: 'int' },
                        { Name: 'TrustBondId ', value: _this.BondId, DBType: 'int' }
                    ]
                };
                common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                    console.log("获取客户上传计算")
                    console.log(data)
                    for (var i = 0; i < data.length; i++) {
                        if (i != 1) {
                            for (var j = 0; j < data[i].length; j++) {
                                data[i][j].PaymentDateNull = false //判断PaymentDate值是否为空（保存的时候用到）
                                data[i][j].AmountNull = false //判断PaymentDate值是否为空（保存的时候用到）
                                data[i][j].StartDateNull = false //判断StartDate值是否为空（保存的时候用到）
                                data[i][j].EndDateNull = false //判断EndDate值是否为空（保存的时候用到）
                                data[i][j].PeriodNull = false //判断PeriodNull值是否为空（保存的时候用到）
                            }
                        } else {
                            for (var j = 0; j < data[i].length; j++) {
                                data[i][j].PeriodNull = false
                                data[i][j].PaymentDateNull = false
                            }
                        }
                    }
                    var debtPlanUpload = data[0], payInterestPlanUpload = data[1], ratePlanUpload = data[2];
                    _this.debtPlanUpload = debtPlanUpload;
                    _this.payInterestPlanUpload = payInterestPlanUpload;
                    _this.ratePlanUpload = ratePlanUpload;
                    _this.$nextTick(function () {
                        $('.date-plugins').date_input();
                        _this.isSystemCalculate = false
                        _this.loading = false
                    })
                })
            },
            //添加还本计划(系统)
            addinfos: function () {
                var addTemplate = {   //添加还本计划模板
                    Amount: '',
                    EndDate: '',
                    PaymentDate: '',
                    Title: '',
                    TrustBondId: common.getQueryString('BondId'),
                    PaymentDateNull: false,
                    AmountNull: false,
                    StartDateNull: false,
                    EndDateNull: false
                }
                this.debtPlan.splice(0, 0, addTemplate)
                this.$nextTick(function () {
                    $('#debtPlan .date-plugins').date_input();
                })
            },
            //删除还本计划(系统)
            removeinfos: function (index) {
                var _this = this;
                GSDialog.HintWindowTF("是否确认删除当前信息", function () {
                    if (_this.debtPlan.length == 1) {
                        GSDialog.HintWindow('还本计划至少为1条!');
                    } else {
                        _this.debtPlan.splice(index, 1)
                        _this.$nextTick(function () {
                            $('#debtPlan .date-plugins').date_input();
                        })
                    }
                })
            },
            //添加还本计划(客户)
            addDebt: function () {
                var addTemplate = {   //添加还本计划模板
                    Amount: '',
                    EndDate: '',
                    PaymentDate: '',
                    Title: 'PaybackPlan',
                    TrustBondId: common.getQueryString('BondId'),
                    PaymentDateNull: false,
                    AmountNull: false,
                    StartDateNull: false,
                    EndDateNull: false
                }
                this.debtPlanUpload.splice(0, 0, addTemplate);
                this.$nextTick(function () {
                    $('#debtPlanUpload .date-plugins').date_input();
                });
            },
            //删除还本计划(客户)
            removeDebt: function (index) {
                var _this = this;
                GSDialog.HintWindowTF("是否确认删除当前信息", function () {
                    _this.debtPlanUpload.splice(index, 1)
                    _this.$nextTick(function () {
                        $('#debtPlanUpload .date-plugins').date_input();
                    })
                })
            },
            //添加付息计划(客户)
            addPayInterest: function () {
                var addTemplate = {   //添加还本计划模板
                    InterestBasePeriod: '',
                    InterestCaculateCode: '',
                    InterestCaculatePeriods: '',
                    IsEffective: '',
                    PaymentDate: '',
                    Period: '',
                    ToBePaid: '',
                    PaymentDateNull: false
                }
                this.payInterestPlanUpload.splice(0, 0, addTemplate)
                this.$nextTick(function () {
                    $('#payInterestPlanUpload .date-plugins').date_input();
                })
                console.log(this.payInterestPlanUpload)
            },
            //删除付息计划(客户)
            removePayInterest: function (index) {
                var _this = this;
                GSDialog.HintWindowTF("是否确认删除当前信息", function () {
                    _this.payInterestPlanUpload.splice(index, 1)
                    _this.$nextTick(function () {
                        $('#payInterestPlanUpload .date-plugins').date_input();
                    })
                })
            },
            //添加利率计划(客户)
            addRate: function () {
                var addTemplate = {   //添加还本计划模板
                    Amount: '',
                    StartDate: '',
                    EndDate: '',
                    PaymentDate: '',
                    Title: 'InterestRatePlan',
                    TrustBondId: common.getQueryString('BondId'),
                    PaymentDateNull: false,
                    AmountNull: false,
                    StartDateNull: false,
                    EndDateNull: false
                }
                this.ratePlanUpload.splice(0, 0, addTemplate)
                this.$nextTick(function () {
                    $('#ratePlanUpload .date-plugins').date_input();
                })
            },
            //删除利率计划(客户)
            removeRate: function (index) {
                var _this = this;
                GSDialog.HintWindowTF("是否确认删除当前信息", function () {
                    _this.ratePlanUpload.splice(index, 1)
                    _this.$nextTick(function () {
                        $('#ratePlanUpload .date-plugins').date_input();
                    })
                })
            },
            //保存系统计算数据
            saveSystemCalculate: function () {
                var _this = this, pass = true;
                //验证输入是否合法
                for (var i = 0; i < this.debtPlan.length; i++) {
                    if (this.debtPlan[i].PaymentDate == "" || this.debtPlan[i].PaymentDate == "输入日期格式不合法") {
                        this.debtPlan[i].PaymentDateNull = true
                        pass = false
                    }
                    if (this.debtPlan[i].Amount == "请输入数字" || this.debtPlan[i].Amount == "") {
                        this.debtPlan[i].AmountNull = true
                        pass = false
                    }
                }
                if (!pass) return false;
                //转化成后台需要的数据
                var debtPlan = JSON.parse(JSON.stringify(this.debtPlan))
                for (var i = 0; i < this.debtPlan.length; i++) {  //日期从小到大排序
                    debtPlan[i].PaymentDate = Number(debtPlan[i].PaymentDate.replace(/-/g,''))
                }
                debtPlan.sort(this.sortData)  //日期从小到大排序
                for (var i = 0; i < this.debtPlan.length; i++) {  //日期从小到大排序
                    if (debtPlan[i].Amount) debtPlan[i].Amount = debtPlan[i].Amount.replace(/,/g, '');
                    debtPlan[i].PaymentDate = this.myFormatData(String(debtPlan[i].PaymentDate))
                }
                var PrincipalSchedule = '';
                for (var i = 0; i < debtPlan.length; i++) {
                    //if (debtPlan[i].Amount == "") debtPlan[i].Amount = "-";   //当还本金额（元）为空时，用-代替
                    var Item = '';
                    if (i == 0) {
                        Item = debtPlan[i].PaymentDate + ':' + debtPlan[i].Amount
                    } else {
                        Item = ';' + debtPlan[i].PaymentDate + ':' + debtPlan[i].Amount
                    }
                    PrincipalSchedule = PrincipalSchedule + Item
                }
                var sContent = {
                    "SPName": "usp_UpdatePrincipalSchedule",
                    "Params": {
                        "trustId": _this.trustId,
                        "TrustBondId": _this.BondId,
                        "PrincipalSchedule": PrincipalSchedule
                    }
                }

                sContent = JSON.stringify(sContent)
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "GetTrustData?applicationDomain=TrustManagement&contextInfo=" + sContent;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    crossDomain: true,
                    complete: function () {
                        setTimeout(function () {
                            $('#loading').fadeOut();
                        }, 500)
                    },
                    success: function (response) {
                        if (JSON.parse(JSON.parse(response)[0].result) == 1) {
                            GSDialog.HintWindow('保存成功!');
                            _this.getSystemData()
                        } else {
                            GSDialog.HintWindow('保存失败!');
                        }
                    },
                    error: function (response) {
                        alert("error:" + response);
                    }
                });
            },
            myFormatData: function (stringData) {
                var returnResult = ''
                if (stringData) {
                    returnResult = stringData.substring(0, 4) + '-' + stringData.substring(4, 6) + '-' + stringData.substring(6, 8)
                }
                return returnResult
            },
            //日期排序
            sortData: function(a,b) {
                return a.PaymentDate - b.PaymentDate
            },
            //保存客户计算数据
            saveClientCalculate: function () {
                var _this = this, pass = true, pass3 = true, debtPlanUploadNumber = 0, payInterestPlanUploadNumber = 0;
                //验证输入是否合法--还本计划
                for (var i = 0; i < this.debtPlanUpload.length; i++) {
                    if (this.debtPlanUpload[i].PaymentDate == "" || this.debtPlanUpload[i].PaymentDate == "输入日期格式不合法") {
                        this.debtPlanUpload[i].PaymentDateNull = true
                        pass = false
                    }
                    if (this.debtPlanUpload[i].Amount == "请输入数字") {
                        this.debtPlanUpload[i].AmountNull = true
                        pass = false
                    }
                    if (this.debtPlanUpload[i].Period == "请输入整数" || this.debtPlanUpload[i].Period == "") {
                        this.debtPlanUpload[i].PeriodNull = true
                        pass = false
                    }
                    //期数不能相同  验证
                    if (this.debtPlanUpload[i].Period != "" && !isNaN(this.debtPlanUpload[i].Period)) {
                        for (var j = 1; j < this.debtPlanUpload.length; j++) {
                            if (this.debtPlanUpload[i].Period == this.debtPlanUpload[j].Period && i != j) {
                                this.debtPlanUpload[j].PeriodNull = true
                                pass3 = false
                                if (!debtPlanUploadNumber) {
                                    debtPlanUploadNumber = j
                                }
                            }
                        }
                    }
                }

                //验证输入是否合法--付息计划
                for (var i = 0; i < this.payInterestPlanUpload.length; i++) {
                    if (this.payInterestPlanUpload[i].PaymentDate == "" || this.payInterestPlanUpload[i].PaymentDate == "输入日期格式不合法") {
                        this.payInterestPlanUpload[i].PaymentDateNull = true
                        pass = false
                    }
                    if (this.payInterestPlanUpload[i].Period == "请输入整数" || this.payInterestPlanUpload[i].Period == "") {
                        this.payInterestPlanUpload[i].PeriodNull = true
                        pass = false
                    }
                    //期数不能相同  验证
                    if (this.payInterestPlanUpload[i].Period != "" && !isNaN(this.payInterestPlanUpload[i].Period)) {
                        for (var j = 1; j < this.payInterestPlanUpload.length; j++) {
                            if (this.payInterestPlanUpload[i].Period == this.payInterestPlanUpload[j].Period && i != j) {
                                this.payInterestPlanUpload[j].PeriodNull = true
                                pass3 = false
                                if (!payInterestPlanUploadNumber) {
                                    payInterestPlanUploadNumber = j
                                }
                            }
                        }
                    }
                }
                //验证输入是否合法--利率计划
                for (var i = 0; i < this.ratePlanUpload.length; i++) {
                    if (this.ratePlanUpload[i].StartDate == "" || this.ratePlanUpload[i].StartDate == "输入日期格式不合法") {
                        this.ratePlanUpload[i].StartDateNull = true
                        pass = false
                    }
                    if (this.ratePlanUpload[i].EndDate == "" || this.ratePlanUpload[i].EndDate == "输入日期格式不合法") {
                        this.ratePlanUpload[i].EndDateNull = true
                        pass = false
                    }
                    if (this.ratePlanUpload[i].Amount == "请输入数字") {
                        this.ratePlanUpload[i].AmountNull = true
                        pass = false
                    }

                }
                if (!pass) return false;
                if (!pass3) {
                    if (debtPlanUploadNumber) {
                        this.PeriodSame('debtPlanUpload', debtPlanUploadNumber, 40)
                    }
                    if (payInterestPlanUploadNumber) {
                        this.PeriodSame('payInterestPlanUpload', payInterestPlanUploadNumber, 40)
                    }
                    debtPlanUploadNumber = 0;
                    payInterestPlanUploadNumber = 0;
                    GSDialog.HintWindow('期数不能相同')
                    return false;
                };
                //验证输入是否合法--利率计划--开始时间需小于结束时间、利率需小于或者等于100
                var pass2 = true;
                for (var i = 0; i < this.ratePlanUpload.length; i++) {
                    if (Number(this.ratePlanUpload[i].StartDate.replace(/-/g, '')) > Number(this.ratePlanUpload[i].EndDate.replace(/-/g, ''))) {
                        this.ratePlanUpload[i].StartDateNull = true
                        this.ratePlanUpload[i].EndDateNull = true
                        pass2 = false
                    }
                    if (Number(this.ratePlanUpload[i].Amount.replace(/,/g, '')) > 100) {
                        this.ratePlanUpload[i].AmountNull = true
                        pass2 = false
                    }
                }
                if (!pass2) {
                    GSDialog.HintWindow("开始时间必须小于结束时间, 利率必须小于或者等于100")
                    return false;
                }
                //转化成后台需要的数据
                //var mergeArray = this.debtPlanUpload.concat(this.payInterestPlanUpload);
                //mergeArray = mergeArray.concat(this.ratePlanUpload)
                var mergeArray = this.debtPlanUpload.concat(this.ratePlanUpload);
                //还本计划、利率计划数据
                console.log(mergeArray)
                var items = '<items>';
                for (var i = 0; i < mergeArray.length; i++) {
                    items += '<item>';
                    items += '<Amount>' + mergeArray[i].Amount + '</Amount>';
                    if (mergeArray[i].Title == "PaybackPlan" || mergeArray[i].Title == "PayInterestPlan")
                        items += '<PaymentDate>' + mergeArray[i].PaymentDate + '</PaymentDate>';
                    else
                        items += '<PaymentDate>' + mergeArray[i].StartDate + '#' + mergeArray[i].EndDate + '</PaymentDate>';
                    items += '<Title>' + mergeArray[i].Title + '</Title>';
                    items += '</item>';
                };
                items += '</items>';
                //付息计划数据
                var payInterestPlanUpload = this.payInterestPlanUpload;
                var items2 = '<items>';
                for (var i = 0; i < payInterestPlanUpload.length; i++) {
                    items2 += '<item>';
                    items2 += '<Period>' + payInterestPlanUpload[i].Period + '</Period>';
                    items2 += '<PaymentDate>' + payInterestPlanUpload[i].PaymentDate + '</PaymentDate>';
                    items2 += '<InterestBasePeriod>' + (payInterestPlanUpload[i].InterestBasePeriod == null ? '' : payInterestPlanUpload[i].InterestBasePeriod) + '</InterestBasePeriod>';
                    items2 += '<InterestCaculateCode>' + (payInterestPlanUpload[i].InterestCaculateCode == null ? '' : payInterestPlanUpload[i].InterestCaculateCode) + '</InterestCaculateCode>';
                    items2 += '<InterestCaculatePeriods>' + (payInterestPlanUpload[i].InterestCaculatePeriods == null ? '' : payInterestPlanUpload[i].InterestCaculatePeriods) + '</InterestCaculatePeriods>';
                    items2 += '<IsEffective>' + (payInterestPlanUpload[i].IsEffective == null ? '' : payInterestPlanUpload[i].IsEffective) + '</IsEffective>';
                    items2 += '<ToBePaid>' + (payInterestPlanUpload[i].ToBePaid == null ? '' : payInterestPlanUpload[i].ToBePaid) + '</ToBePaid>';
                    items2 += '</item>';
                };
                items2 += '</items>';
                console.log(items2)
                var executeParam = {
                    SPName: 'usp_UpdateBondPlan',
                    SQLParams: [{
                        Name: 'trustId',
                        value: this.trustId,
                        DBType: 'int'
                    },
                    {
                        Name: 'TrustBondId',
                        value: this.BondId,
                        DBType: 'int'
                    },
                    {
                        Name: 'DataXML',
                        value: items,
                        DBType: 'string'
                    },
                    {
                        Name: 'interestPlan',
                        value: items2,
                        DBType: 'xml'
                    }]
                };
                executeParam = encodeURIComponent(JSON.stringify(executeParam));
                var executeParams = [{ executeParams: executeParam }, { appDomain: "TrustManagement" }, { resultType: "commom" }]
                executeParams = JSON.stringify(executeParams)
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "PoastData";
                $.ajax({
                    type: "POST",
                    url: serviceUrl,
                    dataType: "json",
                    data: executeParams,
                    processData: false,
                    success: function (response) {
                        var Result = JSON.parse(response.PoastDataResult)[0]
                        if (Result.returnMessage) {
                            GSDialog.HintWindow(Result.returnMessage)
                        } else {
                            var Result2 = JSON.parse(response.PoastDataResult)
                            var errorMessage = Result2[0][0]
                            GSDialog.HintWindow(errorMessage.returnMessage)
                        }
                    },
                    error: function (response) { alert("error is :" + response); }
                });
            },
            PeriodSame: function (id, number, number2) {
                var el = document.getElementById(id).children[0].children[1].children[number]
                var actualTop = el.offsetTop
                var current = el.offsetParent
                while (current !== null) {
                    actualTop += current.offsetTop
                    current = current.offsetParent
                }
                actualTop = actualTop - 123.8
                var scrollTop = document.getElementById(id).scrollTop
                var clientHeight = document.getElementById(id).clientHeight
                if (scrollTop > actualTop) {
                    document.getElementById(id).scrollTop = actualTop - number2
                }
                if (actualTop - scrollTop > clientHeight) {
                    document.getElementById(id).scrollTop = actualTop - number2
                }
            },
            //验证日期格式是否合法
            formatData: function (event) {
                common.formatData(event.target)
            },
            inputNull: function (event, item) {
                if (item.PaymentDateNull) {
                    item.PaymentDateNull = false
                } else if (item.AmountNull) {
                    item.AmountNull = false
                } else if (item.StartDateNull) {
                    item.StartDateNull = false
                } else if (item.EndDateNull) {
                    item.EndDateNull = false
                } else if (item.PeriodNull) {
                    item.PeriodNull = false
                }
                this.$nextTick(function () {
                    common.inputNull(event.target)
                })
            },
            //验证是否为数字
            isNumber2: function (myNumber, item) {
                var myNumber = Number(myNumber)
                var reg = /^\+?[1-9][0-9]*$/g;
                if (!reg.test(myNumber)) {
                    item.Period = "请输入整数"
                }
            },
            //验证是否为数字(动态渲染千分位)
            isNumber: function (Number, item) {
                var _this = this;
                var p = item.Amount;
                p = p.replace(/,/g, "");
                if (parseFloat(p) == p || p == "" || p == "-") {
                    var res = p.toString().replace(/\d+/, function (n) { // 先提取整数部分
                        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                            return $1 + ",";
                        });
                    })
                    item.Amount = res
                }
                else
                    item.Amount = "请输入数字"
            },
            //判断之前是否上传过文件
            isUpload: function () {
                var _this = this;
                var sContent = "{'SPName':'usp_IsUploadBondDateAmount','Params':{" + 'trustId:' + _this.trustId + ", " + 'TrustBondId:' + _this.BondId + "}}";
                var serviceUrl = GlobalVariable.DataProcessServiceUrl + "GetTrustData?applicationDomain=TrustManagement&contextInfo=" + sContent;
                $.ajax({
                    url: serviceUrl,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "jsonp",
                    crossDomain: true,
                    complete: function () { },
                    success: function (response) {
                        var result = JSON.parse(response)[0].result
                        if (result == 1) {
                            parent.$("#modal-wrap div div:nth-child(1) div").html("上传数据")
                            _this.isSystemData = "系统数据"
                            _this.getUploadData()
                        } else {
                            parent.$("#modal-wrap div div:nth-child(1) div").html("系统数据")
                            _this.isSystemData = "上传数据"
                            _this.getSystemData()
                        }
                    },
                    error: function (response) {
                        alert("error:" + response);
                    }
                });
            },
            //系统数据，上传数据开关
            lookSystemData: function (text) {
                if (text == "上传数据") {
                    this.loading = true
                    this.isSystemData = "系统数据"
                    this.tabsActiveB = 0
                    parent.$("#modal-wrap div div:nth-child(1) div").html("上传数据")
                    this.getUploadData()
                } else {
                    this.loading = true
                    this.isSystemData = "上传数据"
                    this.tabsActiveB = 0
                    parent.$("#modal-wrap div div:nth-child(1) div").html("系统数据")
                    this.getSystemData()
                }
            },
            scrollHandle1: function () {
                var tableCont = $('#debtPlan tr th'); //获取th
                var tableScroll = $('#debtPlan'); //获取滚动条同级的class

                var scrollTop = tableScroll.scrollTop();
                // 当滚动距离大于0时设置top及相应的样式
                if (scrollTop > 0) {
                    tableCont.css({
                        "top": scrollTop - 1 + 'px'
                    })
                } else {
                    // 当滚动距离小于0时设置top及相应的样式
                    tableCont.css({
                        "top": scrollTop + 'px'
                    })
                }
            },
            scrollHandle2: function () {
                var tableCont = $('#payInterestPlan tr th'); //获取th
                var tableScroll = $('#payInterestPlan'); //获取滚动条同级的class

                var scrollTop = tableScroll.scrollTop();
                // 当滚动距离大于0时设置top及相应的样式
                if (scrollTop > 0) {
                    tableCont.css({
                        "top": scrollTop - 1 + 'px'
                    })
                } else {
                    // 当滚动距离小于0时设置top及相应的样式
                    tableCont.css({
                        "top": scrollTop + 'px'
                    })
                }
            },
            scrollHandle3: function () {
                var tableCont = $('#ratePlan tr th'); //获取th
                var tableScroll = $('#ratePlan'); //获取滚动条同级的class

                var scrollTop = tableScroll.scrollTop();
                // 当滚动距离大于0时设置top及相应的样式
                if (scrollTop > 0) {
                    tableCont.css({
                        "top": scrollTop - 1 + 'px'
                    })
                } else {
                    // 当滚动距离小于0时设置top及相应的样式
                    tableCont.css({
                        "top": scrollTop + 'px'
                    })
                }
            },
            scrollHandle4: function () {
                var tableCont = $('#debtPlanUpload tr th'); //获取th
                var tableScroll = $('#debtPlanUpload'); //获取滚动条同级的class

                var scrollTop = tableScroll.scrollTop();
                // 当滚动距离大于0时设置top及相应的样式
                if (scrollTop > 0) {
                    tableCont.css({
                        "top": scrollTop - 1 + 'px'
                    })
                } else {
                    // 当滚动距离小于0时设置top及相应的样式
                    tableCont.css({
                        "top": scrollTop + 'px'
                    })
                }
            },
            scrollHandle5: function () {
                var tableCont = $('#payInterestPlanUpload tr th'); //获取th
                var tableScroll = $('#payInterestPlanUpload'); //获取滚动条同级的class

                var scrollTop = tableScroll.scrollTop();
                // 当滚动距离大于0时设置top及相应的样式
                if (scrollTop > 0) {
                    tableCont.css({
                        "top": scrollTop - 1 + 'px'
                    })
                } else {
                    // 当滚动距离小于0时设置top及相应的样式
                    tableCont.css({
                        "top": scrollTop + 'px'
                    })
                }
            },
            scrollHandle6: function () {
                var tableCont = $('#ratePlanUpload tr th'); //获取th
                var tableScroll = $('#ratePlanUpload'); //获取滚动条同级的class

                var scrollTop = tableScroll.scrollTop();
                // 当滚动距离大于0时设置top及相应的样式
                if (scrollTop > 0) {
                    tableCont.css({
                        "top": scrollTop - 1 + 'px'
                    })
                } else {
                    // 当滚动距离小于0时设置top及相应的样式
                    tableCont.css({
                        "top": scrollTop + 'px'
                    })
                }
            },
        },
        mounted: function () {
            var _this = this;
            this.inputFileClick()  //选择文件处理  
            this.isUpload()
            //this.getSystemData()
            $(window).resize(function () {
                var a = $(window).height() - 175;
                var b = $(window).height() - 225;
                _this.a = a + 'px'
                _this.b = b + 'px'
            })
            $(window).resize()
            $('#debtPlan').on('scroll', function () {
                _this.scrollHandle1()
            });
            $('#payInterestPlan').on('scroll', function () {
                _this.scrollHandle2()
            });
            $('#ratePlan').on('scroll', function () {
                _this.scrollHandle3()
            });
            $('#debtPlanUpload').on('scroll', function () {
                _this.scrollHandle4()
            });
            $('#payInterestPlanUpload').on('scroll', function () {
                _this.scrollHandle5()
            });
            $('#ratePlanUpload').on('scroll', function () {
                _this.scrollHandle6()
            });

        }
    })
})