import { useState } from 'react';
import { WalletIcon, CheckIcon } from './Icons';
import { Wallet, ArrowLeft, Send } from './Icons';

/**
 * DID認証確認画面
 * ウォレットのDIDを使って認証要求に応答する
 */
export default function DIDAuthConfirm({ did, ownerName, onSubmit, onCancel }) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    // DIDだけを含むシンプルなオブジェクトを返す
    setTimeout(() => {
      onSubmit({ type: 'did-auth', did });
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Wallet className="w-8 h-8" />
          <h2 className="text-2xl font-bold">
            {ownerName ? `${ownerName} - DID認証` : 'DID認証'}
          </h2>
        </div>
        <p className="text-cyan-100">
          あなたのDIDでログインを要求しています
        </p>
      </div>

      <div className="p-6">
        {!confirmed ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                以下のDIDを使って認証します。よろしいですか？
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">あなたのDID</p>
                <code className="text-sm text-gray-700 break-all">{did}</code>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <p className="text-xs text-blue-700">
                DID認証ではDIDの所有証明のみを送信します。身分証の個人情報は送信されません。
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowLeft className="w-5 h-5" />
                  <span>キャンセル</span>
                </div>
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>認証する</span>
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-700 font-medium mb-2">認証情報を送信中...</p>
            <p className="text-sm text-gray-500">リダイレクトしています</p>
          </div>
        )}
      </div>
    </div>
  );
}
