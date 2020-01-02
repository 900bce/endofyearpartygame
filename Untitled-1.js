

export enum QuizClientSocketType {
  /** Client 建立連線 (emit) (playerId) */
  CONNECTION = 'client.connection',
  /** 等待遊戲允許加入 */
  WAIT_FOR_ALLOW_JOIN_GAME = 'client.waitForAllowJoinGame',
  /** Client 加入遊戲 (emit) { name, id } */
  JOIN_GAME = 'client.joinGame',
  /** Client 加入遊戲失敗 */
  JOIN_GAME_FAIL = 'client.joinGameFail', // alert('加入失敗')
  /** Client 加入遊戲後，等待遊戲開始 */
  WAIT_FOR_GAME_TO_START = 'client.waitForGameToStart',
  /** 遊戲開始後，等待題目顯示 */
  WAIT_FOR_QUIZ_TO_SHOW = 'client.waitForQuizToShow',
  /** 題目顯示後，Client 進入作答介面 */
  SHOW_QUIZ_OPTIONS = 'client.showQuizOptions',
  // {
  //   currentQuestNo,
  //   questionCount
  // }

  /** Client 提交答案 (emit) */
  SUBMIT_ANSWER = 'client.submitAnswer',
  // {
  //   questNo: number,
  //   playerId: string,
  //   answer: string,
  //   speed: number
  // }

  /** Client 提交答案失敗 */
  SUBMIT_ANSWER_FAIL = 'client.submitAnswerFail',
  /** Client 提交答案後，進入答案等待頁 */
  WAIT_FOR_QUIZ_ANSWER = 'client.waitForQuizAnswer',
  /** 顯示 Client 的答題結果 */
  SHOW_QUIZ_ANSWER = 'client.showQuizAnswer',
  // {
  //   currentQuestNo: 1,
  //   questionCount: 1,
  //   answer: 'a',
  //   players: [
  //     { rank: 1, id: 'xxx', score: 123 }
  //   ]
  // }
}