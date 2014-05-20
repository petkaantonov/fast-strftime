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
function compileComponents(components) {
    var componentStr = "";
    for (var i = 0; i < components.length - 1; ++i) {
        componentStr += "(" + components[i] + ") +\n";
    }
    if (components.length > 0) {
        componentStr += "(" + components[i] + ");"
    }
    var body = "var $tmp;\n\
        return '' + " + componentStr;

    return new Function("d", "utc", "tz", "locale", "formats", "timestamp", body);
}

function parse(fmtString) {
    var len = fmtString.length;
    var components = [];
    var curStr = "";
    for(var i = 0; i < len; ++i) {
        var ch = fmtString.charCodeAt(i);
        var padding = 0;
        if (ch === 37 /*%*/) {
            if (++i >= len) {
                curStr += "%";
                break;
            }
            ch = fmtString.charCodeAt(i);
            var formatter = null;
            if (ch === 45 /*-*/) {
                if (++i >= len) {
                    curStr += "%-";
                    break;
                }
                padding = -1;
                formatter = getFormatter((ch = fmtString.charCodeAt(i)));
                if (formatter === null) {
                    curStr += ("%-" + String.fromCharCode(ch));
                    continue;
                }
            } else if (ch === 95 /*_*/) {
                if (++i >= len) {
                    curStr += "%_";
                    break;
                }
                padding = 1;
                formatter = getFormatter((ch = fmtString.charCodeAt(i)));
                if (formatter === null) {
                    curStr += ("%_" + String.fromCharCode(ch));
                    continue;
                }
            } else if (ch !== 48 /*0*/) {
                formatter = getFormatter(ch);
                if (formatter === null) {
                    curStr += ("%" + ch === 37 ? '' : String.fromCharCode(ch));
                    continue;
                }
            } else {
                if (++i >= len) {
                    curStr += "%0";
                    break;
                }
                padding = 2;
                formatter = getFormatter((ch = fmtString.charCodeAt(i)));
                if (formatter === null) {
                    curStr += ("%0" + String.fromCharCode(ch));
                    continue;
                }
            }

            if (curStr.length > 0) {
                components.push(new StringFormatter(curStr));
            }
            components.push(new formatter(ch, padding));
            curStr = "";


        } else if (ch === 39/*'*/ || ch === 92/*\*/) {
            curStr += "\\" + String.fromCharCode(ch)
        } else {
            curStr += String.fromCharCode(ch);
        }
    }
    if (curStr.length > 0) {
        components.push(new StringFormatter(curStr));
    }
    return compileComponents(components);
}

function getFormatter(ch) {
    if (ch > 127) return null;
    return formatters[ch];
}

var formatters = new Array(128);
for (var i = 0; i < formatters.length; ++i) {
    formatters[i] = null;
}

formatters['A'.charCodeAt(0)] =
formatters['a'.charCodeAt(0)] =
formatters['B'.charCodeAt(0)] =
formatters['b'.charCodeAt(0)] =
formatters['C'.charCodeAt(0)] =
formatters['D'.charCodeAt(0)] =
formatters['d'.charCodeAt(0)] =
formatters['e'.charCodeAt(0)] =
formatters['F'.charCodeAt(0)] =
formatters['H'.charCodeAt(0)] =
formatters['h'.charCodeAt(0)] =
formatters['I'.charCodeAt(0)] =
formatters['j'.charCodeAt(0)] =
formatters['k'.charCodeAt(0)] =
formatters['L'.charCodeAt(0)] =
formatters['l'.charCodeAt(0)] =
formatters['M'.charCodeAt(0)] =
formatters['m'.charCodeAt(0)] =
formatters['n'.charCodeAt(0)] =
formatters['o'.charCodeAt(0)] =
formatters['P'.charCodeAt(0)] =
formatters['p'.charCodeAt(0)] =
formatters['R'.charCodeAt(0)] =
formatters['r'.charCodeAt(0)] =
formatters['S'.charCodeAt(0)] =
formatters['s'.charCodeAt(0)] =
formatters['T'.charCodeAt(0)] =
formatters['t'.charCodeAt(0)] =
formatters['U'.charCodeAt(0)] =
formatters['u'.charCodeAt(0)] =
formatters['v'.charCodeAt(0)] =
formatters['W'.charCodeAt(0)] =
formatters['w'.charCodeAt(0)] =
formatters['Y'.charCodeAt(0)] =
formatters['y'.charCodeAt(0)] =
formatters['Z'.charCodeAt(0)] =
formatters['z'.charCodeAt(0)] = DateFormatter;

function StringFormatter(string) {
    this.string = string;
}

StringFormatter.prototype.toString = function() {
    return "'" + this.string + "'";
};

function DateFormatter(flag, paddingCh) {
    this.flag = flag;
    this.paddingCh = paddingCh;
}

