/* script.js - 118 San Marino Manutenzione - Logica Completa */

const STORAGE_KEY_FLOTTA = 'flottaDB_118_SanMarino';
const STORAGE_KEY_TICKETS = 'activeTickets_118_SanMarino';
const STORAGE_KEY_NOTES = 'calendarNotes_118_SanMarino';
const STORAGE_KEY_WASH = 'washHistoryDB_118_SanMarino';

let flottaDB = localStorage.getItem(STORAGE_KEY_FLOTTA) ? JSON.parse(localStorage.getItem(STORAGE_KEY_FLOTTA)) : { 'Falco 27': [], 'Falco 28': [], 'Falco 29': [], 'Falco 30': [], 'Falco 31': [] };
let activeTickets = localStorage.getItem(STORAGE_KEY_TICKETS) ? JSON.parse(localStorage.getItem(STORAGE_KEY_TICKETS)) : [];
let calendarNotes = localStorage.getItem(STORAGE_KEY_NOTES) ? JSON.parse(localStorage.getItem(STORAGE_KEY_NOTES)) : [];
let washDB = localStorage.getItem(STORAGE_KEY_WASH) ? JSON.parse(localStorage.getItem(STORAGE_KEY_WASH)) : [];

let mezzoSelezionatoPerGomme = '';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

function salvaDati() {
    localStorage.setItem(STORAGE_KEY_FLOTTA, JSON.stringify(flottaDB));
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(activeTickets));
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(calendarNotes));
    localStorage.setItem(STORAGE_KEY_WASH, JSON.stringify(washDB));
    renderCalendar(currentMonth, currentYear);
}

// --- HELPER CATEGORIE AUTOMATICHE ---
function determinaCategoria(descrizione) {
    const d = descrizione.toLowerCase();
    if(d.includes("batteria") || d.includes("luci") || d.includes("sirena") || d.includes("radio") || d.includes("fari") || d.includes("elettric")) return "Elettrica";
    if(d.includes("freni") || d.includes("motore") || d.includes("olio") || d.includes("cambio") || d.includes("frizione") || d.includes("tagliando")) return "Meccanica";
    if(d.includes("gomme") || d.includes("pneumatici") || d.includes("ruota") || d.includes("foratura")) return "Pneumatici";
    if(d.includes("paraurti") || d.includes("fiancata") || d.includes("specchietto") || d.includes("bollo") || d.includes("graffi")) return "Carrozzeria";
    if(d.includes("barella") || d.includes("monitor") || d.includes("ossigeno") || d.includes("defibrillatore")) return "Sanitaria";
    return "Altro";
}

function toggleEmailInput() {
    const isChecked = document.getElementById('checkInviaEmail').checked;
    document.getElementById('divEmailDestinatari').style.display = isChecked ? 'block' : 'none';
}

function toggleEmailNotaInput() {
    const isChecked = document.getElementById('checkEmailNota').checked;
    document.getElementById('divEmailDestinatariNota').style.display = isChecked ? 'block' : 'none';
}

