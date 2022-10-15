/**
 * NodeRED Google SmartHome
 * Copyright (C) 2022 Andreas Schuster.
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

"use strict";

const Base = require('./base.js');

/**
 * ArmDisarm trait
 *
 * @see https://developers.google.com/assistant/smarthome/traits/armdisarm
 */
class ArmDisarm extends Base {
    /**
     * Returns the name of the trait as given by Google.
     *
     * @return {string}
     */
    getGoogleTraitName() {
        return 'action.devices.traits.ArmDisarm'
    }
}

module.exports = ArmDisarm;
