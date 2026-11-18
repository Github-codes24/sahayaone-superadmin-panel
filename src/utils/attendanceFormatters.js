/**
 * Attendance Data Sanitizers & Formatters
 * Prevents React 19 "Objects are not valid as a React child" errors
 * by ensuring all values rendered into JSX/<span> are strictly primitives (string/number).
 */

export const formatDisplayString = (val, fallback = '—') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed ? trimmed : fallback;
  }
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';

  if (typeof val === 'object') {
    // Check common nested string keys
    if (typeof val.address === 'string' && val.address.trim()) return val.address.trim();
    if (typeof val.time === 'string' && val.time.trim()) return val.time.trim();
    if (typeof val.formatted === 'string' && val.formatted.trim()) return val.formatted.trim();
    if (typeof val.message === 'string' && val.message.trim()) return val.message.trim();
    if (typeof val.name === 'string' && val.name.trim()) return val.name.trim();
    if (typeof val.label === 'string' && val.label.trim()) return val.label.trim();
    if (typeof val.code === 'string' && val.code.trim()) return val.code.trim();
    if (typeof val.value === 'string' || typeof val.value === 'number') return String(val.value);
    if (typeof val.count === 'number') return String(val.count);
    if (typeof val.total === 'number') return String(val.total);

    // If it's a location object with city/state
    if (val.city || val.state) {
      return [val.address, val.city, val.state].filter(Boolean).join(', ');
    }
    
    // As last resort, avoid passing raw object to React JSX
    try {
      const str = JSON.stringify(val);
      return str !== '{}' ? str : fallback;
    } catch {
      return fallback;
    }
  }

  return String(val);
};

export const formatStatusCode = (val) => {
  if (!val) return '—';
  if (typeof val === 'string') return val.toUpperCase().trim();
  if (typeof val === 'object') {
    const raw = val.statusCode || val.status || val.code || val.label || val.name || '';
    if (typeof raw === 'string') return raw.toUpperCase().trim();
  }
  return String(val).toUpperCase().trim();
};

export const formatNumeric = (val, fallback = 0) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const parsed = Number(val);
    return isNaN(parsed) ? val : parsed;
  }
  if (typeof val === 'object') {
    if (typeof val.count === 'number') return val.count;
    if (typeof val.total === 'number') return val.total;
    if (typeof val.value === 'number') return val.value;
    if (typeof val.presentDays === 'number') return val.presentDays;
  }
  return fallback;
};

export const formatAddress = (loc) => {
  if (!loc) return '';
  if (typeof loc === 'string') return loc.trim();
  if (typeof loc === 'object') {
    if (typeof loc.address === 'string' && loc.address.trim()) return loc.address.trim();
    if (typeof loc.address === 'object' && loc.address) {
      return [loc.address.street, loc.address.city, loc.address.state].filter(Boolean).join(', ');
    }
    const parts = [loc.address, loc.city, loc.state, loc.pincode].filter(p => typeof p === 'string' && p.trim());
    if (parts.length > 0) return parts.join(', ');
    if (loc.latitude && loc.longitude) return `GPS (${loc.latitude}, ${loc.longitude})`;
  }
  return '';
};
