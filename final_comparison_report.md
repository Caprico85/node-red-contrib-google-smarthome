# Device Trait Comparison Report

This report summarizes the discrepancies in device type and trait definitions between the official Google Home documentation and the implementations found in `devices/device.html` and `devices/device.js`.

## 1. Comparison with `devices/device.html`

### Device Types Mismatch

*   **Device types missing in `devices/device.html` (present in official docs):**
    *   BLANKET
    *   PUMP
*   **Device types present in `devices/device.html` (not in official docs):**
    *   None

### Trait Discrepancies by Device Type

#### AC_UNIT
*   **Required traits missing in HTML:** FanSpeed, OnOff
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** FanSpeed
*   **Traits recommended in docs but required in HTML:** None

#### AIRCOOLER
*   **Required traits missing in HTML:** FanSpeed, HumiditySetting, OnOff
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** FanSpeed, HumiditySetting
*   **Traits recommended in docs but required in HTML:** None

#### AUDIO_VIDEO_RECEIVER
*   **Required traits missing in HTML:** MediaState, TransportControl
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** MediaState, TransportControl
*   **Traits recommended in docs but required in HTML:** None

#### BATHTUB
*   **Required traits missing in HTML:** None
*   **Required traits extra in HTML:** Fill, TemperatureControl, StartStop
*   **Recommended traits missing in HTML:** Fill, TemperatureControl, StartStop
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** None
*   **Traits recommended in docs but required in HTML:** Fill, TemperatureControl, StartStop

#### FAN
*   **Required traits missing in HTML:** FanSpeed
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** FanSpeed
*   **Traits recommended in docs but required in HTML:** None

#### GARAGE
*   **Required traits missing in HTML:** None
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** LockUnlock
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** None
*   **Traits recommended in docs but required in HTML:** None

#### SENSOR
*   **Required traits missing in HTML:** None
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** HumiditySetting, TemperatureControl, OpenClose, Brightness
*   **Traits required in docs but recommended in HTML:** None
*   **Traits recommended in docs but required in HTML:** None

#### SETTOP
*   **Required traits missing in HTML:** OnOff
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** OnOff
*   **Traits recommended in docs but required in HTML:** None

#### SHOWER
*   **Required traits missing in HTML:** None
*   **Required traits extra in HTML:** OpenClose
*   **Recommended traits missing in HTML:** StartStop, TemperatureControl
*   **Recommended traits extra in HTML:** Rotation
*   **Traits required in docs but recommended in HTML:** None
*   **Traits recommended in docs but required in HTML:** None

#### SOUNDBAR
*   **Required traits missing in HTML:** MediaState, OnOff, TransportControl
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** MediaState, OnOff, TransportControl
*   **Traits recommended in docs but required in HTML:** None

#### SPEAKER
*   **Required traits missing in HTML:** MediaState, OnOff, TransportControl
*   **Required traits extra in HTML:** Volume
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** MediaState, OnOff, TransportControl
*   **Traits recommended in docs but required in HTML:** None

#### STREAMING_BOX
*   **Required traits missing in HTML:** OnOff
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** Channel
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** OnOff
*   **Traits recommended in docs but required in HTML:** None

#### STREAMING_SOUNDBAR
*   **Required traits missing in HTML:** OnOff
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** OnOff
*   **Traits recommended in docs but required in HTML:** None

#### TV
*   **Required traits missing in HTML:** InputSelector
*   **Required traits extra in HTML:** None
*   **Recommended traits missing in HTML:** None
*   **Recommended traits extra in HTML:** None
*   **Traits required in docs but recommended in HTML:** InputSelector
*   **Traits recommended in docs but required in HTML:** None

## 2. Comparison with `devices/device.js`

### Device Types Mismatch

*   **Device types missing in `devices/device.js` (present in official docs):**
    *   BLANKET
    *   PUMP
*   **Device types present in `devices/device.js` (not in official docs):**
    *   None

### Trait Discrepancies by Device Type

#### AC_UNIT
*   **Required traits missing in JS:** FanSpeed, OnOff
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### AIRCOOLER
*   **Required traits missing in JS:** FanSpeed, HumiditySetting, OnOff
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### AIRFRESHENER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Modes, Toggles

#### AIRPURIFIER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** FanSpeed, SensorState

#### AUDIO_VIDEO_RECEIVER
*   **Required traits missing in JS:** MediaState, TransportControl
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** AppSelector

