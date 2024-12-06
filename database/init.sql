-- Ce fichier inclut d'autres scripts SQL

-- Exécute le premier script SQL
\i /docker-entrypoint-initdb.d/01-init.sql

-- Exécute le deuxième script SQL
\i /docker-entrypoint-initdb.d/02-extra.sql

ALTER TABLE ONLY "public"."profile_tag" ADD CONSTRAINT "profile_tag_fk2" FOREIGN KEY (profile_tag) REFERENCES tags(tag_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profile_gender_fkey" FOREIGN KEY (gender) REFERENCES genders(gender_id) ON UPDATE CASCADE ON DELETE RESTRICT NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profile_onwer_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profile_photo_photo_id_fk" FOREIGN KEY (main_photo_id) REFERENCES photos(photo_id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."profiles" ADD CONSTRAINT "profiles_locations_location_id_fk" FOREIGN KEY (location) REFERENCES locations(location_id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "user_accounts_sso_type_sso_id_fk" FOREIGN KEY (sso_type) REFERENCES sso_type(sso_id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "users_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON UPDATE RESTRICT ON DELETE RESTRICT NOT DEFERRABLE;

ALTER TABLE ONLY "public"."visited_profile_history" ADD CONSTRAINT "visited_profile_history_user_id_fk" FOREIGN KEY (visited_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."visited_profile_history" ADD CONSTRAINT "visited_profile_history_user_id_fk_2" FOREIGN KEY (visiter_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

CREATE UNIQUE INDEX users_username_unique_idx ON "public"."users" (LOWER(username));

ALTER TABLE notifications
DROP CONSTRAINT notifications_users_id_fk;

ALTER TABLE notifications
ADD CONSTRAINT notifications_users_id_fk
FOREIGN KEY (target_user)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE notifications
DROP CONSTRAINT notifications_users_id_fk_2;

ALTER TABLE notifications
ADD CONSTRAINT notifications_users_id_fk_2
FOREIGN KEY (source_user)
REFERENCES users(id)
ON DELETE CASCADE;
