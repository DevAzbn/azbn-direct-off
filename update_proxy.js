'use strict';

var needle = require('needle');
//var proxies = require('./json/proxies.json').items;
var fs = require('fs');

var proxies = fs.readFileSync('./tmp/proxies_list.txt', 'utf8').toString().replace(/\r/ig, '').split('\n');

needle.defaults({
	open_timeout: 15000,
	//user_agent: 'MyApp/1.2.3'
});

var result = {
	items : [],
}

if(proxies.length) {
	
	for(var i in proxies) {
		
		(function(proxy){
			
			if(proxy != '') {
				
				needle.get('http://ifconfig.co/json', {
					proxy : proxy,
				}, function(error, response, body) {
					
					console.log('Checking...', proxy);
					
					if (!error) {
						
						var _type = response.headers['content-type'];
						
						if(_type) {
							
							if(_type.toLowerCase() == 'application/json') {
								
								try {
									
									var info = JSON.parse(body);
									console.log('**********', 'Good proxy:', proxy, info.ip);
									
									result.items.push({
										proxy : proxy,
									});
									
									fs.writeFileSync('./json/proxies.json', JSON.stringify(result));
									
								} catch(e) {
									
									//console.log(e);
									
								}
								
							} else {
								
								console.log('Not JSON:', proxy, _type.toLowerCase());
								
							}
							
						}
						
					} else {
						
						//console.log(error);
						
					}
					
				});
				
			}
			
		})(proxies[i]);
		
	}
	
}