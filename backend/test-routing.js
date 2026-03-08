const express = require('express');
const app = express();
try {
    app.get('/:any(.*)', (req, res) => { });
    console.log('Success with /:any(.*)');
} catch (e) {
    console.log('Failed with /:any(.*):', e.message);
}

try {
    app.get('(.*)', (req, res) => { });
    console.log('Success with (.*)');
} catch (e) {
    console.log('Failed with (.*):', e.message);
}

try {
    app.get('*', (req, res) => { });
    console.log('Success with *');
} catch (e) {
    console.log('Failed with *:', e.message);
}

try {
    app.get(/.*/, (req, res) => { });
    console.log('Success with regex /.*/');
} catch (e) {
    console.log('Failed with regex /.*/:', e.message);
}
