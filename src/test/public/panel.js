var towerType=0;	
var soldierType=0;
var socket = io.connect('http://localhost:8080');
var UiPlayers = document.getElementById("players");
var Moneycontrol = document.getElementById("money");
var process=document.getElementById("success");
var playerID=null;
var rivalID=null;
var gameCount=null;
var money=0,success=0;
  		window.addEventListener('load',function(e) {
			function setUp (stage) {
				socket.on('count', function (data) {
					console.log("every one receive!");
				});
				socket.on('addMoney', function (data) {
					money+=data['money'];
					Moneycontrol.innerHTML=money;
				});

				socket.on('waiting', function (data) {
				playerID=data['yourID'];
				UiPlayers.innerHTML = 'You are players: ' + data['yourID']+'waiting for rivals';

				});
				socket.on('matched', function (data) {
				console.log('matched');
				player1ID=data['player1ID'];
				player2ID=data['player2ID'];
				if (!playerID){
					//original player2
					rivalID=player1ID;
					playerID=player2ID;
					UiPlayers.innerHTML = 'You are players: ' + playerID+'play against'+rivalID;
				}
				else if (player1ID==playerID){
					rivalID=player2ID;
					UiPlayers.innerHTML = 'You are players: ' + playerID+'play against'+rivalID;
				}
				//console.log('connected:'+data['playerID']);
				
				});
				socket.on('updated', function (data) {
					console.log(data['playerID']);
					if (data['playerID']==playerID){
						console.log('update');
						switch(data['type']){
							case 0:stage.insert(new Q.Soldier({x:data['x'],y:data['y'],belong:data['belong']}));break;
							case 1:stage.insert(new Q.Tower({x:data['x'],y:data['y'],belong:data['belong']}));break;
						}
					}
				});
			}
			var Q = Quintus()
			        .include("Sprites, Scenes, Input, 2D, Touch, UI");
			Q.setup("myGame")
			        .controls().touch(Q.SPRITE_ALL)
			Q.Sprite.extend("Tower",{
				init: function(p){
					this._super(p,{
						//shape: 'circle',
						//r: 60
						w: 70,
						h: 70,
						//collisionMask: 0,
						t: 100,
						hit_count: 0,
						old_attack:null,
						belong:null
					});
					this.on("hit",this,"collision");
					//var t=setTimeout("hit",this.p.t);	
					switch(towerType){
						case 0: this.p.color="blue";break;
						case 1: this.p.color="green";break;
						case 2: this.p.color="grey";break;
						case 3: this.p.color="yellow";break;	
					}
					this.p.t=towerType;
					//this.p.collisionMask=Q.SPRITE_FRIENDLY;
				},
				collision: function(col) {
					if (col.obj.p.belong!=this.p.belong){
						if (this.p.old_attack!=col.obj)
							this.p.old_attack=col.obj;
						else
							this.p.hit_count++;
						if (this.p.hit_count>10)
							col.obj.p.color="blue";
						if (this.p.hit_count>100){
							console.log("hit");
							this.p.hit_count%=100;
							if(col.obj.isA("Soldier")){
								col.obj.p.life--;
								col.obj.p.color="red";
							}
						}
					}
				}
			});        
			Q.Sprite.extend("Square",{
				init: function(p) {
					this._super(p,{
						color: "red",
						w: 50,
						h: 50
						//collisionMask: 2,
					});
					this.on("touchEnd");
				},

				touchEnd: function(touch) {
					//this.p.T=new Q.Tower({x:this.p.x,y:this.p.y});
					//Q.stage().insert(this.p.T);
					Q.stage().insert(new Q.Tower({x:this.p.x,y:this.p.y,belong:playerID}));
					socket.emit('update', { 'playerID': rivalID,'type':1,'x':this.p.x,'y':this.p.y,'belong':playerID});
				},

				step: function(dt) {
       				if(this.p.over) {
         				this.p.scale = 1.2;
       				} else {
         			this.p.scale = 1.;
       				}
       			}
			});
			Q.Sprite.extend("Soldier",{
				init: function(p){
					this._super(p,{
						w: 50,
						h: 50,
						vx: 0,
						vy: 0,
						direct: 0,
						n_vx: 60,
						n_vy: 60,
						life:5,
						belong:null
					});
					this.on("hit",this,"collision");
					//this.p.collisionMask=4;
					switch(soldierType){
						case 0: this.p.color="blue";break;
						case 1: this.p.color="green";break;
						case 2: this.p.color="grey";break;
						case 3: this.p.color="yellow";break;
					}
					switch(this.p.direct){
						case 0:this.p.vx=this.p.n_vx;this.p.vy=0;break;
						case 1:this.p.vx=0;this.p.vy=this.p.n_vy;break;
						case 2:this.p.vx=-this.p.n_vx;this.p.vy=0;break;
						case 3:this.p.vx=0;this.p.vy=this.p.n_vy;break;
					}
				},
				collision: function(col) {
				    // .. do anything custom you need to do ..
				
				    // Move the sprite away from the collision
				    if (this.p.life==0)
				    	this.destroy();
					if(col.obj.isA("Square")){
						var p=this.p;
						p.x -= col.separate[0];
						p.y -= col.separate[1];
						if (col.separate[0]){
							var obj=this.stage.locate(p.x,p.y+p.h/2);
							if (obj.isA("Square")){
								p.direct=3;
							}
							else
								p.direct=1;
						}
						else if (col.separate[1]){
							var obj=this.stage.locate(p.x+p.w/2,p.y);
							if (obj.isA("Square")){
								p.direct=2;
							}
							else
								p.direct=0;
						}
						//console.log(col.separate[0]);
						//console.log(col.separate[0]);
						//this.p.vx = -this.p.vx;
						switch(p.direct){
							case 0:p.vx=p.n_vx;p.vy=0;break;
							case 1:p.vx=0;p.vy=p.n_vy;break;
							case 2:p.vx=-p.n_vx;p.vy=0;break;
							case 3:p.vx=0;p.vy=-p.n_vy;break;
						}
					}
				},
				step: function(dt) {
					if (this.p.x<25||this.p.x>600||this.p.y<25||this.p.y>600){
						this.destroy();
						success+=1;
						if (success>1){
							Q.clearStages();
							money=0;
							success=0;
							if (confirm('You win the game, a new game?')){
								startGame();
							}
							else{
								window.close();			}
							}
						process.innerHTML=success;
					}
       				this.p.x+=this.p.vx*dt;
					this.p.y+=this.p.vy*dt;
					this.stage.collide(this);
       			},
				draw: function(ctx){
					ctx.fillStyle = this.p.color;
					// Draw a filled rectangle centered at
					// 0,0 (i.e. from -w/2,-h2 to w/2, h/2)
					ctx.fillRect(-this.p.cx+5,-this.p.cy+5,this.p.w-10,this.p.h-10);
				}
			})
			
			//start game
			//var Player1=new Q.Player();
			function startGame(){
				Q.scene("level1",function(stage) {
				  	var player = new Array()
				  	for (var k=0;k<10;k++){
				  		player[k]=new Array();
				  		for (var j=0;j<10;j++){
				  			if (j==5&&k<9||(k==8&&j<5))
				  				continue;
				  			var c_x=50*k+25;
				  			var c_y=50*j+25+40;
				  			player[k][j]=stage.insert(new Q.Square({x:c_x,y:c_y}))
				  		}	
				 	}
				 	stage.insert(new Q.UI.Button({
					label: "A Button",
					y: 20,
					x: 30,
					w:20,
					h:10
					}, function() {
					//if (this.p.label == "Pressed";
						console.log("Pressed");
						stage.insert(new Q.Soldier({x:30,y:275,belong:playerID}));
						socket.emit('update', { 'playerID': rivalID,'type':0,'x':30,'y':275,'belong':playerID});
					}));
				 	//stage.insert(new Q.Soldier({x:30,y:275}));
				 	//stage.insert(new Q.Soldier({x:100,y:275}));
				 	//stage.insert(new Q.Soldier({x:170,y:275}));
					/*for (var i = 0; i < 3; i++) {
						var t=setTimeout(create,1000);
						console.log("Plus 1");
					};*/
					
					//stage.insert(new Q.Soldier({x:-100,y:275}));
					setUp(stage);
				});
				Q.stageScene("level1");
			  	Q.debug = true;
			}
			startGame();
		  	//Q.debugFill = true;
			var currentObj = null;
		  	Q.el.addEventListener('mousemove',function(e) {
		    var x = e.offsetX || e.layerX,
		        y = e.offsetY || e.layerY,
		        stage = Q.stage();

    		// Use the helper methods from the Input Module on Q to
    		// translate from canvas to stage
		    var stageX = Q.canvasToStageX(x, stage),
		        stageY = Q.canvasToStageY(y, stage);

		    // Find the first object at that position on the stage
		    var obj = stage.locate(stageX,stageY);
		    
		    // Set a `hit` property so the step method for the 
		    // sprite can handle scale appropriately
		    if(currentObj) { 
		    	currentObj.p.over = false; 
		    }
		    if(obj) {
		    	currentObj = obj;
		    	obj.p.over = true;
		    }
		  	});
		});
function getType(x){
	towerType=x;
	console.log(towerType);
}
function getSType(x){
	soldierType=x;
	console.log(soldierType);
}
			