create sequence profile_profile_id_seq
    as integer;

alter sequence profile_profile_id_seq owned by profiles.profile_id;

