create sequence picture_picture_id_seq
    as integer;

alter sequence picture_picture_id_seq owner to username42;

alter sequence picture_picture_id_seq owned by photos.photo_id;

