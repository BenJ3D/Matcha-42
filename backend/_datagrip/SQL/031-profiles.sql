create table if not exists profiles
(
    profile_id      integer default nextval('profile_profile_id_seq'::regclass) not null
        constraint profile_pkey
            primary key,
    onwer_user_id   bigint                                                      not null
        constraint profile_onwer_user_id_key
            unique
        constraint profile_onwer_user_id_fkey
            references users
            on update cascade on delete cascade,
    biography       varchar(1024)                                               not null,
    gender          integer                                                     not null
        constraint profile_gender_fkey
            references genders
            on update cascade on delete restrict,
    age             integer
        constraint check_age
            check ((age >= 18) AND (age <= 120)),
    main_picture    integer
        constraint profile_photo_photo_id_fk
            references photos
            on update cascade on delete cascade,
    location        integer
        constraint profiles_locations_location_id_fk
            references locations,
    last_connection timestamp
);

comment on constraint check_age on profiles is 'Age mini et maxi';

comment on column profiles.location is 'Contient les coordonnées GPS du quartier utilisateur';

