var express=require('express');
var app=express();
var server=require('http').Server(app);
var io=require('socket.io')(server);

app.use(express.static(__dirname+'/public'));
app.get('/', function(req,res){
	res.render('game.html');
});
console.log("Multiplayer app listening on port 8080");
server.listen(8080);
