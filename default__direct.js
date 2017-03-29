'use strict';

var argv = require('optimist').argv;
var Horseman = require('node-horseman');

/*
search = строка, окна в орле
//count = число запросов, 1
withProxy = использовать прокси, да/нет
*/

var search_text = argv.search || 'окна в орле';


var userAgents = [
	'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 YaBrowser/17.3.1.840 Yowser/2.5 Safari/537.36',
];

var proxies = [
	{
		proxy : 'address:port',
		proxyAuth : 'user:pass',
	},
];

var viewports = [
	{
		w : 1024,
		h : 768,
	},
];


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
	
	var cfg = {
		//cookiesFile : './cookies.txt',
		ignoreSSLErrors : true,
	};
	
	var horseman = new Horseman(cfg);
	
	horseman
		.userAgent(_userAgent)
		.viewport(_viewport.w, _viewport.h);
	
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
		.wait(rand(1000, 5000))
		.log('before click on selector')
		.waitForSelector('.serp-item.serp-adv-item .organic a.link.organic__url')
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
	
}

nextClick(search_text);
