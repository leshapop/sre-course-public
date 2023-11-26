create sequence public.cities_id_seq;
alter sequence cities_id_seq owned by cities.id;
create sequence public.forecast_id_seq;
alter sequence forecast_id_seq owned by forecast.id;


create table public.cities (
                               id bigint primary key not null default nextval('cities_id_seq'::regclass),
                               name character varying(255)
);

create table public.forecast (
                                 id bigint primary key not null default nextval('forecast_id_seq'::regclass),
                                 "cityId" bigint,
                                 "dateTime" bigint,
                                 temperature integer,
                                 summary text,
                                 foreign key ("cityId") references public.cities (id)
                                     match simple on update no action on delete cascade
);