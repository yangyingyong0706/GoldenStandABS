define(function (require) {
    var webStore = function () {
        this.setItem = function (key,value) {
            // Save data to sessionStorage
            sessionStorage.setItem(key, value);
        }

        this.removeItem = function (key) {
            // Remove saved data from sessionStorage
            sessionStorage.removeItem(key);
        }

        this.getItem = function (key) {
            // Remove saved data from sessionStorage
            var data = sessionStorage.getItem(key);

            return data;
        }

        this.clear = function () {
            sessionStorage.clear();
        }
    }

    return new webStore();
});