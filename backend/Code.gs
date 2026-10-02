/**
 * WorksheetHub AI backend (Google Apps Script, bound to a Google Sheet).
 * Sheets: Requests, Worksheets, Feedback, Users.  Run setup() once, then deploy as a Web app.
 * Roles: admin (everything) and contributor (view/edit requests, upload files, add worksheets; cannot delete).
 */
const HEADERS = {
  Requests: ['ID', 'Date', 'Subject', 'Grade', 'Topic', 'Difficulty', 'Type', 'Info', 'Status', 'Worksheet Link', 'Updated By'],
  Worksheets: ['ID', 'Title', 'Subject', 'Grade', 'Topic', 'Difficulty', 'Description', 'File', 'Answers', 'Date', 'Added By', 'Views', 'Downloads'],
  Feedback: ['Date', 'Worksheet ID', 'Helpful', 'Rating', 'Text'],
  Users: ['Name', 'Token', 'Role']
};
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Individuals & Societies', 'Spanish', 'Digital Design', 'Other'];
const GRADES = ['Grade 6', 'Grade 7'];
const DIFFS = ['Easy', 'Medium', 'Hard', 'Mixed'];
const TYPES = ['Practice questions', 'Revision worksheet', 'Challenge questions', 'Multiple choice', 'Mixed questions', 'Exam-style practice'];
const STATUSES = ['Requested', 'Being Created', 'Completed'];
const FOLDER_NAME = 'WorksheetHub Files';
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function (name) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]).setFontWeight('bold').setBackground('#dbeafe');
    sh.setFrozenRows(1);
  });
  const def = ss.getSheetByName('Sheet1'); if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  const req = ss.getSheetByName('Requests');
  req.getRange('I2:I1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
  const users = ss.getSheetByName('Users');
  if (users.getLastRow() < 2) users.appendRow(['Admin', Utilities.getUuid(), 'admin']);
  getFolder_();
  const msg = 'Setup done. Your admin token is in the Users sheet (column B). Now: Deploy > New deployment > Web app.';
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) {}
}

