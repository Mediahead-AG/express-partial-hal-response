# Express Partial Hal Response Middleware [![NPM version](https://badge.fury.io/js/express-partial-hal-response.png)](http://badge.fury.io/js/express-partial-hal-response)

This Library is strongly influenced by [express-partial-response](https://github.com/nemtsov/express-partial-response).

This Express Middleware will allow you to send a subset of a HAL+JSON object
instead of an entire object from your HTTP services. To do so, your services
will begin accepting the `?fields=` query-string that, using a simple language,
will specify which fields and sub-feelds to keep and which to ignore.

If you've used the Google APIs, provided a `?fields=` query-string to get a
[Partial Response](https://developers.google.com/+/api/#partial-responses),
and wanted to do the same for your own server, now you can do so with this
middleware.

*Underneath, this middleware uses [json-mask](https://github.com/nemtsov/json-mask).
Use it directly without this middleware if you need more flexibility.*

# Installation

```
npm install express-partial-hal-response
```

# Usage

```js
var express = require('express')
  , partialHalResponse = require('express-partial-hal-response')
  , app = express()

app.use(partialHalResponse())

app.get('/', function (res, res, next) {
  res.hal({
      data: {
        firstName: 'Mohandas',
        lastName: 'Gandhi',
        aliases: [{
          firstName: 'Mahatma',
          lastName: 'Gandhi'
        }, {
          firstName: 'Bapu'
        }]
      }
  })
})

app.listen(4000)
```

Let's test it:

```
$ curl 'http://localhost:4000'
{"data": {"firstName":"Mohandas","lastName":"Gandhi","aliases":[{"firstName":"Mahatma","lastName":"Gandhi"},{"firstName":"Bapu"}]}}

$ # Let's just get the first name
$ curl 'http://localhost:4000?fields=lastName'
{"data":"lastName":"Gandhi"}}

$ # Now, let's just get the first names directly as well as from aliases
$ curl 'http://localhost:4000?fields=firstName,aliases(firstName)'
{"data":"firstName":"Mohandas","aliases":[{"firstName":"Mahatma"},{"firstName":"Bapu"}]}}
```

**Note:** take a look at `/example`.

# Syntax

Look at [json-mask](https://github.com/nemtsov/json-mask) for the available syntax of the `fields` param.

# Options

`query` specifies the query-string to use. Defaults to `fields`

```js
app.use(partialResponse({
  query: 'filter'
}))
```

# License

MIT. See LICENSE