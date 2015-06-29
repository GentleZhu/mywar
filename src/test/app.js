var express=require('express')
,hash = require('./pass').hash;
var app=express();
var server=require('http').Server(app);
var io=require('socket.io')(server);
var bodyParser = require('body-parser');
var cookieParser=require('cookie-parser');
var session = require('express-session');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var DB=mongoose.connect('mongodb://localhost:27017/mywar');
var con = DB.connection;
con.on('error', console.error.bind(console, 'connection error:'));
con.once('open', function (callback) {
	console.log('open');
});

var accountSchema = mongoose.Schema({
    username: String,
    password: String
})

/*var recordSchema = mongoose.Schema({
	starttime:
	endtime:
	player1ID: String,
	player2ID: String,
	winner: String
});*/

/*var account = mongoose.model('account', { username: String, password: String });

var Bran = new account({ username: 'Bran', password: '123zhuqi' });
Bran.save(function (err) {
  if (err) // ...
  console.log('err');
});*/

//var account = mongoose.model('account', accountSchema);
//var Bran=new account({username:'Bran',password:'123zhuqi'});
//console.log(Bran.username);
app.use(express.static(__dirname+'/public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser('shhhh, very secret'))
app.use(session({secret: 'keyboard cat'}))

app.use(function(req,res,next){
	var err=req.session.error,
	msg=req.session.success;
	delete req.session.error;
	delete req.session.success;
	res.locals.message='';
	if (err) res.locals.message='<p class="msg error">'+err+'</p>';
	if (msg) res.locals.message='<p class="msg success">'+msg+'</p>';
	next();
	//console.log('here\n');
});
var accountModel = DB.model("account",accountSchema);
/*
var accountEntity=new accountModel({
	username:'Bran',
	password:'123zhuqi'
});
console.log(accountEntity);
accountEntity.save(function(err){
	console.log(err);
});*/
/*accountModel.find({username:'Bran'}, function(err,docs){
		console.log(docs);
});*/
function authenticate(name,pass,fn){
	if (!module.parent) console.log('authenticating %s:%s',name,pass);
	//var user=users[name];
	accountModel.find({username:name}, function(err,docs){
		if (docs){
			if (docs[0].password==pass)
				return fn(null,name);
			else
				return fn(new Error('invalid password'));
		}
		else{
			return fn(new Error('Cannot find user'));
		}
	});
	//if (!user) return fn(new Error('Cannot find user'));
	/*hash(pass, user.salt, function(err, hash){
	if (err) return fn(err);
	if (hash.toString() == user.hash) return fn(null, user);
	fn(new Error('invalid password'));
	})*/
}
//middleware
function restrict(req,res,next){
	if (req.session.user){
		next();
	} else {
		req.session.error='Access denied!';
		console.log(req.session.error);
		req.redirect('/login');
	}
}

app.post('/login', function(req, res){
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
    	//console.log('here\n');
    	req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('/game.html');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
 
     res.redirect('/');
    }
  });
})

app.get('/',function(req,res){
	res.render('/index.html');
});

app.get('/game',restrict,function(req,res){
	res.render('game');
});

app.get('/logout',function(req,res){
	req.session.destroy(function(){
		res.redirect('/');
	});
});

/*app.get('/game', function(req,res){
	res.render('game.html');
});*/

var playerCount=0;
var id=0;

var gameDB={
	'match':[
	],
	'mismatch':0

};
var gameCount=0;

io.on('connection',function(socket){
	playerCount++;
	id++;
	console.log(playerCount);
	setTimeout(function(){
		io.emit('count',{playerCount:playerCount});
		if (playerCount%2==1){
			gameDB.match[gameCount]={'player1ID':id,'player2ID':null};
			socket.emit('waiting',{'yourID':id,'status':'waiting'});
		}
		else{
			var componentID=gameDB.match[gameCount].player1ID;
			gameDB.match[gameCount].player2ID=id;
			//socket.emit('ready',{'yourID':id,'componentID':componentID,'status':'ready'});
			io.emit('matched',{player1ID:componentID,player2ID:id});
			gameCount++;
		}
		console.log(gameDB);
	},1500);


	socket.on('disconnect',function(){
		socket.broadcast.emit
		/*if (playerCount%2==1){
			if (!mismatch)
				//do nothing
			else{
				console.log(gameDB.match['gameCount'])
			}
		}
		else{

		} */
		playerCount--;
		io.emit('count',{playerCount:playerCount});
	});
	socket.on('update', function (data) {
  		socket.broadcast.emit('updated', data);
	});
});

setInterval(function(){
		io.emit('addMoney',{'money':100});
},1000);
console.log("Multiplayer app listening on port 8080");
server.listen(8080);
