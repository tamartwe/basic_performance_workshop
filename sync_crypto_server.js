const fs = require('fs');
const express = require('express');
const v8Profiler = require('v8-profiler-next');
const port = process.env.PORT || 3000;

const title = 'sync-profiler-file-name';

// set generateType 1 to generate new format for cpuprofile
// to be compatible with cpuprofile parsing in vscode.
v8Profiler.setGenerateType(1);

const crypto = require('crypto');

const app = express();

const router = express.Router();

const hashPassword = (password) => {
  const salt = crypto.randomBytes(128).toString('base64');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512');
  return hash;
}

const stopProfiling = () => {
  const profile = v8Profiler.stopProfiling(title);
  profile.export((error, result) => {
    // if it doesn't have the extension .cpuprofile then
    // chrome's profiler tool won't like it.
    // examine the profile:
    //   Navigate to chrome://inspect
    //   Click Open dedicated DevTools for Node
    //   Select the profiler tab
    //   Load your file
    fs.writeFileSync(`${title}.cpuprofile`, result);
    profile.delete();
  });
}


router.get('/', async (req, res) => {
  v8Profiler.startProfiling(title, true);
  const hash = hashPassword('random_password');
  stopProfiling();
  return res.json({ 'message': hash });
});


app.use('/api', router);

// Start the server
app.listen(port);
console.log('server is up ' + port);

