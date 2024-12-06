-- Étape 1 : Créer le type énuméré pour les notifications s'il n'existe pas déjà
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notif_type') THEN
        CREATE TYPE enum_notif_type AS ENUM ('LIKE', 'UNLIKE', 'MATCH', 'NEW_MESSAGE', 'NEW_VISIT');
    END IF;
END$$;

DROP TABLE IF EXISTS "blocked_users";
DROP SEQUENCE IF EXISTS blocked_users_id_seq;
CREATE SEQUENCE blocked_users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."blocked_users" (
    "id" integer DEFAULT nextval('blocked_users_id_seq') NOT NULL,
    "blocker_id" integer NOT NULL,
    "blocked_id" integer NOT NULL,
    "blocked_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "blocked_users_pk" PRIMARY KEY ("id"),
    CONSTRAINT "blocked_users_pk_2" UNIQUE ("blocker_id", "blocked_id")
) WITH (oids = false);

TRUNCATE "blocked_users";

SELECT setval('blocked_users_id_seq', (SELECT MAX(id) FROM blocked_users));


DROP TABLE IF EXISTS "fake_user_reporting";
DROP SEQUENCE IF EXISTS fake_user_reporting_id_seq;
CREATE SEQUENCE fake_user_reporting_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."fake_user_reporting" (
    "id" integer DEFAULT nextval('fake_user_reporting_id_seq') NOT NULL,
    "user_who_reported" integer NOT NULL,
    "reported_user" integer NOT NULL,
    "reported_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fake_user_reporting_pk" PRIMARY KEY ("id"),
    CONSTRAINT "fake_user_reporting_pk_2" UNIQUE ("user_who_reported", "reported_user")
) WITH (oids = false);

TRUNCATE "fake_user_reporting";

SELECT setval('fake_user_reporting_id_seq', (SELECT MAX(id) FROM fake_user_reporting));


DROP TABLE IF EXISTS "genders" CASCADE;
DROP SEQUENCE IF EXISTS gender_gender_id_seq;
CREATE SEQUENCE gender_gender_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."genders" (
    "gender_id" integer DEFAULT nextval('gender_gender_id_seq') NOT NULL,
    "name" character varying(32) NOT NULL,
    "description" character varying,
    CONSTRAINT "gender_name_gender_key" UNIQUE ("name"),
    CONSTRAINT "gender_pkey" PRIMARY KEY ("gender_id")
) WITH (oids = false);

TRUNCATE "genders";
INSERT INTO "genders" ("gender_id", "name", "description") VALUES
(5,	'Male',	'Identifies as male'),
(6,	'Female',	'Identifies as female'),
(7,	'Transgender (MTF)',	'Assigned male at birth, identifies as female'),
(8,	'Transgender (FTM)',	'Assigned female at birth, identifies as male');

-- INSERT INTO "genders" ("gender_id", "name", "description") VALUES
-- (5,	'Male',	'Identifies as male'),
-- (6,	'Female',	'Identifies as female'),
-- (7,	'Transgender (MTF)',	'Assigned male at birth, identifies as female'),
-- (8,	'Transgender (FTM)',	'Assigned female at birth, identifies as male'),


SELECT setval('gender_gender_id_seq', (SELECT MAX(gender_id) FROM genders));


DROP TABLE IF EXISTS "likes";
DROP SEQUENCE IF EXISTS likes_like_id_seq;
CREATE SEQUENCE likes_like_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."likes" (
    "like_id" integer DEFAULT nextval('likes_like_id_seq') NOT NULL,
    "user" integer NOT NULL,
    "user_liked" integer NOT NULL,
    CONSTRAINT "likes_pk" UNIQUE ("user_liked", "user"),
    CONSTRAINT "likes_pk_2" PRIMARY KEY ("like_id")
) WITH (oids = false);

TRUNCATE "likes";
SELECT setval('likes_like_id_seq', (SELECT MAX(like_id) FROM likes));


