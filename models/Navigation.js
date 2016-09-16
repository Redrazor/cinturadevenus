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
    url: { type: Types.Url, index: true, noedit:true },
    itemCategory: { type: Types.Relationship, ref: 'PostCategory', many:true, label: 'Item Category', collapse:true },
    itemPost: { type: Types.Relationship, ref: 'Post', many:true, label: 'Item Post', collapse:true}
});


Navigation.schema.pre('validate', function(next) {
    console.log('This validates the nav item');
    if(this.itemCategory != null && this.itemPost != null){
        if(this.itemCategory.length > 0 && this.itemPost.length > 0) {
            this.itemPost.remove(this.itemPost);
        }
    }



    //console.log(this.itemCategory.length);

    next();
});

Navigation.schema.post('save', function(){

    if(this.itemCategory != null && this.itemCategory.length > 0){
        keystone.list('PostCategory').model.find({_id:this.itemCategory}).exec(function(err, postCats) {
            console.log(postCats);
            this.url = postCats[0].name;
        });


    }else if(this.itemPost != null && this.itemPost.length > 0){
        this.url = this.itemPost;
        this.url = this.url._.url.format();
    }


});


//It can also be a page but no page Model exists at this time

Navigation.defaultColumns = 'name';
Navigation.register();