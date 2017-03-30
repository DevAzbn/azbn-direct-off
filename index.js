var Horseman = require('node-horseman');
var horseman = new Horseman();

horseman
	.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
	.viewport(1024,768)
	.open('http://www.yandex.ru/')
	.screenshot('infoorel.ru.png')
	//.html('.HeaderNews a strong', 'infoorel.ru.txt')
	.pdf('infoorel.ru.pdf', {
		format: 'A3',
		orientation: 'landscape',
		margin: '0px'
	})
	.attribute('.index-news-slider-desc h2 a', 'href')
	.then(function(str){
		console.log(str);
		horseman.close();
	});