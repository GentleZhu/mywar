//console.log(process.argv)
var fs = require('fs');
fs.readFile('./test.in',function callback (err,buf){
	console.log(buf.toString());	
});
fs.readdir('./',function callback(err,list){
	console.log(list);
}
);
//console.log(list);
