import { cp, mkdir, rm } from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const copyTargets = [
    'google-smarthome.html',
    'google-mgmt.html',
    path.join('devices', 'device.html'),
    path.join('icons'),
    path.join('locales'),
    path.join('devices', 'locales'),
    path.join('lib', 'frontend'),
];

function runTsc() {
    return new Promise((resolve, reject) => {
        const tscBin = path.join(
            projectRoot,
            'node_modules',
            '.bin',
            process.platform === 'win32' ? 'tsc.cmd' : 'tsc'
        );

        const tsc = spawn(
            tscBin,
            ['--project', 'tsconfig.json', '--pretty', 'false'],
            {
                cwd: projectRoot,
                stdio: 'inherit'
            }
        );

        tsc.on('error', (err) => {
            reject(new Error(`Failed to start tsc: ${err.message}`));
        });

        tsc.on('close', (code, signal) => {
            if (signal) {
                reject(new Error(`tsc terminated with signal ${signal}`));
                return;
            }

            if (code !== 0) {
                console.warn(
                    `tsc exited with code ${code}. Emitted output is kept to allow non-blocking diagnostics.`
                );
            }

            resolve();
        });
    });
}

async function copyAsset(relativePath) {
    const source = path.join(projectRoot, relativePath);
    const destination = path.join(distDir, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source, destination, { recursive: true });
}

async function build() {
    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });

    await runTsc();
    await Promise.all(copyTargets.map(copyAsset));
}

try {
    await build();
} catch (err) {
    console.error(err);
    process.exitCode = 1;
}
