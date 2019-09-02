define(function (require) {
    //格式化字符串
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
        });
    };
    var VirtualPath = "/TrustManagementService", FilePathRoot = "TrustFiles";
    var FilePathConfig = function () { 
        this.GetFilePath=function (trustId, typeName, typeId, fileName) {
            var wl = window.location;
            var path = "{0}//{1}{2}/{3}/{4}/{5}/{6}/{7}";
            return path.format(wl.protocol, wl.host, VirtualPath, FilePathRoot, trustId, typeName, typeId, fileName);
        };
        //文件的相对路径问题，暂时用这种方式：跟保存一样，利用web.config中配置的FilePathBase，直接传递这段之后的路径，前面这段，在wcf中去获取，之后把path拼接上，再做其他验证之类的处理
        //<add key="FilePathBase" value="E:\TSSWCFServices\TrustManagementService\TrustFiles"/>
        this.GetFileRelativePath=function (trustId, typeName, typeId, fileName) {
            var wl = window.location;
            var path = "\\{0}\\{1}\\{2}\\{3}";
            return path.format(trustId, typeName, typeId, fileName);
        }
    };
    return new FilePathConfig();
})