DROP TABLE IF EXISTS "unlikes";
DROP SEQUENCE IF EXISTS unlikes_unlike_id_seq;
CREATE SEQUENCE unlikes_unlike_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."unlikes" (
    "unlike_id" integer DEFAULT nextval('unlikes_unlike_id_seq') NOT NULL,
    "user" integer NOT NULL,
    "user_unliked" integer NOT NULL,
    CONSTRAINT "unlikes_pk" UNIQUE ("user_unliked", "user"),
    CONSTRAINT "unlikes_pk_2" PRIMARY KEY ("unlike_id")
) WITH (oids = false);

TRUNCATE "unlikes";
SELECT setval('unlikes_unlike_id_seq', (SELECT MAX(unlike_id) FROM unlikes));


DROP TABLE IF EXISTS "locations";
DROP SEQUENCE IF EXISTS locations_location_id_seq;
CREATE SEQUENCE locations_location_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."locations" (
    "location_id" integer DEFAULT nextval('locations_location_id_seq') NOT NULL,
    "latitude" numeric NOT NULL,
    "longitude" numeric NOT NULL,
    "city_name" character varying(100),
    CONSTRAINT "locations_pk" PRIMARY KEY ("location_id"),
    CONSTRAINT "locations_pk_3" UNIQUE ("longitude", "latitude", "city_name")
) WITH (oids = false);

TRUNCATE "locations";

SELECT setval('locations_location_id_seq', (SELECT MAX(location_id) FROM locations));


DROP TABLE IF EXISTS "matches";
DROP SEQUENCE IF EXISTS matches_match_id_seq;
CREATE SEQUENCE matches_match_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."matches" (
    "match_id" integer DEFAULT nextval('matches_match_id_seq') NOT NULL,
    "user_1" integer NOT NULL,
    "user_2" integer NOT NULL,
    "matched_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "matches_pk" UNIQUE ("user_1", "user_2"),
    CONSTRAINT "matches_pk_2" PRIMARY KEY ("match_id")
) WITH (oids = false);

TRUNCATE "matches";

SELECT setval('matches_match_id_seq', (SELECT MAX(match_id) FROM matches));

DROP TABLE IF EXISTS "messages";
DROP SEQUENCE IF EXISTS messages_message_id_seq;
CREATE SEQUENCE messages_message_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."messages" (
    "message_id" integer DEFAULT nextval('messages_message_id_seq') NOT NULL,
    "content" character varying(500) NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "owner_user" integer NOT NULL,
    "target_user" integer NOT NULL,
    "is_liked" boolean DEFAULT false NOT NULL,
    CONSTRAINT "messages_pk" PRIMARY KEY ("message_id")
) WITH (oids = false);

TRUNCATE "messages";

SELECT setval('messages_message_id_seq', (SELECT MAX(message_id) FROM messages));


DROP TABLE IF EXISTS "unread_user_message";
DROP SEQUENCE IF EXISTS messages_user_unread_id_seq;
CREATE SEQUENCE messages_user_unread_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."unread_user_message" (
    "unread_user_message_id" integer DEFAULT nextval('messages_user_unread_id_seq') NOT NULL,
    "owner_message_user" integer NOT NULL,
    "target_message_user" integer NOT NULL,
    CONSTRAINT "messages_user_unread_pk" PRIMARY KEY ("unread_user_message_id"),
    CONSTRAINT "unique_owner_target" UNIQUE ("owner_message_user", "target_message_user")
) WITH (oids = false);

TRUNCATE "unread_user_message";

SELECT setval('messages_user_unread_id_seq', (SELECT MAX(unread_user_message_id) FROM unread_user_message));


DROP TABLE IF EXISTS "notifications";
DROP SEQUENCE IF EXISTS notifications_notification_id_seq;
CREATE SEQUENCE notifications_notification_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."notifications" (
    "notification_id" integer DEFAULT nextval('notifications_notification_id_seq') NOT NULL,
    "target_user" integer NOT NULL,
    "has_read" boolean DEFAULT false NOT NULL,
    "notified_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "type" enum_notif_type NOT NULL,
    "source_user" integer NOT NULL,
    "source_username" character varying(500) NOT NULL,
    CONSTRAINT "notifications_pk" PRIMARY KEY ("notification_id")
) WITH (oids = false);

