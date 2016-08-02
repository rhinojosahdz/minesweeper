//ALL RIGHTS RESERVED
var default_mines = 10;
var default_lines = 10;
var default_columns = 10;
var default_time = 999;

var mines = parseInt(gup('m')) || default_mines;
var lines = parseInt(gup('l')) || default_lines;
var columns = parseInt(gup('c')) || default_columns;
var time = parseInt(gup('t')) || default_time;

var lost = false;
var won = false;
var spots_sweeped = 0;
var number_of_mine_spots = (lines * columns) - mines;
var press_timer, long_touch;//used to keep time on how long the finger clicks the mine (for iOS)

$(function() {
    prepare_config();
    events();
    layout();
    adjust_viewport();
    assign_mines();
    create_timer();
    create_mine_counter();
});

function adjust_viewport() {
    var width = $('#minesweeper').width();
    $('#msg').width(width);
    width += 40;
    $('head').append('<meta name="viewport" content="width=device-width,height=device-height,maximum-scale=1,user-scalable=yes,width=' + width + '" />');
}

function prepare_config() {
    $('#cmines').spinner({
        step: 1,
        min: 1
    });
    $('#clines').spinner({
        step: 1,
        min: 2
    });
    $('#ccolumns').spinner({
        step: 1,
        min: 2
    });
    $('#ctime').spinner({
        step: 5,
        min: 5,
        max: 999
    });

    $('#cmines').val(mines);
    $('#clines').val(lines);
    $('#ccolumns').val(columns);
    $('#ctime').val(time);

    $('#new_game_button').button().click(function() {
        new_game();
    });
}

(function($) {
    var methods = {
        init: function() {
            return this;
        },
        n: function( ) {
            return this.parent().prev().children().eq(this.index());
        },
        s: function( ) {
            return this.parent().next().children().eq(this.index());
        },
        e: function( ) {
            return this.next();
        },
        w: function( ) {
            return this.prev();
        },
        ne: function() {
            return this.s('n').next();
        },
        nw: function() {
            return this.s('n').prev();
        },
        se: function() {
            return this.s('s').next();
        },
        sw: function() {
            return this.s('s').prev();
        },
        is_mine: function() {
            return this.hasClass('mine');
        },
        has_mines_around: function() {
            return !!this.s('mines_around').size();
        },
        number_of_mines_around: function() {
            return this.s('mines_around').size();
        },
        number_of_spots_around: function() {
            return this.s('spots_around').size();
        },
        mines_around: function() {
            var mines = [];
            if (this.s('n').s('is_mine'))
                mines.push(this.s('n'));
            if (this.s('ne').s('is_mine'))
                mines.push(this.s('ne'));
            if (this.s('e').s('is_mine'))
                mines.push(this.s('e'));
            if (this.s('se').s('is_mine'))
                mines.push(this.s('se'));
            if (this.s('s').s('is_mine'))
                mines.push(this.s('s'));
            if (this.s('sw').s('is_mine'))
                mines.push(this.s('sw'));
            if (this.s('w').s('is_mine'))
                mines.push(this.s('w'));
            if (this.s('nw').s('is_mine'))
                mines.push(this.s('nw'));
            return $(mines);
        },
        spots_around: function() {
            var mines = [];
            if (this.s('n').size())
                mines.push(this.s('n'));
            if (this.s('ne').size())
                mines.push(this.s('ne'));
            if (this.s('e').size())
                mines.push(this.s('e'));
            if (this.s('se').size())
                mines.push(this.s('se'));
            if (this.s('s').size())
                mines.push(this.s('s'));
            if (this.s('sw').size())
                mines.push(this.s('sw'));
            if (this.s('w').size())
                mines.push(this.s('w'));
            if (this.s('nw').size())
                mines.push(this.s('nw'));
            return $(mines);
        },
        number_of_mine_spots_around: function() {
            var mines = [];
            if (this.s('n').size() && !this.s('n').s('is_mine'))
                mines.push(this.s('n'));
            if (this.s('ne').size() && !this.s('ne').s('is_mine'))
                mines.push(this.s('ne'));
            if (this.s('e').size() && !this.s('e').s('is_mine'))
                mines.push(this.s('e'));
            if (this.s('se').size() && !this.s('se').s('is_mine'))
                mines.push(this.s('se'));
            if (this.s('s').size() && !this.s('s').s('is_mine'))
                mines.push(this.s('s'));
            if (this.s('sw').size() && !this.s('sw').s('is_mine'))
                mines.push(this.s('sw'));
            if (this.s('w').size() && !this.s('w').s('is_mine'))
                mines.push(this.s('w'));
            if (this.s('nw').size() && !this.s('nw').s('is_mine'))
                mines.push(this.s('nw'));
            return $(mines);
        }
    };

    $.fn.s = function(method) {
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
    };

})(jQuery);

function create_mine_counter() {
    $('#mine_counter').timer({
        auto_start: false,
        numbers: 3,
        starting_value: mines,
        auto_reset: false
    });
}

function create_timer() {
    $('#timer').timer({
        backwards: true,
        starting_value: time,
        number_of_numbers: time.toString().lenght
    }).bind('on_zero', function() {
        lose('Time runned out.');
    });
}

function assign_mine() {
    var c = Math.floor(Math.random() * (lines * columns));
    var s = $('#grid').find('.spot').eq(c);
    if (s.hasClass('mine')) {
        return false;
    }
    s.addClass('mine');
    return true;
}

