"use strict";

fr.imie.Model = {
	state: { // états des propriétés
		MAX_PLAYTIME: 	{ writable:false, value:15*60 }, // 15 mins exprimé en secs
		INIT_MONEY: 	{ writable:false, value:50 }, // $
		WATER_PRICE: 	{ writable:false, value:1 }, // $
		HARVEST_PRICE: 	{ writable:false, value:40 }, // $/L
		INIT_GLOBAL_WATER_STOCK: { writable:false, value:10 }, // $
		API_KEY: 		{ writable:false, value:'' }, // permet d'afficher/stocker les scores
		money: 			{ writable:true },
		totalHarvests: 	{ writable:true },
		globalWater: 	{ writable:true },
		scores: 		{ writable:true },
		isStarted: 		{ writable:true },
		isPaused: 		{ writable:true }
  	},
	proto: {
		init: function() { //
			fr.imie.Observable.proto.init.call(this); // comme le super() de Java
			this.totalHarvests = 0;
			this.globalWater   = this.INIT_GLOBAL_WATER_STOCK;
			this.money         = this.INIT_MONEY;
			this.scores        = [];
			this.isStarted     = false;
			this.isPaused      = false;
			// this.fields = [];
			// this.fields.push(fr.imie.Champ.build(1));
			// this.fields.push(fr.imie.Champ.build(2));
			// this.fields.push(fr.imie.Champ.build(3));
	    },
	    start: function () {
	    	c1.play();
	    	c2.play();
	    	c3.play();
	    	this.isStarted = true;
	    	this.notify('started');
	    },
	    togglePauseState: function () {
	    	this.isPaused = !this.isPaused;
	    	this.notify('pauseStateChanged');
	    },
	    incrementScore: function () {
	    	this.totalHarvests++;
	    	this.money += this.HARVEST_PRICE;
	    	this.notify('score');
	    	this.notify('money');
	    },
	    decrementGlobalWater: function () {
	    	this.globalWater--;
	    	if (this.globalWater > 0) this.notify('globalWater');
	    	else this.notify('empty_globalWater');
	    },
	    openBuyWaterWindow: function() {
	    	this.togglePauseState();
	    	this.notify('openBuyWaterWindow', this.money);
	    },
	    buyWater: function (amount) {
	    	var due = this.WATER_PRICE * parseInt(amount);
	    	if (due <= this.money) {
	    		this.money -= due;
	    		this.globalWater += parseInt(amount);
        		this.togglePauseState();
	    		this.notify('money');
	    		this.notify('globalWater');
	    		this.notify('closeWindow');
	    	}
	    	else this.notify('not_enough_money');
	    },
	    refreshScores: function () {
	    	if (this.API_KEY.length) {
		    	$.ajax({
					url: 'https://api.mlab.com/api/1/databases/dry_fields/collections/scores?apiKey=' + this.API_KEY,
					type: 'get',
					timeout: 2000
		    	}).done(function(data) {
					this.scores = fr.imie.Utils.rank(data);
					this.notify('scores', this.scores);
				}.bind(this));
			}
			else this.notify('warning no api');
	    },
	    checkGameOver: function() {
			if (!c1.water && !c2.water && !c3.water) {
		    	c1.stop();
		    	c2.stop();
		    	c3.stop();
	    		this.isStarted = false;
				this.notify('gameOver');
			}
		},
	    gameOver: function (pseudo) {
	    	if (this.API_KEY.length) {
		    	$.ajax({
					url: 'https://api.mlab.com/api/1/databases/dry_fields/collections/scores?apiKey=' + this.API_KEY,
					type: 'post',
	          		contentType: 'application/json; charset=utf-8',
					data: JSONstringify( {player:pseudo, score:this.totalHarvests} )
		    	}).done(function(data) {
					this.scores = fr.imie.Utils.rank(data);
					this.notify('scores', this.scores);
				}.bind(this));
			}
			else this.notify('warning no api');
	    }
	},
	build: function() { // constructeur de propriétés et méthodes (comportements et états)
		var obj = Object.create(this.proto, this.state);
		obj.init();
		return obj;
	}
}

//permet de combiner les protos spécifique au Model avec ceux de la classe observable
fr.imie.Utils.Extend.build().mixin(fr.imie.Observable, fr.imie.Model);