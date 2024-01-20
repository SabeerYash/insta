// 'use strict';
// var debug = require('debug');
// var express = require('express');
// var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');

// var routes = require('./routes/index');
// var users = require('./routes/users');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// // uncomment after placing your favicon in /public
// //app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// // error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function (err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function (err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });

// app.set('port', process.env.PORT || 3000);

// var server = app.listen(app.get('port'), function () {
//     debug('Express server listening on port ' + server.address().port);
// });
// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// const port = 3000; // You can use any available port

// // Middleware to parse incoming JSON requests
// app.use(bodyParser.json());

// // Webhook endpoint for receiving new messages
// app.post('/webhook', (req, res) => {
//   // Extract relevant information from the incoming payload
//   const { sender, message } = req.body;

//   // Your webhook processing logic goes here
//   console.log(`New message from ${sender}: ${message}`);

//   // Respond to the webhook request
//   res.status(200).send('Webhook received successfully');
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// const port = process.env.PORT || 3000;

// const verifyToken = 'instamaster_token';

// app.use(bodyParser.json());

// app.use(bodyParser.json());

// app.get('/messaging-webhook', (req, res) => {
//     // Parse the query params
//     const mode = req.query['hub.mode'];
//     const token = req.query['hub.verify_token'];
//     const challenge = req.query['hub.challenge'];
//     if (mode && token) {

//         if (mode === 'subscribe' && token === verifyToken) {
//             console.log('WEBHOOK_VERIFIED');
//             res.status(200).send(challenge);
//         } else {
//             console.error('Verification failed');
//             res.sendStatus(403);
//         }
//     } else {
//         console.error('Bad request - missing query parameters');
//         res.sendStatus(400);
//     }
// });


// // Webhook endpoint for receiving new messages
// app.post('/webhook', (req, res) => {
//     const body = req.body;

//     // Handle incoming messages or events here
//     if (body.object === 'page') {
//         body.entry.forEach((entry) => {
//             entry.messaging.forEach((event) => {
//                 if (event.message) {
//                     // Handle incoming message
//                     const sender = event.sender.id;
//                     const messageText = event.message.text;
//                     console.log(`New message from ${sender}: ${messageText}`);
//                 }
//             });
//         });
//     }

//     // Respond to the webhook request
//     res.status(200).send('Webhook received successfully');
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });


const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config({path:'./.env'})
const https = require('https');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

app.use(bodyParser.json());

// Middleware to redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.protocol === 'http') {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
});

// Webhook endpoint for handling verification
app.get('/messaging-webhook', (req, res) => {
  // Parse the query params
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.error('Verification failed');
      res.sendStatus(403);
    }
  } else {
    console.error('Bad request - missing query parameters');
    res.sendStatus(400);
  }
});

// Webhook endpoint for receiving new messages
app.post('/webhook', (req, res) => {
  const body = req.body;
  // Handle incoming messages or events here
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message) {
          // Handle incoming message
          const sender = event.sender.id;
          const messageText = event.message.text;
          console.log(`New message from ${sender}: ${messageText}`);
        }
      });
    });
  }

  // Respond to the webhook request
  res.status(200).send('Webhook received successfully');
});

// Specify the paths to your SSL certificate and private key files
const privateKey = fs.readFileSync('path/to/private-key.pem', 'utf8');
const certificate = fs.readFileSync('path/to/certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server using the credentials
const httpsServer = https.createServer(credentials, app);

// Start the HTTPS server
httpsServer.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});
