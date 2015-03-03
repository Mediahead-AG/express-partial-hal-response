var jsonMask = require('json-mask'),
	compile = jsonMask.compile,
	filter = jsonMask.filter;

module.exports = function (opt) {
	opt = opt || {};

	/**
	 * Walk over all Links / Embedded Objects and give them into the callback
	 * @param  {Object} objects
	 * @return {Object}
	 */
	function walk(objects, callback) {
		var i, j;

		for (i in objects) {
			if(Array.isArray(objects[i])) {
				for (j = 0; i < objects[i].length; j++) {
					objects[i][j] = callback(objects[i][j]);
				}
			} else {
				objects[i] = callback(objects[i]);
			}
		}
	}

	/**
	 * Filter Hal Response
	 * @param  {HalResponse} obj
	 * @param  {String} fields
	 * @return {Filtered Hal Response}
	 */
	function partialResponse(obj, fields) {
		if (!fields) {
			return obj;
		}

		var links;
		var linkFields = compile(fields + ',href,templated');

		if(obj._links) {
			links = walk(obj._links, function(link) {
				filter(link, linkFields);
			});
		}
		var embedded;
		if(obj._embedded) {
			embedded = walkEmbedded(obj._embedded function(link) {
				partialResponse(link, fields);
			});
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

	/**
	 * Apply partialResponse
	 * @param  {Function} orig
	 * @return {Function}
	 */
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

	/**
	 * Filter it if it isn't allready
	 * @param  {Request}   req
	 * @param  {Response}   res
	 * @param  {Function} next
	 * @return void
	 */
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