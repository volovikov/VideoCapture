var Message = {
    Good: function(msg, form) {
        var that = this;
        this.Open = function() {
            var html =  '<div class="Row">'+
                            '<div class="Message Good">'+
                                '<div class="Text">' +msg+ '</div>'+
                                '<div class="Button Close"></div>'+
                            '</div>'+
                         '</div>';

            form.me.append(html);
            form.me.find('.Message.Good').find('.Button.Close').live('click', that.OnClickClose);
        };
        this.Close = function() {
            form.me.find('.Message').remove();
        };
        this.IsOpen = function() {
            return form.me.find('.Message').length == 0 ? false : true;
        };
        this.OnClickClose = function() {
            that.Close();
        }
        if (this.IsOpen()) {
            this.Close();
        }
        this.Open();
    },
    Bad: function(msg, form) {
        var that = this;
        this.Open = function() {
            var html =  '<div class="Row">'+
                            '<div class="Message Error">'+
                                '<div class="Text">' +msg+ '</div>'+
                                '<div class="Button Close"></div>'+
                            '</div>'+
                         '</div>';

            form.me.append(html);
            form.me.find('.Message.Error').find('.Button.Close').live('click', that.OnClickClose);
        };
        this.Close = function() {
            form.me.find('.Message').remove();
        };
        this.IsOpen = function() {
            return form.me.find('.Message').length == 0 ? false : true;
        };
        this.OnClickClose = function() {
            that.Close();
        };
        if (this.IsOpen()) {
            this.Close();
        }
        this.Open();
    },
    Info: function(msg, form) {
        var that = this;
        this.Open = function() {
            var html =  '<div class="Row">'+
                            '<div class="Message Info">'+
                                '<div class="Text">' +msg+ '</div>'+
                                '<div class="Button Close"></div>'+
                            '</div>'+
                         '</div>';

            form.me.append(html);
            form.me.find('.Message.Info').find('.Button.Close').live('click', that.OnClickClose);
        };
        this.Close = function() {
            form.me.find('.Message').remove();
        };
        this.IsOpen = function() {
            return form.me.find('.Message').length == 0 ? false : true;
        };
        this.OnClickClose = function() {
            that.Close();
        }
        if (this.IsOpen()) {
            this.Close();
        }
        this.Open();
    },
    Attention: function(msg, form) {
        var that = this;
        this.Open = function() {
            var html =  '<div class="Row">'+
                            '<div class="Message Attention">'+
                                '<div class="Text">' +msg+ '</div>'+
                                '<div class="Button Close"></div>'+
                            '</div>'+
                         '</div>';

            form.me.append(html);
            form.me.find('.Message.Attention').find('.Button.Close').live('click', that.OnClickClose);
        };
        this.Close = function() {
            form.me.find('.Message').remove();
        };
        this.IsOpen = function() {
            return form.me.find('.Message').length == 0 ? false : true;
        };
        this.OnClickClose = function() {
            that.Close();
        }
        if (this.IsOpen()) {
            this.Close();
        }
        this.Open();
    },
    Reset: function(form, callback) {
        form.me.find('.Message').parent().remove();

        if (typeof callback != 'undefined') {
            callback();
        }
    }
}