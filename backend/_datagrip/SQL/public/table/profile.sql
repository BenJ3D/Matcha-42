create table if not exists profile
(
    profile_id    integer generated by default as identity
        constraint profile_pk
            primary key,
    gender_id     integer not null
        constraint profile_gender_gender_id_fk
            references gender,
    biography     varchar(250),
    owner_user_id integer not null
        constraint profile_user_id_fk
            references "user"
            on update cascade on delete cascade
);

alter table profile
    owner to username42;

     references "user"
            on update cascade on delete cascade
);

alter table profile
    owner to username42;

