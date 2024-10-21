-- Adminer 4.8.1 PostgreSQL 16.4 (Debian 16.4-1.pgdg120+1) dump
CREATE TYPE enum_notif_type AS ENUM ('LIKE', 'UNLIKE', 'MATCH', 'NEW_MESSAGE', 'NEW_VISIT');

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


DROP TABLE IF EXISTS "fake_user_repoting";
DROP SEQUENCE IF EXISTS fake_user_repoting_id_seq;
CREATE SEQUENCE fake_user_repoting_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."fake_user_repoting" (
    "id" integer DEFAULT nextval('fake_user_repoting_id_seq') NOT NULL,
    "user_who_reported" integer NOT NULL,
    "reported_user" integer NOT NULL,
    "reported_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "fake_user_repoting_pk" PRIMARY KEY ("id"),
    CONSTRAINT "fake_user_repoting_pk_2" UNIQUE ("user_who_reported", "reported_user")
) WITH (oids = false);


DROP TABLE IF EXISTS "genders";
DROP SEQUENCE IF EXISTS gender_gender_id_seq;
CREATE SEQUENCE gender_gender_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."genders" (
    "gender_id" integer DEFAULT nextval('gender_gender_id_seq') NOT NULL,
    "name" character varying(32) NOT NULL,
    "description" character varying,
    CONSTRAINT "gender_name_gender_key" UNIQUE ("name"),
    CONSTRAINT "gender_pkey" PRIMARY KEY ("gender_id")
) WITH (oids = false);


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


DROP TABLE IF EXISTS "locations";
DROP SEQUENCE IF EXISTS locations_location_id_seq;
CREATE SEQUENCE locations_location_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."locations" (
    "location_id" integer DEFAULT nextval('locations_location_id_seq') NOT NULL,
    "latitude" numeric NOT NULL,
    "longitude" numeric NOT NULL,
    "city_name" character varying(100),
    CONSTRAINT "locations_pk" PRIMARY KEY ("location_id"),
    CONSTRAINT "locations_pk_2" UNIQUE ("longitude", "latitude"),
    CONSTRAINT "locations_pk_3" UNIQUE ("city_name")
) WITH (oids = false);


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


DROP TABLE IF EXISTS "messages";
DROP SEQUENCE IF EXISTS messages_message_id_seq;
CREATE SEQUENCE messages_message_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."messages" (
    "message_id" integer DEFAULT nextval('messages_message_id_seq') NOT NULL,
    "content" character varying(500) NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "owner_user" integer NOT NULL,
    "target_user" integer NOT NULL,
    CONSTRAINT "messages_pk" PRIMARY KEY ("message_id")
) WITH (oids = false);


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
    CONSTRAINT "notifications_pk" PRIMARY KEY ("notification_id")
) WITH (oids = false);

COMMENT ON COLUMN "public"."notifications"."target_user" IS 'user concerné qui doit recevoir la notif';

COMMENT ON COLUMN "public"."notifications"."source_user" IS 'Quel user est à l''origine de la notification';


DROP TABLE IF EXISTS "photos";
DROP SEQUENCE IF EXISTS picture_picture_id_seq;
CREATE SEQUENCE picture_picture_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."photos" (
    "photo_id" integer DEFAULT nextval('picture_picture_id_seq') NOT NULL,
    "url" character varying(255) NOT NULL,
    "description" character varying(255),
    "owner_user_id" integer NOT NULL,
    CONSTRAINT "picture_pkey" PRIMARY KEY ("photo_id"),
    CONSTRAINT "picture_url_key" UNIQUE ("url")
) WITH (oids = false);


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


DROP TABLE IF EXISTS "profile_tag";
DROP SEQUENCE IF EXISTS profile_tag_id_seq;
CREATE SEQUENCE profile_tag_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."profile_tag" (
    "id" integer DEFAULT nextval('profile_tag_id_seq') NOT NULL,
    "profile_id" bigint NOT NULL,
    "profile_tag" bigint NOT NULL,
    CONSTRAINT "profile_tag_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "profiles";
DROP SEQUENCE IF EXISTS profile_profile_id_seq;
CREATE SEQUENCE profile_profile_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."profiles" (
    "profile_id" integer DEFAULT nextval('profile_profile_id_seq') NOT NULL,
    "owner_user_id" bigint NOT NULL,
    "biography" character varying(1024) NOT NULL,
    "gender" integer NOT NULL,
    "age" integer,
    "main_photo_id" integer,
    "location" integer,
    "last_connection" timestamp,
    CONSTRAINT "profile_onwer_user_id_key" UNIQUE ("owner_user_id"),
    CONSTRAINT "profile_pkey" PRIMARY KEY ("profile_id")
) WITH (oids = false);

COMMENT ON COLUMN "public"."profiles"."location" IS 'Contient les coordonnées GPS du quartier utilisateur';


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


DROP TABLE IF EXISTS "tags";
DROP SEQUENCE IF EXISTS tag_tag_id_seq;
CREATE SEQUENCE tag_tag_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."tags" (
    "tag_id" integer DEFAULT nextval('tag_tag_id_seq') NOT NULL,
    "tag_name" character varying(50) NOT NULL,
    CONSTRAINT "tag_pkey" PRIMARY KEY ("tag_id")
) WITH (oids = false);


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
    CONSTRAINT "user_email_key" UNIQUE ("email"),
    CONSTRAINT "user_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_username_key" UNIQUE ("username")
) WITH (oids = false);

