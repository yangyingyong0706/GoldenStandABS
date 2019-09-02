define(function (require) {
    //var GlobalVariable = require('globalVariable');
    var common = require('common');
    //require('date_input');
    var $ = require('jquery');
    var Vue = require('Vue');

    var trustId = common.getQueryString('tid');
    var tab = common.getHashValue('tab');
    var vm;

    $(function () {
        var liGroups = [{ name: '类别设置', url: 'Categorys/CategorysList.html', class: 'active' }];
        vm = new Vue({
            el: '#app',
            data: {
                liSource: liGroups,
                sel: liGroups[0].url
            },
            methods: {
                switchPage: function (item) {
                    var _this = this;
                    if (item && item.url) {
                        _this.liSource.forEach(function (v, i) {
                            v.class = '';
                        });
                        item.class = 'active';
                        vm.sel=item.url;
                    }
                }
            }
        });
    });

});