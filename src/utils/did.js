/**
 * DID生成・管理のユーティリティ関数
 * ※ダミー実装
 */

/**
 * ランダムなDIDを生成（ダミー実装）
 * @returns {string} 生成されたDID
 */
export function generateDID() {
  const randomString = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('');

  return `did:example:${randomString}`;
}

/**
 * localStorageからDIDを取得
 * @returns {string|null} 保存されているDID、なければnull
 */
export function getDIDFromStorage() {
  return localStorage.getItem('wallet_did');
}

/**
 * localStorageにDIDを保存
 * @param {string} did 保存するDID
 */
export function saveDIDToStorage(did) {
  localStorage.setItem('wallet_did', did);
}

/**
 * DIDを初期化（存在しなければ生成、あれば取得）
 * @returns {string} DID
 */
export function initializeDID() {
  let did = getDIDFromStorage();

  if (!did) {
    did = generateDID();
    saveDIDToStorage(did);
    console.log('新しいDIDを生成しました:', did);
  } else {
    console.log('既存のDIDを読み込みました:', did);
  }

  return did;
}
