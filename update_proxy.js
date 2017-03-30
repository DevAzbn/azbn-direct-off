'use strict';

var cfg = {
	proxy_timeout : 500,
};

var fs = require('fs');
var taskqueue = require('azbn-task-queue');

var request = require('request').defaults({
	url : 'http://ifconfig.co/json',
	method : 'GET',
	//gzip : true,
	timeout : 5000,
	headers: {
		'User-Agent' : 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36 AzbNodeEdition',
	},
	//
});

var proxies = fs.readFileSync('./tmp/proxies_list.txt', 'utf8').toString().replace(/\r/ig, '').split('\n');

var result = require('./json/proxies.json');

if(proxies.length) {
	
	for(var i in proxies) {
		
		(function(proxy){
			
			if(proxy != '') {
				
				taskqueue
					.add(function(afterTask){
						
						var __is_request = new Date().getTime();
						
						console.log('Checking...', proxy);
						
						request({
							proxy : 'http://' + proxy,
						}, function(error, response, body){
							
							__is_request = 0;
							
							if (!error) {
								
								if(response.headers['content-type']) {
									
									var _type = response.headers['content-type'];
									
									if(_type.toLowerCase() == 'application/json') {
										
										try {
											
											var info = JSON.parse(body);
											console.log('**********', 'Good proxy:', proxy, info.ip);
											
											result.items.push({
												proxy : proxy,
											});
											
											//fs.writeFileSync('./json/proxies.json', JSON.stringify(result));
											
											afterTask(proxy);
											
										} catch(e) {
											
											//console.log(e);
											
											afterTask(e);
											
										}
										
									} else {
										
										console.log('Not JSON:', proxy, _type.toLowerCase());
										
										afterTask(_type);
										
									}
									
								} else {
									
									afterTask(response);
									
								}
								
							} else {
								
								//console.log(error);
								
								if(error.connect === true) {
									console.log('Error, but connected to', proxy);
								}
								
								afterTask(error);
								
							}
							
						});
						
						while(new Date().getTime() < (__is_request + 333)) {}
						
						__is_request = 0;
						
						afterTask(null);
						
					}, 192, function(res){
						
						
						
					});
				
			} else {
				
				
				
			}
			
		})(proxies[i]);
		
	}
	
}