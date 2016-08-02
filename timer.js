(function($) {

    //add css
    $(function() {
        var css = '<style type="text/css">\n\
                .timer_number_holder{\n\
                        font-size: 45px;\n\
                        }\n\
                <\style>';
        $('head').append(css);
    });
    //\add css

    var methods = {
        init: function(settings) {
            var _this = this;
            var _settings = $.extend({
                backwards: false,
                starting_value: 0,
                numbers: 3,
                auto_start: true,
                interval: 1000,
                auto_reset: true,
                stop_at_zero: true
            }, settings);
            var tmpl_number = $('<span class="ui-widget-header timer_number_holder"></span>');

            _this.data('timer', _settings);
            for (var i = 0; i < _settings.numbers; i++) {
                var number = tmpl_number.clone(true);
                var starting_value = _settings.starting_value;
                var numbers = _settings.numbers;
                while (true)
                    if (starting_value.toString().length < numbers) {
                        starting_value='0'+starting_value;
                    }
                    else
                        break;
                var value = starting_value.toString().charAt(numbers - i - 1) | 0;
                number.text(value);
                _this.prepend(number);
            }
            if (_settings.auto_start) {
                this.timer('start');
            }

            //events
            $(window).bind('timer.on_zero');
            //\events

            return this;
        },
        update: function(number_holder) {
            if (!number_holder) {
                number_holder = this.find('.timer_number_holder').last();
            }
            var v = parseInt(number_holder.text());
            if (this.data('timer').backwards) {
                v--;
                if (v == -1) {
                    number_holder.text('9');
                    this.timer('update', number_holder.prev(), true);
                }
                else {
                    number_holder.text(v);
                }
            }
            else {
                v++;
                if (v == 10) {
                    number_holder.text('0');
                    this.timer('update', number_holder.prev());
                }
                else {
                    number_holder.text(v);
                }
            }
            if (this.timer('get_value') === 0) {
                this.trigger('on_zero');
                if (this.data('timer').stop_at_zero) {
                    this.timer('stop');
                }
            }
            return this;
        },
        get_value: function() {
            return parseInt(parseFloat(this.timer('get_string')));
        },
        get_string: function() {
            return this.find('.timer_number_holder').text();
        },
        stop: function() {
            window.clearInterval(this.data('timer')._interval_id);
            return this;
        },
        start: function() {
            var last_number_holder = this.find('.timer_number_holder').last();
            var settings = this.data('timer');
            var _this = this;
            _this.data('timer')._interval_id = window.setInterval(function() {
                _this.timer('update', last_number_holder);
            }, settings.interval);
            return this;
        }
    };

    $.fn.timer = function(method) {
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
    };

})(jQuery);