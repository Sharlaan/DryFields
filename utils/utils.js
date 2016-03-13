"use strict";

// permet d'étendre le proto de la classe Target avec ceux de la classe Source
// Attention au nommage des méthodes de vos classes: le mixin n'écrasera pas les méthodes aux noms identiques
fr.imie.Utils.Extend={
  state:{
  },
  proto:{
    init:function() {},
    mixin: function(source, target) {
      for (var key in source.proto) {
        if (!target.proto[key]) {
          target.proto[key] = source.proto[key];
        }
      }
      for (var key in source.state) {
        if (!target.state[key]) {
          target.state[key] = source.state[key];
        }
      }
    }
  },
  build: function() {
    return Object.create(this.proto,this.state);
  }
}

fr.imie.Utils.sortBy = function(field, isNumericField, reverse) {
    return function (a, b) {
        if (isNumericField) a = Number(a[field]), b = Number(b[field]);
        else a = a[field], b = b[field];
        return ((a < b) ? -1 : ((a > b) ? 1 : 0)) * (reverse ? -1 : 1);
    }
}
// for Strings
fr.imie.Utils.comparator1 = function(a,b){return +(a>b)||-(a<b)}
// for numerics
fr.imie.Utils.comparator2 = function(a, b) {return a - b}; // but make sure only numbers are passed (to avoid NaN)

fr.imie.Utils.isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

fr.imie.Utils.rankOptimised = function(arr, f) {
    return arr
    .map((x, i) => [x, i])
    .sort((a, b) => f(a[0], b[0]))
    .reduce((a, x, i, s) => (a[x[1]] =
        i > 0 && f(s[i - 1][0], x[0]) === 0 ? a[s[i - 1][1]] : i + 1, a), []);
}
// usage :
// rank([79, 5, 18, 5, 32, 1, 16, 1, 82, 13], (a, b) => b - a);
// ci-dessus est la version sans trier avant
// la version (utilisée dans model.refreshScores) est + lisible mais + lente (~ 100ms de + pour un dataset de 50k )

fr.imie.Utils.rank = function(data) {
    data.sort( fr.imie.Utils.sortBy('score', true, true) );
    data.forEach(function (obj, idx) {
        if (!idx) obj.rank = idx+1;
        else if (obj.score == data[idx-1].score) obj.rank = data[idx-1].rank;
        else obj.rank = data[idx-1].rank+1;
    });
    return data;
}