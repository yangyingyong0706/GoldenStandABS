/// <reference path="jquery.min.js" />
/// <reference path="jquery.hash.js" />
/// <reference path="common.js" />
/// <reference path="knockout-3.4.0.js" />

define(['jquery', 'globalVariable', 'knockout', 'common', 'gsAdminPages', 'gs/taskProcessIndicator', 'gs/sVariableBuilder', 'jquery.cookie', 'jquery.hash'],
    function ($, GlobalVariable, ko, common, GSDialog,taskIndicator, sVariableBuilder) {
    var qwFrame = {
        LangSet: function () {
            var cookieSet = $.cookie(GlobalVariable.Language_Set);
            if (!cookieSet) {
                cookieSet = GlobalVariable.Language_CN;
                $.cookie(GlobalVariable.Language_Set, cookieSet, { expires: 7, path: '/' });
            }

            return cookieSet;
        }(),
        TotalSteps: 0,
        BusinessIdentifier: '',
        PageData: {
            'zh-CN': {
                PageTitle: '', ModuleTitle: '', Switcher: 'Switch to English', Steps: []
                , Next: '下一步', Back: '上一步', Post: '完成', ShowRibbon: true
            },
            'en-US': {
                PageTitle: '', ModuleTitle: '', Switcher: '切换至中文', Steps: []
                 , Next: 'Next', Back: 'Back', Post: 'Save', ShowRibbon: true
            }
        },
        DataModel: {},


        SetModuleBusiness: function (id) {
            this.BusinessIdentifier = id;
        },
        SetPageTitle: function (set, title) {
            this.PageData[set].PageTitle = title;
        },
        SetModuleTitle: function (set, title) {
            this.PageData[set].ModuleTitle = title;
        },
        RegisterStep: function (set, seqNo, code, title, description, linkUrl) {
            if (this.BusinessIdentifier) {
                if (linkUrl&&linkUrl.indexOf('?') > -1)
                    linkUrl += '&tid={0}';
                else {
                    if (!linkUrl) {

                    } else {
                        linkUrl += '?tid={0}';
                    }
                }
                if (linkUrl) {
                    linkUrl = linkUrl.format(this.BusinessIdentifier);
                }
                
            }

            var step = { SeqNo: seqNo, Code: code, Title: title, Description: description, LinkUrl: linkUrl };

            if (typeof this.PageData[set].Steps != 'object')
                this.PageData[set].Steps = [];

            this.PageData[set].Steps.push(step);
        },
        PageDataBind: function (showRibbon) {
            this.DataModel = this.PageData[this.LangSet];
            this.TotalSteps = this.DataModel.Steps.length;
            if (showRibbon !== undefined) this.DataModel.ShowRibbon = showRibbon;
            ko.applyBindings(this.DataModel, $('html')[0]);

            var step = $.hash('step');
            if (step) {
                var $step = $('.step>a[pageCode="' + step + '"]');
                if ($step && $step.length) {
                    $step.click();
                }
            }
        }



        ///////frame enhancement
    , StepEvents: []
    , Buttons: { btnNext: '#btnNext', btnBack: '#btnBack' }
    , CurrentStep: 0
    , ChangeSetp: function (obj) {//obj arg maybe an "<a>" element or a number(Step Index) or a 'PageCode'
        var targetStep;
        if (typeof obj === 'object') {
            targetStep = $(obj).attr('itemIndex');
        } else if (isNaN(obj)) {
            targetStep = $('.step>a[pageCode="' + obj + '"]').attr('itemIndex');
        } else {
            targetStep = obj;
        }

        //$('#mainContentDisplayer_' + targetStep).removeClass('hidden').siblings().addClass('hidden');

        //var $step = $('.step a:nth(' + (targetStep) + ')');
        //$step.addClass('active').siblings().removeClass('active');
        //$.hash('step', $step.attr('pageCode'));

        //this.CurrentStep = parseInt(targetStep);

        //$(this.Buttons.btnBack).attr('disabled', targetStep == 0);
        //var btnNextText = (targetStep == this.TotalSteps - 1) ? this.DataModel.Post : this.DataModel.Next;
        //$(this.Buttons.btnNext).find('span').text(btnNextText);
        var _this = this;
        this.CurrentStep = parseInt(targetStep)
        $(obj).addClass('active').siblings().removeClass('active');
        var newUrl = GlobalVariable.TrustManagementServiceHostURL;
        _this.PageData['zh-CN'].Steps.forEach(function (v, i) {
            if ($(obj).attr('PageCode') == v.Code) {
                newUrl += v.LinkUrl;
                return true;
            }
        });
        if ((this.PageData['zh-CN'].Steps)[this.CurrentStep] && (this.PageData['zh-CN'].Steps)[this.CurrentStep].LinkUrl) {
            $('#iframe_main').attr('src', newUrl);
        } else {
            //当作按钮使用
            var Code = (this.PageData['zh-CN'].Steps)[this.CurrentStep].Code;
            this[Code]();
            //if (typeof Code === 'function') {
            //    Code();
            //}
        };
        
    }
    , ChangeLayoutsColumns: function (obj, num) {
        var $obj = $(obj);
        $obj.addClass('btn-active').siblings().removeClass('btn-active');

        for (var i = 0; i < this.TotalSteps; i++) {
            var ifr = document.getElementById('mainContentDisplayer_' + i);
            var win = ifr.window || ifr.contentWindow;
            if (win && win['AutoLayoutFromFrame'] && typeof win['AutoLayoutFromFrame'] === 'function') {
                win['AutoLayoutFromFrame'](num);
            }
        }
    }
    , StepNext: function (iStep) {
        var lastStep = this.TotalSteps - 1;
        if (this.CurrentStep == lastStep && iStep > 0) {
            this.DoStepsSave();
        } else {
            this.ChangeSetp(this.CurrentStep + iStep);
        }
    }
    , GetStepElementById: function (pageCode, elementId) {
        var iframeIndex = $('.step>a[pageCode="' + pageCode + '"]').attr('itemIndex');
        var ifr = document.getElementById('mainContentDisplayer_' + iframeIndex);
        if (!ifr) return null;
        var win = ifr.window || ifr.contentWindow;
        var element = null;
        if (win) element = win.document.getElementById(elementId);
        return element;
    }
    , RegisterStepEvents: function (obj) {
        this.StepEvents.push(obj);
    }
    , DoStepsSave: function () {
        var self = this;
        var hasErrorStep = false;

        $.each(self.StepEvents, function (i, v) {
            var pageCode = v.PageCode;
            if (v.Validation && typeof v.Validation === 'function') {
                if (!v.Validation()) {
                    hasErrorStep = true;
                    $('.step>a[pageCode="' + pageCode + '"]').addClass('red');
                }
            }
        });

        if (hasErrorStep) { return; }

        $.each(self.StepEvents, function (i, v) {
            if (v.Save && typeof v.Save === 'function') {
                if (!v.Save()) {
                    var obj = $('.step>a[pageCode="' + v.PageCode + '"]').attr('itemIndex');
                    self.ChangeSetp(obj);
                    alert('当前步骤保存失败！');
                    return false;
                }
            }
        });
    }
    , ReloadStep: function (pageCode) {
        var iframeIndex = $('.step>a[pageCode="' + pageCode + '"]').attr('itemIndex');
        var ifr = document.getElementById('mainContentDisplayer_' + iframeIndex);
        if (!ifr) return null;
        var win = ifr.window || ifr.contentWindow;
        win.document.location.reload();
    }
    , GotoStep: function () {
        //定义一个跳转接口，具体逻辑在调用这个模块的页面对这个接口进行实现
    }
    , DataVerification: function () {
            var trustId = common.getQueryString('tid');
            var excelFilePath = 'E:\\TSSWCFServices\\PoolCut\\Files\\DataCheck\\收益分配数据校验.xlsx';
            var verifySourceTable = 'AssetVerification_{0}_{1}_{2}'.format('UNK', 'AUTO', (new Date()).dateFormat('yyyy_MM_dd_hh_mm_ss_S'));
            sVariableBuilder.AddVariableItem('VerifySourceTable', verifySourceTable, 'String');
            sVariableBuilder.AddVariableItem('TrustId', trustId, 'String');
            sVariableBuilder.AddVariableItem('excelFilePath', excelFilePath, 'String');
            var sVariable = sVariableBuilder.BuildVariables();
            var taskCode = 'CashflowAllocationVerification';
            var tIndicator = new taskIndicator({
                width: 800,
                height: 550,
                clientName: 'TaskProcess',
                appDomain: 'Task',
                taskCode: taskCode,
                sContext: sVariable,
                callback: function () {
                    //this.sessionId = sessionStorage.getItem('sessionId');
                    GSDialog.topOpen('数据校验', '../../productManage/TrustManagement/CashflowColletionVerify/DataCheck.html', 2, function (result) {
                        if (result) {
                            window.location.reload();
                        }
                    }, 600, 330);
                }
            });
            tIndicator.show();

        }
    };

    return qwFrame;
})
