create table if not exists photos
(
    photo_id      integer default nextval('picture_picture_id_seq'::regclass) not null
        constraint picture_pkey
            primary key,
    url           varchar(255)                                                not null
        constraint picture_url_key
            unique,
    description   varchar(255),
    owner_user_id integer                                                     not null
        constraint photos_users_id_fk
            references users
            on update cascade on delete cascade
);

