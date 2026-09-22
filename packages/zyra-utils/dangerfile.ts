import { danger, schedule, warn } from 'danger';
import todos from 'danger-plugin-todos';

// Check if package.json was changed, but not yarn.lock
const packageChanged = danger.git.modified_files.find((x) =>
  x.includes('package.json'),
);
const lockfileChanged = danger.git.modified_files.find((x) =>
  x.includes('yarn.lock'),
);
if (packageChanged && !lockfileChanged) {
  const message = 'Changes were made to package.json, but not to yarn.lock';
  const idea = 'Perhaps you need to run `yarn install`?';
  warn(`${message} - <i>${idea}</i>`);
}

// Check environment configuration changes
const envExampleChanged = danger.git.modified_files.find((x) => 
  x.includes('.env.example')
);

// Check if .env.example was changed
if (envExampleChanged) {
  const message = 'Changes were made to .env.example';
  const idea = 'Please make sure any new environment variables are properly documented with metadata in config-variables.ts';
  warn(`${message} - <i>${idea}</i>`);
}

// TODOS / Fixme
schedule(todos());
