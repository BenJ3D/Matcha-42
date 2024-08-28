create table if not exists sso_type
(
    sso_id integer     not null
        constraint sso_type_pk
            primary key,
    name   varchar(50) not null
        constraint sso_type_pk_2
            unique
);

comment on table sso_type is 'stocker les differents type de SSO pris en charge (facebook + google ?)';

alter table sso_type
    owner to username42;

