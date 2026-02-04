import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { CopyIcon, CheckIcon, WalletIcon, CreditCardIcon, QrCodeIcon, CameraIcon, XIcon, FileTextIcon } from './Icons';

/**
 * Walletのホーム画面コンポーネント
 * DIDと保有VCを表示、QRスキャンで委任状VCを受け取る
 */
function WalletHome({ did, vcs, delegationVCs, ownerName, onOwnerNameChange, onAddDelegationVC, onAddIdentityVC }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanSuccess, setScanSuccess] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(ownerName);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleCopyDID = () => {
    navigator.clipboard.writeText(did);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QRスキャナー開始
  const startScanner = async () => {
    setScanError('');
    setScanSuccess(null);
    setShowScanner(true);

    // 少し待ってからスキャナーを初期化
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // QRコード読み取り成功
            try {
              const delegationVC = JSON.parse(decodedText);

              // 委任状VCかどうかを検証
              if (delegationVC.type !== '委任状') {
                setScanError('これは委任状VCではありません');
                return;
              }

              // 被委任者DIDが自分のDIDと一致するかチェック
              if (delegationVC.delegate?.did !== did) {
                setScanError('この委任状は別のウォレット宛てです');
                return;
              }

              // 有効期限チェック
              const today = new Date().toISOString().split('T')[0];
              if (delegationVC.expiryDate < today) {
                setScanError('この委任状は有効期限が切れています');
                return;
              }

              // 保存
              onAddDelegationVC(delegationVC);
              setScanSuccess(delegationVC);
              stopScanner();
            } catch (e) {
              setScanError('QRコードの形式が正しくありません');
            }
          },
          () => {
            // スキャン中（無視）
          }
        );
      } catch (err) {
        console.error('Scanner error:', err);
        setScanError('カメラの起動に失敗しました。カメラへのアクセスを許可してください。');
      }
    }, 100);
  };

  // QRスキャナー停止
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Stop scanner error:', err);
      }
    }
    setShowScanner(false);
  };

  // 画像ファイルからQRコードを読み取り
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanError('');
    setScanSuccess(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-file-reader');
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      // QRコードの内容を処理
      const delegationVC = JSON.parse(decodedText);

      // 委任状VCかどうかを検証
      if (delegationVC.type !== '委任状') {
        setScanError('これは委任状VCではありません');
        return;
      }

      // 被委任者DIDが自分のDIDと一致するかチェック
      if (delegationVC.delegate?.did !== did) {
        setScanError('この委任状は別のウォレット宛てです');
        return;
      }

      // 有効期限チェック
      const today = new Date().toISOString().split('T')[0];
      if (delegationVC.expiryDate < today) {
        setScanError('この委任状は有効期限が切れています');
        return;
      }

      // 保存
      onAddDelegationVC(delegationVC);
      setScanSuccess(delegationVC);
    } catch (e) {
      console.error('File scan error:', e);
      setScanError('QRコードを読み取れませんでした。画像を確認してください。');
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // コンポーネントアンマウント時にスキャナー停止
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3 mb-2">
          <WalletIcon className="w-8 h-8" />
          <h1 className="text-2xl font-bold">
            {ownerName ? `${ownerName}のウォレット` : 'マイウォレット'}
          </h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-blue-100 text-sm">デジタルアイデンティティウォレット</p>
          {isEditingName ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                onOwnerNameChange(editingName.trim());
                setIsEditingName(false);
              }}
            >
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="px-2 py-1 rounded text-sm text-gray-900 w-28"
                placeholder="名前を入力"
                autoFocus
              />
              <button
                type="submit"
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => { setIsEditingName(false); setEditingName(ownerName); }}
                className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
              >
                取消
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
            >
              表示名変更
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* DIDセクション */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">マイDID</h2>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <code className="text-sm text-gray-700 break-all flex-1">
                {did}
              </code>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex-shrink-0 p-2 hover:bg-gray-200 rounded transition-colors"
                  title="QRコード表示"
                >
                  <QrCodeIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleCopyDID}
                  className="flex-shrink-0 p-2 hover:bg-gray-200 rounded transition-colors"
                  title="DIDをコピー"
                >
                  {copied ? (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <CopyIcon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* QRコード表示 */}
            {showQR && (
              <div className="mt-4 flex flex-col items-center p-4 bg-white rounded-lg border">
                <QRCodeSVG value={did} size={150} />
                <p className="mt-2 text-xs text-gray-500">委任者にこのQRコードを見せてください</p>
              </div>
            )}
          </div>
        </div>

        {/* 委任状受け取りボタン */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={startScanner}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              <CameraIcon className="w-5 h-5" />
              <span>カメラでスキャン</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-all"
            >
              <FileTextIcon className="w-5 h-5" />
              <span>画像から読込</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {/* 画像ファイル読み取り用の非表示要素 */}
          <div id="qr-file-reader" className="hidden"></div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            委任状QRコードを受け取って代理ログインに使用できます
          </p>
        </div>

        {/* ファイル読み取りエラー表示 */}
        {scanError && !showScanner && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{scanError}</p>
          </div>
        )}

        {/* 保有証明書（身分証） */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500">
              保有証明書 ({vcs.length}件)
            </h2>
            {onAddIdentityVC && (
              <button
                onClick={onAddIdentityVC}
                className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
              >
                + 身分証を追加
              </button>
            )}
          </div>
          <div className="space-y-3">
            {vcs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CreditCardIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>保有している証明書はありません</p>
              </div>
            ) : (
              vcs.map((vc) => (
                <div
                  key={vc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <CreditCardIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {vc.type}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          発行者: {vc.issuer}
                        </p>
                        <p className="text-sm text-gray-600">
                          氏名: {vc.holderName}
                        </p>
                        <p className="text-sm text-gray-500">
                          発行日: {vc.issuedDate} / 有効期限: {vc.expiryDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 委任状VC */}
        {delegationVCs && delegationVCs.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              受領した委任状 ({delegationVCs.length}件)
            </h2>
            <div className="space-y-3">
              {delegationVCs.map((vc, index) => {
                const isExpired = vc.expiryDate < new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={vc.id || index}
                    className={`border rounded-lg p-4 ${
                      isExpired
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-purple-200 bg-purple-50 hover:border-purple-400'
                    } transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <FileTextIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${isExpired ? 'text-gray-400' : 'text-purple-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>
                            委任状
                          </h3>
                          {isExpired && (
                            <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                              期限切れ
                            </span>
                          )}
                          {!isExpired && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                              有効
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            委任者: {vc.issuer?.name || '不明'}
                          </p>
                          <p className="text-sm text-gray-600">
                            権限: {vc.scope?.join(', ') || '閲覧'}
                          </p>
                          {vc.purpose && (
                            <p className="text-sm text-gray-600">
                              目的: {vc.purpose}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            有効期限: {vc.expiryDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* QRスキャナーモーダル */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">委任状QRコードをスキャン</h3>
              <button
                onClick={stopScanner}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <div id="qr-reader" className="w-full" style={{ minHeight: '300px' }}></div>
              {scanError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{scanError}</p>
                </div>
              )}
              <p className="mt-4 text-sm text-gray-500 text-center">
                委任者が表示したQRコードをカメラにかざしてください
              </p>
            </div>
          </div>
        </div>
      )}

      {/* スキャン成功モーダル */}
      {scanSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">委任状を受け取りました</h3>
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">委任者:</span> {scanSuccess.issuer?.name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">権限:</span> {scanSuccess.scope?.join(', ')}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">有効期限:</span> {scanSuccess.expiryDate}
              </p>
            </div>
            <button
              onClick={() => setScanSuccess(null)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletHome;
