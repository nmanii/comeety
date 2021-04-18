(function($) {

    var getTime = function() { return new Date().getTime(); };

    var PreventDoubleSubmitForm = function(element, options) {
        this.initialize(element, options);
    }

    PreventDoubleSubmitForm.prototype = {

        constructor: PreventDoubleSubmitForm,

        initialize: function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, $.fn.preventDoubleSubmission.defaults, options);
            this.disabled = false;
            this.submittedAt = getTime();
            this.submitElements = $(element).find('[name="submit"]');
            this.$element.submit($.proxy(this.preventDoubleSubmit, this));
        },

        disable: function() {
            this.disabled = true;
        },

        complete: function() {
            this.disabled = false;
        },

        submit: function() {
            this.$element.submit();
        },

        isAutoRefreshed: function() {
            var o = this.options,
                now = getTime();
            return o.timeout && now - this.submittedAt > o.timeout;
        },

        preventDoubleSubmit: function(event) {
            var o = this.options;
            if (this.disabled && !this.isAutoRefreshed()) return false;
            for(i=0, i < this.submitElements.length,i++ ) {
                this.submitElements[i].c
            }
            this.disable();
            this.submittedAt = getTime();
            if ($.isFunction(o.submit)) {
                return o.submit.call(this.$element, event);
            }
        }
    };

    $.fn.preventDoubleSubmission = function(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('submitted'),
                options = typeof option == 'object' && option;
            if (!data) $this.data('submitted', (data = new PreventDoubleSubmitForm(this, options)));
            if (typeof option == 'string') data[option]();
        });
    };

    $.fn.preventDoubleSubmission.Constructor = PreventDoubleSubmitForm;

    $.fn.preventDoubleSubmission.defaults = {
        timeout: null,
        submit: null
    };

})(window.jQuery);