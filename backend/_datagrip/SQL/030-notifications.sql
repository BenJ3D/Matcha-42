create table if not exists notifications
(
    notification_id integer generated always as identity
        constraint notifications_pk
            primary key,
    target_user     integer                             not null
        constraint notifications_users_id_fk
            references users
            on update cascade on delete cascade,
    has_read        boolean   default false             not null,
    notified_at     timestamp default CURRENT_TIMESTAMP not null,
    type            enum_notif_type                     not null,
    source_user     integer                             not null
        constraint notifications_users_id_fk_2
            references users
);

comment on column notifications.target_user is 'user concerné qui doit recevoir la notif';

comment on column notifications.source_user is 'Quel user est à l''origine de la notification';

