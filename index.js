var jsonMask = require('json-mask'),
	compile = jsonMask.compile,
	filter = jsonMask.filter;

module.exports = function (opt) {
	opt = opt || {};

	function partialResponse(obj, fields) {
		if (!fields) return obj;

		var links = undefined;
		if(obj._links) {
			var linkFields = compile(fields + ',href,templated');
			var links = obj._links;

			links.forEach(function(namespace) {
				if(Array.isArray(namespace)) {
					namespace.forEach(function(link) {
						link = filter(link, linkFields);
					});
				} else {
					namespace = filter(namespace, linkFields);
				}
			});
		}

		var embedded = undefined;
		if(obj._embedded) {
			var embedded = obj._embedded;

			embedded.forEach(function(namespace) {
				if(Array.isArray(namespace)) {
					namespace.forEach(function(embed) {
						embed = partialResponse(embed, fields);
					});
				} else {
					namespace = partialResponse(namespace, fields);
				}
			});
		}

		obj = filter(obj, compile(fields));

		if(links) {
			obj._links = links;
		}
		if(embedded) {
			obj._embedded = embedded;
		}

		return obj;
	}

	function wrap(orig) {
		return function (obj) {
			var param = this.req.query[opt.query || 'fields'];
			if (1 === arguments.length) {
				orig(partialResponse(obj, param));
			} else if (2 === arguments.length) {
				if ('number' === typeof arguments[1]) {
					orig(arguments[1], partialResponse(obj, param));
				} else {
					orig(obj, partialResponse(arguments[1], param));
				}
			}
		};
	}

	return function (req, res, next) {
		if (!res.__isJSONMaskWrapped) {
			res.json = wrap(res.json.bind(res));
			if (req.jsonp) res.jsonp = wrap(res.jsonp.bind(res));
			res.__isJSONMaskWrapped = true;
		}
		next();
	};
};