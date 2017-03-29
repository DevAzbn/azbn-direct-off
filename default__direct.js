'use strict';

var argv = require('optimist').argv;
var Horseman = require('node-horseman');
var needle = require('needle');
var cheerio = require('cheerio');

var searchTexts = require('./json/searchtexts.json').items;
var userAgents = require('./json/useragents.json').items;
var proxies = require('./json/proxies.json').items;
var viewports = require('./json/viewports.json').items;


var getRandItem = function(arr) {
	var rand = Math.floor(Math.random() * arr.length);
	return arr[rand];
}

var rand = function(min, max) {
	min = min || 0;
	max = max || 9999999;
	return min + Math.floor(Math.random() * (max + 1 - min));
}

var nextClick = function(str) {
	
	var _userAgent = getRandItem(userAgents);
	var _viewport = getRandItem(viewports);
	//var _proxy = getRandItem(proxies);
	str = str || getRandItem(searchTexts);
	
	var cfg = {
		//cookiesFile : './cookies.txt',
		ignoreSSLErrors : true,
		//proxy : specify the proxy server to use address:port, default not set.
		//proxyType : specify the proxy server type [http|socks5|none], default not set.
		//proxyAuth : specify the auth information for the proxy user:pass, default not set.
	};
	
	var horseman = new Horseman(cfg);
	
	horseman
		.userAgent(_userAgent)
		.viewport(_viewport.w, _viewport.h);
	
	needle.defaults({
		open_timeout : 60000,
		user_agent : _userAgent
	});
	
	horseman
		//.authentication(user, password)
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
		.log('after type in input: ' + str)
		.wait(rand(500, 1500))
		.log('before click on button')
		.click('.search2__button button.button')
		.waitForNextPage()
		.log('after load result page')
		//.screenshot('png/' + search_text + '.png')
		.scrollTo(rand(100, 1000), 0)
		.wait(rand(1000, 5000))
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
				
				needle.get(item.link, function(error, response, body) {
					if (!error) {
						// body is an alias for `response.body`
						//console.log(item.target);
						//console.log(body);
						
						var $ = cheerio.load(body);
						var url = $('head noscript meta[http-equiv="refresh"]').attr('content');
						url = url.split('URL=')[1];
						url = url.substr(1, url.length - 2);
						
						horseman
							.open(url)
							.log(url)
							.wait(rand(1000, 3000))
							.scrollTo(rand(100, 1000), 0)
							.wait(rand(500, 2000))
							.scrollTo(rand(100, 1000), 0)
							.close();
						
					} else {
						
						console.log(error);
						
						horseman
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

nextClick(getRandItem(searchTexts));


/*
needle.get('ifconfig.me/all.json', function(error, response, body) {
	if (!error) {
		// body is an alias for `response.body`
		console.log(body.ip_addr); // that in this case holds a JSON-decoded object.
	}
});
*/