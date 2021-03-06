/**
 * Created by brunogomes on 01/08/2016.
 */

var keystone = require('keystone');
var Types= keystone.Field.Types;

/**
 Post Comments Model
 =====
 */

var PostComment = new keystone.List('PostComment', {
   label: 'Comments'
});

PostComment.add({
    author:{ type: Types.Relationship, initial: true, ref: 'User', index: true },
    post:{ type: Types.Relationship, initial:true, ref: 'Post', index: true },
    commentState: { type: Types.Select, options: ['approved','pending','refused'], default: 'pending', index: true},
    publishedOn: { type: Types.Date, default: Date.now, noedit:true, index:true }
});

PostComment.add('Content', {
   content: {type: Types.Html, wysiwyg:true, height:300}
});

PostComment.schema.pre('save', function(next){
    this.wasNew = this.isNew;
    if(!this.isModified('publishedOn') && this.isModified('commentState') && this.commentState === 'approved'){
        this.publishedOn = new Date();
    }

    next();
});

PostComment.schema.post('save', function(){
    if(!this.wasNew)
        return;
    if(this.author){
        keystone.list('User').model.findById(this.author).exec(function(err, user){
            if(typeof user !== 'undefined' && user){
                user.wasActive().save();
            }
        });
    }
});

PostComment.track = true;
PostComment.defaultColumns = 'author, post, publishedOn, commentState';
PostComment.register();