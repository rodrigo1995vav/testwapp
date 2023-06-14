var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const wppconnect = require('@wppconnect-team/wppconnect');

var app = express();

var qrwapp
var clientWeb 
wppconnect.create({
    session: 'whatsbot',
    autoClose: false,
    puppeteerOptions: { args: ['--no-sandbox'] },
    catchQR: (qrCode, base64Qr) => {console.log(base64Qr); qrwapp = qrCode}
})
    .then((client) =>{
clientWeb = client;
    
        client.onMessage((message) => {
        
            console.log('Mensagem digitada pelo usuários: ' + message.body);
            
            client.sendText(message.from, 'PING! Mande um PONG para mim:')
                .then((result) => {
                    console.log('Pong retornado: ', result); 
                })
                .catch((erro) => {
                    console.error('ERRO: ', erro);
                });
        })})
        
    .catch((error) =>
        console.log(error));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get("/qr", (req, res) => {
  try {
    res.send(`<img src="${qrwapp}" alt="WhatsApp QR Code">`);
  } catch (error) {
    res.status(500).send("Error al enviar el mensaje: " + error);
  }
});

app.post("/send-message", async (req, res) => {
  try {
    const { number, message } = req.body;
    //const media = await MessageMedia.fromUrl(imageUrl);
    number.map(async (phone) => {
      setTimeout(async () => {
        await clientWeb
          .sendText(`${phone}@c.us`, message)
          .then(async (message) => {
            console.log("MESSAGE SENT");
            console.log(message);

            // const user = await Person.findOne({
            //   number: message._data.to._serialized,
            // });
            // console.log(user);

            // if (!user) {
            //   const newPerson = new Person({
            //     name: "Sin nombre",
            //     number: message._data.to._serialized,
            //     active: false,
            //   });
            //   await Person.create(newPerson);
            // }
            // const newMessage = new Message({
            //   message: message.body,
            //   number: message._data.from._serialized,
            //   name: "Api User Number Name",
            //   to: message._data.to._serialized,
            // });
            // await Message.create(newMessage);
          })
          .catch((err) => console.error(err));
      }, 1000);
    });
    res.send("Mensaje enviado con éxito.");
  } catch (error) {
    res.status(500).send("Error al enviar el mensaje: " + error);
  }
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
