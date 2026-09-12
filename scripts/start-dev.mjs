import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFilePath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFilePath), '..');
const commands = [
  { title: 'Expo mobile', script: 'mobile' },
  { title: 'Node API', script: 'api' },
  { title: 'OAuth2 identity provider', script: 'idp' },
];

function startWindowsTerminal({ title, script }) {
  const escapedRootDir = rootDir.replaceAll("'", "''");
  const command = [
    `$host.UI.RawUI.WindowTitle = '${title}'`,
    `Set-Location -LiteralPath '${escapedRootDir}'`,
    `npm run ${script}`,
  ].join('; ');

  const child = spawn(
    'cmd.exe',
    [
      '/c',
      'start',
      title,
      'powershell.exe',
      '-NoLogo',
      '-NoExit',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      command,
    ],
    { detached: true, stdio: 'ignore', windowsHide: false },
  );

  child.once('error', (error) => {
    console.error(`Unable to open the ${title} terminal: ${error.message}`);
    process.exitCode = 1;
  });
  child.unref();
}

function startSharedTerminal({ script }) {
  const child = spawn('npm', ['run', script], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });

  return child;
}

if (process.platform === 'win32') {
  commands.forEach(startWindowsTerminal);
  console.log(
    'Started Expo mobile, Node API, and OAuth2 identity provider in separate PowerShell windows.',
  );
} else {
  const children = commands.map(startSharedTerminal);
  await Promise.all(
    children.map(
      (child) =>
        new Promise((resolve, reject) => {
          child.once('error', reject);
          child.once('exit', (code) => {
            if (code && code !== 0) {
              reject(new Error(`npm run command exited with code ${code}`));
              return;
            }
            resolve();
          });
        }),
    ),
  );
}
