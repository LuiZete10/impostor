function ClienteWS(){
	this.socket=undefined;
	this.nick=undefined;
	this.codigo=undefined;
	this.owner=false;
	this.numJugador=undefined;
	this.impostor=false;
	this.estado;
	this.encargo;
	this.tareasGlobales=0;
	this.percent=0;
	this.numeroMapa;
	this.modoMapa="retro";
	this.ini=function(){
		this.socket=io.connect();
		this.lanzarSocketSrv();
	}
	this.crearPartida=function(nick,numero){
		this.nick=nick;
		this.socket.emit("crearPartida",nick,numero);//{"nick":nick,"numero":numero}
	}
	this.unirAPartida=function(nick,codigo){
		//this.nick=nick;
		this.socket.emit("unirAPartida",nick,codigo);
	}
	this.abandonarPartida=function(nick,codigo){
		this.socket.emit("abandonarPartida",nick,codigo);
	}
	this.iniciarPartida=function(){
		this.socket.emit("iniciarPartida",this.nick,this.codigo,this.modoMapa);
	}
	this.listaPartidasDisponibles=function(){
		this.socket.emit("listaPartidasDisponibles");
	}
	this.listaPartidas=function(){
		this.socket.emit("listaPartidas");
	}
	this.estoyDentro=function(){
		this.socket.emit("estoyDentro",this.nick,this.codigo);
	}
	this.lanzarVotacion=function(){
		this.socket.emit("lanzarVotacion",this.nick,this.codigo);
	}
	this.saltarVoto=function(){
		this.socket.emit("saltarVoto",this.nick,this.codigo);
	}
	this.votar=function(sospechoso){
		this.socket.emit("votar",this.nick,this.codigo,sospechoso);
	}
	this.finalVotacion=function(){
		this.socket.emit("finalVotacion",this.nick,this.codigo);
	}
	this.haVotado=function(){
		this.socket.emit("haVotado",this.nick,this.codigo);
	}
	this.obtenerEncargo=function(){
		this.socket.emit("obtenerEncargo",this.nick,this.codigo);
	}
	this.atacar=function(inocente){
		this.socket.emit("atacar",this.nick,this.codigo,inocente);
	}
	this.movimiento=function(direccion,x,y){
		var datos={nick:this.nick,codigo:this.codigo,numJugador:this.numJugador,direccion:direccion,x:x,y:y,estado:this.estado};
		this.socket.emit("movimiento",datos);
	}
	this.realizarTarea=function(){
		this.socket.emit("realizarTarea",this.nick,this.codigo);
	}
	//servidor WS dentro del cliente
	this.lanzarSocketSrv=function(){
		var cli=this;
		this.socket.on('connect', function(){			
			console.log("conectado al servidor de WS");
		});
		this.socket.on('partidaCreada',function(data){
			cli.codigo=data.codigo;
			console.log(data);
			if (data.codigo!="fallo"){
				cli.owner=true;
				cli.numJugador=0;
				cli.estado="vivo";
				cw.mostrarEsperandoRival();
			}
		});
		this.socket.on('unidoAPartida',function(data){
			cli.codigo=data.codigo;
			cli.nick=data.nick;
			cli.numJugador=data.numJugador;
			cli.estado="vivo";
			console.log(data);
			cw.limpiarPantallaInicial();
			cw.mostrarEsperandoRival();
		});
		this.socket.on('errorUnidoAPartida',function(lista){
			console.log("No se pudo unir a la partida");
			cw.mostrarListaPartidas(lista);
			cw.mostrarModalError("Se ha producido un error al unirte a la partida");
		});
		this.socket.on('nuevoJugador',function(lista){
			cw.mostrarListaJugadores(lista);
		});
		this.socket.on('fueraJugador',function(data){
			if(data.nick==cli.nick){
				cli.codigo=undefined;
				cli.owner=false;
				cw.volverCrearPartida(cli.nick);
				cli.listaPartidasDisponibles();
				cw.mostrarModalSimple("Has abandonado la partida");
			} else{
				cw.mostrarListaJugadores(data.lista);
			}
		});
		this.socket.on('fueraJugadorJuego',function(nick){
			if(nick==cli.nick){
				cli.codigo=undefined;
				cli.owner=false;
				cw.volverCrearPartida(cli.nick);
				cli.listaPartidasDisponibles();
				cw.mostrarModalSimple("Has abandonado la partida");
			} else{
				dibujarAbandono(nick);
			}
		});
		this.socket.on("actualizarOwner",function(nickOwner){
			if(cli.nick==nickOwner){
				cli.owner = true;
				cw.mostrarEsperandoRival();
			}
		});
		this.socket.on('partidaIniciada',function(data){
			console.log("Partida en fase: "+data.fase);
			if (data.fase=="jugando"){
				cli.obtenerEncargo();
				cli.estado="vivo";
				cw.limpiar();
				cw.mostrarPantallaJuego();
				cli.modoMapa = data.modoMapa;
				cli.numeroMapa = data.numeroMapa;
				lanzarJuego();
				cw.mostrarAbandonar();
			}
		});
		this.socket.on('recibirListaPartidasDisponibles',function(lista){
			console.log(lista);
			//cw.mostrarUnirAPartida(lista);
			if (!cli.codigo){
				cw.mostrarListaPartidas(lista);
			}
		});
		this.socket.on('recibirListaPartidas',function(lista){
			console.log(lista);
		});
		this.socket.on('dibujarRemoto',function(lista){
			console.log(lista);
			for(var i=0;i<lista.length;i++){
				if(lista[i].nick!=cli.nick){
					lanzarJugadorRemoto(lista[i].nick,lista[i].numJugador);
				}
			}
			crearColision();
		});
		this.socket.on("moverRemoto",function(datos){
			mover(datos);
		});
		this.socket.on("votacion",function(lista){
			console.log(lista);
			if(cli.estado!="fantasma"){
				cw.mostrarModalVotacion(lista);
			}
			borrarTumbas();
		});
		this.socket.on("finalVotacion",function(data){
			console.log(data);
			//cw.cerrarModal()
			$('#modalGeneral').modal('toggle');
			//mostrar otro modal
			cw.mostrarModalSimple(data.elegido);
			if(cli.nick==data.elegido){
				cli.estado="fantasma";
			}
			if(data.elegido!="no hay nadie elegido"){
				dibujarMuereInocente();
			}
		});
		this.socket.on("haVotado",function(data){
			cw.mostrarModalSimple(data.msg);
			console.log(data.listaHanVotado);
		});
		this.socket.on("recibirEncargo",function(data){
			console.log(data);
			cli.impostor=data.impostor;
			cli.encargo=data.encargo;
			if (data.impostor){
				//$('#avisarImpostor').modal("show");
				cw.mostrarModalSimple('eres el impostor');
				//crearColision();
			}
			cw.mostrarFuncion();
			cw.mostrarTarea();
		});
		this.socket.on("final",function(data){
			cli.codigo=undefined;
			finPartida(data);
			resetFinal()
			cw.volverCrearPartida(cli.nick);
			cli.listaPartidasDisponibles();
		});
		this.socket.on("muereInocente",function(inocente){
			console.log(inocente+" ha sido atacado");
			if(cli.nick==inocente){
				cli.estado="fantasma";
			}
			dibujarMuereInocente(inocente);
		});
		this.socket.on("tareaRealizada",function(percent){
			cli.percent = percent;
		});
		this.socket.on("refrescarTareas",function(total){
			cli.tareasGlobales = total;
			cw.mostrarTarea();
			tareasOn=true;
		});
		this.socket.on("hasAtacado",function(fase){
			if (fase=="jugando"){
				ataquesOn=true;
			}
		});
	}

	this.ini();
}

var ws2,ws3,ws4;
function pruebasWS(){
	ws2=new ClienteWS();
	ws3=new ClienteWS();
	ws4=new ClienteWS();
	var codigo=ws.codigo;

	ws2.unirAPartida("Juani",codigo);
	ws3.unirAPartida("Juana",codigo);
	ws4.unirAPartida("Juanan",codigo);

	//ws.iniciarPartida();
}

function saltarVotos(){
	ws.saltarVoto();
	ws2.saltarVoto();
	ws3.saltarVoto();
	ws4.saltarVoto();
}

function encargos(){
	ws.obtenerEncargo();
	ws2.obtenerEncargo();
	ws3.obtenerEncargo();
	ws4.obtenerEncargo();
}