/**
 * NodeRED Google SmartHome
 * Copyright (C) 2020 Michael Jacobsen.
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
 **/

module.exports = function(RED) {
    "use strict";

    const formats = require('../formatvalues.js');

    /******************************************************************************************************************
     *
     *
     */
    class LightOnOffNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.client     = config.client;
            this.clientConn = RED.nodes.getNode(this.client);
            this.topicOut   = config.topic;
            this.passthru   = config.passthru;
            this.topicDelim = '/';

            if (!this.clientConn) {
                this.error(RED._("light.errors.missing-config"));
                this.status({fill: "red", shape: "dot", text: "Missing config"});
                return;
            } else if (typeof this.clientConn.register !== 'function') {
                this.error(RED._("light.errors.missing-bridge"));
                this.status({fill: "red", shape: "dot", text: "Missing SmartHome"});
                return;
            }

            this.states = this.clientConn.register(this, 'light-onoff', config.name);

            this.status({fill: "yellow", shape: "dot", text: "Ready"});

            this.on('input', this.onInput);
            this.on('close', this.onClose);
        }

        /******************************************************************************************************************
         * called to register device
         *
         */
        registerDevice(client, name) {
            let states = {
                online: true,
                on: false
            };

            let device = {
                id: client.id,
                properties: {
                    type: 'action.devices.types.LIGHT',
                    traits: ['action.devices.traits.OnOff'],
                    name: {
                        defaultNames: ["Node-RED On/Off Light"],
                        name: name
                    },
                    willReportState: true,
                    attributes: {
                    },
                    deviceInfo: {
                        manufacturer: 'Node-RED',
                        model: 'nr-light-onoff-v1',
                        swVersion: '1.0',
                        hwVersion: '1.0'
                    },
                    customData: {
                        "nodeid": client.id,
                        "type": 'light-onoff'
                    }
                }
            };

            device.states = states;

            return device;
        }

        updateStatusIcon() {
            if (this.states.on) {
                this.status({fill: "green", shape: "dot", text: "ON"});
            } else {
                this.status({fill: "red", shape: "dot", text: "OFF"});
            }
        }

        /******************************************************************************************************************
         * called when state is updated from Google Assistant
         *
         */
        updated(device) {
            let states = device.states;
            let command = device.command;
            RED.log.debug("LightOnOffNode(updated): states = " + JSON.stringify(states));

            Object.assign(this.states, states);

            this.updateStatusIcon();

            let msg = {
                topic: this.topicOut,
                device_name: device.properties.name.name,
                command: command,
                payload: {
                    online: states.online,
                    on: states.on,
                },
            };

            this.send(msg);
        };

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        onInput(msg) {
            RED.log.debug("LightOnOffNode(input)");

            let topicArr = String(msg.topic).split(this.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic

            RED.log.debug("LightOnOffNode(input): topic = " + topic);

            try {
                if (topic.toUpperCase() === 'ON') {
                    RED.log.debug("LightOnOffNode(input): ON");
                    let on = formats.FormatValue(formats.Formats.BOOL, 'on', msg.payload);

                    if (this.states.on !== on) {
                        this.states.on = on;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.on;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                } else if (topic.toUpperCase() === 'ONLINE') {
                    RED.log.debug("LightOnOffNode(input): ONLINE");
                    let online = formats.FormatValue(formats.Formats.BOOL, 'online', msg.payload);

                    if (this.states.online !== online) {
                        this.states.online = online;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.online;
                            this.send(msg);
                        }
                    }
                } else {
                    RED.log.debug("LightOnOffNode(input): some other topic");
                    let object = {};

                    if (typeof msg.payload === 'object') {
                        object = msg.payload;
                    } else {
                        RED.log.debug("LightOnOffNode(input): typeof payload = " + typeof msg.payload);
                        return;
                    }

                    let on     = this.states.on;
                    let online = this.states.online;

                    // on
                    if (object.hasOwnProperty('on')) {
                        on = formats.FormatValue(formats.Formats.BOOL, 'on', object.on);
                    }

                    // online
                    if (object.hasOwnProperty('online')) {
                        online = formats.FormatValue(formats.Formats.BOOL, 'online', object.online);
                    }

                    if (this.states.on !== on || this.states.online !== online){
                        this.states.on     = on;
                        this.states.online = online;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload             = {};
                            msg.payload.online      = this.states.online;
                            msg.payload.on          = this.states.on;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                }
            } catch (err) {
                RED.log.error(err);
            }
        }

        onClose(removed, done) {
            if (removed) {
                // this node has been deleted
                this.clientConn.remove(this, 'light-onoff');
            } else {
                // this node is being restarted
                this.clientConn.deregister(this, 'light-onoff');
            }

            done();
        }
    }

    RED.nodes.registerType("google-light-onoff", LightOnOffNode);

    /******************************************************************************************************************
     *
     *
     */
    class LightDimmableNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.client     = config.client;
            this.clientConn = RED.nodes.getNode(this.client);
            this.topicOut   = config.topic;
            this.passthru   = config.passthru;
            this.topicDelim = '/';

            if (!this.clientConn) {
                this.error(RED._("light.errors.missing-config"));
                this.status({fill: "red", shape: "dot", text: "Missing config"});
                return;
            } else if (typeof this.clientConn.register !== 'function') {
                this.error(RED._("light.errors.missing-bridge"));
                this.status({fill: "red", shape: "dot", text: "Missing SmartHome"});
                return;
            }

            this.states = this.clientConn.register(this, 'light-dimmable', config.name);

            this.status({fill: "yellow", shape: "dot", text: "Ready"});

            this.on('input', this.onInput);
            this.on('close', this.onClose);
        }

        /******************************************************************************************************************
         * called to register device
         *
         */
        registerDevice(client, name) {
            let states = {
                online: true,
                on: false,
                brightness: 100     // integer, absolute brightness, from 0 to 100
            };

            let device = {
                id: client.id,
                properties: {
                    type: 'action.devices.types.LIGHT',
                    traits: [
                        'action.devices.traits.OnOff',
                        'action.devices.traits.Brightness'
                    ],
                    name: {
                        defaultNames: ["Node-RED Dimmable Light"],
                        name: name
                    },
                    willReportState: true,
                    attributes: {
                    },
                    deviceInfo: {
                        manufacturer: 'Node-RED',
                        model: 'nr-light-dimmable-v1',
                        swVersion: '1.0',
                        hwVersion: '1.0'
                    },
                    customData: {
                        "nodeid": client.id,
                        "type": 'light-dimmable'
                    }
                }
            };

            device.states = states;

            return device;
        }

        updateStatusIcon() {
            if (this.states.on) {
                this.status({fill: "green", shape: "dot", text: "ON"});
            } else {
                this.status({fill: "red", shape: "dot", text: "OFF"});
            }
        }

        /******************************************************************************************************************
         * called when state is updated from Google Assistant
         *
         */
        updated(device) {
            let states = device.states;
            let command = device.command;
            RED.log.debug("LightDimmableNode(updated): states = " + JSON.stringify(states));

            Object.assign(this.states, states);

            this.updateStatusIcon();

            let msg = {
                topic: this.topicOut,
                device_name: device.properties.name.name,
                command: command,
                payload: {
                    online: states.online,
                    on: states.on,
                    brightness: states.brightness,
                },
            };

            this.send(msg);
        };

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        onInput(msg) {
            RED.log.debug("LightDimmableNode(input)");

            let topicArr = String(msg.topic).split(this.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic

            RED.log.debug("LightDimmableNode(input): topic = " + topic);

            try {
                if (topic.toUpperCase() === 'ON') {
                    RED.log.debug("LightDimmableNode(input): ON");
                    let on = formats.FormatValue(formats.Formats.BOOL, 'on', msg.payload);

                    if (this.states.on !== on) {
                        this.states.on = on;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.on;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                } else if (topic.toUpperCase() === 'ONLINE') {
                    RED.log.debug("LightDimmableNode(input): ONLINE");
                    let online = formats.FormatValue(formats.Formats.BOOL, 'online', msg.payload);

                    if (this.states.online !== online) {
                        this.states.online = online;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.online;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'BRIGHTNESS') {
                    RED.log.debug("LightDimmableNode(input): BRIGHTNESS");
                    let brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', msg.payload));

                    if (this.states.brightness !== brightness) {
                        this.states.brightness = brightness;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.brightness;
                            this.send(msg);
                        }
                    }
                } else {
                    RED.log.debug("LightDimmableNode(input): some other topic");
                    let object = {};

                    if (typeof msg.payload === 'object') {
                        object = msg.payload;
                    } else {
                        RED.log.debug("LightDimmableNode(input): typeof payload = " + typeof msg.payload);
                        return;
                    }

                    let on         = this.states.on;
                    let online     = this.states.online;
                    let brightness = this.states.brightness;

                    // on
                    if (object.hasOwnProperty('on')) {
                        on = formats.FormatValue(formats.Formats.BOOL, 'on', object.on);
                    }

                    // online
                    if (object.hasOwnProperty('online')) {
                        online = formats.FormatValue(formats.Formats.BOOL, 'online', object.online);
                    }

                    // brightness
                    if (object.hasOwnProperty('brightness')) {
                        brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', object.brightness));
                    }

                    if (this.states.on !== on || this.states.online !== online || this.states.brightness !== brightness){
                        this.states.on         = on;
                        this.states.online     = online;
                        this.states.brightness = brightness;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload             = {};
                            msg.payload.online      = this.states.online;
                            msg.payload.on          = this.states.on;
                            msg.payload.brightness  = this.states.brightness;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                }
            } catch (err) {
                RED.log.error(err);
            }
        }

        onClose(removed, done) {
            if (removed) {
                // this node has been deleted
                this.clientConn.remove(this, 'light-dimmable');
            } else {
                // this node is being restarted
                this.clientConn.deregister(this, 'light-dimmable');
            }

            done();
        }
    }

    RED.nodes.registerType("google-light-dimmable", LightDimmableNode);

    /******************************************************************************************************************
     *
     *
     */
    class LightColorTempNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.client     = config.client;
            this.clientConn = RED.nodes.getNode(this.client);
            this.topicOut   = config.topic;
            this.passthru   = config.passthru;
            this.topicDelim = '/';

            if (!this.clientConn) {
                this.error(RED._("light.errors.missing-config"));
                this.status({fill: "red", shape: "dot", text: "Missing config"});
                return;
            } else if (typeof this.clientConn.register !== 'function') {
                this.error(RED._("light.errors.missing-bridge"));
                this.status({fill: "red", shape: "dot", text: "Missing SmartHome"});
                return;
            }

            this.states = this.clientConn.register(this, 'light-temperature', config.name);

            this.status({fill: "yellow", shape: "dot", text: "Ready"});

            this.on('input', this.onInput);
            this.on('close', this.onClose);
        }

        /******************************************************************************************************************
         * called to register device
         *
         */
        registerDevice(client, name) {
            let states = {
                online: true,
                on: false,
                brightness: 100,     // integer, absolute brightness, from 0 to 100
                color: {
                    name: "",
                    temperatureK: 4000,
                }
            };

            let device = {
                id: client.id,
                properties: {
                    type: 'action.devices.types.LIGHT',
                    traits: [
                        'action.devices.traits.OnOff',
                        'action.devices.traits.Brightness',
                        'action.devices.traits.ColorSetting'
                    ],
                    name: {
                        defaultNames: ["Node-RED ColorTemp Light"],
                        name: name
                    },
                    willReportState: true,
                    attributes: {
                        // this is the default range used by Googles color presets in the Home App
                        colorTemperatureRange: {
                            temperatureMinK: 2000,
                            temperatureMaxK: 6000
                        },
                        commandOnlyColorSetting: false,
                    },
                    deviceInfo: {
                        manufacturer: 'Node-RED',
                        model: 'nr-light-temperature-v1',
                        swVersion: '1.0',
                        hwVersion: '1.0'
                    },
                    customData: {
                        "nodeid": client.id,
                        "type": 'light-temperature'
                    }
                }
            };

            device.states = states;

            return device;
        }

        updateStatusIcon() {
            if (this.states.on) {
                this.status({fill: "green", shape: "dot", text: "ON"});
            } else {
                this.status({fill: "red", shape: "dot", text: "OFF"});
            }
        }

        /******************************************************************************************************************
         * called when state is updated from Google Assistant
         *
         */
        updated(device) {
            let states = device.states;
            let command = device.command;
            RED.log.debug("LightColorTempNode(updated): states = " + JSON.stringify(states));

            Object.assign(this.states, states);

            this.updateStatusIcon();

            let msg = {
                topic: this.topicOut,
                device_name: device.properties.name.name,
                command: command,
                payload: {
                    online: states.online,
                    on: states.on,
                    brightness: states.brightness,
                    temperature: states.color.temperature,
                },
            };

            this.send(msg);
        };

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        onInput(msg) {
            RED.log.debug("LightColorTempNode(input)");

            let topicArr = String(msg.topic).split(this.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic

            RED.log.debug("LightColorTempNode(input): topic = " + topic);

            try {
                if (topic.toUpperCase() === 'ON') {
                    RED.log.debug("LightColorTempNode(input): ON");
                    let on = formats.FormatValue(formats.Formats.BOOL, 'on', msg.payload);

                    if (this.states.on !== on) {
                        this.states.on = on;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.on;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                } else if (topic.toUpperCase() === 'ONLINE') {
                    RED.log.debug("LightColorTempNode(input): ONLINE");
                    let online = formats.FormatValue(formats.Formats.BOOL, 'online', msg.payload);

                    if (this.states.online !== online) {
                        this.states.online = online;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.online;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'BRIGHTNESS') {
                    RED.log.debug("LightColorTempNode(input): BRIGHTNESS");
                    let brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', msg.payload));

                    if (this.states.brightness !== brightness) {
                        this.states.brightness = brightness;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.brightness;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'TEMPERATURE') {
                    RED.log.debug("LightColorTempNode(input): TEMPERATURE");
                    let temperature = formats.FormatColorTemperature(formats.FormatValue(formats.Formats.INT, 'temperature', msg.payload));

                    if (this.states.color.temperatureK !== temperature) {
                        this.states.color.temperatureK = temperature;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.color.temperatureK;
                            this.send(msg);
                        }
                    }
                } else {
                    RED.log.debug("LightColorTempNode(input): some other topic");
                    let object = {};

                    if (typeof msg.payload === 'object') {
                        object = msg.payload;
                    } else {
                        RED.log.debug("LightColorTempNode(input): typeof payload = " + typeof msg.payload);
                        return;
                    }

                    let on = this.states.on;
                    let online = this.states.online;
                    let brightness = this.states.brightness;
                    let temperature = this.states.color.temperatureK;

                    // on
                    if (object.hasOwnProperty('on')) {
                        on = formats.FormatValue(formats.Formats.BOOL, 'on', object.on);
                    }

                    // online
                    if (object.hasOwnProperty('online')) {
                        online = formats.FormatValue(formats.Formats.BOOL, 'online', object.online);
                    }

                    // brightness
                    if (object.hasOwnProperty('brightness')) {
                        brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', object.brightness));
                    }

                    // color
                    if (object.hasOwnProperty('temperature')) {
                        temperature = formats.FormatColorTemperature(formats.FormatValue(formats.Formats.INT, 'temperature', object.temperature));
                    }

                    if (this.states.on !== on || this.states.online !== online || this.states.brightness !== brightness || this.states.color.temperatureK !== temperature) {
                        this.states.on = on;
                        this.states.online = online;
                        this.states.brightness = brightness;
                        this.states.color.temperatureK = temperature;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = {};
                            msg.payload.online = this.states.online;
                            msg.payload.on = this.states.on;
                            msg.payload.brightness = this.states.brightness;
                            msg.payload.temperature = this.states.color.temperatureK;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                }
            } catch (err) {
                RED.log.error(err);
            }
        }

        onClose(removed, done) {
            if (removed) {
                // this node has been deleted
                this.clientConn.remove(this, 'light-temperature');
            } else {
                // this node is being restarted
                this.clientConn.deregister(this, 'light-temperature');
            }

            done();
        }
    }

    RED.nodes.registerType("google-light-temperature", LightColorTempNode);

    /******************************************************************************************************************
     *
     *
     */
    class LightHsvNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.client     = config.client;
            this.clientConn = RED.nodes.getNode(this.client);
            this.topicOut   = config.topic;
            this.passthru   = config.passthru;
            this.topicDelim = '/';

            if (!this.clientConn) {
                this.error(RED._("light.errors.missing-config"));
                this.status({fill: "red", shape: "dot", text: "Missing config"});
                return;
            } else if (typeof this.clientConn.register !== 'function') {
                this.error(RED._("light.errors.missing-bridge"));
                this.status({fill: "red", shape: "dot", text: "Missing SmartHome"});
                return;
            }

            this.states = this.clientConn.register(this, 'light-hsv', config.name);

            this.status({fill: "yellow", shape: "dot", text: "Ready"});

            this.on('input', this.onInput);
            this.on('close', this.onClose);
        }

        /******************************************************************************************************************
         * called to register device
         *
         */
        registerDevice(client, name) {
            let states = {
                online: true,
                on: false,
                brightness: 100,            // integer, absolute brightness, from 0 to 100
                color: {
                    name: "",
                    spectrumHsv: {
                        hue: 0.0,           // float, representing hue as positive degrees in the range of [0.0, 360.0)
                        saturation: 0.0,    // float, representing saturation as a percentage in the range [0.0, 1.0]
                        value: 1            // float, representing value as a percentage in the range [0.0, 1.0]
                    }
                }
            };

            let device = {
                id: client.id,
                properties: {
                    type: 'action.devices.types.LIGHT',
                    traits: [
                        'action.devices.traits.OnOff',
                        'action.devices.traits.Brightness',
                        'action.devices.traits.ColorSetting'
                    ],
                    name: {
                        defaultNames: ["Node-RED HSV Light"],
                        name: name
                    },
                    willReportState: true,
                    attributes: {
                        colorModel: "hsv",
                        commandOnlyColorSetting: false,
                    },
                    deviceInfo: {
                        manufacturer: 'Node-RED',
                        model: 'nr-light-hsv-v1',
                        swVersion: '1.0',
                        hwVersion: '1.0'
                    },
                    customData: {
                        "nodeid": client.id,
                        "type": 'light-hsv'
                    }
                }
            };

            device.states = states;

            return device;
        }

        updateStatusIcon() {
            if (this.states.on) {
                this.status({fill: "green", shape: "dot", text: "ON"});
            } else {
                this.status({fill: "red", shape: "dot", text: "OFF"});
            }
        }

        /******************************************************************************************************************
         * called when state is updated from Google Assistant
         *
         */
        updated(device) {
            let states = device.states;
            let command = device.command;
            RED.log.debug("LightHsvNode(updated): states = " + JSON.stringify(states));

            Object.assign(this.states, states);

            this.updateStatusIcon();

            let msg = {
                topic: this.topicOut,
                device_name: device.properties.name.name,
                command: command,
                payload: {
                    online: states.online,
                    on: states.on,
                    hue: states.color.spectrumHsv.hue,
                    saturation: states.color.spectrumHsv.saturation * 100,  // rescale
                    value: states.color.spectrumHsv.value * 100,            // rescale
                    name: states.color.name,
                    brightness: states.brightness,
                },
            };

            this.send(msg);
        };

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        onInput(msg) {
            RED.log.debug("LightHsvNode(input)");

            let topicArr = String(msg.topic).split(this.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic

            RED.log.debug("LightHsvNode(input): topic = " + topic);

            try {
                if (topic.toUpperCase() === 'ON') {
                    RED.log.debug("LightHsvNode(input): ON");
                    let on = formats.FormatValue(formats.Formats.BOOL, 'on', msg.payload);

                    if (this.states.on !== on) {
                        this.states.on = on;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.on;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                } else if (topic.toUpperCase() === 'ONLINE') {
                    RED.log.debug("LightHsvNode(input): ONLINE");
                    let online = formats.FormatValue(formats.Formats.BOOL, 'online', msg.payload);

                    if (this.states.online !== online) {
                        this.states.online = online;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.online;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'BRIGHTNESS') {  // Integer, 0 - 100
                    RED.log.debug("LightHsvNode(input): BRIGHTNESS");
                    let brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', msg.payload));

                    if (this.states.brightness !== brightness) {
                        this.states.brightness = brightness;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = brightness;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'HUE') {  // Float, 0.0 - 360.0
                    RED.log.debug("LightHsvNode(input): HUE");
                    let hue = formats.FormatHue(formats.FormatValue(formats.Formats.FLOAT, 'hue', msg.payload));

                    if (this.states.color.spectrumHsv.hue !== hue) {
                        this.states.color.spectrumHsv.hue = hue;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = hue;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'SATURATION') {  // Float, 0.0 - 100.0
                    RED.log.debug("LightHsvNode(input): SATURATION");
                    let saturation = formats.FormatSaturation(formats.FormatValue(formats.Formats.FLOAT, 'saturation', msg.payload)) / 100;

                    if (this.states.color.spectrumHsv.saturation !== saturation) {
                        this.states.color.spectrumHsv.saturation = saturation;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = saturation;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'VALUE') {  // Float, 0.0 - 100.0
                    RED.log.debug("LightHsvNode(input): VALUE");
                    let value = formats.FormatSaturation(formats.FormatValue(formats.Formats.FLOAT, 'value', msg.payload)) / 100;

                    if (this.states.color.spectrumHsv.value !== value) {
                        this.states.color.spectrumHsv.value = value;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = value;
                            this.send(msg);
                        }
                    }
                } else {
                    RED.log.debug("LightHsvNode(input): some other topic");
                    let object = {};

                    if (typeof msg.payload === 'object') {
                        object = msg.payload;
                    } else {
                        RED.log.debug("LightHsvNode(input): typeof payload = " + typeof msg.payload);
                        return;
                    }

                    let on         = this.states.on;
                    let online     = this.states.online;
                    let brightness = this.states.brightness;
                    let hue        = this.states.color.spectrumHsv.hue;
                    let saturation = this.states.color.spectrumHsv.saturation;
                    let value      = this.states.color.spectrumHsv.value;

                    // on
                    if (object.hasOwnProperty('on')) {
                        on = formats.FormatValue(formats.Formats.BOOL, 'on', object.on);
                    }

                    // online
                    if (object.hasOwnProperty('online')) {
                        online = formats.FormatValue(formats.Formats.BOOL, 'online', object.online);
                    }

                    // brightness
                    if (object.hasOwnProperty('brightness')) {
                        brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', object.brightness));
                    }

                    // hue
                    if (object.hasOwnProperty('hue')) {
                        hue = formats.FormatHue(formats.FormatValue(formats.Formats.FLOAT, 'hue', object.hue));
                    }

                    // saturation
                    if (object.hasOwnProperty('saturation')) {
                        saturation = formats.FormatSaturation(formats.FormatValue(formats.Formats.FLOAT, 'saturation', object.saturation)) / 100;
                    }

                    // value
                    if (object.hasOwnProperty('value')) {
                        value = formats.FormatSaturation(formats.FormatValue(formats.Formats.FLOAT, 'value', object.value)) / 100;
                    }

                    if (this.states.on !== on || this.states.online !== online || this.states.brightness !== brightness || this.states.color.spectrumHsv.hue !== hue || this.states.color.spectrumHsv.saturation !== saturation || this.states.color.spectrumHsv.value !== value) {
                        this.states.on                              = on;
                        this.states.online                          = online;
                        this.states.brightness                      = brightness;
                        this.states.color.spectrumHsv.hue           = hue;
                        this.states.color.spectrumHsv.saturation    = saturation;
                        this.states.color.spectrumHsv.value         = value;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload             = {};
                            msg.payload.online      = this.states.online;
                            msg.payload.on          = this.states.on;
                            msg.payload.hue         = this.states.color.spectrumHsv.hue;
                            msg.payload.saturation  = this.states.color.spectrumHsv.saturation * 100;   // rescale
                            msg.payload.value       = this.states.color.spectrumHsv.value * 100;        // rescale
                            msg.payload.name        = this.states.color.name;
                            msg.payload.brightness  = this.states.brightness;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                }
            } catch (err) {
                RED.log.error(err);
            }
        }

        onClose(removed, done) {
            if (removed) {
                // this node has been deleted
                this.clientConn.remove(this, 'light-hsv');
            } else {
                // this node is being restarted
                this.clientConn.deregister(this, 'light-hsv');
            }

            done();
        }
    }

    RED.nodes.registerType("google-light-hsv", LightHsvNode);

    /******************************************************************************************************************
     *
     *
     */
    class LightRgbNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.client     = config.client;
            this.clientConn = RED.nodes.getNode(this.client);
            this.topicOut   = config.topic;
            this.passthru   = config.passthru;
            this.topicDelim = '/';

            if (!this.clientConn) {
                this.error(RED._("light.errors.missing-config"));
                this.status({fill: "red", shape: "dot", text: "Missing config"});
                return;
            } else if (typeof this.clientConn.register !== 'function') {
                this.error(RED._("light.errors.missing-bridge"));
                this.status({fill: "red", shape: "dot", text: "Missing SmartHome"});
                return;
            }

            this.states = this.clientConn.register(this, 'light-rgb', config.name);

            this.status({fill: "yellow", shape: "dot", text: "Ready"});

            this.on('input', this.onInput);
            this.on('close', this.onClose);
        }

        /******************************************************************************************************************
         * called to register device
         *
         */
        registerDevice(client, name) {
            // according to Googles own doc.'s, 'color.spectrumRGB' should actually be 'color.spectrumRgb'
            let states = {
                online: true,
                on: false,
                brightness: 100,            // integer, absolute brightness, from 0 to 100
                color: {
                    name: "",
                    spectrumRGB: 16777215   // red = 16711680, green = 65280, blue = 255
                }
            };

            let device = {
                id: client.id,
                properties: {
                    type: 'action.devices.types.LIGHT',
                    traits: [
                        'action.devices.traits.OnOff',
                        'action.devices.traits.Brightness',
                        'action.devices.traits.ColorSetting'
                    ],
                    name: {
                        defaultNames: ["Node-RED RGB Light"],
                        name: name
                    },
                    willReportState: true,
                    attributes: {
                        colorModel: "rgb",
                        commandOnlyColorSetting: false,
                    },
                    deviceInfo: {
                        manufacturer: 'Node-RED',
                        model: 'nr-light-rgb-v1',
                        swVersion: '1.0',
                        hwVersion: '1.0'
                    },
                    customData: {
                        "nodeid": client.id,
                        "type": 'light-rgb'
                    }
                }
            };

            device.states = states;

            return device;
        }

        updateStatusIcon() {
            if (this.states.on) {
                this.status({fill: "green", shape: "dot", text: "ON"});
            } else {
                this.status({fill: "red", shape: "dot", text: "OFF"});
            }
        }

        /******************************************************************************************************************
         * called when state is updated from Google Assistant
         *
         */
        updated(device) {
            let states = device.states;
            let command = device.command;
            RED.log.debug("LightRgbNode(updated): states = " + JSON.stringify(states));

            Object.assign(this.states, states);

            this.updateStatusIcon();

            let msg = {
                topic: this.topicOut,
                device_name: device.properties.name.name,
                command: command,
                payload: {
                    online: states.online,
                    on: states.on,
                    rgb: states.color.spectrumRGB,
                    name: states.color.name,
                    brightness: states.brightness,
                },
            };

            this.send(msg);
        };

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        onInput(msg) {
            RED.log.debug("LightRgbNode(input)");

            let topicArr = String(msg.topic).split(this.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic

            RED.log.debug("LightRgbNode(input): topic = " + topic);

            try {
                if (topic.toUpperCase() === 'ON') {
                    RED.log.debug("LightRgbNode(input): ON");
                    let on = formats.FormatValue(formats.Formats.BOOL, 'on', msg.payload);

                    if (this.states.on !== on) {
                        this.states.on = on;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.on;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                } else if (topic.toUpperCase() === 'ONLINE') {
                    RED.log.debug("LightRgbNode(input): ONLINE");
                    let online = formats.FormatValue(formats.Formats.BOOL, 'online', msg.payload);

                    if (this.states.online !== online) {
                        this.states.online = online;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.online;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'BRIGHTNESS') {  // Integer, 0 - 100
                    RED.log.debug("LightRgbNode(input): BRIGHTNESS");
                    let brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', msg.payload));

                    if (this.states.brightness !== brightness) {
                        this.states.brightness = brightness;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = brightness;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'RGB') {  // Integer, 0 - 16777215
                    RED.log.debug("LightRgbNode(input): RGB");
                    let rgb = formats.FormatRGB(formats.FormatValue(formats.Formats.INT, 'rgb', msg.payload));

                    if (this.states.color.spectrumRGB !== rgb) {
                        this.states.color.spectrumRGB = rgb;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = rgb;
                            this.send(msg);
                        }
                    }
                } else {
                    RED.log.debug("LightRgbNode(input): some other topic");
                    let object = {};

                    if (typeof msg.payload === 'object') {
                        object = msg.payload;
                    } else {
                        RED.log.debug("LightRgbNode(input): typeof payload = " + typeof msg.payload);
                        return;
                    }

                    let on         = this.states.on;
                    let online     = this.states.online;
                    let brightness = this.states.brightness;
                    let rgb        = this.states.color.spectrumRGB;

                    // on
                    if (object.hasOwnProperty('on')) {
                        on = formats.FormatValue(formats.Formats.BOOL, 'on', object.on);
                    }

                    // online
                    if (object.hasOwnProperty('online')) {
                        online = formats.FormatValue(formats.Formats.BOOL, 'online', object.online);
                    }

                    // brightness
                    if (object.hasOwnProperty('brightness')) {
                        brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', object.brightness));
                    }

                    // rgb
                    if (object.hasOwnProperty('rgb')) {
                        rgb = formats.FormatRGB(formats.FormatValue(formats.Formats.INT, 'rgb', object.rgb));
                    }

                    if (this.states.on !== on || this.states.online !== online || this.states.brightness !== brightness || this.states.color.spectrumRGB !== rgb) {
                        this.states.on                  = on;
                        this.states.online              = online;
                        this.states.brightness          = brightness;
                        this.states.color.spectrumRGB   = rgb;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload             = {};
                            msg.payload.online      = this.states.online;
                            msg.payload.on          = this.states.on;
                            msg.payload.rgb         = this.states.color.spectrumRGB;
                            msg.payload.brightness  = this.states.brightness;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                }
            } catch (err) {
                RED.log.error(err);
            }
        }

        onClose(removed, done) {
            if (removed) {
                // this node has been deleted
                this.clientConn.remove(this, 'light-rgb');
            } else {
                // this node is being restarted
                this.clientConn.deregister(this, 'light-rgb');
            }

            done();
        }
    }

    RED.nodes.registerType("google-light-rgb", LightRgbNode);

    /******************************************************************************************************************
     *
     *
     */
    class LightRgbTempNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.client     = config.client;
            this.clientConn = RED.nodes.getNode(this.client);
            this.topicOut   = config.topic;
            this.passthru   = config.passthru;
            this.topicDelim = '/';

            if (!this.clientConn) {
                this.error(RED._("light.errors.missing-config"));
                this.status({fill: "red", shape: "dot", text: "Missing config"});
                return;
            } else if (typeof this.clientConn.register !== 'function') {
                this.error(RED._("light.errors.missing-bridge"));
                this.status({fill: "red", shape: "dot", text: "Missing SmartHome"});
                return;
            }

            this.states = this.clientConn.register(this, 'light-rgb-temp', config.name);

            this.status({fill: "yellow", shape: "dot", text: "Ready"});

            this.on('input', this.onInput);
            this.on('close', this.onClose);
        }

        /******************************************************************************************************************
         * called to register device
         *
         */
        registerDevice(client, name) {
            // according to Googles own doc.'s, 'color.spectrumRGB' should actually be 'color.spectrumRgb'
            let states = {
                online: true,
                on: false,
                brightness: 100,            // integer, absolute brightness, from 0 to 100
                color: {
                    name: "",
                    spectrumRGB: 16777215,   // red = 16711680, green = 65280, blue = 255
                    temperatureK: 4000
                }
            };

            let device = {
                id: client.id,
                properties: {
                    type: 'action.devices.types.LIGHT',
                    traits: [
                        'action.devices.traits.OnOff',
                        'action.devices.traits.Brightness',
                        'action.devices.traits.ColorSetting'
                    ],
                    name: {
                        defaultNames: ["Node-RED RGB/Temp Light"],
                        name: name
                    },
                    willReportState: true,
                    attributes: {
                        colorModel: "rgb",
                        colorTemperatureRange: {
                            temperatureMinK: 2000,
                            temperatureMaxK: 6000
                        },
                        commandOnlyColorSetting: false,
                    },
                    deviceInfo: {
                        manufacturer: 'Node-RED',
                        model: 'nr-light-rgb-temp-v1',
                        swVersion: '1.0',
                        hwVersion: '1.0'
                    },
                    customData: {
                        "nodeid": client.id,
                        "type": 'light-rgb-temp'
                    }
                }
            };

            device.states = states;

            return device;
        }

        updateStatusIcon() {
            if (this.states.on) {
                this.status({fill: "green", shape: "dot", text: "ON"});
            } else {
                this.status({fill: "red", shape: "dot", text: "OFF"});
            }
        }

        /******************************************************************************************************************
         * called when state is updated from Google Assistant
         *
         */
        updated(device) {
            let states = device.states;
            let command = device.command;
            RED.log.debug("LightRgbTempNode(updated): states = " + JSON.stringify(states));

            Object.assign(this.states, states);

            this.updateStatusIcon();

            let msg = {
                topic: this.topicOut,
                device_name: device.properties.name.name,
                command: command,
                payload: {
                    online: states.online,
                    on: states.on,
                    rgb: states.color.spectrumRGB,
                    temperature: states.color.temperature,
                    name: states.color.name,
                    brightness: states.brightness,
                },
            };

            this.send(msg);
        };

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        onInput(msg) {
            RED.log.debug("LightRgbTempNode(input)");

            let topicArr = String(msg.topic).split(this.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic

            RED.log.debug("LightRgbTempNode(input): topic = " + topic);

            try {
                if (topic.toUpperCase() === 'ON') {
                    RED.log.debug("LightRgbTempNode(input): ON");
                    let on = formats.FormatValue(formats.Formats.BOOL, 'on', msg.payload);

                    if (this.states.on !== on) {
                        this.states.on = on;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.on;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                } else if (topic.toUpperCase() === 'ONLINE') {
                    RED.log.debug("LightRgbTempNode(input): ONLINE");
                    let online = formats.FormatValue(formats.Formats.BOOL, 'online', msg.payload);

                    if (this.states.online !== online) {
                        this.states.online = online;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.online;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'BRIGHTNESS') {  // Integer, 0 - 100
                    RED.log.debug("LightRgbTempNode(input): BRIGHTNESS");
                    let brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', msg.payload));

                    if (this.states.brightness !== brightness) {
                        this.states.brightness = brightness;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = brightness;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'RGB') {  // Integer, 0 - 16777215
                    RED.log.debug("LightRgbTempNode(input): RGB");
                    let rgb = formats.FormatRGB(formats.FormatValue(formats.Formats.INT, 'rgb', msg.payload));

                    if (this.states.color.spectrumRGB !== rgb) {
                        this.states.color.spectrumRGB = rgb;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = rgb;
                            this.send(msg);
                        }
                    }
                } else if (topic.toUpperCase() === 'TEMPERATURE') {
                    RED.log.debug("LightColorRgbTempNode(input): TEMPERATURE");
                    let temperature = formats.FormatColorTemperature(formats.FormatValue(formats.Formats.INT, 'temperature', msg.payload));

                    if (this.states.color.temperatureK !== temperature) {
                        this.states.color.temperatureK = temperature;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = this.states.color.temperatureK;
                            this.send(msg);
                        }
                    }
                } else {
                    RED.log.debug("LightRgbTempNode(input): some other topic");
                    let object = {};

                    if (typeof msg.payload === 'object') {
                        object = msg.payload;
                    } else {
                        RED.log.debug("LightRgbTempNode(input): typeof payload = " + typeof msg.payload);
                        return;
                    }

                    let on         = this.states.on;
                    let online     = this.states.online;
                    let brightness = this.states.brightness;
                    let rgb        = this.states.color.spectrumRGB;
                    let temperature = this.states.color.temperatureK;

                    // on
                    if (object.hasOwnProperty('on')) {
                        on = formats.FormatValue(formats.Formats.BOOL, 'on', object.on);
                    }

                    // online
                    if (object.hasOwnProperty('online')) {
                        online = formats.FormatValue(formats.Formats.BOOL, 'online', object.online);
                    }

                    // brightness
                    if (object.hasOwnProperty('brightness')) {
                        brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', object.brightness));
                    }

                    // rgb
                    if (object.hasOwnProperty('rgb')) {
                        rgb = formats.FormatRGB(formats.FormatValue(formats.Formats.INT, 'rgb', object.rgb));
                    }

                    // color
                    if (object.hasOwnProperty('temperature')) {
                        temperature = formats.FormatColorTemperature(formats.FormatValue(formats.Formats.INT, 'temperature', object.temperature));
                    }

                    if (this.states.on !== on || this.states.online !== online || this.states.brightness !== brightness || this.states.color.spectrumRGB !== rgb || this.states.color.temperatureK !== temperature) {
                        this.states.on                  = on;
                        this.states.online              = online;
                        this.states.brightness          = brightness;
                        this.states.color.spectrumRGB   = rgb;
                        this.states.color.temperatureK  = temperature;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload             = {};
                            msg.payload.online      = this.states.online;
                            msg.payload.on          = this.states.on;
                            msg.payload.rgb         = this.states.color.spectrumRGB;
                            msg.payload.temperature = this.states.color.temperatureK;
                            msg.payload.brightness  = this.states.brightness;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                }
            } catch (err) {
                RED.log.error(err);
            }
        }

        onClose(removed, done) {
            if (removed) {
                // this node has been deleted
                this.clientConn.remove(this, 'light-rgb-temp');
            } else {
                // this node is being restarted
                this.clientConn.deregister(this, 'light-rgb-temp');
            }

            done();
        }
    }

    RED.nodes.registerType("google-light-rgb-temp", LightRgbTempNode);

    /******************************************************************************************************************
     *
     *
     */
    class LightNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.client      = config.client;
            this.clientConn  = RED.nodes.getNode(this.client);
            this.topicOut    = config.topic;
            this.passthru    = config.passthru;
            this.topicDelim  = '/';
            this.device_type = config.device_type;
            this.is_dimmable = this.device_type !== "onoff";
            this.has_temp    = (this.device_type === "temperature") || (this.device_type === "rgb_temp");
            this.is_rgb      = (this.device_type === "rgb") || (this.device_type === "rgb_temp");
            this.is_hsv      = this.device_type === "hsv";

            if (!this.clientConn) {
                this.error(RED._("light.errors.missing-config"));
                this.status({fill: "red", shape: "dot", text: "Missing config"});
                return;
            } else if (typeof this.clientConn.register !== 'function') {
                this.error(RED._("light.errors.missing-bridge"));
                this.status({fill: "red", shape: "dot", text: "Missing SmartHome"});
                return;
            }

            this.states = this.clientConn.register(this, 'light', config.name, this);

            this.status({fill: "yellow", shape: "dot", text: "Ready"});

            this.on('input', this.onInput);
            this.on('close', this.onClose);
        }

        /******************************************************************************************************************
         * 
         *
         */
        debug(msg) {
            if (this.clientConn && typeof this.clientConn.debug === 'function') {
                this.clientConn.debug(msg);
            } else {
                RED.log.debug(msg);
            }
        }

        /******************************************************************************************************************
         * called to register device
         *
         */
        registerDevice(client, name, me) {
            me.debug("LightNode(registerDevice) device_type " + me.device_type);
            const default_name = me.getDefaultName(me.device_type);
            const default_name_type = default_name.replace(/_\s+/g, '-').toLowerCase();

            let states = {
                online: true,
                on: false,
            };

            let device = {
                id: client.id,
                properties: {
                    type: 'action.devices.types.LIGHT',
                    traits: me.getTraits(me.device_type),
                    name: {
                        defaultNames: ["Node-RED " + default_name_type],
                        name: name
                    },
                    willReportState: true,
                    attributes: {
                    },
                    deviceInfo: {
                        manufacturer: 'Node-RED',
                        model: 'nr-light-' + default_name_type + '-v1',
                        swVersion: '1.0',
                        hwVersion: '1.0'
                    },
                    customData: {
                        "nodeid": client.id,
                        "type": 'light-' + default_name_type
                    }
                }
            };

            device.states = states;
            this.updateAttributesForTraits(me, device);
            this.updateStatesForTraits(me, device);

            return device;
        }

        updateStatusIcon() {
            if (this.states.on) {
                this.status({fill: "green", shape: "dot", text: "ON"});
            } else {
                this.status({fill: "red", shape: "dot", text: "OFF"});
            }
        }

        /******************************************************************************************************************
         * called when state is updated from Google Assistant
         *
         */
        updated(device) {
            let states = device.states;
            let command = device.command;
            this.debug("LightNode(updated): states = " + JSON.stringify(states));

            Object.assign(this.states, states);

            this.updateStatusIcon();

            let msg = {
                topic: this.topicOut,
                device_name: device.properties.name.name,
                command: command,
                payload: {
                    online: states.online,
                    on: states.on,
                },
            };

            if (this.is_dimmable) {
                msg.payload['brightness'] = states.brightness;
            }
            if (this.has_temp) {
                msg.payload['name'] = states.color.name;
                msg.payload['temperature'] = states.color.temperature;
            }
            if (this.is_rgb) {
                msg.payload['name'] = states.color.name;
                msg.payload['rgb'] = states.color.spectrumRgb || states.color.spectrumRgb;
            } else if (this.is_hsv) {
                msg.payload['name'] = states.color.name;
                msg.payload['hue'] = states.color.spectrumHsv.hue;
                msg.payload['saturation'] = states.color.spectrumHsv.saturation * 100;  // rescale
                msg.payload['value'] = states.color.spectrumHsv.value * 100;            // rescale
            }

            this.send(msg);
        };

        /******************************************************************************************************************
         * respond to inputs from NodeRED
         *
         */
        onInput(msg) {
            this.debug("LightNode(input)");

            let topicArr = String(msg.topic).split(this.topicDelim);
            let topic    = topicArr[topicArr.length - 1];   // get last part of topic
            const has_name  = this.is_hsv || this.is_rgb || this.has_temp;

            this.debug("LightNode(input): topic = " + topic);

            try {
                if (topic.toUpperCase() === 'ON') {
                    this.debug("LightNode(input): ON");
                    let on = formats.FormatValue(formats.Formats.BOOL, 'on', msg.payload, this.states.on);

                    if (this.states.on !== on) {
                        this.states.on = on;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = on;
                            this.send(msg);
                        }

                        this.updateStatusIcon();
                    }
                } else if (topic.toUpperCase() === 'ONLINE') {
                    this.debug("LightNode(input): ONLINE");
                    let online = formats.FormatValue(formats.Formats.BOOL, 'online', msg.payload, this.states.online);

                    if (this.states.online !== online) {
                        this.states.online = online;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = online;
                            this.send(msg);
                        }
                    }
                } else if (this.is_dimmable && topic.toUpperCase() === 'BRIGHTNESS') {  // Integer, 0 - 100
                    this.debug("LightNode(input): BRIGHTNESS");
                    let brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', msg.payload, this.states.brightness));

                    if (this.states.brightness !== brightness) {
                        this.states.brightness = brightness;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = brightness;
                            this.send(msg);
                        }
                    }
                } else if (this.is_rgb && topic.toUpperCase() === 'RGB') {  // Integer, 0 - 16777215
                    this.debug("LightNode(input): RGB");
                    let rgb = formats.FormatRGB(formats.FormatValue(formats.Formats.INT, 'rgb', msg.payload, this.states.color.spectrumRgb));

                    if (this.states.color.spectrumRgb !== rgb) {
                        this.states.color.spectrumRgb = rgb;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = rgb;
                            this.send(msg);
                        }
                    }
                } else if (this.has_temp && topic.toUpperCase() === 'TEMPERATURE') {
                    RED.log.debug("LightColorRgbTempNode(input): TEMPERATURE");
                    let temperature = formats.FormatColorTemperature(formats.FormatValue(formats.Formats.INT, 'temperature', msg.payload, this.states.color.temperatureK));

                    if (this.states.color.temperatureK !== temperature) {
                        this.states.color.temperatureK = temperature;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = temperature;
                            this.send(msg);
                        }
                    }
                } else if (this.is_hsv && topic.toUpperCase() === 'HUE') {  // Float, 0.0 - 360.0
                    RED.log.debug("LightHsvNode(input): HUE");
                    let hue = formats.FormatHue(formats.FormatValue(formats.Formats.FLOAT, 'hue', msg.payload, this.states.color.spectrumHsv.hue));

                    if (this.states.color.spectrumHsv.hue !== hue) {
                        this.states.color.spectrumHsv.hue = hue;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = hue;
                            this.send(msg);
                        }
                    }
                } else if (this.is_hsv && topic.toUpperCase() === 'SATURATION') {  // Float, 0.0 - 100.0
                    RED.log.debug("LightHsvNode(input): SATURATION");
                    let saturation = formats.FormatSaturation(formats.FormatValue(formats.Formats.FLOAT, 'saturation', msg.payload, this.states.color.spectrumHsv.saturation * 100)) / 100;

                    if (this.states.color.spectrumHsv.saturation !== saturation) {
                        this.states.color.spectrumHsv.saturation = saturation;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = saturation;
                            this.send(msg);
                        }
                    }
                } else if (this.is_hsv && topic.toUpperCase() === 'VALUE') {  // Float, 0.0 - 100.0
                    RED.log.debug("LightHsvNode(input): VALUE");
                    let value = formats.FormatSaturation(formats.FormatValue(formats.Formats.FLOAT, 'value', msg.payload, this.states.color.spectrumHsv.value * 100)) / 100;

                    if (this.states.color.spectrumHsv.value !== value) {
                        this.states.color.spectrumHsv.value = value;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = value;
                            this.send(msg);
                        }
                    }
                } else if (has_name && topic.toUpperCase() === 'NAME') {
                    RED.log.debug("LightHsvNode(input): NAME");
                    let name = formats.FormatValue(formats.Formats.STRING, 'name', msg.payload, this.states.color.name);

                    if (this.states.color.name !== name) {
                        this.states.color.name = name;

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload = value;
                            this.send(msg);
                        }
                    }
                } else {
                    this.debug("LightNode(input): some other topic");
                    let object = {};

                    if (typeof msg.payload === 'object') {
                        object = msg.payload;
                    } else {
                        this.debug("LightNode(input): typeof payload = " + typeof msg.payload);
                        return;
                    }

                    let on          = this.states.on;
                    let online      = this.states.online;
                    let brightness  = this.is_dimmable ? this.states.brightness : 0;
                    let rgb         = this.is_rgb ? (this.states.color.spectrumRgb): 0;
                    let temperature = this.has_temp ? this.states.color.temperatureK : 0;
                    let hue         = this.is_hsv ?  this.states.color.spectrumHsv.hue : 0;
                    let saturation  = this.is_hsv ?  this.states.color.spectrumHsv.saturation : 0;
                    let value       = this.is_hsv ?  this.states.color.spectrumHsv.value : 0;
                    let name        = has_name ? this.states.color.name : '';

                    let differs = false;

                    // on
                    if (object.hasOwnProperty('on')) {
                        on = formats.FormatValue(formats.Formats.BOOL, 'on', object.on, on);
                        if (this.states.on !== on) {
                            this.states.on = on;
                            differs = true;
                        }
                    }

                    // online
                    if (object.hasOwnProperty('online')) {
                        online = formats.FormatValue(formats.Formats.BOOL, 'online', object.online, online);
                        if (this.states.online !== online) {
                            this.states.online = online;
                            differs = true;
                        }
                    }

                    // brightness
                    if (this.is_dimmable && object.hasOwnProperty('brightness')) {
                        brightness = formats.FormatBrightness(formats.FormatValue(formats.Formats.INT, 'brightness', object.brightness, brightness));
                        if (this.states.brightness !== brightness) {
                            this.states.brightness = brightness;
                            differs = true;
                        }
                    }

                    // rgb
                    if (this.is_rgb && object.hasOwnProperty('rgb')) {
                        rgb = formats.FormatRGB(formats.FormatValue(formats.Formats.INT, 'rgb', object.rgb, rgb));
                        if (this.states.color.spectrumRgb !== rgb) {
                            this.states.color.spectrumRgb = rgb;
                            differs = true;
                        }
                    }

                    // color
                    if (this.has_temp && object.hasOwnProperty('temperature')) {
                        temperature = formats.FormatColorTemperature(formats.FormatValue(formats.Formats.INT, 'temperature', object.temperature, temperature));
                        if (this.states.color.temperatureK !== temperature) {
                            this.states.color.temperatureK  = temperature;
                            differs = true;
                        }
                    }

                    // hue
                    if (this.is_hsv && object.hasOwnProperty('hue')) {
                        hue = formats.FormatHue(formats.FormatValue(formats.Formats.FLOAT, 'hue', object.hue, hue));
                        if (this.states.color.spectrumHsv.hue !== hue) {
                            this.states.color.spectrumHsv.hue = hue;
                                differs = true;
                        }
                    }

                    // saturation
                    if (this.is_hsv && object.hasOwnProperty('saturation')) {
                        saturation = formats.FormatSaturation(formats.FormatValue(formats.Formats.FLOAT, 'saturation', object.saturation, saturation * 100)) / 100;
                        if (this.states.color.spectrumHsv.saturation !== saturation) {
                            this.states.color.spectrumHsv.saturation = saturation;
                            differs = true;
                        }
                    }

                    // value
                    if (this.is_hsv && object.hasOwnProperty('value')) {
                        value = formats.FormatSaturation(formats.FormatValue(formats.Formats.FLOAT, 'value', object.value, value * 100)) / 100;
                        if (this.states.color.spectrumHsv.value !== value) {
                            this.states.color.spectrumHsv.value = value;
                            differs = true;
                        }
                    }

                    // name
                    if (has_name && object.hasOwnProperty('name')) {
                        name = formats.FormatValue(formats.Formats.STRING, 'name', object.name, name);
                        if (this.states.color.name !== name) {
                            this.states.color.name = name;
                            differs = true;
                        }
                    }
                    
                    if (differs) {

                        this.clientConn.setState(this, this.states);  // tell Google ...

                        if (this.passthru) {
                            msg.payload                 = {};
                            msg.payload.online          = online;
                            msg.payload.on              = on;
                            if (this.is_rgb) {
                                msg.payload.name        = name;
                                msg.payload.rgb         = spectrumRgb;
                            }
                            if (this.has_temp) {
                                msg.payload.name        = name;
                                msg.payload.temperature = temperatureK;
                            }
                            if (this.is_dimmable) {
                                msg.payload.brightness  = brightness;
                            }
                            if (this.is_hsv) {
                                msg.payload.name        = name;
                                msg.payload.hue         = hue;
                                msg.payload.saturation  = saturation * 100;   // rescale
                                msg.payload.value       = value * 100;        // rescale
                            }
                            this.send(msg);
                        }
                    }
                    this.updateStatusIcon();
                }
            } catch (err) {
                RED.log.error(err);
            }
        }

        onClose(removed, done) {
            if (removed) {
                // this node has been deleted
                this.clientConn.remove(this, 'light-rgb-temp');
            } else {
                // this node is being restarted
                this.clientConn.deregister(this, 'light-rgb-temp');
            }

            done();
        }

        getDefaultName(device_type) {
            switch(device_type) {
                case "onoff": 
                    return "On/Off Light";
                case "dimmable": 
                    return "Dimmable Light";
                case "temperature": 
                    return "Color (Temperature) Light";
                case "hsv": 
                    return "Color (HSV) Light";
                case "rgb": 
                    return "Color (RGB) Light";
                case "rgb_temp": 
                    return "Color (RGB/Temp) Light";    
            }
            return '';
        }

        getTraits(device_type) {
            let traits=[
                "action.devices.traits.OnOff"
            ];

            if ((device_type !== "onoff")) {
                traits.push("action.devices.traits.Brightness");
                if ((device_type !== "dimmable")) {
                    traits.push("action.devices.traits.ColorSetting");
                }
            }
            return traits;
        }

        updateAttributesForTraits(me, device) {
            let attributes = device.properties.attributes;
            if (me.has_temp) {
                attributes["commandOnlyColorSetting"] = false;
                // this is the default range used by Googles color presets in the Home App
                attributes['colorTemperatureRange'] = {
                    "temperatureMinK": 2000,
                    "temperatureMaxK": 6000
                }
            }
            if (me.is_rgb) {
                attributes["commandOnlyColorSetting"] = false;
                attributes['colorModel'] =  "rgb";
            } else if (me.is_hsv) {
                attributes["commandOnlyColorSetting"] = false;
                attributes['colorModel'] =  "hsv";
            }
        }

        updateStatesForTraits(me, device) {
            let states = device.states;
            if (me.is_dimmable) {
                states['brightness'] = 100;
            }
            if (me.is_rgb || me.is_hsv || me.has_temp) {
                states['color'] = { 'name' : '' };
                if (me.has_temp) {
                    states['color']['temperatureK'] = 4000;
                }
                if (me.is_rgb) {
                    // according to Googles own doc.'s, 'color.spectrumRgb' should actually be 'color.spectrumRgb'
                    states['color']['spectrumRgb'] = 16777215;
                } else if (me.is_hsv) {
                    states['color']['spectrumHsv'] = {
                        hue: 0.0,           // float, representing hue as positive degrees in the range of [0.0, 360.0)
                        saturation: 0.0,    // float, representing saturation as a percentage in the range [0.0, 1.0]
                        value: 1            // float, representing value as a percentage in the range [0.0, 1.0]
                    };
                }
            }
        }
    }

    RED.nodes.registerType("google-light", LightNode);
}
