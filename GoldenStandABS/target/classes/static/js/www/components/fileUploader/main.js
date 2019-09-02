define(function (require) {
    var $ = require('jquery');
    var vue = require('Vue2');
    var webProxy = require('gs/webProxy');

    new vue({
        el: "#fileUploadMain",
        data: {
            obj: {
                loaderTitle: '上传文件',
                uploadButtonTitle: '上传',
                cancelButtonTitle: '取消',
                selectedFile: ''
            } 
        },
        methods: {
            upload: function () {

                var filePath = $('#fileUploadFile').val();
                var fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

                UploadFile('fileUploadFile', fileName, 'PoolImportData', function (data) {

                    parent.uploadedFilePath = data;

                });
            },
            cancel: function () {
                return "";
            }
        }
    });


    var UploadFile = function (fileCtrlId, fileName, folder, fnCallback) {
        var fileData = document.getElementById(fileCtrlId).files[0];
        var svcUrl = webProxy.poolCutServiceURL + 'FileUpload?fileName={0}&fileFolder={1}'.format(encodeURIComponent(fileName), encodeURIComponent(folder));

        $.ajax({
            url: svcUrl,
            type: 'POST',
            data: fileData,
            cache: false,
            dataType: 'json',
            processData: false,
            success: function (response) {
                var sourceData;
                if (typeof response == 'string')
                    sourceData = JSON.parse(response);
                else
                    sourceData = response;
                parent.window.uploadedFilePath = sourceData.FileUploadResult;
                alert('Upload successfully');
            },
            error: function (data) {
                alert('File upload failed!');
            }
        });
    }

    
});
