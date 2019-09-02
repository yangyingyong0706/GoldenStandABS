define(function (require) {
    var common = require('common');
    //var qwFrame = require('app/productDesign/js/QuickWizard.FrameEnhanceCus');
    var qwFrame = require('app/productManage/TrustManagement/Common/Scripts/QuickWizard.FrameEnhanceCus');
    var appGlobal = require('App.Global');
    var GlobalVariable = appGlobal.GlobalVariable;
    var webStorage = require('gs/webStorage');
    var userLanguage = webStorage.getItem('userLanguage');
    var langx = {};
    if (userLanguage && userLanguage.indexOf('en') > -1) {
        langx.ProductInfo = "ViewTrustItem";
        langx.TrustSPRole = "TrustSPRole";
        langx.viewTrustAttatchedFiles = "viewTrustAttatchedFiles";
    } else {
        langx.ProductInfo = "产品信息";
        langx.TrustSPRole = "相关参与方";
        langx.viewTrustAttatchedFiles = "交易文档";

    }
    $(function () {
        //iframe取值，并且把该值暴露到top中去
        var stepListTustWizard = $(".step", top.frames["#mainsContentDisplayer_0"])[0].children;
        top.stepListTustWizard = stepListTustWizard;
        var businessIdentifier = common.getQueryString('tid');
        productPermissionState = common.getQueryString('productPermissionState');
        //设置当前模块 业务条目的标识
        qwFrame.SetModuleBusiness(businessIdentifier);

        //设置当前页面浏览器tab页处显示标题
        //qwFrame.SetPageTitle(GlobalVariable.Language_CN, '产品信息');
        //qwFrame.SetPageTitle(GlobalVariable.Language_EN, 'trustInfo');

        //设置当前页面模块名称（左侧导航处大标题）
        //qwFrame.SetModuleTitle(GlobalVariable.Language_CN, '相关参与方');
        //qwFrame.SetModuleTitle(GlobalVariable.Language_EN, 'TrustSPRole');

        //注册当前模块的步骤页面（左侧导航各步骤）
        qwFrame.RegisterStep(GlobalVariable.Language_CN, '1', 'ViewTrustItem', langx.ProductInfo, langx.ProductInfo, 'productManage/TrustManagement/ViewTrustItem/viewTrustItem.html?productPermissionState=' + productPermissionState, 1);
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '1', 'ViewTrustItem', 'ViewTrustItem', 'ViewTrustItem', 'productManage/TrustManagement/ViewTrustItem/viewTrustItem.html?productPermissionState=' + productPermissionState);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '2', 'dateset', langx.TrustSPRole, langx.TrustSPRole, 'productManage/TrustManagement/TrustSPRole/TrustSPRole.html?productPermissionState=' + productPermissionState, 0);
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '2', 'dateset', 'TrustSPRole', 'TrustSPRole', 'productManage/TrustManagement/TrustSPRole/TrustSPRole.html?productPermissionState=' + productPermissionState);

        qwFrame.RegisterStep(GlobalVariable.Language_CN, '3', 'sequence', langx.viewTrustAttatchedFiles, langx.viewTrustAttatchedFiles, 'productManage/TrustManagement/ViewTrustAttatchedFiles/viewTrustAttatchedFiles.html?productPermissionState=' + productPermissionState, 0);//'../../components/PaymentSequenceSetting/PaymentSequenceSetting.html'
        qwFrame.RegisterStep(GlobalVariable.Language_EN, '3', 'sequence', 'viewTrustAttatchedFiles', 'viewTrustAttatchedFiles', 'productManage/TrustManagement/ViewTrustAttatchedFiles/viewTrustAttatchedFiles.html?productPermissionState=' + productPermissionState);

        //当前页面数据绑定
        qwFrame.PageDataBind(false);
        clearTimeout(timer);
        var timer = setTimeout(function () {
            $('.step>a').eq(0).trigger("click")
        })
        $('.step>a').click(function () {
            qwFrame.ChangeSetp(this);
        });
        //输入你希望根据页面高度自动调整高度的iframe的名称的列表
        //用逗号把每个iframe的ID分隔. 例如: ["myframe1", "myframe2"]，可以只有一个窗体，则不用逗号。
        //定义iframe的ID
        var iframeids = ["mainContentDisplayer_0", "mainContentDisplayer_1", "mainContentDisplayer_2"];
        //如果用户的浏览器不支持iframe是否将iframe隐藏 yes 表示隐藏，no表示不隐藏
        var iframehide = "yes";
        function dyniframesize() {
            var dyniframe = new Array()
            for (i = 0; i < iframeids.length; i++) {
                if (document.getElementById) {
                    //自动调整iframe高度
                    dyniframe[dyniframe.length] = document.getElementById(iframeids[i]);
                    if (dyniframe[i] && !window.opera) {
                        dyniframe[i].style.display = "block";
                        if (dyniframe[i].contentDocument && dyniframe[i].contentDocument.body.offsetHeight) //如果用户的浏览器是NetScape
                            dyniframe[i].height = dyniframe[i].contentDocument.body.offsetHeight;
                        else if (dyniframe[i].Document && dyniframe[i].Document.body.scrollHeight) //如果用户的浏览器是IE
                            dyniframe[i].height = dyniframe[i].Document.body.scrollHeight;
                    }
                }
                //根据设定的参数来处理不支持iframe的浏览器的显示问题
                if ((document.all || document.getElementById) && iframehide == "no") {
                    var tempobj = document.all ? document.all[iframeids[i]] : document.getElementById(iframeids[i]);
                    tempobj.style.display = "block";
                }
            }
        }
        if (window.addEventListener)
            window.addEventListener("load", dyniframesize, false);
        else if (window.attachEvent)
            window.attachEvent("onload", dyniframesize);
        else
            window.onload = dyniframesize;
    });


});

