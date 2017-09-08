const express = require("express"),
  bodyParser = require("body-parser"),
  mustacheExpress = require("mustache-express"),
  session = require("express-session"),
  secretPass = {
    secret: "Anything here",
    resave: !0,
    saveUninitialized: !0,
    cookie: {
      maxAge: 900000
    }
  },
  app = express(),
  port = process.env.PORT || 3e3,
  fs = require("fs"),
  words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
var expressValidator = require("express-validator");
app.engine("mustache", mustacheExpress()),
  app.set("views", "./public"),
  app.set("view engine", "mustache"),
  app.use(expressValidator()),
  app.use("/", express.static("./public")),
  app.use(bodyParser.urlencoded({
    extended: !1
  })),
  app.use(session(secretPass));
var lettersGuessed = [],
  guessesLeft = 8,
  mode, randomWord, hangman;

function displayGame(a, b) {
  var c = "";
  if (-1 == b) {
    for (var d = 0; d < a; d++) c += "_ ";
    return c
  }
  if (0 <= randomWord.indexOf(b)) {
    for (var f, e = 0, d = 0; d < randomWord.length; d++) {
      f = 0;
      for (var g = 0; g < lettersGuessed.length; g++)
        lettersGuessed[g] == randomWord[d] && (c += lettersGuessed[g] + " ", f = 1, e = 1);
      0 == f && (c += "_ ")
    }
    return c
  }
  return guessesLeft -= 1, hangman
}

function solve(a, b) {
  for (var d, c = "", e = 0; e < b.length; e++) c += b[e] + " ";
  return d = a == c, d
}

function game(a) {
  if ("Easy" == a) var b = words.filter(function(c) {
    return 4 <= c.length & 6 >= c.length
  });
  else if ("Normal" == a) var b = words.filter(function(c) {
    return 6 <= c.length & 8 >= c.length
  });
  else var b = words.filter(function(c) {
    return 8 < c.length
  });
  return randomWord = b[Math.floor(Math.random() * b.length)], randomWord
}

function letters(a, b) {
  for (var c = "", d = 0; d < b.length; d++) c += b[d] + " ";
  for (var e = "", f = 0; f < a.length; f++) e += "_" == a[f] ? "<span id=\"red\">" + c[f] + "</span>" : a[f];
  return e
}
app.get("/", (a, b) => {
    var c, d;
    a.session.word ? 1 <= guessesLeft &&
      (c = 0 == lettersGuessed.length ? -1 : lettersGuessed[lettersGuessed.length - 1],
        hangman = displayGame(a.session.word.length, c),
        d = solve(hangman, a.session.word),
        d || 0 != guessesLeft ? d ? b.render("index", {
          guess: guessesLeft,
          guessedLetters: lettersGuessed,
          mode: mode,
          hangman: hangman.toString(),
          solved: !0,
          lost: !1
        }) : b.render("index", {
          guess: guessesLeft,
          guessedLetters: lettersGuessed,
          mode: mode,
          hangman: hangman.toString(),
          solved: d,
          lost: !1
        }) : (hangman = letters(hangman, a.session.word),
          b.render("index", {
            guess: guessesLeft,
            guessedLetters: lettersGuessed,
            mode: mode,
            hangman: hangman.toString(),
            solved: !0,
            lost: !0
          }))) : (lettersGuessed = [], guessesLeft = 8,
        b.render("index"))
  }),
  app.post("/", (a, b) => {
    if (a.body.status && (a.session.destroy(),
        b.redirect("/")), a.body.mode)
      randomWord = game(a.body.mode).toUpperCase(),
      a.session.word = randomWord.toUpperCase(),
      mode = a.body.mode,
      b.redirect("/");
    else {
      a.checkBody("choice", "This word is spelled with letters... duh!").isAlpha(),
        a.checkBody("choice", "One letter at a time please.").isLength({
          max: 1
        }),
        a.checkBody("choice", "It's going to be tough to win if you don't type anything in the box!").notEmpty();
      var c = a.validationErrors();
      if (c) b.render("index", {
        errorInput: c,
        mode: mode,
        guess: guessesLeft,
        guessedLetters: lettersGuessed,
        hangman: hangman
      });
      else if (0 < lettersGuessed.length & -1 == lettersGuessed.indexOf(a.body.choice.toUpperCase()))
        lettersGuessed.push(a.body.choice.toUpperCase()),
        b.redirect("/");
      else if (0 == lettersGuessed.length)
        lettersGuessed.push(a.body.choice.toUpperCase()),
        b.redirect("/");
      else {
        console.log(mode),
          console.log(lettersGuessed),
          console.log(hangman),
          b.render("index", {
            errorInput: {
              msg: "Please enter a letter that has not already been used."
            },
            mode: mode,
            guess: guessesLeft,
            guessedLetters: lettersGuessed,
            hangman: hangman
          })
      }
    }
  }),

  app.listen(port, () => {
    console.log("If you're seeing this we are in good shape on port ", port)
  });
