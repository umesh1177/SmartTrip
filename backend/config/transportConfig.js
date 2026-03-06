const Amadeus = require('amadeus');

let amadeus = null;

if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
    try {
        amadeus = new Amadeus({
            clientId: process.env.AMADEUS_CLIENT_ID,
            clientSecret: process.env.AMADEUS_CLIENT_SECRET
        });
        console.log('Amadeus flight API connected');
    } catch (err) {
        console.warn('Amadeus initialization failed:', err.message);
    }
} else {
    console.warn('Amadeus API keys not set in .env - flight search disabled');
}

module.exports = { amadeus };
