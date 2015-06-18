<html>
  	<head>
    <!-- Pull the engine from the Quintus CDN or load it locally -->
    <!-- (use quintus-all.min.js for production) -->
    <script src='./lib/quintus-all.js'></script>
  	</head>
  	<body>
  		<script>
			var Q = Quintus()
			        .include("Sprites, Scenes, Input, 2D, Touch, UI")
			        .setup({ maximize: true })
			        .controls().touch()
			        
			Q.Sprite.extend("Player",{
				init: function(p) {
					this._super(p,{
						x: 5,
						y: 1
					});
				}
			})
			var Player1=new Q.Player();
			console.log(Player1.x);
			console.log(Player1.y);
		</script>
	</body>
</html>