#### AWNING
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### BATHTUB
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** Fill, TemperatureControl, StartStop
*   **Recommended traits in docs (not in JS required):** Fill, TemperatureControl, StartStop

#### BED
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Scene

#### BLENDER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, StartStop, Timer

#### BLINDS
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Rotation

#### BOILER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** TemperatureControl

#### CAMERA
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### CARBON_MONOXIDE_DETECTOR
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### CHARGER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### CLOSET
*   **Required traits missing in JS:** OpenClose
*   **Required traits extra in JS:** Closet
*   **Recommended traits in docs (not in JS required):** None

#### COFFEE_MAKER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, TemperatureControl

#### COOKTOP
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, Timer

#### CURTAIN
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### DEHUMIDIFIER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** FanSpeed, HumiditySetting, StartStop

#### DEHYDRATOR
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, StartStop, Timer

#### DISHWASHER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** OnOff, RunCycle

#### DOOR
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** LockUnlock

#### DOORBELL
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** ObjectDetection, CameraStream

#### DRAWER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### DRYER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Modes, OnOff, RunCycle, Toggles

#### FAN
*   **Required traits missing in JS:** FanSpeed
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### FAUCET
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Dispense, StartStop, TemperatureControl

#### FIREPLACE
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Modes, Toggles, OnOff

#### FREEZER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### FRYER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, StartStop, Timer

#### GAME_CONSOLE
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** InputSelector, Volume

#### GARAGE
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** LockUnlock

#### GATE
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** LockUnlock

#### GRILL
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, OnOff, Timer

#### HEATER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** FanSpeed

#### HOOD
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Brightness, FanSpeed

#### HUMIDIFIER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** FanSpeed, HumiditySetting, StartStop

#### KETTLE
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** TemperatureControl

#### LIGHT
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** ColorSetting, Brightness

#### LOCK
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### MICROWAVE
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, Timer

#### MOP
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Dock, EnergyStorage, Locator, OnOff, RunCycle

#### MOWER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Dock, EnergyStorage, Locator, OnOff, RunCycle

#### MULTICOOKER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, StartStop, Timer

#### NETWORK
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Reboot, SoftwareUpdate

#### OUTLET
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### OVEN
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, TemperatureControl, Timer

#### PERGOLA
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Rotation

#### PETFEEDER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** OnOff, StartStop

#### PRESSURECOOKER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, Timer

#### RADIATOR
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Modes, Toggles

#### REFRIGERATOR
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### REMOTECONTROL
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** AppSelector, Channel

#### ROUTER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Reboot, SoftwareUpdate

#### SCENE
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### SECURITYSYSTEM
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** StatusReport

#### SENSOR
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** SensorState
*   **Recommended traits in docs (not in JS required):** SensorState, EnergyStorage

#### SETTOP
*   **Required traits missing in JS:** OnOff
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Volume

#### SHOWER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** OpenClose
*   **Recommended traits in docs (not in JS required):** StartStop, TemperatureControl

#### SHUTTER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Rotation

#### SMOKE_DETECTOR
*   **Required traits missing in JS:** SensorState
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### SOUNDBAR
*   **Required traits missing in JS:** MediaState, OnOff, TransportControl
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** AppSelector, InputSelector

#### SOUSVIDE
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, StartStop, Timer

#### SPEAKER
*   **Required traits missing in JS:** MediaState, OnOff, TransportControl
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** AppSelector, InputSelector

#### SPRINKLER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Timer

#### STANDMIXER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, StartStop

#### STREAMING_BOX
*   **Required traits missing in JS:** OnOff
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Channel, InputSelector

#### STREAMING_SOUNDBAR
*   **Required traits missing in JS:** OnOff
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** InputSelector

#### STREAMING_STICK
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** OnOff

#### SWITCH
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Brightness

#### THERMOSTAT
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### TV
*   **Required traits missing in JS:** InputSelector
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Channel

#### VACUUM
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Dock, EnergyStorage, Locator, OnOff, RunCycle

#### VALVE
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** None

#### WASHER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Modes, OnOff, RunCycle, Toggles

#### WATERHEATER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** TemperatureControl

#### WATERPURIFIER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** OnOff, SensorState

#### WATERSOFTENER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** OnOff, SensorState

#### WINDOW
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** LockUnlock

#### YOGURTMAKER
*   **Required traits missing in JS:** None
*   **Required traits extra in JS:** None
*   **Recommended traits in docs (not in JS required):** Cook, StartStop, Timer
