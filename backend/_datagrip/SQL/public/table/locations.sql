create table if not exists locations
(
    location_id integer not null
        constraint locations_pk
            primary key,
    latitude    numeric not null,
    longitude   numeric not null,
    city_name   varchar(100),
    constraint locations_pk_2
        unique (longitude, latitude)
);

alter table locations
    owner to username42;

