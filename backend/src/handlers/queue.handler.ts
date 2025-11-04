// 队列处理器
import { Env, AIGameQueueMessage } from '../types';
import { getAIMove } from '../services/ai-player';

/**
 * 处理AI游戏队列
 */
export async function handleQueue(
  batch: MessageBatch<AIGameQueueMessage>,
  env: Env
): Promise<void> {
  console.log('═══════════════════════════════════════');
  console.log('🔄 队列处理器被调用！');
  console.log('📥 消息数量:', batch.messages.length);
  console.log('═══════════════════════════════════════');
  
  for (const message of batch.messages) {
    try {
      const { gameId, currentPlayer } = message.body;
      console.log('🤖 处理AI移动:', gameId, '当前玩家:', currentPlayer);

      // 获取游戏状态
      console.log('📍 获取DO, gameId:', gameId);
      const id = env.GAME_STATE.idFromName(gameId);
      const gameState = env.GAME_STATE.get(id);
      
      console.log('📨 调用DO /state');
      const response = await gameState.fetch(new Request('http://do/state'));
      const game = await response.json();
      console.log('📋 游戏状态:', game.status, '当前回合:', game.currentTurn, 'FEN:', game.fen?.substring(0, 30));

      if (game.error) {
        console.error('❌ 获取游戏状态失败:', game.error);
        message.retry();
        continue;
      }
      
      if (game.status !== 'active') {
        console.log('⚠️ 游戏未激活，状态:', game.status, '跳过');
        message.ack();
        continue;
      }

      // 获取当前玩家
      const player = game.currentTurn === 'w' ? game.whitePlayer : game.blackPlayer;
      console.log('🎯 当前玩家:', player.type, player.name, '颜色:', game.currentTurn);
      
      if (player.type !== 'ai') {
        console.log('⚠️ 当前玩家不是AI，类型:', player.type, '跳过');
        message.ack();
        continue;
      }
      
      console.log('✅ 当前玩家是AI，准备生成移动');

      // 获取AI移动（带2秒延迟模拟思考）
      console.log('🤔 AI思考中...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🧠 调用AI生成移动, 模型:', player.aiModel);
      const aiMove = await getAIMove(game, player.aiModel!, env);

      if (!aiMove) {
        console.error('❌ AI未能生成移动');
        message.retry();
        continue;
      }

      console.log('✅ AI生成移动:', aiMove.from, '→', aiMove.to);

      // 执行AI移动
      const moveResponse = await gameState.fetch(new Request('http://do/move', {
        method: 'POST',
        body: JSON.stringify({
          from: aiMove.from,
          to: aiMove.to,
          promotion: aiMove.promotion
        })
      }));

      if (!moveResponse.ok) {
        console.error('❌ Failed to execute AI move');
        message.retry();
        continue;
      }

      const updatedGame = await moveResponse.json();
      console.log('🎮 移动执行成功，新状态:', updatedGame.currentTurn);

      // 如果仍然是AI的回合，继续发送到队列
      if (updatedGame.status === 'active') {
        const nextPlayer = updatedGame.currentTurn === 'w' 
          ? updatedGame.whitePlayer 
          : updatedGame.blackPlayer;

        if (nextPlayer.type === 'ai') {
          console.log('🔁 下一步仍是AI，发送到队列');
          await env.AI_GAME_QUEUE.send({
            gameId,
            currentPlayer: updatedGame.currentTurn
          });
        }
      } else {
        console.log('🏁 游戏结束:', updatedGame.status);
      }

      message.ack();
      console.log('✅ 消息处理完成');

    } catch (error) {
      console.error('Queue processing error:', error);
      message.retry();
    }
  }
}