COMMENT ON COLUMN "public"."notifications"."target_user" IS 'user concerné qui doit recevoir la notif';

COMMENT ON COLUMN "public"."notifications"."source_user" IS 'Quel user est à l''origine de la notification';

TRUNCATE "notifications";

SELECT setval('notifications_notification_id_seq', (SELECT MAX(notification_id) FROM notifications));


DROP TABLE IF EXISTS "photos";
DROP SEQUENCE IF EXISTS picture_picture_id_seq;
CREATE SEQUENCE picture_picture_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."photos" (
    "photo_id" integer DEFAULT nextval('picture_picture_id_seq') NOT NULL,
    "url" character varying(255) NOT NULL,
    "description" character varying(255),
    "owner_user_id" integer NOT NULL,
    CONSTRAINT "picture_pkey" PRIMARY KEY ("photo_id")
) WITH (oids = false);

TRUNCATE "photos";
SELECT setval('picture_picture_id_seq', (SELECT MAX(photo_id) FROM photos));

DROP TABLE IF EXISTS "profile_sexual_preferences";
DROP SEQUENCE IF EXISTS profile_sexual_preferences_id_seq;
CREATE SEQUENCE profile_sexual_preferences_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."profile_sexual_preferences" (
    "id" integer DEFAULT nextval('profile_sexual_preferences_id_seq') NOT NULL,
    "profile_id" integer NOT NULL,
    "gender_id" integer NOT NULL,
    CONSTRAINT "profile_sexual-preference_pk_id" PRIMARY KEY ("id"),
    CONSTRAINT "profile_sexual-preference_pk_pair-gender-profile" UNIQUE ("gender_id", "profile_id")
) WITH (oids = false);

TRUNCATE "profile_sexual_preferences";
SELECT setval('profile_sexual_preferences_id_seq', (SELECT MAX(id) FROM profile_sexual_preferences));

DROP TABLE IF EXISTS "profile_tag";
DROP SEQUENCE IF EXISTS profile_tag_id_seq;
CREATE SEQUENCE profile_tag_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."profile_tag" (
    "id" integer DEFAULT nextval('profile_tag_id_seq') NOT NULL,
    "profile_id" bigint NOT NULL,
    "profile_tag" bigint NOT NULL,
    CONSTRAINT "profile_tag_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profile_tag_pk_1" UNIQUE ("profile_id", "profile_tag")
) WITH (oids = false);

TRUNCATE "profile_tag";
SELECT setval('profile_tag_id_seq', (SELECT MAX(id) FROM profile_tag));


DROP TABLE IF EXISTS "profiles";
DROP SEQUENCE IF EXISTS profile_profile_id_seq;
CREATE SEQUENCE profile_profile_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."profiles" (
    "profile_id" integer DEFAULT nextval('profile_profile_id_seq') NOT NULL,
    "owner_user_id" bigint NOT NULL,
    "biography" character varying(1024) NOT NULL,
    "gender" integer NOT NULL,
    "age" integer CHECK ("age" >= 18 AND "age" <= 120),
    "main_photo_id" integer,
    "location" integer,
    "last_connection" timestamp,
    "fame_rating" numeric DEFAULT 0,
    CONSTRAINT "profile_onwer_user_id_key" UNIQUE ("owner_user_id"),
    CONSTRAINT "profile_pkey" PRIMARY KEY ("profile_id")
) WITH (oids = false);

COMMENT ON COLUMN "public"."profiles"."location" IS 'Contient les coordonnées GPS du quartier utilisateur';

TRUNCATE "profiles";
SELECT setval('profile_profile_id_seq', (SELECT MAX(profile_id) FROM profiles));

DROP TABLE IF EXISTS "sso_type";
DROP SEQUENCE IF EXISTS sso_type_sso_id_seq;
CREATE SEQUENCE sso_type_sso_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."sso_type" (
    "sso_id" integer DEFAULT nextval('sso_type_sso_id_seq') NOT NULL,
    "name" character varying(50) NOT NULL,
    CONSTRAINT "sso_type_pk" PRIMARY KEY ("sso_id"),
    CONSTRAINT "sso_type_pk_2" UNIQUE ("name")
) WITH (oids = false);

