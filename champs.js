"use strict";

fr.imie.Champ = {
	state: { // états des propriétés
		MAX_WATER_CAPACITY: { writable:false, value:20 },
    	INIT_WATER_STOCK: { writable:false, value:10 }, // L par citerne
		INIT_CONSUMPTION: { writable:false, value:1 }, // L/sec
		MAX_CONSUMPTION: { writable:false, value:3 }, // L/sec
		MATURATION_TIME: { writable:false, value:15 }, // secs
		maturity: { writable:true },
		water: { writable:true },
    	consumption: { writable:true }
  	},
	proto: { // propriétés et méthodes (comportements)
		init: function(id, model) { //
			fr.imie.Observable.proto.init.call(this); // comme le super() de Java
			this.id          = id;
			this.model       = model;
			this.maturity    = 0;
			this.water       = this.INIT_WATER_STOCK;
			this.consumption = this.INIT_CONSUMPTION;
			this.consumption_increment = (this.MAX_CONSUMPTION - this.INIT_CONSUMPTION) / this.model.MAX_PLAYTIME;
	    },
	    play: function () {
	    	this.interval = setInterval( function() {
	    		if (!this.model.isPaused && this.model.isStarted) {
		    		this.consumeWater();
		    		this.setMaturity();
		    		this.setConsumption();
		    		this.model.checkGameOver();
		    	}
	    	}.bind(this), 1000);
	    },
	    stop: function () {
	    	clearInterval(this.interval);
	    },
		consumeWater: function() { // Niveau d'eau dans la citerne
			// console.log('champ'+this.id+' water',this.water);
			if (this.maturity < this.MATURATION_TIME) {
				this.water -= this.consumption;
				if (this.water <= 0) {
					this.water = 0;
					this.maturity = 0; // récolte perdue
					this.notify('maturity',this.id);
				}
				this.notify('water',this.id);
			}
		},
		setMaturity: function() { // maturité du champ
			//console.log('champ'+this.id+' maturity',this.maturity);
			if (this.water > 0) {
				if (this.maturity < this.MATURATION_TIME) {
					this.maturity++;
					this.notify('maturity',this.id);
				}
				else {
					this.maturity = this.MATURATION_TIME;
					this.notify('full_maturity',this.id);
				}
			}
		},
		setConsumption: function() { // simulation d'aridité
			//console.log('consumption champ'+this.id,this.consumption);
			if (this.consumption < this.MAX_CONSUMPTION) {
				this.consumption += this.consumption_increment;
			}
			else this.consumption = this.MAX_CONSUMPTION;
			this.notify('consumption',this.id);
		},
		irrigate: function() {
			if (this.model.globalWater > 0) {
				this.water++;
				this.model.decrementGlobalWater();
				this.notify('water',this.id);
			}
		},
		harvest: function() {
			this.model.incrementScore();
			this.maturity = 0;
			this.notify('harvested',this.id);
		}
	},
	build: function(id, model) { // constructeur
		var obj = Object.create(this.proto, this.state);
		obj.init(id, model);
		return obj;
	}
}

//permet de combiner les protos spécifique au Model avec ceux de la classe observable
fr.imie.Utils.Extend.build().mixin(fr.imie.Observable, fr.imie.Champ);