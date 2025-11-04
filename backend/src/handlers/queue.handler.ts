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
  for (const message of batch.messages) {
    try {
      const { gameId, currentPlayer } = message.body;

      // 获取游戏状态
      const id = env.GAME_STATE.idFromName(gameId);
      const gameState = env.GAME_STATE.get(id);
      
      const response = await gameState.fetch(new Request('http://do/state'));
      const game = await response.json();

      if (game.status !== 'active') {
        message.ack();
        continue;
      }

      // 获取当前玩家
      const player = currentPlayer === 'w' ? game.whitePlayer : game.blackPlayer;
      
      if (player.type !== 'ai') {
        message.ack();
        continue;
      }

      // 获取AI移动（带2秒延迟模拟思考）
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiMove = await getAIMove(game, player.aiModel!, env);

      if (!aiMove) {
        console.error('AI failed to generate move');
        message.retry();
        continue;
      }

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
        console.error('Failed to execute AI move');
        message.retry();
        continue;
      }

      const updatedGame = await moveResponse.json();

      // 如果仍然是AI的回合，继续发送到队列
      if (updatedGame.status === 'active') {
        const nextPlayer = updatedGame.currentTurn === 'w' 
          ? updatedGame.whitePlayer 
          : updatedGame.blackPlayer;

        if (nextPlayer.type === 'ai') {
          await env.AI_GAME_QUEUE.send({
            gameId,
            currentPlayer: updatedGame.currentTurn
          });
        }
      }

      message.ack();

    } catch (error) {
      console.error('Queue processing error:', error);
      message.retry();
    }
  }
}

