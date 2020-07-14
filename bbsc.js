var dataUri = 'https://spreadsheets.google.com/feeds/cells/1IZymUvElVyn4mepHHDWK5VlY_xvC3UVfPOcfb-ohOtE/1/public/full?alt=json'
//dataUri = 'full.json';

function getColumn(data, col)
{
 return data.feed.entry.filter(e => e.gs$cell.col === col && e.gs$cell.row != "1")
 .map(e => e.content.$t);
}

function renderEvent(element, event)
{
    const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }) 
    const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat .formatToParts(event.date); 

    element.html(`<strong>${day}-${month}-${year}  @ ${event.host}</strong><span>${event.comment}</span>`);
}

fetch(dataUri)
.then(r => r.json())
.then(data => {
    var table =  $('#Whiskies tbody');
    var nextEvent = $('#next-event-data');
    var pastEvents = $('#past-events ul');
    var names = getColumn(data, "1");
    var dates = getColumn(data, "2");
    
    var eventHosts = getColumn(data, "4");
    var eventDates = getColumn(data, "5");
    var eventComments = getColumn(data, "6");
    


    var whiskies = names.map((n, i) => ({name: n, date: dates[i]}));
    var events = eventHosts.map((h, i) => ({host: h, date: Date.parse(eventDates[i]), comment: eventComments[i]}));
    var now = new Date();
    var next = events.filter(e => e.date > now)[0];
    var past =  events.filter(e => e.date < now)
    if (next) {
        renderEvent(nextEvent, next);
    }

    past.forEach(p => {
        var li = document.createElement('li');
        renderEvent($(li), p);
        pastEvents.append(li);
    });
    whiskies.forEach(w => {
        table.append('<tr><td>' + w.date + '</td><td>' +  w.name + '</td></tr>')  
    });
    
    window.data = events;
   
});

var page = '#next-event';
$('.nav-link').click(l => {
    $(page).hide();
    $(l.target.hash).show();
    page = l.target.hash;
    $('#navbarsExampleDefault').removeClass('show');
});
