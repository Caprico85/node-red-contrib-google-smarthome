/**
 * node-red-contrib-google-smarthome
 * Copyright (C) 2024 Claudio Chimera and others.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-env mocha */

const path = require('path');
const fs = require('fs');
const should = require('should');
const helper = require('node-red-node-test-helper');
const device = require('../devices/device.js');
const google_smarthome = require('../google-smarthome.js');

helper.init(require.resolve('node-red'));

describe('Device Node', function () {
    beforeEach(function (done) {
        // Ensure Node-RED userDir is set
        if(typeof helper.settings().userDir == 'undefined')
            helper.settings({ userDir: '/tmp' });
    
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('Smart Home should be loaded with correct default params', function (done) {
        this.timeout(10000);
        fs.readFile(
            path.join(__dirname, 'sh/flows.json'), function (err, data) {
                if (err) throw err;
                const flow = JSON.parse(data);
                helper.load([google_smarthome, device], flow, function () {
                    try {
                        console.log(helper);
                        const cucinaDevice = helper.getNode("a5782b1b.e120f8");
                        cucinaDevice.should.have.property('type', 'google-device');
                        cucinaDevice.should.have.property('client');
                        cucinaDevice.should.have.property('clientConn');
                        const clnt = helper.getNode(cucinaDevice.client);
                        clnt.should.have.property('type', 'googlesmarthome-client');
                        const mgmt = helper.getNode("mngm");
                        mgmt.should.have.property('type', 'google-mgmt');
                        /*
                        n1.should.have.property('device_type', 'onoff');
                        n1.should.have.property('is_dimmable', false);
                        n1.should.have.property('has_temp', false);
                        n1.should.have.property('is_rgb', false);
                        n1.should.have.property('is_hsv', false);*/
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            }
        );
    });
});
