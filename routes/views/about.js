/**
 * Created by brunogomes on 27/07/2016.
 */

var keystone = require('keystone');
var async = require('async');

exports = module.exports = function (req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    // Init locals
    locals.section = 'about-me';
    locals.filters = {
        category: req.params.category,
    };

    // Render the view
    view.render('about');
};

