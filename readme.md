# Discord Server Setup Bot Documentation

## Overview
This bot automates the setup of a Discord server for a community focused on achievements, personal growth, and professional development. It creates a structured environment with pre-configured roles, channels, and permissions.

## Features
- 🎯 Complete server structure setup
- 👥 Role hierarchy management
- 📚 Category-based channel organization
- 🔒 Automated verification system
- 🛡️ Permission management
- 💫 Welcome message system

## Prerequisites
- Node.js v16.9.0 or higher
- Discord.js v14
- A Discord Bot Token
- Administrator permissions in the target server

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kaliouich/discord-server-setup.git
cd discord-server-setup
```

2. Install dependencies:
```bash
npm install discord.js
```

3. Set up environment variables:
```bash
export DISCORD_BOT_TOKEN='your-bot-token-here'
```

## Server Structure

### Roles Hierarchy
1. 🌟 Community Lead (Admin)
2. 🛡️ Moderator
3. 💎 Elite Achiever
4. ⭐ Achiever
5. 🆕 Unverified

### Channel Categories
1. **🎯 WELCOME**
   - Welcome message
   - Announcements
   - Rules
   - Verification

2. **🏆 COMMUNITY**
   - General chat
   - Goals tracking
   - Achievements

3. **🎨 CREATIVE ZONE**
   - Showcase
   - Design
   - Music
   - Content

4. **💻 TECH HUB**
   - Programming
   - AI/ML
   - Web Development
   - Mobile Development

5. **💰 BUSINESS & FINANCE**
   - Investing
   - Startups
   - Side Hustles
   - Crypto

6. **🎙️ VOICE LOUNGES**
   - Strategy Room
   - Brainstorming
   - Chill Zone

7. **🎯 RESOURCES**
   - Learning
   - Useful Links
   - Tools

8. **🤝 NETWORKING**
   - Job Board
   - Collaborations
   - Self Promotion

## Usage

### Starting the Bot
```bash
node bot.js
```

### Configuration
Edit template.json to customize:
- Server name and settings
- Role permissions and colors
- Channel structure and topics

### Bot Commands
The bot automatically handles:
- Server setup on first run
- Member verification through button interaction
- Welcome message distribution
- Permission management

## Verification System
New members must:
1. Read the rules
2. Click the verify button
3. Receive the ⭐ Achiever role
4. Gain access to community channels

## Maintenance

### Updating Server Structure
1. Modify template.json
2. Restart the bot
3. The bot will update the server configuration

### Troubleshooting
- Ensure bot has Administrator permissions
- Check console for error messages
- Verify role hierarchy is correct
- Ensure bot role is not deleted

## Security Notes
- Keep your bot token secure
- Regular backup of template.json
- Monitor bot permissions
- Review role permissions regularly

## Support
For issues or questions:
1. Check console logs
2. Verify permissions
3. Review Discord API limits
4. Contact support team

## Best Practices
- Test changes in a development server first
- Back up server settings before major changes
- Monitor bot performance
- Keep Discord.js updated

This bot streamlines community management and ensures consistent server structure. For detailed code explanations, refer to the inline comments in `bot.js`.