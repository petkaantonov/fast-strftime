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
var defaultLocale = require("./locales/en_US.js");
var cpDefaultLocale = JSON.parse(JSON.stringify(defaultLocale));
var Runtime = require("./runtime.js");
var parse = require("./parse.js");
var compiledFormatters = {};
var defaultOptions = {
    utc: false,
    timezone: void 0
};
var defaultFormats = defaultLocale.formats;
Runtime.prototype.strftime = strftime;
var runtime = new Runtime();

function dateToUtc(d) {
    var msDelta = (d.getTimezoneOffset() || 0) * 60000;
    return new Date(d.getTime() + msDelta);
}

function parse2Digit(ch1, ch2) {
    return (ch1 - 48) * 10 + (ch2 - 48);
}

function toFastProperties(o) {
    function f() {}
    f.prototype = o;
    return o;
}

function read(obj, fmt) {
    return obj[fmt];
    try {} finally {}
}

function write(obj, fmt, value) {
    obj[fmt] = value;
    return;
    try {} finally {}
}

function getCompiledFormatter(fmt) {
    if (typeof fmt !== "string") fmt = '' + fmt;
    var compiled = compiledFormatters;
    var ret = read(compiled, fmt);
    if (ret !== void 0) return ret;
    ret = parse(fmt);
    write(compiled, fmt, ret);
    toFastProperties(compiled);
    return ret;
}

function strftime(fmt, d, locale, options) {
    // Optimize common case
    if ((locale === void 0 || locale === defaultLocale) &&
        (d === void 0 || d instanceof Date)) {
        var fn = getCompiledFormatter(fmt);
        if (d === void 0) d = new Date();
        return fn.call(runtime, d, false, -1800, defaultLocale, defaultFormats, d.getTime());

    }
    options = options === void 0 ? defaultOptions : options;

    if (d !== void 0 && !(d instanceof Date)) {
        locale = d;
        d = void 0;
    }

    d = d === void 0 ? new Date() : d;
    locale = locale === void 0 ? defaultLocale : locale;
    var formats = locale.formats === void 0 ? defaultFormats : locale.formats;

    var tz = options.timezone;
    var timestamp = d.getTime();
    if (options.utc || typeof tz === "number" || typeof tz === "string") {
        d = dateToUtc(d);
    }

    if (tz !== void 0) {
        if (typeof tz === "string") {
            var sign = tz.charCodeAt(0) === 45 /*-*/ ? -1 : 1;
            var hours = parse2Digit(tz.charCodeAt(1), tz.charCodeAt(2));
            var mins = parse2Digit(tz.charCodeAt(3), tz.charCodeAt(4));
            tz = sign * (60 * hours) + mins;
        }
        d = new Date(d.getTime() + (tz * 60000));
    }
    else {
        tz = -1800;
    }

    var fn = getCompiledFormatter(fmt);
    return fn.call(runtime, d, options.utc, tz, locale, formats, timestamp);
}

strftime.strftimeTZ = function(fmt, d, locale, timezone) {
    if ((typeof locale == 'number' || typeof locale == 'string') && timezone == null) {
      timezone = locale;
      locale = void 0;
    }
    if (locale === void 0) locale = cpDefaultLocale;
    return strftime(fmt, d, locale, { timezone: timezone });
};

strftime.strftimeUTC = function (fmt, d, locale) {
    if (locale === void 0) locale = cpDefaultLocale;
    return strftime(fmt, d, locale, { utc: true });
};

strftime.localizedStrftime = function(locale) {
    return function(fmt, d, options) {
        return strftime(fmt, d, locale, options);
    };
};

strftime.strftime = strftime;

module.exports = strftime;
