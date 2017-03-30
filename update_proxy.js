'use strict';

var cfg = {
	proxy_timeout : 700,
};

var argv = require('optimist').argv;
var fs = require('fs');
var async = require('async');

var request = require('request').defaults({
	url : 'http://ifconfig.co/json',
	method : 'GET',
	//gzip : true,
	timeout : cfg.proxy_timeout,
	headers: {
		'User-Agent' : 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36 AzbNodeEdition',
	},
	//
});

var proxylist = './tmp/proxylists/' + (argv.list || 'default.txt');

var proxies = fs.readFileSync(proxylist, 'utf8').toString().replace(/\r/ig, '').split('\n');

var result = require('./json/proxies.json');

if(proxies.length) {
	
	var async_arr = [];
	
	for(var i in proxies) {
		
		(function(proxy){
			
			if(proxy != '') {
				
				async_arr.push(function(callback){
					
					console.log('Checking...', proxy);
					
					request({
						proxy : 'http://' + proxy,
					}, function(error, response, body){
						
						if (!error) {
							
							if(response.headers['content-type']) {
								
								var _type = response.headers['content-type'];
								
								if(_type.toLowerCase() == 'application/json') {
									
									try {
										
										var info = JSON.parse(body);
										console.log('**********', 'Good proxy:', proxy, info.ip);
										
										result.items.push({
											proxy : proxy,
											info : info,
										});
										
										fs.writeFileSync('./json/proxies.json', JSON.stringify(result));
										
										callback(null, null);
										
									} catch(e) {
										
										//console.log(e);
										
										callback(null, null);
										
									}
									
								} else {
									
									//console.log('Not JSON:', proxy, _type.toLowerCase());
									
									callback(null, null);
									
								}
								
							} else {
								
								callback(null, null);
								
							}
							
						} else {
							
							//console.log(error);
							
							if(error.connect === true) {
								//console.log('Error, but connected to', proxy);
							}
							
							callback(null, null);
							
						}
						
					});
					
				});
				
			}
			
		})(proxies[i]);
		
	}
	
	async.series(async_arr, function (__err, __results) {
		
	});
	
}