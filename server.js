import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());

async function getOfferFromPaybis(amount) {
    try {
        const res = await axios.post('https://api.paybis.com/public/processing/v2/quote/buy-crypto', {
            "currencyCodeFrom": "USD",
            "currencyCodeTo": "BTC",
            "requestedAmount": { "amount": amount.toString(), "currencyCode": "USD" },
            "requestedAmountType": "from",
            "promoCode": null,
            "paymentMethod": "credit-card"
        }, { timeout: 2000 });
        return res.data?.paymentMethods?.[0]?.amountTo?.amount.toString();
    } catch (e) {
        console.error('Paybis error:', e.message);
        return;
    }
}

async function getOfferFromGuardarian(amount) {
    try {
        const res = await axios.get(
            `https://api-payments.guardarian.com/v1/estimate?to_currency=BTC&from_amount=${amount}&from_currency=USD&from_network=USD&to_network=BTC`,
            {
                headers: {
                    'X-Api-Key': 'c14d927f-cb01-4561-9520-28ec22c92710',
                },
                timeout: 2000
            }
        );
        return res?.data?.value?.toString();
    } catch (e) {
        console.error('Guardarian error:', e.message);
        return;
    }
}

async function getOfferFromMoonpay(amount) {
    try {
        const res = await axios.get(`https://api.moonpay.com/v3/currencies/btc/buy_quote?apiKey=pk_live_R5Lf25uBfNZyKwccAZpzcxuL3ZdJ3Hc&baseCurrencyAmount=${amount}&baseCurrencyCode=usd&fixed=true&areFeesIncluded=true&regionalPricing=true&quoteType=principal`, { timeout: 2000 });
        return res?.data?.quoteCurrencyAmount?.toString();
    } catch (e) {
        console.error('Moonpay error:', e.message);
        return;
    }
}

async function getOfferFromTransak(amount) {
    try {
        const res = await axios.get(`https://api.transak.com/api/v1/pricing/public/quotes?fiatCurrency=USD&cryptoCurrency=BTC&paymentMethod=credit_debit_card&isBuyOrSell=BUY&fiatAmount=${amount}&partnerApiKey=02624956-010b-4775-8e31-7b9c8b82df76&network=mainnet`, { timeout: 2000 });
        return res?.data?.response?.cryptoAmount?.toString();
    } catch (e) {
        console.error('Transak error:', e.message);
        return;
    }
}

async function getAllOffers(amount) {
    const [paybis, guardarian, moonpay, transak] = await Promise.all([
        getOfferFromPaybis(amount),
        getOfferFromGuardarian(amount),
        getOfferFromMoonpay(amount),
        getOfferFromTransak(amount),
    ]);
    const results = {};
    if (paybis) results.paybis = paybis;
    if (guardarian) results.guardarian = guardarian;
    if (moonpay) results.moonpay = moonpay;
    if (transak) results.transak = transak;
    return results;
}

// In-memory cache for default values
// AirCode used to return objects with {provider, btc} property
let cachedResults = [
    { provider: 'paybis', btc: '0.00140' },
    { provider: 'guardarian', btc: '0.00142' },
    { provider: 'moonpay', btc: '0.00141' },
    { provider: 'transak', btc: '0.00139' },
];

app.get('/cachedValues', async (req, res) => {
    // Let's actually fetch the latest 100 USD values and cache them on start
    try {
        const results = await getAllOffers(100);
        if (Object.keys(results).length > 0) {
            Object.entries(results).forEach(([provider, btc]) => {
                let existing = cachedResults.find(e => e.provider === provider);
                if (existing) existing.btc = btc;
                else cachedResults.push({ provider, btc });
            });
        }
    } catch (e) {
        console.error("Error updating cache", e);
    }
    res.json(cachedResults);
});

app.get('/offers', async (req, res) => {
    const amount = Number(req.query.amount || 100);
    const data = await getAllOffers(amount);

    // optionally update cache if amount is 100
    if (amount === 100 && Object.keys(data).length > 0) {
        Object.entries(data).forEach(([provider, btc]) => {
            let existing = cachedResults.find(e => e.provider === provider);
            if (existing) existing.btc = btc;
            else cachedResults.push({ provider, btc });
        });
    }

    // If data is missing for some providers, fallback to scaling the cache
    // This is a naive workaround since the APIs are erroring out often on the node backend.
    cachedResults.forEach(e => {
        if (!data[e.provider]) {
            // rough estimation relative to default 100 USD cache
            data[e.provider] = (parseFloat(e.btc) * (amount / 100)).toFixed(7);
        }
    });

    res.json(data);
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
