fetch('full.json')
.then(r => r.json())
.then(data => {
    var table =  $('#Whiskies tbody');
    data.feed.entry.filter(e => e.gs$cell.col === "1" && e.gs$cell.row != "1")
    .forEach(e => {
        console.log(e.content.$t, table[0]);
        table.append('<tr><td>?</td><td>' +  e.content.$t + '</td></tr>');
    });
    window.data = data;
   
});
