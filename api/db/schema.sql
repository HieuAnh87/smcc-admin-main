CREATE SCHEMA SMCC;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE SMCC."SOURCE_TYPE" AS ENUM(
  'WEBSITE',
  'GOOGLE_SEARCH_WEBSITE',
  'FB_PAGE',
  'FB_GROUP',
  'FB_ACCOUNT',
  'YOUTUBE'
);

CREATE TYPE SMCC."CONTENT_TYPE" AS ENUM('WEBSITE_POST', 'FB_POST', 'YOUTUBE');

CREATE TYPE SMCC."CONTENT_CATEGORY" AS ENUM(
  'AGENCY',
  'PROTENTIAL',
  'SHARING',
  'SPAM',
  'TinKhac'
);

CREATE TYPE SMCC."CAMPAIGN_TYPE" AS ENUM('COMMENT', 'REPORT');

CREATE TYPE SMCC."STATUS" AS ENUM('LIVE', 'DEAD', 'WAITING', 'ERROR');

CREATE TYPE SMCC."CAMPAIGN_STATUS" AS ENUM('CREATED', 'RUNNING', 'LOST', 'SUCCESS');

CREATE TYPE SMCC."USER_ROLES" AS ENUM('SUPER_ADMIN', 'MANAGER');

CREATE TABLE SMCC."topics"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(200) NOT NULL,
  "keywords" json [] NOT NULL,
  "totalContent" int DEFAULT 0,
  "likes" int DEFAULT 0,
  "shares" int DEFAULT 0,
  "comments" int DEFAULT 0,
  "screenShot" boolean DEFAULT FALSE,
  "isActiveCrawl" boolean DEFAULT FALSE,
  "lastSearchAt" timestamp with time zone,  
  "nextSearchGoogleAt" timestamp with time zone DEFAULT NOW() + interval '15 MINUTE',
  "intervalSearch" int DEFAULT 900000 CHECK (
    "intervalSearch" BETWEEN 900000
    AND 86400000
  ),
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "nextSearchFacebookAt" timestamp with time zone DEFAULT NOW() + interval '15 MINUTE',
  "nextSearchYoutubeAt" timestamp with time zone DEFAULT NOW() + interval '15 MINUTE',
  "searchKeywords" varchar [],
  "excludeKeywords" varchar []
);

CREATE TABLE SMCC."fbAccounts"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "fbId" varchar(200) NOT NULL DEFAULT '',
  "link" varchar(1000),
  "name" varchar(200),
  "email" varchar(200),
  "password" varchar(200) NOT NULL,
  "status" SMCC."STATUS" DEFAULT 'WAITING',
  "cookies" varchar(50000),
  "token" varchar(200),
  "location" varchar(200),
  "otp" varchar(200),
  "proxy" varchar(200),
  "device" varchar(200),
  "avatar" varchar(1000),
  "phone" varchar(15),
  "groupIds" varchar(20) [],
  "targetIds" varchar(200) [],
  "meta" json,
  "errorType" varchar(200),
  "firstRunAt" timestamp with time zone,
  "lastRunAt" timestamp with time zone,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE SMCC."sources"(
  "id" varchar(200) PRIMARY KEY DEFAULT uuid_generate_v4(),
  "link" varchar(1000) NOT NULL UNIQUE,
  "name" varchar(200) NOT NULL,
  "avatar" varchar(1000),
  "type" SMCC."SOURCE_TYPE" NOT NULL DEFAULT 'WEBSITE',
"status" SMCC."STATUS" NOT NULL DEFAULT 'LIVE',
"accountId" varchar(200),
"useProxy" boolean DEFAULT FALSE,
"countCantAccess" int DEFAULT 0,
"lastCrawledAt" timestamp with time zone DEFAULT NOW() - interval '2 DAY',
"totalContent" int DEFAULT 0,
"tagIds" uuid [],
"profileIds" uuid [],
"questionsToJoin" json [],
 "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
 "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "isCrawl" boolean DEFAULT FALSE,
  "metaInfo" json,
  "countDontHaveNegativeContent" int DEFAULT 0,
  
  "isQuality" boolean DEFAULT FALSE,
  -- Người dùng định nghĩa có phải là báo chính thống hay không
  -- Dem so lan khong vao duoc, khi qua 50 lan thi la web chet
  
  
  "ranking" int DEFAULT 0
);
ALTER TABLE
  SMCC."sources"
