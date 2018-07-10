var path = require('path');
var exec = require('child_process').exec;
var glob = require('glob');
var runSeries = require('run-series');

var constants = require('./util/constants');
var pathToJasmineBundleTests = constants.pathToJasmineBundleTests;
var EXIT_CODE = 0;

/**
 * Run all jasmine 'bundle' test in series
 *
 * To run specific bundle tests, use
 *
 * $ npm run test-jasmine -- --bundleTest=<name-of-suite>
 */
glob(pathToJasmineBundleTests + '/*.js', function(err, files) {
    var tasks = files.map(function(file) {
        return function(cb) {
            var cmd = [
                'karma', 'start',
                path.join(constants.pathToRoot, 'test', 'jasmine', 'karma.conf.js'),
                '--bundleTest=' + path.basename(file),
                '--nowatch'
            ].join(' ');

            console.log('Running: ' + cmd);

            exec(cmd, function(err) {
                cb(null, err);
            }).stdout.pipe(process.stdout);
        };
    });

    runSeries(tasks, function(err, results) {
        if(err) throw err;

        console.log('\ntest-bundle summary:\n');

        results.forEach(function(r) {
            if(r) {
                EXIT_CODE = 1;
                console.warn(r.cmd + ' failed');
            }
        });

        process.exit(EXIT_CODE);
    });
});