COMMENT ON TABLE "public"."sso_type" IS 'stocker les differents type de SSO pris en charge (facebook + google ?)';

TRUNCATE "sso_type";

SELECT setval('sso_type_sso_id_seq', (SELECT MAX(sso_id) FROM sso_type));


DROP TABLE IF EXISTS "tags";
DROP SEQUENCE IF EXISTS tag_tag_id_seq;
CREATE SEQUENCE tag_tag_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."tags" (
    "tag_id" integer DEFAULT nextval('tag_tag_id_seq') NOT NULL,
    "tag_name" character varying(50) NOT NULL,
    CONSTRAINT "tag_pkey" PRIMARY KEY ("tag_id")
) WITH (oids = false);

TRUNCATE "tags";
INSERT INTO "tags" ("tag_id", "tag_name") VALUES
(1,	'Adventurous'),
(2,	'Animal lover'),
(3,	'Artistic'),
(4,	'Athletic'),
(5,	'Bookworm'),
(6,	'Career-focused'),
(7,	'Cat lover'),
(8,	'Cooking enthusiast'),
(9,	'Coffee lover'),
(10,	'Creative'),
(11,	'Dancer'),
(12,	'Dog lover'),
(13,	'Environmentalist'),
(14,	'Family-oriented'),
(15,	'Fashionable'),
(16,	'Fitness enthusiast'),
(17,	'Foodie'),
(18,	'Free spirit'),
(19,	'Gamer'),
(20,	'Gardener'),
(21,	'Geek'),
(22,	'Health-conscious'),
(23,	'Homebody'),
(24,	'Intellectual'),
(25,	'Introverted'),
(26,	'LGBTQ+ ally'),
(27,	'Life of the party'),
(28,	'Music lover'),
(29,	'Nature lover'),
(30,	'Night owl'),
(31,	'Outdoor enthusiast'),
(32,	'Pet lover'),
(33,	'Photographer'),
(34,	'Political'),
(35,	'Spiritual'),
(36,	'Sports fan'),
(37,	'Tech-savvy'),
(38,	'Traveler'),
(39,	'Vegan'),
(40,	'Vegetarian'),
(41,	'Volunteer'),
(42,	'Wine enthusiast'),
(43,	'Yogi'),
(44,	'Movie buff'),
(45,	'DIY lover'),
(46,	'Minimalist'),
(47,	'Social butterfly'),
(48,	'Workaholic'),
(49,	'Adrenaline junkie'),
(50,	'Blogger'),
(51,	'Cyclist'),
(52,	'Entrepreneur'),
(53,	'Fitness trainer'),
(54,	'History buff'),
(55,	'Journalist'),
(56,	'Marathon runner'),
(57,	'Musician'),
(58,	'Painter'),
(59,	'Photo Artist'),
(60,	'Reader'),
(61,	'Rock climber'),
(62,	'Sculptor'),
(63,	'Singer'),
(64,	'Surfer'),
(65,	'Teacher'),
(66,	'Globetrotter'),
(67,	'Writer'),
(68,	'Yoga instructor'),
(69,	'Zoologist'),
(70,	'Anime fan'),
(71,	'Board gamer'),
(72,	'Comic book fan'),
(73,	'Cosplayer'),
(74,	'Fantasy lover'),
(75,	'Manga reader'),
(76,	'Movie geek'),
(77,	'PC gamer'),
(78,	'Role-playing gamer'),
(79,	'Sci-fi enthusiast'),
(80,	'Streamer'),
(81,	'Tabletop gamer'),
(82,	'Tech innovator'),
(83,	'Tech startup'),
(84,	'VR enthusiast'),
(85,	'Retro gamer'),
(86,	'E-sports fan'),
(87,	'Programmer'),
(88,	'Hacker'),
(89,	'Robotics enthusiast'),
(90,	'Gadget lover'),
(91,	'App developer'),
(92,	'Web developer'),
(93,	'Cybersecurity'),
(94,	'Data scientist'),
(95,	'AI enthusiast'),
(96,	'Blockchain enthusiast'),
(97,	'Cryptocurrency trader'),
(98,	'Piano lover'),
(99,	'Guitarist'),
(100,	'Drummer'),
(101,	'Violinist'),
(102,	'DJ'),
(103,	'Classical music lover'),
(104,	'Jazz enthusiast'),
(105,	'Rock music fan'),
(106,	'Pop music lover'),
(107,	'Hip-hop fan'),
(108,	'Electronic music fan'),
(109,	'Blues lover'),
(110,	'Country music fan'),
(111,	'Opera enthusiast'),
(112,	'Folk music lover'),
(113,	'Heavy metal fan'),
(114,	'Singer-songwriter'),
(115,	'Karaoke enthusiast'),
(116,	'Band member'),
(117,	'Choir singer'),
(118,	'R&B lover'),
(119,	'Reggae fan'),
(120,	'Saxophonist'),
(121,	'Flutist'),
(122,	'Cellist'),
(123,	'Ukulele player'),
(124,	'Bass guitarist'),
(125,	'Music producer'),
(126,	'Sound engineer'),
(127,	'Composer'),
(128,	'Songwriter'),
(129,	'Music teacher'),
(130,	'Football player'),
(131,	'Basketball player'),
(132,	'Tennis player'),
(133,	'Runner'),
(134,	'Swimmer'),
(135,	'Mountain Biker'),
(136,	'Boxer'),
(137,	'Martial artist'),
(138,	'Yoga practitioner'),
(139,	'Pilates enthusiast'),
(140,	'CrossFit athlete'),
(141,	'Gymnast'),
(142,	'Weightlifter'),
(143,	'Skier'),
(144,	'Snowboarder'),
(145,	'Skater'),
(146,	'Hiker'),
(147,	'Mountain climber'),
(148,	'Soccer fan'),
(149,	'Baseball fan'),
(150,	'Rugby player'),
(151,	'Cricket player'),
(152,	'Golf enthusiast'),
(153,	'Volleyball player'),
(154,	'Table tennis player'),
(155,	'Badminton player'),
(156,	'Fencer'),
(157,	'Rowing enthusiast'),
(158,	'Sailor'),
(159,	'Horse rider'),
(160,	'Scuba diver'),
(161,	'Triathlete'),
(162,	'Trail runner'),
(163,	'Dance fitness lover'),
(164,	'Zumba enthusiast'),
(165,	'Parkour athlete'),
(166,	'Archery enthusiast'),
(167,	'Fishing'),
(168,	'Kayaker'),
(169,	'Canoeist'),
(170,	'Surfing'),
(171,	'Paddleboarding'),
(172,	'Ultimate frisbee player'),
(173,	'Handball player'),
(174,	'Hockey player'),
(175,	'Bowling'),
(176,	'Lacrosse player'),
(177,	'Softball player'),
(178,	'Cheerleader');

