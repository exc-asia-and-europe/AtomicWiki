/* only call galleria, if our target container exists */
if ($('.galleria').length !== 0) {
    
    Galleria.loadTheme('resources/scripts/galleria/themes/classic/galleria.classic.js');
    
    Galleria.configure({
        transition: 'fade',
        imageCrop: false,
        easing: 'galleriaOut',
        carousel: true,
        carouselSteps: 'auto',
        carouselSpeed: 1234,
        imagePosition: 'center center',
        trueFullscreen: true,
        keepSource: true,
        idleTime: 1234
        //lightbox: true
    });
            
            
    Galleria.ready(function() {
        var self = this; // galleria is ready and the gallery is assigned
        
        // store our master container (.galleria)
        var my_container = self.$("container").parent();
        
        self.addElement('fscr');
        // appends the element to a container
        self.appendChild('stage','fscr');

        self.$('fscr').click(function() {
            self.toggleFullscreen(); // toggles the fullscreen
        });
                
        self.addElement('splay');
        // appends the element to the container
        self.appendChild('image-nav','splay');
        /*
        self.addElement('meta-block');
        self.appendChild('container','meta-block');
        */
                
        self.$('splay').click(function() {
            //self.setPlaytime(4000);
            self.playToggle();
        });
                
        self.addIdleState(self.get('thumbnails'), {
            opacity: 0
        });
                
        self.addIdleState(self.get('image-nav'), {
            opacity: 0
        });
        
        // self.addIdleState(self.get('fscr'), {
        //     opacity: 0
        // });
              
        // self.addIdleState(self.get('info-link'), {
        //     opacity: 0
        // });
             
        // self.addIdleState(self.get('thumb-nav-left'), {
        //     opacity: 0
        // });
                
        // self.addIdleState(self.get('thumb-nav-right'), {
        //     opacity: 0
        // });

                
        /* togle playbutton to indicate the current slideshow status */
        self.bind("play", function(e) {
            self.$("splay").css('background-image','url("resources/scripts/galleria/themes/classic/pause_b.png")');
        });
        self.bind("pause", function(e) {
            self.$("splay").css('background-image','url("resources/scripts/galleria/themes/classic/play_w.png")');
        });
        
        /*
        self.bind("idle_exit", function(e) {
            self.removeIdleState(self.get('info'));
        });
        */
        
        
        self.bind("idle_enter", function(e) {
            self.$("info-link").fadeOut(100);
            self.$("fscr").fadeOut(100);
        });
        self.bind("idle_exit", function(e) {
            self.$("info-link").fadeIn(300);
            self.$("fscr").fadeIn(300);
        });
        
                
        var info = self.$('info-link,info-close,info-text');
        
        function fixInfoHeight (option) {
            if (option) {
                self.resize();
            }
            var my_h = self.$("stage").height();
            self.$("info").height(my_h - 100);
            self.$("info-link").height(my_h - 100);
            self.$("info-text").height(my_h - 110);
        } 
        
        self.bind("fullscreen_enter", function(e) {
            if (!!self.getData(0)[ "description" ]) {
                self.$('info-link').removeClass('galleria-info-link-active');
                self.$('info-link').click();
            }
            fixInfoHeight(false);
        });
        
        self.bind("fullscreen_exit", function(e) {
            fixInfoHeight(true);
        });
        
        /*
        self.bind("rescale", function(e) {
            //self.resize();
            console.log("rescale done");
        });
        */
        
        self.$('info-link').bind( 'click',function(e) {
            if( ! self.$('info-link').hasClass('galleria-info-link-active')){
                self.$('info-link').addClass('galleria-info-link-active');
                
                self.$('info').stop().animate({"left":"15px"}, 400, function() {
                    self.$('info').css({"left":"15px"});
                    self.$('stage').stop().animate({"margin-left":"360"}, 400, function() {
                        self.resize();
                    });
                });
            } else {
                self.$('info-link').removeClass('galleria-info-link-active');

                self.$('info').stop().animate({"left":"-320px"}, 400, function() {
                    self.$('info').css({"left":"-320px"});
                    self.$('stage').stop().animate({"margin-left":"0"}, 400, function() {
                        self.resize();
                    });
                });
            }
        });
        
        // self.bind('thumbnail', function(e) {
        //     $(e.thumbTarget).hover(self.proxy(function() {
        //         self.setInfo(e.index); // sets the caption to display data from the hovered image
        //         self.setCounter(e.index); // sets the counter to display the index of the hovered image
        //     }, self.proxy(function() {
        //         self.setInfo(); // reset the caption to display the currently active data
        //         self.setCounter(); // reset the caption to display the currently active data
        //     })));
        // });
        
        // self.bind('thumbnail', function(e) {
        //     $(e.thumbTarget).mouseout(self.proxy(function() {
        //         self.setInfo(); // sets the caption to display data from the hovered image
        //         self.setCounter(); // sets the counter to display the index of the hovered image
        //         //self.setIndex(e.index);
        //     }));
        // });
        
        // self.bind('thumbnail', function(e) {
        //     var desc = self.getData( e.index ).description;
        //     if (desc) {
        //         self.bindTooltip( e.thumbTarget, desc );
        //     }
        // });
        
        /* show infotext on startup */
        //console.log("%o",self.getData( 0 ));
        if (!!self.getData(0)[ "description" ]) {
            //console.log(self.getData( 0 )[ "description" ]);
            self.$('info-link').click();
        }
        
        if (self.getData(0)[ "conf_autoplay" ] == "on") {
            //self.setOptions('autoplay',parseInt(self.getData(0)[ "conf_intervall" ]));
            self.setPlaytime(self.getData(0)[ "conf_intervall" ]);
            self.playToggle();
        } else {
            self.setOptions('autoplay',false);
        }
        
        // resize our master-container using customn settings for width and height
        my_container.css({
            "width": parseInt(self.getData(0)[ "conf_width" ].replace("px", "")) + "px",
            "height": parseInt(self.getData(0)[ "conf_height" ].replace("px", "")) + "px"
        });
        
        //self.resize();
        fixInfoHeight(true);
        
        if (self.getData(0)[ "conf_align" ]) {
            self.setOptions({
                 imagePosition: "center " + self.getData(0)[ "conf_align" ],
            }).refreshImage();
        }
                
    }); /* end of: Galleria.ready() */
    
    /* here we go. fire up galleria */
    Galleria.run('.galleria', {
        dataConfig: function(img) {
            var data = {
                thumb: $(img).attr('src'),
                image: $(img).parent().attr('href'),
                big: $(img).attr('data-big'),
                //title: $(img).parent().siblings('.title').html(),
                //title: $(img).parent().siblings(".description").html(),
                description: $(img).parent().siblings(".description").html(), // tell Galleria to grab the content from the .description div as caption
                
                conf_autoplay: $(img).parent().parent().parent().siblings("span[data-name='conf_autoplay']").filter(":first").eq(0).attr('data-value'),
                conf_intervall: $(img).parent().parent().parent().siblings("span[data-name='conf_intervall']").filter(":first").eq(0).attr('data-value'),
                conf_width: $(img).parent().parent().parent().siblings("span[data-name='conf_width']").filter(":first").eq(0).attr('data-value'),
                conf_height: $(img).parent().parent().parent().siblings("span[data-name='conf_height']").filter(":first").eq(0).attr('data-value'),
                conf_align: $(img).parent().parent().parent().siblings("span[data-name='conf_align']").filter(":first").eq(0).attr('data-value')
            };
            return data;
        }
    });
            
} /* end of: ($('.galleria').length != 0) */
        // extend:
        
            