var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'blog';
	locals.filters = {
		post: req.params.post,
	};
	locals.data = {
		posts: [],
	};

	// Load the current post
	view.on('init', function (next) {

		var q = keystone.list('Post').model.findOne({
			state: 'published',
			slug: locals.filters.post,
		}).populate('author categories');

		q.exec(function (err, result) {
			locals.data.post = result;
			next(err);
		});

	});

	// Load this posts comments
	view.on('init', function (next) {

		var q = keystone.list('PostComment').model.find()
			.where('post',locals.data.post)
			.where('commentState', 'approved')
			.where('author').ne(null)
			.sort('-publishedOn').populate('author');

		q.exec(function (err, results) {
			locals.data.post.comments = results;
			next(err);
		});

	});

	// Load other posts
	view.on('init', function (next) {

		var q = keystone.list('Post').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

		q.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});

	});


	//Create a Comment

	view.on('post', {action: 'comment.create'}, function(next){

		var request = require('request');

		var captcha = req.body['g-recaptcha-response'];

		//We need to validate captcha with Google before writting any comment to db
		var post_data = {
			secret: '6LcIfyYTAAAAAL7mXL_rPHHlg0tCe8oBCs4BHCrB',
			response: captcha
		};

		request.post({url:'https://www.google.com/recaptcha/api/siteverify', formData: post_data},
			function optionalCallback(err, httpResponse, body) {
				if (err) {
					return next(err);
				}
				console.log('Communication successful!  Server responded with:', body);

				var bodyParsed = JSON.parse(body);
				if(bodyParsed.success != false){
					console.log('carry on to inserting comment');
					var newComment = new(keystone.list('PostComment')).model({
						state: 'pending',
						post: locals.data.post.id,
						author: locals.user.id
					});

					var updater = newComment.getUpdateHandler(req);

					updater.process(req.body, {
						fields: 'content',
						flashErrors: true,
						logErrors: true
					}, function(err){
						if(err){
							locals.validationErrors = err.errors;
						}else{
							req.flash('success', 'O seu comentário está pendente de aprovação')	;
							return res.redirect('/post/'+locals.data.post.slug)
						}

						next();
					});
				}else{
					var err = 'Tem de confirmar autenticidade do comentário';
					req.flash('error', err);
					return res.redirect('/post/'+locals.data.post.slug)
				}


			});

	});

	//Delete a Comment ?



	// Render the view
	view.render('post');
};
