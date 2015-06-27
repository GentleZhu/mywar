var Type=0;	
	
  		window.addEventListener('load',function(e) {
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
					});
					this.on("hit",this,"collision");
					//var t=setTimeout("hit",this.p.t);	
					switch(Type){
						case 0: this.p.color="blue";break;
						case 1: this.p.color="green";break;
						case 2: this.p.color="grey";break;
						case 3: this.p.color="yellow";break;	
					}
					this.p.t=Type;
					//this.p.collisionMask=Q.SPRITE_FRIENDLY;
				},
				collision: function(col) {
					this.p.hit_count++;
					if (this.p.hit_count>50){
						console.log("hit");
						this.p.hit_count%=50;
					}
				}
			});        
			Q.Sprite.extend("Square",{
				init: function(p) {
					this._super(p,{
						color: "red",
						w: 50,
						h: 50,
						//collisionMask: 2,
						T: null
					});
					this.on("touchEnd");
				},

				touchEnd: function(touch) {
					this.p.T=new Q.Tower({x:this.p.x,y:this.p.y});
					Q.stage().insert(this.p.T);
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
						color: "blue",
						w: 50,
						h: 50,
						vx: 0,
						vy: 0,
						direct: 0,
						n_vx: 40,
						n_vy: 40
					});
					this.on("hit",this,"collision");
					//this.p.collisionMask=4;
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

			//var Player1=new Q.Player();
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
					stage.insert(new Q.Soldier({x:30,y:275}));
				}));
			 	//stage.insert(new Q.Soldier({x:30,y:275}));
			 	//stage.insert(new Q.Soldier({x:100,y:275}));
			 	//stage.insert(new Q.Soldier({x:170,y:275}));
				/*for (var i = 0; i < 3; i++) {
					var t=setTimeout(create,1000);
					console.log("Plus 1");
				};*/
				
				//stage.insert(new Q.Soldier({x:-100,y:275}));
			});
			Q.stageScene("level1");
		  	Q.debug = true;
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
	Type=x;
	console.log(Type);
}
			