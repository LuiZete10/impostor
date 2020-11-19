function ControlWeb($){
	this.mostrarCrearPartida=function(){
		var cadena ='<div id="mostrarCrearP">';
		cadena = cadena + '<div class="form-group">';
		cadena = cadena + '<label for="nick">Name:</label>';
		cadena = cadena + '<input type="text" class="form-control" id="nick">';
		cadena = cadena + '</div>';
		cadena = cadena + '<div class="form-group">';
		cadena = cadena + '<label for="numero">Numero:</label>';
		cadena = cadena + '<input type="text" class="form-control" id="numero">';
		cadena = cadena + '</div>';
		cadena = cadena + '<div class="form-group">';
		cadena = cadena + '<button type="button" id="btnCrearP" class="btn btn-primary">Crear Partida</button>';
		cadena = cadena + '</div>';
		cadena = cadena + '</div>';
		$('#crearPartida').append(cadena);

		$('#btnCrearP').on('click', function(){
			var nick = $('#nick').val();
			var numero = $('#numero').val();
			var codigo = ws.crearPartida(nick,numero);
			$('#mostrarCrearP').remove();
		});
	}
	this.mostrarEsperandoRivales=function(){
		$('#mostrarEsperandoR').remove();
		var cadena ='<div id="mostrarEsperandoR">';
		cadena = cadena + '<img src="cliente/img/loader.gif">';
		cadena = cadena + '</div>';
		$('#esperando').append(cadena);
	}
	this.mostrarUnirAPartida=function(lista){
		$('#mostrarUnirP').remove();
		var cadena ='<div id="mostrarUnirP">';
		cadena = cadena + '<div id="lstPartidas" class="list-group">';
		for(var i = 0; i < lista.length; i++){
			cadena = cadena + '<a href="#" value="'+lista[i].codigo+'" class="list-group-item">'+lista[i].codigo+'     Huecos: '+lista[i].huecos+'</a>';
		} 
		cadena = cadena + '</div>';
		cadena = cadena + '<button type="button" id="btnUnirP" class="btn btn-primary">Unir a Partida</button>';
		cadena = cadena + '</div>';
		$('#unirAPartida').append(cadena);

		StoreValue = []; //Declare array
    	$(".list-group a").click(function(){
        	StoreValue = []; //clear array
        	StoreValue.push($(this).attr("value")); // add text to array
    	});


		$('#btnUnirP').on('click', function(){
			var nick = $('#nick').val();
			var codigo = StoreValue[0];
			var codigo = ws.unirAPartida(nick,codigo);
			$('#mostrarUnirP').remove();
		});
	}
}