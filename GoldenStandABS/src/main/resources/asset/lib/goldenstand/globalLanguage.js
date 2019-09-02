define(function () {
    function globalLanguage(language) {
        this.language = language;
        this.resource = {};
        this.init();
    }

    globalLanguage.prototype = {
        init: function () {
            if (this.language == 'ch') {
                this.resource.basicAsset = {
                    menu1: '中文'
                };
                this.resource.assetFilter = {
                    menu1: '中文'
                }
            }
            else if (this.language == 'en') {
                this.resource.basicAsset = {
                    menu1: 'English'
                };
                this.resource.assetFilter = {
                    menu1: 'English'
                }
            }
        }
    }

    return globalLanguage;
});

//use case var globalLanguage = require('globalLanguage');
// var text = new globalLanguage('ch').resoure.basicAsset.menu1