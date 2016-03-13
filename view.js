"use strict";

fr.imie.View = {
  state: {
    model:  { writable: true },
    champ1: { writable: true },
    champ2: { writable: true },
    champ3: { writable: true },
    harvestReady: { writable: true }
  },
  proto: {
    init: function(model, c1, c2, c3) { // initialisation des propriétés propres à cet objet vue
      fr.imie.Observer.proto.init.call(this);
      fr.imie.Observable.proto.init.call(this);
      this.model  = model;
      this.champ1 = c1;
      this.champ2 = c2;
      this.champ3 = c3;
      this.champ1.harvestReady = false;
      this.champ2.harvestReady = false;
      this.champ3.harvestReady = false;
      this.disabledElements = [];
      this.playerName = '';
      window.onload = function () {
        // console.log(document.readyState);

        $('#recoltes').text( '0' );
        $('#argent').text( this.model.INIT_MONEY );
        $('#eau').text( this.model.INIT_GLOBAL_WATER_STOCK );
        $('#play').click( function() { this.notify('play') }.bind(this) );
        $('#scores_link').click( function() { this.notify('scores') }.bind(this) );
        $('#buyWater_link').click( function() { this.openBuyWaterWindow() }.bind(this) );
        $('#buyWater .btn').click( function() { this.notify('buyWater', $('#buyWater_input').val()) }.bind(this) );
        $("#stopWatch").data('timer', this.model.MAX_PLAYTIME);
        $("#stopWatch").TimeCircles({ start:false, count_past_zero:false,
                                      time: { Days: {show:false}, Hours: {show:false} }
                                    });

        // indicateurs du niveau d'eau de la citerne de ce champ
        $('#tank1').waterbubble({ txt: '', data: this.champ1.INIT_WATER_STOCK / this.champ1.MAX_WATER_CAPACITY });
        $('#tank2').waterbubble({ txt: '', data: this.champ2.INIT_WATER_STOCK / this.champ2.MAX_WATER_CAPACITY });
        $('#tank3').waterbubble({ txt: '', data: this.champ3.INIT_WATER_STOCK / this.champ3.MAX_WATER_CAPACITY });

        // indicateurs de maturité
        $('#mat1').waterbubble( { data: 0, txt: '',
                                  waterColor: 'rgba(34, 139, 34, 1)',
                                  textColor: 'rgba(0, 100, 0, 1)' });
        $('#mat2').waterbubble( { data: 0, txt: '',
                                  waterColor: 'rgba(34, 139, 34, 1)',
                                  textColor: 'rgba(0, 100, 0, 1)' });
        $('#mat3').waterbubble( { data: 0, txt: '',
                                  waterColor: 'rgba(34, 139, 34, 1)',
                                  textColor: 'rgba(0, 100, 0, 1)' });

        // Boutons Irriguer / Récolter et leurs notifications associées vers le controlleur
        $('#i1').click( function() { this.irrigate(1) }.bind(this) );
        $('#r1').click( function() { this.harvest(1) }.bind(this) );

        $('#i2').click( function() { this.irrigate(2) }.bind(this) );
        $('#r2').click( function() { this.harvest(2) }.bind(this) );

        $('#i3').click( function() { this.irrigate(3) }.bind(this) );
        $('#r3').click( function() { this.harvest(3) }.bind(this) );
        
        // au chargement de la page, tous les boutons sont désactivés
        $('#buyWater_link, #i1, #i2, #i3, #r1, #r2, #r3').addClass('disabled');

        // Affichage du classement dans une popup
        $('#scores_link').click( function() {
          $('#overlay').css('display','flex');
          $('#scores').fadeIn();
        });

        // permet de fermer les popup affichées au-dessus de l'overlay
        // (leurs balises HTML sont imbriquées dans le conteneur "overlay")
        $('#overlay').click( function() {
          $('#overlay, #buyWater, #scores').fadeOut();
          if (this.model.isPaused) this.notify('togglePause');
        }.bind(this));

        // empeche qu'un click dans la fenetre d'achat d'eau ou d'affichage du classement
        // ne déclenche par propagation un click sur l'overlay dessous
        // ce qui fermerait tout
        $('#buyWater, #scores').click( function(event) {
          event.stopPropagation(); 
        });

      }.bind(this);
    },
    openBuyWaterWindow: function() {
      if ((c1.water || c2.water || c3.water) 
        && !this.model.isPaused 
        && this.model.isStarted) this.notify('openBuyWaterWindow');
    },
    irrigate: function(id) {
      if (!this.model.isPaused && this.model.isStarted && this.model.globalWater) {
        if (id === 1 && !this.champ1.harvestReady
          && this.champ1.water < this.champ1.MAX_WATER_CAPACITY) {
          this.notify('irrigate',id);
        }
        else if (id === 2 && !this.champ2.harvestReady
          && this.champ2.water < this.champ2.MAX_WATER_CAPACITY) {
          this.notify('irrigate',id);
        }
        else if (id === 3 && !this.champ3.harvestReady
          && this.champ3.water < this.champ3.MAX_WATER_CAPACITY) {
          this.notify('irrigate',id);
        }
      }
      else $('#i1, #i2, #i3').addClass('disabled');
    },
    harvest: function(id) {
      if (id === 1 && this.champ1.harvestReady) {
        this.notify('harvest',id);
        this.champ1.harvestReady = false;
      }
      else if (id === 2 && this.champ2.harvestReady) {
        this.notify('harvest',id);
        this.champ2.harvestReady = false;
      }
      else if (id === 3 && this.champ3.harvestReady) {
        this.notify('harvest',id);
        this.champ3.harvestReady = false;
      }
    },
    update: function(message, data) { // updateDOM avec données du modèle ChampX ou du modèle global Model
      if (message === 'started') {
        $('#play').text('Pause');
        $('#buyWater_link, #i1, #i2, #i3').removeClass('disabled');
        $('#stopWatch').show().TimeCircles().start();
      }
      // this gloabl pause must not interfere with in-game disabled states
      else if (message === 'pauseStateChanged') {
        var test = ['i1', 'i2', 'i3', 'r1', 'r2', 'r3'];
        if (this.model.isPaused) { // pausing
          this.disabledElements = [];
          test.forEach(function(btnId) {
            if ($('#'+btnId).hasClass('disabled')) this.disabledElements.push(btnId);
            $('#'+btnId).addClass('disabled');
          }.bind(this));
          // console.log('pausing game ! disabledElements:', this.disabledElements);
          $('#stopWatch').TimeCircles().stop();
          $('#play').text( 'Jouer' );
          $('#warnings').text( 'EN PAUSE !' );
        }
        else { // unpausing
          // console.log('unpausing game ! disabledElements:', this.disabledElements);
          test.forEach(function(btnId) {
            if ($.inArray(btnId,this.disabledElements)==-1) $('#'+btnId).removeClass('disabled');
          }.bind(this));
          $('#stopWatch').TimeCircles().start();
          $('#play').text( 'Pause' );
          $('#warnings').empty();
        }
      }
      else if (message === 'money') $('#argent').text( this.model.money );
      else if (message === 'not_enough_money') alert('Pas assez d\'argent pour acheter cette quantité d\'eau !');
      else if (message === 'consumption') {
        if (data === 1)       $('#consumption1').text(this.champ1.consumption.toFixed(4) + ' L/sec');
        else if (data === 2)  $('#consumption2').text(this.champ2.consumption.toFixed(4) + ' L/sec');
        else if (data === 3)  $('#consumption3').text(this.champ3.consumption.toFixed(4) + ' L/sec');
      }
      else if (message === 'water') {
        if (data === 1) {
          $('#tank1').waterbubble({ txt: '', animation:false,
            data: (this.champ1.water / this.champ1.MAX_WATER_CAPACITY).toFixed(2)
          });
          $('#water1').text(this.champ1.water.toFixed(4) + ' L');
        }
        else if (data === 2) {
          $('#tank2').waterbubble({ txt: '', animation:false,
            data: (this.champ2.water / this.champ2.MAX_WATER_CAPACITY).toFixed(2)
          });
          $('#water2').text(this.champ2.water.toFixed(4) + ' L');
        }
        else if (data === 3) {
          $('#tank3').waterbubble({ txt: '', animation:false,
            data: (this.champ3.water / this.champ3.MAX_WATER_CAPACITY).toFixed(2)
          });
          $('#water3').text(this.champ3.water.toFixed(4) + ' L');
        }
      }
      else if (message === 'globalWater') {
        $('#eau').text( this.model.globalWater );
        if (this.model.globalWater) {
          if (!this.champ1.harvestReady && this.champ1.water < this.champ1.MAX_WATER_CAPACITY) {
            $('#i1').removeClass('disabled');
          }
          if (!this.champ2.harvestReady && this.champ2.water < this.champ2.MAX_WATER_CAPACITY) {
            $('#i2').removeClass('disabled');
          }
          if (!this.champ3.harvestReady && this.champ3.water < this.champ3.MAX_WATER_CAPACITY) {
            $('#i3').removeClass('disabled');
          }
        }
      }
      else if (message === 'empty_globalWater') {
        $('#eau').text( this.model.globalWater );
        $('#warnings').text( 'Réservoir d\'eau\nprincipal vide !' );
      }
      else if (message === 'openBuyWaterWindow') {
        $('#buyWater_input').val(data);
        $('#overlay').css('display','flex');
        $('#buyWater').fadeIn();
      }
      else if (message === 'closeWindow') $('#overlay').click();
      else if (message === 'maturity') {
        if (data === 1) {
          $('#mat1').waterbubble( { txt: '', animation:false,
            data: (this.champ1.maturity / this.champ1.MATURATION_TIME).toFixed(2),
            waterColor: 'rgba(34, 139, 34, 1)',
            textColor: 'rgba(0, 100, 0, 1)'
          });
          $('#maturity1').text(this.champ1.maturity + ' / ' + this.champ1.MATURATION_TIME);
        }
        else if (data === 2) {
          $('#mat2').waterbubble( { txt: '', animation:false,
            data: (this.champ2.maturity / this.champ2.MATURATION_TIME).toFixed(2),
            waterColor: 'rgba(34, 139, 34, 1)',
            textColor: 'rgba(0, 100, 0, 1)'
          });
          $('#maturity2').text(this.champ2.maturity + ' / ' + this.champ2.MATURATION_TIME);
        }
        else if (data === 3) {
          $('#mat3').waterbubble( { txt: '', animation:false,
            data: (this.champ3.maturity / this.champ3.MATURATION_TIME).toFixed(2),
            waterColor: 'rgba(34, 139, 34, 1)',
            textColor: 'rgba(0, 100, 0, 1)'
          });
          $('#maturity3').text(this.champ3.maturity + ' / ' + this.champ3.MATURATION_TIME);
        }
      }
      else if (message === 'full_maturity') {
        if (data === 1) {
          this.champ1.harvestReady = true;
          $('#r1').removeClass('disabled').addClass('harvestReady');
          $('#i1').addClass('disabled');
        }
        else if (data === 2) {
          this.champ2.harvestReady = true;
          $('#r2').removeClass('disabled').addClass('harvestReady');
          $('#i2').addClass('disabled');
        }
        else if (data === 3) {
          this.champ3.harvestReady = true;
          $('#r3').removeClass('disabled').addClass('harvestReady');
          $('#i3').addClass('disabled');
        }
      }
      else if (message === 'harvested') {
        if (data === 1) {
          $('#r1').removeClass('harvestReady').addClass('disabled');
          $('#i1').removeClass('disabled');
        }
        else if (data === 2) {
          $('#r2').removeClass('harvestReady').addClass('disabled');
          $('#i2').removeClass('disabled');
        }
        else if (data === 3) {
          $('#r3').removeClass('harvestReady').addClass('disabled');
          $('#i3').removeClass('disabled');
        }
      }
      else if (message === 'score') $('#recoltes').text( this.model.totalHarvests );
      else if (message === 'scores') {
        var t = $('#scores table').DataTable({
          'scrollY': '400px',
          'scrollCollapse': true,
          'paging': false,
          'data': data,
          'columns': [ {'data':'rank'}, {'data':'player'}, {'data':'score'} ],
          "columnDefs": [
            {"targets":0, "searchable":false, "orderable":false },
            {"targets":1, "searchable":true,  "orderable":true  },
            {"targets":2, "searchable":false, "orderable":true  }
          ],
          'order': [[2,'desc']]
        });
      }
      else if (message === 'gameOver') {
        $('#warnings').text( 'GAME OVER !' );
        $('#play').text( 'Jouer' );
        $('#buyWater_link, #i1, #i2, #i3, #r1, #r2, #r3').addClass('disabled');
        $('#stopWatch').TimeCircles().stop();
        this.playerName = prompt('Game Over !\nTapez votre pseudo pour voir votre classement :');
      }
    }
  },
  build: function(model, c1, c2, c3) {
    var obj = Object.create(this.proto, this.state);
    obj.init(model, c1, c2, c3);
    return obj;
  }
}

// la vue hérite des méthodes d'Observer, surtout 'update'
fr.imie.Utils.Extend.build().mixin(fr.imie.Observer, fr.imie.View); // la view observe les notifications des modèles qui lui sont rattachés
fr.imie.Utils.Extend.build().mixin(fr.imie.Observable, fr.imie.View);
