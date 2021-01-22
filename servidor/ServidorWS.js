var modelo=require("./modelo.js");

function ServidorWS(){
	this.enviarRemitente=function(socket,mens,datos){
        socket.emit(mens,datos);
    }
	this.enviarATodos=function(io,nombre,mens,datos){
        io.sockets.in(nombre).emit(mens,datos);
    }
    this.enviarATodosMenosRemitente=function(socket,nombre,mens,datos){
        socket.broadcast.to(nombre).emit(mens,datos)
    };
    this.enviarGlobal=function(socket,mens,data){
    	socket.broadcast.emit(mens,data);
    }
	this.lanzarSocketSrv=function(io,juego){
		var cli=this;
		io.on('connection',function(socket){		    
		    socket.on('crearPartida', function(nick,numero){
		        //var usr=new modelo.Usuario(nick);
				var codigo=juego.crearPartida(numero,nick);	
				socket.join(codigo);	        			
				console.log('usuario: '+nick+" crea partida codigo: "+codigo);	
		       	cli.enviarRemitente(socket,"partidaCreada",{"codigo":codigo,"owner":nick});		        		        
		    	var lista=juego.listaPartidasDisponibles();
		    	cli.enviarGlobal(socket,"recibirListaPartidasDisponibles",lista);
		    	var lista=juego.obtenerListaJugadores(codigo);
			    cli.enviarRemitente(socket, "nuevoJugador",lista);
		    });
		    socket.on('unirAPartida',function(nick,codigo){
		    	//nick o codigo nulo
		    	var res=juego.unirAPartida(codigo,nick);
		    	socket.join(codigo);
		    	if(res!=undefined){
		    		console.log("Usuario "+res.nick+" se une a partida "+res.codigo);
			    	cli.enviarRemitente(socket,"unidoAPartida",res);
			    	var lista=juego.obtenerListaJugadores(codigo);
			    	cli.enviarATodos(io, codigo, "nuevoJugador",lista);
		    	}else{
					console.log("Usuario "+nick+" no se ha podido unir a la partida "+codigo);
					cli.enviarRemitente(socket,"errorUnidoAPartida",nick);
		    	}
		    });

		    socket.on('abandonarPartida',function(nick,codigo){
		    	console.log(nick + " va a abandonar la partida " + codigo);
		    	var fase=juego.partidas[codigo].fase.nombre;
		    	juego.abandonarPartida(codigo,nick);
		    	if(juego.partidas[codigo]!=undefined){
		    		fase=juego.partidas[codigo].fase.nombre;
		    		if(fase=="final"){
		    			if(juego.partidas[codigo].gananImpostores()){
		    				console.log("Ganan los impostores, la partida " + codigo);
		    				cli.enviarATodos(io, codigo, "final","ganan impostores");
		    			}else{
		    				console.log("Ganan los ciudadanos, la partida " + codigo);
		    				cli.enviarATodos(io, codigo, "final","ganan ciudadanos");
		    			}
		    			cli.enviarRemitente(socket,"fueraJugadorJuego",nick);
			    	}else if (fase=="jugando" || fase=="votacion"){
			    		cli.enviarATodos(io, codigo, "fueraJugadorJuego",nick);
			    	} else {
			    		console.log("Nuevo owner: "+juego.partidas[codigo].nickOwner);
			    		cli.enviarATodos(io, codigo, "actualizarOwner",juego.partidas[codigo].nickOwner);
			    		var lista=juego.obtenerListaJugadores(codigo);
			    		cli.enviarATodos(io, codigo, "fueraJugador",{"lista":lista,"nick":nick});
			    		
			    	}
		    	}else{
		    		if (fase=="jugando" || fase=="votacion"){
		    			cli.enviarRemitente(socket,"fueraJugadorJuego",nick);
		    		} else {
		    			cli.enviarRemitente(socket,"fueraJugador",{"lista":undefined,"nick":nick})
		    		}
		    	}
		    });

		    socket.on('iniciarPartida',function(nick,codigo){
		    	//iniciar partida ToDo
		    	//controlar si nick es el owner
		    	//cli.enviarATodos(socket,codigo,"partidaIniciada",fase);
		    	juego.iniciarPartida(nick,codigo);
		    	var fase=juego.partidas[codigo].fase.nombre;
		    	if (fase=="jugando"){
			    	cli.enviarATodos(io, codigo, "partidaIniciada",fase);
			    }
		    });

		    socket.on('listaPartidasDisponibles',function(){
		    	var lista=juego.listaPartidasDisponibles();
		    	cli.enviarRemitente(socket,"recibirListaPartidasDisponibles",lista);
		    });

		    socket.on('listaPartidas',function(){
		    	var lista=juego.listaPartidas();
		    	cli.enviarRemitente(socket,"recibirListaPartidas",lista);
		    });

		    socket.on('estoyDentro',function(nick,codigo){
		    	//var usr=juego.obtenerJugador(nick,codigo);
		  //   	var numero=juego.partidas[codigo].usuarios[nick].numJugador;
		  //   	var datos={nick:nick,numJugador:numero};
				// cli.enviarATodosMenosRemitente(socket,codigo,"dibujarRemoto",datos)
				var lista=juego.obtenerListaJugadores(codigo);
				cli.enviarRemitente(socket,"dibujarRemoto",lista);
		    });

		    socket.on('movimiento',function(datos){
		    	cli.enviarATodosMenosRemitente(socket,datos.codigo,"moverRemoto",datos);
		    });

		    socket.on("lanzarVotacion",function(nick,codigo){
		    	juego.lanzarVotacion(nick,codigo);
		    	var partida=juego.partidas[codigo];
		    	var lista=partida.obtenerListaJugadoresVivos();
		    	cli.enviarATodos(io, codigo,"votacion",lista);
		    });

		    socket.on("saltarVoto",function(nick,codigo){
		    	console.log(nick + " ha votado a skipeado");
		    	var partida=juego.partidas[codigo];
		    	juego.saltarVoto(nick,codigo);
		    	if (partida.todosHanVotado()){
		    		var data={"elegido":partida.elegido,"fase":partida.fase.nombre};
		    		console.log("Resultado: "+ partida.elegido);
		    		if (data.fase=="final"){
			    		if(partida.gananImpostores()){
			    			console.log("Ganan los impostores, la partida " + codigo);
		    				cli.enviarATodos(io, codigo, "final","ganan impostores");
		    			}else{
		    				console.log("Ganan los ciudadanos, la partida " + codigo);
		    				cli.enviarATodos(io, codigo, "final","ganan ciudadanos");
		    			}
			    	}else{
			    		cli.enviarATodos(io, codigo,"finalVotacion",data);
			    	}
		    	}
		    	else{
		    		cli.enviarATodos(io, codigo,"haVotado",partida.listaHanVotado());		    	
		    	}
		    });

			socket.on("votar",function(nick,codigo,sospechoso){
				console.log(nick + " ha votado a " + sospechoso);
		    	var partida=juego.partidas[codigo];
		    	juego.votar(nick,codigo,sospechoso);
		    	if (partida.todosHanVotado()){
		    		var data={"elegido":partida.elegido,"fase":partida.fase.nombre};
		    		console.log("Resultado: "+ partida.elegido);
		    		if (data.fase=="final"){
		    			if(partida.gananImpostores()){
		    				console.log("Ganan los impostores, la partida " + codigo);
		    				cli.enviarATodos(io, codigo, "final","ganan impostores");
		    			}else{
		    				console.log("Ganan los ciudadanos, la partida " + codigo);
		    				cli.enviarATodos(io, codigo, "final","ganan ciudadanos");
		    			}
			    	}else{
			    		cli.enviarATodos(io, codigo,"finalVotacion",data);
			    	}
			    	//partida.reiniciarContadoresVotaciones();
		    	}
		    	else{
		    		cli.enviarATodos(io, codigo,"haVotado",partida.listaHanVotado());		    	
		    	}
		    });

		    socket.on("obtenerEncargo",function(nick,codigo){
		    	var encargo=juego.partidas[codigo].usuarios[nick].encargo;
		    	var impostor=juego.partidas[codigo].usuarios[nick].impostor;
		    	cli.enviarRemitente(socket,"recibirEncargo",{"encargo":encargo,"impostor":impostor});
		    });

		    socket.on("atacar",function(nick,codigo,inocente){
		    	juego.atacar(nick,codigo,inocente);
		    	var partida=juego.partidas[codigo];
		    	var fase=partida.fase.nombre;
		    	console.log(nick + " ha matado a " + inocente);
		    	cli.enviarATodos(io,codigo,"muereInocente",inocente);
		    	cli.enviarRemitente(socket,"hasAtacado",fase);
			    if (fase=="final"){
			    	console.log("Ganan los impostores, la partida " + codigo);
			    	cli.enviarATodos(io, codigo, "final","ganan impostores");
			    }
		    });

		    socket.on("realizarTarea",function(nick,codigo){
		    	var partida=juego.partidas[codigo];
		    	juego.realizarTarea(nick,codigo);
		    	var percent=partida.obtenerPercentTarea(nick);
		    	var total=partida.obtenerPercentGlobal();
		    	console.log(nick + " realizo una tarea, lleva un " + percent + " propio y globalmente, " + total);
				cli.enviarRemitente(socket,"tareaRealizada",percent);
				cli.enviarATodos(io, codigo, "refrescarTareas",total);		    	
		    	var fase=partida.fase.nombre;
		    	if (fase=="final"){
		    		console.log("Ganan los ciudadanos, la partida " + codigo);
			    	cli.enviarATodos(io, codigo, "final","ganan ciudadanos");
			    }
		    });
		});
	}
	
}

module.exports.ServidorWS=ServidorWS;