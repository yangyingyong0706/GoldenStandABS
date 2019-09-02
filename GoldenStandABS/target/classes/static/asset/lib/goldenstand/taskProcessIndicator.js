define(['jquery', 'jquery-ui', 'anyDialog', 'gs/webStorage'], function (jQuery, ui, anyDialog, webStore) {
    var $ = jQuery;


    function taskProcessIndicator(params) {
        this.params = params;
         this.url = location.protocol + '//' + location.host+ '/TaskProcessEngine/www/taskprocessindicator/taskprocessindicator.html?clientName='+ params.clientName + '&appDomain=' + params.appDomain + '&taskCode=' + params.taskCode;
     
        webStore.removeItem('sContext');//初始化变量
        webStore.setItem('sContext', encodeURIComponent(params.sContext))

    }

    taskProcessIndicator.prototype = {
        show: function () {
            $($(top)[0])[0].$.anyDialog({
                title: '任务处理',
                url: this.url,
                height: this.params.height,
                width: this.params.weight,
                scrolling: false,
                isMaskClickToClose: false,
                draggable: true,
                onClose: this.params.callback
            });
        }
    }

    return taskProcessIndicator;
});