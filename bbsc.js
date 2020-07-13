fetch('full.json')
.then(r => r.json())
.then(data => {
    var table =  $('#Whiskies tbody');
    var names = data.feed.entry.filter(e => e.gs$cell.col === "1" && e.gs$cell.row != "1")
    .map(e => e.content.$t);
    var dates = data.feed.entry.filter(e => e.gs$cell.col === "2" && e.gs$cell.row != "1")
    .map(e => e.content.$t);

    var whiskies = names.map((n, i) => ({name: n, date: dates[i]}));

    whiskies.forEach(w => {
        table.append('<tr><td>' + w.date + '</td><td>' +  w.name + '</td></tr>')  
    });
    
    window.data = data;
   
});
