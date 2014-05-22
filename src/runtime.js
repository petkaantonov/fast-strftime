"use strict";
/*
Copyright (c) 2014 Petka Antonov

With parts by Sami Samhuri
Copyright 2010 - 2014 Sami Samhuri under the terms of the MIT license found
at http://sjs.mit-license.org/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
var ord = new Array(31);
var timeZones = new Array(1800);
var zeroPads2 = new Array(10);
var zeroPads3 = new Array(100);
var spacePads2 = new Array(10);
var spacePads3 = new Array(100);

function Runtime() {}

Runtime.prototype.weekNumber = function(d, firstWeekday) {
    firstWeekday = firstWeekday || 'sunday';

    var wday = d.getDay();
    if (firstWeekday == 'monday') {
        if (wday == 0) // Sunday
            wday = 6;
        else
            wday--;
    }
    var firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    var yday = (d - firstDayOfYear) / 86400000;
    var weekNum = (yday + 7 - wday) / 7;
    return weekNum | 0;
};

Runtime.prototype.to12 = function to12(hour) {
    if (hour === 0) return 12;
    else if (hour > 12) return hour - 12;
    else return hour;
};

Runtime.prototype.pad = function pad(num, ch, length) {
    if (ch === -1) return '' + num;
    var arrLength = length === 3 ? 100 : 10;
    if (num >= arrLength) {
        return '' + num;
    }
    var arr = ch === 1
                ? (length === 3 ? this.spacePads3 : this.spacePads2)
                : (length === 3 ? this.zeroPads3 : this.zeroPads2);

    return arr[num];
};

Runtime.prototype.formatTz = function(offset) {
    var index = (offset + 900) | 0;
    var str = this.timeZones[index];

    if (str === "") {
        str = (offset < 0 ? '-' : '+') +
            this.pad(Math.abs(offset / 60 | 0) | 0, 0, 2) +
            this.pad(offset % 60 | 0, 0, 2);
        this.timeZones[index] = internalizeString(str);
    }
    return str;
};

Runtime.prototype.ord = ord;
Runtime.prototype.timeZones = timeZones;
Runtime.prototype.zeroPads2 = zeroPads2;
Runtime.prototype.zeroPads3 = zeroPads3;
Runtime.prototype.spacePads2 = spacePads2;
Runtime.prototype.spacePads3 = spacePads3;

var internalizeString = (function() {
    var o = {"- ": 0};
    delete o["- "];
    return function(str) {
        o[str] = true;
        var ret = Object.keys(o)[0];
        delete o[str];
        return ret;
        try {} finally {}
    };
})();

function _pad(num, ch, length) {
    return ((new Array(length + 1).join(ch)) + num).slice(-length);
}

for (var i = 0; i < 10; ++i) {
    zeroPads2[i] = internalizeString(_pad(i, "0", 2));
    spacePads2[i] = internalizeString(_pad(i, " ", 2));
}

for (var i = 0; i < 100; ++i) {
    zeroPads3[i] = internalizeString(_pad(i, "0", 3));
    spacePads3[i] = internalizeString(_pad(i, " ", 3));
}

for (var i = 0; i < timeZones.length; ++i) {
    timeZones[i] = "";
}

for (var i = 0; i < ord.length; ++i) {
    ord[i] = internalizeString((i + 1) + "th");
}
ord[0] = "1st";
ord[1] = "2nd";
ord[2] = "3rd";
ord[20] = "21st";
ord[21] = "22nd";
ord[22] = "23rd";
ord[30] = "31st";

module.exports = Runtime;
