# wplace ドット絵変換ツール

ブラウザ上で画像を読み込み、指定したサイズ・範囲を **wplace対応パレット（31色）** に変換して  
ドット絵化するWebアプリケーションです。  
完全クライアントサイドで動作し、インターネット接続不要で利用可能です。

## 機能
- JPG / PNG 画像の読み込み
- ドット絵の横・縦サイズ指定
- マウスドラッグによる範囲選択
- wplaceパレット31色への最近傍色変換
- 変換結果の拡大プレビュー表示
- PNG形式でダウンロード

## デモ
GitHub Pagesで公開できます（例）  
https://mico3531.github.io/wplace-dottool/

## 使い方
1. 「画像を選択」ボタンからJPGまたはPNGファイルを読み込む
2. 横・縦のドット絵サイズを入力
3. 画像上でマウスドラッグして変換範囲を選択
4. 「変換実行」ボタンを押す
5. プレビューを確認して「ダウンロード」ボタンで保存

## ディレクトリ構成
wplace-dottool/
├── index.html # HTML本体
├── css/
│ └── style.css # スタイル定義
├── js/
│ ├── palette.js # wplaceパレット定義＆色変換関数
│ └── app.js # メインアプリ
└── README.md

## 開発環境 / 技術
- HTML5 / CSS3
- JavaScript (ES6+)
- HTML5 Canvas API
- GitHub Pages（無料ホスティング）

## ローカルでの動作確認
1. このリポジトリをダウンロードまたはクローン
2. `index.html` をブラウザで開く

## GitHub Pages での公開手順
1. GitHubにこのリポジトリを作成し、ソースをPush
2. GitHubリポジトリ設定(Settings) → Pages → "Branch" で `main` / `root` を選択
3. 数分後に `https://mico3531.github.io/wplace-dottool/` でアクセス可能

## ライセンス
MIT License