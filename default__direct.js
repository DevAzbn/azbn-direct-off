'use strict';

var argv = require('optimist').argv;
var Horseman = require('node-horseman');
var cheerio = require('cheerio');
var request = require('request');

var searchTexts = require('./json/searchtexts.json').items;
var userAgents = require('./json/useragents.json').items;
var proxies = require('./json/proxies.json').items;
var viewports = require('./json/viewports.json').items;

var click_counter = 1;

var getRandItem = function(arr) {
	var rand = Math.floor(Math.random() * arr.length);
	return arr[rand];
}

var rand = function(min, max) {
	min = min || 0;
	max = max || 9999999;
	return min + Math.floor(Math.random() * (max + 1 - min));
}

var setNextClick = function() {
	
	var _interval = rand(123456, 345678);
	
	setTimeout(function(){
		setNextClick();
	}, _interval);
	
	nextClick(getRandItem(searchTexts));
	
}

var userActionsOnPage = [
	
	/*
	https://github.com/johntitus/node-horseman#mouseeventtype-x-y-button
	
	.keyboardEvent(type, key, [modifier]) type must be one of 'keyup', 'keydown', or 'keypress', which is the default. key should be a numerical value from this page. For instance, to send an "enter" key press, use .keyboardEvent('keypress',16777221).
	.mouseEvent(type, [x, y, [button]]) type must be one of 'mouseup', 'mousedown', 'mousemove', 'doubleclick', or 'click'
	
	'Up': 16777235,
	'Down': 16777237,
	'PageDown': 16777239,
	'PageUp': 16777238,
	'Home': 16777232,
	'End': 16777233,
	*/
	
	function(horseman, url) {
		
		horseman
			.open(url)
			.log(url)
			.log('page actions')
			.wait(rand(3000, 7000))
			.scrollTo(rand(100, 500), 0)
			.mouseEvent('mousemove', rand(100,777), rand(100,777))
			.wait(rand(500, 2000))
			.mouseEvent('mousemove', rand(100,777), rand(100,777))
			.scrollTo(rand(100, 1000), 0)
			.wait(rand(100, 20000))
			.keyboardEvent('keypress', 16777237)
			.keyboardEvent('keypress', 16777237)
			.keyboardEvent('keypress', 16777237)
			.wait(rand(2000, 4000))
			.keyboardEvent('keypress', 16777237)
			.keyboardEvent('keypress', 16777237)
			.wait(rand(2000, 20000))
			.mouseEvent('mousemove', rand(100,2000), rand(100,3357))
			.wait(rand(2000, 20000))
			.keyboardEvent('keypress', 16777232)
			.mouseEvent('mousemove', rand(100,777), rand(100,777))
			.log('---------- /generate clicking ----------')
			.log('')
			.close()
		;
		
		//return horseman;
		
	},
	
];


var nextClick = function(str) {
	
	var _userAgent = getRandItem(userAgents);
	var _viewport = getRandItem(viewports);
	var _proxy = getRandItem(proxies);
	str = str || getRandItem(searchTexts);
	
	var cfg = {
		timeout : 10000,
		//cookiesFile : './cookies.txt',
		ignoreSSLErrors : true,
		//proxy : specify the proxy server to use address:port, default not set.
		//proxyType : specify the proxy server type [http|socks5|none], default not set.
		//proxyAuth : specify the auth information for the proxy user:pass, default not set.
	};
	
	if(_proxy) {
		if(_proxy.proxy) {
			cfg.proxy = _proxy.proxy;
		}
		if(_proxy.proxy) {
			cfg.proxyAuth = _proxy.proxyAuth;
		}
	}
	
	var horseman = new Horseman(cfg);
	
	horseman
		.userAgent(_userAgent)
		.viewport(_viewport.w, _viewport.h);
	
	var r = request.defaults({
		method : 'GET',
		proxy : 'http://' + cfg.proxy,
		headers: {
			'User-Agent' : _userAgent,
		},
	});
	
	horseman
		//.authentication(user, password)
		.log('')
		.log('---------- generate clicking ' + click_counter + ' ' + str + ' (' + cfg.proxy + ') ----------')
		.open('https://www.yandex.ru/')//'https://yandex.ru/search/?text=окна%20в%20орле&lr=10'
		.log('after open yandex.ru')
		/*
		.cookies([{
			name: 'test',
			value: 'cookie',
			domain: 'httpbin.org',
		}])
		.log()
		.scrollTo(top, left)
		*/
		.wait(rand(2000, 6000))
		.type('.search2__input .input__box .input__control.input__input[name="text"]', str)
		.wait(rand(500, 1500))
		.click('.search2__button button.button')
		.waitForNextPage()
		.log('after load result page')
		//.screenshot('png/' + search_text + '.png')
		.scrollTo(rand(100, 1000), 0)
		.wait(rand(1000, 5000))
		.keyboardEvent('keypress', 16777237)
		.wait(rand(1000, 3000))
		.keyboardEvent('keypress', 16777232)
		.log('before click on selector')
		.scrollTo(rand(100, 1000), 0)
		.waitForSelector('.serp-item.serp-adv-item')
		.evaluate(function(selector){
			//console.log(selector);
			//console.log($(selector).attr('href'));
			
			var links = [];
			var li = $(selector);
			
			li.each(function(index){
				
				var item = $(this);
				
				var l_main = item.find('.organic a.link.organic__url');
				var l_path = item.find('.organic .path.organic__path a.link.path__item');
				
				links.push({
					link : l_main.attr('href'),
					target : l_path.text(),
				});
				
			})
			
			return links;//$(selector).attr('href');
			
		}, '.serp-item.serp-adv-item')
		//.attribute('.serp-item.serp-adv-item .organic a.link.organic__url', 'href')
		.then(function(res){
			//console.log(res);
			
			if(res.length) {
				
				var item = res[0];
				
				r({
					url : item.link,
				}, function(error, response, body){
					
					if (!error) {
						// body is an alias for `response.body`
						//console.log(item.target);
						//console.log(body);
						
						click_counter++;
						
						var $ = cheerio.load(body);
						var url = $('head noscript meta[http-equiv="refresh"]').attr('content');
						url = url.split('URL=')[1];
						url = url.substr(1, url.length - 2);
						
						(getRandItem(userActionsOnPage))(horseman, url);
						
					} else {
						
						console.log(error);
						
						horseman
							.log('---------- /generate clicking ----------')
							.log('')
							.close();
						
					}
					
				});
				
				
			}
			
			return null;//horseman.close();
		});
		/*
		.click('.serp-item.serp-adv-item .organic a.link.organic__url')
		//.log('after click on selector')
		.waitForNextPage()
		//.count('.serp-item.serp-adv-item:nth-child(1) .organic a.link.organic__url')
		//.cookies()
		//.tabCount()
		.switchToTab(1)
		.log('after switch to opened tab')
		.wait(rand(1000, 5000))
		//
		.screenshot('./screens/' + str + '_' + (new Date().getTime()) + '.png')
		.url()
		.then(function(res){
			console.log(res);
			horseman.wait(rand(20000, 120000))
			nextClick(str);
			return horseman.close();
		});
		*/
}

setNextClick();
