# Prepare Node-RED for debugging

You need to start Node-RED with the command line option `--inspect=0.0.0.0:9229`. This way, Node-RED opens port 9229
where you can later attach your debugger.

If you are running Node-RED as a Docker container in Podman, this may be done by adding
`Environment=NODE_OPTIONS=--inspect=0.0.0.0:9229` in the `[CONTAINER]` section of your systemd container description.


# Attaching your debugger to Node-RED

In Visual Studio Code, your launch.json has to look like this:

```json
{
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "Name of your debug configuration",
            "address": "Host name or IP (without protocol, just the host name)",
            "port": 9229,
            "localRoot": "${workspaceFolder}",
            "remoteRoot": "/data/node-red-contrib-google-smarthome/",
            "skipFiles": [
                "<node_internals>/**"
            ],
        }
    ]
}
```


# Debug startup of Node-RED

Sometimes you may need to debug problem during initialization.

If Node-RED is still able to start up, you can wait until Node-RED has started, then attach your debugger, set
breakpoints and then restart your flows using the Node-RED UI.

You can have node.js wait until your debugger is attached before actually continuing the startup process. This way, you
can debug problems during initialization of Node-RED or your nodes, where you cannot wait until everything is running