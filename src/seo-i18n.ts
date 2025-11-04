// SEO多语言支持

import { Language } from './types';

export interface SEOTranslation {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
}

export const seoTranslations: Record<Language, SEOTranslation> = {
  'zh-CN': {
    title: 'AIChess - 智能国际象棋对战平台 | 5种AI棋手 免费在线下棋',
    description: 'AIChess提供5种强大AI棋手在线对弈，从入门到大师级难度任你挑战。支持人人对战、人机对战、观看AI对决。完全免费，ELO评分系统，游戏回放分析，实时在线对战。支持11种语言，全球玩家都能畅玩。',
    keywords: '国际象棋,AI象棋,在线象棋,免费象棋,人机对战,AI对战,象棋游戏,智能象棋,ELO评分,象棋AI,国际象棋在线,象棋分析',
    ogTitle: 'AIChess - 5种AI棋手的智能象棋平台',
    ogDescription: '挑战5种不同风格的AI棋手，从新手到大师级。完全免费，实时对战，游戏分析，全球排行榜。'
  },
  'zh-TW': {
    title: 'AIChess - 智能國際象棋對戰平台 | 5種AI棋手 免費線上下棋',
    description: 'AIChess提供5種強大AI棋手線上對弈，從入門到大師級難度任你挑戰。支援人人對戰、人機對戰、觀看AI對決。完全免費，ELO評分系統，遊戲回放分析，即時線上對戰。支援11種語言，全球玩家都能暢玩。',
    keywords: '國際象棋,AI象棋,線上象棋,免費象棋,人機對戰,AI對戰,象棋遊戲,智能象棋,ELO評分,象棋AI,國際象棋線上,象棋分析',
    ogTitle: 'AIChess - 5種AI棋手的智能象棋平台',
    ogDescription: '挑戰5種不同風格的AI棋手，從新手到大師級。完全免費，即時對戰，遊戲分析，全球排行榜。'
  },
  'en': {
    title: 'AIChess - Play Chess Against 5 Powerful AI | Free Online Chess',
    description: 'Challenge 5 unique AI chess opponents from beginner to grandmaster level. Play for free online with human vs human, human vs AI, or watch epic AI battles. Features ELO rating system, game analysis, replay mode, and real-time multiplayer. Available in 11 languages worldwide.',
    keywords: 'chess,online chess,AI chess,free chess,chess AI,play chess online,chess game,smart chess,ELO rating,chess analysis,chess opponents,international chess',
    ogTitle: 'AIChess - Challenge 5 Intelligent Chess AI',
    ogDescription: 'Face 5 different AI chess opponents from novice to master. Completely free, real-time play, game analysis, global leaderboard.'
  },
  'fr': {
    title: 'AIChess - Jouez Contre 5 IA d\'Échecs Puissantes | Échecs Gratuits',
    description: 'Affrontez 5 adversaires IA d\'échecs uniques, du niveau débutant au grand maître. Jouez gratuitement en ligne : humain vs humain, humain vs IA, ou regardez des batailles épiques d\'IA. Système de classement ELO, analyse de parties, mode replay et multijoueur en temps réel. Disponible en 11 langues.',
    keywords: 'échecs,échecs en ligne,IA échecs,échecs gratuits,jouer aux échecs,jeu d\'échecs,échecs intelligents,classement ELO,analyse échecs,adversaires échecs',
    ogTitle: 'AIChess - Défiez 5 IA d\'Échecs Intelligentes',
    ogDescription: 'Affrontez 5 adversaires IA différents, du novice au maître. Gratuit, jeu en temps réel, analyse de parties, classement mondial.'
  },
  'es': {
    title: 'AIChess - Juega Contra 5 IA de Ajedrez Potentes | Ajedrez Gratis',
    description: 'Desafía 5 oponentes IA de ajedrez únicos, desde principiante hasta gran maestro. Juega gratis en línea: humano vs humano, humano vs IA, o mira batallas épicas de IA. Sistema de clasificación ELO, análisis de partidas, modo repetición y multijugador en tiempo real. Disponible en 11 idiomas.',
    keywords: 'ajedrez,ajedrez en línea,IA ajedrez,ajedrez gratis,jugar ajedrez,juego de ajedrez,ajedrez inteligente,clasificación ELO,análisis ajedrez,oponentes ajedrez',
    ogTitle: 'AIChess - Desafía 5 IA de Ajedrez Inteligentes',
    ogDescription: 'Enfrenta 5 oponentes IA diferentes, de novato a maestro. Completamente gratis, juego en tiempo real, análisis de partidas, ranking global.'
  },
  'de': {
    title: 'AIChess - Spielen Sie Gegen 5 Starke Schach-KI | Kostenloses Schach',
    description: 'Fordern Sie 5 einzigartige Schach-KI-Gegner heraus, vom Anfänger bis zum Großmeister. Spielen Sie kostenlos online: Mensch gegen Mensch, Mensch gegen KI, oder beobachten Sie epische KI-Kämpfe. ELO-Wertungssystem, Spielanalyse, Replay-Modus und Echtzeit-Multiplayer. Verfügbar in 11 Sprachen.',
    keywords: 'Schach,Online-Schach,KI-Schach,kostenloses Schach,Schach spielen,Schachspiel,intelligentes Schach,ELO-Wertung,Schachanalyse,Schachgegner',
    ogTitle: 'AIChess - Fordern Sie 5 Intelligente Schach-KI Heraus',
    ogDescription: 'Spielen Sie gegen 5 verschiedene KI-Gegner, vom Novizen zum Meister. Völlig kostenlos, Echtzeit-Spiel, Spielanalyse, globale Rangliste.'
  },
  'it': {
    title: 'AIChess - Gioca Contro 5 IA di Scacchi Potenti | Scacchi Gratuiti',
    description: 'Sfida 5 avversari IA di scacchi unici, dal principiante al gran maestro. Gioca gratis online: umano vs umano, umano vs IA, o guarda battaglie epiche di IA. Sistema di classifica ELO, analisi partite, modalità replay e multiplayer in tempo reale. Disponibile in 11 lingue.',
    keywords: 'scacchi,scacchi online,IA scacchi,scacchi gratis,giocare a scacchi,gioco di scacchi,scacchi intelligenti,classifica ELO,analisi scacchi,avversari scacchi',
    ogTitle: 'AIChess - Sfida 5 IA di Scacchi Intelligenti',
    ogDescription: 'Affronta 5 diversi avversari IA, dal novizio al maestro. Completamente gratuito, gioco in tempo reale, analisi partite, classifica globale.'
  },
  'pt': {
    title: 'AIChess - Jogue Contra 5 IA de Xadrez Poderosas | Xadrez Grátis',
    description: 'Desafie 5 adversários IA de xadrez únicos, do iniciante ao grão-mestre. Jogue grátis online: humano vs humano, humano vs IA, ou assista batalhas épicas de IA. Sistema de classificação ELO, análise de jogos, modo replay e multiplayer em tempo real. Disponível em 11 idiomas.',
    keywords: 'xadrez,xadrez online,IA xadrez,xadrez grátis,jogar xadrez,jogo de xadrez,xadrez inteligente,classificação ELO,análise xadrez,adversários xadrez',
    ogTitle: 'AIChess - Desafie 5 IA de Xadrez Inteligentes',
    ogDescription: 'Enfrente 5 diferentes adversários IA, do novato ao mestre. Completamente grátis, jogo em tempo real, análise de partidas, ranking global.'
  },
  'ru': {
    title: 'AIChess - Играйте Против 5 Мощных Шахматных ИИ | Бесплатные Шахматы',
    description: 'Бросьте вызов 5 уникальным шахматным ИИ соперникам, от новичка до гроссмейстера. Играйте бесплатно онлайн: человек против человека, человек против ИИ, или смотрите эпические битвы ИИ. Система рейтинга ELO, анализ партий, режим повтора и мультиплеер в реальном времени. Доступно на 11 языках.',
    keywords: 'шахматы,шахматы онлайн,ИИ шахматы,бесплатные шахматы,играть в шахматы,шахматная игра,умные шахматы,рейтинг ELO,анализ шахмат,шахматные соперники',
    ogTitle: 'AIChess - Бросьте Вызов 5 Интеллектуальным Шахматным ИИ',
    ogDescription: 'Сразитесь с 5 различными ИИ соперниками, от новичка до мастера. Полностью бесплатно, игра в реальном времени, анализ партий, глобальный рейтинг.'
  },
  'ja': {
    title: 'AIChess - 5つの強力なチェスAIと対戦 | 無料オンラインチェス',
    description: '初心者からグランドマスターレベルまで、5つのユニークなチェスAI対戦相手に挑戦。無料でオンラインプレイ：人間対人間、人間対AI、またはエピックなAIバトルを観戦。ELOレーティングシステム、ゲーム分析、リプレイモード、リアルタイムマルチプレイヤー。11言語に対応。',
    keywords: 'チェス,オンラインチェス,AIチェス,無料チェス,チェスをプレイ,チェスゲーム,スマートチェス,ELOレーティング,チェス分析,チェス対戦相手',
    ogTitle: 'AIChess - 5つのインテリジェントチェスAIに挑戦',
    ogDescription: '初心者からマスターまで5つの異なるAI対戦相手と対戦。完全無料、リアルタイムプレイ、ゲーム分析、グローバルリーダーボード。'
  },
  'ko': {
    title: 'AIChess - 5가지 강력한 체스 AI와 대결 | 무료 온라인 체스',
    description: '초보자부터 그랜드마스터 레벨까지, 5가지 독특한 체스 AI 상대에게 도전하세요. 무료 온라인 플레이: 사람 대 사람, 사람 대 AI, 또는 장대한 AI 배틀 관전. ELO 등급 시스템, 게임 분석, 리플레이 모드, 실시간 멀티플레이어. 11개 언어 지원.',
    keywords: '체스,온라인 체스,AI 체스,무료 체스,체스 플레이,체스 게임,스마트 체스,ELO 등급,체스 분석,체스 상대',
    ogTitle: 'AIChess - 5가지 지능형 체스 AI에 도전',
    ogDescription: '초보부터 마스터까지 5가지 다른 AI 상대와 대결. 완전 무료, 실시간 플레이, 게임 분석, 글로벌 리더보드.'
  }
};

