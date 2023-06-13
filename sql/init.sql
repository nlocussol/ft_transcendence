CREATE TYPE "match" AS(
  score	     INT[2],
  opponent   VARCHAR(50),
  winner     BOOLEAN
);

CREATE TYPE "message" AS(
  id       VARCHAR(50),
  msg      TEXT
);

CREATE TYPE "mp" AS(
  name        VARCHAR(50),
  message     TEXT []
);

CREATE TYPE "friend" AS(
  name        VARCHAR(50),
  bloqued     BOOLEAN
);

CREATE TYPE "stat" AS(
  matchs      INT,
  win	      INT,
  loose      INT
);

CREATE TABLE "user"  (
  id	      VARCHAR NOT NULL,
  name        VARCHAR(50) NOT NULL,
  password    VARCHAR(50) NOT NULL,
  pp          VARCHAR(250) DEFAULT 'path/to/some/default/pic',
  doubleAuth  BOOLEAN DEFAULT false,
  status      VARCHAR DEFAULT 'ONLINE',
  friends     friend [],
  room	      VARCHAR(50)[],
  stats       stat,
  history     match[],
  mp   	      message[]
);

CREATE TYPE "member" AS(
  id          VARCHAR(50),
  status      VARCHAR
);

CREATE TABLE "room"  (
  name        VARCHAR(50) NOT NULL,
  owner       VARCHAR(50) NOT NULL,
  password    VARCHAR(50),
  status      VARCHAR(50) DEFAULT 'PUBLIC',
  messages    message[],
  members     member[]
);

