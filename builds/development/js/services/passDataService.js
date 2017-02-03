(function(){
 'use strict';

 meetingsApp.service('passDataService', function() {

    var productList = [];

    var addProduct = function(newObj) {
        productList = [];
        productList.push(newObj);
    };

    var getProducts = function(){
        return productList;
    };

    return {
      addProduct: addProduct,
      getProducts: getProducts
    };
 });
}());
