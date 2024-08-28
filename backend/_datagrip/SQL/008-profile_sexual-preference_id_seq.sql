create sequence "profile_sexual-preference_id_seq";

alter sequence "profile_sexual-preference_id_seq" owner to username42;

alter sequence "profile_sexual-preference_id_seq" owned by profile_sexual_preferences.id;

