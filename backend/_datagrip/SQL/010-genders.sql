create table if not exists genders
(
    gender_id   integer default nextval('gender_gender_id_seq'::regclass) not null
        constraint gender_pkey
            primary key,
    name        varchar(32)                                               not null
        constraint gender_name_gender_key
            unique,
    description varchar
);

