# 🚀 Sample Slack Bot Server Setup

This guide will help you run a local server for your Slack bot and configure everything needed for it to communicate with Slack's API.

---

## 🔧 Environment Setup

Create a `.env` file in the root directory and add your credentials:

```
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=your_bot_user_oauth_token
PORT=3000  # or any port of your choice
```

## ▶️ Run the Server
```
npm install
node index.js
```
(Or use npm start if defined in your package.json)

## 🌐 Set Up ngrok
```
ngrok http 3978
```
Copy the https://xxxxx.ngrok-free.app address shown — you'll need it for Slack setup.

## ⚙️ Slack App Configuration
Go to your app’s settings at api.slack.com/apps.
### 1. Event Subscriptions
- Enable Event Subscriptions
- In the Request URL field, paste your ngrok address followed by /slack/events, e.g.:
```
https://xxxxx.ngrok-free.app/slack/events
```
- Scroll down to Subscribe to Bot Events and add the following (or any that your bot needs):
  - app_mention
  - message.channels
  - message.groups
  - message.im

### 2. App Home
- Go to the App Home section
- Under Show Tabs, enable:
  - ✅ Message Tab
- Check:
  - ✅ Allow users to send Slash commands

### 3. OAuth & Permissions
Bot Token Scopes
Add the following scopes (or others as required):
- app_mention:read
- channels:history
- chat:write
- groups:history
- im:history

User Token Scopes
- admin (for extended capabilities)

## ✅ Done!
Your Slack bot should now be live and ready to respond to events. Test by mentioning the bot in a channel it’s in!

## 🛠 Troubleshooting
- Bot not responding? Check if the server is running and ngrok URL is correctly set in Slack.
- 403 errors from Slack? Ensure your bot token and signing secret are correctly set in .env.
- Events not reaching server? Double-check the port and ngrok setup.

## Happy building! 💬🤖