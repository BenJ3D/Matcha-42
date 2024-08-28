create table if not exists profile_photo
(
    id         integer default nextval('profile_picture_id_seq'::regclass) not null
        constraint profile_picture_pkey
            primary key,
    profile_id bigint                                                      not null
        constraint profile_picture_fk1
            references profiles,
    photo_id   bigint                                                      not null
        constraint profile_picture_fk2
            references photos
);

alter table profile_photo
    owner to username42;

