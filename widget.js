WAF.define('AutoForm', ['waf-core/widget', 'AutoFormNavigation', 'Text', 'Label', 'TextInput', 'DropDown', 'CheckBox'], function(widget, AutoFormNavigation, Text, Label, TextInput, DropDown, Checkbox) {
    "use strict";

    var AutoForm = widget.create('AutoForm', {
        datasource: widget.property({ type: 'datasource' }),
        fields: widget.property({
            type: 'list',
            attributes: [
                { name: 'attribute', type: 'attribute', datasourceProperty: 'datasource' },
                { name: 'label', type: 'string' },
                { name: 'widget', type: 'string', toolbox: true },
                { name: 'property', type: 'string', toolbox: true }
            ]
        }),
        init: function() {
            this._previousDatasource = this.datasource();
            this.subscribe('datasourceBindingChange', 'datasource', datasourceChange, this);
            this.getPart('navigation').datasource(this.datasource());

            this.getPart('navigation').subscribe('search', function() {
                var query = [];
                var params = [];
                var dataClass = this.datasource().getDataClass();
                this.widgets().forEach(function(widget) {
                    if(widget.isInstanceOf(Label)) {
                        return;
                    }
                    widget.constructor.getProperties().forEach(function(name) {
                        if(!widget[name].boundDatasource) {
                            return;
                        }
                        var bound = widget[name].boundDatasource();
                        if(!bound) {
                            return;
                        }
                        if(bound.datasource !== this.datasource()) {
                            return;
                        }
                        if(widget[name]()) {
                            switch(getType(dataClass[bound.attribute])) {
                                case 'string':
                                    params.push(widget[name]());
                                    query.push(bound.attribute + ' begin :' + params.length);
                                    break;
                                case 'relatedEntity':
                                    var key;
                                    if(dataClass instanceof WAF.DataClass) {
                                        key = dataClass._private.primaryKey;
                                    } else {
                                        for(var k in dataClass) {
                                            if(dataClass[k].isKey) {
                                                key = k;
                                            }
                                        }
                                    }
                                    if(key) {
                                        params.push(widget[name]());
                                        query.push(bound.attribute + '.' + key + ' = :' + params.length);
                                    }
                                    break;
                                default:
                                    params.push(widget[name]());
                                    query.push(bound.attribute + ' = :' + params.length);
                            }
                        }
                    }.bind(this));
                }.bind(this));
                this.datasource().query(query.join(' AND '), { params: params });
            }, this);
        }
    });

    var TEXT_INPUT = { widget: TextInput, property: 'value' };
    var DEFAULT_WIDGETS = {
        'string': TEXT_INPUT,
        'long':   TEXT_INPUT,
        'number': TEXT_INPUT,
        'float':  TEXT_INPUT,
        'byte':   TEXT_INPUT,
        'word':   TEXT_INPUT,
        'long64': TEXT_INPUT,
        //'date':
        //'object':
        'relatedEntity': { widget: DropDown, property: 'value', options: { 'items-attribute-label': 'ID', allowempty: true } },
        'bool':         { widget: Checkbox, property: 'value' }
    };

    var getType = function(attribute) {
        if(attribute.kind !== 'storage') {
            return attribute.kind;
        }
        return attribute.type;
    };

    var datasourceChange = function () {
        this.getPart('navigation').datasource(this.datasource());
        var bound = this.datasource.boundDatasource();
        this.getPart('title').value(bound ? bound.datasourceName : 'No datasource');
        //debugger;
        this.detachAndDestroyAllWidgets();
        var dataClass = this.datasource.getDataClass();
        for(var name in dataClass) {
            if(dataClass.hasOwnProperty(name)) {
                var attribute = dataClass[name];
                var defaultWidget = DEFAULT_WIDGETS[getType(attribute)];
                if(defaultWidget) {
                    this.attachWidget(new Label({ value: name }));
                    var options = WAF.extend({}, defaultWidget.options || {});
                    var widget = new defaultWidget.widget(options);
                    this.attachWidget(widget);
                    debugger;
                    widget[defaultWidget.property].bindDatasource(bound.datasourceName + '.' + name);
                }
            }
        }
    };
    AutoForm.inherit('waf-behavior/layout/composed');
    AutoForm.inherit('waf-behavior/layout/container');

    AutoForm.setPart('navigation', AutoFormNavigation);
    AutoForm.setPart('title', Text);

    return AutoForm;

});
