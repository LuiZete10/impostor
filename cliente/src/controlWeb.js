function ControlWeb($){

	this.mostrarCrearPartida=function(){
		var min=4;
		var cadena='<div id="mostrarCP"><h3>Crear partida</h3>';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<label for="nick">Nick:</label>';
		cadena=cadena+'<input type="text" class="form-control" id="nick">';
		cadena=cadena+'</div>';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<label for="num">Número:</label>';
		cadena=cadena+'<input type="number" min="'+min+'" max="10" value="'+10+'" class="form-control" id="num">';
		cadena=cadena+'</div>';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<button type="button" id="btnCrear" class="btn btn-primary">Crear partida</button>';
		cadena=cadena+'</div>';
		cadena=cadena+'</div>';

		$('#crearPartida').append(cadena);

		$('#btnCrear').on('click',function(){
			var nick=$('#nick').val();
			var num=$("#num").val();
			$("#mostrarCP").remove();
			ws.crearPartida(nick,num);
		});
	}

	this.volverCrearPartida=function(nick){
		this.limpiar();
		this.limpiarPantallaJuego();
		$('#mostrarCP').remove();
		var min=4;
		var cadena='<div id="mostrarCP"><h3>Crear partida</h3>';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<label for="nick">Nick:</label>';
		cadena=cadena+'<input type="text" class="form-control" value="' + nick + '" id="nick">';
		cadena=cadena+'</div>';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<label for="num">Número:</label>';
		cadena=cadena+'<input type="number" min="'+min+'" max="10" value="'+10+'" class="form-control" id="num">';
		cadena=cadena+'</div>';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<button type="button" id="btnCrear" class="btn btn-primary">Crear partida</button>';
		cadena=cadena+'</div>';
		cadena=cadena+'</div>';

		$('#crearPartida').append(cadena);

		$('#btnCrear').on('click',function(){
			var nick=$('#nick').val();
			var num=$("#num").val();
			$("#mostrarCP").remove();
			if (nick!=""){
				//revisar
	            ws.crearPartida(nick,num);
	        }else{
	        	cw.mostrarModalError("No se ha introducido nick");
	        }
			
		});
	}

	this.mostrarListaPartidas=function(lista){

	    $('#mostrarListaPartidas').remove();
	    var cadena='<div id="mostrarListaPartidas"><h3>Elegir partida</h3>';
	    cadena=cadena+'<div class="list-group" id="lista">';
	    for(var i=0;i<lista.length;i++){
	        var maximo=lista[i].maximo;
	        var numJugadores=maximo-lista[i].huecos;
	        cadena=cadena+'<a href="#" value="'+lista[i].codigo+'" class="list-group-item">'+lista[i].codigo+'<span class="badge">'+numJugadores+'/'+maximo+'</span></a>';
	    } 
	    cadena=cadena+'</div>';
	    cadena=cadena+'<div class="form-group">';
	    cadena=cadena+'<input type="button" class="btn btn-primary btn-md" id="unirme" value="Unirme">';'</div>';
	    cadena=cadena+'</div>';
	    $('#listaPartidas').append(cadena);
	    StoreValue = []; //Declare array
	    $(".list-group a").click(function(){
	        StoreValue = []; //clear array
	        StoreValue.push($(this).attr("value")); // add text to array
	    });

	    $('#unirme').click(function(){
	          var codigo="";
	          codigo=StoreValue[0];
	          console.log(codigo);
	          var nick=$('#nick').val();
	          if (codigo && nick){
	            ws.unirAPartida(nick,codigo);
	          }else if(codigo){
	          	cw.mostrarModalError("No se ha introducido nick");
	          }
	    });
	}

	this.limpiarPantallaInicial=function(){
		$('#mostrarListaPartidas').remove();
	    $('#mostrarCP').remove();
	}

	this.limpiarPantallaJuego=function(){
		$('#funcionPartidaTexto').remove();
		$('#pantallaJuego').remove();
	    $('#abandonarGameButton').remove();
	    $('#funcionPartidaTarea').remove();
	}

	this.mostrarEsperandoRival=function(){
	    this.limpiar();
	    //$('#mER').remove();
	    var cadena='<div id="mER"><h3>Esperando rival</h3>';
	    cadena=cadena+'<img id="gif" src="cliente/img/loader.gif"><br>';
	    if (ws.owner){
	    	cadena=cadena+'<div class="form-group">';
			cadena=cadena+'<input type="button" class="btn btn-primary btn-md" id="iniciar" value="Iniciar partida">';   
			cadena=cadena+'</div>';
		}
		cadena=cadena+'</div>';
	    $('#esperando').append(cadena);
	    $('#iniciar').click(function(){
	    	ws.iniciarPartida();
	    });
	  }

	this.mostrarListaJugadores=function(lista){
	  	$('#mostrarListaEsperando').remove();
	  	var cadena='<div id="mostrarListaEsperando"><h3>Lista Jugadores</h3>';
	  	cadena =cadena+'<ul class="list-group">';
	  	 for(var i=0;i<lista.length;i++){
	  		cadena=cadena+'<li class="list-group-item">'+lista[i].nick+'</li>';
	  	}
		cadena=cadena+'</ul>';
		cadena=cadena+'<button type="button" id="btnAbandonar" class="btn btn-primary">Abandonar a partida</button>';
		cadena=cadena+'</div>';
		$('#listaEsperando').append(cadena);

		$('#btnAbandonar').on('click',function(){
			var nick=ws.nick;
			var codigo=ws.codigo;
			ws.abandonarPartida(nick,codigo);
		});
	}

	this.mostrarPantallaJuego=function(lista){
	  	var cadena='<div id="pantallaJuego">';
		cadena=cadena+'</div>';
		$('#game-container').append(cadena);
	}

	this.limpiar=function(){
		$('#mUAP').remove();
		$('#mCP').remove();
		$('#mostrarListaPartidas').remove();
		$('#mER').remove();
		$('#mostrarListaEsperando').remove();
	}

	this.mostrarModalSimple=function(msg){
		this.limpiarModal();
		var cadena="<p id='avisarImpostor'>"+msg+'</p>';
		$("#contenidoModal").append(cadena);
		$("#pie").append('<button type="button" id="cerrar" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>');
		$('#modalGeneral').modal("show");
	}

	this.mostrarModalError=function(error){
		this.limpiarModal();
		var cadena="<p id='error'>"+error+'</p>';
		$("#contenidoModal").append(cadena);
		$("#pie").append('<button type="button" id="cerrar" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>');
		$('#modalGeneral').modal("show");
	}

	this.mostrarModalTarea=function(tarea){
		this.limpiarModal();
		var cadena="<p id='tarea'>Esta tarea de "+tarea+" ha sido realizada</p>";
		$("#contenidoModal").append(cadena);
		$("#pie").append('<button type="button" id="cerrar" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>');
		$('#modalGeneral').modal("show");
	}

	this.mostrarModalVotacion=function(lista){
		this.limpiarModal();
		var cadena='<div id="votacion"><h3>Votación</h3>';		
		cadena =cadena+'<div class="input-group">';
	  	 for(var i=0;i<lista.length;i++){
	  		cadena=cadena+'<div><input type="radio" name="optradio" value="'+lista[i].nick+'"> '+lista[i].nick+'</div>';
	  	}
	  	cadena=cadena+'<div><input type="radio" name="optradio" value="-1"> Saltar voto</div>';
		cadena=cadena+'</div>';

		$("#contenidoModal").append(cadena);
		$("#pie").append('<button type="button" id="votar" class="btn btn-secondary" >Votar</button>');
		$('#modalGeneral').modal("show");

		var sospechoso=undefined;
		$('.input-group input').on('change', function() {
		   sospechoso=$('input[name=optradio]:checked', '.input-group').val(); 
		});

		$('#votar').click(function(){
	    	if (sospechoso!="-1"){
		    	ws.votar(sospechoso);
		    }
		    else{
	    		ws.saltarVoto();
	    	}
	    });

	}

	this.limpiarModal=function(){
		$('#avisarImpostor').remove();
		$('#error').remove();
		$('#tarea').remove();
		$('#cerrar').remove();
		$('#votacion').remove();
		$('#votar').remove();
	}

	this.mostrarFuncion=function(){
		var cadena='<div id="funcionPartidaTexto">';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<label for="nick">Nick: ' + ws.nick + '</label>';
		cadena=cadena+'</div>';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<label for="encargo">Profesión:&nbsp;&nbsp;</label>';
		if(ws.impostor){
			cadena=cadena+'<label for="nomEncargo" style="color:#C0392B">Impostor</label>';
		}else if(ws.encargo == "Vidente"){
			cadena=cadena+'<label for="nomEncargo" style="color:#2874A6">' + ws.encargo + '</label>';
		}else{
			cadena=cadena+'<label for="nomEncargo" style="color:#28B463">' + ws.encargo + '</label>';
		}
		
		cadena=cadena+'</div>';
		cadena=cadena+'</div>';
	
		$('#funcionPartida').append(cadena);
	}

	this.mostrarTarea=function(){
		$('#funcionPartidaTarea').remove();
		var cadena='<div id="funcionPartidaTarea">';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<label for="percent">Tareas Propias:&nbsp;</label>';
		if(ws.percent==100){
			cadena=cadena+'<label for="numPercent" style="color:green">' + ws.percent + '</label>';
		}else if(ws.percent>=50){
			cadena=cadena+'<label for="numPercent">' + ws.percent + '</label>';
		}else{
			cadena=cadena+'<label for="numPercent" style="color:red">' + ws.percent + '</label>';
		}
		cadena=cadena+'</div>';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<label for="tareasGlobales">Tareas Globales:&nbsp;</label>';
		if(ws.tareasGlobales==100){
			cadena=cadena+'<label for="numTareasGlobales" style="color:green">' + ws.tareasGlobales + '</label>';
		}else if(ws.tareasGlobales>=50){
			cadena=cadena+'<label for="numTareasGlobales">' + ws.tareasGlobales + '</label>';
		}else{
			cadena=cadena+'<label for="numTareasGlobales" style="color:red">' + ws.tareasGlobales + '</label>';
		}
		cadena=cadena+'</div>';
		cadena=cadena+'</div>';
	
		$('#funcionTareas').append(cadena);
	}

	this.mostrarAbandonar=function(){
		var cadena='<div id="abandonarGameButton">';
		cadena=cadena+'<div class="form-group">';
		cadena=cadena+'<button type="button" id="btnAbandonarG" class="btn btn-primary">Abandonar a partida</button>';
		cadena=cadena+'</div>';
		cadena=cadena+'</div>';
	
		$('#abandonarGame').append(cadena);

		$('#btnAbandonarG').on('click',function(){
			var nick=ws.nick;
			var codigo=ws.codigo;
			ws.abandonarPartida(nick,codigo);
		});
	}
}