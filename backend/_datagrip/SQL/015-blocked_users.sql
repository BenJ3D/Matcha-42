create table if not exists blocked_users
(
    id         integer                             not null
        constraint blocked_users_pk
            primary key,
    blocker_id integer                             not null
        constraint blocked_users_users_id_fk
            references users
            on update cascade on delete cascade,
    blocked_id integer                             not null
        constraint blocked_users_users_id_fk_2
            references users
            on update cascade on delete cascade,
    blocked_at timestamp default CURRENT_TIMESTAMP not null,
    constraint blocked_users_pk_2
        unique (blocker_id, blocked_id)
);

alter table blocked_users
    owner to username42;