function renderCalendar(month, year) {
    const calendarDays = document.getElementById('calendar-days');
    const monthYearText = document.getElementById('calendar-month-year');
    calendarDays.innerHTML = "";
    monthYearText.innerText = `${months[month]} ${year}`;
    const firstDay = new Date(year, month, 1).getDay();
    const startingDay = firstDay === 0 ? 6 : firstDay - 1; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const todayZero = new Date();
    todayZero.setHours(0,0,0,0);

    // CALCOLO PRIMO LUNEDÌ DEL MESE
    let firstMondayDate = -1;
    for(let d = 1; d <= 7; d++) {
        const tempDate = new Date(year, month, d);
        if(tempDate.getDay() === 1) { 
            firstMondayDate = d;
            break;
        }
    }

    for (let i = 0; i < startingDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day', 'other-month');
        calendarDays.appendChild(dayDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        
        const currentDate = new Date(year, month, i);
        const currentLoopDateZero = new Date(year, month, i); 
        currentLoopDateZero.setHours(0,0,0,0);
        
        const currentDateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const displayDateStr = `${String(i).padStart(2, '0')}/${String(month+1).padStart(2, '0')}/${year}`;
        
        dayDiv.onclick = () => apriGestioneNote(currentDateStr);
        
        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }
        
        const dayNum = document.createElement('div');
        dayNum.className = 'fw-bold mb-1 text-end small text-muted';
        dayNum.innerText = i;
        dayDiv.appendChild(dayNum);
        
        if (i === firstMondayDate) {
            const evt = document.createElement('div');
            evt.classList.add('cal-event', 'event-lavaggio-periodico');
            evt.innerHTML = `<i class="fas fa-shower"></i> LAVAGGIO PERIODICO`;
            evt.title = "Ogni primo Lunedì del mese: Lavaggio Periodico Ambulanza";
            dayDiv.appendChild(evt);
        }

        calendarNotes.forEach(n => {
            if (n.date === currentDateStr) {
                const evt = document.createElement('div');
                evt.classList.add('cal-event', 'event-nota');
                evt.title = n.text; 
                evt.innerHTML = `<i class="fas fa-sticky-note me-1"></i>${n.text}`;
                dayDiv.appendChild(evt);
            }
        });

        activeTickets.forEach(t => {
            const problemaLower = t.problema ? t.problema.toLowerCase() : '';
            if (problemaLower.includes('lavaggio') || problemaLower.includes('sanificazione') || problemaLower.includes('pulizia')) return;
            
            const mezzoShort = t.mezzo.replace('Falco ', 'Fal.');

            // Segnalazione
            if (t.dataSegnalazione && t.stato === 'segnalato') {
                const parts = t.dataSegnalazione.split(' ')[0].split('/');
                if(parts.length === 3) {
                    const segnDate = `${parts[2]}-${parts[1]}-${parts[0]}`; 
                    if(segnDate === currentDateStr) {
                        const evt = document.createElement('div');
                        evt.classList.add('cal-event', 'event-segnalazione');
                        evt.title = `Segnalazione: ${t.problema}`;
                        evt.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mezzoShort}`;
                        evt.onclick = (e) => { e.stopPropagation(); mostraDettaglioCalendario('ticket', t.id); };
                        dayDiv.appendChild(evt);
                    }
                }
            }

            // Appuntamento
            if (t.dataAppuntamento === currentDateStr && t.stato === 'segnalato') {
                const evt = document.createElement('div');
                evt.classList.add('cal-event', 'event-appuntamento');
                evt.title = `Appuntamento: ${t.problema}`;
                evt.innerHTML = `<i class="fas fa-clock"></i> ${mezzoShort} (${t.dataAppuntamentoOra || '??:??'})`;
                evt.onclick = (e) => { e.stopPropagation(); mostraDettaglioCalendario('ticket', t.id); };
                dayDiv.appendChild(evt);
            }

            // In Officina (Range)
            if (t.stato === 'in_officina') {
                const parts = t.dataIngresso.split(' ')[0].split('/');
                if(parts.length === 3) {
                    const ingressDateObj = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
                    ingressDateObj.setHours(0,0,0,0);
                    
                    if (currentLoopDateZero >= ingressDateObj && currentLoopDateZero <= todayZero) {
                        const evt = document.createElement('div');
                        evt.classList.add('cal-event', 'event-officina');
                        evt.title = `In Officina: ${t.problema}`;
                        evt.innerHTML = `<i class="fas fa-truck-medical"></i><i class="fas fa-wrench ms-1" style="font-size: 0.7em;"></i> ${mezzoShort}`;
                        evt.onclick = (e) => { e.stopPropagation(); mostraDettaglioCalendario('ticket', t.id); };
                        dayDiv.appendChild(evt);
                    }
                }
                
                // RITIRO PREVISTO LAMPEGGIANTE
                if(t.dataStimataConsegna && t.dataStimataConsegna === currentDateStr) {
                    const evt = document.createElement('div');
                    evt.classList.add('cal-event', 'event-ritiro-previsto');
                    evt.title = `RITIRO PREVISTO: ${t.mezzo}`;
                    evt.innerHTML = `<i class="fas fa-check-circle"></i> RITIRO: ${mezzoShort}`;
                    evt.onclick = (e) => { e.stopPropagation(); mostraDettaglioCalendario('ticket', t.id); };
                    dayDiv.appendChild(evt);
                }
            }
        });

        // Closed Tickets (History)
        Object.keys(flottaDB).forEach(veicolo => {
            flottaDB[veicolo].forEach(record => {
                if (record.type === 'lavaggio') return;
                const problemaLower = record.problema ? record.problema.toLowerCase() : '';
                if (problemaLower.includes('lavaggio') || problemaLower.includes('sanificazione') || problemaLower.includes('pulizia')) return;
                
                const mezzoShort = veicolo.replace('Falco ', 'Fal.');

                if(record.dataChiusura && record.dataChiusura.startsWith(displayDateStr)) {
                    const evt = document.createElement('div');
                    evt.classList.add('cal-event', 'event-chiuso');
                    evt.title = `Ritiro: ${record.problema}`;
                    evt.innerText = `OK: ${mezzoShort}`;
                    evt.onclick = (e) => { e.stopPropagation(); mostraDettaglioCalendario('storico', record.id, veicolo); };
                    dayDiv.appendChild(evt);
                }
            });
        });
        
        calendarDays.appendChild(dayDiv);
    }
}

function playBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start(ctx.currentTime);
        osc.frequency.setValueAtTime(0, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); 
        osc.stop(ctx.currentTime + 0.4);
    } catch(e) { console.log("Impossibile riprodurre audio", e); }
}

// --- AVVISI CRITICI ---
function checkAvvisiCritici(forceOpen = false) {
    const containerGuasti = document.getElementById('lista-alert-guasti');
    const containerApp = document.getElementById('lista-alert-appuntamenti');
    const boxGuasti = document.getElementById('alert-guasti-container');
    const boxApp = document.getElementById('alert-appuntamenti-container');
    const msgNoAlerts = document.getElementById('no-alerts-msg');
    containerGuasti.innerHTML = ''; containerApp.innerHTML = '';
    let hasGuasti = false; let hasAppuntamenti = false;
    let shouldBeep = false;
    
    const guastiAttivi = activeTickets.filter(t => t.stato === 'segnalato');
    if (guastiAttivi.length > 0) {
        hasGuasti = true;
        guastiAttivi.forEach(t => {
            containerGuasti.innerHTML += `<div class="alert-board-item alert-guasto"><div class="d-flex justify-content-between"><span class="fw-bold text-danger"><i class="fas fa-exclamation-circle me-2"></i>${t.mezzo}</span><span class="small text-muted">${t.dataSegnalazione}</span></div><div class="mt-1">${t.problema}</div><div class="small text-muted mt-1 fst-italic">Segnalato da: ${t.operatoreSegnalazione}</div></div>`;
        });
    }

    const today = new Date(); 
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = today.toISOString().split('T')[0]; 
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // CHECK 1: APPUNTAMENTI
    const appuntamentiAttivi = activeTickets.filter(t => t.stato === 'segnalato' && t.dataAppuntamento);
    appuntamentiAttivi.forEach(t => {
        if (t.dataAppuntamento === todayStr || t.dataAppuntamento === tomorrowStr) {
            hasAppuntamenti = true;
            const isOggi = t.dataAppuntamento === todayStr;
            const styleClass = isOggi ? 'alert-appuntamento-oggi' : 'alert-appuntamento-domani';
            const labelGiorno = isOggi ? '<span class="badge bg-danger">OGGI</span>' : '<span class="badge bg-info text-dark">DOMANI</span>';
            containerApp.innerHTML += `<div class="alert-board-item ${styleClass}"><div class="d-flex justify-content-between align-items-center mb-1"><span class="fw-bold fs-5">${labelGiorno} ${t.mezzo}</span><span class="fw-bold text-dark"><i class="fas fa-clock"></i> ${t.dataAppuntamentoOra || '??:??'}</span></div><div class="fw-bold">APPUNTAMENTO OFFICINA: ${t.officinaAppuntamento}</div><div class="small mt-1">Motivo: ${t.problema}</div></div>`;
        }
    });

    // CHECK 2: RITIRI
    const officinaAttivi = activeTickets.filter(t => t.stato === 'in_officina' && t.dataStimataConsegna);
    officinaAttivi.forEach(t => {
        if (t.dataStimataConsegna === todayStr || t.dataStimataConsegna === tomorrowStr) {
            hasAppuntamenti = true;
            const isOggi = t.dataStimataConsegna === todayStr;
            if(isOggi) shouldBeep = true;
            const styleClass = isOggi ? 'alert-ritiro-fluo' : 'alert-ritiro-domani'; 
            const labelGiorno = isOggi ? '<span class="badge bg-dark text-warning">OGGI - RITIRO URGENTE</span>' : '<span class="badge bg-warning text-dark">DOMANI</span>';
            containerApp.innerHTML += `<div class="alert-board-item ${styleClass}"><div class="d-flex justify-content-between align-items-center mb-1"><span class="fw-bold fs-5">${labelGiorno} ${t.mezzo}</span><span class="fw-bold text-dark"><i class="fas fa-clock"></i> ${t.dataStimataConsegnaOra || '??:??'}</span></div><div class="fw-bold">PREVISTO RITIRO DA: ${t.officina}</div><div class="small mt-1">Nota: ${t.problema}</div></div>`;
        }
    });

    boxGuasti.style.display = hasGuasti ? 'block' : 'none'; 
    boxApp.style.display = hasAppuntamenti ? 'block' : 'none'; 
    msgNoAlerts.style.display = (!hasGuasti && !hasAppuntamenti) ? 'block' : 'none';
    
    if (hasGuasti || hasAppuntamenti || forceOpen) { 
        new bootstrap.Modal(document.getElementById('modalAvvisiIniziali')).show(); 
        if(shouldBeep) setTimeout(playBeep, 500);
    }
}

function apriGestioneNote(dateStr) {
    document.getElementById('note-data-corrente').value = dateStr;
    const [y, m, d] = dateStr.split('-');
    document.getElementById('titolo-modal-note').innerText = `Note del ${d}/${m}/${y}`;
    document.getElementById('input-nuova-nota').value = '';
    aggiornaListaNoteModal(dateStr);
    new bootstrap.Modal(document.getElementById('modalNoteGiornaliere')).show();
}
function aggiornaListaNoteModal(dateStr) {
    const container = document.getElementById('lista-note-giorno');
    container.innerHTML = '';
    const noteGiorno = calendarNotes.filter(n => n.date === dateStr);
    if (noteGiorno.length === 0) {
        container.innerHTML = '<div class="text-center text-muted small fst-italic py-2">Nessuna nota presente.</div>';
    } else {
        noteGiorno.forEach(n => {
            const row = document.createElement('div');
            row.className = "d-flex justify-content-between align-items-center border-bottom py-2";
            row.innerHTML = `<span><i class="fas fa-circle small text-primary me-2" style="font-size: 0.5rem; color: #6f42c1 !important;"></i>${n.text}</span><button class="btn btn-sm btn-outline-danger border-0" onclick="eliminaNota(${n.id})"><i class="fas fa-trash-alt"></i></button>`;
            container.appendChild(row);
        });
    }
}

function aggiungiNota() {
    const text = document.getElementById('input-nuova-nota').value.trim(); 
    const dateStr = document.getElementById('note-data-corrente').value;
    if (text && dateStr) { 
        if(document.getElementById('checkEmailNota').checked) {
            const recipients = document.getElementById('emailDestinatariNota').value;
            const subject = encodeURIComponent("AVVISO: NUOVA NOTA IMPORTANTE - 118 San Marino");
            const [y, m, d] = dateStr.split('-');
            const body = encodeURIComponent(`ATTENZIONE,\nÈ stata inserita una nuova nota importante per il: ${d}/${m}/${y}.\n\nNOTA:\n${text}`);
            window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
        }
        calendarNotes.push({ id: Date.now(), date: dateStr, text: text }); 
        salvaDati(); aggiornaListaNoteModal(dateStr); 
        document.getElementById('input-nuova-nota').value = ''; 
        document.getElementById('checkEmailNota').checked = false; toggleEmailNotaInput();
    }
}
function eliminaNota(id) {
    if(confirm("Eliminare questa nota?")) { const dateStr = document.getElementById('note-data-corrente').value; calendarNotes = calendarNotes.filter(n => n.id !== id); salvaDati(); aggiornaListaNoteModal(dateStr); }
}

function mostraDettaglioCalendario(tipo, id, veicoloKey) {
    let record = null; let htmlContent = ''; let coloreHeader = 'bg-primary'; let iconaHeader = 'fa-info-circle'; let badgeOfficina = '';
    if (tipo === 'ticket') {
        record = activeTickets.find(t => t.id === id); if (!record) return;
        
        if (record.stato === 'in_officina') {
            badgeOfficina = '<span class="badge bg-danger ms-2 fs-6" style="vertical-align: middle;">IN OFFICINA</span>';
            coloreHeader = 'bg-danger text-white'; iconaHeader = 'fa-tools';
            const dataPrevista = record.dataStimataConsegna ? new Date(record.dataStimataConsegna).toLocaleDateString('it-IT') : '-';
            const oraPrevista = record.dataStimataConsegnaOra || '';
            const dataOra = oraPrevista ? `${dataPrevista} ore ${oraPrevista}` : dataPrevista;

            let noteOff = '';
            if (record.noteOfficina) {
                if (Array.isArray(record.noteOfficina)) {
                    noteOff = '<br><div class="alert alert-light border mt-2 p-2"><small><strong>Diario Officina:</strong></small>';
                    record.noteOfficina.forEach(n => { noteOff += `<div class="small text-muted border-bottom pb-1 mb-1"><strong>${n.date}</strong>: ${n.text}</div>`; });
                    noteOff += '</div>';
                } else {
                    noteOff = `<br><div class='alert alert-light border mt-2 p-2'><small><strong>Note Officina:</strong> ${record.noteOfficina}</small></div>`;
                }
            }
            
            htmlContent = `<table class="table table-bordered detail-table mb-0"><tr><th>Veicolo</th><td class="fw-bold text-danger">${record.mezzo} <span class="text-muted small">(${targhe[record.mezzo]})</span></td></tr><tr><th>Problema</th><td>${record.problema}${noteOff}</td></tr><tr><th>Officina</th><td class="fw-bold">${record.officina}</td></tr><tr><th>Ingresso in Off.</th><td>${record.dataIngresso}</td></tr><tr><th>Data Ritiro Prev.</th><td><strong>${dataOra}</strong></td></tr><tr><th>Portato da</th><td>${record.operatoreConsegna}</td></tr><tr><th>Segnalato il</th><td>${record.dataSegnalazione} (da ${record.operatoreSegnalazione})</td></tr></table>`;
        } else if (record.stato === 'segnalato') {
            const hasAppointment = record.dataAppuntamento && record.dataAppuntamento !== "";
            coloreHeader = hasAppointment ? 'bg-warning text-dark' : 'bg-info text-dark';
            iconaHeader = hasAppointment ? 'fa-calendar-check' : 'fa-exclamation-circle';
            const statoText = hasAppointment ? 'Appuntamento Fissato' : 'Appuntamento da fissare';
            const statoBadge = hasAppointment ? 'bg-warning text-dark' : 'bg-info text-dark';
            htmlContent = `<table class="table table-bordered detail-table mb-0"><tr><th>Veicolo</th><td class="fw-bold">${record.mezzo} <span class="text-muted small">(${targhe[record.mezzo]})</span></td></tr><tr><th>Problema</th><td>${record.problema}</td></tr><tr><th>Stato</th><td><span class="badge ${statoBadge}">${statoText}</span></td></tr><tr><th>Data Appuntamento</th><td class="fw-bold">${record.dataAppuntamento || '-'} ${record.dataAppuntamentoOra ? 'ore ' + record.dataAppuntamentoOra : ''}</td></tr><tr><th>Presso Officina</th><td>${record.officinaAppuntamento || '-'}</td></tr><tr><th>Preso da</th><td>${record.operatoreAppuntamento || '-'}</td></tr><tr><th>Segnalato il</th><td>${record.dataSegnalazione} (da ${record.operatoreSegnalazione})</td></tr></table>`;
        } 
    } else if (tipo === 'storico') {
        record = flottaDB[veicoloKey].find(r => r.id === id); if (!record) return;
        coloreHeader = 'bg-success text-white'; iconaHeader = 'fa-check-circle';
        htmlContent = `<table class="table table-bordered detail-table mb-0"><tr><th>Veicolo</th><td class="fw-bold text-success">${record.mezzo} <span class="text-muted small">(${targhe[record.mezzo]})</span></td></tr><tr><th>Categoria</th><td>${record.categoria || 'Generico'}</td></tr><tr><th>Segnalazione:</th><td>${record.problema}</td></tr><tr><th>Lavoro eseguito:</th><td>${record.intervento}</td></tr><tr><th>Officina</th><td>${record.officina}</td></tr><tr><th>Segnalato da</th><td>${record.operatoreSegnalazione} (${record.dataSegnalazione})</td></tr><tr><th>Portato da</th><td>${record.operatoreConsegna} (${record.dataIngresso})</td></tr><tr><th>Ritirato da</th><td>${record.operatoreRitiro}</td></tr><tr><th>CONCLUSO IL</th><td class="fw-bold">${record.dataChiusura}</td></tr></table>`;
    }
    const modalHeader = document.querySelector('#modalDettaglioCalendario .modal-header'); modalHeader.className = `modal-header ${coloreHeader}`;
    document.querySelector('#modalDettaglioCalendario .modal-title').innerHTML = `<i class="fas ${iconaHeader} me-2"></i>Dettaglio Lavoro ${badgeOfficina}`;
    document.getElementById('contenutoDettaglioCal').innerHTML = htmlContent;
    new bootstrap.Modal(document.getElementById('modalDettaglioCalendario')).show();
}

function cambiaMese(dir) { currentMonth += dir; if (currentMonth < 0) { currentMonth = 11; currentYear--; } else if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(currentMonth, currentYear); }
function apriModalAppuntamento(id) { const t = activeTickets.find(x => x.id === id); if(!t) return; document.getElementById('app-mezzo').innerText = t.mezzo; document.getElementById('app-id-ticket').value = id; document.getElementById('app-data').value = ''; document.getElementById('app-ora').value = ''; document.getElementById('app-officina').value = ''; document.getElementById('app-operatore').value = ''; document.getElementById('app-note').value = t.noteAppuntamento || ''; document.getElementById('app-salva-pc').checked = true; new bootstrap.Modal(document.getElementById('modalAppuntamento')).show(); }
function salvaAppuntamento() { const id = parseInt(document.getElementById('app-id-ticket').value); const d = document.getElementById('app-data').value; const h = document.getElementById('app-ora').value; const off = document.getElementById('app-officina').value; const op = document.getElementById('app-operatore').value; const note = document.getElementById('app-note').value; const exportICS = document.getElementById('app-salva-pc').checked; if(!d || !h || !op) { alert("Inserisci Data, Ora e Operatore!"); return; } const idx = activeTickets.findIndex(x => x.id === id); if(idx !== -1) { const ticket = activeTickets[idx]; ticket.dataAppuntamento = d; ticket.dataAppuntamentoOra = h; ticket.officinaAppuntamento = off; ticket.operatoreAppuntamento = op; ticket.noteAppuntamento = note; salvaDati(); aggiornaInterfacciaGrafica(); bootstrap.Modal.getInstance(document.getElementById('modalAppuntamento')).hide(); if(exportICS) { downloadICS(ticket, d, h, off, note); } setTimeout(() => { if(confirm("Vuoi generare l'email per l'Economato con i dettagli dell'appuntamento?")) { const recipients = "segreteria.economato@iss.sm,milena.dolcini@iss.sm,floriana.serra@iss.sm,alex.piselli@iss.sm,stefania.frisoni@iss.sm"; const subject = encodeURIComponent(`Manutenzione ${ticket.mezzo} - Appuntamento Officina`); const body = encodeURIComponent(`All'attenzione dell'Economato,\n\nSi segnala la seguente manutenzione:\n\nVeicolo: ${ticket.mezzo}\nGuasto/Problema: ${ticket.problema}\n\nL'appuntamento è stato fissato presso: ${off}\nPer il giorno: ${d} alle ore ${h}\nNote: ${note}\n\nCordiali saluti,\n${op}`); window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`; } }, 500); } }
function modificaAppuntamento(id) { const t = activeTickets.find(x => x.id === id); if(!t) return; document.getElementById('app-mezzo').innerText = t.mezzo; document.getElementById('app-id-ticket').value = id; document.getElementById('app-data').value = t.dataAppuntamento || ''; document.getElementById('app-ora').value = t.dataAppuntamentoOra || ''; document.getElementById('app-officina').value = t.officinaAppuntamento || ''; document.getElementById('app-operatore').value = t.operatoreAppuntamento || ''; document.getElementById('app-note').value = t.noteAppuntamento || ''; document.getElementById('app-salva-pc').checked = false; new bootstrap.Modal(document.getElementById('modalAppuntamento')).show(); }
function cancellaAppuntamento(id) { if(confirm("Sei sicuro di voler ANNULLARE l'appuntamento?")) { const idx = activeTickets.findIndex(x => x.id === id); if(idx !== -1) { activeTickets[idx].dataAppuntamento = ''; activeTickets[idx].dataAppuntamentoOra = ''; activeTickets[idx].officinaAppuntamento = ''; activeTickets[idx].operatoreAppuntamento = ''; activeTickets[idx].noteAppuntamento = ''; salvaDati(); aggiornaInterfacciaGrafica(); } } }
function downloadICS(ticket, date, time, location, note) { const cleanDate = date.replace(/-/g, ''); const cleanTime = time.replace(/:/g, ''); let [h, m] = time.split(':').map(Number); let endH = (h + 1) % 24; let endDate = cleanDate; const cleanEndTime = String(endH).padStart(2, '0') + String(m).padStart(2, '0'); const startStr = `${cleanDate}T${cleanTime}00`; const endStr = `${endDate}T${cleanEndTime}00`; const description = `Veicolo: ${ticket.mezzo}\\nProblema: ${ticket.problema}\\nOfficina: ${location}\\nNote: ${note || ''}`; const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Gestionale118//SanMarino//IT\nCALSCALE:GREGORIAN\nBEGIN:VEVENT\nSUMMARY:Manutenzione ${ticket.mezzo} - ${location}\nDTSTART:${startStr}\nDTEND:${endStr}\nLOCATION:${location}\nDESCRIPTION:${description}\nSTATUS:CONFIRMED\nSEQUENCE:0\nBEGIN:VALARM\nTRIGGER:-PT15M\nDESCRIPTION:Reminder\nACTION:DISPLAY\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR`; const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' }); const link = document.createElement('a'); link.href = window.URL.createObjectURL(blob); link.setAttribute('download', `appuntamento_${ticket.mezzo.replace(' ', '_')}.ics`); document.body.appendChild(link); link.click(); document.body.removeChild(link); }
function editaTicket(id) { const t = activeTickets.find(x => x.id === id); if (!t) return; document.getElementById('edit-ticket-id').value = id; document.getElementById('edit-ticket-desc').value = t.problema; new bootstrap.Modal(document.getElementById('modalModificaTicket')).show(); }
function salvaModificaTicket() { const id = parseInt(document.getElementById('edit-ticket-id').value); const nuovoProblema = document.getElementById('edit-ticket-desc').value; const idx = activeTickets.findIndex(x => x.id === id); if(idx !== -1 && nuovoProblema.trim() !== "") { activeTickets[idx].problema = nuovoProblema; salvaDati(); aggiornaInterfacciaGrafica(); bootstrap.Modal.getInstance(document.getElementById('modalModificaTicket')).hide(); } }
function annullaTicket() { if(confirm("Sei sicuro di voler eliminare questa segnalazione?")) { const id = parseInt(document.getElementById('edit-ticket-id').value); const idx = activeTickets.findIndex(x => x.id === id); if(idx !== -1) { activeTickets.splice(idx, 1); salvaDati(); aggiornaInterfacciaGrafica(); bootstrap.Modal.getInstance(document.getElementById('modalModificaTicket')).hide(); } } }

// --- GESTIONE NOTE OFFICINA & DATA RITIRO (AGGIORNATO) ---
function apriModalNoteOfficina(id) {
    const t = activeTickets.find(x => x.id === id);
    if (!t) return;
    document.getElementById('update-note-id').value = id;
    document.getElementById('update-note-mezzo').innerText = t.mezzo;
    document.getElementById('update-note-data').value = t.dataStimataConsegna || ''; 
    document.getElementById('update-note-ora').value = t.dataStimataConsegnaOra || ''; 
    
    const listContainer = document.getElementById('lista-note-officina-modal');
    listContainer.innerHTML = '';
    
    if (t.noteOfficina) {
        if (Array.isArray(t.noteOfficina)) {
            if (t.noteOfficina.length === 0) {
                listContainer.innerHTML = '<div class="text-center text-muted small fst-italic py-2">Nessuna nota presente.</div>';
            } else {
                t.noteOfficina.forEach((n, index) => {
                    const item = document.createElement('div');
                    item.className = 'small border-bottom py-2 d-flex justify-content-between align-items-center';
                    const contentDiv = document.createElement('div');
                    contentDiv.innerHTML = `<span class="fw-bold text-primary" style="font-size:0.8rem">${n.date}</span>: <span id="text-note-${index}">${n.text}</span>`;
                    
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = "d-flex gap-1";
                    actionsDiv.innerHTML = `
                        <button class="btn btn-sm btn-outline-warning p-1" style="font-size:0.7rem;" onclick="preparaModificaNota(${id}, ${index})" title="Modifica"><i class="fas fa-pencil-alt"></i></button>
                        <button class="btn btn-sm btn-outline-danger p-1" style="font-size:0.7rem;" onclick="eliminaNotaOfficina(${id}, ${index})" title="Elimina"><i class="fas fa-trash"></i></button>
                    `;
                    item.appendChild(contentDiv); item.appendChild(actionsDiv);
                    listContainer.appendChild(item);
                });
            }
        } else {
            const item = document.createElement('div');
            item.className = 'small border-bottom py-1 text-muted fst-italic';
            item.innerHTML = `(Nota Vecchia): ${t.noteOfficina}`;
            listContainer.appendChild(item);
        }
    } else {
            listContainer.innerHTML = '<div class="text-center text-muted small fst-italic py-2">Nessuna nota presente.</div>';
    }
    
    document.getElementById('update-note-text').value = '';
    new bootstrap.Modal(document.getElementById('modalUpdateNoteOfficina')).show();
}

// --- NUOVE FUNZIONI PER GESTIONE NOTE ---
function eliminaNotaOfficina(ticketId, noteIndex) {
    if(confirm("Eliminare questa nota dall'elenco?")) {
        const idx = activeTickets.findIndex(x => x.id === ticketId);
        if (idx !== -1 && Array.isArray(activeTickets[idx].noteOfficina)) {
            activeTickets[idx].noteOfficina.splice(noteIndex, 1);
            salvaDati();
            bootstrap.Modal.getInstance(document.getElementById('modalUpdateNoteOfficina')).hide();
            setTimeout(() => apriModalNoteOfficina(ticketId), 200);
        }
    }
}

function preparaModificaNota(ticketId, noteIndex) {
    const idx = activeTickets.findIndex(x => x.id === ticketId);
    if (idx !== -1 && Array.isArray(activeTickets[idx].noteOfficina)) {
        const nota = activeTickets[idx].noteOfficina[noteIndex];
        document.getElementById('update-note-text').value = nota.text;
        if(confirm("Il testo della nota è stato copiato nel box 'Aggiungi Nuova Nota'.\nLa vecchia nota verrà rimossa ora. Procedere?")) {
            activeTickets[idx].noteOfficina.splice(noteIndex, 1);
            salvaDati();
            bootstrap.Modal.getInstance(document.getElementById('modalUpdateNoteOfficina')).hide();
            setTimeout(() => apriModalNoteOfficina(ticketId), 200);
        }
    }
}

function salvaNoteOfficina() {
    const id = parseInt(document.getElementById('update-note-id').value);
    const testo = document.getElementById('update-note-text').value;
    const dataRitiro = document.getElementById('update-note-data').value;
    const oraRitiro = document.getElementById('update-note-ora').value;
    
    const idx = activeTickets.findIndex(x => x.id === id);
    if (idx !== -1) {
        if (!activeTickets[idx].noteOfficina || typeof activeTickets[idx].noteOfficina === 'string') {
                const old = activeTickets[idx].noteOfficina;
                activeTickets[idx].noteOfficina = old ? [{ text: old, date: 'Precedente' }] : [];
        }

        if (testo.trim() !== "") {
            activeTickets[idx].noteOfficina.push({ text: testo, date: getTimestamp() });
        }
        
        activeTickets[idx].dataStimataConsegna = dataRitiro; 
        activeTickets[idx].dataStimataConsegnaOra = oraRitiro;
        
        salvaDati();
        aggiornaInterfacciaGrafica();
        bootstrap.Modal.getInstance(document.getElementById('modalUpdateNoteOfficina')).hide();
    }
}

function inviaEmailAggiornamento(id) {
    const t = activeTickets.find(x => x.id === id);
    if(!t) return;
    const recipients = "segreteria.economato@iss.sm,milena.dolcini@iss.sm,floriana.serra@iss.sm,alex.piselli@iss.sm,stefania.frisoni@iss.sm";
    const subject = encodeURIComponent(`R: SEGNALAZIONE GUASTO ${t.mezzo} - Aggiornamento Officina`);
    
    let noteText = "";
    if (Array.isArray(t.noteOfficina)) {
        t.noteOfficina.forEach(n => noteText += `${n.date}: ${n.text}\n`);
    } else {
        noteText = t.noteOfficina || "Nessuna nota";
    }
    
    const body = encodeURIComponent(`Gentile Economato,\n\nIn riferimento alla segnalazione precedente per il mezzo in oggetto, si invia il seguente aggiornamento:\n\nVeicolo: ${t.mezzo}\nOfficina: ${t.officina}\nProblema Iniziale: ${t.problema}\nData Ingresso: ${t.dataIngresso}\n\n--- STORICO NOTE & AGGIORNAMENTI ---\n${noteText}\n\nData Prevista Ritiro: ${t.dataStimataConsegna || 'Da definire'} ${t.dataStimataConsegnaOra ? 'ore '+t.dataStimataConsegnaOra : ''}\n\nCordiali saluti,\n118 San Marino Soccorso`);
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
}

// --- GESTIONE LAVAGGIO AMBULANZA ---
function apriModalLavaggio(mezzoPredefinito = '') {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    document.getElementById('lavaggio-data').value = `${year}-${month}-${day}`;
    document.getElementById('lavaggio-ora').value = `${hours}:${minutes}`;
    document.getElementById('lavaggio-operatore').value = '';
    document.getElementById('lavaggio-note').value = '';
    
    if(mezzoPredefinito) { document.getElementById('lavaggio-mezzo').value = mezzoPredefinito; }
    new bootstrap.Modal(document.getElementById('modalLavaggio')).show();
}

function salvaLavaggio() {
    const mezzo = document.getElementById('lavaggio-mezzo').value;
    const data = document.getElementById('lavaggio-data').value;
    const ora = document.getElementById('lavaggio-ora').value;
    const tipo = document.getElementById('lavaggio-tipo').value;
    const operatore = document.getElementById('lavaggio-operatore').value;
    const note = document.getElementById('lavaggio-note').value;

    if(!data || !operatore) { alert("Inserire almeno Data e Operatore."); return; }

    const [y, m, d] = data.split('-');
    const dataFmt = `${d}/${m}/${y} ${ora}`;

    washDB.push({
        id: Date.now(),
        mezzo: mezzo,
        data: dataFmt,
        timestamp: new Date(data + 'T' + ora).getTime(),
        tipo: tipo,
        operatore: operatore,
        note: note || '-'
    });

    salvaDati();
    bootstrap.Modal.getInstance(document.getElementById('modalLavaggio')).hide();
    aggiornaInterfacciaGrafica();
}

// --- NUOVO: GESTIONE STORICO LAVAGGI ---
function apriStoricoLavaggi() {
    renderStoricoLavaggi();
    bootstrap.Modal.getInstance(document.getElementById('modalLavaggio')).hide();
    new bootstrap.Modal(document.getElementById('modalStoricoLavaggi')).show();
}

function renderStoricoLavaggi() {
    const tbody = document.getElementById('tabellaStoricoLavaggi');
    tbody.innerHTML = '';
    if (washDB.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Nessun lavaggio registrato.</td></tr>';
        return;
    }
    const sortedWash = [...washDB].sort((a, b) => b.timestamp - a.timestamp);
    sortedWash.forEach(w => {
        tbody.innerHTML += `<tr><td>${w.data}</td><td class="fw-bold text-primary">${w.mezzo}</td><td><span class="badge bg-info text-dark">${w.tipo}</span></td><td>${w.operatore}</td><td class="text-muted small"><em>${w.note}</em></td><td class="text-end"><button class="btn btn-sm btn-outline-danger border-0" onclick="eliminaLavaggio(${w.id})" title="Elimina"><i class="fas fa-trash"></i></button></td></tr>`;
    });
}

function eliminaLavaggio(id) {
    if(confirm("Eliminare definitivamente questo lavaggio dallo storico?")) {
        washDB = washDB.filter(w => w.id !== id);
        salvaDati();
        renderStoricoLavaggi();
    }
}

function aggiornaInterfacciaGrafica() {
    const listSegnalati = document.getElementById('lista-segnalati'); const listOfficina = document.getElementById('lista-officina'); const cardSegnalati = document.getElementById('card-segnalati'); const cardOfficina = document.getElementById('card-officina'); const msgOk = document.getElementById('msg-tutto-ok');
    listSegnalati.innerHTML = ''; listOfficina.innerHTML = ''; let countSegnalati = 0; let countOfficina = 0;
    
    document.querySelectorAll('.vehicle-card').forEach(el => {
        el.classList.remove('stato-segnalato', 'stato-officina', 'stato-operativa'); 
        el.classList.add('stato-operativa'); 
        const id = el.id.replace('card-', '');
        const statusText = document.getElementById('status-text-' + id);
        if(statusText) statusText.innerText = "OPERATIVA";
        
        const alertWash = document.getElementById('wash-alert-' + id);
        const vehicleName = el.querySelector('.vehicle-name').innerText;
        
        const vehicleWashes = washDB.filter(w => w.mezzo === vehicleName);
        if (vehicleWashes.length > 0) {
            vehicleWashes.sort((a,b) => b.timestamp - a.timestamp);
            const lastWashTime = vehicleWashes[0].timestamp;
            const diffTime = Math.abs(new Date() - lastWashTime);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays > 30) {
                if(alertWash) { alertWash.style.display = 'flex'; alertWash.title = `Lavaggio Urgente! Ultimo lavaggio ${diffDays} giorni fa. Clicca per registrare.`; }
            } else {
                if(alertWash) alertWash.style.display = 'none';
            }
        } else {
            if(alertWash) { alertWash.style.display = 'flex'; alertWash.title = "Nessun lavaggio registrato! Clicca per registrare."; }
        }
    });

    activeTickets.forEach(ticket => {
        const cardVeicolo = document.getElementById('card-' + ticket.mezzo.replace(' ', ''));
        const statusText = document.getElementById('status-text-' + ticket.mezzo.replace(' ', ''));

        if (ticket.stato === 'segnalato') {
            countSegnalati++;
            let appHtml = ticket.dataAppuntamento ? 
                `<div class="mt-2 p-2 box-appuntamento-ok rounded small position-relative">
                    <div class="fw-bold text-success text-uppercase small mb-2 border-bottom border-success border-opacity-25 pb-1"><i class="fas fa-check-circle me-1"></i>APPUNTAMENTO PRENOTATO</div>
                    <div class="d-flex justify-content-between align-items-center border-bottom border-success border-opacity-50 pb-1 mb-1"><div><i class="fas fa-calendar-check me-1"></i><strong>${new Date(ticket.dataAppuntamento).toLocaleDateString('it-IT')}</strong> ore <strong>${ticket.dataAppuntamentoOra||'--:--'}</strong></div><div><button class="btn btn-sm btn-outline-dark p-1 ms-1" title="Modifica Appuntamento" onclick="modificaAppuntamento(${ticket.id})"><i class="fas fa-pencil-alt"></i></button><button class="btn btn-sm btn-outline-danger p-1 ms-1" title="Annulla Appuntamento" onclick="cancellaAppuntamento(${ticket.id})"><i class="fas fa-trash-alt"></i></button></div></div><div class="mt-1">Presso: <strong>${ticket.officinaAppuntamento || 'N/D'}</strong><br>Preso da: <em>${ticket.operatoreAppuntamento||'N/D'}</em>${ticket.noteAppuntamento ? `<br><i class="fas fa-sticky-note me-1"></i><em>${ticket.noteAppuntamento}</em>` : ''}</div></div>` 
                : `<button class="btn btn-sm btn-outline-warning text-dark mt-2" onclick="apriModalAppuntamento(${ticket.id})"><i class="far fa-calendar-alt me-1"></i> Fissa Appuntamento</button>`;
            const catBadge = ticket.categoria ? `<span class="badge bg-light text-secondary border me-1">${ticket.categoria}</span>` : '';
            
            const emailIcon = ticket.emailInviata ? '<i class="fas fa-check-circle text-success ms-1" title="Email Iniziale Inviata"></i>' : '<i class="far fa-circle text-muted ms-1" title="Email Iniziale NON Inviata"></i>';

            listSegnalati.innerHTML += `<tr><td><strong class="text-primary">${ticket.mezzo}</strong>${emailIcon} ${catBadge}<button class="btn btn-sm btn-light text-primary border-0 ms-1" onclick="editaTicket(${ticket.id})" title="Modifica Guasto"><i class="fas fa-pencil-alt"></i></button><br>${ticket.problema}</td><td>${appHtml}</td><td class="text-end"><button class="btn btn-sm btn-outline-dark text-nowrap" onclick="apriModalInviaOfficina(${ticket.id})"><i class="fas fa-tools me-2"></i>Porta in Officina</button></td></tr>`;
            
            if(cardVeicolo) {
                cardVeicolo.classList.remove('stato-operativa');
                cardVeicolo.classList.add('stato-segnalato');
                if(statusText) statusText.innerText = "IN ATTESA DI MANUTENZIONE";
            }

        } else if (ticket.stato === 'in_officina') {
            countOfficina++; 
            const catBadge = ticket.categoria ? `<span class="badge bg-light text-secondary border mb-1">${ticket.categoria}</span><br>` : '';
            
            let noteHtml = '';
            if (ticket.noteOfficina) {
                if (Array.isArray(ticket.noteOfficina)) {
                    noteHtml = '<div class="mt-2 text-start">';
                    ticket.noteOfficina.forEach(n => { noteHtml += `<div class="small text-muted border-bottom border-secondary border-opacity-10 pb-1 mb-1"><span class="text-primary fw-bold" style="font-size:0.75rem">${n.date}</span>: ${n.text}</div>`; });
                    noteHtml += '</div>';
                } else {
                    noteHtml = `<div class="mt-1 small text-primary border-top pt-1 border-primary border-opacity-25" style="background-color:rgba(0,85,165,0.05); padding:4px; border-radius:4px;"><i class="fas fa-info-circle me-1"></i><strong>Note:</strong> ${ticket.noteOfficina}</div>`;
                }
            }
            
            let dateStimataHtml = '<span class="text-muted small fst-italic">Non specificata</span>';
            if (ticket.dataStimataConsegna) {
                const ora = ticket.dataStimataConsegnaOra ? ` ore ${ticket.dataStimataConsegnaOra}` : '';
                dateStimataHtml = `<strong class="text-dark">${new Date(ticket.dataStimataConsegna).toLocaleDateString('it-IT')}${ora}</strong>`;
            }
            
            const emailIcon = ticket.emailInviata ? '<i class="fas fa-check-circle text-success ms-1" style="font-size: 1.1em;" title="Email Iniziale Inviata CORRETTAMENTE"></i>' : '<i class="far fa-circle text-muted ms-1" title="Email Iniziale NON Inviata"></i>';

            listOfficina.innerHTML += `<tr><td><strong class="text-danger">${ticket.mezzo}</strong>${emailIcon}<br>${catBadge}<span class="badge bg-secondary mb-1">${ticket.officina}</span><br><small class="text-muted fst-italic"><i class="fas fa-wrench me-1"></i>${ticket.problema}</small>${noteHtml}</td><td><small>${ticket.dataIngresso}</small><br>${ticket.operatoreConsegna}</td><td>${dateStimataHtml}</td><td class="text-end"><div class="d-flex flex-column gap-1 align-items-end"><button class="btn btn-sm btn-success text-nowrap w-100" onclick="apriModalChiusura(${ticket.id})"><i class="fas fa-check me-2"></i>RITIRO</button><button class="btn btn-sm btn-outline-primary text-nowrap w-100" style="font-size:0.8rem;" onclick="apriModalNoteOfficina(${ticket.id})"><i class="fas fa-edit me-1"></i> Note / Aggiorna</button><button class="btn btn-sm btn-primary text-nowrap w-100" style="font-size:0.8rem;" onclick="inviaEmailAggiornamento(${ticket.id})"><i class="fas fa-envelope-open-text me-1"></i> <i class="fas fa-arrow-right" style="font-size:0.7em;"></i> Email Aggiorn.</button></div></td></tr>`;
            
            if(cardVeicolo) {
                cardVeicolo.classList.remove('stato-operativa', 'stato-segnalato');
                cardVeicolo.classList.add('stato-officina');
                if(statusText) statusText.innerText = "IN OFFICINA";
            }
        }
    });
    document.getElementById('badge-segnalati').innerText = countSegnalati; document.getElementById('badge-officina').innerText = countOfficina;
    cardSegnalati.style.display = countSegnalati>0?'block':'none'; cardOfficina.style.display = countOfficina>0?'block':'none'; msgOk.style.display = (countSegnalati===0 && countOfficina===0)?'block':'none';
    renderCalendar(currentMonth, currentYear);
}

function getTimestamp() { const now=new Date(); return now.toLocaleDateString('it-IT')+' '+now.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'}); }
setInterval(() => { const n = new Date(); const d = n.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: '2-digit', year: 'numeric' }); const t = n.toLocaleTimeString('it-IT'); document.getElementById('orologio').innerText = `${d} - ${t}`; }, 1000);
function apriOpzioniRicerca() { const q=document.getElementById('globalSearchInput').value.trim(); if(q==="")return; document.getElementById('testoRicercaDisplay').innerText=q; new bootstrap.Modal(document.getElementById('modalSceltaRicerca')).show(); }
function eseguiRicerca(target) {
    bootstrap.Modal.getInstance(document.getElementById('modalSceltaRicerca')).hide(); const q=document.getElementById('globalSearchInput').value.toLowerCase(); const tb=document.getElementById('tabellaRisultati'); tb.innerHTML='';
    const list=target==='TUTTI'?Object.keys(flottaDB):[target]; let res=[]; list.forEach(v=>{flottaDB[v].forEach(r=>{if(`${r.dataSegnalazione} ${r.problema} ${r.officina} ${r.operatoreSegnalazione} ${r.operatoreConsegna} ${r.operatoreRitiro} ${r.intervento}`.toLowerCase().includes(q))res.push({v,...r})})});
    if(res.length===0)tb.innerHTML='<tr><td colspan="4" class="text-center p-3">Nessun risultato.</td></tr>'; else { res.reverse().forEach(r=>{tb.innerHTML+=`<tr><td class="fw-bold">${r.v}</td><td><small>${r.dataSegnalazione}</small><br>${r.problema}</td><td class="small">Segn: ${r.operatoreSegnalazione}<br>Off: ${r.officina}</td><td>${r.intervento}</td></tr>`}); }
    new bootstrap.Modal(document.getElementById('modalRisultati')).show();
}
function preparaStampa() { const mezzo = document.getElementById('mezzoSelect').value; const cat = document.getElementById('categoriaGuasto').value; document.getElementById('p-falco').innerText = `${mezzo} (${targhe[mezzo]})`; document.getElementById('p-targa').innerText = document.getElementById('kmAttuali').value; document.getElementById('p-data').innerText = getTimestamp(); document.getElementById('p-operatore').innerText = document.getElementById('operatore').value; document.getElementById('p-descrizione').innerText = document.getElementById('descrizione').value; document.getElementById('p-cat').innerText = cat ? `[${cat.toUpperCase()}]` : ''; window.print(); }

// --- NUOVO GESTIONE GLOBALE GOMME ---
function apriModalGommeGlobal() {
    document.getElementById('gomme-veicolo-select').value = 'Falco 27'; 
    document.getElementById('gomme-km').value=''; 
    document.getElementById('gomme-officina').value='Titan gomme'; 
    document.getElementById('gomme-note').value=''; 
    new bootstrap.Modal(document.getElementById('modalCambioGomme')).show();
}

function apriModalGomme(m) { 
    document.getElementById('gomme-veicolo-select').value = m;
    document.getElementById('gomme-km').value=''; 
    document.getElementById('gomme-officina').value='Titan gomme'; 
    document.getElementById('gomme-note').value=''; 
    new bootstrap.Modal(document.getElementById('modalCambioGomme')).show(); 
}

function salvaCambioGomme() { 
    const mezzo = document.getElementById('gomme-veicolo-select').value;
    const tipo=document.getElementById('gomme-tipo').value, km=document.getElementById('gomme-km').value, off=document.getElementById('gomme-officina').value, note=document.getElementById('gomme-note').value; 
    
    if(!km||!off){alert("Dati mancanti");return;} 
    
    flottaDB[mezzo].push({
        id:Date.now(), 
        type:'gomme', 
        categoria: 'Pneumatici', 
        mezzo: mezzo, 
        km:km, 
        dataSegnalazione:getTimestamp(), 
        operatoreSegnalazione:'REG. GOMME', 
        problema:`CAMBIO GOMME: ${tipo}`, 
        officina:off, 
        operatoreConsegna:'-', 
        dataIngresso:getTimestamp(), 
        operatoreRitiro:'-', 
        dataChiusura:getTimestamp(), 
        intervento:note||'Nessuna nota'
    }); 
    salvaDati(); 
    bootstrap.Modal.getInstance(document.getElementById('modalCambioGomme')).hide(); 
    alert("Registrato!"); 
}

function apriRubrica() {
    document.getElementById('cercaRubrica').value = '';
    filtraRubrica();
    new bootstrap.Modal(document.getElementById('modalRubrica')).show();
}

function filtraRubrica() {
    const filter = document.getElementById('cercaRubrica').value.toUpperCase();
    const ul = document.getElementById('listaRubrica');
    const li = ul.getElementsByTagName('li');
    for (let i = 0; i < li.length; i++) {
        const txtValue = li[i].textContent || li[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) { li[i].style.display = ""; } else { li[i].style.display = "none"; }
    }
}

function creaSegnalazione() { 
    const m=document.getElementById('mezzoSelect').value, km=document.getElementById('kmAttuali').value, op=document.getElementById('operatore').value, desc=document.getElementById('descrizione').value; 
    let cat = document.getElementById('categoriaGuasto').value;
    if(!desc||!op){alert("Dati mancanti");return;} 
    
    if(!cat) { cat = determinaCategoria(desc); }

    const emailInviata = document.getElementById('checkInviaEmail').checked;

    if(emailInviata) {
        const recipients = document.getElementById('emailDestinatari').value;
        const subject = encodeURIComponent("SEGNALAZIONE GUASTO /MANUTENZIONE VEICOLO 118");
        const body = encodeURIComponent(`ATTENZIONE, NUOVA SEGNALAZIONE GUASTO /MANUTENZIONE\n\nVeicolo: ${m}\nKm Attuali: ${km}\nOperatore: ${op}\nData: ${getTimestamp()}\nCategoria: ${cat}\n\nDESCRIZIONE PROBLEMA:\n${desc}\n\nSi prega di prendere visione.`);
        window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
    }

    activeTickets.push({
        id:Date.now(), 
        type:'guasto', 
        categoria: cat, 
        mezzo:m, 
        km:km, 
        operatoreSegnalazione:op, 
        problema:desc, 
        dataSegnalazione:getTimestamp(), 
        stato:'segnalato', 
        officina:'', 
        operatoreConsegna:'', 
        dataIngresso:'', 
        operatoreRitiro:'', 
        dataChiusura:'', 
        intervento:'',
        emailInviata: emailInviata
    }); 
    salvaDati(); 
    aggiornaInterfacciaGrafica(); 
    document.getElementById('descrizione').value=''; 
    document.getElementById('kmAttuali').value=''; 
    esportaDati(); 
}

function apriModalInviaOfficina(id) { 
    const t=activeTickets.find(x=>x.id===id); 
    if(t){
        document.getElementById('invio-nome-mezzo').innerText=t.mezzo; 
        document.getElementById('invio-id-ticket').value=id; 
        document.getElementById('invio-officina').value=''; 
        document.getElementById('invio-operatore').value=''; 
        
        document.getElementById('invio-data-prevista').value='';
        document.getElementById('invio-note-officina').value='';
        
        new bootstrap.Modal(document.getElementById('modalInviaOfficina')).show();
    } 
}
function confermaIngressoOfficina() { 
    const id=parseInt(document.getElementById('invio-id-ticket').value), idx=activeTickets.findIndex(x=>x.id===id); 
    if(idx!==-1){ 
        activeTickets[idx].stato='in_officina'; 
        activeTickets[idx].officina=document.getElementById('invio-officina').value; 
        activeTickets[idx].operatoreConsegna=document.getElementById('invio-operatore').value; 
        activeTickets[idx].dataIngresso=getTimestamp(); 
        
        activeTickets[idx].dataStimataConsegna = document.getElementById('invio-data-prevista').value;
        const initialNote = document.getElementById('invio-note-officina').value;
        activeTickets[idx].noteOfficina = initialNote ? [{text: initialNote, date: getTimestamp()}] : [];

        salvaDati(); 
        aggiornaInterfacciaGrafica(); 
        bootstrap.Modal.getInstance(document.getElementById('modalInviaOfficina')).hide(); 
    } 
}
function apriModalChiusura(id) { const t=activeTickets.find(x=>x.id===id); if(t){document.getElementById('chiusura-mezzo').innerText=t.mezzo; document.getElementById('chiusura-id-ticket').value=id; document.getElementById('intervento-eseguito').value=''; document.getElementById('operatore-ritiro').value=''; new bootstrap.Modal(document.getElementById('modalChiusura')).show();} }
function salvaChiusura() { const id=parseInt(document.getElementById('chiusura-id-ticket').value), idx=activeTickets.findIndex(x=>x.id===id); if(idx!==-1){ const t=activeTickets[idx]; t.intervento=document.getElementById('intervento-eseguito').value; t.operatoreRitiro=document.getElementById('operatore-ritiro').value; t.dataChiusura=getTimestamp(); flottaDB[t.mezzo].push({...t}); activeTickets.splice(idx,1); salvaDati(); aggiornaInterfacciaGrafica(); bootstrap.Modal.getInstance(document.getElementById('modalChiusura')).hide(); } }
function apriOpzioniDati() { new bootstrap.Modal(document.getElementById('modalOpzioniDati')).show(); }
function esportaDati() { const blob = new Blob([JSON.stringify({flottaDB, activeTickets, calendarNotes, washDB, timestamp:new Date().toLocaleString()}, null, 2)], {type:"application/json"}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`archivio_118_${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
function importaDati() { const f=document.getElementById('fileInput').files[0]; if(!f)return; const r=new FileReader(); r.onload=e=>{try{const d=JSON.parse(e.target.result);if(d.flottaDB&&d.activeTickets&&confirm("Sovrascrivere?")){flottaDB=d.flottaDB;activeTickets=d.activeTickets; calendarNotes=d.calendarNotes||[]; washDB=d.washDB||[]; salvaDati();aggiornaInterfacciaGrafica();bootstrap.Modal.getInstance(document.getElementById('modalOpzioniDati')).hide();}}catch(err){alert("Errore file");}};r.readAsText(f); }
function apriStorico(nomeMezzo) { 
    document.getElementById('titoloModal').innerHTML=`<i class="fas fa-history me-2"></i>STORICO: <strong>${nomeMezzo}</strong>`; 
    document.getElementById('storico-veicolo-corrente').value = nomeMezzo;
    document.getElementById('filtroStoricoCat').value = '';
    document.getElementById('filtroStoricoTesto').value = '';
    renderTabellaStorico(nomeMezzo);
    new bootstrap.Modal(document.getElementById('modalStorico')).show(); 
}

function renderTabellaStorico(nomeMezzo) {
    const tbody = document.getElementById('tabellaStoricoVeicolo'); 
    tbody.innerHTML=''; 
    const dati = flottaDB[nomeMezzo]; 
    
    if(dati.length === 0){
        tbody.innerHTML='<tr><td colspan="5" class="text-center py-4">Nessun intervento.</td></tr>';
        return;
    }

    const filtroCat = document.getElementById('filtroStoricoCat').value;
    const filtroTxt = document.getElementById('filtroStoricoTesto').value.toLowerCase();

    dati.slice().reverse().forEach(item => { 
        const catItem = item.categoria || 'Generico';
        const txtCompleto = `${item.problema} ${item.intervento} ${item.officina} ${catItem}`.toLowerCase();
        
        if (filtroCat && catItem !== filtroCat) return;
        if (filtroTxt && !txtCompleto.includes(filtroTxt)) return;

        const isGomme = item.type==='gomme'; 
        const icona = isGomme ? '<i class="fas fa-compact-disc text-primary me-2"></i>' : ''; 
        const rowClass = isGomme ? 'table-info' : ''; 
        const badgeCat = `<span class="report-cat-badge bg-light text-dark">${catItem}</span>`;
        
        tbody.innerHTML += `
        <tr class="${rowClass}">
            <td class="text-center"><input type="checkbox" class="form-check-input report-checkbox" value="${item.id}"></td>
            <td class="align-top border-end">${icona}${badgeCat}<br><small class="text-muted">${item.dataSegnalazione}</small><br><div class="mb-1"><span class="text-muted" style="font-size:0.8em">Segnalato da:</span> <strong>${item.operatoreSegnalazione}</strong></div><span class="${isGomme?'text-dark fw-bold':'text-primary'}">${item.problema}</span><br><small>Km: ${item.km}</small></td>
            <td class="align-top border-end"><small class="text-muted">${item.dataIngresso}</small><br><div class="mb-1"><span class="text-muted" style="font-size:0.8em">Portato da:</span> <strong>${item.operatoreConsegna}</strong></div><i class="fas fa-arrow-right text-muted me-1"></i> <strong>${item.officina}</strong></td>
            <td class="align-top border-end"><small class="text-muted">${item.dataChiusura}</small><br><div class="mb-1"><span class="text-muted" style="font-size:0.8em">Ritirato da:</span> <strong>${item.operatoreRitiro}</strong></div><span class="text-success fw-bold">${item.intervento}</span></td>
            <td class="align-middle text-center"><div class="d-flex gap-1 justify-content-center"><button class="btn btn-sm btn-outline-secondary" onclick="stampaRecordStorico(${item.id}, '${nomeMezzo}')" title="Stampa Scheda"><i class="fas fa-print"></i></button><button class="btn btn-sm btn-light text-warning border" onclick="richiediPassword(${item.id}, '${nomeMezzo}')" title="Modifica"><i class="fas fa-pencil"></i></button></div></td>
        </tr>`; 
    }); 
}

function applicaFiltriStorico() {
    const m = document.getElementById('storico-veicolo-corrente').value;
    renderTabellaStorico(m);
}

function toggleSelezioneTutti() {
    const checkboxes = document.querySelectorAll('.report-checkbox');
    const allChecked = Array.from(checkboxes).every(c => c.checked);
    checkboxes.forEach(c => c.checked = !allChecked);
}

function generaReportSelezionati() {
    const m = document.getElementById('storico-veicolo-corrente').value;
    const checkboxes = document.querySelectorAll('.report-checkbox:checked');
    if(checkboxes.length === 0) { alert("Seleziona almeno un intervento per creare il report."); return; }
    const ids = Array.from(checkboxes).map(c => parseInt(c.value));
    const records = flottaDB[m].filter(r => ids.includes(r.id));
    document.getElementById('rep-veicolo').innerText = `${m} (${targhe[m]})`;
    document.getElementById('rep-data').innerText = new Date().toLocaleDateString('it-IT');
    document.getElementById('rep-totale').innerText = records.length;
    const tbody = document.getElementById('rep-body');
    tbody.innerHTML = '';
    records.sort((a,b) => b.id - a.id);
    records.forEach(r => {
        const cat = r.categoria || 'Generico';
        tbody.innerHTML += `<tr><td>${r.dataChiusura || r.dataSegnalazione}</td><td><span class="report-cat-badge">${cat}</span></td><td>${r.problema} <br><small>Km: ${r.km}</small></td><td>${r.officina}</td><td>${r.intervento}</td></tr>`;
    });
    document.body.classList.add('print-report-mode');
    window.print();
    setTimeout(() => { document.body.classList.remove('print-report-mode'); }, 1000);
}

function richiediPassword(id, m) { document.getElementById('passwordInput').value=''; document.getElementById('password-id-record').value=id; document.getElementById('password-mezzo').value=m; bootstrap.Modal.getInstance(document.getElementById('modalStorico')).hide(); new bootstrap.Modal(document.getElementById('modalPassword')).show(); }
function verificaPassword() { if(document.getElementById('passwordInput').value==='ambulanza'){ const id=parseInt(document.getElementById('password-id-record').value), m=document.getElementById('password-mezzo').value; bootstrap.Modal.getInstance(document.getElementById('modalPassword')).hide(); const r=flottaDB[m].find(x=>x.id===id); if(r) setTimeout(()=>apriModalModifica(r,m),200); } else alert("Password Errata"); }
function apriModalModifica(r, m) { document.getElementById('modifica-id-record').value=r.id; document.getElementById('modifica-mezzo').value=m; document.getElementById('modifica-data-segn').value=r.dataSegnalazione; document.getElementById('modifica-op-segn').value=r.operatoreSegnalazione; document.getElementById('modifica-km').value=r.km; document.getElementById('modifica-problema').value=r.problema; document.getElementById('modifica-data-ingr').value=r.dataIngresso; document.getElementById('modifica-officina').value=r.officina; document.getElementById('modifica-consegna').value=r.operatoreConsegna; document.getElementById('modifica-data-chius').value=r.dataChiusura; document.getElementById('modifica-ritiro').value=r.operatoreRitiro; document.getElementById('modifica-intervento').value=r.intervento; document.getElementById('modifica-categoria').value = r.categoria || 'Altro'; new bootstrap.Modal(document.getElementById('modalModificaStorico')).show(); }
function salvaModificaStorico() { const id=parseInt(document.getElementById('modifica-id-record').value), m=document.getElementById('modifica-mezzo').value, idx=flottaDB[m].findIndex(x=>x.id===id); if(idx!==-1){ const r=flottaDB[m][idx]; r.dataSegnalazione=document.getElementById('modifica-data-segn').value; r.operatoreSegnalazione=document.getElementById('modifica-op-segn').value; r.km=document.getElementById('modifica-km').value; r.problema=document.getElementById('modifica-problema').value; r.dataIngresso=document.getElementById('modifica-data-ingr').value; r.officina=document.getElementById('modifica-officina').value; r.operatoreConsegna=document.getElementById('modifica-consegna').value; r.dataChiusura=document.getElementById('modifica-data-chius').value; r.operatoreRitiro=document.getElementById('modifica-ritiro').value; r.intervento=document.getElementById('modifica-intervento').value; r.categoria = document.getElementById('modifica-categoria').value; salvaDati(); bootstrap.Modal.getInstance(document.getElementById('modalModificaStorico')).hide(); apriStorico(m); } }
function eliminaRecordStorico() { if(confirm("ELIMINARE definitivamente?")){ const id=parseInt(document.getElementById('modifica-id-record').value), m=document.getElementById('modifica-mezzo').value, idx=flottaDB[m].findIndex(x=>x.id===id); if(idx!==-1){ flottaDB[m].splice(idx,1); salvaDati(); bootstrap.Modal.getInstance(document.getElementById('modalModificaStorico')).hide(); apriStorico(m); } } }
function stampaRecordStorico(id, mezzo) { const record = flottaDB[mezzo].find(r => r.id === id); if (!record) return; document.getElementById('p-falco').innerText = `${mezzo} (${targhe[mezzo]})`; document.getElementById('p-targa').innerText = record.km; document.getElementById('p-data').innerText = record.dataSegnalazione; document.getElementById('p-operatore').innerText = record.operatoreSegnalazione; document.getElementById('p-descrizione').innerText = record.problema; document.getElementById('p-cat').innerText = record.categoria ? `[${record.categoria.toUpperCase()}]` : ''; window.print(); }

aggiornaInterfacciaGrafica();
renderCalendar(currentMonth, currentYear);
setTimeout(() => checkAvvisiCritici(), 1000);

// --- GESTIONE EMAIL MULTIPLA ---

function apriModalEmailMultiscelto() {
    new bootstrap.Modal(document.getElementById('modalEmailMultiscelto')).show();
}

function generaEmailMultiscelto() {
    const checkboxes = document.querySelectorAll('#formEmailSelezione input:checked');
    if (checkboxes.length === 0) { alert("Seleziona almeno un destinatario!"); return; }
    let destinatari = []; let corpoMessaggio = []; let soggettoPrefix = [];

    checkboxes.forEach(cb => {
        switch(cb.value) {
            case 'autisti':
                destinatari.push("barbieri.matteo.1993@gmail.com,pilu.bera97@gmail.com,msarti@omniway.sm,nicofabbrism@gmail.com,filippovolpini83@gmail.com,pazz9@hotmail.com,ymichelotti@hotmail.it,ste200560@gmail.com"); 
                soggettoPrefix.push("AUTISTI");
                corpoMessaggio.push("--- PER AUTISTI SOCCORRITORI ---\nSi comunica quanto segue:\n[INSERIRE MESSAGGIO QUI]\n");
                break;
            case 'direzione':
                destinatari.push("alessandro.valentino@iss.sm,stefania.frisoni@iss.sm");
                soggettoPrefix.push("DIREZIONE");
                corpoMessaggio.push("--- PER DIREZIONE PRONTO SOCCORSO ---\nSi segnala:\n[INSERIRE MESSAGGIO QUI]\n");
                break;
            case 'economato':
                destinatari.push("segreteria.economato@iss.sm,milena.dolcini@iss.sm,floriana.serra@iss.sm");
                soggettoPrefix.push("ECONOMATO");
                corpoMessaggio.push("--- PER UFFICIO ECONOMATO ---\nRichiesta / Segnalazione:\n[INSERIRE MESSAGGIO QUI]\n");
                break;
        }
    });

    const recipients = destinatari.join(',');
    const subject = encodeURIComponent(`COMUNICAZIONE 118 (${soggettoPrefix.join(' + ')})`);
    const header = "Gentili Destinatari,\nInviata da Centrale Operativa 118 San Marino.\n\n";
    const footer = "\n\nCordiali saluti,\n118 San Marino Soccorso";
    const bodyText = header + corpoMessaggio.join('\n\n') + footer;
    
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    bootstrap.Modal.getInstance(document.getElementById('modalEmailMultiscelto')).hide();
}

// --- LOGICA INSERIMENTO VECCHIO INTERVENTO (ARCHIVIO) ---
function apriInserimentoPassato() {
    const modalStoricoEl = document.getElementById('modalStorico');
    const modalStorico = bootstrap.Modal.getInstance(modalStoricoEl);
    if (modalStorico) { modalStorico.hide(); }

    document.getElementById('formVecchioIntervento').reset();
    new bootstrap.Modal(document.getElementById('modalInserimentoPassato')).show();
}

function salvaVecchioIntervento() {
    const mezzo = document.getElementById('old-mezzo').value;
    const dataApertura = document.getElementById('old-data-apertura').value;
    const km = document.getElementById('old-km').value;
    const categoria = document.getElementById('old-categoria').value;
    const operatore = document.getElementById('old-operatore').value;
    const problema = document.getElementById('old-problema').value;
    const officina = document.getElementById('old-officina').value;
    const dataChiusura = document.getElementById('old-data-chiusura').value;
    const intervento = document.getElementById('old-intervento').value;

    if (!dataApertura || !problema) {
        alert("Errore: Inserire almeno la Data Guasto e il Problema.");
        return;
    }

    const nuovoRecord = {
        id: Date.now(),
        veicolo: mezzo,
        dataSegnalazione: dataApertura,
        km: km,
        categoria: categoria,
        operatoreSegnalazione: operatore || "Archivio",
        descrizione: problema,
        problema: problema, // duplication for compatibility
        stato: "Concluso", 
        officina: officina,
        dataIngresso: dataApertura,
        operatoreConsegna: "Archivio",
        dataChiusura: dataChiusura || dataApertura,
        intervento: intervento || "Intervento archiviato manualmente",
        operatoreRitiro: "Archivio"
    };

    flottaDB[mezzo].push(nuovoRecord);
    salvaDati();
    
    alert("Intervento storico aggiunto con successo!");
    
    bootstrap.Modal.getInstance(document.getElementById('modalInserimentoPassato')).hide();
}

// --- IMPORTAZIONE STORICO FALCO 31 ---
// Da incollare alla fine del file script.js

function importaStoricoFalco31() {
    // Dati estratti dall'immagine
    const nuoviRecord = [
        { data: "10/04/2025", km: "16787", cat: "Altro", desc: "Revisione vano sanitario e sistemi emergenza (sost. cerniera sportello bombole O2, ctrl cinture)", off: "Vision Ambulanze", op: "Volpini" },
        { data: "30/05/2025", km: "19100", cat: "Altro", desc: "Revisione vettura", off: "Centro rev. Acquaviva", op: "Barbieri" },
        { data: "17/06/2025", km: "20378", cat: "Elettrica", desc: "Malfunzionamento pedana laterale. Sostituita centralina in garanzia", off: "Vision Ambulanze", op: "Volpini" },
        { data: "09/07/2025", km: "21008", cat: "Elettrica", desc: "Malfunzionamento pedana laterale. Sostituita centralina in garanzia", off: "Vision Ambulanze", op: "Ghiotti" },
        { data: "15/07/2025", km: "21020", cat: "Elettrica", desc: "Sostituito cavo luci di cortesia su scalino laterale (faceva massa ed interferiva con la pedana)", off: "Vision Ambulanze", op: "Michelotti" },
        { data: "18/07/2025", km: "21290", cat: "Meccanica", desc: "Sostituzione pasticche freni anteriori (manca segnalatore usura)", off: "Reggini", op: "Ghiotti" },
        { data: "29/08/2025", km: "23173", cat: "Carrozzeria", desc: "Riparazione pedana laterale", off: "Carrozzeria Menicucci", op: "Bianchi" },
        { data: "11/09/2025", km: "23728", cat: "Carrozzeria", desc: "Riparazione finestrino laterale", off: "Carrozzeria Menicucci", op: "Sarti" },
        { data: "23/10/2025", km: "24281", cat: "Elettrica", desc: "Sostituzione batteria avviamento. Controllo generale imp. elettrico, nessun assorbimento rilevato", off: "Reggini", op: "Barbieri" },
        { data: "24/10/2025", km: "24297", cat: "Pneumatici", desc: "Riparazione pneumatico posteriore destro", off: "Titan Gomme", op: "Michelotti" },
        { data: "27/10/2025", km: "24104", cat: "Elettrica", desc: "Controllo anomalia batteria avviamento (non riscontrano problemi alternatore)", off: "Reggini", op: "Michelotti" },
        { data: "30/10/2025", km: "24717", cat: "Pneumatici", desc: "Cambio gomme, da estive a termiche (da deposito Titan)", off: "Titan Gomme", op: "Michelotti" },
        { data: "03/12/2025", km: "26376", cat: "Carrozzeria", desc: "Sistemazione pedana laterale con sostituzione ingranaggio", off: "Carrozzeria Menicucci", op: "Volpini" }
    ];

    // Se la lista per Falco 31 non esiste, la crea
    if (!flottaDB['Falco 31']) {
        flottaDB['Falco 31'] = [];
    }

    let contatore = 0;

    nuoviRecord.forEach(rec => {
        // Controllo per non inserire doppioni se ricarichi la pagina
        const esisteGia = flottaDB['Falco 31'].some(r => r.km == rec.km && r.dataSegnalazione == rec.data);
        
        if (!esisteGia) {
            flottaDB['Falco 31'].push({
                id: Date.now() + Math.floor(Math.random() * 100000), // ID casuale univoco
                veicolo: "Falco 31",
                dataSegnalazione: rec.data,
                km: rec.km,
                categoria: rec.cat,
                operatoreSegnalazione: rec.op,
                problema: rec.desc,
                stato: "concluso",
                officina: rec.off,
                operatoreConsegna: "Storico",
                dataIngresso: rec.data,
                operatoreRitiro: rec.op,
                dataChiusura: rec.data,
                intervento: "Intervento importato da storico"
            });
            contatore++;
        }
    });

    if (contatore > 0) {
        salvaDati(); // Salva nel browser
        alert("Fatto! Ho inserito " + contatore + " vecchi interventi per Falco 31.");
        location.reload(); // Ricarica la pagina per farteli vedere
    } else {
        console.log("Nessun nuovo dato da inserire (erano già presenti).");
    }
}

// Esegui questo comando dopo 2 secondi dall'avvio
setTimeout(importaStoricoFalco31, 2000);

// --- SCRIPT IMPORTAZIONE MASSIVA STORICO (FALCO 27, 28, 29, 30) ---
// Incolla alla fine di script.js

function importaStoricoCompleto() {
    console.log("Avvio importazione massiva flotta...");
    let contatoreTotale = 0;

    // DATABASE DEI DATI ESTRATTI DALLE IMMAGINI
    const databaseImport = {
        "Falco 27": [
            { d: "26/10/2022", km: "29604", cat: "Meccanica", off: "Autoplanet", op: "Barbieri", desc: "Tagliando completo: cambio olio, filtro olio, filtro aria, filtro abitacolo Fattura N. 304" },
            { d: "21/03/2024", km: "34746", cat: "Meccanica", off: "Autoplanet", op: "Berardi", desc: "Tagliando : f.olio. F. aria, f. abitacolo, past.freni ant, past. Freni post, spurgo freni" },
            { d: "04/04/2024", km: "34784", cat: "Meccanica", off: "Autoplanet", op: "Volpini", desc: "Frizione, Volano, olio cambio, olio Frizione, Kit bulloni, Assetto" },
            { d: "09/05/2024", km: "35214", cat: "Meccanica", off: "Autoplanet", op: "Volpini", desc: "Sostituzione manicotto intercooler, rigenerazione DPF, cambio olio e filtro" },
            { d: "02/07/2024", km: "35361", cat: "Elettrica", off: "Autoplanet", op: "Ghiotti", desc: "Sostituzione Batteria" },
            { d: "07/05/2025", km: "35920", cat: "Pneumatici", off: "Titan Gomme", op: "Berardi", desc: "Cambio gomme, montate gomme estive (da deposito Titan Gomme)" },
            { d: "31/10/2025", km: "36271", cat: "Pneumatici", off: "Titan Gomme", op: "Michelotti", desc: "Cambio gomme, da estive a termiche (da deposito titan gomme)" }
        ],
        "Falco 28": [
            { d: "12/02/2023", km: "", cat: "Meccanica", off: "Auto Planet", op: "Michelotti", desc: "Sostituite pasticche freni posteriori" },
            { d: "01/04/2023", km: "", cat: "Elettrica", off: "Elettrauto Cesarini", op: "Michelotti", desc: "Sostituzione lampadina anabbagliante ant sx - Sistemata luce targa" },
            { d: "14/06/2023", km: "110000", cat: "Meccanica", off: "Auto Planet", op: "Michelotti", desc: "Distribuzione - Tagliando Motore / Tagliando 4x4" },
            { d: "26/06/2023", km: "113300", cat: "Meccanica", off: "Auto Planet", op: "Michelotti", desc: "Sostituzione pasticche freni ant + post" },
            { d: "25/09/2023", km: "114492", cat: "Meccanica", off: "Auto Planet", op: "Volpini", desc: "Sostituito turbina (nuova) e sospensioni anteriori" },
            { d: "25/07/2025", km: "120073", cat: "Meccanica", off: "Autoplanet", op: "Michelotti", desc: "Sostituita valvola e manicotto turbo" },
            { d: "30/10/2025", km: "122000", cat: "Pneumatici", off: "Titan Gomme", op: "Michelotti", desc: "Cambio gomme, da estive a termiche (da deposito titan gomme)" }
        ],
        "Falco 29": [
            { d: "09/04/2024", km: "", cat: "Carrozzeria", off: "Carrozzeria Menicucci", op: "Michelotti", desc: "Riparazione ammaccatura portellone post + sostituzione luce segnalazione spoiler" },
            { d: "11/09/2024", km: "", cat: "Elettrica", off: "Elettrauto Cesarini", op: "Michelotti", desc: "Sostituzione altoparlante sirena1" },
            { d: "12/11/2024", km: "", cat: "Meccanica", off: "Reggini", op: "Michelotti", desc: "Tagliando + sostituzione sensore freni" },
            { d: "11/02/2025", km: "", cat: "Carrozzeria", off: "Carrozzeria Menicucci", op: "Brizzi", desc: "Riparazione bulloni di supporto telaio pedana laterale" },
            { d: "02/07/2025", km: "53830", cat: "Meccanica", off: "Auto Planet", op: "Volpini", desc: "Sostituzione pasticche freni ant e post" },
            { d: "23/07/2025", km: "54473", cat: "Meccanica", off: "Reggini", op: "Archivio", desc: "Cambio olio motore" },
            { d: "25/07/2025", km: "54500", cat: "Altro", off: "Centro Revisioni", op: "Michelotti", desc: "Revisione periodica" },
            { d: "30/10/2025", km: "56640", cat: "Pneumatici", off: "Titan Gomme", op: "Michelotti", desc: "Cambio gomme, da estive a termiche (da deposito titan gomme)" },
            { d: "19/12/2025", km: "57580", cat: "Meccanica", off: "Reggini", op: "Michelotti", desc: "Sostituito serbatoio e centralina AdBlue" }
        ],
        "Falco 30": [
            { d: "13/01/2025", km: "23820", cat: "Pneumatici", off: "Titan Gomme", op: "Michelotti", desc: "Sostituite 4 gomme termiche (causa indice di carico sbagliato)" },
            { d: "14/01/2025", km: "23827", cat: "Meccanica", off: "Auto Planet", op: "Michelotti", desc: "Sostituite pastiglie freni ant + sensore modificato" },
            { d: "07/04/2025", km: "27368", cat: "Pneumatici", off: "Titan Gomme", op: "Archivio", desc: "Cambio gomme, da termiche ad estive(da deposito titan gomme)" },
            { d: "24/06/2025", km: "30029", cat: "Altro", off: "Vision", op: "Michelotti", desc: "Riparata perdita impianto AC" },
            { d: "21/07/2025", km: "31037", cat: "Meccanica", off: "Auto Planet", op: "Volpini", desc: "Sostituito dischi e pasticche anteriori" },
            { d: "29/10/2025", km: "35081", cat: "Pneumatici", off: "Titan Gomme", op: "Ghiotti", desc: "Cambio gomme, da estive a termiche (da deposito titan gomme)" },
            { d: "26/11/2025", km: "35813", cat: "Altro", off: "Reggini", op: "Barbieri", desc: "Rilevata fuga a.c. vano sanitario, ricaricato impianto, contattare allestitore" },
            { d: "30/12/2025", km: "37024", cat: "Meccanica", off: "Reggini", op: "Michelotti", desc: "Manutenzione ordinaria: olio motore + filtro antipolline + olio freni" }
        ]
    };

    // CICLO DI IMPORTAZIONE
    for (const [veicolo, records] of Object.entries(databaseImport)) {
        if (!flottaDB[veicolo]) flottaDB[veicolo] = [];

        records.forEach(rec => {
            // Evita duplicati (controlla data e descrizione simile)
            const esiste = flottaDB[veicolo].some(r => r.dataSegnalazione === rec.d && r.problema === rec.desc);
            
            if (!esiste) {
                flottaDB[veicolo].push({
                    id: Date.now() + Math.floor(Math.random() * 1000000),
                    veicolo: veicolo,
                    dataSegnalazione: rec.d,
                    km: rec.km,
                    categoria: rec.cat,
                    operatoreSegnalazione: rec.op,
                    problema: rec.desc,
                    stato: "concluso",
                    officina: rec.off,
                    operatoreConsegna: "Storico",
                    dataIngresso: rec.d,
                    operatoreRitiro: rec.op,
                    dataChiusura: rec.d,
                    intervento: "Intervento storico importato"
                });
                contatoreTotale++;
            }
        });
    }

    if (contatoreTotale > 0) {
        salvaDati();
        alert(`OPERAZIONE COMPLETATA!\nSono stati importati ${contatoreTotale} nuovi interventi storici per tutta la flotta.\nLa pagina verrà ricaricata.`);
        location.reload();
    } else {
        console.log("Nessun nuovo dato da importare (archivio già aggiornato).");
    }
}

// Esegue dopo 2 secondi
setTimeout(importaStoricoCompleto, 2000);