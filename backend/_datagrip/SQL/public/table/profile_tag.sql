create table if not exists profile_tag
(
    id          serial
        primary key,
    profile_id  bigint not null
        constraint profile_tag_fk1
            references profiles,
    profile_tag bigint not null
        constraint profile_tag_fk2
            references tags
);

alter table profile_tag
    owner to username42;

