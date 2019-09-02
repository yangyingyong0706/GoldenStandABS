define(function (require) {
    var $ = require('jquery');
    var Vue = require('Vue2');

    var webProxy = require('gs/webProxy');
    var gsUtil = require('gs/gsUtil');
    var GlobalVariable = require('globalVariable');
    var GSDialog = require('gs/uiFrame/js/gs-admin-2.pages');
    var common = require("common");
    require('jquery.localizationTool');
    var webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');
    var ProjectId = common.getQueryString('ProjectId');
    var toast = require('toast');
    if (ProjectId) {
        addProject = false
    } else {
        addProject = true
    }
    if (userLanguage) {
        $('#selectLanguageDropdown_qcl').localizationTool('translate', userLanguage);
    }
    $('body').show();

    CheckStyle = function (obj) { //用来实时判断是否为空
        var $this = $(obj);
        //var objValue = $this.val().replace(/,/g, "");
        //var id = $this.parent().attr("id");
        var objValue = $this.val();

        if ($this.hasClass("red-border")) {
            $this.removeClass("red-border")
        }
        var pattern = new RegExp("/^[ ]*$/");

        if (!objValue.trim()) {
            $this.val("不能为空或空格！！");
            //$this.placeholder = "不能为空或空格！！";
            $this.addClass("red-border");
            $this.blur();
            return false
        }
    }
    //check on off
    $("body").on("click", "#checkAll", function () {
        if ($(this)[0].checked) {
            $(this).parent().parent().find("#selectTeam").prop("disabled", false);
            $(this).parent().parent().find("#selectGroup").prop("disabled", false);
            $(this).parent().parent().find("#selectTemplate").prop("disabled", false);
        } else {
            $(this).parent().parent().find("#selectTeam").prop("disabled", true);
            $(this).parent().parent().find("#selectGroup").prop("disabled", true);
            $(this).parent().parent().find("#selectTemplate").prop("disabled", true);
        }
    })
    $("body").on("change", "#selectTeam", function () {
        var teamid = $(this).val();
        var selectGroup = $(this).parents("#dialogSetting").find("#selectGroup");
        var selectTemplate = $(this).parents("#dialogSetting").find("#selectTemplate");
        var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForGetQuickteam?operate=ProjectGroup&teamid=' + teamid;
        var svcUrlex = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForGetQuickteam?operate=ProjectTemplate&teamid=' + teamid
        myVue.Template = [];
        myVue.ProjectGroupId = [];
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrl,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                myVue.ProjectGroupId = JSON.parse(response);
                selectGroup.html("");
                var options = "<option value={0}>{1}</option>";
                var html = "";
                if (JSON.parse(response).length == 0) {
                    html = options.StringFormat('', '暂无')
                }
                $.each(JSON.parse(response), function (i, v) {
                    html += options.StringFormat(v.ProjectGroupId, v.ProjectGroupName)
                })
                selectGroup.append(html);
            },
            error: function (response) {
                alert('Error occursed while requiring the remote source data!');
            }
        });
        $.ajax({
            cache: false,
            type: "GET",
            async: false,
            url: svcUrlex,
            dataType: "json",
            contentType: "application/xml;charset=utf-8",
            data: {},
            success: function (response) {
                myVue.Template = JSON.parse(response);
                selectTemplate.html("");
                var options = "<option value={0}>{1}</option>";
                var html = "";
                if (JSON.parse(response).length == 0) {
                    html = options.StringFormat('', '暂无')
                }
                $.each(JSON.parse(response), function (i, v) {
                    html += options.StringFormat(v.ProjectId, v.ProjectName)//ProjectId
                })
                selectTemplate.append(html);
            },
            error: function (response) {
                alert('Error occursed while requiring the remote source data!');
            }
        });
    })
    $("body").on("click", "#SaveSettings", function () {
        myVue.QuickteamSync = $(this).parent().parent().find("#checkAll")[0].checked == true ? 1 : 0
        myVue.selectTeam = $(this).parent().parent().find("#selectTeam").val();
        myVue.selectTemplate = $(this).parent().parent().find("#selectTemplate").val();
        myVue.selectGroup = $(this).parent().parent().find("#selectGroup").val();
        //$.toast({
        //    type: 'success',
        //    message: '保存成功',
        //    hideTime:1000,
        //    afterHidden: function () {
        //        $("#modal-close").trigger("click")
        //    }
        //});
        GSDialog.HintWindow('保存成功')
    })


    window.myVue = new Vue({
        el: "#container",
        data: {
            loading: false,
            ProjectMsg: {
                ProjectName: '',
                ProjcetShortName: '',
                ProjectStatus: '',
                ChargeUserName: '',
                DurationChargeUserName: '',
                ProjectModel: '',
                ProjectAlert: '',
                ProjectDesc: '',
                teamid: ""
            },
            ProjectStatus: [],
            ProjectAlert: [
                   { AlertDesc: '正常' },
                   { AlertDesc: '一般' },
                   { AlertDesc: '高危' }
            ],
            responseTeam: [],//团队
            Template: [],//模板
            ProjectGroupId: [],//分组
            addProject: addProject,
            selectTeam: "",
            selectTemplate: '',
            selectGroup: '',
            QuickteamSync: 0,//是否同步
            QuickteamName: ""
        },
        mounted: function () {
            this.GetProjectStatus()
            if (ProjectId) {
                this.GetProjectMsg()
            }
        },
        methods: {
            //获取项目状态数据
            GetProjectStatus: function () {
                var self = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					executeParam = {
					    SPName: "TrustManagement.usp_GetProjectStatus",
					};
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data) {
                        self.ProjectStatus = data
                    }
                });
            },
            //获取项目信息
            GetProjectMsg: function () {
                var self = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					executeParam = {
					    SPName: "TrustManagement.usp_GetProjectById",
					    SQLParams: [
                            { 'Name': 'projectId', 'Value': ProjectId, 'DBType': 'string' }
					    ]
					};
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data) {
                        self.ProjectMsg = data[0]
                    }
                });
            },
            SaveProject: function () {
                var self = this;
                var isFormFieldsAllValid = true;
                $('.public_font_style .form-control').each(function () {
                    if (!common.CommonValidation.ValidControlValue($(this))) isFormFieldsAllValid = false;
                });
                if (!common.CommonValidation.ValidControlValue($("#Pdescription"))) isFormFieldsAllValid = false;
                if (!isFormFieldsAllValid) {
                    //$('#loading').hide();
                    GSDialog.HintWindow('请填写完全项目必要信息！')
                    return false;
                }
                var pattern = new RegExp("[^(\u4E00-\u9FA5\uF900-\uFA2D)0-9a-zA-Z_-]");
                var pass = true;
                var checkart = $("input.form-control");
                var checkArray = []
                $.each(checkart, function (i, v) {
                    if (pattern.test($(v).val())) {
                        $(v).addClass("theInputBorderRed");
                        checkArray.push(false)
                    } else {
                        $(v).removeClass("theInputBorderRed");
                        checkArray.push(true)
                    }
                })
                $.each(checkArray, function (j, k) {
                    if (k == false) {
                        pass = false
                        return false;
                    }
                })
                if (!pass) {
                    GSDialog.HintWindow("输入不合法,只能输入数字,字母,下划线,破折号的组合");
                    return false
                }
                if (self.QuickteamSync == '1') {
                    self.QuickteamName = self.ProjectMsg.ProjectName;
                }
                console.log(self.QuickteamName)
                var projectXml = '<Projects><Project>'
                projectXml += '<ProjectName>' + self.ProjectMsg.ProjectName + '</ProjectName>'
                projectXml += '<ProjectShortName>' + self.ProjectMsg.ProjectShortName + '</ProjectShortName>'
                projectXml += '<ProjectStatus>' + self.ProjectMsg.ProjectStatus + '</ProjectStatus>'
                projectXml += '<ProjectModel>' + self.ProjectMsg.ProjectModel + '</ProjectModel>'
                projectXml += '<ChargeUserName>' + self.ProjectMsg.ChargeUserName + '</ChargeUserName>'
                projectXml += '<DurationChargeUserName>' + self.ProjectMsg.DurationChargeUserName + '</DurationChargeUserName>'
                projectXml += '<ProjectAlert>' + self.ProjectMsg.ProjectAlert + '</ProjectAlert>'
                projectXml += '<ProjectDesc>' + self.ProjectMsg.ProjectDesc + '</ProjectDesc>'
                projectXml += '<TeamId>' + self.selectTeam + '</TeamId>'
                projectXml += '<ProjectGroupId>' + self.selectGroup + '</ProjectGroupId>'
                projectXml += '<TemplateId>' + self.selectTemplate + '</TemplateId>'
                projectXml += '<QuickteamSync>' + self.QuickteamSync + '</QuickteamSync>'
                projectXml += '<QuickteamName>' + self.QuickteamName + '</QuickteamName>'
                projectXml += '</Project></Projects>'
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForQuickteam?',
					executeParam = {
					    SPName: "TrustManagement.usp_SaveProject",
					    SQLParams: [
                            { 'Name': 'projectXml', 'Value': projectXml, 'DBType': 'xml' },
                            { 'Name': 'username', 'Value': webStorage.getItem('gs_UserName'), 'DBType': 'string' },
                            { 'Name': 'ProjectType', 'Value': 0, 'DBType': 'int' },

					    ]
					};
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data) {
                        webStorage.setItem('ProjectId', data[0].ProjectId);
                        GSDialog.HintWindow('保存成功！', function () {
                            //新建项目触发下一步点击事件
                            var nextStepul = $('ul>li.current_li', parent.document).next();
                            if (nextStepul) {
                                $(nextStepul).trigger("click");
                            } else {
                                parent.document.location.reload();
                            }
                        })
                    }
                });
            },
            UpdateProject: function () {
                var self = this;
                var projectXml = '<Projects><Project>'
                projectXml += '<ProjectId>' + parseInt(ProjectId) + '</ProjectId>'
                projectXml += '<ProjectName>' + self.ProjectMsg.ProjectName + '</ProjectName>'
                projectXml += '<ProjectShortName>' + self.ProjectMsg.ProjectShortName + '</ProjectShortName>'
                projectXml += '<ProjectStatus>' + self.ProjectMsg.ProjectStatus + '</ProjectStatus>'
                projectXml += '<ProjectModel>' + self.ProjectMsg.ProjectModel + '</ProjectModel>'
                projectXml += '<ChargeUserName>' + self.ProjectMsg.ChargeUserName + '</ChargeUserName>'
                projectXml += '<DurationChargeUserName>' + self.ProjectMsg.DurationChargeUserName + '</DurationChargeUserName>'
                projectXml += '<ProjectAlert>' + self.ProjectMsg.ProjectAlert + '</ProjectAlert>'
                projectXml += '<ProjectDesc>' + self.ProjectMsg.ProjectDesc + '</ProjectDesc>'
                projectXml += '</Project></Projects>'
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForPool?',
					executeParam = {
					    SPName: "TrustManagement.usp_UpdateProject",
					    SQLParams: [
                            { 'Name': 'projectXml', 'Value': projectXml, 'DBType': 'xml' },
                            { 'Name': 'username', 'Value': webStorage.getItem('gs_UserName'), 'DBType': 'string' }
					    ]
					};
                common.ExecuteGetData(false, svcUrl, 'TrustManagement', executeParam, function (data) {
                    if (data) {
                        GSDialog.HintWindow('更新成功！')
                    }
                });
            },
            //显示高级选项并获取数据
            ShowDialog: function () {
                var self = this;
                var svcUrl = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForGetQuickteam?operate=Team';
                self.responseTeam = [];
                self.Template = [];
                self.ProjectGroupId = [];
                $.ajax({
                    cache: false,
                    type: "GET",
                    async: false,
                    url: svcUrl,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: {},
                    success: function (response) {
                        self.responseTeam = JSON.parse(response);
                        self.teamid = JSON.parse(response)[0].TeamId;
                    },
                    error: function (response) {
                        alert('Error occursed while requiring the remote source data!');
                    }
                });
                console.log(self.teamid);
                var svcUrltwo = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForGetQuickteam?operate=ProjectGroup&teamid=' + self.teamid;
                var svcUrlthree = GlobalVariable.DataProcessServiceUrl + 'CommonGetExecuteForGetQuickteam?operate=ProjectTemplate&teamid=' + self.teamid;
                $.ajax({
                    cache: false,
                    type: "GET",
                    async: false,
                    url: svcUrltwo,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: {},
                    success: function (response) {
                        if (JSON.parse(response).length == "0") {
                            var arry = [];
                            var obj = {};
                            obj.ProjectGroupId = "";
                            obj.ProjectGroupName = '暂无'
                            arry.push(obj)
                            self.ProjectGroupId = arry;
                        } else {
                            self.ProjectGroupId = JSON.parse(response);
                        }
                    },
                    error: function (response) {
                        alert('Error occursed while requiring the remote source data!');
                    }
                });
                $.ajax({
                    cache: false,
                    type: "GET",
                    async: false,
                    url: svcUrlthree,
                    dataType: "json",
                    contentType: "application/xml;charset=utf-8",
                    data: {},
                    success: function (response) {
                        if (JSON.parse(response).length == "0") {
                            var arry = [];
                            var obj = {}
                            obj.ProjectId = "";
                            obj.ProjectName = '暂无'
                            arry.push(obj)
                            self.Template = arry;
                        } else {
                            self.Template = JSON.parse(response);
                        }
                    },
                    error: function (response) {
                        alert('Error occursed while requiring the remote source data!');
                    }
                });

                Vue.nextTick(function () {
                    $.anyDialog({
                        title: "高级设置",
                        width: 600,
                        height: 290,
                        html: $("#dialogSetting").clone(true).show(),
                        changeallow: false,
                        draggable:false
                    })
                })

            },

        }
    });
});



