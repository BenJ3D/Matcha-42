create table if not exists tags
(
    tag_id   integer default nextval('tag_tag_id_seq'::regclass) not null
        constraint tag_pkey
            primary key,
    tag_name varchar(50)                                         not null
);

