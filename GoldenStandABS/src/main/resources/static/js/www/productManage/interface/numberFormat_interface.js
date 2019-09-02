
function NumberFormatUtils() {
    /*
    amount              -- amount to format
    decimalPlaces       -- number of decimal places, optional, defaults to 2
    decimalSeparator    -- decimal separator string, optional, defaults to '.'
    thousandsSeparator  -- optional
    negativeSign        -- optional
    groupSizes          -- optional, defaults to "3", could be "3,2", see NumberFormatInfo.NumberGroupSizes Property
    */
    function formatMoney(amount, decimalPlaces, decimalSeparator, thousandsSeparator, negativeSign, groupSizes) {
        try {
            if (decimalPlaces == null)
                decimalPlaces = 2;
            if (decimalSeparator == null)
                decimalSeparator = '.';
            if (thousandsSeparator == null)
                thousandsSeparator = ",";
            if (negativeSign == null)
                negativeSign = "-";
            if (groupSizes == null)
                groupSizes = "3";
            var dec = parseInt(decimalPlaces);
            var value = parseFloat(amount);
            if (isNaN(value)) {
                return "";
            }

            groupSizes = groupSizes.split(",");     // convert to array

            var isNegative = false;
            if (value < 0) {
                isNegative = true;
                value = Math.abs(value);
            }
            if (!isNaN(dec)) {
                value = fixNumber(value, dec);
            }

            if (thousandsSeparator != null) {
                value = value + '';     // convert to string
                value = formatGroups(value, groupSizes, thousandsSeparator);
            }

            if (isNegative && parseFloat(value, 10) > 0) {
                value = negativeSign + value;
            }

            value = "" + value;     // ensure value is a string

            if (decimalPlaces > 0)
                return reverse(reverse(value).replace('.', decimalSeparator));
            else
                return value;

        } catch (e) {
            alert(e);
        }
    }

    /*
      make sure toFixed function works correctly on IE and foxfire.
    */
    function fixNumber(num, d) {
        var s = num + ""; if (!d) d = 0;
        if (s.indexOf(".") == -1) s += "."; s += new Array(d + 1).join("0");
        if (new RegExp("^(-|\\+)?(\\d+(\\.\\d{0," + (d + 1) + "})?)\\d*$").test(s)) {
            var s = "0" + RegExp.$2, pm = RegExp.$1, a = RegExp.$3.length, b = true;
            if (a == d + 2) {
                a = s.match(/\d/g); if (parseInt(a[a.length - 1]) > 4) {
                    for (var i = a.length - 2; i >= 0; i--) {
                        a[i] = parseInt(a[i]) + 1;
                        if (a[i] == 10) { a[i] = 0; b = i != 1; } else break;
                    }
                }
                s = a.join("").replace(new RegExp("(\\d+)(\\d{" + d + "})\\d$"), "$1.$2");
            } if (b) s = s.substr(1); return (pm + s).replace(/\.$/, "");
        }
        return num.toFixed(d);
    };

    /*
    This reverses the string and starts counting digits after the decimal.  Once the group size
    is reached, it inserts the separator char and increments the group index.
    */
    function formatGroups(val, groupSizes, groupSeparator) {
        val = reverse(val);
        var groupIndex = 0, groupCharCount = 0;
        var groupSize = getGroupSize(groupIndex, groupSizes);

        var idx = val.indexOf('.') + 1;     // start past . or at beginning of string
        while (idx < val.length) {
            idx++;
            groupCharCount++;

            if (groupCharCount == groupSize && idx < val.length) {
                groupCharCount = 0;
                groupSize = getGroupSize(++groupIndex, groupSizes);
                val = val.substring(0, idx) + groupSeparator + val.substring(idx);
                idx++;
            }
        }

        return reverse(val);
    }

    // return group size or last group size
    function getGroupSize(index, groupSizes) {
        return parseInt((index >= groupSizes.length) ? groupSizes[groupSizes.length - 1] : groupSizes[index]);
    }

    // string reverse
    function reverse(str) {
        if (!str) return '';
        var revstr = '';
        for (i = str.length - 1; i >= 0; i--)
            revstr += str.charAt(i);
        return revstr;
    }

    function roundNumber(value, decimalPlaces) {
        var roundMultiplier = Math.pow(10, decimalPlaces);
        return Math.round(value * roundMultiplier) / roundMultiplier;
    }

    return {
        formatMoney: formatMoney,
        roundNumber: roundNumber
    };
}