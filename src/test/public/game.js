var players = [];
var socket = io.connect('http://localhost:8080');
var UiPlayers = document.getElementById("players");

//require(objectFiles, function () {
	function setUp () {
	    socket.on('count', function (data) {
	     	
	     	console.log('everyone will receive');
	     });
	 
		socket.on('waiting', function (data) {
			UiPlayers.innerHTML = 'You are players: ' + data['yourID']+'waiting for rivals';

		});
		socket.on('ready', function (data) {
			console.log('connected:'+data['playerID']);
			UiPlayers.innerHTML = 'You are players: ' + data['yourID']+'play against'+data['componentID'];
		});
	}
setUp();
//这里传地图编号
	/*Q.scene('arena', function (stage) {
		stage.collisionLayer(new Q.TileLayer({ dataAsset: '/maps/arena.json', sheet: 'tiles' }));
		setUp(stage);
	});*/
//});