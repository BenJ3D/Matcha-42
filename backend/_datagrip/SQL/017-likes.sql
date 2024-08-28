create table if not exists likes
(
    like_id    integer not null
        constraint likes_pk_2
            primary key,
    "user"     integer not null
        constraint like_user_id_fk
            references users
            on update cascade on delete cascade,
    user_liked integer not null
        constraint like_user_id_fk_2
            references users
            on update cascade on delete cascade,
    constraint likes_pk
        unique (user_liked, "user")
);

alter table likes
    owner to username42;

