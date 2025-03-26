require('dotenv').config();

const express = require('express');
const { createEventAdapter } = require('@slack/events-api');
const axios = require('axios');
const port = process.env.PORT || 3000;

// Initialize express app and Slack event adapter
const app = express();
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);
const IGNORE_TYPES = ['bot_message', 'slackbot_response']
const CHANNEL_TYPES = ['group', 'channel']

let botUserId;

// Use express.raw() to preserve the raw request body for Slack signature verification
app.use('/slack/events', express.raw({ type: 'application/json' }));

// Handle Slack events and URL verification
app.post('/slack/events', (req, res) => {
    if (req.body.type === 'url_verification') {
        return res.status(200).json({ challenge: req.body.challenge });
    }
});

// Handle incoming Slack messages
slackEvents.on('message', async (event) => {
    // Ignore messages from bots (including this bot)
    if (IGNORE_TYPES.includes(event.subtype) || event.bot_id || !event.text) {
        return;
    }

    if (event.channel_type === 'im' || (CHANNEL_TYPES.includes(event.channel_type) && event.text.includes(`<@${botUserId}>`))) {
        let text = event.text
        if (text.includes(`<@${botUserId}>`)) {
            text = text.replace(new RegExp(`<@${botUserId}>`, 'g'), '')
        }
        const reply = await prepareResponse(text)

        // Respond back to the message (e.g., echo the user's message)
        if (reply) {
            try {
                await sendMessageToSlack(event.channel, reply);
            } catch (err) {
                console.error('Error responding to message:', err);
            }
        }
    }
});

// Function to send a message back to Slack
async function sendMessageToSlack(channel, text) {
    const axios = require('axios');

    await axios.post('https://slack.com/api/chat.postMessage', {
        channel: channel,
        text: text,
        type: 'mrkdwn'
    }, {
        headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
    });
}

// Function to prepare response
async function prepareResponse(text) {
    let reply = 'You said: ' + text // OR default response
    if (text) {
        try {
            /*
            * Do your stuff to prepare response
            * */
            reply = messageMarkdown(reply)
        } catch (error) {
            console.error(error);
            reply = 'Error...'
        }
    }
    return reply
}

// Optional: Format the message in Markdown
function messageMarkdown(text) {
    // Remove all <highlight> tags and their content
    text = text.replace(/<highlight>.*?<\/highlight>/g, '')
    // Replace ** with *
    text = text.replace(/\*\*/g, '＊')
    return text
}

(async () => {
    const server = await slackEvents.start(port);
    console.log(`Listening for events on ${server.address().port}`);
})();

(async () => {
    const response = await axios.get('https://slack.com/api/auth.test', {
        headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
    });
    botUserId = response.data.user_id;
    console.log(`Bot user ID: ${botUserId}`);
})();
