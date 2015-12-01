/**
 * START PLUGINS *
 */
/**
 * Copyright 2011, Dave Rupert http://daverupert.com
 * https://github.com/davatron5000/FitText.js/blob/master/jquery.fittext.js
 * @param kompressor
 * @param options
 * @return {*}
 */
$.fn.fitText = function( kompressor, options ) {

    // Setup options
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

    return this.each(function(){

      // Store the object
      var $this = $(this);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call once to set.
      resizer();

      // Call on resize. Opera debounces their resize by default.
      $(window).on('resize.fittext orientationchange.fittext', resizer);

    });

  };

/**
 * START CUSTOM JAVASCRIPT *
 */
Utility = function()
{
    this.clearForm = function($form)
    {
        $(":input",$form)
            .not('[type="submit"]')
            .not('[type="button"]')
            .each(function(){
                var inpt = $(this);

                if(inpt.is(":checkbox")){
                    inpt.prop('checked',false);
                }else if(inpt.is(":radio")){
                    inpt.prop('selected',false);
                }else{
                    inpt.val('');
                }
            });
    }

    this.outLinks = function($links)
    {
        $links.each(function(){
           $(this).attr('target','_blank');
        });
    }

    this.cancelLinks = function($links)
    {
        $links.on('click',function(e){
            e.preventDefault();
        });
    }
}

Contact = function(app){

    this.checkContactHash = function()
    {
      //Auto Trigger Contact Dropdown from hash
      if(typeof window.location.hash != 'undefined'
        && (window.location.hash == 'contact' || window.location.hash == '#contact')){

      }
    }

    function processEmailForm(form)
    {
        form.addClass('processing');

        $.ajax({
            url:'/contact/send',
            type: 'POST',
            data: form.serialize(),
            success: function(d)
            {
                var result = jQuery.parseJSON(d);

                if(result.success)
                    formSuccess(form);
                else
                    formError(form,result.view);
            }
        });
    }

    function formSuccess(form)
    {
        app.utility.clearForm(form);
        form.removeClass('processing');
        form.addClass('success');
        setTimeout(function(){
            form.removeClass('success');
        },2000);
    }

    function formError(form, html)
    {
        form.removeClass('processing');
        form.replaceWith($('form',html));
    }

    //Toggles icon color
    $(".contact-form input, .contact-form textarea").blur(function(){
        $(this).parent(".faux-input").find("i").removeClass("active");
    });

    $('.contact-form input, .contact-form textarea').focus(function(){
        $(this).parent(".faux-input").find("i").addClass("active");
    });

    $("body").on('click','.pop-down-handle',function(e){
        e.preventDefault();

        var $handle = $(this),
            $contactWrap = $(".contact-wrap"),
            $overlay = $('.contact-modal-backdrop');

        if($contactWrap.hasClass('open')){
            $contactWrap.removeClass('open');
            $handle.removeClass('active');
            $overlay.fadeOut();
        }else{
            $contactWrap.addClass('open');
            $handle.addClass('active');
            $overlay.fadeTo('fast',0.7);
        }
    });

    $('body').on('click','.contact-block form input[type="submit"]',function(e){
        e.preventDefault();
        var $btn = $(this),
            form = $btn.closest('form');

        processEmailForm(form);
    });

    $('body').on('focus','.contact-block form :input',function(){
        var $el = $(this),
            $con = $el.closest('div'),
            $error = $('.errorMessage',$con);

        $error.fadeOut();
    });

    $('body').on('click','[href="#contact"]',function(e){

    });
}

