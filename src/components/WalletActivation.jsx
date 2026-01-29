import { useState } from 'react';
import { WalletIcon, CheckIcon } from './Icons';
import { generateDID, saveDIDToStorage } from '../utils/did';

/**
 * ウォレットアクティベーション画面
 * DID生成を含むアクティベーションフローを提供
 */
export default function WalletActivation({ onActivated }) {
  const [step, setStep] = useState('intro'); // intro | generating | done
  const [generatedDID, setGeneratedDID] = useState('');

  const handleActivate = () => {
    setStep('generating');

    // DID生成をシミュレート（プログレス演出）
    setTimeout(() => {
      const did = generateDID();
      saveDIDToStorage(did);
      setGeneratedDID(did);
      setStep('done');
    }, 2000);
  };

  const handleComplete = () => {
    onActivated(generatedDID);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <WalletIcon className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">デジタルウォレット</h1>
        <p className="text-blue-100 text-sm">
          {step === 'intro' && 'ウォレットをアクティベートして利用を開始します'}
          {step === 'generating' && 'DIDを生成しています...'}
          {step === 'done' && 'アクティベートが完了しました'}
        </p>
      </div>

      <div className="p-6">
        {/* Step: intro */}
        {step === 'intro' && (
          <div>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">DID（分散型識別子）の生成</p>
                  <p className="text-sm text-gray-500">あなた固有のデジタルIDが発行されます</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">身分証の登録</p>
                  <p className="text-sm text-gray-500">本人確認書類をVCとして登録します</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">利用開始</p>
                  <p className="text-sm text-gray-500">ウォレットを使った認証が可能になります</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleActivate}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              ウォレットをアクティベート
            </button>
          </div>
        )}

        {/* Step: generating */}
        {step === 'generating' && (
          <div className="py-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-700 font-medium mb-2">DIDを生成中...</p>
            <p className="text-sm text-gray-500">鍵ペアの生成と識別子の登録を行っています</p>
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
            <p className="text-center font-medium text-gray-900 mb-2">DIDが生成されました</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">あなたのDID</p>
              <code className="text-xs text-gray-700 break-all">{generatedDID}</code>
            </div>
            <button
              onClick={handleComplete}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              次へ：身分証を登録する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
