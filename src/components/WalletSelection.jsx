import { useState } from 'react';
import { Wallet, CreditCard, CheckCircle, ArrowLeft, Send } from './Icons';

export default function WalletSelection({ vcs, onSubmit, onCancel }) {
  const [selectedVC, setSelectedVC] = useState(null);

  const handleSubmit = () => {
    if (selectedVC) {
      onSubmit(selectedVC);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Wallet className="w-8 h-8" />
          <h2 className="text-2xl font-bold">デジタルウォレット</h2>
        </div>
        <p className="text-purple-100">本人確認のため、身分証VCを選択してください</p>
      </div>

      {/* VC一覧 */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">保有している身分証VC</h3>
          <p className="text-sm text-gray-600">提出する身分証を選択してください</p>
        </div>

        <div className="space-y-4">
          {vcs.map((vc) => (
            <div
              key={vc.id}
              onClick={() => setSelectedVC(vc)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedVC?.id === vc.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center ${
                  vc.type === '運転免許証' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <CreditCard className={vc.type === '運転免許証' ? 'text-green-600' : 'text-blue-600'} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{vc.type}</h4>
                    {selectedVC?.id === vc.id && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">選択中</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">発行者</p>
                      <p className="text-gray-900 font-medium">{vc.issuer}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">発行日</p>
                      <p className="text-gray-900">{vc.issuedDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">氏名</p>
                      <p className="text-gray-900">{vc.holderName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">有効期限</p>
                      <p className="text-gray-900">{vc.expiryDate}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">DID</p>
                      <p className="text-gray-900 font-mono text-xs break-all">{vc.did}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex space-x-3">
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
            onClick={handleSubmit}
            disabled={!selectedVC}
            className={`flex-1 px-6 py-3 font-medium rounded-lg transition-colors ${
              selectedVC
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Send className="w-5 h-5" />
              <span>VCを提出</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
