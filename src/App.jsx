import { useState, useEffect } from 'react';
import WalletSelection from './components/WalletSelection';
import WalletHome from './components/WalletHome';
import { initializeDID } from './utils/did';

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
    did: ''
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
    did: ''
  }
];

function App() {
  const [did, setDid] = useState('');
  const [vcs, setVcs] = useState([]);
  const [delegationVCs, setDelegationVCs] = useState([]);
  const [callbackUrl, setCallbackUrl] = useState('');
  const [requestId, setRequestId] = useState('');
  const [isVCProviderMode, setIsVCProviderMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DIDを初期化
    const walletDid = initializeDID();
    setDid(walletDid);

    // VCデータにDIDを設定
    const vcsWithDid = MOCK_VCS.map(vc => ({ ...vc, did: walletDid }));
    setVcs(vcsWithDid);

    // 保存済みの委任状VCを読み込む
    const savedDelegationVCs = localStorage.getItem('delegation_vcs');
    if (savedDelegationVCs) {
      setDelegationVCs(JSON.parse(savedDelegationVCs));
    }

    // URLパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const callback = params.get('callback');
    const reqId = params.get('requestId');

    if (callback) {
      // VC提供モード
      setIsVCProviderMode(true);
      setCallbackUrl(callback);
      setRequestId(reqId || '');
    }

    setLoading(false);
  }, []);

  // 委任状VCを追加
  const handleAddDelegationVC = (delegationVC) => {
    const newDelegationVCs = [...delegationVCs, delegationVC];
    setDelegationVCs(newDelegationVCs);
    localStorage.setItem('delegation_vcs', JSON.stringify(newDelegationVCs));
  };

  const handleVCSubmit = (selectedVC) => {
    if (!selectedVC) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {isVCProviderMode ? (
        <WalletSelection
          vcs={vcs}
          delegationVCs={delegationVCs}
          requestId={requestId}
          onSubmit={handleVCSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <WalletHome
          did={did}
          vcs={vcs}
          delegationVCs={delegationVCs}
          onAddDelegationVC={handleAddDelegationVC}
        />
      )}
    </div>
  );
}

export default App;
