define(function (require) {
    var $ = require('jquery');
    require('jquery-ui');
    var GlobalVariable = require('globalVariable');
    var common = require('common');
    var GSDialog = require("gsAdminPages")
    var webProxy = require('webProxy');
    var Vue = require("Vue2");
    var tm = require('gs/childTabModel');
    var openNewIframe
    $(function () {
        var vm = new Vue({
            el: "#app",
            data: {
                dataList: [
                ],
                page: 1,//当前页数
                pageSize: 10,//每页条数
                total: '',//总条数
                totalPages:""
            },
            created: function () {
                var self = this;
                self.RenderList()
            },
            mounted: function () {

            },
            methods: {
                RenderList: function () {//渲染表格
                    var self = this;
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var executeParam = {
                        'SPName': "usp_AutoDateListInfo", 'SQLParams': [
                            { Name: 'Start', Value: 1, DBType: 'string' },
                            { Name: 'End', Value: 10, DBType: 'string' }
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                        self.dataList = data
                        self.total = data.length > 0 ? data[0].total : 0
                        self.totalPages = Math.ceil(self.total / 10);
                    })
                },
                ChangePageNext: function () {//切换下一页
                    var self = this;
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var start = (self.page - 1) * self.pageSize + 1;
                    var end = self.page * self.pageSize;
                    if (self.total > end) {
                        self.page++;
                        start = (self.page - 1) * self.pageSize+1;
                        end = self.page * self.pageSize;
                        //调用存储过程,重新赋值datalist
                        var executeParam = {
                            'SPName': "usp_AutoDateListInfo", 'SQLParams': [
                                { Name: 'Start', Value: start, DBType: 'string' },
                                { Name: 'End', Value: end, DBType: 'string' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                            self.dataList = data
                            $(".dir_content").remove();
                        })
                    }
                },
                ChangePagePrev: function () {//切换上一页
                    var self = this;
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    var start = (self.page - 1) * self.pageSize + 1;
                    var end = self.page * self.pageSize;
                    if (start>1) {
                        self.page--;
                        start = (self.page - 1) * self.pageSize + 1;
                        end = self.page * self.pageSize;
                        //调用存储过程,重新赋值datalist
                        var executeParam = {
                            'SPName': "usp_AutoDateListInfo", 'SQLParams': [
                                { Name: 'Start', Value: start, DBType: 'string' },
                                { Name: 'End', Value: end, DBType: 'string' }
                            ]
                        };
                        common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                            self.dataList = data
                            $(".dir_content").remove();
                        })
                    }
                },
                appendView: function ($event) {
                    var self = this;
                    var target = $event.currentTarget;
                    var tr = $(target).parent().parent();
                    var date = tr.find("td").eq(1).html();
                    var finalTemplate='';
                    var svcUrl = GlobalVariable.DataProcessServiceUrl + "CommonExecuteGet?";
                    //调用存储过程
                    var executeParam = {
                        'SPName': "usp_AutoObjListInfo", 'SQLParams': [
                            { Name: 'CreateDate', Value: date, DBType: 'string' },
                        ]
                    };
                    common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {                 
                        $.each(data, function (i, v) {
                            if (i == 0) {
                                var temp1 = '<tr class="dir_content"><td colspan="4"><div class="hiddenbox"><div class="content_row"><span class="content_row_span">{0}</span><span class="content_row_span_color" data-url="{1}" data-date="{2}">查看详情</span><span class="content_row_span_color1" data-url1="{3}" data-date1="{4}">错误报告</span></div>'
                                temp1 = temp1.format(v.objCode, '../productManage/TrustManagement/TaskListVerify/TaskListVerifyChild/EntrustedKendoGridPage.html?objCode=' + v.objCode + '&date=' + date + '&AutoTest=AutoTaskList' + '&IsAutoTest=1', date, '../productManage/TrustManagement/TaskListVerify/TaskListVerifyChild/ErrorReporting.html?objCode=' + v.objCode + '&date=' + date + '&AutoTest=AutoTest' + '&IsAutoTest=1', 'error' + date)
                            } else if (i == data.length - 1) {
                                var temp2 = '<div class="content_row"><span class="content_row_span">{0}</span><span class="content_row_span_color"  data-url="{1}" data-date="{2}">查看详情</span><span class="content_row_span_color1" data-url1="{3}" data-date1="{4}">错误报告</span></div>'
                                temp2 = temp2.format(v.objCode, '../productManage/TrustManagement/TaskListVerify/TaskListVerifyChild/EntrustedKendoGridPage.html?objCode=' + v.objCode + '&date=' + date + '&AutoTest=AutoTaskList' + '&IsAutoTest=1', date, '../productManage/TrustManagement/TaskListVerify/TaskListVerifyChild/ErrorReporting.html?objCode=' + v.objCode + '&date=' + date + '&AutoTest=AutoTest' + '&IsAutoTest=1', 'error' + date)
                            } else {
                                var temp3 = '<div class="content_row"><span class="content_row_span">{0}</span><span class="content_row_span_color" data-url="{1}" data-date="{2}">查看详情</span><span class="content_row_span_color1" data-url1="{3}" data-date1="{4}">错误报告</span></div></div></td></tr>'
                                temp3 = temp3.format(v.objCode, '../productManage/TrustManagement/TaskListVerify/TaskListVerifyChild/EntrustedKendoGridPage.html?objCode=' + v.objCode + '&date=' + date + '&AutoTest=AutoTaskList' + '&IsAutoTest=1', date, '../productManage/TrustManagement/TaskListVerify/TaskListVerifyChild/ErrorReporting.html?objCode=' + v.objCode + '&date=' + date + '&AutoTest=AutoTest' + '&IsAutoTest=1', 'error' + date)
                            }
                            finalTemplate+= temp1?temp1:'' + temp2?temp2:'' + temp3?temp3:'';
                        })
                     
                        if (tr.next().hasClass("dir_content")) {
                            tr.next().toggle();
                        } else {
                            tr.after(finalTemplate);
                        }
                    })
                },
            }

        })
        $("body").on("click", ".content_row_span_color", function () {
            var page = $(this).attr("data-url");
            var trustId = $(this).attr("data-date");
            var tabName = $(this).prev().html()+'_详情';
            var pass = true;
            parent.parent.viewModel.tabs().forEach(function (v, i) {
                if (v.id == trustId) {
                    pass = false;
                    return false;
                }
            })
            if (pass) {
                var newTab = {
                    id: trustId,
                    url: page,
                    name: tabName,
                    disabledClose: false
                };
                parent.parent.viewModel.tabs.push(newTab);
                parent.parent.viewModel.changeShowId(newTab);
                $('.chrome-tabs-shell', parent.parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
                $('.chrome-tabs-shell', parent.parent.document).find('.active').addClass('chrome-tab-current');
            };
        })
        $("body").on("click", ".content_row_span_color1", function () {
            var page = $(this).attr("data-url1");
            var trustId = $(this).attr("data-date1");
            var tabName = $(this).prev().prev().html() + '_错误报告';
            var pass = true;
            parent.parent.viewModel.tabs().forEach(function (v, i) {
                if (v.id == trustId) {
                    pass = false;
                    return false;
                }
            })
            if (pass) {
                var newTab = {
                    id: trustId,
                    url: page,
                    name: tabName,
                    disabledClose: false
                };
                parent.parent.viewModel.tabs.push(newTab);
                parent.parent.viewModel.changeShowId(newTab);
                $('.chrome-tabs-shell', parent.parent.document).find('.chrome-tab-current').removeClass('chrome-tab-current');
                $('.chrome-tabs-shell', parent.parent.document).find('.active').addClass('chrome-tab-current');
            };
        })
    });
})