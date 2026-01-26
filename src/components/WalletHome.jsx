import { useState } from 'react';
import { CopyIcon, CheckIcon, WalletIcon, CreditCardIcon } from './Icons';

/**
 * Walletのホーム画面コンポーネント
 * DIDと保有VCを表示
 */
function WalletHome({ did, vcs }) {
  const [copied, setCopied] = useState(false);

  const handleCopyDID = () => {
    navigator.clipboard.writeText(did);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3 mb-2">
          <WalletIcon className="w-8 h-8" />
          <h1 className="text-2xl font-bold">マイウォレット</h1>
        </div>
        <p className="text-blue-100 text-sm">デジタルアイデンティティウォレット</p>
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
        </div>

        {/* VCセクション */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            保有証明書 ({vcs.length}件)
          </h2>
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
      </div>
    </div>
  );
}

export default WalletHome;
