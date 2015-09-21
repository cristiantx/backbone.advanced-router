// Backbone.AdvancedRouter v0.1.1
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

	var _ = require('underscore'),
		Promise = require('bluebird');
	
	Backbone.AdvancedRouter = Backbone.BaseRouter.extend({
	
		history: [],
		controllers: {},
	
		constructor: function( options ) {
	
			this.controllers = options.controllers || {};
	
			Backbone.BaseRouter.prototype.constructor.apply(this, arguments);
	
		},
		onRoute: function() {
			//console.log( 'change', Backbone.history.fragment );
			this.history.push( Backbone.history.fragment );
		},
		navigateTo: function( address, options ) {
	
			var defaults = {
				trigger: true
			};
	
			options = _.defaults( {}, options, defaults );
			console.log( 'navigate',address, options );
			this.navigate( address, options );
	
			if( options.trigger === false ) {
				this.history.push( Backbone.history.fragment );
			}
	
		},
		onNavigate: function( routeData ) {
	
			var route = this._parseRoute( routeData );
			var promises = [ Promise.resolve() ];
	
			this.history.push( routeData.uriFragment );
	
			if( route.before && !_.isArray( route.before ) ) {
				promises = [ route.before ];
			} else if( route.before && _.isArray(route.before) ) {
				promises = route.before;
			}
	
			Promise.resolve( promises ).each(function( filter ) {
				return filter();
			}).then( _.bind( function() {
	
				this.trigger('before:route', routeData );
				if( _.isFunction( route.method ) ) {
					route.method.call( route.controller, routeData.params );
				} else if ( _.isObject( route.method ) ) {
					var before = Promise.method(route.method.before).bind( route.controller );
	
					before( routeData.params )
						.then( _.bind( function() {
							route.method.run.apply( route.controller, arguments );
							return Promise.resolve();
						}, this), _.bind( function( error ) {
							if( _.isString( error ) ) {
								this.navigateTo( error );
							} else {
								console.log('Error');
								throw error;
							}
						}, this ) )
						.then( _.bind( function() {
							this.trigger('route', routeData );
						}, this ) );
				}
	
				return false;
	
			}, this ), _.bind( function( a ) {
				console.log('not solved', a );
				return false;
			}, this ));
	
		},
	
		_parseRoute: function ( routeData ) {
	
			var linked = routeData.linked,
				actionString,
				routeAttributes = {
					'controller': null,
					'method': null,
					'before': [],
					'after': []
				};
	
	
			if( _.isFunction( linked ) ) {
				routeAttributes.method = linked;
			}
			else if( _.isObject( linked ) ) {
	
				actionString = linked.uses;
	
				if( linked.before ) {
					if( _.isArray( linked.before ) ) {
	
						var filterArray = [];
	
						_.each( linked.before, _.bind(function( filter ) {
							if( !this.filters[filter] ) throw new Error('Filter ['+filter+'] does not exist.');
							filterArray.push( Promise.method( this.filters[filter] ) );
						}, this) );
	
						routeAttributes.before = filterArray;
	
					} else if( _.isString( linked.before ) ) {
						if( !this.filters[filter] ) throw new Error('Filter ['+filter+'] does not exist.');
						routeAttributes.before = Promise.method( this.filters[ linked.before ] );
					} else if( _.isFunction( linked.before ) ) {
						routeAttributes.before = [ Promise.method( linked.before ) ];
					}
				}
			} else if ( _.isString( linked ) ) {
	
				actionString = linked;
	
			}
	
			if( !routeAttributes.method ) {
	
				if( actionString.indexOf('@') === -1 ) {
					throw new Error('Router string should be in format: ControllerName@method.');
				}
	
				var action = actionString.split('@');
	
				routeAttributes.controller = this.getController( action[0] );
	
				if( !routeAttributes.controller ) throw new Error('Controller ['+action[0]+'] does not exist.');
	
				routeAttributes.method = routeAttributes.controller[action[1]];
	
				if( !routeAttributes.method ) throw new Error('Method ['+action[1]+'] does not exist on ' + action[0] + ' controller.');
	
			}
	
			return routeAttributes;
	
		},
		onHistoryBack: function( options ) {
	
			this.history.pop();
			this.navigate( _.last( this.history ), options );
	
		},
	
		getController: function( controllerName ) {
			return this.controllers[controllerName];
		}
	
	});
	

	return Backbone.AdvancedRouter;
}));
