create sequence profile_picture_id_seq
    as integer;

alter sequence profile_picture_id_seq owner to username42;

alter sequence profile_picture_id_seq owned by profile_photo.id;