/**
 * 生成hreflang标签
 */
export function getHrefLangTags(baseUrl: string = 'https://aichess.win'): string {
  const languages: Language[] = ['zh-CN', 'zh-TW', 'en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'ko'];
  
  let tags = `  <link rel="alternate" hreflang="x-default" href="${baseUrl}/" />\n`;
  
  for (const lang of languages) {
    tags += `  <link rel="alternate" hreflang="${lang}" href="${baseUrl}/?lang=${lang}" />\n`;
  }
  
  return tags;
}

/**
 * 获取SEO标签（根据语言）
 */
export function getSEOTags(lang: Language = 'zh-CN'): string {
  const seo = seoTranslations[lang];
  const baseUrl = 'https://aichess.win';
  
  return `
  <!-- SEO优化 -->
  <title>${seo.title}</title>
  <meta name="description" content="${seo.description}">
  <meta name="keywords" content="${seo.keywords}">
  <meta name="author" content="AIChess">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${baseUrl}/">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}/">
  <meta property="og:title" content="${seo.ogTitle}">
  <meta property="og:description" content="${seo.ogDescription}">
  <meta property="og:image" content="${baseUrl}/og-image.png">
  <meta property="og:locale" content="${lang}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${baseUrl}/">
  <meta property="twitter:title" content="${seo.ogTitle}">
  <meta property="twitter:description" content="${seo.ogDescription}">
  <meta property="twitter:image" content="${baseUrl}/twitter-image.png">
  
  <!-- 多语言hreflang -->
${getHrefLangTags(baseUrl)}`;
}

/**
 * 从URL参数获取语言
 */
export function getLanguageFromURL(url: string): Language {
  try {
    const urlObj = new URL(url);
    const langParam = urlObj.searchParams.get('lang');
    
    const validLanguages: Language[] = ['zh-CN', 'zh-TW', 'en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'ko'];
    
    if (langParam && validLanguages.includes(langParam as Language)) {
      return langParam as Language;
    }
  } catch (error) {
    // URL解析失败，使用默认语言
  }
  
  return 'zh-CN'; // 默认简体中文
}

/**
 * 从Accept-Language头获取语言
 */
export function getLanguageFromHeader(acceptLanguage: string | null): Language {
  if (!acceptLanguage) return 'zh-CN';
  
  // 解析Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
  const languages = acceptLanguage.split(',').map(lang => {
    const parts = lang.trim().split(';');
    return parts[0];
  });
  
  // 映射到支持的语言
  const langMap: Record<string, Language> = {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'zh-HK': 'zh-TW',
    'zh': 'zh-CN',
    'en': 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'fr': 'fr',
    'fr-FR': 'fr',
    'es': 'es',
    'es-ES': 'es',
    'de': 'de',
    'de-DE': 'de',
    'it': 'it',
    'it-IT': 'it',
    'pt': 'pt',
    'pt-BR': 'pt',
    'pt-PT': 'pt',
    'ru': 'ru',
    'ru-RU': 'ru',
    'ja': 'ja',
    'ja-JP': 'ja',
    'ko': 'ko',
    'ko-KR': 'ko'
  };
  
  for (const lang of languages) {
    if (langMap[lang]) {
      return langMap[lang];
    }
  }
  
  return 'zh-CN';
}