COMMENT ON COLUMN "public"."users"."sso_type" IS 'Si bonus authentification via facebook, google.. Si NOT_NULL pas de password, si NULL, il faut un password';


DROP TABLE IF EXISTS "visited_profile_history";
DROP SEQUENCE IF EXISTS visited_profile_history_id_seq;
CREATE SEQUENCE visited_profile_history_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."visited_profile_history" (
    "id" integer DEFAULT nextval('visited_profile_history_id_seq') NOT NULL,
    "visiter" integer NOT NULL,
    "visited" integer NOT NULL,
    CONSTRAINT "visited_profile_history_pk" UNIQUE ("visited", "visiter"),
    CONSTRAINT "visited_profile_history_pk_2" PRIMARY KEY ("id")
) WITH (oids = false);


ALTER TABLE ONLY "public"."blocked_users" ADD CONSTRAINT "blocked_users_users_id_fk" FOREIGN KEY (blocker_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."blocked_users" ADD CONSTRAINT "blocked_users_users_id_fk_2" FOREIGN KEY (blocked_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."fake_user_repoting" ADD CONSTRAINT "fake_user_repoting_users_id_fk" FOREIGN KEY (user_who_reported) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."fake_user_repoting" ADD CONSTRAINT "fake_user_repoting_users_id_fk_2" FOREIGN KEY (reported_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."likes" ADD CONSTRAINT "like_user_id_fk" FOREIGN KEY ("user") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."likes" ADD CONSTRAINT "like_user_id_fk_2" FOREIGN KEY (user_liked) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."matches" ADD CONSTRAINT "matches_users_id_fk" FOREIGN KEY (user_1) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."matches" ADD CONSTRAINT "matches_users_id_fk_2" FOREIGN KEY (user_2) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."messages" ADD CONSTRAINT "messages_users_id_fk" FOREIGN KEY (owner_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."messages" ADD CONSTRAINT "messages_users_id_fk_2" FOREIGN KEY (target_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."notifications" ADD CONSTRAINT "notifications_users_id_fk" FOREIGN KEY (target_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."notifications" ADD CONSTRAINT "notifications_users_id_fk_2" FOREIGN KEY (source_user) REFERENCES users(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."photos" ADD CONSTRAINT "photos_users_id_fk" FOREIGN KEY (owner_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."profile_sexual_preferences" ADD CONSTRAINT "profile_sexual_preferences_genders_gender_id_fk" FOREIGN KEY (gender_id) REFERENCES genders(gender_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profile_sexual_preferences" ADD CONSTRAINT "profile_sexual_preferences_profile_profile_id_fk" FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."profile_tag" ADD CONSTRAINT "profile_tag_fk1" FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profile_tag" ADD CONSTRAINT "profile_tag_fk2" FOREIGN KEY (profile_tag) REFERENCES tags(tag_id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profile_gender_fkey" FOREIGN KEY (gender) REFERENCES genders(gender_id) ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profile_onwer_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profile_photo_photo_id_fk" FOREIGN KEY (main_photo_id) REFERENCES photos(photo_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profiles_locations_location_id_fk" FOREIGN KEY (location) REFERENCES locations(location_id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "user_accounts_sso_type_sso_id_fk" FOREIGN KEY (sso_type) REFERENCES sso_type(sso_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON UPDATE RESTRICT ON DELETE RESTRICT NOT DEFERRABLE;

ALTER TABLE ONLY "public"."visited_profile_history" ADD CONSTRAINT "visited_profile_history_user_id_fk" FOREIGN KEY (visited) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."visited_profile_history" ADD CONSTRAINT "visited_profile_history_user_id_fk_2" FOREIGN KEY (visiter) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

-- 2024-09-03 18:08:37.375496+00
