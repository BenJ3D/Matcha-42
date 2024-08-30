create sequence gender_gender_id_seq
    as integer;

alter sequence gender_gender_id_seq owned by genders.gender_id;

