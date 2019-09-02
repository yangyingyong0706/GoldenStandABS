define(function (require) {
    var $ = require("jquery");
    var Vue = require("Vue");
    var common = require('common');
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    var webStorage = require('gs/webStorage');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var enter = common.getQueryString('enter');
    var enterProjectId = common.getQueryString('ProjectId');
    var addProject, initUrl;
    if(enter) {
        addProject = false;
        initUrl = "./inputProjectMsg.html?ProjectId=" + enterProjectId;
    }else {
        addProject = true;
        initUrl = "./inputProjectMsg.html"
    }
    var vm = new Vue({
        el: "#app",
        data: {
            url: initUrl,
            addProject: addProject
        },
        methods: {
            changeIframe: function ($event) {
                var target = $event.target;
                var self = this;
                if (target.id) {
                    if (target.id == "ProjectMsg") {
                        var ProjectId = webStorage.getItem('ProjectId');
                        if (ProjectId) {
                            $(target).removeClass("current_li").addClass("current_li");
                            $(target).siblings().removeClass("current_li")
                            self.url = "../../basicAsset/QuickTrust/QuickTrustCreation.html?enter=ProjectApproval&ProjectId=" + ProjectId;
                        } else {
                            GSDialog.HintWindow('请新建项目后再新建产品！')
                        }
                    } else if (target.id == "addProject") {
                        webStorage.removeItem('ProjectId');
                        self.url = "inputProjectMsg.html"
                        $(target).removeClass("current_li").addClass("current_li");
                        $(target).siblings().removeClass("current_li")
                    } else if (target.id == "ProjectList") {
                        var ProjectId = webStorage.getItem('ProjectId');
                        if (ProjectId) {
                            $(target).removeClass("current_li").addClass("current_li");
                            $(target).siblings().removeClass("current_li")
                            self.url = "../../components/trustList/TrustList.html?enter=ProjectApproval&ProjectId=" + ProjectId;
                        } else {
                            GSDialog.HintWindow('请新建项目后再关联产品！')
                        }
                    }
                } else {
                    if ($(target).parent()[0].id == "ProjectMsg") {
                        var ProjectId = webStorage.getItem('ProjectId');
                        if (ProjectId) {
                            $(target).parent().removeClass("current_li").addClass("current_li");
                            $(target).parent().siblings().removeClass("current_li")
                            self.url = "../../basicAsset/QuickTrust/QuickTrustCreation.html?enter=ProjectApproval&ProjectId=" + ProjectId;
                        } else {
                            GSDialog.HintWindow('请新建项目后再新建产品！')
                        }  
                    } else if ($(target).parent()[0].id == "addProject") {
                        webStorage.removeItem('ProjectId');
                        self.url = "inputProjectMsg.html"
                        $(target).parent().removeClass("current_li").addClass("current_li");
                        $(target).parent().siblings().removeClass("current_li")
                    } else if ($(target).parent()[0].id == "ProjectList") {
                        var ProjectId = webStorage.getItem('ProjectId');
                        if (ProjectId) {
                            $(target).parent().removeClass("current_li").addClass("current_li");
                            $(target).parent().siblings().removeClass("current_li")
                            self.url = "../../components/trustList/TrustList.html?enter=ProjectApproval&ProjectId=" + ProjectId;
                        } else {
                            GSDialog.HintWindow('请新建项目后再关联产品！')
                        }
                    }
                }
            },
            changeIframeEdit: function ($event) {
                var target = $event.target;
                var self = this;
                if (target.id) {
                    $(target).removeClass("current_li").addClass("current_li");
                    $(target).siblings().removeClass("current_li")
                    if (target.id == "ProjectMsg") {
                        self.url = "../../basicAsset/QuickTrust/QuickTrustCreation.html?enter=ProjectApproval&ProjectId=" + enterProjectId;
                    } else if (target.id == "addProject") {
                        self.url = "inputProjectMsg.html?ProjectId=" + enterProjectId;
                    } else if (target.id == "ProjectList") {
                        self.url = "../../components/trustList/TrustList.html?enter=ProjectApproval&ProjectId=" + enterProjectId;
                    }
                } else {
                    if ($(target).parent()[0].id == "ProjectMsg") {
                        self.url = "../../basicAsset/QuickTrust/QuickTrustCreation.html?enter=ProjectApproval&ProjectId=" + enterProjectId;
                    } else if ($(target).parent()[0].id == "addProject") {
                        self.url = "inputProjectMsg.html?ProjectId=" + enterProjectId;
                    } else if ($(target).parent()[0].id == "ProjectList") {
                        self.url = "../../components/trustList/TrustList.html?enter=ProjectApproval&other=EditProject&ProjectId=" + enterProjectId;
                    }
                    $(target).parent().removeClass("current_li").addClass("current_li");
                    $(target).parent().siblings().removeClass("current_li");
                }
            }
        }
    })
})