function assign_mines() {
    for (var i = 0; i < mines; i++) {
        if (!assign_mine()) {
            i--;
        }
    }
}

function layout() {
    var s = $('#templates>.spot').clone(true);
    var l = $('#templates>.line').clone(true);
    var grid = $('#grid');

    for (var i = 0; i < lines; i++) {
        var new_line = l.clone(true);
        grid.append(new_line);
        for (var j = 0; j < columns; j++) {
            var mine_clone = s.clone(true);
            new_line.append(mine_clone);
            /*
             mine_clone.bind('touchend', function(e) {
             var _this = $(e.target);
             _this.removeClass('ui-state-active');
             clearTimeout(press_timer);
             if (_this.children('.ui-icon').size() === 0 && _this.children('.ui-button-icon-primary').text() === '')
             _this.click();
             return false;
             }).bind('touchstart', function(e) {
             press_timer = window.setTimeout(function() {
             var _this = $(e.target);
             _this.addClass('ui-state-active');
             _this.trigger({
             type: 'mousedown',
             which: 3
             });
             }, 1000);
             return false;
             });
             */
        }
    }
}

function change_mine_counter(add) {
    var m = $('#mine_counter');
    m.data('timer').backwards = !add;
    m.timer('update');
}

function new_game() {
    var error = validate_new_game_params();
    if (!error)
        window.location.href = get_new_game_url();
    else
        alert(error);
}

function validate_new_game_params() {
    var error = false;
    var _mines = $('#cmines').val() || mines;
    var _lines = $('#clines').val() || lines;
    var _columns = $('#ccolumns').val() || columns;
    var _time = $('#ctime').val() || time;

    if (_mines > (_lines * _columns))
        error = 'There can\'t be more than ' + (_lines * _columns) + ' mines on the grid.';
    return error;
}

function get_new_game_url() {
    var _mines = $('#cmines').val() || mines;
    var _lines = $('#clines').val() || lines;
    var _columns = $('#ccolumns').val() || columns;
    var _time = $('#ctime').val() || time;
    var url = '';

    if (_mines != default_mines)
        url += 'm='+_mines;
    if (_lines != default_lines)
        url += '&l='+_lines;
    if (_columns != default_columns)
        url += '&c='+_columns;
    if (_time != default_time)
        url += '&t='+_time;

    if(url.length > 0)
        url = '?' + url;
    else
        url = location.pathname;
    return url;
}

function events() {
    $('#face').button({
        icons: {
            primary: 'ui-icon-standby'
        }
    })
            .click(function() {
        new_game();
    })
            .find('.ui-icon')
            .removeClass('ui-icon');

    $('#templates>.spot').button({
        icons: {
            primary: "ui-icon-"
        },
        text: false
    }).click(function() {
        if (won || lost)
            return;
        sweep($(this));
    })
            .s()
            .mousedown(function(e) {
        if (won || lost)
            return;

        var spot = $(this);
        if (spot.hasClass('sweeped'))
            return;
        switch (e.which) {
            case 3://right click
                var img = spot.children('.ui-button-icon-primary');
                if (img.hasClass('ui-icon')) {
                    if (img.hasClass('ui-icon-flag')) {
                        change_mine_counter(true);
                        img.removeClass('ui-icon-flag');
                        img.addClass('ui-icon-help');
                        return;
                    }
                    if (img.hasClass('ui-icon-help')) {
                        img.removeClass('ui-icon');
                        img.removeClass('ui-icon-help');
                        return;
                    }
                }
                else {
                    change_mine_counter();
                    img.addClass('ui-icon');
                    img.addClass('ui-icon-flag');
                    return;
                }
                break;
            case 1://left click
                $('#face').removeClass('standby').addClass('ohh');
                break
        }
    })
            .mouseup(function(e) {
        if (won || lost)
            return;
        var spot = $(this);
        if (!spot.hasClass('mine')) {
            $('#face').removeClass('ohh').addClass('standby');
        }
    })

            .prepend('<div style="height: 9px;"></div>')
            .find('.ui-icon').removeClass('ui-icon');
}

function sweep_all_grid() {
    $('#grid .spot').not('.sweeped').each(function() {
        sweep($(this));
    });
}

function lose(msg_reason) {
    lost = true;
    $('#timer').timer('stop');
    $('#face').removeClass('standby').addClass('lost');
    sweep_all_grid();
    alert('You lost: ' + msg_reason);
}

function sweep(spot) {
    if (spot.hasClass('sweeped')) {
        return;
    }

    spot.addClass('sweeped');
    spot.addClass('ui-state-focus');
    spot.find('.ui-button-icon-primary').removeClass('ui-icon');

    if (spot.s('is_mine')) {
        spot.children('.ui-button-icon-primary').addClass('ui-icon ui-icon-gear');
        if (!lost) {
            spot.addClass('clicked_mine');
            lose('Stepped on a mine.');
            return;
        }
    }
    if (!spot.s('has_mines_around')) {
        $.each(spot.s('spots_around'), function() {
            sweep($(this));
        });
    }
    if (spot.s('has_mines_around')) {
        spot.find('span').text(spot.s('number_of_mines_around'));
    }
    if (!lost) {
        spots_sweeped++;
        if (spots_sweeped === number_of_mine_spots) {
            won = true;
            $('#timer').timer('stop');
            lost = true;
            sweep_all_grid();
            lost = false;
            $('#face').removeClass('standby').addClass('won');
            alert('You won!!!');
        }
    }
}

function gup(name) {
    return getUrlParameter(name);
}

function getUrlParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
}