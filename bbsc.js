// The Google Sheet must be shared as "Anyone with the link can view".
var sheetId = '1IZymUvElVyn4mepHHDWK5VlY_xvC3UVfPOcfb-ohOtE';
function sheetUri(tab) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
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

function parseCsv(text) {
    var rows = [], row = [], field = '', quoted = false;
    for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (quoted) {
            if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') { quoted = false; }
            else { field += c; }
        } else if (c === '"') { quoted = true; }
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') { i++; }
            row.push(field); rows.push(row); row = []; field = '';
        } else { field += c; }
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
}

function readSheet(tab) {
    return fetch(sheetUri(tab))
        .then(r => {
            if (!r.ok) { throw new Error(`Could not load the ${tab} sheet (${r.status})`); }
            return r.text();
        })
        .then(text => {
            var [header, ...rows] = parseCsv(text);
            header = header.map(h => h.trim());
            return rows.map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] || '').trim()])));
        });
}

var months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

// Sheet dates look like "14-Jun-19"; parse explicitly because Date.parse handles that inconsistently across browsers.
function parseSheetDate(value) {
    var m = /^(\d{1,2})-([a-z]{3})-(\d{2}|\d{4})$/i.exec(value);
    if (!m || !(m[2].toLowerCase() in months)) { return NaN; }
    var year = Number(m[3]);
    return new Date(year < 100 ? 2000 + year : year, months[m[2].toLowerCase()], Number(m[1])).getTime();
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderDate(date){
    const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }) 
    const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat .formatToParts(date); 
    return `${day}-${month}-${year}`;
}

function renderEvent(element, event)
{
    const date = renderDate(event.date);
    element.html(`<strong>${date}  @ ${escapeHtml(event.host)}</strong>&nbsp;<span>${escapeHtml(event.comment)}</span>`);
}

Promise.all([readSheet('Whisky'), readSheet('Events')])
.then(([whiskyRows, eventRows]) => {
    var table =  $('#Whiskies tbody');
    var nextEvent = $('#next-event-data');
    var pastEvents = $('#past-events ul');

    var whiskies = whiskyRows
        .map(w => ({name: w.Summary || w.Whisky, date: parseSheetDate(w.Date)}))
        .filter(w => w.name && !isNaN(w.date));
    var events = eventRows
        .map(e => ({host: e.Host, date: parseSheetDate(e.Date), comment: e.Comment}))
        .filter(e => !isNaN(e.date));
    sort(events, 'date', true);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var next = events.filter(e => e.date >= today)[0];
    var past =  events.filter(e => e.date < today)
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
            table.append('<tr><td>' + renderDate(w.date) + '</td><td>' +  escapeHtml(w.name) + '</td></tr>')  
        });
       
    };

    renderWhiskyList(false, true);

    $('.toggle-sort').click((e) => {

        renderWhiskyList(e.target.id == "sort-name", $(e.target).hasClass('asc'));
        $(e.target).toggleClass('asc');
    });
    
    window.data = events;
   
})
.catch(err => {
    console.error(err);
    $('#next-event-data').text('Could not load the club data - try again later.');
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