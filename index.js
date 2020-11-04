const express = require('express')
const os = require('os')
const fs = require('fs')
const path = require('path')
const app = express()

var session = require('express-session');
var FileStore = require('session-file-store')(session);
 
var fileStoreOptions = {
    path: '/tmp/session'
};
 
app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: 'secret'
}));

const port = parseInt(process.env.PORT, 10) || 0

const version = '2.0'

if (!port) {
	console.log('Missing env PORT!')
	process.exit(1)
}

app.get('/', (req, res) => {
  if (req.session.views) {
    req.session.views++
    res.send(`Hello, I'm running on ${os.hostname()} with views: ${req.session.views}!`)
  } else {
    req.session.views = 1
    res.send(`Hello, I'm running on ${os.hostname()} with views: ${req.session.views}!`)
  }
})

app.listen(port, () => {
  console.log(`Example app listening at port ${port}`)
})
