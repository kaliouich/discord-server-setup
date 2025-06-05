const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField, 
  ChannelType, 
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require('discord.js');
const fs = require('fs');

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1380121567153094718';
const USER_ID = '769881004788940810';

const client = new Client({ 
  intents: Object.keys(GatewayIntentBits).map(intent => GatewayIntentBits[intent])
});

// Helper function to delete roles with special handling for bot role
async function deleteAllRoles(guild) {
  console.log('Deleting all existing roles...');
  const roles = guild.roles.cache.filter(role => 
      role.name !== '@everyone' && 
      !role.managed && // This prevents deleting bot roles
      role.position < guild.members.me.roles.highest.position
  );

  for (const [id, role] of roles) {
      try {
          await role.delete();
          console.log(`Deleted role: ${role.name}`);
          // Add a small delay between deletions
          await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
          if (error.code === 50013) {
              console.warn(`Cannot delete managed role ${role.name}`);
          } else {
              console.warn(`Could not delete role ${role.name}:`, error.message);
          }
      }
  }
}

// Helper function to determine channel type
function getChannelType(type) {
  switch (type) {
      case 0: return ChannelType.GuildText;
      case 2: return ChannelType.GuildVoice;
      case 4: return ChannelType.GuildCategory;
      default: return ChannelType.GuildText;
  }
}

// Function to create welcome message
async function createWelcomeMessage(channel) {
  const welcomeEmbed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('🚀 Welcome to Reckless Achievers!')
      .setDescription('*Where Ambitious Dreams Transform into Extraordinary Achievements*')
      .addFields(
          { 
              name: '🎯 Our Vision',
              value: 'We\'re a community of creators, innovators, and entrepreneurs united by our drive to achieve greatness. Here, we turn ambitions into reality through collaboration, knowledge sharing, and unwavering support.'
          },
          {
              name: '💫 Community Hubs',
              value: '🏆 **Community Zone**\n• Share in <#🗣️-general>\n• Set goals in <#🎯-goals>\n• Celebrate in <#💪-achievements>\n\n🎨 **Creative Zone**\n• Display work in <#🖼️-showcase>\n• Discuss design in <#🎨-design>\n\n💻 **Tech Hub**\n• Code in <#💻-programming>\n• Explore <#🤖-ai-ml>\n\n💰 **Business & Finance**\n• Share in <#💡-startups>\n• Discuss <#📈-investing>'
          },
          {
              name: '🌟 Get Started',
              value: '1️⃣ Visit <#✅-verify> to join the community\n2️⃣ Read our <#📜-rules>\n3️⃣ Introduce yourself in <#👋-introductions>\n4️⃣ Check <#🔗-useful-links> for resources\n5️⃣ Start networking!'
          },
          {
              name: '💪 Remember',
              value: '*"Your potential is limited only by your imagination and determination. Welcome to a community that believes in your success!"*'
          }
      )
      .setTimestamp()
      .setFooter({ text: '🌟 Your success journey begins now!' });

  await channel.send({ embeds: [welcomeEmbed] });
}

// Function to create verification message
async function setupVerification(channel) {
  const verifyEmbed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✨ Join Reckless Achievers')
      .setDescription('Welcome to our community of ambitious achievers! To gain access to all channels:')
      .addFields(
          {
              name: '🎯 Steps to Join',
              value: '1. Read our <#📜-rules>\n2. Click the verify button below'
          },
          {
              name: '💫 What You\'ll Get',
              value: '• Access to all community channels\n• Networking opportunities\n• Resource sharing\n• Collaboration possibilities\n• Growth-focused discussions'
          }
      )
      .setTimestamp();

  const verifyButton = new ButtonBuilder()
      .setCustomId('verify')
      .setLabel('I Agree & Verify')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅');

  const row = new ActionRowBuilder()
      .addComponents(verifyButton);

  await channel.send({
      embeds: [verifyEmbed],
      components: [row]
  });
}

// Function to create channel options with permissions
function createChannelOptions(ch, channelType, parentId, roles) {
  const options = {
      name: ch.name,
      type: channelType,
      parent: parentId,
      topic: ch.topic || undefined,
      permissionOverwrites: []
  };

  // Set base permissions
  const basePerms = [
      {
          id: parentId ? parentId.guild.roles.everyone.id : null,
          deny: [PermissionsBitField.Flags.ViewChannel]
      }
  ];

  // Special channel permissions
  switch (ch.name) {
      case '📢-announcements':
          options.permissionOverwrites = [
              {
                  id: parentId ? parentId.guild.roles.everyone.id : null,
                  deny: [PermissionsBitField.Flags.SendMessages],
                  allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory]
              },
              {
                  id: roles['🌟 Community Lead'].id,
                  allow: [
                      PermissionsBitField.Flags.SendMessages,
                      PermissionsBitField.Flags.ManageMessages,
                      PermissionsBitField.Flags.MentionEveryone
                  ]
              },
              {
                  id: roles['🛡️ Moderator'].id,
                  allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages]
              }
          ];
          break;

      case '📜-rules':
      case '👋-welcome':
          options.permissionOverwrites = [
              {
                  id: parentId ? parentId.guild.roles.everyone.id : null,
                  allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                  deny: [PermissionsBitField.Flags.SendMessages]
              },
              {
                  id: roles['🌟 Community Lead'].id,
                  allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages]
              }
          ];
          break;

      case '✅-verify':
          options.permissionOverwrites = [
              {
                  id: parentId ? parentId.guild.roles.everyone.id : null,
                  allow: [PermissionsBitField.Flags.ViewChannel],
                  deny: [PermissionsBitField.Flags.SendMessages]
              }
          ];
          break;

      default:
          if (channelType === ChannelType.GuildVoice) {
              options.bitrate = 64000;
              options.userLimit = 0;
              options.rtcRegion = null;
              options.permissionOverwrites = [
                  {
                      id: parentId ? parentId.guild.roles.everyone.id : null,
                      deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect]
                  },
                  {
                      id: roles['⭐ Achiever'].id,
                      allow: [
                          PermissionsBitField.Flags.ViewChannel,
                          PermissionsBitField.Flags.Connect,
                          PermissionsBitField.Flags.Speak
                      ]
                  }
              ];
          } else {
              options.permissionOverwrites = [
                  {
                      id: parentId ? parentId.guild.roles.everyone.id : null,
                      deny: [PermissionsBitField.Flags.ViewChannel]
                  },
                  {
                      id: roles['⭐ Achiever'].id,
                      allow: [
                          PermissionsBitField.Flags.ViewChannel,
                          PermissionsBitField.Flags.SendMessages,
                          PermissionsBitField.Flags.ReadMessageHistory,
                          PermissionsBitField.Flags.AddReactions,
                          PermissionsBitField.Flags.AttachFiles,
                          PermissionsBitField.Flags.EmbedLinks
                      ]
                  }
              ];
          }
  }

  return options;
}

