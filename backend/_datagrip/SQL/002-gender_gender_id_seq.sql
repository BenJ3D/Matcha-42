create sequence gender_gender_id_seq
    as integer;

alter sequence gender_gender_id_seq owner to username42;

alter sequence gender_gender_id_seq owned by genders.gender_id;

