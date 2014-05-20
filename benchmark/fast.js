var strftime = require("../src/strftime.js");
var date = new Date();
console.log(strftime('%F %r %z', date));
var ops = 1e5;
var l = ops;
while(l--)strftime('%F %r %z', date)

var now = Date.now();
var ops = 1e6;
var l = ops;
while(l--)strftime('%F %r %z', date)
console.log(

    (((ops / (Date.now() - now)) * 1000)|0) + " op/s"

    );
