"use strict";

fr.imie.Observable = {
  state: {
    observers: { writable : true }
  },
  proto: {
    init: function() {
      this.observers = [];
    },
    attach: function(observer) {
      this.observers.push(observer);
    },
    notify: function(message,data) {
      this.observers.forEach(function(observer) {
        observer.update(message,data);
      });
    }
  },
  build: function() {
    var obj = Object.create( this.proto, this.state );
    obj.init();
    return obj
  }
}
