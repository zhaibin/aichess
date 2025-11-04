// 法律文档页面模板

import { Language } from '../types';

/**
 * 隐私政策
 */
export function getPrivacyPolicy(lang: Language = 'en'): string {
  const content = {
    'zh-CN': {
      title: 'AIChess 隐私政策',
      updated: '最后更新：2024年11月',
      sections: [
        {
          title: '1. 信息收集',
          content: `我们重视您的隐私。AIChess.win（以下简称"我们"或"本网站"）承诺保护您的个人信息。

**我们收集的信息：**
- 游戏数据：对局记录、移动历史、时间控制设置
- 技术信息：IP地址、浏览器类型、访问时间（仅用于统计和安全）
- Cookies：用于保存语言偏好和游戏状态

**我们不收集：**
- 姓名、电子邮件或其他个人身份信息
- 支付信息（本网站完全免费）
- 社交媒体账号`
        },
        {
          title: '2. 信息使用',
          content: `我们使用收集的信息用于：

- 提供国际象棋游戏服务
- 改进AI算法和用户体验
- 生成匿名统计数据
- 防止滥用和确保安全

**我们不会：**
- 出售或共享您的个人信息
- 用于营销或广告目的
- 与第三方分享（除非法律要求）`
        },
        {
          title: '3. 数据存储',
          content: `- **游戏数据**：存储在Cloudflare Durable Objects中，游戏结束后保留24小时
- **统计数据**：匿名化处理，用于改进服务
- **Cookies**：存储在您的浏览器中，可随时清除

**数据安全：**
我们使用Cloudflare的企业级安全基础设施保护您的数据，包括：
- HTTPS加密传输
- 安全的数据存储
- 定期安全审计
- DDoS防护`
        },
        {
          title: '4. 第三方服务',
          content: `本网站使用以下第三方服务：

- **Cloudflare Workers**：托管和内容分发
- **Cloudflare AI**：AI棋手功能
- **Cloudflare Analytics**：匿名访问统计

这些服务有各自的隐私政策，我们建议您查阅：
- Cloudflare隐私政策：https://www.cloudflare.com/privacypolicy/`
        },
        {
          title: '5. 用户权利',
          content: `您有权：

- 随时清除浏览器Cookies
- 要求删除您的游戏数据
- 了解我们如何使用您的信息
- 选择退出统计数据收集

如需行使这些权利，请联系我们：contact@aichess.win`
        },
        {
          title: '6. 儿童隐私',
          content: `本网站适合所有年龄段用户。我们不会故意收集13岁以下儿童的个人信息。如果您是家长并发现您的孩子提供了个人信息，请联系我们删除。`
        },
        {
          title: '7. 政策更新',
          content: `我们可能会不定期更新本隐私政策。重大变更将在网站上公告。继续使用本网站即表示您接受更新后的政策。`
        },
        {
          title: '8. 联系我们',
          content: `如对本隐私政策有任何疑问，请联系：

- 电子邮件：contact@aichess.win
- 网站：https://aichess.win`
        }
      ]
    },
    'en': {
      title: 'AIChess Privacy Policy',
      updated: 'Last Updated: November 2024',
      sections: [
        {
          title: '1. Information Collection',
          content: `We value your privacy. AIChess.win ("we", "us", or "this website") is committed to protecting your personal information.

**Information We Collect:**
- Game Data: Match records, move history, time control settings
- Technical Information: IP address, browser type, access time (for statistics and security only)
- Cookies: For saving language preferences and game state

**Information We DON'T Collect:**
- Names, emails, or other personally identifiable information
- Payment information (this website is completely free)
- Social media accounts`
        },
        {
          title: '2. Information Use',
          content: `We use collected information to:

- Provide chess game services
- Improve AI algorithms and user experience
- Generate anonymous statistics
- Prevent abuse and ensure security

**We Will NOT:**
- Sell or share your personal information
- Use for marketing or advertising purposes
- Share with third parties (unless legally required)`
        },
        {
          title: '3. Data Storage',
          content: `- **Game Data**: Stored in Cloudflare Durable Objects, retained for 24 hours after game ends
- **Statistics**: Anonymized for service improvement
- **Cookies**: Stored in your browser, can be cleared anytime

**Data Security:**
We protect your data using Cloudflare's enterprise-grade security infrastructure:
- HTTPS encrypted transmission
- Secure data storage
- Regular security audits
- DDoS protection`
        },
        {
          title: '4. Third-Party Services',
          content: `This website uses the following third-party services:

- **Cloudflare Workers**: Hosting and content delivery
- **Cloudflare AI**: AI chess player functionality
- **Cloudflare Analytics**: Anonymous visit statistics

These services have their own privacy policies. We recommend reviewing:
- Cloudflare Privacy Policy: https://www.cloudflare.com/privacypolicy/`
        },
        {
          title: '5. Your Rights',
          content: `You have the right to:

- Clear browser cookies at any time
- Request deletion of your game data
- Understand how we use your information
- Opt out of statistical data collection

To exercise these rights, contact us: contact@aichess.win`
        },
        {
          title: '6. Children\'s Privacy',
          content: `This website is suitable for all ages. We do not knowingly collect personal information from children under 13. If you are a parent and discover your child has provided personal information, please contact us for deletion.`
        },
        {
          title: '7. Policy Updates',
          content: `We may update this privacy policy periodically. Significant changes will be announced on the website. Continued use of this website indicates acceptance of the updated policy.`
        },
        {
          title: '8. Contact Us',
          content: `For questions about this privacy policy, please contact:

- Email: contact@aichess.win
- Website: https://aichess.win`
        }
      ]
    }
  };
  
  const data = content[lang] || content['en'];
  
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - AIChess.win</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.8;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 15px;
      margin-bottom: 10px;
    }
    .updated {
      color: #7f8c8d;
      font-size: 0.9em;
      margin-bottom: 30px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    p {
      margin-bottom: 15px;
      text-align: justify;
    }
    strong {
      color: #2980b9;
    }
    .back-link {
      display: inline-block;
      margin-top: 30px;
      padding: 12px 24px;
      background: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.3s;
    }
    .back-link:hover {
      background: #2980b9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${data.title}</h1>
    <p class="updated">${data.updated}</p>
    
    ${data.sections.map(section => `
      <h2>${section.title}</h2>
      <p>${section.content.replace(/\n/g, '<br>')}</p>
    `).join('')}
    
    <a href="/?lang=${lang}" class="back-link">← ${lang === 'zh-CN' || lang === 'zh-TW' ? '返回游戏' : 'Back to Game'}</a>
  </div>
</body>
</html>
  `;
}

/**
 * 服务条款
 */
export function getTermsOfService(lang: Language = 'en'): string {
  const content = {
    'zh-CN': {
      title: 'AIChess 服务条款',
      updated: '最后更新：2024年11月',
      sections: [
        {
          title: '1. 服务说明',
          content: `AIChess.win（以下简称"本网站"）提供免费的在线国际象棋游戏服务，包括：

- 人与人对战
- 人与AI对战
- AI与AI观战
- 5个不同难度的AI棋手
- 多语言界面（11种语言）
- 完全免费，无广告，无需注册`
        },
        {
          title: '2. 使用许可',
          content: `通过访问本网站，您同意：

**允许的使用：**
- 个人娱乐和学习
- 练习国际象棋技能
- 观看AI对战
- 分享网站链接

**禁止的使用：**
- 商业用途（未经授权）
- 滥用或攻击网站服务
- 使用机器人或自动化工具作弊
- 反向工程或复制代码（除非遵守MIT许可）
- 上传恶意内容或病毒`
        },
        {
          title: '3. 知识产权',
          content: `**本网站内容：**
- AI Chess引擎：开源（MIT License）
- UI设计和代码：版权所有 © 2024 AIChess.win
- AI模型：由Cloudflare Workers AI提供

**开源许可：**
本项目在MIT许可下开源。您可以：
- 查看源代码
- 使用代码用于学习
- Fork和修改（需保留版权声明）

GitHub: https://github.com/aichess/aichess`
        },
        {
          title: '4. 免责声明',
          content: `本网站"按原样"提供，不提供任何明示或暗示的保证：

- 不保证服务不中断或无错误
- AI棋手水平可能有波动
- 不对游戏结果负责
- 不保证特定功能的可用性

**使用风险：**
您自行承担使用本网站的风险。我们不对以下情况负责：
- 数据丢失或游戏中断
- AI决策的准确性
- 因使用本网站导致的任何损失`
        },
        {
          title: '5. 用户行为',
          content: `使用本网站时，您同意：

- 遵守国际象棋规则和体育精神
- 不使用作弊工具
- 不滥用服务资源
- 尊重其他用户（未来功能）
- 不进行非法活动

违反这些条款可能导致访问限制。`
        },
        {
          title: '6. 第三方链接',
          content: `本网站可能包含指向第三方网站的链接。我们不对这些网站的内容、隐私政策或做法负责。访问第三方网站的风险由您自行承担。`
        },
        {
          title: '7. 服务变更',
          content: `我们保留随时修改、暂停或终止服务的权利，恕不另行通知。我们将尽力提前通知重大变更。`
        },
        {
          title: '8. 争议解决',
          content: `因使用本网站产生的任何争议应友好协商解决。如协商不成，应提交至网站运营地有管辖权的法院。`
        },
        {
          title: '9. 联系方式',
          content: `如对本服务条款有任何疑问，请联系：

- 电子邮件：contact@aichess.win  
- 网站：https://aichess.win`
        }
      ]
    },
    'en': {
      title: 'AIChess Terms of Service',
      updated: 'Last Updated: November 2024',
      sections: [
        {
          title: '1. Service Description',
          content: `AIChess.win ("this website") provides free online chess gaming services, including:

- Human vs Human matches
- Human vs AI matches
- AI vs AI spectating
- 5 different difficulty AI players
- Multi-language interface (11 languages)
- Completely free, no ads, no registration required`
        },
        {
          title: '2. License to Use',
          content: `By accessing this website, you agree to:

**Permitted Uses:**
- Personal entertainment and learning
- Practice chess skills
- Watch AI matches
- Share website links

**Prohibited Uses:**
- Commercial use (without authorization)
- Abusing or attacking website services
- Using bots or automation tools to cheat
- Reverse engineering or copying code (unless complying with MIT License)
- Uploading malicious content or viruses`
        },
        {
          title: '3. Intellectual Property',
          content: `**Website Content:**
- AI Chess Engine: Open Source (MIT License)
- UI Design and Code: Copyright © 2024 AIChess.win
- AI Models: Provided by Cloudflare Workers AI

**Open Source License:**
This project is open source under MIT License. You may:
- View source code
- Use code for learning
- Fork and modify (must retain copyright notice)

GitHub: https://github.com/aichess/aichess`
        },
        {
          title: '4. Disclaimer',
          content: `This website is provided "as is" without any warranties:

- No guarantee of uninterrupted or error-free service
- AI player skill levels may vary
- No responsibility for game outcomes
- No guarantee of specific feature availability

**Use at Your Own Risk:**
You assume all risks of using this website. We are not liable for:
- Data loss or game interruptions
- AI decision accuracy
- Any losses resulting from website use`
        },
        {
          title: '5. User Conduct',
          content: `When using this website, you agree to:

- Follow chess rules and sportsmanship
- Not use cheating tools
- Not abuse service resources
- Respect other users (future feature)
- Not engage in illegal activities

Violations may result in access restrictions.`
        },
        {
          title: '6. Third-Party Links',
          content: `This website may contain links to third-party websites. We are not responsible for their content, privacy policies, or practices. You visit third-party websites at your own risk.`
        },
        {
          title: '7. Service Changes',
          content: `We reserve the right to modify, suspend, or terminate services at any time without notice. We will strive to notify users of major changes in advance.`
        },
        {
          title: '8. Dispute Resolution',
          content: `Any disputes arising from use of this website should be resolved through friendly negotiation. If negotiation fails, disputes shall be submitted to courts with jurisdiction in the website's operating location.`
        },
        {
          title: '9. Contact',
          content: `For questions about these Terms of Service, please contact:

- Email: contact@aichess.win
- Website: https://aichess.win`
        }
      ]
    }
  };
  
  const data = content[lang as keyof typeof content] || content['en'];
  
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - AIChess.win</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.8;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 15px;
      margin-bottom: 10px;
    }
    .updated {
      color: #7f8c8d;
      font-size: 0.9em;
      margin-bottom: 30px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    p {
      margin-bottom: 15px;
      text-align: justify;
    }
    strong {
      color: #2980b9;
    }
    .back-link {
      display: inline-block;
      margin-top: 30px;
      padding: 12px 24px;
      background: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.3s;
    }
    .back-link:hover {
      background: #2980b9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${data.title}</h1>
    <p class="updated">${data.updated}</p>
    
    ${data.sections.map(section => `
      <h2>${section.title}</h2>
      <p>${section.content.replace(/\n/g, '<br>')}</p>
    `).join('')}
    
    <a href="/?lang=${lang}" class="back-link">← ${lang.startsWith('zh') ? '返回游戏' : 'Back to Game'}</a>
  </div>
</body>
</html>
  `;
}

/**
 * 关于我们
 */
export function getAboutUs(lang: Language = 'en'): string {
  const content = {
    'zh-CN': {
      title: '关于 AIChess',
      sections: [
        {
          title: '🎯 项目愿景',
          content: `AIChess.win 致力于打造全球最智能、最易用的在线国际象棋平台。

我们相信：
- 国际象棋是锻炼思维的最佳运动
- AI可以成为出色的陪练和对手
- 优质的棋类服务应该完全免费
- 技术应该让象棋更有趣`
        },
        {
          title: '🤖 AI技术',
          content: `我们使用最先进的AI技术：

**5个AI棋手：**
1. **Meta Llama 4 Scout** (Magnus Carlsen) - 均衡型，适合通用对局
2. **Google Gemma 3** (Garry Kasparov) - 创造型，80K上下文
3. **Qwen QwQ 32B** (Bobby Fischer) - 推理型，深度计算
4. **Deepseek R1** (Mikhail Tal) - 推理型，超越GPT-4级别

**技术栈：**
- Cloudflare Workers：全球边缘计算
- Cloudflare AI：最新LLM模型
- Durable Objects：游戏状态管理
- 自研Chess Engine：完全自主可控`
        },
        {
          title: '🌍 全球服务',
          content: `**11种语言支持：**
中文（简体/繁体）、英语、西班牙语、法语、德语、日语、韩语、俄语、阿拉伯语、葡萄牙语、意大利语

**全球CDN：**
- 300+ 边缘节点
- < 50ms 响应时间
- 99.99% 可用性
- 免费无限制使用`
        },
        {
          title: '💯 为什么免费',
          content: `**我们的承诺：**
- ✅ 永久免费
- ✅ 无广告
- ✅ 无需注册
- ✅ 无隐藏费用
- ✅ 开源透明

**可持续性：**
- 托管成本低（Cloudflare Workers免费额度）
- 开源社区贡献
- 纯粹的技术热情驱动`
        },
        {
          title: '🚀 功能特点',
          content: `**游戏模式：**
- 练习模式：自由探索
- 人人对战：本地双人
- 人机对战：挑战AI
- AI对战：观战学习

**核心功能：**
- 完整国际象棋规则（王车易位、吃过路兵、兵升变）
- 实时倒计时
- PGN标准记谱
- 将军/将死/和棋判定
- 胜利庆祝动画
- AI思考过程展示`
        },
        {
          title: '👨‍💻 开源项目',
          content: `AIChess是一个开源项目（MIT License）：

**GitHub:** https://github.com/aichess/aichess

**贡献：**
欢迎提交Issue和Pull Request！

**技术栈：**
- TypeScript
- Cloudflare Workers
- Cloudflare AI
- 自研Chess引擎`
        },
        {
          title: '📧 联系我们',
          content: `**反馈和建议：**
- 电子邮件：contact@aichess.win
- GitHub Issues：提交bug或功能请求
- 网站：https://aichess.win

**商务合作：**
contact@aichess.win

我们期待您的反馈！`
        },
        {
          title: '🎉 致谢',
          content: `特别感谢：

- **Cloudflare**：提供强大的Workers平台和AI模型
- **开源社区**：TypeScript、Chess.js等工具
- **国际象棋社区**：规则和理论支持
- **所有用户**：您的支持是我们前进的动力

让我们一起让国际象棋变得更智能、更有趣！ ♟️`
        }
      ]
    },
    'en': {
      title: 'About AIChess',
      sections: [
        {
          title: '🎯 Our Vision',
          content: `AIChess.win is dedicated to building the world's smartest and most accessible online chess platform.

We believe:
- Chess is the best mental exercise
- AI can be an excellent sparring partner
- Quality chess services should be completely free
- Technology should make chess more enjoyable`
        },
        {
          title: '🤖 AI Technology',
          content: `We use cutting-edge AI technology:

**5 AI Players:**
1. **Meta Llama 4 Scout** (Magnus Carlsen) - Balanced, general play
2. **Google Gemma 3** (Garry Kasparov) - Creative, 80K context
3. **Qwen QwQ 32B** (Bobby Fischer) - Reasoning, deep calculation
4. **Deepseek R1** (Mikhail Tal) - Reasoning, exceeds GPT-4 level

**Tech Stack:**
- Cloudflare Workers: Global edge computing
- Cloudflare AI: Latest LLM models
- Durable Objects: Game state management
- Custom Chess Engine: Fully autonomous`
        },
        {
          title: '🌍 Global Service',
          content: `**11 Languages Supported:**
Chinese (Simplified/Traditional), English, Spanish, French, German, Japanese, Korean, Russian, Arabic, Portuguese, Italian

**Global CDN:**
- 300+ edge nodes
- < 50ms response time
- 99.99% availability
- Free unlimited use`
        },
        {
          title: '💯 Why Free',
          content: `**Our Commitment:**
- ✅ Forever free
- ✅ No ads
- ✅ No registration required
- ✅ No hidden fees
- ✅ Open source transparency

**Sustainability:**
- Low hosting costs (Cloudflare Workers free tier)
- Open source community contributions
- Driven by pure technical passion`
        },
        {
          title: '🚀 Features',
          content: `**Game Modes:**
- Practice Mode: Free exploration
- Human vs Human: Local multiplayer
- Human vs AI: Challenge AI
- AI vs AI: Spectate and learn

**Core Features:**
- Complete chess rules (castling, en passant, pawn promotion)
- Real-time countdown
- PGN standard notation
- Check/Checkmate/Draw detection
- Victory celebration animation
- AI thinking process display`
        },
        {
          title: '👨‍💻 Open Source',
          content: `AIChess is an open source project (MIT License):

**GitHub:** https://github.com/aichess/aichess

**Contribute:**
Issues and Pull Requests welcome!

**Tech Stack:**
- TypeScript
- Cloudflare Workers
- Cloudflare AI
- Custom Chess Engine`
        },
        {
          title: '📧 Contact Us',
          content: `**Feedback and Suggestions:**
- Email: contact@aichess.win
- GitHub Issues: Submit bugs or feature requests
- Website: https://aichess.win

**Business Inquiries:**
contact@aichess.win

We look forward to your feedback!`
        },
        {
          title: '🎉 Acknowledgments',
          content: `Special thanks to:

- **Cloudflare**: For powerful Workers platform and AI models
- **Open Source Community**: TypeScript, Chess.js, and other tools
- **Chess Community**: Rules and theory support
- **All Users**: Your support drives us forward

Let's make chess smarter and more fun together! ♟️`
        }
      ]
    }
  };
  
  const data = content[lang as keyof typeof content] || content['en'];
  
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - AIChess.win</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.8;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 15px;
      margin-bottom: 10px;
    }
    .updated {
      color: #7f8c8d;
      font-size: 0.9em;
      margin-bottom: 30px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    p {
      margin-bottom: 15px;
      text-align: justify;
    }
    strong {
      color: #2980b9;
    }
    .back-link {
      display: inline-block;
      margin-top: 30px;
      padding: 12px 24px;
      background: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.3s;
    }
    .back-link:hover {
      background: #2980b9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${data.title}</h1>
    ${data.updated ? `<p class="updated">${data.updated}</p>` : ''}
    
    ${data.sections.map(section => `
      <h2>${section.title}</h2>
      <p>${section.content.replace(/\n/g, '<br>')}</p>
    `).join('')}
    
    <a href="/?lang=${lang}" class="back-link">← ${lang.startsWith('zh') ? '返回游戏' : 'Back to Game'}</a>
  </div>
</body>
</html>
  `;
}

