(function () {
    /*!
     * 偿付顺序配置
     * 
     * 这个页面的逻辑挺复杂的，所以注释在这里必须得写呀
     * @update 2017-05-31
    **/

    var getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    };

    var timeStamp2String = function (time) {
        var datetime = new Date();
        datetime.setTime(time);
        var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
        var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
        return year + "-" + month + "-" + date;
    };

    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };

    var DataOfBondFees = [];
    //定义债券费用元素模板；
    var levelObjectTemplate = "<div class='objElement' title='{0}' bfname='{1}' bftype='{2}' bfclasstype='{3}' bfcode='{4}'>{0}</div>";
    //可拖拽区域剩余模板元素；
    var content = '';

    var generateSourceObj = function (hasLevels) {
        var LevelsList = [];
        if (DataOfBondFees.length > 0) {
            var count = DataOfBondFees.length;
            hasbindBondFeeName = [];
            for (var i = 1; i <= count; i++) {
                var obj;
                var level = $.grep(hasLevels, function (n) {
                    return n.Id == i;
                });
                var allocationselect = '<select><option value="ABasedOnCPB">按剩余本金</option><option value="ABasedOnAVG">平均分配</option><option value="ABasedOnDue" selected="selected">按应付金额</option></select>';
                if (level.length > 0) {
                    var content = "";
                    if (level[0].BondFees.length > 0) {
                        $.each(level[0].BondFees, function (n, bondfeeObj) {
                            content += levelObjectTemplate.format(bondfeeObj.DisplayName, bondfeeObj.Name, bondfeeObj.Type, bondfeeObj.ClassType, bondfeeObj.Code);
                            hasbindBondFeeName.push(bondfeeObj.Name);
                        });
                    }
                    var fillbyhtml = "";
                    if (level[0].FillByPrincipal) {
                        fillbyhtml = "<input type='checkbox' checked='checked' />";
                    }
                    else {
                        fillbyhtml = "<input type='checkbox' />";
                    }

                    if (level[0].AllocationRuleOfSameLevel == "ABasedOnCPB") {
                        allocationselect = '<select><option selected="selected" value="ABasedOnCPB">按剩余本金</option><option value="ABasedOnAVG">平均分配</option><option value="ABasedOnDue">按应付金额</option></select>';
                    }
                    else if (level[0].AllocationRuleOfSameLevel == "ABasedOnAVG") {
                        var isContainsFee = false
                        for (var j = 0; j < level[0].BondFees.length; j++) {
                            if (level[0].BondFees[j].Type == 'Fee')
                            { isContainsFee = true; }
                        }
                        if (isContainsFee) {
                            allocationselect = '<select><option selected="selected" value="ABasedOnAVG">平均分配</option><option value="ABasedOnDue">按应付金额</option></select>';
                        }
                        else {
                            allocationselect = '<select><option value="ABasedOnCPB">按剩余本金</option><option  selected="selected" value="ABasedOnAVG">平均分配</option><option value="ABasedOnDue">按应付金额</option></select>';
                        }

                    }
                    else if (level[0].AllocationRuleOfSameLevel == "ABasedOnDue") {
                        var isContainsFee = false;
                        for (var j = 0; j < level[0].BondFees.length; j++) {
                            if (level[0].BondFees[j].Type == 'Fee')
                            { isContainsFee = true; }
                        }
                        if (isContainsFee) {
                            allocationselect = '<select><option value="ABasedOnAVG">平均分配</option><option  selected="selected" value="ABasedOnDue">按应付金额</option></select>';
                        }
                        else {
                            allocationselect = '<select><option value="ABasedOnCPB">按剩余本金</option><option value="ABasedOnAVG">平均分配</option><option  selected="selected" value="ABasedOnDue">按应付金额</option></select>';
                        }
                    }

                    obj = generateLevelObj(level[0].Id, content, level[0].PayLimitation, level[0].PercentageOfSurplus, allocationselect, fillbyhtml);
                }
                else {
                    obj = generateLevelObj(i, "", "", "", allocationselect, "<input type='checkbox' />");
                }
                LevelsList.push(obj);
            }
        }
        return LevelsList;
    }

    var generateLevelObj = function (id, bondfees, paylimitation, percent, allocationrule, fillbyprincipal) {
        var obj = new Object();
        obj.Id = id;
        obj.BondFees = bondfees;
        obj.PayLimitation = paylimitation;
        obj.PercentageOfSurplus = percent;
        obj.AllocationRuleOfSameLevel = allocationrule;
        obj.FillByPrincipal = fillbyprincipal;
        return obj;

    }

    var trustId = getUrlParam("tid"); // 获取页面的tid

    // 初始化页面绑定
    function initKo() {

        // 在Knockout初始化后注册DOM事件
        var registerEvent = function (dataSource) {
            var grid = $("#grid").data("kendoGrid");
            grid.setDataSource(dataSource);
            $('#sortable_div').height($(window).height() - $('#tabHead').height() - $('#divBody').height() - 455);
            $("#sortable_div").empty();
            content = "";
            $.each(DataOfBondFees, function (n, levelObj) {
                if ($.inArray(levelObj.Name, hasbindBondFeeName) == -1) {
                    content += levelObjectTemplate.format(levelObj.TrustFeeDisplayName, levelObj.Name, levelObj.Type, levelObj.ClassType, levelObj.Code);
                }
            });
            $("#sortable_div").append(content);

            // 表单千分位
            var number = new FormatNumber();
            $('.PayLimitation').on('keyup', function (e) {
                var value = $(this).val();
                $(this).val(number.convertNumberN(1, value));
            });

            $('.PayLimitation').each(function () {
                var $this = $(this);
                if ($this.val() != '') {
                    $this.val(number.convertNumberN(1, $this.val()));
                }
            });

            var _elementTop = null;
            // 拖拽事件
            $("#sortable_div, .sortable_td").sortable({
                connectWith: "#sortable_div,.sortable_td",
                items: '.objElement',
                start: function(event,ui){
                    var $ele = $(ui.item);
                    if (_elementTop === null) _elementTop = $('#sortable_div').offset().top
                    if ($ele.closest("tr") && $ele.hasClass('feeElement')) {
                        var tpl = '<select>' +
                                    '<option value="ABasedOnCPB">按剩余本金</option>' +
                                    '<option value="ABasedOnAVG">平均分配</option>' +
                                    '<option selected="selected" value="ABasedOnDue">按应付金额</option>' +
                                '</select>';
                        var $elements = $ele.closest("tr").find('td:eq(1) .objElement:not(.ui-sortable-placeholder)');
                        var isContainsFee = false;
                        $elements.each(function () {
                            if ($(this).attr('bfname') !== $ele.attr('bfname')) {
                                if ($(this).attr("bftype") == "Fee") {
                                    isContainsFee = true;
                                }
                            }
                        });
                        if (!isContainsFee) {
                            $ele.closest("tr").find('td').eq(4).html(tpl);
                        }
                    }
                },
                change: function (event,ui) {
                    var _offsetTop = ui.offset.top;
                    if (_offsetTop > _elementTop) {
                        if (!$('.k-grid-content').hasClass('ofv')) {
                            $('.k-grid-content').addClass('ofv');
                        }
                    } else {
                        if ($('.k-grid-content').hasClass('ofv')) {
                            $('.k-grid-content').removeClass('ofv');
                            $('.k-grid-content').scrollTop(0);
                        }
                    }
                },
                stop: function (event, ui) {
                    var _offsetTop = ui.offset.top;
                    if (_offsetTop > _elementTop) {
                        if ($('.k-grid-content').hasClass('ofv')) {
                            $('.k-grid-content').removeClass('ofv');
                            $('.k-grid-content').scrollTop(0);
                        }
                    } else {
                        var $ele = $(ui.item);
                        if ($ele.closest("tr") && $ele.hasClass('feeElement')) {
                            var tpl = '<select>' +
                                           '<option value="ABasedOnAVG">平均分配</option>' +
                                           '<option selected="selected" value="ABasedOnDue">按应付金额</option>' +
                                     '</select>';
                            $ele.closest("tr").find('td').eq(4).html(tpl);
                        }
                    }
                    _elementTop === null;
                }
                //scroll: true
            });

            // 不同类型给不同背景颜色
            $(".objElement").each(function () {
                if ($(this).attr("bftype") == "Fee") {
                    $(this).addClass("feeElement");
                }
                else {
                    $(this).addClass("bondElement");
                }
            });
        }

        var viewModel = function () {
            var self = this;
            // 选择期数
            this.isChecked = ko.observable(false);
            // 偿付顺序名称
            this.scenarioNameList = ko.observableArray();
            // 菜单焦点
            this.current = ko.observable(-1);
            // 正在编辑的ID
            this.editId = ko.observable(-1);
            // 偿付顺序配置数据
            this.paymentSequenceList = ko.observableArray();
            this.showInput = ko.observable(false);
            // 新增偿付顺序事件
            this.addNewScenario = function () {
                self.editId(-1);
                self.showInput(true);
                $('#editTpl').remove();
                $('#newTabInput').focus();
            }
            this.newScenarioInput = ko.observable('');
            // 删除偿付情景
            this.deleteScenario = function (value, index) {
                if (confirm('确定删除偿付情景吗？')) {
                    self.renameQueue.push(value);
                    self.scenarioNameList.splice(index, 1);
                    // 加入删除队列，点击保存时执行数据库删除
                    self.paymentSequenceList.splice(index, 1);
                    self.current(-1);
                }
            }
            this.addScenarioName = function () {
                var data = self.scenarioNameList;
                var value = $.trim(self.newScenarioInput());
                if (value === '') {
                    alert('新建偿付情景不能有空值！');
                    $('#newTabInput').focus();
                } else {
                    if ($.inArray(value, data) > -1) {
                        alert("该偿付情景已经存在！");
                        return;
                    }
                    // 创建一个空对象给新增的偿付顺序占位
                    var obj = {
                        AllowInterestToPrincipal: false,
                        EndDate: ko.observable(''),
                        InterestPrecision: '',
                        Levels: [],
                        PrincipalPrecision: '',
                        ScenarioName: value,
                        ScenarioId: 0,
                        StartDate: ko.observable(''),
                        ExcludedDates: ko.observableArray(),
                        TrustId: trustId
                    };
                    var index = self.scenarioNameList.push(value);
                    self.paymentSequenceList.push(obj);
                    self.newScenarioInput("");
                    self.showInput(false);
                    self.selectData(index-1);
                }
            }
            // 单独筛出数据，并实现数据双向绑定
            this.selectData = function (i) {
                if (self.paymentSequenceList().length>0) {
                    var currIndex = self.current();
                    if (i !== currIndex) {
                        // 记录当前的偿付顺序排序状态
                        if (currIndex !== -1) {
                            var levels = saveScenarioSort();
                            self.paymentSequenceList()[currIndex].Levels = levels;
                        }
                        self.editData(self.paymentSequenceList()[i]);
                        if (self.paymentSequenceList()[i].StartDate() != ''
                            && self.paymentSequenceList()[i].EndDate() != '') {
                            self.isChecked(true);
                        } else {
                            self.isChecked(false);
                        }
                        self.checkAll(false);
                        var source = generateSourceObj(self.paymentSequenceList()[i].Levels);
                        var dataSource = new kendo.data.DataSource({
                            data: source
                        });
                        registerEvent(dataSource);
                    }
                    self.current(i)
                }
            }
            // 将重命名加入异步删除队列
            this.renameQueue = [];
            // 监听日期改动，并自动更新不含日期区间数组
            this.changeExcludeDateOpts = function (data,event) {
                var startDate = this.editData().StartDate(),
                    endDate = this.editData().EndDate(),
                    sOpts = this.periodStartOptions(),
                    eOpts = this.periodEndOptions();
                this.excludePeriodOptions(calcPeriodDate(startDate, endDate, sOpts, eOpts));
            }
            // 绑定菜单编辑事件
            this.doubleEdit = function (ScenarioName, i) {
                // 双击出现的表单编辑框模板
                var tpl = ['<div id="editTpl" class="divLi">',
                            '<input type="text" class="input" id="editTabInput" />&nbsp;',
                            '<button type="button" id="editTabBtn" class="removeScenario" style="color:#0e8f0e;">',
                                '<i class="icon icon-check" style="font-size:14px;"></i>',
                            '</button>',
                            '</div>'].join("");
                // 编辑事件
                var editTabEve = function () {
                    var value = $.trim($('#editTabInput').val());
                    if (value !== '') {
                        var nameList = $.map(self.scenarioNameList(), function (v) {
                            if (v !== ScenarioName) {
                                return v;
                            }
                        });
                        if ($.inArray(value, nameList) > -1) {
                            alert("该偿付情景已经存在！");
                            return;
                        }
                        // 先删除，再添加
                        if (ScenarioName !== value) {
                            self.scenarioNameList.splice(i, 1, value);
                            self.paymentSequenceList()[i].ScenarioName = value;
                        }
                        $('#editTabInput').val('');
                        $('#editTpl').remove();
                        self.editId(-1);
                    }
                };
                // 记录正在编辑的ID 按元素索引保存
                self.editId(i);
                // 如果存在新增偿付顺序表单，就将其隐藏，防止同时出现编辑表单和新增表单
                self.showInput(false);
                // 先移除已经插入的编辑表单再插入，防止出现多个编辑表单
                $('#editTpl').remove();
                $('#scenarioNameList .divLi').eq(i).after(tpl);
                $('#editTabInput').val(ScenarioName).focus();
                $('#editTabBtn').off('click', editTabEve);
                $('#editTabBtn').on('click', editTabEve);
            }
            // 开始日期下拉选项
            this.periodStartOptions = ko.observableArray();
            // 结束日期下拉选项
            this.periodEndOptions = ko.observableArray();
            // 不包含区间
            this.excludePeriodOptions = ko.observableArray();
            this.hideOption = ko.observable(false);
            this.handleShowOption = function (data, event) {
                var hideOption = this.hideOption();
                this.hideOption(!hideOption);
            }.bind(this);
            // 当前TAB正在编辑的数据
            this.editData = ko.observableArray();
            // 保存全部偿付情景
            this.saveTrustPaymentSequence = function () {
                // 先执行队列删除
                var count = self.renameQueue.length;
                if (count > 0) {
                    for (var i = 0; i < count; i++) {
                        removeTrustPaymentSequence(self.renameQueue[i], function () {
                            self.renameQueue.splice(i, 1);
                        });
                    }
                }
                // 再多个保存数据
                if (self.scenarioNameList().length > 0) {
                    var current = self.current();
                    var levels = saveScenarioSort();
                    var currentScenarioName = self.scenarioNameList()[current];
                    var saveData = JSON.parse(ko.toJSON(self.paymentSequenceList));
                    $.each(saveData, function (k, v) {
                        if (v.ScenarioName == currentScenarioName) {
                            v.Levels = levels;
                        } else {
                            v.Levels = v.Levels;
                        }
                        saveTrustPaymentSequence(v,function(){});
                    });
                    alert('支付顺序保存成功！');
                }
            }
            // 日期区间全选
            this.checkAll = ko.observable(false);
            // 日期全选/反选事件处理
            this.checkAllEveHandler = function () {
                var allExcludeDates = $.map(this.excludePeriodOptions(), function (v) {
                    return v.value;
                });
                var userExcludesDates = this.editData().ExcludedDates();
                if (userExcludesDates.length == 0) {
                    // 处理全选
                    this.editData().ExcludedDates(allExcludeDates);
                } else {
                    // 取差集
                    var diff = allExcludeDates.filter(function (v) {
                        if (userExcludesDates.indexOf(v) === -1) {
                            return v;
                        }
                    });

                    this.editData().ExcludedDates(diff);
                }
            };

            $(document).on('click', function (event) {
                var event = event || window.event , multiOptions = $('#multiOptions');
                if (!multiOptions.is(event.target) &&
                    multiOptions.has(event.target).length === 0) {
                    self.hideOption(false);
                }
            });
        }
        var dataModel = new viewModel();
        ko.applyBindings(dataModel);
        
        // 获取页面偿付顺序及配置数据
        getTrustPaymentSequence(function (res) {
            console.log(res)
            // 取出tab菜单
            var scenarioNameList = [];
            // 取出每个tab页的数据
            var paymentSequenceList = [];

            $.each(res, function (k, v) {
                // 生成TAB菜单
                scenarioNameList.push(v.ScenarioName);
                // 取出每个tab页下的详细配置并放入配置
                var arr = JSON.parse(v.PaymentSequence);
                $.each(arr, function (key, value) {
                    if (key === 'StartDate' || key === 'EndDate') {
                        arr[key] =  ko.observable(value);
                    } else if (key === 'ExcludedDates') {
                        arr[key] = ko.observableArray(value);
                    }
                });
                // 如果没有这个字段 追加之 （新加字段，为了兼容旧数据）
                if (!arr['ExcludedDates']) {
                   arr['ExcludedDates'] = ko.observableArray();
                }
                arr['ScenarioId'] = v.ScenarioId;
                paymentSequenceList.push(arr);
            });
            dataModel.scenarioNameList(scenarioNameList);
            dataModel.paymentSequenceList(paymentSequenceList);
            // 默认选出第一个tab的数据来展示
            if (scenarioNameList.length>0) dataModel.selectData(0);
        });

        // 绑定日期列表
        getTrustPeriod(function (res) {
            var periodStartOptions = [], periodEndOptions = [];
            $.each(res, function (k, v) {
                periodStartOptions.push(timeStamp2String(new Date(eval(v.StartDate.replace("/Date(", "").replace(")/", "")))));
                periodEndOptions.push(timeStamp2String(new Date(eval(v.EndDate.replace("/Date(", "").replace(")/", "")))));
            });
            dataModel.periodStartOptions(periodStartOptions);
            dataModel.periodEndOptions(periodEndOptions);
        });

        // 监听选择期数的改变来动态调整页面
        dataModel.isChecked.subscribe(function () {
            $('#sortable_div').height($(window).height() - $('#tabHead').height() - $('#divBody').height() - 455);
        });

        // 监听编辑页面数据改动，重新计算区间期数
        dataModel.editData.subscribe(function (v) {
            var startDate = v.StartDate(),
                    endDate = v.EndDate(),
                    sOpts = this.periodStartOptions(),
                    eOpts = this.periodEndOptions();
            this.excludePeriodOptions(calcPeriodDate(startDate, endDate, sOpts, eOpts));
        }.bind(dataModel));

        // 计算区间期数
        dataModel.excludePeriodOptions(function () {
            var startDate = this.editData().StartDate(),
                    endDate = this.editData().EndDate(),
                    sOpts = this.periodStartOptions(),
                    eOpts = this.periodEndOptions();
            return calcPeriodDate(startDate, endDate, sOpts, eOpts);
        }.call(dataModel));

    }
    // 初始化表格数据
    function initKendo() {

        $("#grid").kendoGrid({
            dataSource: { data: [] },
            columns: [
                { field: "Id", title: "序号", width: "4%" },
                { field: "BondFees", title: "债券费用元素", width: "46%" },
                { field: "PayLimitation", title: "支付限额（元）", width: "12%" },
                { field: "PercentageOfSurplus", title: "剩余资金分配方式", width: "14%" },
                { field: "AllocationRuleOfSameLevel", title: "同级分配", width: "12%" },
                { field: "FillByPrincipal", title: "是否本金补足", width: "12%" }],
            rowTemplate: kendo.template($("#rowTemplate").html()),
            height: 400,
            pageable: false
        });
    }
    // 保存偿付顺序排序状态
    function saveScenarioSort() {
        var levels = [];
        $("#grid tbody tr").each(function () {
            var level = new Object();
            var isAddtoArray = true;
            $(this).find("td").each(function (i, ele) {

                if (i == 0) {
                    level.Id = $(ele).find("span").first().text();
                }
                else if (i == 1) {
                    var bondfeeArray = [];
                    if ($(ele).find("div").length > 0) {
                        $(ele).find("div").each(function () {
                            var bondfee = new Object();
                            bondfee.Name = $(this).attr("bfname");
                            bondfee.Type = $(this).attr("bftype");
                            bondfee.ClassType = $(this).attr("bfclasstype");
                            bondfee.Code = $(this).attr("bfcode");
                            bondfee.DisplayName = $(this).text();
                            bondfeeArray.push(bondfee);
                        });
                        level.BondFees = bondfeeArray;
                    }
                    else {
                        isAddtoArray = false;
                        return false;
                    }
                }
                else if (i == 2) {
                    level.PayLimitation = $(ele).find("input").first().val().replace(/,/g, "");
                }
                else if (i == 3) {
                    level.PercentageOfSurplus = $(ele).find("input").first().val();
                }
                else if (i == 4) {
                    level.AllocationRuleOfSameLevel = $(ele).find("select").first().val();
                }
                else if (i == 5) {
                    level.FillByPrincipal = $(ele).find("input").first().attr("checked") ? true : false;
                }
            });
            if (isAddtoArray) {
                levels.push(level);
            }
        });
        return levels;
    }
    // 封装一个AJax请求方法
    function getSourceData(executeParam, callback) {
        var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
        ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam,callback);
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
                callback(response);
            },
            error: function (response) { alert("error is :" + response); }
        });
    }
    // 计算不包含日期
    function calcPeriodDate(startDate, endDate, periodStartOptions, periodEndOptions) {
        var startArr = [], endArr = [];

        var startIndex = periodStartOptions.indexOf(startDate),
            endIndex = periodEndOptions.indexOf(endDate)+1;

        startArr = periodStartOptions.slice(startIndex, endIndex);
        endArr = periodEndOptions.slice(startIndex, endIndex);

        return $.map(startArr, function (value, index) {
            return { text: value + ' ~ ' + endArr[index], value: endArr[index] };
        });
    }
    // 获取所有债券及费用元素
    function getTrustBondFees(callback) {
        var executeParam = {
            'SPName': "usp_GetTrustBondFees", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };
        getSourceData(executeParam, callback);
    }
    function getTrustPaymentSequence(callback) {
        var executeParam = {
            'SPName': "usp_GetTrustPaymentSequence", 'SQLParams': [
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };
        getSourceData(executeParam, callback);
    }
    function getTrustPeriod(callback) {
        var executeParam = {
            'SPName': "usp_GetTrustPeriod", 'SQLParams': [
                { 'Name': 'TrustPeriodType', 'Value': 'PaymentDate_CF', 'DBType': 'string' },
                { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
            ]
        };
        getSourceData(executeParam, callback);
    }
    function removeTrustPaymentSequence(selectScenarioName,callback) {
        var executeParam = {
            SPName: 'usp_RemoveTrustPaymentSequence', SQLParams: [
                { Name: 'TrustId', value: trustId, DBType: 'string' },
                { Name: 'ScenarioName', value: selectScenarioName, DBType: 'string' },
            ]
        };
        ExecuteRemoteData(executeParam, callback);
    }
    // 保存偿付顺序 ，这里会一次保存多个
    function saveTrustPaymentSequence(scenarioObj, callback) {
        var scenariotoJsonStr = JSON.stringify(scenarioObj);
        var executeParam = {
            SPName: 'usp_SaveTrustPaymentSequence', SQLParams: [
                { Name: 'TrustId', value: scenarioObj.TrustId, DBType: 'string' },
                { Name: 'ScenarioId', value: scenarioObj.ScenarioId, DBType: 'string' },
                { Name: 'ScenarioName', value: scenarioObj.ScenarioName, DBType: 'string' },
                { Name: 'StartDate', value: scenarioObj.StartDate, DBType: 'string' },
                { Name: 'EndDate', value: scenarioObj.EndDate, DBType: 'string' },
                { Name: 'ExcludedDates', value: scenarioObj.ExcludedDates.join(","),DBType: 'string' },
                { Name: 'PrincipalPrecision', value: scenarioObj.PrincipalPrecision, DBType: 'string' },
                { Name: 'InterestPrecision', value: scenarioObj.InterestPrecision, DBType: 'string' },
                { Name: 'PaymentSequence', value: scenariotoJsonStr, DBType: 'string' },
            ]
        };
        ExecuteRemoteData(executeParam, callback);
    }

    // 先加载所有的费，然后再进行初始化
    getTrustBondFees(function (response) {
        DataOfBondFees = response;
        initKendo();
        initKo();
    });
})();