SELECT setval('tag_tag_id_seq', (SELECT MAX(tag_id) FROM tags));

DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "username" character varying(50) NOT NULL,
    "last_name" character varying(255) NOT NULL,
    "first_name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "password" character varying(255),
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sso_type" integer,
    "profile_id" integer,
    "is_online" boolean DEFAULT false NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "last_activity" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "user_email_key" UNIQUE ("email"),
    CONSTRAINT "user_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_profile_id" UNIQUE ("profile_id")
) WITH (oids = false);

COMMENT ON COLUMN "public"."users"."sso_type" IS 'Si bonus authentification via facebook, google.. Si NOT_NULL pas de password, si NULL, il faut un password';

TRUNCATE "users";
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

DROP TABLE IF EXISTS "visited_profile_history";
DROP SEQUENCE IF EXISTS visited_profile_history_id_seq;
CREATE SEQUENCE visited_profile_history_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."visited_profile_history" (
    "id" integer DEFAULT nextval('visited_profile_history_id_seq') NOT NULL,
    "visiter_id" integer NOT NULL,
    "visited_id" integer NOT NULL,
    "viewed_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "visited_profile_history_pk" UNIQUE ("visiter_id", "visited_id"),
    CONSTRAINT "visited_profile_history_pk_2" PRIMARY KEY ("id")
) WITH (oids = false);

