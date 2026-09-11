import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const deploy = args.includes('--deploy');
const appName = args.find((arg) => !arg.startsWith('--'));

function commandName(command) {
  return process.platform === 'win32' ? `${command}.cmd` : command;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(commandName(command), commandArgs, {
    stdio: 'inherit',
    ...options,
  });

  if (result.error) {
    console.error(`Unable to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function hasCommand(command) {
  const result = spawnSync(commandName(command), ['--version'], {
    stdio: 'ignore',
  });
  return !result.error && result.status === 0;
}

if (!appName) {
  console.error(
    'Usage: npm run heroku:setup -- <heroku-app-name> [--deploy]',
  );
  process.exit(1);
}

if (!hasCommand('heroku')) {
  console.error(
    'Heroku CLI is required. Install it from https://devcenter.heroku.com/articles/heroku-cli.',
  );
  process.exit(1);
}

console.log('Building the API before configuring Heroku...');
run('npm', ['run', 'api:build']);

const appExists = spawnSync(commandName('heroku'), [
  'apps:info',
  '--app',
  appName,
], {
  stdio: 'ignore',
}).status === 0;

if (!appExists) {
  console.log(`Creating Heroku app ${appName}...`);
  run('heroku', ['create', appName]);
} else {
  console.log(`Using existing Heroku app ${appName}...`);
}

run('heroku', ['git:remote', '--app', appName]);
run('heroku', ['config:set', 'NODE_ENV=production', '--app', appName]);

console.log(`Heroku app configured: ${appName}`);
console.log('The API will receive HOST and PORT from the Heroku runtime.');

if (deploy) {
  console.log('Deploying the current branch to Heroku...');
  run('git', ['push', 'heroku', 'HEAD:main']);
} else {
  console.log('Configuration complete. Deploy with: git push heroku HEAD:main');
}
