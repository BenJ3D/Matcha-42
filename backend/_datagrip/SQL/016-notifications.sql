create table if not exists notifications
(
    notification_id integer                             not null
        constraint notifications_pk
            primary key,
    title           varchar(60)                         not null,
    type            integer                             not null,
    target_user     integer                             not null
        constraint notifications_users_id_fk
            references users
            on update cascade on delete cascade,
    has_read        boolean   default false             not null,
    notified_at     timestamp default CURRENT_TIMESTAMP not null
);

alter table notifications
    owner to username42;

