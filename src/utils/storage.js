const STORAGE_KEY = 'labdecode-reports';

export function saveReport(report) {
  const reports = getReports();
  const entry = {
    id: report.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: report.name || `Report ${new Date().toLocaleDateString()}`,
    date: report.date || new Date().toISOString(),
    labName: report.labName || null,
    patientName: report.patientName || null,
    userContext: report.userContext || {},
    analysis: report.analysis,
    createdAt: new Date().toISOString(),
  };
  reports.unshift(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    // localStorage full — remove oldest reports
    while (reports.length > 1) {
      reports.pop();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
        break;
      } catch (_) { /* keep trying */ }
    }
  }
  return entry;
}

export function getReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getReport(id) {
  return getReports().find(r => r.id === id) || null;
}

export function deleteReport(id) {
  const reports = getReports().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function updateReport(id, updates) {
  const reports = getReports();
  const idx = reports.findIndex(r => r.id === id);
  if (idx !== -1) {
    reports[idx] = { ...reports[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
  return reports[idx] || null;
}
