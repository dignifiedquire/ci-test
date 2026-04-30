// Self-contained JavaScript action for compat testing.
// Uses raw workflow-command stdout protocol (no @actions/core dependency)
// so the action runs without an `npm install` step.

const fs = require('fs');
const os = require('os');

function getInput(name) {
  // GitHub Actions converts `with:` keys to INPUT_<UPPER_NAME> env vars
  // (with hyphens replaced by underscores).
  const key = 'INPUT_' + name.replace(/-/g, '_').toUpperCase();
  return (process.env[key] ?? '').trim();
}

function setOutput(name, value) {
  const path = process.env.GITHUB_OUTPUT;
  if (!path) {
    throw new Error('GITHUB_OUTPUT env var not set');
  }
  // Use a heredoc-style delimiter so multi-line values work.
  const delim = 'GHADELIM_' + Math.random().toString(36).slice(2);
  fs.appendFileSync(
    path,
    `${name}<<${delim}${os.EOL}${value}${os.EOL}${delim}${os.EOL}`
  );
}

const who = getInput('who-to-greet');
const shouldFail = getInput('fail') === 'true';

console.log(`::notice::Greeting ${who} from JS action`);

const greeting = `Hello, ${who}!`;
const upper = greeting.toUpperCase();

console.log(greeting);
setOutput('greeting', greeting);
setOutput('upper', upper);

console.log(`Wrote outputs: greeting=${greeting} upper=${upper}`);

if (shouldFail) {
  console.log('::error::Action was asked to fail via fail=true input');
  process.exit(1);
}