// ---------- helpers ----------
function sheet_(n) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n); }
function fmtDate_(v) { return v instanceof Date ? Utilities.formatDate(v, 'UTC', 'yyyy-MM-dd') : String(v || ''); }
function today_() { return Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd'); }
function rows_(name) {
  const v = sheet_(name).getDataRange().getValues(); const h = v.shift();
  return v.filter(function (r) { return r.join('') !== ''; }).map(function (r, i) {
    const o = { _row: i + 2 }; h.forEach(function (k, j) { o[k] = r[j] instanceof Date ? fmtDate_(r[j]) : r[j]; }); return o;
  });
}
function clean_(s, max) { s = String(s == null ? '' : s).trim().slice(0, max || 200); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function oneOf_(v, list, fallback) { return list.indexOf(v) >= 0 ? v : fallback; }
function url_(s) { s = String(s || '').trim(); return /^https?:\/\//i.test(s) ? s.slice(0, 500) : ''; }
function id_() { return Utilities.getUuid().slice(0, 8); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function user_(token) {
  if (!token) return null;
  const u = rows_('Users').filter(function (r) { return r.Token && String(r.Token) === String(token); })[0];
  return u ? { name: String(u.Name), role: String(u.Role).toLowerCase() === 'admin' ? 'admin' : 'contributor' } : null;
}
function getFolder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}
function publicWorksheet_(w) {
  return { id: w.ID, title: w.Title, subject: w.Subject, grade: w.Grade, topic: w.Topic, difficulty: w.Difficulty,
    description: w.Description, file: w.File, answers: w.Answers, date: w.Date };
}

// ---------- GET: public data ----------
function doGet(e) {
  const ws = rows_('Worksheets');
  const stats = {}; ws.forEach(function (w) { stats[w.ID] = { views: +w.Views || 0, downloads: +w.Downloads || 0 }; });
  const ratings = { _all: { sum: 0, n: 0 } };
  rows_('Feedback').forEach(function (f) {
    const r = +f.Rating; if (!r) return;
    ratings._all.sum += r; ratings._all.n++;
    if (f['Worksheet ID']) { const k = f['Worksheet ID']; ratings[k] = ratings[k] || { sum: 0, n: 0 }; ratings[k].sum += r; ratings[k].n++; }
  });
  const requests = rows_('Requests').map(function (r) {
    return { id: r.ID, date: r.Date, subject: r.Subject, grade: r.Grade, topic: r.Topic, status: r.Status, link: r['Worksheet Link'] };
  });
  return json_({ ok: true, worksheets: ws.map(publicWorksheet_), requests: requests, stats: stats, ratings: ratings });
}

// ---------- POST: actions ----------
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    const pub = { request: request_, feedback: feedback_, track: track_ };
    if (pub[b.action]) return json_(pub[b.action](b));
    const u = user_(b.token);
    if (!u) return json_({ ok: false, error: 'Invalid token' });
    const adm = { login: function () { return { ok: true, name: u.name, role: u.role }; }, adminList: adminList_,
      updateRequest: updateRequest_, addWorksheet: addWorksheet_, upload: upload_,
      deleteRequest: deleteRequest_, deleteWorksheet: deleteWorksheet_ };
    if (!adm[b.action]) return json_({ ok: false, error: 'Unknown action' });
    if ((b.action === 'deleteRequest' || b.action === 'deleteWorksheet') && u.role !== 'admin') return json_({ ok: false, error: 'Admins only' });
    return json_(adm[b.action](b, u));
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally { lock.releaseLock(); }
}

function request_(b) {
  const topic = clean_(b.topic, 80); if (!topic) return { ok: false, error: 'Topic required' };
  const sh = sheet_('Requests');
  if (sh.getLastRow() > 5000) return { ok: false, error: 'Too many requests right now' };
  sh.appendRow([id_(), today_(), oneOf_(b.subject, SUBJECTS, 'Other'), oneOf_(b.grade, GRADES, 'Grade 6'), topic,
    oneOf_(b.difficulty, DIFFS, 'Mixed'), oneOf_(b.type, TYPES, 'Mixed questions'), clean_(b.info, 600), 'Requested', '', '']);
  return { ok: true };
}
function feedback_(b) {
  sheet_('Feedback').appendRow([today_(), clean_(b.wsId, 20), b.helpful === true ? 'Yes' : b.helpful === false ? 'No' : '',
    Math.min(5, Math.max(0, Math.round(+b.rating || 0))) || '', clean_(b.text, 800)]);
  return { ok: true };
}
function track_(b) {
  const sh = sheet_('Worksheets'); const col = b.kind === 'downloads' ? 13 : 12;
  const w = rows_('Worksheets').filter(function (x) { return x.ID === b.id; })[0];
  if (w) sh.getRange(w._row, col).setValue((+sh.getRange(w._row, col).getValue() || 0) + 1);
  return { ok: true };
}

function adminList_(b, u) {
  const rq = rows_('Requests').map(function (r) {
    return { id: r.ID, date: r.Date, subject: r.Subject, grade: r.Grade, topic: r.Topic, difficulty: r.Difficulty, type: r.Type,
      info: r.Info, status: r.Status, link: r['Worksheet Link'], updatedBy: r['Updated By'] };
  });
  const fb = rows_('Feedback').map(function (f) {
    return { date: f.Date, wsId: f['Worksheet ID'] || null, helpful: f.Helpful === 'Yes' ? true : f.Helpful === 'No' ? false : null, rating: +f.Rating || 0, text: f.Text };
  });
  return { ok: true, name: u.name, role: u.role, requests: rq, feedback: fb };
}
function updateRequest_(b, u) {
  const r = rows_('Requests').filter(function (x) { return x.ID === b.id; })[0]; if (!r) return { ok: false, error: 'Not found' };
  const status = oneOf_(b.status, STATUSES, r.Status), link = url_(b.link) || (String(b.link || '').indexOf('#/') === 0 ? String(b.link).slice(0, 100) : '');
  if (status === 'Completed' && !link) return { ok: false, error: 'Add the worksheet link before marking Completed' };
  sheet_('Requests').getRange(r._row, 9, 1, 3).setValues([[status, link, u.name]]);
  return { ok: true };
}
function addWorksheet_(b, u) {
  const file = url_(b.file); if (!clean_(b.title) || !file) return { ok: false, error: 'Title and file link required' };
  const id = id_();
  sheet_('Worksheets').appendRow([id, clean_(b.title, 120), oneOf_(b.subject, SUBJECTS, 'Other'), oneOf_(b.grade, GRADES, 'Grade 6'), clean_(b.topic, 80),
    oneOf_(b.difficulty, DIFFS, 'Mixed'), clean_(b.description, 600), file, url_(b.answers), today_(), u.name, 0, 0]);
  return { ok: true, id: id };
}
function upload_(b) {
  const bytes = Utilities.base64Decode(b.data || '');
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, error: 'File too large (max 20 MB)' };
  const name = String(b.filename || 'worksheet.pdf').replace(/[^\w.\- ]/g, '_').slice(0, 100);
  const f = getFolder_().createFile(Utilities.newBlob(bytes, b.mime || 'application/pdf', name));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, url: 'https://drive.google.com/file/d/' + f.getId() + '/view' };
}
function deleteRequest_(b) {
  const r = rows_('Requests').filter(function (x) { return x.ID === b.id; })[0];
  if (r) sheet_('Requests').deleteRow(r._row); return { ok: true };
}
function deleteWorksheet_(b) {
  const w = rows_('Worksheets').filter(function (x) { return x.ID === b.id; })[0];
  if (w) sheet_('Worksheets').deleteRow(w._row); return { ok: true };
}
