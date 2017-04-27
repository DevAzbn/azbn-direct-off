'use strict';

var argv = require('optimist').argv;
var Horseman = require('node-horseman');
var cheerio = require('cheerio');
var request = require('request');

//var searchTexts = require('./json/searchtexts.json').items;
var clickUrls = require('./json/clickurls.json').items;
var userAgents = require('./json/useragents.json').items;
var proxies = require('./json/proxies.json').items;
var viewports = require('./json/viewports.json').items;

var click_counter = 0;

//var __base_domain = (argv.domain || '').toLowerCase();

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
	
	var _interval = rand(1 * 1000, 10 * 1000);
	
	setTimeout(function(){
		setNextClick();
	}, _interval);
	
	//nextClick(getRandItem(clickUrls));
	nextClick('http://localhost:3000/');
	
}

var nextClick = function(url_data) {
	
	try {
		
		click_counter++;
		
		var _userAgent = getRandItem(userAgents);
		var _viewport = getRandItem(viewports);
		var _proxy = getRandItem(proxies);
		var _url = {url : 'http://localhost:3000/'};//url_data || getRandItem(clickUrls);
		var _vote = getRandItem([1,2,3]);
		
		var horseman_cfg = {
			timeout : 15000,
			//cookiesFile : './cookies.txt',
			ignoreSSLErrors : true,
			//proxy : specify the proxy server to use address:port, default not set.
			//proxyType : specify the proxy server type [http|socks5|none], default not set.
			//proxyAuth : specify the auth information for the proxy user:pass, default not set.
		};
		
		/*
		if(_proxy) {
			if(_proxy.proxy) {
				horseman_cfg.proxy = _proxy.proxy;
			}
			if(_proxy.proxy) {
				horseman_cfg.proxyAuth = _proxy.proxyAuth;
			}
		}
		*/
		
		var horseman = new Horseman(horseman_cfg);
		
		horseman
			.userAgent(_userAgent)
			.viewport(_viewport.w, _viewport.h);
		
		var r = request.defaults({
			method : 'GET',
			//proxy : 'http://' + _proxy.proxy,
			headers: {
				'User-Agent' : _userAgent,
			},
		});
		
		var _date = new Date().getTime();
		
		horseman
			//.authentication(user, password)
			.log('')
			//.log('---------- generate clicking ' + click_counter + ' ' + _url.url + ' (' + _proxy.proxy + ') ----------')
			.open(_url.url)//
			//.log('after open link')
			.log('vote: ' + _date + ', ' + _vote)
			/*
			.cookies([{
				name: 'test',
				value: 'cookie',
				domain: 'httpbin.org',
			}])
			*/
			.wait(rand(1 * 1000, 5 * 1000))
			.click('.header-menu > .item:nth-child(1) .item:nth-child(' + _vote + ')')
			.screenshot('./tmp/screens/localhost_' + _vote + '_' + _date + '_after_select.png')
			//.click('#aside > div.voting > div > form[name="voteForm"] > button')
			//.screenshot('./tmp/screens/rrunet_' + _date + '_after_select.png')
			//.waitForNextPage()
			//.wait(rand(1000, 3000))
			//.screenshot('./tmp/screens/rrunet_' + _date + '_after_select.png')
			.log('after vote')
			.then(function(res){
				//console.log(res);
				
				horseman
					.log('---------- /generate clicking ----------')
					.log('')
					.close();
				
				return null;//horseman.close();
			});
		
	} catch(e) {
		
		console.log(e);
		
	}
}

setNextClick();
