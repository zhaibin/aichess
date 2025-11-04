// 语言检测工具
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../config/constants';

/**
 * 从URL获取语言
 */
export function getLanguageFromURL(url: URL): Language {
  const lang = url.searchParams.get('lang');
  if (lang && SUPPORTED_LANGUAGES.includes(lang as Language)) {
    return lang as Language;
  }
  return 'en';
}

/**
 * 从Accept-Language头获取语言
 */
export function getLanguageFromHeader(header: string | null): Language {
  if (!header) return 'en';

  // 解析Accept-Language头
  const languages = header.split(',').map(lang => {
    const parts = lang.trim().split(';');
    return parts[0];
  });

  for (const lang of languages) {
    if (SUPPORTED_LANGUAGES.includes(lang as Language)) {
      return lang as Language;
    }
    // 检查语言代码的主要部分（如zh匹配zh-CN）
    const mainLang = lang.split('-')[0];
    const matched = SUPPORTED_LANGUAGES.find(l => l.startsWith(mainLang));
    if (matched) return matched;
  }

  return 'en';
}

