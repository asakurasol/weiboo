var Weiboo = function(id, text){
    this.id = id;
    this.text = text;
};

var weibooPosts = [];
var texts = [];
var urls = [];

var casper = require('casper').create({clientScripts: ['jquery-2.1.1.min.js'],    pageSettings: {
        loadImages:  true,        // The WebPage instance used by Casper will
        loadPlugins: false         // use these settings
    },
    logLevel: "info",              // Only "info" level messages will be logged
    verbose: true });
casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');

casper.start('http://www.weibo.com/login?lang=en-us', function() {
});

casper.waitUntilVisible('div.username',function() {
    this.fillSelectors('div.username', {
        'input[name="username"]':    ''
    }, false);
    this.fillSelectors('div.password', {
        'input[name="password"]':    ''
    }, true);
    casper.wait(1000);
});

casper.then(function(){
    this.click('div.W_login_form a.W_btn_g');
})

casper.waitWhileSelector('div.slogan', 
	function() {
    	this.echo('.slogan is no more!');
	},
	function() {
	},1000*60
);
casper.then(function(){
    var weibooPosts = [];
    casper.open('http://hot.weibo.com/hour?v=9999').then(function() {
        casper.wait(4000);
        //get the text for each post
  /*      var result = this.evaluate(function(){
            var returnResult = [];

            $(".WB_text").each(function(item){
                returnResult.push($(this).text());
            });

            return returnResult;
        });

        for(var i = 0; i < result.length; i++){
            var weiboo = new Weiboo(i, result[i]);
            weibooPosts.push(weiboo);
            this.echo(weiboo.text);
        };*/
    });
});

//click on each post to expand
casper.then(function(){
    for(var i = 1; i < 20; i++){
        if(this.exists('div.WB_feed .WB_feed_type:nth-child('+2*i+') .WB_handle a:last-child'))
        {this.click('div.WB_feed .WB_feed_type:nth-child('+2*i+') .WB_handle a:last-child')};
    };
    this.wait(5000);
});

//get the url for each post

casper.then(function(){
    urls = this.evaluate(function(){
        var returnResult = [];

        $("p.more a").each(function(item){
            returnResult.push($(this).attr('href'));
        });

        return returnResult;
    });
    urls.pop();
    for(var i = 0; i < urls.length; i++){
        this.echo(urls[i]);
    };
});

var scrape = function(postId){
    casper.open(urls[postId]).then(function(){
        this.wait(2000);
        if(this.exists('.tab_b a:nth-child(3)'))
            {this.click('.tab_b a:nth-child(3)')};    
        this.wait(500);
        this.capture('post'+postId+'.png');
        var id = postId;
        var text = this.evaluate(function(){
            return $('.WB_text p').text();
        });

        var comments = this.evaluate(function(){
            var returnResult = [];

            $(".comment_list dd").each(function(item){
                returnResult.push($(this).clone()    //clone the element
                    .children() //select all the children
                    .remove()   //remove all the children
                    .end()  //again go back to selected element
                    .text().trim());
            });

            return returnResult;
        });

        var imageUrl =  this.evaluate(function(){
            return $('.artwork_box img').attr('src');
        });

        if(imageUrl){
            casper.download(imageUrl, 'pic'+postId+'.gif');
        };
    });
};

casper.then(function(){
    scrape(0);
});

casper.then(function(){
    scrape(1);
});

/*
casper.then(function(){
    scrape(2);
});
casper.then(function(){
    scrape(3);
});
casper.then(function(){
    scrape(4);
});
casper.then(function(){
    scrape(5);
});
casper.then(function(){
    scrape(6);
});
casper.then(function(){
    scrape(7);
});
casper.then(function(){
    scrape(8);
});
casper.then(function(){
    scrape(9);
});*/

casper.run(function() {
    this.echo('finished');
    this.capture('logged_in.png');
    this.exit();}
);