var express = require("express");
var sockio = require("socket.io");
var Promise = require('promise');
var mongo_cli = require('mongodb').MongoClient;

var app = express();
app.use(express.static(__dirname + "/public"));

var io = sockio.listen(app.listen(8099), {
  log: false
});
console.log("Server started on port " + 8099);

// Connection URL
var url = 'mongodb://localhost:27017/media_domain_development';
var conn = null;

// Use connect method to connect to the Server
mongo_cli.connect(url, function(err, db) {
  if (err) {
    console.log("Could not connect to MongoDB. Error: " + err);
    return;
  }

  console.log("Connected to MongoDB.");
  conn = db;
});

var stats = function(conn) {
  return new Promise(function(resolve, reject) {
    conn.stats(function(err, stats) {
      if (err) {
        reject(err);
      }
      resolve(stats);
    });
  });
};

io.sockets.on("connection", function(socket) {
  var stats_checker = setInterval(function() {
    stats(conn).then(
      function(stats) {
        console.log(stats);
        io.sockets.emit("stats", stats);
      },
      function(err) {
        console.log("Could not read stats. " + err);
      });
  }, 5000);
  // r.connect({db: "rethinkdb"}).then(function(c) {
  //   conn = c;
  //   return r.table("server_status").run(conn);
  // })
  // .then(function(cursor) { return cursor.toArray(); })
  // .then(function(result) {
  //   socket.emit("servers", result);
  // })
  // .error(function(err) { console.log("Failure:", err); })
  // .finally(function() {
  //   if (conn)
  //     conn.close();
  // });
  socket.on('disconnect', function() {
    clearInterval(stats_checker);
  });
});