DateFormatter.prototype.toString = function() {
    var p = this.paddingCh;
    var month = "this.pad(d.getMonth() + 1, "+p+", 2)";
    var day = "this.pad(d.getDate(), "+p+", 2)";
    var dayUnpadded = "d.getDate()";
    var year = "('' + (d.getFullYear() % 100|0))";
    var fullYear = "d.getFullYear()";
    var timestamp = "d.getTime()";

    var hour24 = "this.pad(d.getHours(), "+p+", 2)";
    var hour12 = "this.pad(this.to12(d.getHours()), "+p+", 2)";
    var minutes = "this.pad(d.getMinutes(), "+p+", 2)";
    var seconds = "this.pad(d.getSeconds(), "+p+", 2)";

    var amPm = "(d.getHours() < 12 ? locale.AM : locale.PM)";
    var shortMonth = "locale.shortMonths[d.getMonth()]";

    switch(this.flag) {
        case 65:
            return "locale.days[d.getDay()]";
            break;
        case 97:
            return "locale.shortDays[d.getDay()]";
            break;
        case 66:
            return "locale.months[d.getMonth()]";
            break;
        case 98:
            return shortMonth;
            break;
        case 67:
            return "this.pad(d.getFullYear() / 100 | 0, " + p + ", 2)";
            break;
        case 68:
            return "(($tmp = formats.D) !== void 0\n\
                    ? this.strftime($tmp, d, locale)\n\
                    : "+month+"+'/'+"+day+"+'/'+"+ year + ")";
            break;
        case 100:
            return day;
            break;
        case 101:
            return dayUnpadded;
            break;
        case 70:
            return "(($tmp = formats.F) !== void 0\n\
                    ? this.strftime($tmp, d, locale)\n\
                    : "+fullYear+"+'-'+"+month+"+'-'+" + day+ ")";
            break;
        case 72:
            return hour24;
            break;
        case 104:
            return "locale.shortMonths[d.getMonth()]";
            break;
        case 73:
            return hour12;
            break;
        case 106:
            return "(($tmp = new Date(d.getFullYear(), 0, 1)),                     \n\
                    ($tmp = Math.ceil((d.getTime() - $tmp.getTime()) / 86400000)), \n\
                    (this.pad($tmp, 0, 3)))";
            break;
        case 107:
            return p === 0
                        ? "this.pad(d.getHours(), 1, 2)"
                        : "this.pad(d.getHours(), "+p+", 2)";
            break;
        case 76:
            return "this.pad(timestamp % 1000|0, 0, 3)";
            break;
        case 108:
            return p === 0
                        ? "this.pad(this.to12(d.getHours()), 1, 2)"
                        : "this.pad(this.to12(d.getHours()), "+p+", 2)";
            break;
        case 77:
            return minutes;
            break;
        case 109:
            return month;
            break;
        case 110:
            return "'\\n'";
            break;
        case 111:
            return "this.ord[d.getDate() - 1]";
            break;
        case 80:
            return "(d.getHours() < 12 ? locale.am : locale.pm)";
            break;
        case 112:
            return amPm;
            break;
        case 82:
            return "(($tmp = formats.R) !== void 0\n\
                    ? this.strftime($tmp, d, locale)\n\
                    : "+hour24+"+':'+"+minutes +")";
            break;
        case 114:
            return "(($tmp = formats.r) !== void 0\n\
                    ? this.strftime($tmp, d, locale)\n\
                    : "+hour12+"+':'+"+minutes+"+':'+"+seconds+"+' '+"+amPm+")";
            break;
        case 83:
            return seconds;
            break;
        case 115:
            return "timestamp/1000|0";
            break;
        case 84:
            return "(($tmp = formats.T) !== void 0\n\
                    ? this.strftime($tmp, d, locale)\n\
                    : "+hour24+"+':'+"+minutes+"+':'+"+seconds+")";
            break;
        case 116:
            return "'\\t'";
            break;
        case 85:
            return "this.pad(this.weekNumber(d, 'sunday'), "+p+", 2)";
            break;
        case 117:
            return "($tmp = d.getDay(), $tmp == 0 ? '7' : '' + $tmp)";
            break;
        case 118:
            return "(($tmp = formats.v) !== void 0\n\
                    ? this.strftime($tmp, d, locale)\n\
                    : "+dayUnpadded+"+'-'+"+shortMonth+"+'-'+" + fullYear+ ")";
            break;
        case 87:
            return "this.pad(this.weekNumber(d, 'monday'), "+p+", 2)";
            break;
        case 119:
            return "d.getDay()";
            break;
        case 89:
            return fullYear;
            break;
        case 121:
            return year;
            break;
        case 90:
            // TODO use faster method
            return "(utc ? 'GMT' : \n\
                    ($tmp = d.toString().match(/\((\w+)\)/),\n\
                        $tmp && $tmp[1] || ''))";
            break;
        case 122:
            return "(utc\n\
                ? '+0000'\n\
                : this.formatTz(tz === -1800 ? -d.getTimezoneOffset() : tz))";
            break;
    }
};
module.exports = parse;
