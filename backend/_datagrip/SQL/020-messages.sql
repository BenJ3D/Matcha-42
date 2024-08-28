create table if not exists messages
(
    message_id  integer                             not null
        constraint messages_pk
            primary key,
    content     varchar(500)                        not null,
    created_at  timestamp default CURRENT_TIMESTAMP not null,
    owner_user  integer                             not null
        constraint messages_users_id_fk
            references users
            on update cascade on delete cascade,
    target_user integer                             not null
        constraint messages_users_id_fk_2
            references users
            on update cascade on delete cascade
);

alter table messages
    owner to username42;

