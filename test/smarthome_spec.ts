/**
 * node-red-contrib-google-smarthome
 * Copyright (C) 2025 Claudio Chimera and others.
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

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it } from 'mocha';
import { GoogleSmartHome } from '../lib/SmartHome.js';

describe('SmartHome.checkAppJsVersion', function () {
    it('reads the local app.js version and reports up-to-date', function (done) {
        const expectedVersion = '1.00';

        const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nr-gsh-'));

        let finished = false;
        const finish = (err?: Error) => {
            if (finished) {
                return;
            }
            finished = true;
            fs.rmSync(userDir, { recursive: true, force: true });
            done(err);
        };

        const mgmtNode = {
            warn: (msg) => finish(new Error(`Unexpected warning: ${msg}`)),
            mgmtNodes: {},
        };

        const debug_function = (msg) => {
            try {
                assert.ok(msg.includes(`v${expectedVersion}`), 'Expected debug output to include version');
                assert.ok(msg.includes('up to date'), 'Expected debug output to indicate up-to-date');
                finish();
            } catch (err) {
                finish(err as Error);
            }
        };

        const error_function = (msg) => finish(new Error(String(msg)));

        const smarthome = new GoogleSmartHome(
            mgmtNode,
            'node-id',
            userDir,
            '/',
            false,
            '',
            [],
            '',
            '',
            60,
            false,
            '',
            0,
            '',
            0,
            0,
            false,
            false,
            '',
            '',
            '',
            '',
            '',
            0,
            0,
            0,
            false,
            debug_function,
            error_function
        );

        smarthome.checkAppJsVersion(expectedVersion);
    });
});
