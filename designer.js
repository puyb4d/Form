(function(Form) {
    "use strict";

    Form.doAfter('init', function() {
        var oldDs = this.datasource.boundDatasource();
        this.subscribe('datasourceBindingChange', 'datasource', function(event) {
            var ds = this.datasource.boundDatasource();
            if(ds) {
                if(!oldDs || oldDs.datasourceName !== ds.datasourceName) {
                    this.autoForm();
                }
                oldDs = ds;
                this.fields.show();
            } else {
                this.fields.hide();
            }
        }, this);
            if(!this.datasource.boundDatasource()) {
                this.fields.hide();
            }
    });
});
