'use strict';

var cfg = {
	proxy_timeout : 500,
};

var fs = require('fs');
var taskqueue = require('azbn-task-queue');
var net = require('net');

var proxies = fs.readFileSync('./tmp/proxies_list.txt', 'utf8').toString().replace(/\r/ig, '').split('\n');

var result = require('./json/proxies.json');

if(proxies.length) {
	
	for(var i in proxies) {
		
		(function(proxy){
			
			if(proxy != '') {
				
				taskqueue
					.add(function(afterTask){
						
						var __proxy = proxy.split(':');
						
						var socket = net.createConnection(80, 'yandex.ru');
						
						socket.setTimeout(5);
						
						socket.on('connect', function(){
							console.log('*****', proxy, ': good proxy');
							afterTask(null);
						});
						
						socket.on('timeout', function(){
							console.log('     ', proxy, ': bad proxy');
							socket.end();
							afterTask(null);
						});
						
					}, 192, function(res){
						
						
						
					});
				
			} else {
				
				
				
			}
			
		})(proxies[i]);
		
	}
	
}