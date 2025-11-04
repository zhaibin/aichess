// 开局库集成

/**
 * 常见开局定义
 */
export interface Opening {
  name: string;
  eco: string; // Encyclopedia of Chess Openings code
  moves: string[]; // UCI格式移动序列
  description: string;
}

/**
 * 开局库
 */
export class OpeningBook {
  private static openings: Opening[] = [
    // 意大利开局
    {
      name: '意大利开局',
      eco: 'C50',
      moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4'],
      description: '经典开局，控制中心并快速出子'
    },
    // 西班牙开局（Ruy Lopez）
    {
      name: '西班牙开局',
      eco: 'C60',
      moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5'],
      description: '最古老最流行的开局之一'
    },
    // 西西里防御
    {
      name: '西西里防御',
      eco: 'B20',
      moves: ['e2e4', 'c7c5'],
      description: '黑方最积极的防御之一'
    },
    // 法兰西防御
    {
      name: '法兰西防御',
      eco: 'C00',
      moves: ['e2e4', 'e7e6'],
      description: '稳健的防御体系'
    },
    // 卡罗-卡恩防御
    {
      name: '卡罗-卡恩防御',
      eco: 'B10',
      moves: ['e2e4', 'c7c6'],
      description: '扎实的防御选择'
    },
    // 后翼弃兵
    {
      name: '后翼弃兵',
      eco: 'D06',
      moves: ['d2d4', 'd7d5', 'c2c4'],
      description: '著名的开局，牺牲兵换取发展'
    },
    // 英国开局
    {
      name: '英国开局',
      eco: 'A10',
      moves: ['c2c4'],
      description: '灵活的超级开局'
    },
    // 印度防御
    {
      name: '王印防御',
      eco: 'E60',
      moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6'],
      description: '现代防御体系'
    },
    // 四马开局
    {
      name: '四马开局',
      eco: 'C47',
      moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'b1c3', 'g8f6'],
      description: '对称发展的开局'
    },
    // 苏格兰开局
    {
      name: '苏格兰开局',
      eco: 'C45',
      moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'd2d4'],
      description: '积极争夺中心'
    },
    // 斯堪的纳维亚防御
    {
      name: '斯堪的纳维亚防御',
      eco: 'B01',
      moves: ['e2e4', 'd7d5'],
      description: '立即挑战白方中心'
    },
    // 彼得罗夫防御
    {
      name: '彼得罗夫防御',
      eco: 'C42',
      moves: ['e2e4', 'e7e5', 'g1f3', 'g8f6'],
      description: '对称且稳健的防御'
    },
    // 国王印度防御
    {
      name: '国王印度防御',
      eco: 'E60',
      moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'b1c3', 'f8g7'],
      description: '激进的反击体系'
    },
    // 女王印度防御
    {
      name: '女王印度防御',
      eco: 'E12',
      moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'g1f3', 'b7b6'],
      description: '灵活的防御系统'
    },
    // 伦敦体系
    {
      name: '伦敦体系',
      eco: 'D02',
      moves: ['d2d4', 'd7d5', 'g1f3', 'g8f6', 'c1f4'],
      description: '可靠的白方开局'
    }
  ];

  /**
   * 识别当前开局
   */
  static identifyOpening(moves: string[]): Opening | null {
    if (moves.length === 0) return null;

    // 找到匹配最长的开局
    let bestMatch: Opening | null = null;
    let maxMatches = 0;

    for (const opening of this.openings) {
      let matches = 0;
      for (let i = 0; i < Math.min(moves.length, opening.moves.length); i++) {
        if (moves[i] === opening.moves[i]) {
          matches++;
        } else {
          break;
        }
      }

      if (matches > 0 && matches === opening.moves.length && matches > maxMatches) {
        maxMatches = matches;
        bestMatch = opening;
      }
    }

    return bestMatch;
  }

  /**
   * 获取开局建议
   */
  static getSuggestion(moves: string[]): { move: string; opening: Opening } | null {
    // 查找匹配的开局序列
    for (const opening of this.openings) {
      if (moves.length < opening.moves.length) {
        let matches = true;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i] !== opening.moves[i]) {
            matches = false;
            break;
          }
        }

        if (matches) {
          return {
            move: opening.moves[moves.length],
            opening
          };
        }
      }
    }

    return null;
  }

  /**
   * 获取所有开局
   */
  static getAllOpenings(): Opening[] {
    return this.openings;
  }

  /**
   * 按ECO代码搜索
   */
  static searchByECO(eco: string): Opening[] {
    return this.openings.filter(o => o.eco.startsWith(eco));
  }

  /**
   * 按名称搜索
   */
  static searchByName(name: string): Opening[] {
    const lowerName = name.toLowerCase();
    return this.openings.filter(o => 
      o.name.toLowerCase().includes(lowerName) ||
      o.description.toLowerCase().includes(lowerName)
    );
  }

  /**
   * 获取随机开局
   */
  static getRandomOpening(): Opening {
    return this.openings[Math.floor(Math.random() * this.openings.length)];
  }
}

