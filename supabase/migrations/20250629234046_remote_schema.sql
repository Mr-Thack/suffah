

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Booking" (
    "id" integer NOT NULL,
    "date" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."Booking" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Sponsor" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."Sponsor" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."Sponsor_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."Sponsor_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."Sponsor_id_seq" OWNED BY "public"."Sponsor"."id";



CREATE TABLE IF NOT EXISTS "public"."Sponsorship" (
    "id" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sponsorId" integer NOT NULL,
    "bookingId" integer NOT NULL,
    "paid" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."Sponsorship" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."Sponsorship_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."Sponsorship_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."Sponsorship_id_seq" OWNED BY "public"."Sponsorship"."id";



ALTER TABLE ONLY "public"."Sponsor" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Sponsor_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."Sponsorship" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."Sponsorship_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Sponsor"
    ADD CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Sponsorship"
    ADD CONSTRAINT "Sponsorship_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "Booking_date_key" ON "public"."Booking" USING "btree" ("date");



CREATE UNIQUE INDEX "Sponsor_phone_key" ON "public"."Sponsor" USING "btree" ("phone");



ALTER TABLE ONLY "public"."Sponsorship"
    ADD CONSTRAINT "Sponsorship_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."Sponsorship"
    ADD CONSTRAINT "Sponsorship_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "public"."Sponsor"("id") ON UPDATE CASCADE ON DELETE RESTRICT;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


































































































































































GRANT ALL ON TABLE "public"."Booking" TO "anon";
GRANT ALL ON TABLE "public"."Booking" TO "authenticated";
GRANT ALL ON TABLE "public"."Booking" TO "service_role";



GRANT ALL ON TABLE "public"."Sponsor" TO "anon";
GRANT ALL ON TABLE "public"."Sponsor" TO "authenticated";
GRANT ALL ON TABLE "public"."Sponsor" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Sponsor_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Sponsor_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Sponsor_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Sponsorship" TO "anon";
GRANT ALL ON TABLE "public"."Sponsorship" TO "authenticated";
GRANT ALL ON TABLE "public"."Sponsorship" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Sponsorship_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Sponsorship_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Sponsorship_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
