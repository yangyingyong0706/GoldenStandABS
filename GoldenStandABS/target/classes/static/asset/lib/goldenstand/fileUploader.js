var uploadedFilePath;
define(['jquery', 'jquery-ui', 'anyDialog'], function (jQuery, ui, anyDialog) {
    var $ = jQuery;

    var fileUploader = function (params) {
        self.params = params;
        self.url = location.protocol + '//' + location.host + '/GoldenStandABS/www/components/fileUploader/fileUploader.html';

        this.onClose = function () {
            self.params.callback(uploadedFilePath);
            alert(self);
        }

        this.show = function () {
            $.anyDialog({
                title: '文件上传',
                url: self.url,
                height: self.params.height,
                width: self.params.weight,
                scrollable: true,
                isMaskClickToClose: false,
                dragable: true,
                onClose: this.onClose
            });
        }
    }

    return fileUploader;
});