// Verification button handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verify') {
      try {
          const guild = interaction.guild;
          const member = interaction.member;
          
          // Remove unverified role if exists
          const unverifiedRole = guild.roles.cache.find(r => r.name === '🆕 Unverified');
          if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
              await member.roles.remove(unverifiedRole);
          }
          
          // Add verified role
          const verifiedRole = guild.roles.cache.find(r => r.name === '⭐ Achiever');
          if (verifiedRole) {
              await member.roles.add(verifiedRole);
              await interaction.reply({
                  content: '✨ Welcome to Reckless Achievers! You now have full access to our community.\n\n🎯 Start by:\n1. Introducing yourself in <#👋-introductions>\n2. Setting your goals in <#🎯-goals>\n3. Exploring our various channels',
                  flags: [4096] // Using flags instead of ephemeral
              });
          } else {
              throw new Error('Verified role not found');
          }
      } catch (error) {
          console.error('Verification error:', error);
          await interaction.reply({
              content: '❌ Verification failed. Please contact a moderator.',
              flags: [4096]
          });
      }
  }
});

// Main setup logic
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
      const guild = await client.guilds.fetch(GUILD_ID);
      if (!guild) throw new Error('Could not find guild');
      
      // Check bot permissions
      const me = await guild.members.fetchMe();
      const requiredPermissions = [
          PermissionsBitField.Flags.Administrator
      ];
      
      const missingPermissions = requiredPermissions.filter(perm => !me.permissions.has(perm));
      if (missingPermissions.length > 0) {
          console.error('Bot is missing required permissions:', 
              missingPermissions.map(p => PermissionsBitField.Flags[p]).join(', '));
          await client.destroy();
          return;
      }

      console.log(`Connected to guild: ${guild.name}`);
      await deleteAllRoles(guild);

      // Create roles
      console.log('Creating roles...');
      const roles = {};
      const template = JSON.parse(fs.readFileSync('template.json', 'utf8'));

      for (const roleData of template.roles) {
          try {
              const role = await guild.roles.create({
                  name: roleData.name,
                  color: roleData.color,
                  hoist: roleData.hoist,
                  mentionable: roleData.mentionable,
                  permissions: BigInt(roleData.permissions)
              });
              roles[roleData.name] = role;
              console.log(`Created role: ${role.name}`);
              await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
              console.error(`Error creating role ${roleData.name}:`, error);
          }
      }

      // Delete existing channels
      console.log('Deleting existing channels...');
      for (const channel of guild.channels.cache.values()) {
          try {
              if (channel.deletable) {
                  await channel.delete();
                  console.log(`Deleted channel: ${channel.name}`);
                  await new Promise(resolve => setTimeout(resolve, 500));
              }
          } catch (error) {
              console.warn(`Could not delete channel ${channel.name}:`, error.message);
          }
      }

      // Create categories
      console.log('Creating categories...');
      const categories = {};
      for (const ch of template.channels.filter(c => c.type === 4)) {
          try {
              const category = await guild.channels.create({
                  name: ch.name,
                  type: ChannelType.GuildCategory
              });
              categories[ch.name] = category;
              console.log(`Created category: ${ch.name}`);
              await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
              console.error(`Error creating category ${ch.name}:`, error);
          }
      }

      // Create channels
      console.log('Creating channels...');
      for (const ch of template.channels.filter(c => c.type !== 4)) {
          try {
              const channelType = getChannelType(ch.type);
              const parent = ch.parent_id ? categories[ch.parent_id] : null;
              const channel = await guild.channels.create(
                  createChannelOptions(ch, channelType, parent, roles)
              );

              if (ch.name === '👋-welcome') {
                  await guild.setSystemChannel(channel);
                  await createWelcomeMessage(channel);
              } else if (ch.name === '✅-verify') {
                  await setupVerification(channel);
              }

              console.log(`Created channel: ${ch.name}`);
              await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
              console.error(`Error creating channel ${ch.name}:`, error);
          }
      }

      // Assign admin role to bot owner
      try {
          const member = await guild.members.fetch(USER_ID);
          const adminRole = roles['🌟 Community Lead'];
          if (member && adminRole) {
              await member.roles.add(adminRole);
              console.log(`Assigned admin role to ${member.user.tag}`);
          }
      } catch (error) {
          console.error('Error assigning admin role:', error);
      }

      console.log('Server setup complete! Bot is now listening for verification interactions...');
  } catch (err) {
      console.error('Error during setup:', err);
  }
});

client.login(TOKEN);