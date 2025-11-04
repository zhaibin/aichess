// SEO标签模板
import { Language } from '../types';
import { getTranslation } from '../services/i18n';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  url: string;
}

/**
 * 获取SEO标签
 */
export function getSEOTags(lang: Language): string {
  const baseUrl = 'https://aichess.win';
  const currentUrl = `${baseUrl}/?lang=${lang}`;
  
  const seoData: Record<Language, SEOData> = {
    'zh-CN': {
      title: 'AI国际象棋 - 免费在线国际象棋对战平台',
      description: '挑战5种强大的AI国际象棋对手，完全免费的在线国际象棋平台。支持人人对战、人机对战、AI对战，11种语言，全球CDN加速。',
      keywords: 'AI国际象棋,在线国际象棋,国际象棋AI,免费国际象棋,chess AI,国际象棋对战',
      url: currentUrl
    },
    'zh-TW': {
      title: 'AI國際象棋 - 免費線上國際象棋對戰平台',
      description: '挑戰5種強大的AI國際象棋對手，完全免費的線上國際象棋平台。支援人人對戰、人機對戰、AI對戰，11種語言，全球CDN加速。',
      keywords: 'AI國際象棋,線上國際象棋,國際象棋AI,免費國際象棋,chess AI,國際象棋對戰',
      url: currentUrl
    },
    'en': {
      title: 'AIChess - Free Online Chess Platform with AI Opponents',
      description: 'Challenge 5 powerful AI chess engines for free. Play chess online: human vs human, human vs AI, or watch AI vs AI. 11 languages, global CDN.',
      keywords: 'AI chess,online chess,chess AI,free chess,chess game,chess platform,AI opponent',
      url: currentUrl
    },
    'fr': {
      title: 'AIChess - Plateforme d\'échecs en ligne gratuite avec IA',
      description: 'Défiez 5 puissants moteurs d\'échecs IA gratuitement. Jouez aux échecs en ligne: humain vs humain, humain vs IA, ou IA vs IA. 11 langues.',
      keywords: 'échecs IA,échecs en ligne,échecs gratuits,jeu d\'échecs,plateforme échecs',
      url: currentUrl
    },
    'es': {
      title: 'AIChess - Plataforma de ajedrez online gratis con IA',
      description: 'Desafía a 5 potentes motores de ajedrez IA gratis. Juega ajedrez online: humano vs humano, humano vs IA, o IA vs IA. 11 idiomas.',
      keywords: 'ajedrez IA,ajedrez online,ajedrez gratis,juego de ajedrez,plataforma ajedrez',
      url: currentUrl
    },
    'de': {
      title: 'AIChess - Kostenlose Online-Schachplattform mit KI',
      description: 'Fordere 5 leistungsstarke Schach-KI-Engines kostenlos heraus. Schach online spielen: Mensch vs Mensch, Mensch vs KI, oder KI vs KI. 11 Sprachen.',
      keywords: 'Schach KI,Online-Schach,kostenloses Schach,Schachspiel,Schachplattform',
      url: currentUrl
    },
    'it': {
      title: 'AIChess - Piattaforma di scacchi online gratuita con IA',
      description: 'Sfida 5 potenti motori di scacchi IA gratuitamente. Gioca a scacchi online: umano vs umano, umano vs IA, o IA vs IA. 11 lingue.',
      keywords: 'scacchi IA,scacchi online,scacchi gratuiti,gioco di scacchi,piattaforma scacchi',
      url: currentUrl
    },
    'pt': {
      title: 'AIChess - Plataforma de xadrez online grátis com IA',
      description: 'Desafie 5 poderosos motores de xadrez IA gratuitamente. Jogue xadrez online: humano vs humano, humano vs IA, ou IA vs IA. 11 idiomas.',
      keywords: 'xadrez IA,xadrez online,xadrez grátis,jogo de xadrez,plataforma xadrez',
      url: currentUrl
    },
    'ru': {
      title: 'AIChess - Бесплатная онлайн шахматная платформа с ИИ',
      description: 'Сразитесь с 5 мощными шахматными движками ИИ бесплатно. Играйте в шахматы онлайн: человек против человека, человек против ИИ, или ИИ против ИИ. 11 языков.',
      keywords: 'шахматы ИИ,онлайн шахматы,бесплатные шахматы,шахматная игра,шахматная платформа',
      url: currentUrl
    },
    'ja': {
      title: 'AIChess - AIと対戦できる無料オンラインチェスプラットフォーム',
      description: '5つの強力なチェスAIエンジンに無料で挑戦。オンラインチェスをプレイ：人間対人間、人間対AI、またはAI対AI。11言語対応。',
      keywords: 'AIチェス,オンラインチェス,無料チェス,チェスゲーム,チェスプラットフォーム',
      url: currentUrl
    },
    'ko': {
      title: 'AIChess - AI와 대결하는 무료 온라인 체스 플랫폼',
      description: '5개의 강력한 체스 AI 엔진에 무료로 도전하세요. 온라인 체스 플레이: 사람 vs 사람, 사람 vs AI, 또는 AI vs AI. 11개 언어 지원.',
      keywords: 'AI 체스,온라인 체스,무료 체스,체스 게임,체스 플랫폼',
      url: currentUrl
    }
  };

  const data = seoData[lang];
  const languages: Language[] = ['zh-CN', 'zh-TW', 'en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'ko'];

  return `
  <!-- Primary Meta Tags -->
  <title>${data.title}</title>
  <meta name="title" content="${data.title}">
  <meta name="description" content="${data.description}">
  <meta name="keywords" content="${data.keywords}">
  <link rel="canonical" href="${currentUrl}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${currentUrl}">
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:image" content="${baseUrl}/og-image.png">
  <meta property="og:site_name" content="AIChess">
  <meta property="og:locale" content="${lang.replace('-', '_')}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${currentUrl}">
  <meta property="twitter:title" content="${data.title}">
  <meta property="twitter:description" content="${data.description}">
  <meta property="twitter:image" content="${baseUrl}/twitter-image.png">
  
  <!-- Hreflang Links -->
  ${languages.map(l => `<link rel="alternate" hreflang="${l}" href="${baseUrl}/?lang=${l}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${baseUrl}">
  `;
}

