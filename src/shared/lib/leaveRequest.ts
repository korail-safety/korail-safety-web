/**
 * 작업 화면을 벗어나는 요청(로그아웃 등)을 작업 화면에 먼저 물어보는 연결 고리.
 *
 * 로그아웃 버튼처럼 페이지 밖(사이드바)에 있는 버튼은 페이지가 직접 막을 수 없어서,
 * 작업 화면이 여기에 "나가기 전에 할 일"을 등록해 두고 버튼은 requestLeave로 나간다.
 */
type LeaveHandler = (proceed: () => void) => void;

let currentHandler: LeaveHandler | null = null;

/** 작업 화면이 등록한다. 돌려받은 함수로 해제 */
export function setLeaveHandler(handler: LeaveHandler): () => void {
  currentHandler = handler;
  return () => {
    if (currentHandler === handler) currentHandler = null;
  };
}

/** 등록된 작업 화면이 있으면 먼저 물어보고, 없으면 바로 진행한다 */
export function requestLeave(proceed: () => void) {
  if (currentHandler) currentHandler(proceed);
  else proceed();
}
