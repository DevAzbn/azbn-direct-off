'use strict';

var needle = require('needle');
var proxies = require('./json/proxies.json').items;

needle.defaults({
	open_timeout: 15000,
	//user_agent: 'MyApp/1.2.3'
});

if(proxies.length) {
	
	for(var i in proxies) {
		
		var proxy = proxies[i];
		
		
		
	}
	
}