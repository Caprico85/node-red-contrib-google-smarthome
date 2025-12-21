import { cp, mkdir, rm } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsToCopy = [
    'google-smarthome.html',
    'google-mgmt.html',
    'devices/*.html',
    'icons/',
    'locales/',
    'devices/locales/',
    'lib/frontend/',
    'test/*.json',
];

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const useTsgo = true;


try {
    // clean dist directory
    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });

    // compile TypeScript
    await runTsc();
    
    // copy static assets
    await copyAssets();
} catch (err) {
    console.error(err);
    process.exitCode = 1;
}

async function copyAssets() {
    const assetsGlob = await glob(assetsToCopy);
    for await (let file of assetsGlob) {
        const source = path.join(projectRoot, file);
        const destination = path.join(distDir, file);
        
        await mkdir(path.dirname(destination), { recursive: true });
        await cp(source, destination, { recursive: true });
        
        console.log(`Copied: ${file}`);
    }

}

async function expandCopyTargets(targets) {
    const expanded = await Promise.all(
        targets.map(async (target) => {
            /*if (!target.includes('*')) {
                return [target];
            }*/

            const matches = await glob(target, {
                cwd: projectRoot,
                nodir: true,
                dot: true,
            });

            if (matches.length === 0) {
                console.warn(`No matches found for copy target: ${target}`);
            }

            return matches;
        })
    );

    return expanded.flat();
}


function runTsc() {
    return new Promise((resolve, reject) => {
        const tscBin = path.join(
            projectRoot,
            'node_modules',
            '.bin',
            useTsgo ? 'tsgo' : 'tsc'
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
                console.warn(`tsc exited with code ${code}`);
            }

            resolve();
        });
    });
}