ADD
  "isTopic" boolean NOT NULL DEFAULT false;
ALTER TABLE
  SMCC."sources"
ADD
  "categoryId" varchar(2048) REFERENCES SMCC."categories"(id)
;

CREATE TABLE SMCC."authors"(
  "id" varchar(200) PRIMARY KEY DEFAULT uuid_generate_v4(),
  "link" varchar(1000) NOT NULL UNIQUE,
  "name" varchar(200) NOT NULL,
  "avatar" varchar(1000) NOT NULL,
  "gender" varchar(10),
  "birthDate" date,
  "address" varchar(200),
  "contact" varchar(200),
  "totalContent" int DEFAULT 0,
  "process" boolean DEFAULT FALSE,
  "tagIds" uuid [],
  "profileIds" uuid [],
  "detailInfo" json,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE SMCC."contents"(
  "id" varchar(2048) PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sourceId" varchar(200) NOT NULL REFERENCES SMCC."sources"(id) ON DELETE CASCADE,
  "authorId" varchar(200) REFERENCES SMCC."authors"(id),
  "topicIds" varchar(200) [] NOT NULL,
  "link" varchar(2048) NOT NULL UNIQUE,
  "type" SMCC."CONTENT_TYPE" NOT NULL DEFAULT 'WEBSITE_POST',
  "textContent" varchar NOT NULL,
  "renderedContent" varchar,
  "title" varchar DEFAULT '',
  -- textContentTsvec tsvector NOT NULL,
  "imageContents" json,
  "videoContents" json,
  "likes" int DEFAULT 0,
  "shares" int DEFAULT 0,
  "comments" int DEFAULT 0,
  "views" int DEFAULT 0,
  "totalReactions" int DEFAULT 0,
  "reactionsPerHour" real DEFAULT 0,
  "commentIds" varchar(200) [],
  "status" SMCC."STATUS" DEFAULT 'LIVE',
  "category" SMCC."CONTENT_CATEGORY" DEFAULT 'TinKhac',
  "postedAt" timestamp with time zone,
  "process" boolean DEFAULT FALSE,
  "screenShot" varchar,
  "tagIds" uuid [],
  "profileIds" uuid [],
  "editedTextContent" varchar,
  -- Noi dung tom tat cua bai dang
  "violationContent" varchar,
  -- Noi dung ma bai dang vi pham
  "violationEnactment" varchar,
  -- Dieu luat ma bai dang vi pham
  "meta" numeric,
  "metaInfo" json,
  "violationTimes" varchar(50),
  "userHandle" varchar(20) DEFAULT 'notHandle',
  --'notHandle','skippedPost','handledPost',
  "blockRequire" boolean DEFAULT FALSE,
  "viettelBlocked" boolean DEFAULT FALSE,
  "fptBlocked" boolean DEFAULT FALSE,
  "vnptBlocked" boolean DEFAULT FALSE,
  "idTeleGroup" int UNIQUE,
  "contentTeleNoti" varchar(2000) DEFAULT '',
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

ALTER TABLE
  SMCC."authors"
ADD
  "latestContentId" varchar(200) REFERENCES SMCC."contents"(id);


-- Lenh nay moi copy db vao khong loi bang chua tao da duoc references bang da tao
CREATE TABLE SMCC."_TopicsOnContents"(
  "contentId" varchar(2048) NOT NULL,
  "topicId" uuid NOT NULL,
  FOREIGN KEY ("topicId") REFERENCES SMCC."topics"(id) ON DELETE CASCADE,
  FOREIGN KEY ("contentId") REFERENCES SMCC."contents"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX "_TopicsOnContents_topic_content_unique" ON SMCC."_TopicsOnContents"("topicId" uuid_ops, "contentId" varchar_ops);

CREATE INDEX "_TopicsOnContents_content_index" ON SMCC."_TopicsOnContents"("contentId" varchar_ops);

CREATE TABLE SMCC."comments"(
  "id" varchar(200) PRIMARY KEY,
  "authorId" varchar(200) NOT NULL REFERENCES SMCC."authors"(id),
  "contentId" varchar(200) NOT NULL,
  "textContent" varchar,
  "imageContent" varchar(1000),
  "videoContent" varchar(1000),
  "link" varchar(1000) NOT NULL UNIQUE,
  "likes" int,
  "status" SMCC."STATUS" DEFAULT 'LIVE',
  "postedAt" timestamp,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_content FOREIGN KEY ("contentId") REFERENCES SMCC."contents"(id) ON DELETE CASCADE
);

CREATE TABLE SMCC."categories"(
  "id" varchar(2048) PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar
);

CREATE TABLE SMCC."campaigns"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(200) NOT NULL,
  "type" SMCC."CAMPAIGN_TYPE",
  "contentUrls" varchar(1000) [] NOT NULL,
  "interactions" int NOT NULL DEFAULT 10,
  "comments" varchar(1000) [],
  "status" SMCC."CAMPAIGN_STATUS" NOT NULL DEFAULT 'CREATED',
  "runCount" int NOT NULL DEFAULT 0,
  "startedAt" timestamp,
  "endedAt" timestamp,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE SMCC."users"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(200) NOT NULL,
  "email" varchar(200) UNIQUE NOT NULL,
  "password" varchar(200) NOT NULL,
  "roles" SMCC."USER_ROLES" [] NOT NULL,
  "workTime" varchar(30),
  "gender" varchar(10) NOT NULL,
  "telephone" varchar(15),
  "lock" boolean DEFAULT FALSE,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE SMCC."tokens"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "accessToken" varchar(200) UNIQUE NOT NULL,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE SMCC."tags"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(200) NOT NULL,
  "showOnPost" boolean DEFAULT FALSE,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE SMCC."profiles"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(200) NOT NULL,
  "description" varchar,
  "sourceIds" varchar(200) [],
  "authorIds" varchar(200) [],
  "contentIds" varchar(200) [],
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE SMCC."history"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid,
  "screen" varchar(50),
  "description" varchar,
  "teleInfo" json,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE SMCC."notifications"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "type" varchar(50) NOT NULL,
  "userId" uuid NOT NULL,
  "notifycationContent" varchar NOT NULL,
  "contentIds" varchar(200) [] NOT NULL,
  "seen" boolean DEFAULT FALSE,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE SMCC."settingNotify"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL UNIQUE,
  "telegram" varchar(50),
  "email" varchar(100),
  "webapp" boolean DEFAULT FALSE,
  "totalContentOnNotification" int DEFAULT 5,
  "notifyInWorkTime" boolean DEFAULT TRUE,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES SMCC."users"(id) ON DELETE CASCADE
);

CREATE TABLE SMCC."wordpressContents"(
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" varchar NOT NULL,
  "image" varchar NOT NULL,
  "content" varchar NOT NULL,
  "authorId" varchar(200) NOT NULL,
  "url" varchar UNIQUE,
  "targetUrl" varchar,
  "detailInfor" json,
  "createdAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_wordpress_content FOREIGN KEY ("authorId") REFERENCES SMCC."authors"(id) ON DELETE CASCADE
);

INSERT INTO
  SMCC."users"(id, name, email, PASSWORD, roles, gender)
VALUES
  (
    '119f8aca-51af-4f1b-a066-5b26271f3041',
    'admin',
    'admin@unestgroup.com',
    '$2b$09$SAaJnERwPfXqWN11v9s1jePfHCIOr4Z7cW8hU0iVXOu3Rmi2Q2g8K',
    ARRAY ['SUPER_ADMIN':: SMCC."USER_ROLES"],
    'Nam'
  );

-- password decrypt: adminunestgroup
INSERT INTO
  SMCC."settingNotify"("userId")
VALUES
  ('119f8aca-51af-4f1b-a066-5b26271f3041');

INSERT INTO
  SMCC."tags"(id, name)
VALUES
  (
    'bafe7c3e-106c-4ebd-89c8-27f64de0c668',
    'Tích cực'
  );

INSERT INTO
  SMCC."tags"(id, name)
VALUES
  (
    '878aa7a3-8691-49b9-8018-2159a8b55175',
    'Tiêu cực'
  );

INSERT INTO
  SMCC."tags"(id, name)
VALUES
  (
    '105a72e6-7a82-47ad-b383-e46252ae95f3',
    'Bình thường'
  );

-- CREATE INDEX contents_index ON SMCC.contents USING GIN (textContentTsvec);

ALTER TABLE
  SMCC."sources"
ADD
  "categoryId" varchar(2048) REFERENCES SMCC."categories"(id);