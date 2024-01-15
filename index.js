const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || message.channel.id !== '1193619155061059614') return;
    
    const teamNamePattern = /チーム名:\s*(.+)/;
    const match = message.content.match(teamNamePattern);
    if (!match) return;
    const teamName = match[1].trim();
    const mentionsCount = message.mentions.users.size;

    if (mentionsCount < 3 || mentionsCount > 9) return message.reply('出場メンバーは3人以上、最大9人までです');

    const requiredRoleId = '1170966068899098714';
    const isRoleMissing = message.mentions.users.some(user => 
        !message.guild.members.cache.get(user.id).roles.cache.has(requiredRoleId)
    );

    if (isRoleMissing) return message.reply('メンバー全員がYunite認証を行ってください');

    try {
        const role = await message.guild.roles.create({
            name: teamName,
            color: 'ORANGE',
            reason: 'チーム名のロールを作成'
        });

        message.mentions.users.forEach(user => {
            message.guild.members.cache.get(user.id).roles.add(role);
        });

        const category = await message.guild.channels.create(teamName, {
            type: 'GUILD_CATEGORY',
            permissionOverwrites: [{
                id: role.id,
                allow: ['VIEW_CHANNEL']
            }, {
                id: message.guild.id,
                deny: ['VIEW_CHANNEL']
            }]
        });

        const textChannelPromise = message.guild.channels.create(`${teamName}-順位報告`, {
            type: 'GUILD_TEXT',
            parent: category
        })
        .then(channel => channel.send(`<@&${role.id}> 順位報告チャンネルです。\n順位報告はこちらでお願いします。`));

        const vcNames = [`${teamName}-雑談用`, `${teamName}-1`, `${teamName}-2`, `${teamName}-3`];
        const userLimits = [9, 1, 1, 1];
        const vcPromises = vcNames.map((name, i) => 
            message.guild.channels.create(name, {
                type: 'GUILD_VOICE',
                parent: category,
                userLimit: userLimits[i]
            })
        );

        await Promise.all([textChannelPromise, ...vcPromises]);
        message.reply(`エントリー完了しました！\n${teamName}のロールを付与し、当日使用するVCやテキストチャンネルを作成しました。`);
    }
    catch (error) {
        console.error(error);
        message.reply('エラーが発生しました。');
    }
});

client.login('MTE5Mzk0Nzg4NjM0NjU2Nzc3Mg.G-QYIJ.XwgrmLwYkOFjgrDLLFKopA12HcM22Qoqr5GK3s');
// トークン変えてます
// トークンちょくがきほんとはだめよ