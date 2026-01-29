import { useState } from 'react';
import { CreditCardIcon, CheckIcon, WalletIcon } from './Icons';

// 登録可能な身分証タイプ
const ID_TYPES = [
  {
    key: 'drivers-license',
    label: '運転免許証',
    issuer: '東京都公安委員会',
    color: 'green',
  },
  {
    key: 'mynumber',
    label: 'マイナンバーカード',
    issuer: 'デジタル庁',
    color: 'blue',
  },
];

/**
 * 身分証VC登録コンポーネント（アクティベート後のモック登録フロー）
 * @param {string} did - ウォレットのDID
 * @param {Array} existingVCs - 既に登録済みのVC一覧
 * @param {function} onComplete - 登録完了時コールバック（全VCを返す）
 * @param {function|null} onSkip - スキップ/戻るボタン押下時コールバック
 */
export default function IdentityVCRegistration({ did, existingVCs = [], onComplete, onSkip }) {
  const [step, setStep] = useState('select'); // select | confirm | verifying | done
  const [selectedType, setSelectedType] = useState(null);
  const [newVCs, setNewVCs] = useState([]);

  // 既存 + 今回登録分を合わせた全VC
  const allVCs = [...existingVCs, ...newVCs];

  // 身分証タイプを選択
  const handleSelect = (idType) => {
    setSelectedType(idType);
    setStep('confirm');
  };

  // 登録実行
  const handleRegister = () => {
    setStep('verifying');

    // 検証・登録をシミュレート
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const expiryYear = new Date().getFullYear() + 5;
      const expiryDate = `${expiryYear}-${today.slice(5)}`;

      const newVC = {
        id: `vc-${Date.now()}`,
        type: selectedType.label,
        issuer: selectedType.issuer,
        issuedDate: today,
        expiryDate: expiryDate,
        holderName: '山田 太郎',
        birthDate: '1990-05-15',
        address: selectedType.key === 'drivers-license'
          ? '東京都渋谷区神宮前1-2-3'
          : '東京都新宿区西新宿2-8-1',
        did: did,
      };

      setNewVCs(prev => [...prev, newVC]);
      setStep('done');
    }, 2500);
  };

  // 別の身分証を追加登録
  const handleAddAnother = () => {
    setSelectedType(null);
    setStep('select');
  };

  // 登録完了して利用開始
  const handleFinish = () => {
    onComplete([...existingVCs, ...newVCs]);
  };

  // 未登録のタイプだけフィルタ（既存 + 今回登録分の両方を考慮）
  const availableTypes = ID_TYPES.filter(
    t => !allVCs.some(vc => vc.type === t.label)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <CreditCardIcon className="w-8 h-8" />
          <h1 className="text-xl font-bold">身分証VCの登録</h1>
        </div>
        <p className="text-emerald-100 text-sm">
          本人確認書類をVerifiable Credentialとして登録します
        </p>
      </div>

      <div className="p-6">
        {/* Step: select */}
        {step === 'select' && (
          <div>
            {allVCs.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  {allVCs.length}件の身分証を登録済み
                </p>
              </div>
            )}

            {availableTypes.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  登録する身分証を選択してください
                </p>
                <div className="space-y-3">
                  {availableTypes.map((idType) => (
                    <button
                      key={idType.key}
                      onClick={() => handleSelect(idType)}
                      className="w-full text-left border-2 border-gray-200 rounded-lg p-4 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          idType.color === 'green' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <CreditCardIcon className={`w-6 h-6 ${
                            idType.color === 'green' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{idType.label}</p>
                          <p className="text-sm text-gray-500">発行: {idType.issuer}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                登録可能な身分証がすべて登録されています
              </p>
            )}

            <div className="mt-4 space-y-2">
              {newVCs.length > 0 && (
                <button
                  onClick={handleFinish}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  {existingVCs.length > 0 ? 'ウォレットに戻る' : 'ウォレットを利用開始'}
                </button>
              )}
              {onSkip && newVCs.length === 0 && (
                <button
                  onClick={onSkip}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {existingVCs.length > 0 ? 'ウォレットに戻る' : 'スキップして利用開始'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step: confirm */}
        {step === 'confirm' && selectedType && (
          <div>
            <p className="text-sm text-gray-600 mb-4">以下の内容で身分証VCを登録します</p>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">証明書タイプ</p>
                  <p className="font-medium text-gray-900">{selectedType.label}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">発行機関</p>
                  <p className="font-medium text-gray-900">{selectedType.issuer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">氏名</p>
                  <p className="font-medium text-gray-900">山田 太郎</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">生年月日</p>
                  <p className="font-medium text-gray-900">1990年5月15日</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">住所</p>
                  <p className="font-medium text-gray-900">
                    {selectedType.key === 'drivers-license'
                      ? '東京都渋谷区神宮前1-2-3'
                      : '東京都新宿区西新宿2-8-1'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">紐付けDID</p>
                  <code className="text-xs text-gray-700 break-all">{did}</code>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedType(null); setStep('select'); }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleRegister}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
              >
                登録する
              </button>
            </div>
          </div>
        )}

        {/* Step: verifying */}
        {step === 'verifying' && (
          <div className="py-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-700 font-medium mb-2">身分証を検証中...</p>
            <p className="text-sm text-gray-500">発行機関への照会とVC発行を行っています</p>
          </div>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <p className="text-center font-medium text-gray-900 mb-1">身分証VCの登録完了</p>
            <p className="text-center text-sm text-gray-500 mb-4">
              {selectedType?.label}がウォレットに追加されました
            </p>

            {/* 登録済みVC一覧 */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
              <p className="text-xs text-gray-500 mb-2">登録済みの身分証</p>
              {allVCs.map((vc) => (
                <div key={vc.id} className="flex items-center gap-2 py-1">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">{vc.type}</span>
                  <span className="text-xs text-gray-400">({vc.issuer})</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {availableTypes.length > 0 && (
                <button
                  onClick={handleAddAnother}
                  className="w-full px-4 py-3 border-2 border-emerald-300 text-emerald-700 font-medium rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  別の身分証も登録する
                </button>
              )}
              <button
                onClick={handleFinish}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <WalletIcon className="w-5 h-5" />
                  <span>{existingVCs.length > 0 ? 'ウォレットに戻る' : 'ウォレットを利用開始'}</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
