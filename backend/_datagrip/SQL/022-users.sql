create table if not exists users
(
    id         integer generated always as identity
        constraint user_pkey
            primary key,
    username   varchar(50)                         not null
        constraint user_username_key
            unique,
    last_name  varchar(255)                        not null,
    first_name varchar(255)                        not null,
    email      varchar(255)                        not null
        constraint user_email_key
            unique,
    password   varchar(255),
    created_at timestamp default CURRENT_TIMESTAMP not null,
    sso_type   integer
        constraint users_sso_type_sso_id_fk
            references sso_type
        constraint user_accounts_sso_type_sso_id_fk
            references sso_type
);

comment on column users.sso_type is 'Si bonus authentification via facebook, google.. Si NOT_NULL pas de password, si NULL, il faut un password';

