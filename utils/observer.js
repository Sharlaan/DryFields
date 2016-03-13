"use strict";

// Ceci sert surtout à faire hériter la méthode update
// le reste ne sert à rien, on pourrait très bien écrire
// 'update' directement dans les classes concernées
fr.imie.Observer = {
  state: {},
  proto: {
    init: function() {},
    update: function() {}
  },
  build: function() {
    return Object.create( this.proto, this.state );
  }
}
