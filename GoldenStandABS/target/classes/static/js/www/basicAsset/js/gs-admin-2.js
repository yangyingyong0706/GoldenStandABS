var ribbonDefaultApp = 'DashBoard';
var ribbonDefaultModule = 'Index';

var ribbonRenderTmpl = {
    tabLi: '<li class="renderli" app="{0}"><a href="#{0}" role="button">{1}</a></li>',
    tabContainer: '<div id="{0}" class="ribbonBox"><ul>{1}</ul></div>',
    groupLi: '<li class="ribbonGroup" module="{0}" style="display: list-item;">{1}<p class="groupTitle">{2}</p></li>',
    maxButton: '<a href="{2}" id="menu-{4}" class="ribbonButton disabled" {3} style="display: inline-block;"><i class="{0}"></i><p>{1}</p></a>',
    mediumButtonContainer: '<div class="ribbonButtonSmall">{0}</div>',
    mediumButton: '<a href="{2}" class="disabled" {3}><i class="{0}"></i><span>{1}</span></a>'
};
function loadSiteRibbon() {
    $.ajax({
        url: 'UIFrame/configs/ribbon.xml',
        type: 'GET',
        dataType: 'xml',
        //timeout: 1000,
        cache: true,
        error: function (xml) {
            alert("加载XML文档出错!");
        },
        success: function (data) {
            renderRibbon(data);
            ribbonTabClickEventBind();
            ribbonTabGroupEnableDisable();
        }
    });
}
function renderRibbon(xml) {
    var $ribbonXML = $(xml);

    var tabLis = '';
    var ribbonBoxDivs = '';
    $ribbonXML.find('tab').each(function () {
        var $tab = $(this);

        var tabTitle = $tab.attr('title');
        var tabApp = $tab.attr('app');
        tabLis += ribbonRenderTmpl.tabLi.format(tabApp, tabTitle);
        ribbonBoxDivs += buildRibbonTabContent($tab, tabApp);
    });
    $('#ribbonTabUl').append(tabLis).after(ribbonBoxDivs);
};
function buildRibbonTabContent($tab, tabApp) {
    var groupLis = '';
    $tab.find('group').each(function () {
        var $group = $(this);
        var groupTitle = $group.attr('title');
        var groupModule = $group.attr('module');
        var buttons = '';
        $group.children('element').each(function () {
            var $element = $(this);
            buttons += buildRibbonButton($element);
        });
        groupLis += ribbonRenderTmpl.groupLi.format(groupModule, buttons, groupTitle);
    });
    return ribbonRenderTmpl.tabContainer.format(tabApp, groupLis);
}
function buildRibbonButton($element) {
    var button = '';

    var elementType = $element.attr('type');
    var elementTitle = $element.attr('title');
    var elementIcon = $element.attr('icon');
    var elementLinkUrl = $element.attr('linkurl');
    var elementLinkName = $element.attr('linkname');
    var elementLinkUrlTargeet = $element.attr('linkurltarget');

    var targetFrame = '', buttonAction = 'javascript:void(0)';
    if (elementLinkUrl) {
        if (elementLinkUrl.indexOf('javascript:') > -1) {
            var callMethod = elementLinkUrl.replace('javascript:', '');
            buttonAction = 'javascript:gsRibbonButtonClickedEventTransfer(\'{0}\')'.format(callMethod);
        } else {
            buttonAction = elementLinkUrl;
            if (elementLinkUrlTargeet)
                targetFrame = 'target="' + elementLinkUrlTargeet + '"';
            else
                targetFrame = 'target="iframeMainContent"';
        }
    }

    switch (elementType) {
        case 'container':
            var mediumButtons = '';
            $element.children('element').each(function () {
                button += buildRibbonButton($(this));
            });
            button = ribbonRenderTmpl.mediumButtonContainer.format(button);
            break;
        case 'button':
            button = ribbonRenderTmpl.maxButton.format(elementIcon, elementTitle, buttonAction, targetFrame, elementLinkName);
            break;
        case 'mediumButton':
            button = ribbonRenderTmpl.mediumButton.format(elementIcon, elementTitle, buttonAction, targetFrame);
            break;
        case 'dropdown':
            break;
        default:
            break;
    }
    return button;
}

function ribbonTabClickEventBind() {
    $('#ribbonTabUl>li>a').click(function (event) {
        event.preventDefault();

        var $this = $(this);

        //var selector = $(this).attr('href');
        //if (selector === '#') {
        //    $('#ribbonTabUl a').removeClass('isActive');
        //    $('.ribbonBox').slideUp(200);
        //    return;
        //}

        //var $tabContentDiv = $(selector && selector.replace(/.*(?=#[^\s]*$)/, ''));
        //if ($this.hasClass('isActive')) {
        //    $tabContentDiv.slideUp(200);
        //    $this.removeClass('isActive');
        //} else {
        //    $('#ribbonTabUl a').removeClass('isActive');
        //    $('.ribbonBox').hide();
        //    $tabContentDiv.slideDown(200);
        //    $this.addClass('isActive');
        //}
    });
};
function ribbonTabGroupEnableDisable() {
    $('#ribbonTabUl .renderli').hide();
    $('.ribbonGroup a').addClass('disabled');
    if (!ribbonDefaultApp) { return; }

    var displayApps = ribbonDefaultApp.split(',');
    $.each(displayApps, function (i, v) {
        var selector = '#ribbonTabUl>li[app="' + v + '"]';
        $(selector).show();

        if (ribbonDefaultModule) {
            var displayGroups = ribbonDefaultModule.split(',');
            $.each(displayGroups, function (index, value) {
                selector = '#' + v + ' li[module="' + value + '"] a';
                $(selector).removeClass('disabled');
            });
        }
    });
}

$(function () {

    loadSiteRibbon();

    $('#side-menu a').click(function () {
        var $this = $(this);
        if ($this.attr('href') == '#') return;

        var targetApp = $this.attr('app');
        var targetModule = $this.attr('module');
        //if (ribbonDefaultApp !== targetApp) {
        //    $('.ribbonBox').slideUp(200);
        //}
        ribbonDefaultApp = targetApp;
        ribbonDefaultModule = targetModule;
        ribbonTabGroupEnableDisable();
    });

    //Loads the correct sidebar on window load,
    //collapses the sidebar on window resize.
    // Sets the min-height of #page-wrapper to window size
    $(window).bind("load resize", function () {
        var topOffset = 85;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });
});

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

function gsRibbonButtonClickedEventTransfer(fnName) {
    var ifr = document.getElementById('iframeMainContent');
    var win = ifr.window || ifr.contentWindow;

    if (win && win[fnName] && typeof win[fnName] === 'function') {
        win[fnName]();
    }
}