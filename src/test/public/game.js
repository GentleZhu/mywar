var players = [];
var socket = io.connect('http://localhost:8080');
var UiPlayers = document.getElementById("players");

//require(objectFiles, function () {
	function setUp () {
	    socket.on('count', function (data) {
	     	UiPlayers.innerHTML = 'Players: ' + data['playerCount'];
	    });
	 
		socket.on('connected', function (data) {
			console.log('connected');
		});
	}
setUp();
//这里传地图编号
	/*Q.scene('arena', function (stage) {
		stage.collisionLayer(new Q.TileLayer({ dataAsset: '/maps/arena.json', sheet: 'tiles' }));
		setUp(stage);
	});*/
//});