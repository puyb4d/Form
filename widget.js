WAF.define('Form', ['waf-core/widget', 'FormNavigation', 'FormField', 'Text'], function(widget, FormNavigation, FormField, Text) {
    "use strict";

    var Form = widget.create('Form', {
        datasource: widget.property({ type: 'datasource' }),
        fields: widget.property({
            type: 'list',
            attributes: [
                { name: 'attribute', type: 'attribute', datasourceProperty: 'datasource' },
                { name: 'title', type: 'string' },
                { name: 'widget', type: 'string', toolbox: true },
                { name: 'property', type: 'string', toolbox: true }
            ]
        }),
        init: function() {
            this._previousDatasource = this.datasource();
            this.subscribe('datasourceBindingChange', 'datasource', function() {
                this.invoke('datasource', this.datasource());
            }, this);
            this.getPart('navigation').datasource(this.datasource());

            this.getPart('navigation').subscribe('search', function() {
                var query = [];
                var params = [];
                this.invoke('getQueryAndParams', query, params);
                this.datasource().query(query.join(' AND '), { params: params });
            }, this);
        },
        autoForm: function() {
            var dataClass = this.datasource.getDataClass();
            var fields = [];
            for(var attribute in dataClass) {
                if(dataClass.hasOwnProperty(attribute)) {
                    fields.push({ attribute: attribute });
                }
            }
            this.fields(fields);
        }
    });

    Form.inherit('waf-behavior/layout/composed');
    Form.setPart('navigation', FormNavigation);
    Form.setPart('title', Text);

    Form.inherit('waf-behavior/layout/properties-container');
    Form.linkListPropertyToContainer('fields', {
        widgetClass: FormField,
        getNewWidget: function(item, index) {
            var bound = this.datasource.boundDatasource();
            var widget = new FormField(WAF.extend({
                datasource: bound && bound.toString(),
            }, item));
            return widget;
        }
    });

    return Form;

});
