create table if not exists matches
(
    match_id   integer                             not null
        constraint matches_pk_2
            primary key,
    user_1     integer                             not null
        constraint matches_users_id_fk
            references users
            on update cascade on delete cascade,
    user_2     integer                             not null
        constraint matches_users_id_fk_2
            references users
            on update cascade on delete cascade,
    matched_at timestamp default CURRENT_TIMESTAMP not null,
    constraint matches_pk
        unique (user_1, user_2)
);

alter table matches
    owner to username42;

