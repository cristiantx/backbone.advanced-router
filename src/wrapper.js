(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['backbone', 'underscore', 'bluebird', 'backbone.base-router'], function(Backbone, _, Promise) {
			return factory(Backbone, _, Promise);
		});
	}
	else if (typeof exports !== 'undefined') {
		var Backbone = require('backbone');
		var Promise = require('bluebird');
		var _ = require('underscore');

		Backbone.BaseRouter = require('backbone.base-router');
		module.exports = factory(Backbone, _, Promise);
	}
	else {
		factory(root.Backbone, root._, root.Promise);
	}
}(this, function(Backbone, _) {
	'use strict';

	// @include backbone.advanced-router.js

	return Backbone.AdvancedRouter;
}));
