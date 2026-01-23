import { useState, useEffect } from 'react';
import WalletSelection from './components/WalletSelection';

// モックVCデータ
const MOCK_VCS = [
  {
    id: 'vc-001',
    type: '運転免許証',
    issuer: '東京都公安委員会',
    issuedDate: '2020-04-01',
    expiryDate: '2027-05-15',
    holderName: '山田 太郎',
    birthDate: '1990-05-15',
    address: '東京都渋谷区神宮前1-2-3',
    did: 'did:example:123456789abcdefghi'
  },
  {
    id: 'vc-002',
    type: 'マイナンバーカード',
    issuer: 'デジタル庁',
    issuedDate: '2021-06-01',
    expiryDate: '2031-06-01',
    holderName: '山田 太郎',
    birthDate: '1990-05-15',
    address: '東京都新宿区西新宿2-8-1',
    did: 'did:example:123456789abcdefghi'
  }
];

function App() {
  const [callbackUrl, setCallbackUrl] = useState('');
  const [requestId, setRequestId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // URLパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const callback = params.get('callback');
    const reqId = params.get('requestId');

    if (!callback) {
      setError('コールバックURLが指定されていません');
      return;
    }

    setCallbackUrl(callback);
    setRequestId(reqId || '');
  }, []);

  const handleVCSubmit = (selectedVC) => {
    if (!selectedVC) {
      setError('VCが選択されていません');
      return;
    }

    // VCデータをBase64エンコード
    const vcData = btoa(encodeURIComponent(JSON.stringify(selectedVC)));

    // コールバックURLにリダイレクト
    const redirectUrl = new URL(callbackUrl);
    redirectUrl.searchParams.set('vcData', vcData);
    if (requestId) {
      redirectUrl.searchParams.set('requestId', requestId);
    }

    window.location.href = redirectUrl.toString();
  };

  const handleCancel = () => {
    // キャンセル時はvcDataなしでリダイレクト
    const redirectUrl = new URL(callbackUrl);
    if (requestId) {
      redirectUrl.searchParams.set('requestId', requestId);
    }
    redirectUrl.searchParams.set('cancelled', 'true');

    window.location.href = redirectUrl.toString();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-2">エラー</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!callbackUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <WalletSelection
        vcs={MOCK_VCS}
        onSubmit={handleVCSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default App;
