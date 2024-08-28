create table if not exists genders
(
    gender_id   integer default nextval('gender_gender_id_seq'::regclass) not null
        constraint gender_pkey
            primary key,
    name_gender varchar(100)
        constraint gender_name_gender_key
            unique
);

alter table genders
    owner to username42;

