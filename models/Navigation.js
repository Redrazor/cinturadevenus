/**
 * Created by brunogomes on 02/08/2016.
 */

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Navigation Model
 * ==========
 */

var Navigation = new keystone.List('Navigation', {
    sortable: true,
    autokey: { from: 'name', path: 'key', unique: true }
});

Navigation.add({
    name: { type: String, required: true },
    active: { type: Types.Boolean, default: true },
    url: { type: String, index: true, noedit:true },
    itemCategory: { type: Types.Relationship, ref: 'PostCategory', many:true, label: 'Item Category', collapse:true },
    itemPost: { type: Types.Relationship, ref: 'Post', many:true, label: 'Item Post', collapse:true}
});


Navigation.schema.pre('validate', function(next) {
    console.log('This validates the nav item');
    next();
});

Navigation.schema.post('save', function(){

    //See if any of the relations have values

    if(this.itemCategory.length > 0 && this.itemPost.length > 0){
        return 'ERROR';
    }


    console.log(this.itemPost);
    console.log(this.itemCategory);

    //if they do go get the url path for them and write it on the nav url

    //this.url =

});


//It can also be a page but no page Model exists at this time

Navigation.defaultColumns = 'name';
Navigation.register();