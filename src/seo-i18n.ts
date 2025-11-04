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
    title: 'AIChess - AI国际象棋在线对战平台 | 人机对战 AI对战',
    description: 'AIChess是基于Cloudflare Workers的在线国际象棋对战平台，支持人人对战、人机对战和AI对AI对战。提供ELO评分、游戏回放、实时对战等功能。完全免费，支持11种语言。',
    keywords: '国际象棋,AI象棋,在线象棋,chess,AI chess,人机对战,象棋游戏,chess game,ELO评分,国际象棋在线,免费象棋',
    ogTitle: 'AIChess - AI国际象棋在线对战平台',
    ogDescription: '支持人人对战、人机对战和AI对AI对战的在线国际象棋平台。5个AI模型，ELO评分系统，游戏回放，实时对战。'
  },
  'zh-TW': {
    title: 'AIChess - AI國際象棋線上對戰平台 | 人機對戰 AI對戰',
    description: 'AIChess是基於Cloudflare Workers的線上國際象棋對戰平台，支援人人對戰、人機對戰和AI對AI對戰。提供ELO評分、遊戲回放、即時對戰等功能。完全免費，支援11種語言。',
    keywords: '國際象棋,AI象棋,線上象棋,chess,AI chess,人機對戰,象棋遊戲,chess game,ELO評分,國際象棋線上,免費象棋',
    ogTitle: 'AIChess - AI國際象棋線上對戰平台',
    ogDescription: '支援人人對戰、人機對戰和AI對AI對戰的線上國際象棋平台。5個AI模型，ELO評分系統，遊戲回放，即時對戰。'
  },
  'en': {
    title: 'AIChess - Online AI Chess Platform | Human vs AI | AI vs AI',
    description: 'AIChess is an online chess platform powered by Cloudflare Workers. Play human vs human, human vs AI, or watch AI vs AI battles. Features ELO rating, game replay, real-time multiplayer, and 5 AI models. Free and supports 11 languages.',
    keywords: 'chess,online chess,AI chess,chess game,play chess online,chess AI,ELO rating,chess platform,free chess,international chess',
    ogTitle: 'AIChess - Online AI Chess Platform',
    ogDescription: 'Play chess online with human vs human, human vs AI, or AI vs AI modes. 5 AI models, ELO rating, game replay, and real-time battles.'
  },
  'fr': {
    title: 'AIChess - Plateforme d\'Échecs IA en Ligne | Humain vs IA',
    description: 'AIChess est une plateforme d\'échecs en ligne alimentée par Cloudflare Workers. Jouez humain contre humain, humain contre IA, ou regardez des batailles IA contre IA. Classement ELO, replay de parties, multijoueur en temps réel et 5 modèles IA. Gratuit et supporte 11 langues.',
    keywords: 'échecs,échecs en ligne,échecs IA,jeu d\'échecs,jouer aux échecs en ligne,IA échecs,classement ELO,plateforme échecs,échecs gratuits',
    ogTitle: 'AIChess - Plateforme d\'Échecs IA en Ligne',
    ogDescription: 'Jouez aux échecs en ligne : humain vs humain, humain vs IA, ou IA vs IA. 5 modèles IA, classement ELO, replay de parties.'
  },
  'es': {
    title: 'AIChess - Plataforma de Ajedrez IA en Línea | Humano vs IA',
    description: 'AIChess es una plataforma de ajedrez en línea impulsada por Cloudflare Workers. Juega humano contra humano, humano contra IA, o mira batallas IA contra IA. Clasificación ELO, repetición de juegos, multijugador en tiempo real y 5 modelos de IA. Gratis y soporta 11 idiomas.',
    keywords: 'ajedrez,ajedrez en línea,ajedrez IA,juego de ajedrez,jugar ajedrez en línea,IA ajedrez,clasificación ELO,plataforma ajedrez,ajedrez gratis',
    ogTitle: 'AIChess - Plataforma de Ajedrez IA en Línea',
    ogDescription: 'Juega ajedrez en línea: humano vs humano, humano vs IA, o IA vs IA. 5 modelos IA, clasificación ELO, repetición de partidas.'
  },
  'de': {
    title: 'AIChess - Online KI-Schach-Plattform | Mensch vs KI',
    description: 'AIChess ist eine Online-Schachplattform basierend auf Cloudflare Workers. Spielen Sie Mensch gegen Mensch, Mensch gegen KI oder schauen Sie KI gegen KI Kämpfe. ELO-Wertung, Spielwiederholung, Echtzeit-Multiplayer und 5 KI-Modelle. Kostenlos und unterstützt 11 Sprachen.',
    keywords: 'Schach,Online-Schach,KI-Schach,Schachspiel,Schach online spielen,KI Schach,ELO-Wertung,Schachplattform,kostenloses Schach',
    ogTitle: 'AIChess - Online KI-Schach-Plattform',
    ogDescription: 'Spielen Sie Schach online: Mensch vs Mensch, Mensch vs KI, oder KI vs KI. 5 KI-Modelle, ELO-Wertung, Spielwiederholung.'
  },
  'it': {
    title: 'AIChess - Piattaforma Scacchi IA Online | Umano vs IA',
    description: 'AIChess è una piattaforma di scacchi online alimentata da Cloudflare Workers. Gioca umano contro umano, umano contro IA, o guarda battaglie IA contro IA. Classifica ELO, replay partite, multiplayer in tempo reale e 5 modelli IA. Gratuito e supporta 11 lingue.',
    keywords: 'scacchi,scacchi online,scacchi IA,gioco di scacchi,giocare a scacchi online,IA scacchi,classifica ELO,piattaforma scacchi,scacchi gratis',
    ogTitle: 'AIChess - Piattaforma Scacchi IA Online',
    ogDescription: 'Gioca a scacchi online: umano vs umano, umano vs IA, o IA vs IA. 5 modelli IA, classifica ELO, replay partite.'
  },
  'pt': {
    title: 'AIChess - Plataforma de Xadrez IA Online | Humano vs IA',
    description: 'AIChess é uma plataforma de xadrez online alimentada por Cloudflare Workers. Jogue humano contra humano, humano contra IA, ou assista batalhas IA contra IA. Classificação ELO, replay de jogos, multiplayer em tempo real e 5 modelos de IA. Grátis e suporta 11 idiomas.',
    keywords: 'xadrez,xadrez online,xadrez IA,jogo de xadrez,jogar xadrez online,IA xadrez,classificação ELO,plataforma xadrez,xadrez grátis',
    ogTitle: 'AIChess - Plataforma de Xadrez IA Online',
    ogDescription: 'Jogue xadrez online: humano vs humano, humano vs IA, ou IA vs IA. 5 modelos IA, classificação ELO, replay de jogos.'
  },
  'ru': {
    title: 'AIChess - Онлайн-платформа шахмат с ИИ | Человек против ИИ',
    description: 'AIChess - онлайн-платформа для игры в шахматы на базе Cloudflare Workers. Играйте человек против человека, человек против ИИ или смотрите битвы ИИ против ИИ. Рейтинг ELO, повтор игр, мультиплеер в реальном времени и 5 моделей ИИ. Бесплатно и поддерживает 11 языков.',
    keywords: 'шахматы,шахматы онлайн,шахматы ИИ,шахматная игра,играть в шахматы онлайн,ИИ шахматы,рейтинг ELO,шахматная платформа,бесплатные шахматы',
    ogTitle: 'AIChess - Онлайн-платформа шахмат с ИИ',
    ogDescription: 'Играйте в шахматы онлайн: человек против человека, человек против ИИ, или ИИ против ИИ. 5 моделей ИИ, рейтинг ELO, повтор игр.'
  },
  'ja': {
    title: 'AIChess - オンラインAIチェスプラットフォーム | 人間 vs AI',
    description: 'AIChessはCloudflare Workersを使用したオンラインチェスプラットフォームです。人間対人間、人間対AI、またはAI対AIの対戦を楽しめます。ELOレーティング、ゲームリプレイ、リアルタイムマルチプレイヤー、5つのAIモデル。無料で11言語をサポート。',
    keywords: 'チェス,オンラインチェス,AIチェス,チェスゲーム,オンラインでチェスをプレイ,AIチェス,ELOレーティング,チェスプラットフォーム,無料チェス',
    ogTitle: 'AIChess - オンラインAIチェスプラットフォーム',
    ogDescription: 'オンラインでチェスをプレイ：人間対人間、人間対AI、またはAI対AI。5つのAIモデル、ELOレーティング、ゲームリプレイ。'
  },
  'ko': {
    title: 'AIChess - 온라인 AI 체스 플랫폼 | 사람 vs AI',
    description: 'AIChess는 Cloudflare Workers 기반 온라인 체스 플랫폼입니다. 사람 대 사람, 사람 대 AI, 또는 AI 대 AI 대전을 즐기세요. ELO 등급, 게임 리플레이, 실시간 멀티플레이어, 5개 AI 모델. 무료이며 11개 언어를 지원합니다.',
    keywords: '체스,온라인 체스,AI 체스,체스 게임,온라인 체스 플레이,AI 체스,ELO 등급,체스 플랫폼,무료 체스',
    ogTitle: 'AIChess - 온라인 AI 체스 플랫폼',
    ogDescription: '온라인 체스 플레이: 사람 대 사람, 사람 대 AI, 또는 AI 대 AI. 5개 AI 모델, ELO 등급, 게임 리플레이.'
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

