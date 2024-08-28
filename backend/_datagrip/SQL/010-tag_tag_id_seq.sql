create sequence tag_tag_id_seq
    as integer;

alter sequence tag_tag_id_seq owner to username42;

alter sequence tag_tag_id_seq owned by tags.tag_id;

