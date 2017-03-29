'use strict';

var userAgents = require('./useragents.json');

var getRandItem = function(arr) {
	
	var rand = Math.floor(Math.random() * arr.length);
	
	return arr[rand];
	
}


console.log(getRandItem(userAgents.items));