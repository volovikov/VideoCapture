var Tips = function(options) {
    var that = this,
        options = options || {};

    this.Init = function(callback) {
        var InnerElementSearch = function(callback) {                
            that.me = $($.find('.Tips'));
            that.link = $($.find('.TipsLink'));
            callback(false);
        }
        var InnerElementValidate = function(callback) {
            if (that.me.length == 0) {
                return callback(true);
            } else if (that.link.length == 0) {
                return callback(true);
            } else if (that.me.length !== that.link.length) {
                return callback(true);
            } else {
                return callback(false);
            }
        };
        var InnerElementSetHandler = function(callback) {
            that.me.find('.Close').click(function(event) {
                that.OnClickTipClose($(this).parents('.Tips'), that);
                event.stopPropagation();
            });  
            that.link.click(function(event) {
                that.OnClickTipToggle($(this), $(this).find('.Tips'), that);
            });
            callback(false);
        };
        InnerElementSearch(function(err) {
            if (!err) {
                InnerElementValidate(function(err) {
                    if (!err) {
                        InnerElementSetHandler(function(err) {
                            callback(err);
                        });
                    } else {
                        callback(true);
                    }                    
                });
            } else {
                callback(true);
            }
        });        
    };
    this.Reset = function() {
        that.Init(function(err) {
            that.initResults = !err;
            that.OnLoad();
        });        
    };
    this.IsOpen = function(tip) {
        return tip.hasClass('Open') ? true : false;
    };
    this.OnClickTipClose = function(tip, tips) {
        if (tips.IsOpen(tip)) {
            tips.Close(tip);
        }
    };
    this.Close = function(tip) {
        tip.removeClass('Open').addClass('Close');
    };
    this.Open = function(tip) {
        tip.removeClass('Close').addClass('Open');
    };
    this.OnClickTipToggle = function(link, tip, tips) {
        if (tips.IsOpen(tip)) {
            tips.Close(tip);
        } else {
            tips.Open(tip);
        }
    };
    this.OnLoad = function() {
        if (typeof options.OnLoad != 'undefined') {
            options.OnLoad(that);
        }        
    };
    this.Init(function(err) {
        that.initResults = !err;        
        that.OnLoad();
    });
}