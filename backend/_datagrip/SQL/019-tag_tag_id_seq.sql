create sequence tag_tag_id_seq
    as integer;

alter sequence tag_tag_id_seq owned by tags.tag_id;

