create sequence picture_picture_id_seq
    as integer;

alter sequence picture_picture_id_seq owned by photos.photo_id;

