var modelo=require("./modelo.js");

describe("El juego del impostor", function() {
  var juego;
  var nick;

  beforeEach(function() {
  	juego=new modelo.Juego();
  	nick="Zete";
  });

  it("comprobar valores iniciales del juego", function() {
  	expect(Object.keys(juego.partidas).length).toEqual(0);
  	expect(nick).toEqual("Zete");
  });

  it("comprobar valores de la partida",function(){
  	var codigo=juego.crearPartida(3,nick);
  	expect(codigo).toEqual("fallo");
  	codigo=juego.crearPartida(11,nick);
  	expect(codigo).toEqual("fallo");
  })

  describe("el usr Zete crea una partida de 4 jugadores",function(){
	var codigo;
	beforeEach(function() {
	  	codigo=juego.crearPartida(4,nick);
	});
	it("se comprueba la partida",function(){ 	
	  	expect(codigo).not.toBe(undefined);
	  	expect(juego.partidas[codigo].nickOwner).toEqual(nick);
	  	expect(juego.partidas[codigo].maximo).toEqual(4);
	  	expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
	 	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(1);
	});

	it("no se puede crear partida si el num no está entre 4 y 10",function(){
		var codigo=juego.crearPartida(3,nick);
		expect(codigo).toEqual("fallo");
		codigo=juego.crearPartida(11,nick);
		expect(codigo).toEqual("fallo");
	});
	it("varios usuarios se unen a la partida",function(){
		juego.unirAPartida(codigo,"Ruso");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"Felipe");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"Wence");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
	  });

	it("Zete inicia la partida",function(){
		juego.unirAPartida(codigo,"Ruso");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"Felipe");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"Wence");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");		
		juego.iniciarPartida(nick,codigo);
		expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
	});
	it("abandonar partida",function(){
		juego.unirAPartida(codigo,"Ruso");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"Felipe");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"Wence");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");		
		//usr.iniciarPartida();
		//expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");		
		var partida=juego.partidas[codigo];
		partida.usuarios["Wence"].abandonarPartida();
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		partida.usuarios["Felipe"].abandonarPartida();
		partida.usuarios["Ruso"].abandonarPartida();
		partida.usuarios[nick].abandonarPartida();
		expect(partida.numeroJugadores()).toEqual(0);
		//juego.eliminarPartida(codigo);
		expect(juego.partidas[codigo]).toBe(undefined)
	});
   
	describe("las votaciones",function(){
		beforeEach(function() {
			juego.unirAPartida(codigo,"Ruso");
			juego.unirAPartida(codigo,"Felipe");
			juego.unirAPartida(codigo,"Wence");
			juego.iniciarPartida(nick,codigo);
		});

		it("comprobar encargos e impostor",function(){
			var partida=juego.partidas[codigo];
			juego.iniciarPartida(nick,codigo);
			var numImpostores = 0;
			var numVidentes = 0;
			var numProfesiones = 0;
			for(var key in partida.usuarios){
				if(partida.usuarios[key].impostor){
					numImpostores = numImpostores + 1;
				}
				if(partida.usuarios[key].encargo=="Vidente"){
					numVidentes = numVidentes + 1;
				}
				if(partida.usuarios[key].encargo!="Vidente"&&partida.usuarios[key].encargo!="ninguno"){
					numProfesiones = numProfesiones + 1;
				}
			}
			var num=Object.keys(juego.partidas[codigo].usuarios).length;
			expect(numImpostores).toEqual(1);
			expect(numVidentes).toEqual(1);
			expect(numProfesiones).toEqual(num-2);
		});

		it("abandonar el impostor",function(){		
			var partida=juego.partidas[codigo];
			juego.iniciarPartida(nick,codigo);
			partida.usuarios[nick].impostor=true;
			partida.usuarios["Ruso"].impostor=false;
			partida.usuarios["Felipe"].impostor=false;
			partida.usuarios["Wence"].impostor=false;
			partida.usuarios[nick].abandonarPartida();
			expect(partida.fase.nombre).toEqual("final");
		});
		it("abandonar los ciudadanos",function(){		
			var partida=juego.partidas[codigo];
			juego.iniciarPartida(nick,codigo);
			partida.usuarios[nick].impostor=true;
			partida.usuarios["Ruso"].impostor=false;
			partida.usuarios["Felipe"].impostor=false;
			partida.usuarios["Wence"].impostor=false;
			partida.usuarios["Wence"].abandonarPartida();
			partida.usuarios["Felipe"].abandonarPartida();
			partida.usuarios["Ruso"].abandonarPartida();
			expect(partida.fase.nombre).toEqual("final");
		});

		it("todos skipean",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Ruso",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Felipe",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Wence",codigo);
			expect(partida.fase.nombre).toEqual("jugando");
		});

		it("se vota y mata a un inocente",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			
			partida.usuarios[nick].impostor=true;
			partida.usuarios["Ruso"].impostor=false;
			partida.usuarios["Felipe"].impostor=false;
			partida.usuarios["Wence"].impostor=false;

			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar(nick,codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Ruso",codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Felipe",codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Wence",codigo,"Felipe");
			expect(partida.usuarios["Wence"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("jugando");
		});

		it("se vota y mata al impostor, la partida termina",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			
			partida.usuarios[nick].impostor=true;
			partida.usuarios["Ruso"].impostor=false;
			partida.usuarios["Felipe"].impostor=false;
			partida.usuarios["Wence"].impostor=false;

			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar(nick,codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Ruso",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Felipe",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Wence",codigo,nick);
			expect(partida.usuarios[nick].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("final");
		});

		it("impostor ataca a todos y gana",function(){
			//atacar y comprobar
			var partida=juego.partidas[codigo];
			
			partida.usuarios[nick].impostor=true;
			partida.usuarios["Ruso"].impostor=false;
			partida.usuarios["Felipe"].impostor=false;
			partida.usuarios["Wence"].impostor=false;

			juego.atacar(nick,codigo,"Ruso");
			expect(partida.usuarios["Ruso"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("jugando");
			juego.atacar(nick,codigo,"Felipe");
			expect(partida.usuarios["Felipe"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("final");
		});

		it("realizar tareas",function(){
			var partida=juego.partidas[codigo];
			for(var key in partida.usuarios){
				if(!partida.usuarios[key].impostor){
					expect(partida.obtenerPercentTarea(key)).toEqual(0);
				}
			}
			expect(partida.obtenerPercentGlobal()).toEqual(0);
			var num=Object.keys(juego.partidas[codigo].usuarios).length;
			for(var i=0;i<2;i++){
				for(var key in partida.usuarios){
					partida.usuarios[key].realizarTarea();
					if(!partida.usuarios[key].impostor){
						expect(partida.obtenerPercentTarea(key)).toEqual((Math.round(((i+1)*100/3)*100))/100);
					}
				}
				expect(partida.fase.nombre).toEqual("jugando");
				expect(partida.obtenerPercentGlobal()).toEqual((Math.round(((i+1)*100/3)*100))/100);
			}
			for(var key in partida.usuarios){
				partida.usuarios[key].realizarTarea();
				if(!partida.usuarios[key].impostor){
					expect(partida.obtenerPercentTarea(key)).toEqual(100);
				}
			}
			expect(partida.obtenerPercentGlobal()).toEqual(100);
			expect(partida.fase.nombre).toEqual("final");
		});
	})
  });
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------PARTIDA DE 10-----------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------

  describe("el usr Zete crea una partida de 10 jugadores",function(){
	var codigo;
	beforeEach(function() {
	  	codigo=juego.crearPartida(10,nick);
	});
	it("se comprueba la partida",function(){ 	
	  	expect(codigo).not.toBe(undefined);
	  	expect(juego.partidas[codigo].nickOwner).toEqual(nick);
	  	expect(juego.partidas[codigo].maximo).toEqual(10);
	  	expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
	 	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(1);
	});

	it("varios usuarios se unen a la partida",function(){
		juego.unirAPartida(codigo,"Ruso");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(2);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
		juego.unirAPartida(codigo,"Felipe");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(3);
		expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");	  	
		juego.unirAPartida(codigo,"Wence");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(4);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
		juego.unirAPartida(codigo,"Miguel");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(5);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
		juego.unirAPartida(codigo,"Alba");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(6);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");	  	
		juego.unirAPartida(codigo,"Chus");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(7);
	  	expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
	  	juego.unirAPartida(codigo,"Bea");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(8);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
		juego.unirAPartida(codigo,"Jose");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(9);
		expect(juego.partidas[codigo].fase.nombre).toEqual("completado");	  	
		juego.unirAPartida(codigo,"Antonio");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(10);
	  	expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
	  	juego.unirAPartida(codigo,"Jorge");
	  	var num=Object.keys(juego.partidas[codigo].usuarios).length;
	  	expect(num).toEqual(10);
	});
	describe("en partida",function(){
		beforeEach(function() {
			juego.unirAPartida(codigo,"Ruso");
			juego.unirAPartida(codigo,"Felipe");
			juego.unirAPartida(codigo,"Wence");
			juego.unirAPartida(codigo,"Miguel");
		  	juego.unirAPartida(codigo,"Alba");
		  	juego.unirAPartida(codigo,"Chus");
		  	juego.unirAPartida(codigo,"Bea");
		  	juego.unirAPartida(codigo,"Jose");
		  	juego.unirAPartida(codigo,"Pérez");
		});
		it("Zete inicia la partida",function(){
			juego.iniciarPartida(nick,codigo);
			expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
		});
		it("comprobar encargos e impostor",function(){
			var partida=juego.partidas[codigo];
			juego.iniciarPartida(nick,codigo);
			var numImpostores = 0;
			var numVidentes = 0;
			var numProfesiones = 0;
			for(var key in partida.usuarios){
				if(partida.usuarios[key].impostor){
					numImpostores = numImpostores + 1;
				}
				if(partida.usuarios[key].encargo=="Vidente"){
					numVidentes = numVidentes + 1;
				}
				if(partida.usuarios[key].encargo!="Vidente"&&partida.usuarios[key].encargo!="ninguno"){
					numProfesiones = numProfesiones + 1;
				}
			}
			var num=Object.keys(juego.partidas[codigo].usuarios).length;
			expect(numImpostores).toEqual(1);
			expect(numVidentes).toEqual(1);
			expect(numProfesiones).toEqual(num-2);
		});
		it("abandonar partida",function(){
			var partida=juego.partidas[codigo];
			partida.usuarios["Pérez"].abandonarPartida();
			expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
			partida.usuarios["Jose"].abandonarPartida();
			expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
			partida.usuarios["Bea"].abandonarPartida();
			expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
			partida.usuarios["Chus"].abandonarPartida();
			expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
			partida.usuarios["Alba"].abandonarPartida();
			expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
			partida.usuarios["Miguel"].abandonarPartida();
			expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
			partida.usuarios["Wence"].abandonarPartida();
			expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
			partida.usuarios["Felipe"].abandonarPartida();
			expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
			partida.usuarios["Ruso"].abandonarPartida();
			expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
			partida.usuarios[nick].abandonarPartida();
			expect(partida.numeroJugadores()).toEqual(0);
			expect(juego.partidas[codigo]).toBe(undefined)
		});
		it("abandonar el impostor",function(){		
			var partida=juego.partidas[codigo];
			juego.iniciarPartida(nick,codigo);
			partida.usuarios[nick].impostor=true;
			partida.usuarios["Ruso"].impostor=false;
			partida.usuarios["Felipe"].impostor=false;
			partida.usuarios["Wence"].impostor=false;
			partida.usuarios["Miguel"].impostor=false;
			partida.usuarios["Alba"].impostor=false;
			partida.usuarios["Chus"].impostor=false;
			partida.usuarios["Bea"].impostor=false;
			partida.usuarios["Jose"].impostor=false;
			partida.usuarios["Pérez"].impostor=false;
			partida.usuarios[nick].abandonarPartida();
			expect(partida.fase.nombre).toEqual("final");
		});
		it("abandonar los ciudadanos",function(){		
			var partida=juego.partidas[codigo];
			juego.iniciarPartida(nick,codigo);
			partida.usuarios[nick].impostor=true;
			partida.usuarios["Ruso"].impostor=false;
			partida.usuarios["Felipe"].impostor=false;
			partida.usuarios["Wence"].impostor=false;
			partida.usuarios["Miguel"].impostor=false;
			partida.usuarios["Alba"].impostor=false;
			partida.usuarios["Chus"].impostor=false;
			partida.usuarios["Bea"].impostor=false;
			partida.usuarios["Jose"].impostor=false;
			partida.usuarios["Pérez"].impostor=false;
			partida.usuarios["Pérez"].abandonarPartida();
			partida.usuarios["Jose"].abandonarPartida();
			partida.usuarios["Bea"].abandonarPartida();
			partida.usuarios["Chus"].abandonarPartida();
			partida.usuarios["Alba"].abandonarPartida();
			partida.usuarios["Miguel"].abandonarPartida();
			partida.usuarios["Wence"].abandonarPartida();
			partida.usuarios["Felipe"].abandonarPartida();
			expect(partida.fase.nombre).toEqual("final");
		});
    })
	describe("las votaciones",function(){
		beforeEach(function() {
			juego.unirAPartida(codigo,"Ruso");
			juego.unirAPartida(codigo,"Felipe");
			juego.unirAPartida(codigo,"Wence");
			juego.unirAPartida(codigo,"Miguel");
		  	juego.unirAPartida(codigo,"Alba");
		  	juego.unirAPartida(codigo,"Chus");
		  	juego.unirAPartida(codigo,"Bea");
		  	juego.unirAPartida(codigo,"Jose");
		  	juego.unirAPartida(codigo,"Pérez");
			juego.iniciarPartida(nick,codigo);
			var partida=juego.partidas[codigo];
			partida.usuarios[nick].impostor=true;
			partida.usuarios["Ruso"].impostor=false;
			partida.usuarios["Felipe"].impostor=false;
			partida.usuarios["Wence"].impostor=false;
			partida.usuarios["Miguel"].impostor=false;
			partida.usuarios["Alba"].impostor=false;
			partida.usuarios["Chus"].impostor=false;
			partida.usuarios["Bea"].impostor=false;
			partida.usuarios["Jose"].impostor=false;
			partida.usuarios["Pérez"].impostor=false;
		});

		it("todos skipean",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Ruso",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Felipe",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Wence",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Miguel",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Alba",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Chus",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Bea",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Jose",codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.saltarVoto("Pérez",codigo);
			expect(partida.fase.nombre).toEqual("jugando");
		});

		it("se vota y mata a un inocente",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar(nick,codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Ruso",codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Felipe",codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Wence",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Miguel",codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Alba",codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Chus",codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Bea",codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Jose",codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Pérez",codigo,"Wence");
			expect(partida.usuarios["Wence"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("jugando");
		});

		it("se vota y mata al impostor, la partida termina",function(){
			var partida=juego.partidas[codigo];
			juego.lanzarVotacion(nick,codigo);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar(nick,codigo,"Wence");
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Ruso",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Felipe",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Wence",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Miguel",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Alba",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Chus",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Bea",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Jose",codigo,nick);
			expect(partida.fase.nombre).toEqual("votacion");
			juego.votar("Pérez",codigo,nick);
			expect(partida.usuarios[nick].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("final");
		});

		it("impostor ataca a todos y gana",function(){
			var partida=juego.partidas[codigo];
			juego.atacar(nick,codigo,"Ruso");
			expect(partida.usuarios["Ruso"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("jugando");
			juego.atacar(nick,codigo,"Felipe");
			expect(partida.usuarios["Felipe"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("jugando");
			juego.atacar(nick,codigo,"Wence");
			expect(partida.usuarios["Wence"].estado.nombre).toEqual("fantasma");
			juego.atacar(nick,codigo,"Miguel");
			expect(partida.usuarios["Miguel"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("jugando");
			juego.atacar(nick,codigo,"Alba");
			expect(partida.usuarios["Alba"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("jugando");
			juego.atacar(nick,codigo,"Chus");
			expect(partida.usuarios["Chus"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("jugando");
			juego.atacar(nick,codigo,"Bea");
			expect(partida.usuarios["Bea"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("jugando");
			juego.atacar(nick,codigo,"Jose");
			expect(partida.usuarios["Jose"].estado.nombre).toEqual("fantasma");
			expect(partida.fase.nombre).toEqual("final");
		});

	})
	describe("las tareas",function(){
		beforeEach(function() {
			juego.unirAPartida(codigo,"Ruso");
			juego.unirAPartida(codigo,"Felipe");
			juego.unirAPartida(codigo,"Wence");
			juego.unirAPartida(codigo,"Miguel");
		  	juego.unirAPartida(codigo,"Alba");
		  	juego.unirAPartida(codigo,"Chus");
		  	juego.unirAPartida(codigo,"Bea");
		  	juego.unirAPartida(codigo,"Jose");
		  	juego.unirAPartida(codigo,"Pérez");
			juego.iniciarPartida(nick,codigo);
		});
		it("realizar tareas",function(){
			var partida=juego.partidas[codigo];
			for(var key in partida.usuarios){
				if(!partida.usuarios[key].impostor){
					expect(partida.obtenerPercentTarea(key)).toEqual(0);
				}
			}
			expect(partida.obtenerPercentGlobal()).toEqual(0);
			var num=Object.keys(juego.partidas[codigo].usuarios).length;
			for(var i=0;i<2;i++){
				for(var key in partida.usuarios){
					partida.usuarios[key].realizarTarea();
					if(!partida.usuarios[key].impostor){
						expect(partida.obtenerPercentTarea(key)).toEqual((Math.round(((i+1)*100/3)*100))/100);
					}
				}
				expect(partida.fase.nombre).toEqual("jugando");
				expect(partida.obtenerPercentGlobal()).toEqual((Math.round(((i+1)*100/3)*100))/100);
			}
			for(var key in partida.usuarios){
				partida.usuarios[key].realizarTarea();
				if(!partida.usuarios[key].impostor){
					expect(partida.obtenerPercentTarea(key)).toEqual(100);
				}
			}
			expect(partida.obtenerPercentGlobal()).toEqual(100);
			expect(partida.fase.nombre).toEqual("final");
		});
	});
  });
})