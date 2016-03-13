
"use strict";

fr.imie.Controller = {
  state: {
    model:  { writable: true },
    champ1: { writable: true },
    champ2: { writable: true },
    champ3: { writable: true }
  },
  proto: {
    init: function(model, c1, c2, c3) {
      fr.imie.Observer.proto.init.call(this);
      this.model  = model;
      this.champ1 = c1;
      this.champ2 = c2;
      this.champ3 = c3;
    },
    update: function(message,data) {
      if (message === 'play') {
        if (!this.model.isStarted) this.model.start();
        else this.model.togglePauseState();
      }
      else if (message === 'togglePause') this.model.togglePauseState();
      else if (message === 'irrigate' && !this.model.isPaused && this.model.isStarted) {
        if (data === 1) this.champ1.irrigate();
        else if (data === 2) this.champ2.irrigate();
        else if (data === 3) this.champ3.irrigate();
      }
      else if (message === 'harvest' && !this.model.isPaused && this.model.isStarted) {
        if (data === 1) this.champ1.harvest();
        else if (data === 2) this.champ2.harvest();
        else if (data === 3) this.champ3.harvest();
      }
      else if (message === 'openBuyWaterWindow') this.model.openBuyWaterWindow();
      else if (message === 'buyWater') this.model.buyWater(data);
      else if (message === 'scores') this.model.refreshScores();
    }
  },
  build: function(model, c1, c2, c3) {
    var obj = Object.create(this.proto, this.state);
    obj.init(model, c1, c2, c3);
    return obj;
  }
}

// le controlleur observe les notifications de la view
fr.imie.Utils.Extend.build().mixin(fr.imie.Observer, fr.imie.Controller);
