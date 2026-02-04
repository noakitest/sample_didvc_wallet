import { useState, useEffect } from 'react';
import WalletSelection from './components/WalletSelection';
import WalletHome from './components/WalletHome';
import WalletActivation from './components/WalletActivation';
import IdentityVCRegistration from './components/IdentityVCRegistration';
import DIDAuthConfirm from './components/DIDAuthConfirm';
import { getDIDFromStorage } from './utils/did';

function App() {
  const [did, setDid] = useState('');
  const [vcs, setVcs] = useState([]);
  const [delegationVCs, setDelegationVCs] = useState([]);
  const [callbackUrl, setCallbackUrl] = useState('');
  const [requestId, setRequestId] = useState('');
  const [isVCProviderMode, setIsVCProviderMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // ウォレットの状態: 'activation' | 'vc-registration' | 'ready'
  const [walletState, setWalletState] = useState('activation');

  // ウォレットのオーナー名（デモで複数ウォレットを区別するため）
  const [ownerName, setOwnerName] = useState(() => {
    return localStorage.getItem('wallet_owner_name') || '';
  });

  const handleOwnerNameChange = (name) => {
    setOwnerName(name);
    localStorage.setItem('wallet_owner_name', name);
  };

  useEffect(() => {
    // 既存のDIDをチェック
    const existingDID = getDIDFromStorage();

    // 保存済みのVCを読み込む
    const savedVCs = localStorage.getItem('wallet_vcs');
    const savedDelegationVCs = localStorage.getItem('delegation_vcs');

    if (existingDID) {
      // アクティベート済み → 常にホームへ
      setDid(existingDID);

      if (savedVCs) {
        setVcs(JSON.parse(savedVCs));
      }
      setWalletState('ready');
    } else {
      // 未アクティベート
      setWalletState('activation');
    }

    if (savedDelegationVCs) {
      setDelegationVCs(JSON.parse(savedDelegationVCs));
    }

    // URLパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const callback = params.get('callback');
    const reqId = params.get('requestId');

    if (callback) {
      // VC提供モード（アクティベート済みの場合のみ機能）
      setIsVCProviderMode(true);
      setCallbackUrl(callback);
      setRequestId(reqId || '');
    }

    setLoading(false);
  }, []);

  // アクティベーション完了（DID生成済み）
  const handleActivated = (newDid) => {
    setDid(newDid);
    setWalletState('vc-registration');
  };

  // 身分証VC登録完了
  const handleVCRegistrationComplete = (allVCs) => {
    setVcs(allVCs);
    localStorage.setItem('wallet_vcs', JSON.stringify(allVCs));
    setWalletState('ready');
  };

  // VC登録をスキップ or 戻る
  const handleVCRegistrationSkip = () => {
    setWalletState('ready');
  };

  // ホームから身分証追加画面へ
  const handleAddIdentityVC = () => {
    setWalletState('vc-registration');
  };

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

  // VC提供モード（アクティベート済みの場合のみ）
  if (isVCProviderMode && walletState === 'ready') {
    // DID認証モード
    if (requestId === 'did-auth') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <DIDAuthConfirm
            did={did}
            ownerName={ownerName}
            onSubmit={handleVCSubmit}
            onCancel={handleCancel}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <WalletSelection
          vcs={vcs}
          delegationVCs={delegationVCs}
          requestId={requestId}
          ownerName={ownerName}
          onSubmit={handleVCSubmit}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {walletState === 'activation' && (
        <WalletActivation onActivated={handleActivated} />
      )}
      {walletState === 'vc-registration' && (
        <IdentityVCRegistration
          did={did}
          existingVCs={vcs}
          onComplete={handleVCRegistrationComplete}
          onSkip={handleVCRegistrationSkip}
        />
      )}
      {walletState === 'ready' && (
        <WalletHome
          did={did}
          vcs={vcs}
          delegationVCs={delegationVCs}
          ownerName={ownerName}
          onOwnerNameChange={handleOwnerNameChange}
          onAddDelegationVC={handleAddDelegationVC}
          onAddIdentityVC={handleAddIdentityVC}
        />
      )}
    </div>
  );
}

export default App;
