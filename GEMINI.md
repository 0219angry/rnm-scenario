# GEMINI.md

## 用語
- シナリオ
  マーダーミステリーやTRPGの作品のこと。指定された人数で集まり、プレイする。
- セッション
  特定のシナリオをプレイする会のこと。

## 設計

### モデル
// NextAuth.jsの公式定義
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String? @unique
  emailVerified DateTime?
  image         String?

  // シナリオ・セッションの所有
  scenarios     Scenario[]
  sessions      Session[]
  participations SessionParticipant[]

  accounts      Account[]
  sessionsAuth  SessionAuth[] @map("sessions") // PrismaのSessionと名前被り回避のため
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id])

  @@unique([provider, providerAccountId])
}

model SessionAuth {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// シナリオ管理機能
model Scenario {
  id            String    @id @default(cuid())
  title         String
  playerMin     Int
  playerMax     Int
  requiresGM    Boolean
  averageTime   Int       // 所要時間（分）
  distribution  String?   // 配布先URL
  isPublic      Boolean   @default(true)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 所有者
  owner         User      @relation(fields: [ownerId], references: [id])
  ownerId       String

  sessions      Session[]
}

model Session {
  id            String     @id @default(cuid())
  scenario      Scenario   @relation(fields: [scenarioId], references: [id])
  scenarioId    String

  scheduledAt   DateTime
  isFinished    Boolean    @default(false)
  notes         String?    // 感想や補足

  // 所有者（記録を残す人）
  owner         User       @relation(fields: [ownerId], references: [id])
  ownerId       String

  createdAt     DateTime   @default(now())

  participants  SessionParticipant[]
}

model SessionParticipant {
  session     Session   @relation(fields: [sessionId], references: [id])
  sessionId   String

  user        User      @relation(fields: [userId], references: [id])
  userId      String

  role        String?   // GM / キャラ名なども書ける♪

  @@id([sessionId, userId]) // セッション×ユーザで一意に
}

### アプリケーション
- トップページ
  - 新着シナリオの表示
  - ヘッダにログイン、サインアップボタンを表示
  - 直近に計画されているセッションのスケジュールを表示
- サインアップ
  - メールアドレス登録に対応する
  - ユーザ情報の入力を要求する
  - パスワード認証のみにするが、パスワードは平文保管しないようにする
- ログイン
  - メールアドレスとパスワードを入力してログインする
  - ログイン後、トップページに遷移する
- ログアウト
  - 右上にアカウントアイコンを置き、ポップアップメニューからログアウト
  - ログアウト後はトップページに遷移する
- シナリオ登録
  - 新規のシナリオを登録する
- シナリオ検索
  - `requireGM`や`playerMin`,`playerMax`をもとに検索できるようにする
- シナリオ管理
  - シナリオ登録における登録内容の修正を行う
- セッション作成
  - 登録済みのシナリオからセッションの予定を作成する
  - ユーザはセッションに参加申請を送信するか、招待を受け取ることで自身をセッションに登録する
  - また、参加登録されたユーザはセッションでの自分の役割を編集したり、自分視点のアーカイブ動画の登録や感想の入力ができるようになる
- セッション管理
  - セッション所有者はセッションを管理することができる
  - 管理では予定開始時間を変更、登録したりユーザの招待や追放を行うことができるほか、セッションの解散も可能
- 
### システム

#### 開発コマンド

- `npm run dev` - Turbopackを使用して開発サーバーを起動
- `npm run build` - 本番用にアプリケーションをビルド
- `npm run start` - 本番サーバーを起動

#### セットアップ
1. Dockerサービスを開始: `docker-compose up -d`
2. 依存関係をインストール: `npm install`
3. データベーススキーマの変更があれば`npx prisma migrate dev --name migration-name`
4. マイグレーションを適用 `npx prisma migrate dev --name add-session-participant`
5. クライアントを再生成`npx prisma generate`
6. 開発サーバーを起動: `npm run dev`

#### フレームワーク

- Next.js 15
  - App Router

#### スタイリング

- Tailwind CSS v4 with PostCSS
- フォントはGeist SansとGeist MonoがCSS変数として設定済み

#### 言語

- TypeScript
  - パスエイリアス（`@/*`はプロジェクトルートにマップ）を使用したStrictモードが有効

#### DB
- postgresql
- prisma
- ローカルではdockerイメージを利用
- productionではneonにDBを構築する

#### deploy
- Vercelにデプロイする

#### 認証

- サインアップあるいはログインに成功すると、`Login`データが作成され、その`token`がクッキー内に設定される。
- 各リクエストにおいて、設定された`token`を元にDB検索を行い、期限切れをしていない`Login`データが存在すれば、認証成功とする。
- ユーザー情報が必要な場合は、`Login.accountId`を元に引いてくることができる。
- ログアウト時は、`Login`データを削除する。
- `token`は発行時にURLパラメータにのみ設定してよく、データベースから取得してはならない。クッキーから取得した`token`を絞り込み条件で比較するのはOK。


#### 開発方針

- `app`配下はサーバーコンポーネントを置き、機能固有のクライアントコンポーネントは`components/features`配下に置いてimportする
- 通信はなるべくサーバーアクションで行い、サーバーコンポーネントからクライアントコンポーネントにインジェクトする