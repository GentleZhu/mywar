var express=require('express')
,hash = require('./pass').hash;
var app=express();
var server=require('http').Server(app);
var io=require('socket.io')(server);
var bodyParser = require('body-parser');
var cookieParser=require('cookie-parser');
var session = require('express-session');
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

var users={
	tj:{name: 'tj'}
};

hash('foobar',function(err,salt,hash){
	if (err) throw err;
	users.tj.salt=salt;
	users.tj.hash=hash.toString();
});

function authenticate(name,pass,fn){
  if (!module.parent) console.log('authenticating %s:%s',name,pass);
  var user=users[name];
  if (!user) return fn(new Error('Cannot find user'));
  hash(pass, user.salt, function(err, hash){
    if (err) return fn(err);
    if (hash.toString() == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  })
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
	res.render('/game.html');
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

io.on('connection',function(socket){
	playerCount++;
	id++;	
	console.log("connected");
	setTimeout(function(){
		socket.emit('connected',{playerID:id});
		io.emit('count',{playerCount:playerCount});
	},1500);
	socket.on('disconnect',function(){
		playerCount--;
		io.emit('count',{playerCount:playerCount})
	});
});


console.log("Multiplayer app listening on port 8080");
server.listen(8080);
