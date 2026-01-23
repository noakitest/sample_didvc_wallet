# Wallet Service

デジタルウォレットサービス - VC（Verifiable Credentials）選択・提出用の独立サービス

## 概要

このサービスは、ユーザーマイページアプリケーションから分離された独立したウォレットサービスです。
ユーザーがVC（身分証明書）を選択・提出する機能を提供します。

## 技術スタック

- **React**: 18.x
- **Vite**: 7.x
- **Tailwind CSS**: 3.x
- **ポート**: 3001

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（ポート3001）
npm run dev
```

## 使用方法

### URLパラメータ

ウォレットサービスは以下のURLパラメータを受け取ります：

- `callback`: リダイレクト先のURL（必須）
- `requestId`: リクエストID（オプション）

**例:**
```
http://localhost:3001?callback=http://localhost:5173&requestId=login
```

### リダイレクト時のパラメータ

VCを選択・提出後、コールバックURLにリダイレクトします：

**成功時:**
```
{callback}?vcData={Base64エンコードされたVCデータ}&requestId={リクエストID}
```

**キャンセル時:**
```
{callback}?cancelled=true&requestId={リクエストID}
```

## モックVCデータ

以下の2つのVCがハードコードされています：

1. **運転免許証**
   - 発行者: 東京都公安委員会
   - 住所: 東京都渋谷区神宮前1-2-3

2. **マイナンバーカード**
   - 発行者: デジタル庁
   - 住所: 東京都新宿区西新宿2-8-1

## ファイル構成

```
wallet-service/
├── src/
│   ├── components/
│   │   ├── Icons.jsx           # アイコンコンポーネント
│   │   └── WalletSelection.jsx # VC選択画面
│   ├── App.jsx                  # メインアプリケーション
│   ├── main.jsx                 # エントリーポイント
│   └── index.css                # Tailwind CSS
├── vite.config.js               # Vite設定（ポート3001）
└── tailwind.config.js           # Tailwind CSS設定
```
