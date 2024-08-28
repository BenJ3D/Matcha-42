create sequence user_id_seq
    as integer;

alter sequence user_id_seq owner to username42;

alter sequence user_id_seq owned by users.id;

