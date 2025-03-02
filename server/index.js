require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const msal = require('@azure/msal-node');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MSAL Configuration
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
        clientSecret: process.env.CLIENT_SECRET,
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

// Fetch Microsoft Graph API Access Token
const getAccessToken = async () => {
    const tokenRequest = {
        scopes: ["https://graph.microsoft.com/.default"]
    };
    const response = await cca.acquireTokenByClientCredential(tokenRequest);
    return response.accessToken;
};

// Fetch Conditional Access Policies
app.get('/api/policies', async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/policies/conditionalAccessPolicies', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        res.json(graphResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