TRUNCATE "visited_profile_history";

SELECT setval('visited_profile_history_id_seq', (SELECT MAX(id) FROM visited_profile_history));


ALTER TABLE ONLY "public"."blocked_users" ADD CONSTRAINT "blocked_users_users_id_fk" FOREIGN KEY (blocker_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."blocked_users" ADD CONSTRAINT "blocked_users_users_id_fk_2" FOREIGN KEY (blocked_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."fake_user_reporting" ADD CONSTRAINT "fake_user_reporting_users_id_fk" FOREIGN KEY (user_who_reported) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."fake_user_reporting" ADD CONSTRAINT "fake_user_reporting_users_id_fk_2" FOREIGN KEY (reported_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."likes" ADD CONSTRAINT "like_user_id_fk" FOREIGN KEY ("user") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."likes" ADD CONSTRAINT "like_user_id_fk_2" FOREIGN KEY (user_liked) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."unlikes" ADD CONSTRAINT "unlike_user_id_fk" FOREIGN KEY ("user") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."unlikes" ADD CONSTRAINT "unlike_user_id_fk_2" FOREIGN KEY (user_unliked) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."matches" ADD CONSTRAINT "matches_users_id_fk" FOREIGN KEY (user_1) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."matches" ADD CONSTRAINT "matches_users_id_fk_2" FOREIGN KEY (user_2) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."messages" ADD CONSTRAINT "messages_users_id_fk" FOREIGN KEY (owner_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."messages" ADD CONSTRAINT "messages_users_id_fk_2" FOREIGN KEY (target_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."notifications" ADD CONSTRAINT "notifications_users_id_fk" FOREIGN KEY (target_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."notifications" ADD CONSTRAINT "notifications_users_id_fk_2" FOREIGN KEY (source_user) REFERENCES users(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."photos" ADD CONSTRAINT "photos_users_id_fk" FOREIGN KEY (owner_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."profile_sexual_preferences" ADD CONSTRAINT "profile_sexual_preferences_genders_gender_id_fk" FOREIGN KEY (gender_id) REFERENCES genders(gender_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profile_sexual_preferences" ADD CONSTRAINT "profile_sexual_preferences_profile_profile_id_fk" FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE "public"."profile_tag" 
    ADD CONSTRAINT "profile_tag_fk1" 
    FOREIGN KEY (profile_id) 
    REFERENCES profiles(profile_id) 
    ON DELETE CASCADE 
    NOT DEFERRABLE;


-- ALTER TABLE ONLY "public"."profile_tag" ADD CONSTRAINT "profile_tag_fk2" FOREIGN KEY (profile_tag) REFERENCES tags(tag_id) NOT DEFERRABLE;
-- ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profile_gender_fkey" FOREIGN KEY (gender) REFERENCES genders(gender_id) ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE;
-- ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profile_onwer_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
-- ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profile_photo_photo_id_fk" FOREIGN KEY (main_photo_id) REFERENCES photos(photo_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
-- ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profiles_locations_location_id_fk" FOREIGN KEY (location) REFERENCES locations(location_id) NOT DEFERRABLE;

-- ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "user_accounts_sso_type_sso_id_fk" FOREIGN KEY (sso_type) REFERENCES sso_type(sso_id) NOT DEFERRABLE;
-- ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON UPDATE RESTRICT ON DELETE RESTRICT NOT DEFERRABLE;

-- ALTER TABLE ONLY "public"."visited_profile_history" ADD CONSTRAINT "visited_profile_history_user_id_fk" FOREIGN KEY (visited_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
-- ALTER TABLE ONLY "public"."visited_profile_history" ADD CONSTRAINT "visited_profile_history_user_id_fk_2" FOREIGN KEY (visiter_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

-- 2024-09-03 18:02:01.553859+00
