var jsonMask = require('json-mask'),
	compile = jsonMask.compile,
	filter = jsonMask.filter;

module.exports = function (opt) {
	opt = opt || {};

	function partialResponse(obj, fields) {
		var i, j;
		if (!fields) {
			return obj;
		}

		var links;
		if(obj._links) {
			var linkFields = compile(fields + ',href,templated');
			links = obj._links;

			for (i in links) {
				if(Array.isArray(links[i])) {
					for (j = 0; i < embedded[i].length; j++) {
						links[i][j] = filter(links[i][j], linkFields);
					}
				} else {
					links[i] = filter(links[i], linkFields);
				}
			}
		}

		var embedded;
		if(obj._embedded) {
			embedded = obj._embedded;

			for (i in embedded) {
				if(Array.isArray(embedded[i])) {
					for (j = 0; i < embedded[i].length; j++) {
						embedded[i][j] = partialResponse(embedded[i][j], fields);
					}
				} else {
					embedded[i] = partialResponse(embedded[i], fields);
				}
			}
		}

		obj = filter(obj, compile(fields));
		if(!obj) {
			obj = {};
		}

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
			if (req.jsonp) {
				res.jsonp = wrap(res.jsonp.bind(res));
			}
			res.__isJSONMaskWrapped = true;
		}
		next();
	};
};