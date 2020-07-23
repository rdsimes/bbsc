var dataUri = 'https://spreadsheets.google.com/feeds/cells/1IZymUvElVyn4mepHHDWK5VlY_xvC3UVfPOcfb-ohOtE/1/public/full?alt=json'
//dataUri = 'full.json';
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }

function getColumn(data, col)
{
 return data.feed.entry.filter(e => e.gs$cell.col === col && e.gs$cell.row != "1")
 .map(e => e.content.$t);
}

function sort(array, field, asc){
    array.sort((a, b) => {
        if (a[field] < b[field]){
            return asc ? -1 : 1;
        }
        if (a[field] > b[field]){
            return asc ? 1 : -1;
        }
        return 0;
    });
}

function renderDate(date){
    const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }) 
    const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat .formatToParts(date); 
    return `${day}-${month}-${year}`;
}

function renderEvent(element, event)
{
    const date = renderDate(event.date);
    element.html(`<strong>${date}  @ ${event.host}</strong>&nbsp;<span>${event.comment}</span>`);
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
    


    var whiskies = names.map((n, i) => ({name: n, date: Date.parse(dates[i])}));
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

    var renderWhiskyList = function(byName, asc){
        table.html('');
        if (byName) {
            sort(whiskies, 'name', asc);
        } else {
            sort(whiskies, 'date', asc);
        }
        whiskies.forEach(w => {
            table.append('<tr><td>' + renderDate(w.date) + '</td><td>' +  w.name + '</td></tr>')  
        });
       
    };

    renderWhiskyList(false, true);

    $('.toggle-sort').click((e) => {

        renderWhiskyList(e.target.id == "sort-name", $(e.target).hasClass('asc'));
        $(e.target).toggleClass('asc');
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


let installPromotion = document.getElementById('install-prompt');
let buttonInstall = document.getElementById('button-install');

function showInstallPromotion(){
    installPromotion.classList.toggle('hide');
}

function hideInstallPromotion(){
    installPromotion.classList.toggle('hide');
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  showInstallPromotion();
});

buttonInstall.addEventListener('click', (e) => {
    // Hide the app provided install promotion
    hideInstallPromotion();
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    });
  });