Triggers = function(){

    var triggers = this;

    (function(){
        $('body').on('click','[data-event]',function(e){
            var $el = $(this);

            if(typeof $el.data('event') != 'undefined' && $el.data('event').length > 0){
                e.preventDefault();
            }

            if(typeof triggers.actions[$el.data('event')]=='function'){
                triggers.actions[$el.data('event')]($el);
            }
        });
    })();

    this.actions = {
        scrollto:function($el){
            var anchor = $el.attr('href').split('#');
            if($("#"+anchor[1]).length > 0){
                var top = ($("#"+anchor[1]).offset().top.toFixed(0))+'px';
                $('html, body').animate({
                    scrollTop:top
                },2000);
            }
        },
        animateNumber:function($el){
            var end = parseFloat($el.data('end')),
                increment = $el.data('increment');

            var id = setInterval(function(){
                var num = parseFloat($el.text());

                if(num < end)
                    $el.text(num + increment)
                else
                    clearInterval(id);
            },300);
        },
        showCaseStudy: function($el)
        {
            var $cases      = $('.case-study','.case-study-wrap'),
                $new_case   = $($el.attr('href')),
                $blocks     = $('a','.case-study-blocks');

            if($new_case.length){
                $cases.removeClass('active');
                $new_case.addClass('active');

                $blocks.removeClass('current');
                $el.addClass('current');

                $('html, body').animate({scrollTop:$new_case.offset().top}, 'slow');

            }
        },
        toggleCareers: function($el)
        {
            var activeClass = 'collapsed',
                $parent = $el.closest('.accordion-group'),
                $parentGroup = $('.accordion-group').not($parent),
                method = $parent.hasClass(activeClass) ? 'removeClass' : 'addClass';

            $parent[method](activeClass);
            $parentGroup.addClass(activeClass);
        },
        checkEmail: function($el){

            var $form = $el.closest('form')
                ,$input = $('.email', $form);

            if($input.length && $input.val() != '')
                $form.submit();
            else{
                $('#mce-error-response').empty()
                    .text('Please Enter a Valid Email!')
                    .show();
            }
        }
    }
}

SpamlessEmail = {
    init: function(){
        this.render()
    },
    render: function(){

        var $emails = $('[data-email]');

        if($emails.length){

            $emails.each(function(){
                var $el = $(this);

                if($el.data('site')){
                    $el.text( $el.data('email') + '@' + $el.data('site') );
                }
            })
        }
    }
}

ScrollAnimation = function(events){

    var scrolly = this;
    scrolly.positions = [];
    scrolly.bindEvent = function(position,$el,callback)
    {
        scrolly.positions[position]={
            element:$el,
            event:callback
        };
    }

    $("[data-scroll-trigger]").each(function(){
        var $el = $(this),
            event = $el.data('scrollTrigger');

        if(typeof events[event] !='undefined'
            && typeof events[event] == 'function'){
            scrolly.bindEvent(
                $el.offset().top.toFixed(0),
                $el,
                events[event]
            );
        }
    });

    $(window).scroll(function(){
        var $win = $(window),
            top = $win.scrollTop(),
            margin = $win.height();
        for(var pos in scrolly.positions){
            if((pos - margin )< top){
                scrolly.positions[pos].event(scrolly.positions[pos].element);
                scrolly.positions.splice(pos,1);
            }
        }
    });
}

OutliningEvents = function(){


    (function(){

        $('[href="contacts"]').on('click',function(e){
            e.preventDefault();
            $('.pop-down-handle').trigger('click');
        });

        //Set fittext
        if($(window).width() < 768)
            $('h1 span.main').fitText(.5, { maxFontSize:'155px'});


        $('.employee figure img').on('dblclick', function(){
          var $el = $(this);

          $el.attr('data-original-src', $el.attr('src'));
          $el.attr('src', $('#peanut').attr('src'));
        });

        $('.employee figure img').on('mouseleave', function(){
          var $el = $(this),
              src = $el.attr('data-original-src');

          $el.attr('src', src);
        });

        $(window).on('resize', function(){
            if($(window).width() < 768)
                $('h1 span.main').fitText(.5, { maxFontSize:'155px'});
        });

    })();


    return this;
}

StickyCta = function() {
    $(document).scroll(function() {
        var y = $(this).scrollTop();
        if (y > 86) {
            $('.fixed-cta').fadeIn();
        } else {
            $('.fixed-cta').fadeOut();
        }
    });
}

WideOpenTech = function(){

    var app = this;

    //Build App
    app.utility = new Utility();
    app.triggers = new Triggers();
    app.contactBlock = new Contact(app);
    app.scrolly = new ScrollAnimation(app.triggers.actions);
    app.outliners = new OutliningEvents();
    app.sticky_cta = new StickyCta();

    //Bind Events
    app.utility.outLinks($('[data-ui="outLinks"]'));
    app.utility.cancelLinks($('[data-ui="noLink"]'));

    //Check Contact Deep Link
    app.contactBlock.checkContactHash();

    SpamlessEmail.init();

    return app;
};