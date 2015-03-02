
$(function() {
  function timestamp() { return (new Date).getTime() / 1000; }

  var cluster = document.querySelector("#cluster");
  cluster.stats = {};
  cluster.toMB = function(value, precision) {
    if(precision === null || precision === undefined) {
      precision = 2;
    }

    var megabyte = 1024*1024;
    return Number(value/megabyte).toFixed(precision);
  };

  var chart = $("#chart").epoch({
    type: "time.line",
    axes: ["left", "bottom"],
    data: [
      {label: "Storage Size", values: [{time: timestamp(), y: 0}]},
      {label: "Indexes Size", values: [{time: timestamp(), y: 0}]}
    ]
  });

  var socket = io.connect();

  socket.on("stats", function(data) {
    cluster.stats = data;
    chart.push([
      { time: timestamp(), y: cluster.stats.dataSize },
      { time: timestamp(), y: cluster.stats.indexSize}
    ]);
  });

  // socket.on("collections", function(data) {
  //   if (data.length)
  //     return cluster.collections = data;

  //   if (!data.old_val)
  //     return cluster.collections.push(data.new_val);

  //   for (var s in cluster.collections)
  //     if (cluster.collections[s].id == data.old_val.id)
  //       cluster.collections[s] = data.new_val;
  // });
});
