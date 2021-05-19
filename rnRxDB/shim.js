import {shim as shimBase64} from 'react-native-quick-base64';

if (typeof process === 'undefined') {
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (var p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}

shimBase64();
process.browser = true;
