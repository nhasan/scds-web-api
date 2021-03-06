/*
 * FlightIntel
 *
 * Copyright 2022 Nadeem Hasan <nhasan@nadmm.com>
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

const config = require('config')
const { Pool } = require('pg')

const pool = new Pool({
    host: config.get("postgresdb.host"),
    user: config.get("postgresdb.user"),
    password: config.get("postgresdb.password"),
    database: config.get("postgresdb.database")
})

pool.on('error', (err, client) => {
    console.error("Pool error: "+err.message)
})

let getAtis = function (location, finish) {
    pool.query(
            "select * from datis where icaoLocation = $1",
    [location],
    (err, rows) => {
        if (err) {
            console.log(err.message)
            finish({ error: err.message });
        } else {
            finish(rows);
        }
    });
}

const express = require('express');
const router = express.Router();

router.get('/:location', function (req, res) {
    console.log("ATIS request for location="+req.params.location+" from "+req.headers['x-forwarded-for']);
    getAtis(req.params.location,
        function finish(result) {
            if (result.hasOwnProperty("error")) {
                res.status(500);
                res.type('json').send(JSON.stringify(result, null, 2));
            }
            else
            {
                res.type('json').send(JSON.stringify(result.rows, null, 2));
            }
        });
});

module.exports = router;
