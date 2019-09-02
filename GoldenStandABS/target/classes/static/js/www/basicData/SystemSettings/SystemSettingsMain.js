define(function (require) {
    //var GlobalVariable = require('globalVariable');
    var common = require('common');
    //require('date_input');
    //var $ = require('jquery');
    //require('jquery-ui');
    var Vue = require('Vue');

    var trustId = common.getQueryString('tid');
    var tab = common.getHashValue('tab');
    var vm;

    $(function () {
        var liGroups = [
            { name: '公休假设置', url: 'CalendarDate/CalendarDateList.html', class: 'active' }
        ];
        vm = new Vue({
            el: '#app',
            data: {
                liSource: liGroups,
                sel: liGroups[0].url
            }

        });
    });
});