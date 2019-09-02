define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');
    var GSDialog = require("gsAdminPages");
    var common = require('common');
    var toast = require('toast');
    var GlobalVariable = require('globalVariable');
    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
    require("app/projectStage/js/project_interface");
    var trustId = common.getQueryString('tid');
    var namearry = [];
    Vue.filter('filterName', function (data) {
        var name = "";
        $.each(namearry, function (i, v) {
            if (data.indexOf(v.ActionCode)!='-1') {
                name = v.DisplayName;
                return false;
            }
        })
        return name
    })
   var vm=new Vue({
            el:'#app',
            data: {
                selectlist: [],
                flage:0
            },
            created:function() {
                var self = this;
            },
            mounted: function () {
                var self = this;
                self.getCashFlowAccoutModelFromFile();

            },
            methods: {
                getCashFlowAccoutModelFromFile: function () {
                    var self = this;                   
                    var executeParams = {
                        'SPName': "usp_GetModelPathByTrustId", 'SQLParams': [
                            { 'Name': 'TrustId', 'Value': trustId, 'DBType': 'int' }
                        ]
                    };

                    var serviceUrls = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var response = common.ExecuteGetData(false, serviceUrls, 'TrustManagement', executeParams);
                    response = response[0].Column1
                    var filePath = "E:\\TSSWCFServices\\TrustManagementService\\UITaskStudio\\Models\\" + response + "\\CashFlowAdditionalAccountCollection.xml";
                    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "/GetFeesFromXMLFile?FilePath=" + filePath + "&ModelType=Account";
                    $.ajax({ 
                        url: serviceUrl,
                        type: "GET",
                        contentType: "application/json; charset=utf-8",
                        dataType: "jsonp",
                        crossDomain: true,
                        success: function (response) {
                            var jsonSource = jQuery.parseJSON(response);
                            self.selectlist = jsonSource.Json;
                            $.each(self.selectlist, function (i, v) {
                                self.selectlist[i].infos = [];
                            })
                            namearry = JSON.parse(JSON.stringify(jsonSource.Json));
                            $.each(namearry, function (i, v) {
                                v.ActionCode = v.ActionCode.substring(0, v.ActionCode.lastIndexOf('_') - 5)
                            })
                            self.getTrustAccount();
                        },
                        error: function (response) {
                            alert("error:" + response);
                        }
                    });
                },
                flexbox:function($event){
                    var self = this;
                    var target = $event.currentTarget;
                    if ($(target).find(".icon.icon-bottom").length > 0) {
                        //收缩
                        $(target).find(".icon.icon-bottom").removeClass("icon-bottom").addClass("icon-top");
                        $(target).parent().next().slideUp(30)
                    } else {
                        //展开
                        $(target).find(".icon.icon-top").removeClass("icon-top").addClass("icon-bottom");
                        $(target).parent().next().slideDown(30)
                    }
                },
                removeItem:function(arry,item,id){
                    var self = this;
                    var ID = id;
                    var arry = arry;
                    var item = item;
                    var executeParam = {
                        'SPName': "usp_DeleteTrustAccountById", 'SQLParams': [
                            { 'Name': 'id', 'Value': ID, 'DBType': 'int' }
                        ]
                    };
                    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

                    common.ExecuteGetData(false, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        console.log(data);
                        arry.remove(item);
                        self.flage++;
                        $.toast({ type: 'success', message: '删除成功' });
                        //self.alertMsg('删除成功');
                    })
                },
                getTrustAccount: function () {
                    var self=this
                    var executeParam = {
                        'SPName': "usp_GetTrustAccountByTrustId", 'SQLParams': [
                            { 'Name': 'trustId', 'Value': trustId, 'DBType': 'int' }
                        ]
                    };
                    var serviceUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";//appDomain=TrustManagement&executeParams=" + context;

                    common.ExecuteGetData(true, serviceUrl, 'TrustManagement', executeParam, function (data) {
                        $.each(self.selectlist, function (i, v) {
                            $.each(data,function(j,k){
                                if (v.ActionCode.indexOf(k.TrustAccountName.substring(0, k.TrustAccountName.lastIndexOf('_') - 2)) == 0) {
                                    var obj = {};
                                    obj.TrustAccountName = k.TrustAccountName
                                    obj.TrustAccountDisplayName = k.TrustAccountDisplayName;
                                    obj.ID=k.ID
                                    v.infos.push(obj);
                                }
                            })
                        })
                        self.flage++;
                        $("#loading").hide();
                    });
                },
                //显示添加界面
                AddItemToEach: function (item, $event) {
                    var self = this;
                    var target = $event.currentTarget;
                    var code = item.ActionCode;
                    var value = item.DisplayName;
                    var number = {};
                    code = code.substring(0, code.lastIndexOf('_') - 5);
                    number.code = 1;
                    $.each(item.infos, function (i, v) {
                        if (v.TrustAccountName.indexOf(code) != '-1') {
                            flag = true
                            number.code++;
                        }
                    })
                    if (item.infos.length == 0) {//第一次添加给默认值
                        $(target).parents(".each_block").find(".infotext").val(value + "-1");
                    } else {
                        $(target).parents(".each_block").find(".infotext").val(value + '-' + number.code);
                    }
                    $(target).parents(".each_block").find(".SaveF").show();
                },
                //隐藏添加元素界面
                hidebox: function (item, $event) {
                    var self = this;
                    var target = $event.currentTarget;
                    $(target).parents(".SaveF").hide();
                },
                //添加元素到各自的组别当中
                addArry:function(item,$event,$index){
                    var self = this;
                    var target = $event.currentTarget;
                    var obj = {};
                    var code = item.ActionCode;
                    var number = {};
                    var value = item.DisplayName;
                    var items = '<items>';
                    var repit = false;
                    var index = $index;
                    var opp=[]//现有的code值
                    code = code.substring(0, code.lastIndexOf('_') - 5);
                    number.code = 1;
                    $.each(item.infos, function (i, v) {
                        if (v.TrustAccountName.indexOf(code) != '-1') {
                            number.code++;
                        }
                        //验证账户名称是否有重复
                        if (v.TrustAccountDisplayName == $(target).prev().val()) {
                            repit = true;
                        }
                        v.TrustAccountName.replace(/\d+/, function (n) {
                            opp.push(n);
                        })
                    })
                    $.each(opp, function (i, v) {
                        if (v == number.code) {
                            number.code++
                        }
                    })
                    if ($(target).prev().val() == "") {
                        GSDialog.HintWindow('账户名称不能为空');
                        return false
                    }
                    if (repit) {
                        GSDialog.HintWindow('账户名称不能重复');
                        return false
                    }
                    if (item.infos.length == 0) {//第一次添加
                        obj.TrustAccountName = code + '_1_AvailableAmt';
                        obj.TrustAccountDisplayName = $(target).prev().val();
                        item.infos.push(obj);
                    } else {
                        obj.TrustAccountName = code + '_' + number.code + '_AvailableAmt';
                        obj.TrustAccountDisplayName = $(target).prev().val();
                        item.infos.push(obj);
                    }
                    //调用存储过程储存当前保存值
                    items += '<item>';
                    items += '<TrustAccountName>' + obj.TrustAccountName + '</TrustAccountName>';
                    items += '<TrustAccountDisplayName>' + obj.TrustAccountDisplayName + '</TrustAccountDisplayName>';
                    items += '</item>';
                    items += '</items>';
                    var executeParam = {
                        SPName: 'usp_SaveTrustAccount', SQLParams: [
                            { Name: 'TrustId', value: trustId, DBType: 'int' },
                            { Name: 'Items', value: items, DBType: 'xml' }
                        ]
                    };
                    self.flage++
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                        if (data[0].Result) {
                            self.$nextTick(function () {
                                self.selectlist[index].infos[self.selectlist[index].infos.length - 1].ID = data[0].Result;
                                self.flage++;
                                $.toast({ type: 'success', message: '保存成功' });
                                //self.alertMsg('保存成功！');
                                $(target).parents(".SaveF").hide();
                            })
                        } else {
                            GSDialog.HintWindow('数据提交保存时出现错误！');
                        }
                    })
                },
                 alertMsg:function(text) {
                    var alert_tip = $('#alert-tip');
                    if (!alert_tip[0]) {
                        var $alert = $('<div id="alert-tip" class="alert_tip am-scale-up"/>');
                        var $temp = $('<div class="alert_content">' +
                                        '<i class="icon icon-roundcheck am-flip"></i>' +
                                        '<p>' + text + '</p>' +
                                    '</div>');
                        $temp.appendTo($alert);
                        $alert.appendTo(document.body);
                        setTimeout(function () {
                            $('#alert-tip').fadeOut(function () {
                                $(this).remove();
                            });
                        }, 1500);
                    }
                }
            }

        })   
});