// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyD9CCCMFo0KZPZzLfQIHmJUN7mXFQmlsrA',
    authDomain: 'dac-angular-d2bbd.firebaseapp.com',
    databaseURL: 'https://dac-angular-d2bbd.firebaseio.com',
    projectId: 'dac-angular-d2bbd',
    storageBucket: 'dac-angular-d2bbd.appspot.com',
    messagingSenderId: '209795958738'
  }
};
