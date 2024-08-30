create table if not exists visited_profile_history
(
    id      integer generated by default as identity
        constraint visited_profile_history_pk_2
            primary key,
    visiter integer not null
        constraint visited_profile_history_user_id_fk_2
            references users
            on update cascade on delete cascade,
    visited integer not null
        constraint visited_profile_history_user_id_fk
            references users
            on update cascade on delete cascade,
    constraint visited_profile_history_pk
        unique (visited, visiter)
);

