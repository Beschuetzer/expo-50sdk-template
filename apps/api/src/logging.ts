type LogFields = Record<string, unknown>;

function write(level: 'error' | 'info', event: string, fields: LogFields) {
  const entry = JSON.stringify({
    event,
    level,
    timestamp: new Date().toISOString(),
    ...fields,
  });

  if (level === 'error') {
    console.error(entry);
  } else {
    console.log(entry);
  }
}

export function logError(event: string, fields: LogFields = {}) {
  write('error', event, fields);
}

export function logInfo(event: string, fields: LogFields = {}) {
  write('info', event, fields);
}
