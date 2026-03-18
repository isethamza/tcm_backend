--
-- PostgreSQL database dump
--

\restrict MdF1LPOrY8Sb5JvF7A6JYASta8pxE6aATVriVb0kaaynzEnngmnd9ys34wfyjjV

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-10 19:49:36

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

--
-- TOC entry 876 (class 1247 OID 159817)
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuditAction" AS ENUM (
    'KYC_APPROVED',
    'KYC_REJECTED',
    'DISPUTE_OPENED',
    'DISPUTE_RESOLVED',
    'CASH_CONFIRMED',
    'PAYOUT_TRIGGERED',
    'USER_SUSPENDED'
);


ALTER TYPE public."AuditAction" OWNER TO postgres;

--
-- TOC entry 879 (class 1247 OID 159832)
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'CREATED',
    'PREPAID',
    'PICKUP_PENDING',
    'IN_TRANSIT',
    'AT_HUB',
    'DELIVERED',
    'CANCELLED',
    'COMPLETED',
    'IN_PICKUP',
    'PICKED_UP',
    'AWAITING_PICKUP',
    'AWAITING_DROPOFF',
    'AT_ORIGIN_HUB',
    'AT_DESTINATION_HUB'
);


ALTER TYPE public."BookingStatus" OWNER TO postgres;

--
-- TOC entry 882 (class 1247 OID 159854)
-- Name: DisputeStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DisputeStatus" AS ENUM (
    'OPEN',
    'RESOLVED',
    'REJECTED'
);


ALTER TYPE public."DisputeStatus" OWNER TO postgres;

--
-- TOC entry 885 (class 1247 OID 159862)
-- Name: DisputeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DisputeType" AS ENUM (
    'DELIVERY',
    'PAYMENT',
    'KYC',
    'OTHER'
);


ALTER TYPE public."DisputeType" OWNER TO postgres;

--
-- TOC entry 1005 (class 1247 OID 180118)
-- Name: HubStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."HubStatus" AS ENUM (
    'DRAFT',
    'PENDING_KYC',
    'ACTIVE',
    'REJECTED',
    'SUSPENDED'
);


ALTER TYPE public."HubStatus" OWNER TO postgres;

--
-- TOC entry 1008 (class 1247 OID 180142)
-- Name: HubType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."HubType" AS ENUM (
    'MAIN',
    'TRANSIT',
    'FIRST_LAST_MILE'
);


ALTER TYPE public."HubType" OWNER TO postgres;

--
-- TOC entry 888 (class 1247 OID 159872)
-- Name: KycStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KycStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."KycStatus" OWNER TO postgres;

--
-- TOC entry 891 (class 1247 OID 159880)
-- Name: KycType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KycType" AS ENUM (
    'CLIENT',
    'TRANSPORTEUR',
    'HUB_MANAGER',
    'RECEIVER'
);


ALTER TYPE public."KycType" OWNER TO postgres;

--
-- TOC entry 894 (class 1247 OID 159890)
-- Name: LedgerEntryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LedgerEntryType" AS ENUM (
    'CLIENT_PAYMENT',
    'PLATFORM_COMMISSION',
    'VAT',
    'TRANSPORTEUR_PAYOUT',
    'HUB_PAYOUT',
    'REFUND'
);


ALTER TYPE public."LedgerEntryType" OWNER TO postgres;

--
-- TOC entry 897 (class 1247 OID 159904)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'ONLINE',
    'CASH'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 159910)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- TOC entry 903 (class 1247 OID 159918)
-- Name: PickupOption; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PickupOption" AS ENUM (
    'STANDARD',
    'SCHEDULED',
    'SELF_DROPOFF',
    'SELF_DROPOFF_AT_HUB',
    'SELF_DROPOFF_AT_TRANSPORTEUR'
);


ALTER TYPE public."PickupOption" OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 159926)
-- Name: PickupSessionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PickupSessionStatus" AS ENUM (
    'STARTED',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public."PickupSessionStatus" OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 159934)
-- Name: PickupStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PickupStatus" AS ENUM (
    'NONE',
    'AWAITING_TRANSPORTEUR_PROPOSAL',
    'AWAITING_CLIENT_CONFIRMATION',
    'CONFIRMED'
);


ALTER TYPE public."PickupStatus" OWNER TO postgres;

--
-- TOC entry 912 (class 1247 OID 159944)
-- Name: TrackingEventType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TrackingEventType" AS ENUM (
    'PUBLIC',
    'INTERNAL'
);


ALTER TYPE public."TrackingEventType" OWNER TO postgres;

--
-- TOC entry 915 (class 1247 OID 159950)
-- Name: TripStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TripStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'CANCELLED',
    'ON_HOLD',
    'DELAYED',
    'PREPONED'
);


ALTER TYPE public."TripStatus" OWNER TO postgres;

--
-- TOC entry 918 (class 1247 OID 159964)
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'CLIENT',
    'TRANSPORTEUR',
    'HUB_MANAGER',
    'ADMIN',
    'RECIPIENT'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- TOC entry 921 (class 1247 OID 159976)
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- TOC entry 924 (class 1247 OID 159984)
-- Name: VerificationArtifactType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VerificationArtifactType" AS ENUM (
    'IDENTITY',
    'PARCEL',
    'SIGNATURE'
);


ALTER TYPE public."VerificationArtifactType" OWNER TO postgres;

--
-- TOC entry 927 (class 1247 OID 159992)
-- Name: VerificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VerificationType" AS ENUM (
    'PICKUP',
    'DELIVERY'
);


ALTER TYPE public."VerificationType" OWNER TO postgres;

--
-- TOC entry 1002 (class 1247 OID 180103)
-- Name: WeekDay; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WeekDay" AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);


ALTER TYPE public."WeekDay" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 159997)
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "actorId" text NOT NULL,
    action public."AuditAction" NOT NULL,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 160009)
-- Name: CustomsItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CustomsItem" (
    id text NOT NULL,
    quantity integer NOT NULL,
    "hsCode" text,
    name text NOT NULL,
    "parcelId" text NOT NULL,
    value double precision NOT NULL
);


ALTER TABLE public."CustomsItem" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 160019)
-- Name: Dispute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Dispute" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "raisedById" text NOT NULL,
    type public."DisputeType" NOT NULL,
    reason text NOT NULL,
    status public."DisputeStatus" DEFAULT 'OPEN'::public."DisputeStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" timestamp(3) without time zone
);


ALTER TABLE public."Dispute" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 160033)
-- Name: EmailVerification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailVerification" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmailVerification" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 160044)
-- Name: Kyc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Kyc" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."KycType" NOT NULL,
    status public."KycStatus" DEFAULT 'PENDING'::public."KycStatus" NOT NULL,
    "idDocumentUrl" text,
    "selfieUrl" text,
    "licenseUrl" text,
    "parcelPhotoUrl" text,
    "verifierId" text,
    "verifiedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Kyc" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 160057)
-- Name: LedgerEntry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LedgerEntry" (
    id text NOT NULL,
    "paymentId" text NOT NULL,
    type public."LedgerEntryType" NOT NULL,
    amount double precision NOT NULL,
    "transporteurId" text,
    "hubId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LedgerEntry" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 160068)
-- Name: Parcel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Parcel" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "weightKg" double precision NOT NULL,
    "lengthCm" double precision NOT NULL,
    "widthCm" double precision NOT NULL,
    "heightCm" double precision NOT NULL,
    "estimatedValue" double precision,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedHeightCm" double precision,
    "verifiedLengthCm" double precision,
    "verifiedWeightKg" double precision,
    "verifiedWidthCm" double precision
);


ALTER TABLE public."Parcel" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 160079)
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 160090)
-- Name: Profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Profile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    mobile text NOT NULL,
    address text NOT NULL,
    "postalCode" text NOT NULL,
    city text NOT NULL,
    country text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Profile" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 160105)
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 160116)
-- Name: TripPricingRule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TripPricingRule" (
    id text NOT NULL,
    "tripId" text NOT NULL,
    "minKg" integer NOT NULL,
    "maxKg" integer NOT NULL,
    price double precision NOT NULL
);


ALTER TABLE public."TripPricingRule" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 160126)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'PENDING'::public."UserStatus" NOT NULL,
    phone text,
    "firstName" text,
    "lastName" text,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "cashAllowed" boolean DEFAULT false NOT NULL,
    "companyName" text,
    "companyRegistrationId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 160142)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 160154)
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id text NOT NULL,
    "clientId" text NOT NULL,
    "recipientId" text NOT NULL,
    status public."BookingStatus" NOT NULL,
    "pickupStatus" public."PickupStatus" NOT NULL,
    "prepaidAmount" numeric(65,30) NOT NULL,
    "remainingAmount" numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveryPrice" double precision NOT NULL,
    "parcelWeightKg" integer NOT NULL,
    "pickupFee" double precision NOT NULL,
    "pickupOption" text NOT NULL,
    "totalPrice" double precision NOT NULL,
    "tripId" text NOT NULL,
    "recipientSnapshot" jsonb NOT NULL,
    "destinationHubId" text,
    "originHubId" text,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 180163)
-- Name: hub_opening_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hub_opening_hours (
    id text NOT NULL,
    "hubId" text NOT NULL,
    day public."WeekDay" NOT NULL,
    "openTime" text NOT NULL,
    "closeTime" text NOT NULL,
    "isClosed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.hub_opening_hours OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 163811)
-- Name: hubs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hubs (
    id text NOT NULL,
    name text NOT NULL,
    type public."HubType" DEFAULT 'FIRST_LAST_MILE'::public."HubType" NOT NULL,
    status public."HubStatus" DEFAULT 'DRAFT'::public."HubStatus" NOT NULL,
    country text NOT NULL,
    city text NOT NULL,
    address text NOT NULL,
    "postalCode" text,
    "maxParcelWeightKg" double precision NOT NULL,
    "maxParcelVolumeM3" double precision NOT NULL,
    "occupiedWeightKg" double precision DEFAULT 0 NOT NULL,
    "occupiedVolumeM3" double precision DEFAULT 0 NOT NULL,
    "managerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "kycId" text
);


ALTER TABLE public.hubs OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 160175)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    amount numeric(65,30) NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text,
    "stripeIntentId" text
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 160187)
-- Name: pickup_proposals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pickup_proposals (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    rejected boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pickupSlotId" text NOT NULL
);


ALTER TABLE public.pickup_proposals OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 160201)
-- Name: pickup_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pickup_sessions (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "finalWeightKg" double precision,
    "finalLengthCm" double precision,
    "finalWidthCm" double precision,
    "finalHeightCm" double precision,
    "cashCollected" double precision,
    status public."PickupSessionStatus" DEFAULT 'STARTED'::public."PickupSessionStatus" NOT NULL
);


ALTER TABLE public.pickup_sessions OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 160212)
-- Name: pickup_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pickup_slots (
    id text NOT NULL,
    "transporteurId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    capacity integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pickup_slots OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 160228)
-- Name: recipients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipients (
    id text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    country text NOT NULL,
    city text NOT NULL,
    "clientId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email text,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "postalCode" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.recipients OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 160244)
-- Name: tracking_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tracking_events (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "tripId" text,
    location text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "eventType" public."TrackingEventType" DEFAULT 'PUBLIC'::public."TrackingEventType" NOT NULL,
    message text,
    status public."BookingStatus" NOT NULL
);


ALTER TABLE public.tracking_events OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 160256)
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    id text NOT NULL,
    "transporteurId" text NOT NULL,
    "departureDate" timestamp(3) without time zone NOT NULL,
    "arrivalCountry" text NOT NULL,
    "arrivalDate" timestamp(3) without time zone NOT NULL,
    "capacityKg" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "departureCountry" text NOT NULL,
    "pickupAddonFee" double precision,
    "cancelledAt" timestamp(3) without time zone,
    status public."TripStatus" DEFAULT 'DRAFT'::public."TripStatus" NOT NULL,
    "arrivalCity" text NOT NULL,
    "departureCity" text NOT NULL,
    "previousArrivalDate" timestamp(3) without time zone,
    "previousDepartureDate" timestamp(3) without time zone,
    "capacityM3" integer NOT NULL
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 160275)
-- Name: verification_artifacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_artifacts (
    id text NOT NULL,
    "pickupId" text NOT NULL,
    "fileUrl" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type public."VerificationArtifactType" NOT NULL
);


ALTER TABLE public.verification_artifacts OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 160286)
-- Name: verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verifications (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "verifierId" text NOT NULL,
    type public."VerificationType" NOT NULL,
    success boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.verifications OWNER TO postgres;

--
-- TOC entry 5317 (class 0 OID 159997)
-- Dependencies: 219
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "actorId", action, entity, "entityId", metadata, "createdAt") FROM stdin;
\.


--
-- TOC entry 5318 (class 0 OID 160009)
-- Dependencies: 220
-- Data for Name: CustomsItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CustomsItem" (id, quantity, "hsCode", name, "parcelId", value) FROM stdin;
a820f67b-dc16-4d5f-a904-1080c8b8f951	1	\N	weqw	406e0b79-d0df-4e15-8c10-918f3b70c4eb	3
4d4d1225-679e-457f-b258-5246f37d0343	1	\N	ws	fc074c9a-5e26-43a0-b5f2-d0886453af76	0
a4c0221e-90b4-43f3-96ba-aba6a4941649	1	\N	tia	d8df5af1-1c9a-4b33-baec-8ff2d59a4248	10
96ea89ff-a997-47c6-bc96-88bfaef540c5	1	\N	tr	614eaa9f-09e8-4e2a-9b0a-405065eccbf1	0
5d04c8f0-8f06-43ad-a0bd-9f91db31f72a	1	\N	tr	2145134a-795a-442c-ace5-eba4a5ddbafd	12
846fd1f3-63b9-417b-8348-fbecd66db4ea	1	\N	wew	4b65709c-3f62-444c-b6b3-f63970be0918	0
b35ba34b-0648-459f-928b-f9d6ddd15058	1	\N	qweqw	0a8418c4-a530-4532-8798-a5426ec66b6c	2
ff2da656-b8f2-4f76-8e5d-ee1ec7119689	1	\N	y56	626b36b0-e8c2-424d-a809-038babe0e6a4	0
36eaa9cf-97bd-49ab-83c5-a28579d85fea	1	\N	testwq	c8bd9fdf-f985-473a-accd-da9cc9a49004	0
b19c54c6-3c27-427f-a37c-6bdcd4394679	0	\N	qq	e9f0d7c4-c818-4fed-bfa2-87ce6456a33f	3
a1b141da-693c-44a4-b210-4c6414913078	1	\N	erwerwe	671387cd-12d5-4a39-9ae5-0b5beb0d549d	3
4f39d0b3-03a6-4045-9e12-4d0e6e9e4077	1	\N	Trasto	afa9dad3-ff6c-48df-a33f-a48caee992ab	32
2157f4a4-07ee-48d7-92c6-0e844b651d23	2	\N	Trvarato	afa9dad3-ff6c-48df-a33f-a48caee992ab	43
7ba39601-ac71-41c9-8351-693794739e2b	1	\N	Tras	90c3e698-e654-45f0-9532-7b940c74889c	100
211b5682-8c7b-4ebc-9b6c-5598cac0654f	1	\N	rtt	93c429a5-713d-41c6-8f79-f85f8367b9f4	212
9b559975-6cd4-4b60-aa1a-53d28de10346	1	\N		0d20a9fc-9905-497d-a830-ff18efd40446	0
a329dc38-ccee-41ac-b470-7e487ecebc7e	1	\N	croosty	abc19989-04c7-4548-b920-1472ef778deb	1
11b21163-18d5-4985-90d2-8592809512c8	1	\N	teweweqw	7ec2fc05-008c-4560-84f7-73b721375ca6	43
\.


--
-- TOC entry 5319 (class 0 OID 160019)
-- Dependencies: 221
-- Data for Name: Dispute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Dispute" (id, "bookingId", "raisedById", type, reason, status, "createdAt", "resolvedAt") FROM stdin;
\.


--
-- TOC entry 5320 (class 0 OID 160033)
-- Dependencies: 222
-- Data for Name: EmailVerification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailVerification" (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
cbeda772-2a5e-4f90-9ee6-6d4519d3eeb0	dd250af3-dbc5-4466-a806-8185a375c08e	644fa511-ef92-4a2e-b313-26141774f3c9	2026-01-09 08:23:11.881	2026-01-08 08:23:11.883
c7912e36-c772-409a-bded-3b16cf9d3aa4	97ea8a99-30e5-4cac-b743-df30b1912c8d	248916cf-b399-4590-b22c-33fbff5dfbbd	2026-01-09 08:24:26.184	2026-01-08 08:24:26.186
6f71a12c-010b-4946-bdd1-2cf17b9f90ee	c2fa096b-62a1-40e3-85a1-e9a24357dcab	cab63e9b-6fb5-4112-8734-4a2ce716ab47	2026-01-10 19:12:00.399	2026-01-09 19:12:00.403
952a8e18-4e0c-4169-b83c-b4de2c39d91c	25bb6d16-c384-4aeb-b402-71c54fca88dd	6ff474eb-0ecb-421f-8830-ad363039bfcc	2026-01-12 06:34:45.765	2026-01-11 06:34:45.767
2a43fb9e-20e8-441d-9b45-16a95779f76d	5dcae7c4-1843-4149-b3db-44cbddf79b27	030acda7-5721-4b45-afcc-dd63111fe562	2026-01-12 12:44:53.279	2026-01-11 12:44:53.28
901fa553-75c4-4009-9368-e6b31bae82dd	693fd764-a6ae-4cc0-9e72-fada1118fd91	d399db6d-64ac-4a73-99f5-158cde3f1145	2026-01-14 22:53:14.525	2026-01-13 22:53:14.528
33324e30-4049-4ba0-9849-c4fe6ef3427a	ae5e76d6-afd9-4630-92d5-46548021efaf	d16b0779-154d-4168-ba8c-c04c1b8beb2a	2026-02-03 08:58:39.506	2026-02-02 08:58:39.509
\.


--
-- TOC entry 5321 (class 0 OID 160044)
-- Dependencies: 223
-- Data for Name: Kyc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Kyc" (id, "userId", type, status, "idDocumentUrl", "selfieUrl", "licenseUrl", "parcelPhotoUrl", "verifierId", "verifiedAt", "rejectionReason", "createdAt", "updatedAt") FROM stdin;
72e498f2-2f11-481b-987d-d918a5e1af29	cab63e9b-6fb5-4112-8734-4a2ce716ab47	TRANSPORTEUR	APPROVED	/uploads/undefined	/uploads/undefined	/uploads/undefined	\N	\N	\N	\N	2026-01-18 15:40:52.398	2026-01-18 15:40:52.398
\.


--
-- TOC entry 5322 (class 0 OID 160057)
-- Dependencies: 224
-- Data for Name: LedgerEntry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LedgerEntry" (id, "paymentId", type, amount, "transporteurId", "hubId", "createdAt") FROM stdin;
add0e7d0-91b6-468d-b0f7-a3e24c7c571a	3727e6e9-f032-4373-a0d7-d302b980127e	CLIENT_PAYMENT	72.25	\N	\N	2026-01-31 21:24:21.812
074009a3-930a-405a-bf47-5c195ccac99d	3727e6e9-f032-4373-a0d7-d302b980127e	PLATFORM_COMMISSION	7.225000000000001	\N	\N	2026-01-31 21:24:21.812
fb05676a-bdc3-4377-9b2f-94814c8751c1	3727e6e9-f032-4373-a0d7-d302b980127e	VAT	1.445	\N	\N	2026-01-31 21:24:21.812
c4fc4b1b-8c47-4851-98eb-c809a328a37c	3727e6e9-f032-4373-a0d7-d302b980127e	TRANSPORTEUR_PAYOUT	63.58000000000001	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-01-31 21:24:21.812
2df9a75b-0a4a-4f46-9b33-40c6ea32e227	c1b3a025-1630-49f4-875d-f8bf35b6a422	CLIENT_PAYMENT	72.25	\N	\N	2026-01-31 21:25:13.423
41caad64-a12e-4e4a-97e4-bdb29234f664	c1b3a025-1630-49f4-875d-f8bf35b6a422	PLATFORM_COMMISSION	7.225000000000001	\N	\N	2026-01-31 21:25:13.423
097758a1-33f4-400e-ac8d-60bd8439989c	c1b3a025-1630-49f4-875d-f8bf35b6a422	VAT	1.445	\N	\N	2026-01-31 21:25:13.423
50528335-2e59-45c9-896b-5a2c33ad6820	c1b3a025-1630-49f4-875d-f8bf35b6a422	TRANSPORTEUR_PAYOUT	63.58000000000001	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-01-31 21:25:13.423
77edf831-62cc-42f1-b322-54533c8145fa	d2d5e96d-56b7-46c2-b50c-f2900a1cb1f1	CLIENT_PAYMENT	47.6	\N	\N	2026-01-31 21:28:50.519
40d616ad-8d31-4773-896c-0bad6aafdf5f	d2d5e96d-56b7-46c2-b50c-f2900a1cb1f1	PLATFORM_COMMISSION	4.760000000000001	\N	\N	2026-01-31 21:28:50.519
c0c4cf41-db0e-4fa3-b91a-7816967735e2	d2d5e96d-56b7-46c2-b50c-f2900a1cb1f1	VAT	0.9520000000000002	\N	\N	2026-01-31 21:28:50.519
af62145d-95e7-4b63-88a9-f1b231cb5e1d	d2d5e96d-56b7-46c2-b50c-f2900a1cb1f1	TRANSPORTEUR_PAYOUT	41.88800000000001	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-01-31 21:28:50.519
3d36f916-b741-4b85-a318-fdbcffa9982c	096c5c71-7299-4ce3-9ef9-824297fd3a0f	CLIENT_PAYMENT	28.05	\N	\N	2026-01-31 23:22:54.231
c6f06d1e-8cd3-4dd6-8efe-4a0cedcf585a	096c5c71-7299-4ce3-9ef9-824297fd3a0f	PLATFORM_COMMISSION	2.805	\N	\N	2026-01-31 23:22:54.231
a1910c7d-5a98-47c7-8661-cfc463417095	096c5c71-7299-4ce3-9ef9-824297fd3a0f	VAT	0.561	\N	\N	2026-01-31 23:22:54.231
6294b5a7-2198-4f67-b295-6f3c88b33670	096c5c71-7299-4ce3-9ef9-824297fd3a0f	TRANSPORTEUR_PAYOUT	24.684	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-01-31 23:22:54.231
da42497e-aa84-45f0-984a-edbfcce8c12f	c412cdd9-995b-44a3-976b-051090590f66	CLIENT_PAYMENT	65.45	\N	\N	2026-01-31 23:43:14.427
c2f337a2-e442-4696-8f3f-72246000a692	c412cdd9-995b-44a3-976b-051090590f66	PLATFORM_COMMISSION	6.545000000000001	\N	\N	2026-01-31 23:43:14.427
75eec7e7-b90e-46f0-a075-0346df3ceb95	c412cdd9-995b-44a3-976b-051090590f66	VAT	1.309	\N	\N	2026-01-31 23:43:14.427
3dacf47b-21a5-4c5b-a54d-dd9b69e1437b	c412cdd9-995b-44a3-976b-051090590f66	TRANSPORTEUR_PAYOUT	57.596	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-01-31 23:43:14.427
2210aca1-51da-481d-8db1-fbefc31dd596	4f076e1b-8f30-498b-be4e-38276acf7fe4	CLIENT_PAYMENT	6.8	\N	\N	2026-02-01 09:12:59.883
511b83df-1352-43ab-a62d-975ab329f1a1	4f076e1b-8f30-498b-be4e-38276acf7fe4	PLATFORM_COMMISSION	0.68	\N	\N	2026-02-01 09:12:59.883
6b588f64-4508-4522-9c28-0ccef8a9e51d	4f076e1b-8f30-498b-be4e-38276acf7fe4	VAT	0.136	\N	\N	2026-02-01 09:12:59.883
b573d7b2-5d9b-4abf-b3bd-826ca7ea1bd8	4f076e1b-8f30-498b-be4e-38276acf7fe4	TRANSPORTEUR_PAYOUT	5.984	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-01 09:12:59.883
4cdbd4d2-099c-4a1e-856d-5d70c0f09248	e96d368b-061f-477c-ae4e-1ddd93fb30b3	CLIENT_PAYMENT	28.05	\N	\N	2026-02-01 10:04:52.92
6e291b7d-c5ca-44a4-83e9-9225ee571848	e96d368b-061f-477c-ae4e-1ddd93fb30b3	PLATFORM_COMMISSION	2.805	\N	\N	2026-02-01 10:04:52.92
3d63dc17-8358-4124-b520-d5f558216522	e96d368b-061f-477c-ae4e-1ddd93fb30b3	VAT	0.561	\N	\N	2026-02-01 10:04:52.92
e4c35a6e-154b-4484-bd7b-ad4f5dbb0c0d	e96d368b-061f-477c-ae4e-1ddd93fb30b3	TRANSPORTEUR_PAYOUT	24.684	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-01 10:04:52.92
544d03b4-f000-419d-b3e1-c69c42821de4	ba651f87-b4b7-4a27-b4bc-22cd226069f3	CLIENT_PAYMENT	58.65	\N	\N	2026-02-01 18:38:27.116
69fe871f-b125-43e7-a611-f6f4d897fb33	ba651f87-b4b7-4a27-b4bc-22cd226069f3	PLATFORM_COMMISSION	5.865	\N	\N	2026-02-01 18:38:27.116
526822a8-05d3-4d4e-beac-c1adc8f14a11	ba651f87-b4b7-4a27-b4bc-22cd226069f3	VAT	1.173	\N	\N	2026-02-01 18:38:27.116
73c69c18-fe46-4b23-b013-36a9f75805f4	ba651f87-b4b7-4a27-b4bc-22cd226069f3	TRANSPORTEUR_PAYOUT	51.61199999999999	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-01 18:38:27.116
426f9027-8172-43dc-a9cb-0f32f0e4cc6d	0a503de3-1410-49cc-ba33-da19a0b6fbf4	CLIENT_PAYMENT	68.85	\N	\N	2026-02-01 18:45:52.642
fad78c38-3c76-4c87-9cc4-d4b25bf93637	0a503de3-1410-49cc-ba33-da19a0b6fbf4	PLATFORM_COMMISSION	6.885	\N	\N	2026-02-01 18:45:52.642
534b5e14-e9ae-4e68-acd9-7b243afa73a1	0a503de3-1410-49cc-ba33-da19a0b6fbf4	VAT	1.377	\N	\N	2026-02-01 18:45:52.642
496a97c2-a63b-42ca-8404-a454b50b8c1a	0a503de3-1410-49cc-ba33-da19a0b6fbf4	TRANSPORTEUR_PAYOUT	60.58799999999999	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-01 18:45:52.642
7feb61cb-1ec2-4259-abbe-5e1fdaae4c4d	9524b897-17b8-4b52-ada1-fadbca2ce4ad	CLIENT_PAYMENT	72.25	\N	\N	2026-02-01 19:54:55.22
467ce711-e06a-4fb4-92b3-96b3b1c00bfd	9524b897-17b8-4b52-ada1-fadbca2ce4ad	PLATFORM_COMMISSION	7.225000000000001	\N	\N	2026-02-01 19:54:55.22
b04e7adc-4b14-4af5-ae0b-088a1bcfd7f8	9524b897-17b8-4b52-ada1-fadbca2ce4ad	VAT	1.445	\N	\N	2026-02-01 19:54:55.22
9c438050-fd9c-4e91-abe4-9a969ffb6f0f	9524b897-17b8-4b52-ada1-fadbca2ce4ad	TRANSPORTEUR_PAYOUT	63.58000000000001	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-01 19:54:55.22
ea0286db-a632-40dc-9168-c664fc4e72f3	e34328ca-e162-4a43-b00b-fe5d04c66659	CLIENT_PAYMENT	28.05	\N	\N	2026-02-01 22:17:43.035
82032d69-9a45-4d86-9788-01b8b485a34d	e34328ca-e162-4a43-b00b-fe5d04c66659	PLATFORM_COMMISSION	2.805	\N	\N	2026-02-01 22:17:43.035
1ecf9ea4-0bc7-44b7-ba0c-8fb544e5f606	e34328ca-e162-4a43-b00b-fe5d04c66659	VAT	0.561	\N	\N	2026-02-01 22:17:43.035
69b9dbe7-4d9f-40ef-95a6-3b311ca6b0bb	e34328ca-e162-4a43-b00b-fe5d04c66659	TRANSPORTEUR_PAYOUT	24.684	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-01 22:17:43.035
90eebdbc-28ef-4855-a7c0-576268e3246d	85e0f3a5-eeb2-4507-8761-611c2dd9c333	CLIENT_PAYMENT	28.05	\N	\N	2026-02-01 22:36:51.838
8703da3e-cb54-48bb-a16c-949f5c0cb955	85e0f3a5-eeb2-4507-8761-611c2dd9c333	PLATFORM_COMMISSION	2.805	\N	\N	2026-02-01 22:36:51.838
1fd24d14-125f-4c6e-911b-43210f4c443c	85e0f3a5-eeb2-4507-8761-611c2dd9c333	VAT	0.561	\N	\N	2026-02-01 22:36:51.838
5a1301ae-ad05-47de-923e-29a96813ca6f	85e0f3a5-eeb2-4507-8761-611c2dd9c333	TRANSPORTEUR_PAYOUT	24.684	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-01 22:36:51.838
\.


--
-- TOC entry 5323 (class 0 OID 160068)
-- Dependencies: 225
-- Data for Name: Parcel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Parcel" (id, "bookingId", "weightKg", "lengthCm", "widthCm", "heightCm", "estimatedValue", "verifiedAt", "verifiedHeightCm", "verifiedLengthCm", "verifiedWeightKg", "verifiedWidthCm") FROM stdin;
406e0b79-d0df-4e15-8c10-918f3b70c4eb	df515f24-4855-4595-bba3-695d57f83897	1	10	10	10	3	\N	\N	\N	\N	\N
fc074c9a-5e26-43a0-b5f2-d0886453af76	ceea2ef2-5809-4095-b765-ff149e2458a2	1	10	10	10	0	\N	\N	\N	\N	\N
d8df5af1-1c9a-4b33-baec-8ff2d59a4248	5ec2e853-f1dd-4283-987d-9195de9bf1c9	10	10	10	10	10	\N	\N	\N	\N	\N
614eaa9f-09e8-4e2a-9b0a-405065eccbf1	42a1c70c-7780-4475-b180-da759034cf94	10	10	10	10	0	\N	\N	\N	\N	\N
2145134a-795a-442c-ace5-eba4a5ddbafd	eb7af912-dc1a-49c6-9efa-01532b5a3929	19	10	10	10	12	\N	\N	\N	\N	\N
4b65709c-3f62-444c-b6b3-f63970be0918	5aa57092-c962-4558-a1fa-570a671d52e9	1	10	10	10	0	\N	\N	\N	\N	\N
0a8418c4-a530-4532-8798-a5426ec66b6c	a7a1d85d-db28-4eaa-9cb6-c140545a55dc	1	10	10	10	2	\N	\N	\N	\N	\N
c8bd9fdf-f985-473a-accd-da9cc9a49004	14f9d43b-6e5a-4630-9709-1778268c9115	17	10	10	10	0	\N	\N	\N	\N	\N
7ec2fc05-008c-4560-84f7-73b721375ca6	f546e3e1-3b66-451e-b3d6-5e6dc188fef6	10	10	10	10	43	2026-01-31 21:18:31.137	10	10	10	10
abc19989-04c7-4548-b920-1472ef778deb	f487ab2a-03c5-45b7-8c2a-a045963731ba	14	10	10	10	1	2026-01-31 22:22:04.654	10	10	15	10
93c429a5-713d-41c6-8f79-f85f8367b9f4	6d09ac29-4872-4119-bb08-7dc16ea7c1d4	1	10	10	10	212	2026-01-31 23:21:43.386	10	10	1	10
afa9dad3-ff6c-48df-a33f-a48caee992ab	8cef572b-2c9a-4227-b0e5-812df4d23502	13	104	104	104	118	2026-01-31 23:43:09.986	104	104	13	104
0d20a9fc-9905-497d-a830-ff18efd40446	773fbd21-25b1-4af9-ac2b-1ccf7ee0b931	1	10	10	10	0	2026-02-01 09:12:52.678	10	10	12	10
671387cd-12d5-4a39-9ae5-0b5beb0d549d	272beb00-eb8b-4144-9721-a091a50f5c4f	11	10	10	10	3	2026-02-01 18:38:23.901	10	10	11	10
e9f0d7c4-c818-4fed-bfa2-87ce6456a33f	d8b019e2-efc4-432d-8d52-fddb58b7567f	14	10	10	10	0	2026-02-01 18:45:50.319	10	10	14	10
626b36b0-e8c2-424d-a809-038babe0e6a4	46387ddf-3ece-46b6-b270-67e3230423a2	10	10	10	10	0	2026-02-01 19:54:51.337	10	10	10	10
90c3e698-e654-45f0-9532-7b940c74889c	390947ef-0626-4248-b13e-e1b9fd96a0e0	1	100	100	100	100	2026-02-01 22:36:48.272	100	100	1	100
\.


--
-- TOC entry 5324 (class 0 OID 160079)
-- Dependencies: 226
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PasswordResetToken" (id, "userId", token, "expiresAt", "usedAt", "createdAt") FROM stdin;
87c42dbe-dae9-4767-a893-fcb34e031a96	644fa511-ef92-4a2e-b313-26141774f3c9	7ee4e0d1-a032-4e4b-aaf6-6f7938f83dfc	2026-01-09 19:39:47.387	\N	2026-01-09 19:09:47.39
888de65e-930d-49b0-a54c-2ad2195b1852	cab63e9b-6fb5-4112-8734-4a2ce716ab47	b025ec68-00cc-446f-aa1d-840dbb4eb420	2026-01-11 06:59:09.475	\N	2026-01-11 06:29:09.478
8d6e151c-1e14-4f09-946d-748382599129	cab63e9b-6fb5-4112-8734-4a2ce716ab47	bb117a0f-4645-40c3-af02-2dd7ccf2d737	2026-01-11 11:38:05.814	\N	2026-01-11 11:08:05.817
2900d0e0-427b-4fe9-98df-b3ed2cec4c91	cab63e9b-6fb5-4112-8734-4a2ce716ab47	b3a26307-3a5a-41ba-8ce3-a358b4b5323b	2026-01-13 19:26:08.487	\N	2026-01-13 18:56:08.491
d97ecfc8-faf1-4adb-84fd-6cfe20027068	cab63e9b-6fb5-4112-8734-4a2ce716ab47	3a7d71ac-d075-4649-9716-b71d28b90943	2026-01-13 23:24:08.864	\N	2026-01-13 22:54:08.868
\.


--
-- TOC entry 5325 (class 0 OID 160090)
-- Dependencies: 227
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Profile" (id, "userId", mobile, address, "postalCode", city, country, "createdAt", "updatedAt") FROM stdin;
16456a74-5ece-4d2a-8bf6-aa8dc292100c	cab63e9b-6fb5-4112-8734-4a2ce716ab47						2026-01-20 10:55:21.687	2026-01-20 10:55:21.687
a28bd290-8710-4210-9a65-4c1512c042c4	644fa511-ef92-4a2e-b313-26141774f3c9	0702852958	Getgatan 16	4116	Paris	France	2026-01-20 13:23:37.315	2026-01-20 13:23:37.315
\.


--
-- TOC entry 5326 (class 0 OID 160105)
-- Dependencies: 228
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, token, "userId", "revokedAt", "expiresAt", "createdAt") FROM stdin;
d688c010-0057-4b9b-b884-435e04e3fb86	1146456f-a81f-4141-9701-d0ad87019591	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-10 12:59:15.956	2026-02-03 12:59:15.959
86827c2e-599f-4256-beca-3ce91065641d	4a5d1375-4399-4b05-80f6-974bd6a18eef	d16b0779-154d-4168-ba8c-c04c1b8beb2a	\N	2026-02-10 12:59:35.354	2026-02-03 12:59:35.358
15eedfa9-1b60-4e21-9eb6-a5c140337ac9	d14ca88a-2693-41cb-90ed-7d331c3ec357	644fa511-ef92-4a2e-b313-26141774f3c9	\N	2026-02-10 13:59:36.216	2026-02-03 13:59:36.217
f34b2aee-76a4-40f0-8948-84a8fddf0d01	5118bd9e-b110-4b53-9862-d248b0ac40e4	d16b0779-154d-4168-ba8c-c04c1b8beb2a	\N	2026-02-10 21:32:49.928	2026-02-03 21:32:49.932
f115e83a-7eaa-4719-80ce-64a9218b1f8f	f5f63a61-9c29-4245-b562-747420fef6f7	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-11 16:50:00.904	2026-02-04 16:50:00.905
a7fba211-0daf-4e66-8b8c-09cc4210cb1d	ee6472d3-e7c0-469a-92ea-35c0049d9947	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N	2026-02-11 20:55:01.521	2026-02-04 20:55:01.524
78a7fd52-105e-42fa-bdd5-33138c00cbb6	1e34062a-4904-469a-8d4a-870ed6cc3243	d16b0779-154d-4168-ba8c-c04c1b8beb2a	\N	2026-02-11 21:00:45.707	2026-02-04 21:00:45.708
d3cfe7c0-b6cf-4765-b7bf-66d086e25cd9	bed028ce-c1fd-4e28-af65-f5909167cff1	644fa511-ef92-4a2e-b313-26141774f3c9	\N	2026-02-11 21:04:37.109	2026-02-04 21:04:37.114
\.


--
-- TOC entry 5327 (class 0 OID 160116)
-- Dependencies: 229
-- Data for Name: TripPricingRule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TripPricingRule" (id, "tripId", "minKg", "maxKg", price) FROM stdin;
56f63c29-2cca-49cf-92be-b3d42c86fe3e	6f91d6fd-b128-4697-909f-0fb871d68586	0	5	8
e03821d3-6b57-4ce8-9371-d2ea0d14b42f	6f91d6fd-b128-4697-909f-0fb871d68586	6	10	6
64497208-91aa-48a2-8f8f-4e9574a50372	6f91d6fd-b128-4697-909f-0fb871d68586	11	50	4
1b914833-2fd8-45bf-9a42-45d158166906	58561c97-b1b9-4f63-8080-3bd609222e83	1	10	8
44800d47-6354-4a3c-bcb6-cfd3fc3934ac	58561c97-b1b9-4f63-8080-3bd609222e83	10	50	5
\.


--
-- TOC entry 5328 (class 0 OID 160126)
-- Dependencies: 230
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, role, status, phone, "firstName", "lastName", "lastLoginAt", "createdAt", "updatedAt", "deletedAt", "cashAllowed", "companyName", "companyRegistrationId") FROM stdin;
248916cf-b399-4590-b22c-33fbff5dfbbd	test@test.com	$2b$10$xSg/IPQ5d/jC1k0kGtFpaePZLK9WXzMqpIadeRcuk.Y2Z3xzg3cni	TRANSPORTEUR	ACTIVE	\N	\N	\N	\N	2026-01-08 08:24:26.181	2026-01-08 08:24:26.181	\N	f	\N	\N
cab63e9b-6fb5-4112-8734-4a2ce716ab47	testo@test.com	$2b$10$vFESb8Bf2R50NUxBIMEZquHf3McxwY6FmTS8VDU28XLRYqefhHb.S	TRANSPORTEUR	ACTIVE	\N	\N	\N	\N	2026-01-09 19:12:00.395	2026-01-09 19:12:00.395	\N	f	\N	\N
030acda7-5721-4b45-afcc-dd63111fe562	a@a.com	$2b$10$toAlhDC1711v8s6NXYkDwO.ZGuMJiGyalu0IWWi8qVqfRvIY2XFt6	TRANSPORTEUR	PENDING	\N	\N	\N	\N	2026-01-11 12:44:53.268	2026-01-11 12:44:53.268	\N	f	\N	\N
d399db6d-64ac-4a73-99f5-158cde3f1145	b@b.com	$2b$10$tRk2F7saeGxODIZJCETTI.8Mpk.cqe6VHg2eNUU82Le.OaZWhukDS	TRANSPORTEUR	PENDING	\N	\N	\N	\N	2026-01-13 22:53:14.517	2026-01-13 22:53:14.517	\N	f	\N	\N
644fa511-ef92-4a2e-b313-26141774f3c9	testhannasara_@hotmail.com	$2b$10$vFESb8Bf2R50NUxBIMEZquHf3McxwY6FmTS8VDU28XLRYqefhHb.S	CLIENT	ACTIVE	0704242424	Teston	Trello	\N	2026-01-08 08:23:11.877	2026-01-08 08:23:11.877	\N	f	\N	\N
6ff474eb-0ecb-421f-8830-ad363039bfcc	hub@hub.com	644fa511-ef92-4a2e-b313-26141774f3c9	HUB_MANAGER	ACTIVE	\N	\N	\N	\N	2026-01-11 06:34:45.762	2026-01-11 06:34:45.762	\N	f	\N	\N
d16b0779-154d-4168-ba8c-c04c1b8beb2a	admin@admin.com	$2b$10$zvoZP95mXMSqV6zrQIhulOQbtWLtk5pvVFAOa7D32ABWkD3S9qX42	ADMIN	ACTIVE	\N	\N	\N	\N	2026-02-02 08:58:39.502	2026-02-02 08:58:39.502	\N	f	\N	\N
\.


--
-- TOC entry 5329 (class 0 OID 160142)
-- Dependencies: 231
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
989ef0be-b1b7-476e-a44c-b520019020be	232b6f69b862ad3cb36f4dcf0a49e7f9b2b9321a2c6e4eb58f6a8eca5674347d	2026-01-02 20:05:19.237384+01	20260101002808_recipients	\N	\N	2026-01-02 20:05:19.230368+01	1
dd362e76-64ae-4d43-b39b-4a3dd76d030c	8568f0576b827672c98058e5da4722a279a3759893cd9f509a09db3603be4399	2026-01-02 20:05:18.849777+01	20251229012112_init_v3	\N	\N	2026-01-02 20:05:18.754431+01	1
9f57a2c1-89dd-4af8-b397-acac78bea9b9	96d7662f718e69c9046869a788a83ab1ffc6dad7233e1252a9c1ba107178ae25	2026-01-02 20:05:18.904507+01	20251229132858_fix_user_relations	\N	\N	2026-01-02 20:05:18.86818+01	1
f92a76e6-3f89-4b7e-bc9d-6f717d2db12d	c223f1eb0b85721e0e6a1edcf686cc9784cf800405104db0bd4fef454de524de	2026-02-02 20:43:06.341161+01	20260202194306_trackingevents	\N	\N	2026-02-02 20:43:06.296019+01	1
141fccdf-a5db-44c3-9901-4e7d90bfa30f	b635f53851a2e3aaa7c3e705f93fbd95b39bec72577a886747ac60080f44cd39	2026-01-02 20:05:18.941594+01	20251229213251_add_disputes	\N	\N	2026-01-02 20:05:18.920231+01	1
36edb23c-fcd4-4de5-b2e7-0d7197e191ab	d76b1f02607316cec868c5ce252a2dab1a4d6c5f4c8f73da38f03c86bcef1a1b	2026-01-02 20:05:19.256055+01	20260101200005_stripe_intent_id	\N	\N	2026-01-02 20:05:19.251491+01	1
b5e2320d-008d-4983-8b45-f21e82b2de75	9aad5d629d583e5fcff56a54e71308f4adf9a3c76382c989cd2d9cc53efa1ce9	2026-01-02 20:05:18.972112+01	20251229221104_add_kyc	\N	\N	2026-01-02 20:05:18.956106+01	1
125b4d49-881b-47b7-bea3-16ad7156889a	1301bd372fceff11ff55f572603b5a120e88352ae9a0321b1ecdefba0ca380e5	2026-01-02 20:05:19.003374+01	20251229235756_audit_log_user_relation	\N	\N	2026-01-02 20:05:18.986444+01	1
5026ab40-42d9-4f1d-a402-268565805580	0c01a26b6d37aa622b344d0c22b40ffdfe1a72a8edc7919e5ca610d366adfa2e	2026-01-21 09:27:28.3744+01	20260121082728_add_customs_items	\N	\N	2026-01-21 09:27:28.32685+01	1
8b7d8464-53e7-4ca9-8cf5-a65de2c72771	295e29398fd837979570f7407272bd0cceeda72be9de4024fca6da1e363b5f7e	2026-01-02 20:05:19.058481+01	20251231091921_add_user_status_pending	\N	\N	2026-01-02 20:05:19.018948+01	1
87dfc492-4211-4263-be9e-b322829aa862	10ccee61fe31a467c4f3224308d21e1f6677756936723589967a1c7b2f6f07ad	2026-01-02 20:05:19.300342+01	20260102003155_trips	\N	\N	2026-01-02 20:05:19.271058+01	1
642c0bca-89f2-483e-9b4f-53342bdc92cb	773bcd3f5d08576c9c15db9f30b398bd5b234e1ae61d57f195dbab8087c42b85	2026-01-02 20:05:19.076546+01	20251231104913_add_recipient_role	\N	\N	2026-01-02 20:05:19.072206+01	1
297a627c-52ec-4ed2-bd7d-5570bd0282fe	06bff7193fbb66681fa3ca8b15ca64ca7085660858fb60c4034aac829c14062d	2026-01-02 20:05:19.103523+01	20251231124810_password_reset	\N	\N	2026-01-02 20:05:19.09105+01	1
cea406c2-9636-4719-9a7f-0b7cfc5b0794	fccaa1deab35c9da6face7d52d71d0939b9119bde495b2c75efdf02e246c7d07	2026-01-02 20:05:19.131168+01	20251231140948_refresh_tokens	\N	\N	2026-01-02 20:05:19.117832+01	1
ed7e0024-8448-4d10-892f-64c7fecb22ca	5f8f34301cbf292d321386836363425a99b034b1914f040a18cc29227561101a	2026-01-07 20:33:51.709456+01	20260107193351_trip_staus	\N	\N	2026-01-07 20:33:51.67917+01	1
6dca0a6f-b834-4a35-9d34-d5b5adfeddae	44069738e02aa388a2953b3cbfe620a2528300654edc993eaa79d5a0cabb2aa5	2026-01-02 20:05:19.151869+01	20251231215915_yyy	\N	\N	2026-01-02 20:05:19.146645+01	1
2b12768e-31b8-47c4-8612-f99891529f6e	0da477cb05ba22a225e23f33ec2c315f3332bd32a3ca120b9050b0cfee4c9a39	2026-01-02 20:05:19.178636+01	20251231221234_pricing	\N	\N	2026-01-02 20:05:19.166483+01	1
6642e0f6-8be9-436e-b363-895cb99a458e	f4f87fed879ccf0f088fb8eca1f680d15e0ab279297752f813283dfc1718ffd6	2026-01-26 20:09:23.096599+01	20260126190923_add_transporteur_pickup_artifacts	\N	\N	2026-01-26 20:09:23.067474+01	1
4158c084-3cba-45c1-ae6f-4dcf7c54271b	2ee9249ba88e479ee964c38a575cac82395b42834423cf562e86e00230eaaaac	2026-01-02 20:05:19.194733+01	20251231225840_pickup_option	\N	\N	2026-01-02 20:05:19.190069+01	1
688766f5-2be2-4833-beab-f2c7687a5b77	7bbb207d73330fd6de8629b52671eac3772c24f28a75c8ac4103b37d6b27015e	2026-01-11 20:45:03.568738+01	20260111194503_cash_allowed_by_admin	\N	\N	2026-01-11 20:45:03.545762+01	1
363057c3-aa3a-4e6d-b971-47dda315505c	2e72d94396a0393ea44139a8e2c95a6af24b8d997495b339cbbb73e49b385cac	2026-01-02 20:05:19.214639+01	20251231230853_booking	\N	\N	2026-01-02 20:05:19.207733+01	1
08b7e292-1605-460a-bf32-63da72455974	5c709d530610717eae157165504a5b63f1754f6bbd81ae67bfe898100a7ae5aa	2026-01-21 13:21:16.384871+01	20260121122116_add_customs2_items	\N	\N	2026-01-21 13:21:16.316228+01	1
dccee2d3-4db8-478f-ad4c-811839c8515c	aba834e1879fbe80004bfcc6330c725950c2ba7349c61dbf1d4c0b833c605290	2026-01-19 12:07:13.370573+01	20260119110713_more_trip_statuses	\N	\N	2026-01-19 12:07:13.360238+01	1
63850a84-e895-431f-9387-f0c77f1e1c20	f2b275c67dcd8810f81d0c284c3d01c475e2c75313f8052db57a9bac3ff31b26	2026-01-19 16:07:25.75407+01	20260119150725_trip_dates_cities_capacity_m3	\N	\N	2026-01-19 16:07:25.733756+01	1
ef446e13-7b41-4754-ab18-a3fd4b4df58a	b8baedf138f7f1e6c844107308019786d81e0752439d1133ddfa9d53beca073b	2026-01-26 14:52:33.513742+01	20260126135233_add_transporteur_pickup_execution	\N	\N	2026-01-26 14:52:33.458156+01	1
33cf3765-e837-4535-b591-1cf9f48adda4	ee0a4d0823902e9759b16b7ba0dcdd3015f189e979e8d2479a66e78f20ffecda	2026-01-19 16:58:19.516694+01	20260119155819_cpacity_m3insteadofm3	\N	\N	2026-01-19 16:58:19.500048+01	1
15ca75d6-1cb3-4ca8-85ae-337c96dae0ff	abb1e04b38608501e63390c59a94b9e5f86717b2325e9b25610189e336d877f0	2026-01-20 09:42:22.159365+01	20260120084222_add_profile_model	\N	\N	2026-01-20 09:42:22.116794+01	1
3d0ffc08-9bb3-45be-9727-c46df42e10ed	4c9de437298153f7c098d90f0d23dae6a68ebc02ad8e115da9d855739d266767	2026-01-26 15:56:23.011307+01	20260126145622_add_transporteur_pickup_statuses	\N	\N	2026-01-26 15:56:23.0033+01	1
ce653298-31c0-4ff1-bb52-e21415b8c796	f7282ff3f8622ddb35cf87cae1671f2afa6930b2be57819e8c2ba7ea0513b1fd	2026-01-27 08:32:26.136111+01	20260127073226_add_parcel_verification	\N	\N	2026-01-27 08:32:26.128232+01	1
6e1cc072-0e6a-456c-888a-d31212da9172	d9085950e9424bbf27969b8a60ffa37690953b14d589fa6d9d1e24748b58cb4e	2026-01-26 20:04:33.8932+01	20260126190433_add_transporteur_pickup_verification_artifacts	\N	\N	2026-01-26 20:04:33.881132+01	1
44c2e54c-1269-44d4-8c8e-787656e1af36	4db90ab010207053d071891bed8b1343b81833df7f8e2bc8ccebaea374f3dc40	2026-01-29 08:31:30.992117+01	20260129073130_add_company_identity_to_user	\N	\N	2026-01-29 08:31:30.957251+01	1
aae2b562-a0ce-4788-856b-ac9640b8a259	aee14025e571c609ef50c02e526438c8be847cda3426b9d9d7a47e3a252b39e1	2026-02-08 12:17:37.262597+01	20260208111737_add_hub_without_multileg	\N	\N	2026-02-08 12:17:37.21099+01	1
b40d3a65-c50d-4d45-b252-4d8270ac7c8a	c19d3d069c1fa4699971dbc6e98019aa885349ac2fcab7351c2778f258d2f4d3	2026-02-10 12:23:15.741301+01	20260210112315_hub_opnings_hours	\N	\N	2026-02-10 12:23:15.511645+01	1
\.


--
-- TOC entry 5330 (class 0 OID 160154)
-- Dependencies: 232
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, "clientId", "recipientId", status, "pickupStatus", "prepaidAmount", "remainingAmount", "createdAt", "deliveryPrice", "parcelWeightKg", "pickupFee", "pickupOption", "totalPrice", "tripId", "recipientSnapshot", "destinationHubId", "originHubId", "updatedAt") FROM stdin;
df515f24-4855-4595-bba3-695d57f83897	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	4.950000000000000000000000000000	28.050000000000000000000000000000	2026-01-24 06:46:38.466	8	1	25	STANDARD	33	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
ceea2ef2-5809-4095-b765-ff149e2458a2	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	4.950000000000000000000000000000	28.050000000000000000000000000000	2026-01-24 07:16:17.298	8	1	25	STANDARD	33	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
5ec2e853-f1dd-4283-987d-9195de9bf1c9	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	12.750000000000000000000000000000	72.250000000000000000000000000000	2026-01-24 07:51:32.204	60	10	25	STANDARD	85	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
42a1c70c-7780-4475-b180-da759034cf94	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	12.750000000000000000000000000000	72.250000000000000000000000000000	2026-01-24 09:24:20.866	60	10	25	STANDARD	85	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
eb7af912-dc1a-49c6-9efa-01532b5a3929	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	15.150000000000000000000000000000	85.849999999999990000000000000000	2026-01-24 10:13:41.122	76	19	25	STANDARD	101	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
5aa57092-c962-4558-a1fa-570a671d52e9	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	4.950000000000000000000000000000	28.050000000000000000000000000000	2026-01-24 15:31:10.305	8	1	25	STANDARD	33	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
a7a1d85d-db28-4eaa-9cb6-c140545a55dc	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	4.950000000000000000000000000000	28.050000000000000000000000000000	2026-01-24 16:11:34.024	8	1	25	STANDARD	33	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
14f9d43b-6e5a-4630-9709-1778268c9115	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	13.950000000000000000000000000000	79.050000000000000000000000000000	2026-01-24 17:28:19.071	68	17	25	STANDARD	93	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
f546e3e1-3b66-451e-b3d6-5e6dc188fef6	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	12.750000000000000000000000000000	72.250000000000000000000000000000	2026-01-29 07:51:41.673	60	10	25	STANDARD	85	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
6d09ac29-4872-4119-bb08-7dc16ea7c1d4	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	4.950000000000000000000000000000	28.050000000000000000000000000000	2026-01-25 19:07:50.622	8	1	25	SCHEDULED	33	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
8cef572b-2c9a-4227-b0e5-812df4d23502	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	11.550000000000000000000000000000	65.450000000000000000000000000000	2026-01-25 17:03:50.418	52	13	25	STANDARD	77	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
272beb00-eb8b-4144-9721-a091a50f5c4f	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	10.350000000000000000000000000000	58.650000000000000000000000000000	2026-01-24 20:35:25.219	44	11	25	STANDARD	69	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
d8b019e2-efc4-432d-8d52-fddb58b7567f	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	12.150000000000000000000000000000	68.849999999999990000000000000000	2026-01-24 19:59:37.3	56	14	25	STANDARD	81	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
46387ddf-3ece-46b6-b270-67e3230423a2	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	12.750000000000000000000000000000	72.250000000000000000000000000000	2026-01-24 17:00:38.829	60	10	25	STANDARD	85	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
390947ef-0626-4248-b13e-e1b9fd96a0e0	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	IN_TRANSIT	CONFIRMED	4.950000000000000000000000000000	28.050000000000000000000000000000	2026-01-25 19:02:45.949	8	1	25	STANDARD	33	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
f487ab2a-03c5-45b7-8c2a-a045963731ba	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	8.400000000000000000000000000000	47.600000000000000000000000000000	2026-01-27 07:34:41.9	56	14	0	STANDARD	56	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
773fbd21-25b1-4af9-ac2b-1ccf7ee0b931	644fa511-ef92-4a2e-b313-26141774f3c9	b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	CREATED	NONE	1.200000000000000000000000000000	6.800000000000000000000000000000	2026-01-25 19:39:28.582	8	1	0	STANDARD	8	6f91d6fd-b128-4697-909f-0fb871d68586	{"city": "MalmÃ¶", "name": "Mekki Ben Othman", "email": "mekki_bo@hotmail.com", "phone": "0702652951", "address": "GÃ¶tgatan 16B", "country": "Sweden", "postalCode": "2116"}	\N	\N	2026-02-08 12:17:37.214
\.


--
-- TOC entry 5341 (class 0 OID 180163)
-- Dependencies: 243
-- Data for Name: hub_opening_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hub_opening_hours (id, "hubId", day, "openTime", "closeTime", "isClosed", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5340 (class 0 OID 163811)
-- Dependencies: 242
-- Data for Name: hubs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hubs (id, name, type, status, country, city, address, "postalCode", "maxParcelWeightKg", "maxParcelVolumeM3", "occupiedWeightKg", "occupiedVolumeM3", "managerId", "createdAt", "updatedAt", "kycId") FROM stdin;
\.


--
-- TOC entry 5331 (class 0 OID 160175)
-- Dependencies: 233
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "bookingId", amount, method, status, "createdAt", "userId", "stripeIntentId") FROM stdin;
3727e6e9-f032-4373-a0d7-d302b980127e	f546e3e1-3b66-451e-b3d6-5e6dc188fef6	72.250000000000000000000000000000	CASH	COMPLETED	2026-01-31 21:24:21.779	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
c1b3a025-1630-49f4-875d-f8bf35b6a422	f546e3e1-3b66-451e-b3d6-5e6dc188fef6	72.250000000000000000000000000000	CASH	COMPLETED	2026-01-31 21:25:13.418	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
d2d5e96d-56b7-46c2-b50c-f2900a1cb1f1	f487ab2a-03c5-45b7-8c2a-a045963731ba	47.600000000000000000000000000000	CASH	COMPLETED	2026-01-31 21:28:50.514	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
096c5c71-7299-4ce3-9ef9-824297fd3a0f	6d09ac29-4872-4119-bb08-7dc16ea7c1d4	28.050000000000000000000000000000	CASH	COMPLETED	2026-01-31 23:22:54.225	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
c412cdd9-995b-44a3-976b-051090590f66	8cef572b-2c9a-4227-b0e5-812df4d23502	65.450000000000000000000000000000	CASH	COMPLETED	2026-01-31 23:43:14.42	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
4f076e1b-8f30-498b-be4e-38276acf7fe4	773fbd21-25b1-4af9-ac2b-1ccf7ee0b931	6.800000000000000000000000000000	CASH	COMPLETED	2026-02-01 09:12:59.876	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
e96d368b-061f-477c-ae4e-1ddd93fb30b3	390947ef-0626-4248-b13e-e1b9fd96a0e0	28.050000000000000000000000000000	CASH	COMPLETED	2026-02-01 10:04:52.912	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
ba651f87-b4b7-4a27-b4bc-22cd226069f3	272beb00-eb8b-4144-9721-a091a50f5c4f	58.650000000000000000000000000000	CASH	COMPLETED	2026-02-01 18:38:27.109	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
0a503de3-1410-49cc-ba33-da19a0b6fbf4	d8b019e2-efc4-432d-8d52-fddb58b7567f	68.849999999999990000000000000000	CASH	COMPLETED	2026-02-01 18:45:52.635	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
9524b897-17b8-4b52-ada1-fadbca2ce4ad	46387ddf-3ece-46b6-b270-67e3230423a2	72.250000000000000000000000000000	CASH	COMPLETED	2026-02-01 19:54:55.214	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
e34328ca-e162-4a43-b00b-fe5d04c66659	390947ef-0626-4248-b13e-e1b9fd96a0e0	28.050000000000000000000000000000	CASH	COMPLETED	2026-02-01 22:17:43.03	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
85e0f3a5-eeb2-4507-8761-611c2dd9c333	390947ef-0626-4248-b13e-e1b9fd96a0e0	28.050000000000000000000000000000	CASH	COMPLETED	2026-02-01 22:36:51.831	cab63e9b-6fb5-4112-8734-4a2ce716ab47	\N
\.


--
-- TOC entry 5332 (class 0 OID 160187)
-- Dependencies: 234
-- Data for Name: pickup_proposals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pickup_proposals (id, "bookingId", "startTime", "endTime", rejected, "createdAt", "pickupSlotId") FROM stdin;
\.


--
-- TOC entry 5333 (class 0 OID 160201)
-- Dependencies: 235
-- Data for Name: pickup_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pickup_sessions (id, "bookingId", "startedAt", "completedAt", "finalWeightKg", "finalLengthCm", "finalWidthCm", "finalHeightCm", "cashCollected", status) FROM stdin;
374b965b-6570-4820-9601-54272c972dc5	390947ef-0626-4248-b13e-e1b9fd96a0e0	2026-02-01 20:48:58.599	2026-02-01 22:36:51.843	\N	\N	\N	\N	28.05	COMPLETED
\.


--
-- TOC entry 5334 (class 0 OID 160212)
-- Dependencies: 236
-- Data for Name: pickup_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pickup_slots (id, "transporteurId", date, "startTime", "endTime", capacity, "isActive", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5335 (class 0 OID 160228)
-- Dependencies: 237
-- Data for Name: recipients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipients (id, phone, address, country, city, "clientId", "createdAt", email, "firstName", "lastName", "postalCode", "updatedAt") FROM stdin;
b6d8f06c-737f-40a0-ae14-0ddbed0bb7ea	0702652951	GÃ¶tgatan 16B	Sweden	MalmÃ¶	644fa511-ef92-4a2e-b313-26141774f3c9	2026-01-23 19:06:01.171	mekki_bo@hotmail.com	Mekki	Ben Othman	2116	2026-01-23 19:06:01.171
\.


--
-- TOC entry 5336 (class 0 OID 160244)
-- Dependencies: 238
-- Data for Name: tracking_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tracking_events (id, "bookingId", "tripId", location, "createdAt", "eventType", message, status) FROM stdin;
\.


--
-- TOC entry 5337 (class 0 OID 160256)
-- Dependencies: 239
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (id, "transporteurId", "departureDate", "arrivalCountry", "arrivalDate", "capacityKg", "createdAt", "departureCountry", "pickupAddonFee", "cancelledAt", status, "arrivalCity", "departureCity", "previousArrivalDate", "previousDepartureDate", "capacityM3") FROM stdin;
58561c97-b1b9-4f63-8080-3bd609222e83	cab63e9b-6fb5-4112-8734-4a2ce716ab47	2026-03-01 00:00:00	Tunisia	2026-03-04 00:00:00	1750	2026-01-19 17:23:13.023	Sweden	35	\N	DRAFT	Sfax	Stockholm	\N	\N	28
6f91d6fd-b128-4697-909f-0fb871d68586	cab63e9b-6fb5-4112-8734-4a2ce716ab47	2026-04-01 00:00:00	Algeria	2026-04-04 00:00:00	1700	2026-01-19 17:03:50.197	France	25	\N	PUBLISHED	Alger	Paris	\N	\N	22
\.


--
-- TOC entry 5338 (class 0 OID 160275)
-- Dependencies: 240
-- Data for Name: verification_artifacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_artifacts (id, "pickupId", "fileUrl", "createdAt", type) FROM stdin;
ba0aaa80-8ef0-4fd9-9d36-6002a2770253	374b965b-6570-4820-9601-54272c972dc5	http://localhost:3000/uploads/parcel/9138bf12-be50-4389-9a6e-f0e7d91704a1.png	2026-02-01 22:17:38.514	PARCEL
e879b331-ce22-48c3-8d2c-91ee69d84151	374b965b-6570-4820-9601-54272c972dc5	http://localhost:3000/uploads/identity/1ea11730-c689-4191-a270-9c2e231e3f46.png	2026-02-01 22:17:38.51	IDENTITY
\.


--
-- TOC entry 5339 (class 0 OID 160286)
-- Dependencies: 241
-- Data for Name: verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verifications (id, "bookingId", "verifierId", type, success, "createdAt") FROM stdin;
\.


--
-- TOC entry 5056 (class 2606 OID 160299)
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 5058 (class 2606 OID 160301)
-- Name: CustomsItem CustomsItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomsItem"
    ADD CONSTRAINT "CustomsItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 160303)
-- Name: Dispute Dispute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Dispute"
    ADD CONSTRAINT "Dispute_pkey" PRIMARY KEY (id);


--
-- TOC entry 5064 (class 2606 OID 160305)
-- Name: EmailVerification EmailVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailVerification"
    ADD CONSTRAINT "EmailVerification_pkey" PRIMARY KEY (id);


--
-- TOC entry 5068 (class 2606 OID 160307)
-- Name: Kyc Kyc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Kyc"
    ADD CONSTRAINT "Kyc_pkey" PRIMARY KEY (id);


--
-- TOC entry 5073 (class 2606 OID 160309)
-- Name: LedgerEntry LedgerEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerEntry"
    ADD CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY (id);


--
-- TOC entry 5076 (class 2606 OID 160311)
-- Name: Parcel Parcel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Parcel"
    ADD CONSTRAINT "Parcel_pkey" PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 160313)
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- TOC entry 5081 (class 2606 OID 160315)
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 160317)
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- TOC entry 5087 (class 2606 OID 160319)
-- Name: TripPricingRule TripPricingRule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TripPricingRule"
    ADD CONSTRAINT "TripPricingRule_pkey" PRIMARY KEY (id);


--
-- TOC entry 5092 (class 2606 OID 160321)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 5096 (class 2606 OID 160323)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5100 (class 2606 OID 160325)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 5135 (class 2606 OID 180179)
-- Name: hub_opening_hours hub_opening_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hub_opening_hours
    ADD CONSTRAINT hub_opening_hours_pkey PRIMARY KEY (id);


--
-- TOC entry 5131 (class 2606 OID 163836)
-- Name: hubs hubs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hubs
    ADD CONSTRAINT hubs_pkey PRIMARY KEY (id);


--
-- TOC entry 5104 (class 2606 OID 160327)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5107 (class 2606 OID 160329)
-- Name: pickup_proposals pickup_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickup_proposals
    ADD CONSTRAINT pickup_proposals_pkey PRIMARY KEY (id);


--
-- TOC entry 5110 (class 2606 OID 160331)
-- Name: pickup_sessions pickup_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickup_sessions
    ADD CONSTRAINT pickup_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5112 (class 2606 OID 160333)
-- Name: pickup_slots pickup_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickup_slots
    ADD CONSTRAINT pickup_slots_pkey PRIMARY KEY (id);


--
-- TOC entry 5115 (class 2606 OID 160335)
-- Name: recipients recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipients
    ADD CONSTRAINT recipients_pkey PRIMARY KEY (id);


--
-- TOC entry 5119 (class 2606 OID 160337)
-- Name: tracking_events tracking_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_events
    ADD CONSTRAINT tracking_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5123 (class 2606 OID 160339)
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- TOC entry 5126 (class 2606 OID 160341)
-- Name: verification_artifacts verification_artifacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_artifacts
    ADD CONSTRAINT verification_artifacts_pkey PRIMARY KEY (id);


--
-- TOC entry 5128 (class 2606 OID 160343)
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5052 (class 1259 OID 160344)
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- TOC entry 5053 (class 1259 OID 160345)
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- TOC entry 5054 (class 1259 OID 160346)
-- Name: AuditLog_entity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_entity_idx" ON public."AuditLog" USING btree (entity);


--
-- TOC entry 5059 (class 1259 OID 160347)
-- Name: Dispute_bookingId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Dispute_bookingId_idx" ON public."Dispute" USING btree ("bookingId");


--
-- TOC entry 5062 (class 1259 OID 160348)
-- Name: Dispute_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Dispute_status_idx" ON public."Dispute" USING btree (status);


--
-- TOC entry 5065 (class 1259 OID 160349)
-- Name: EmailVerification_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailVerification_token_key" ON public."EmailVerification" USING btree (token);


--
-- TOC entry 5066 (class 1259 OID 160350)
-- Name: EmailVerification_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailVerification_userId_key" ON public."EmailVerification" USING btree ("userId");


--
-- TOC entry 5069 (class 1259 OID 160351)
-- Name: Kyc_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Kyc_status_idx" ON public."Kyc" USING btree (status);


--
-- TOC entry 5070 (class 1259 OID 160352)
-- Name: Kyc_userId_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Kyc_userId_type_key" ON public."Kyc" USING btree ("userId", type);


--
-- TOC entry 5071 (class 1259 OID 160353)
-- Name: LedgerEntry_paymentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LedgerEntry_paymentId_idx" ON public."LedgerEntry" USING btree ("paymentId");


--
-- TOC entry 5074 (class 1259 OID 160354)
-- Name: Parcel_bookingId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Parcel_bookingId_key" ON public."Parcel" USING btree ("bookingId");


--
-- TOC entry 5079 (class 1259 OID 160355)
-- Name: PasswordResetToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON public."PasswordResetToken" USING btree (token);


--
-- TOC entry 5082 (class 1259 OID 160356)
-- Name: Profile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Profile_userId_key" ON public."Profile" USING btree ("userId");


--
-- TOC entry 5085 (class 1259 OID 160357)
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- TOC entry 5088 (class 1259 OID 160358)
-- Name: TripPricingRule_tripId_minKg_maxKg_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TripPricingRule_tripId_minKg_maxKg_key" ON public."TripPricingRule" USING btree ("tripId", "minKg", "maxKg");


--
-- TOC entry 5089 (class 1259 OID 160359)
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- TOC entry 5090 (class 1259 OID 160360)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 5093 (class 1259 OID 160361)
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- TOC entry 5094 (class 1259 OID 160362)
-- Name: User_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_status_idx" ON public."User" USING btree (status);


--
-- TOC entry 5097 (class 1259 OID 163842)
-- Name: bookings_destinationHubId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "bookings_destinationHubId_idx" ON public.bookings USING btree ("destinationHubId");


--
-- TOC entry 5098 (class 1259 OID 163841)
-- Name: bookings_originHubId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "bookings_originHubId_idx" ON public.bookings USING btree ("originHubId");


--
-- TOC entry 5101 (class 1259 OID 163843)
-- Name: bookings_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bookings_status_idx ON public.bookings USING btree (status);


--
-- TOC entry 5102 (class 1259 OID 163840)
-- Name: bookings_tripId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "bookings_tripId_idx" ON public.bookings USING btree ("tripId");


--
-- TOC entry 5133 (class 1259 OID 180180)
-- Name: hub_opening_hours_hubId_day_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "hub_opening_hours_hubId_day_idx" ON public.hub_opening_hours USING btree ("hubId", day);


--
-- TOC entry 5129 (class 1259 OID 163838)
-- Name: hubs_country_city_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hubs_country_city_idx ON public.hubs USING btree (country, city);


--
-- TOC entry 5132 (class 1259 OID 180129)
-- Name: hubs_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hubs_status_idx ON public.hubs USING btree (status);


--
-- TOC entry 5105 (class 1259 OID 160363)
-- Name: payments_stripeIntentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_stripeIntentId_key" ON public.payments USING btree ("stripeIntentId");


--
-- TOC entry 5108 (class 1259 OID 160364)
-- Name: pickup_sessions_bookingId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "pickup_sessions_bookingId_key" ON public.pickup_sessions USING btree ("bookingId");


--
-- TOC entry 5113 (class 1259 OID 160365)
-- Name: pickup_slots_transporteurId_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pickup_slots_transporteurId_date_idx" ON public.pickup_slots USING btree ("transporteurId", date);


--
-- TOC entry 5116 (class 1259 OID 160366)
-- Name: tracking_events_bookingId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tracking_events_bookingId_idx" ON public.tracking_events USING btree ("bookingId");


--
-- TOC entry 5117 (class 1259 OID 160367)
-- Name: tracking_events_eventType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tracking_events_eventType_idx" ON public.tracking_events USING btree ("eventType");


--
-- TOC entry 5120 (class 1259 OID 163845)
-- Name: trips_arrivalCountry_arrivalCity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "trips_arrivalCountry_arrivalCity_idx" ON public.trips USING btree ("arrivalCountry", "arrivalCity");


--
-- TOC entry 5121 (class 1259 OID 163844)
-- Name: trips_departureCountry_departureCity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "trips_departureCountry_departureCity_idx" ON public.trips USING btree ("departureCountry", "departureCity");


--
-- TOC entry 5124 (class 1259 OID 160368)
-- Name: verification_artifacts_pickupId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "verification_artifacts_pickupId_idx" ON public.verification_artifacts USING btree ("pickupId");


--
-- TOC entry 5136 (class 2606 OID 160369)
-- Name: AuditLog AuditLog_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5137 (class 2606 OID 160374)
-- Name: CustomsItem CustomsItem_parcelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CustomsItem"
    ADD CONSTRAINT "CustomsItem_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES public."Parcel"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5138 (class 2606 OID 160379)
-- Name: Dispute Dispute_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Dispute"
    ADD CONSTRAINT "Dispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5139 (class 2606 OID 160384)
-- Name: Dispute Dispute_raisedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Dispute"
    ADD CONSTRAINT "Dispute_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5140 (class 2606 OID 160389)
-- Name: EmailVerification EmailVerification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailVerification"
    ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5141 (class 2606 OID 160394)
-- Name: Kyc Kyc_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Kyc"
    ADD CONSTRAINT "Kyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5142 (class 2606 OID 160399)
-- Name: Kyc Kyc_verifierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Kyc"
    ADD CONSTRAINT "Kyc_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5143 (class 2606 OID 163856)
-- Name: LedgerEntry LedgerEntry_hubId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerEntry"
    ADD CONSTRAINT "LedgerEntry_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES public.hubs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5144 (class 2606 OID 160404)
-- Name: LedgerEntry LedgerEntry_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerEntry"
    ADD CONSTRAINT "LedgerEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5145 (class 2606 OID 160409)
-- Name: Parcel Parcel_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Parcel"
    ADD CONSTRAINT "Parcel_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5146 (class 2606 OID 160414)
-- Name: PasswordResetToken PasswordResetToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5147 (class 2606 OID 160419)
-- Name: Profile Profile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5148 (class 2606 OID 160424)
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5149 (class 2606 OID 160429)
-- Name: TripPricingRule TripPricingRule_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TripPricingRule"
    ADD CONSTRAINT "TripPricingRule_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5150 (class 2606 OID 160434)
-- Name: bookings bookings_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5151 (class 2606 OID 163851)
-- Name: bookings bookings_destinationHubId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "bookings_destinationHubId_fkey" FOREIGN KEY ("destinationHubId") REFERENCES public.hubs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5152 (class 2606 OID 163846)
-- Name: bookings bookings_originHubId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "bookings_originHubId_fkey" FOREIGN KEY ("originHubId") REFERENCES public.hubs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5153 (class 2606 OID 160439)
-- Name: bookings bookings_recipientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "bookings_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES public.recipients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5154 (class 2606 OID 160444)
-- Name: bookings bookings_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "bookings_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5169 (class 2606 OID 180191)
-- Name: hub_opening_hours hub_opening_hours_hubId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hub_opening_hours
    ADD CONSTRAINT "hub_opening_hours_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES public.hubs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5167 (class 2606 OID 180186)
-- Name: hubs hubs_kycId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hubs
    ADD CONSTRAINT "hubs_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES public."Kyc"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5168 (class 2606 OID 180181)
-- Name: hubs hubs_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hubs
    ADD CONSTRAINT "hubs_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5155 (class 2606 OID 160449)
-- Name: payments payments_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5156 (class 2606 OID 160454)
-- Name: payments payments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5157 (class 2606 OID 160459)
-- Name: pickup_proposals pickup_proposals_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickup_proposals
    ADD CONSTRAINT "pickup_proposals_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5158 (class 2606 OID 160464)
-- Name: pickup_proposals pickup_proposals_pickupSlotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickup_proposals
    ADD CONSTRAINT "pickup_proposals_pickupSlotId_fkey" FOREIGN KEY ("pickupSlotId") REFERENCES public.pickup_slots(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5159 (class 2606 OID 160469)
-- Name: pickup_sessions pickup_sessions_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickup_sessions
    ADD CONSTRAINT "pickup_sessions_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5160 (class 2606 OID 160474)
-- Name: recipients recipients_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipients
    ADD CONSTRAINT "recipients_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5161 (class 2606 OID 160479)
-- Name: tracking_events tracking_events_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_events
    ADD CONSTRAINT "tracking_events_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5162 (class 2606 OID 160484)
-- Name: tracking_events tracking_events_tripId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_events
    ADD CONSTRAINT "tracking_events_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5163 (class 2606 OID 160489)
-- Name: trips trips_transporteurId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT "trips_transporteurId_fkey" FOREIGN KEY ("transporteurId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5164 (class 2606 OID 160494)
-- Name: verification_artifacts verification_artifacts_pickupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_artifacts
    ADD CONSTRAINT "verification_artifacts_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES public.pickup_sessions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5165 (class 2606 OID 160499)
-- Name: verifications verifications_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT "verifications_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public.bookings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5166 (class 2606 OID 160504)
-- Name: verifications verifications_verifierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT "verifications_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-02-10 19:49:36

--
-- PostgreSQL database dump complete
--

\unrestrict MdF1LPOrY8Sb5JvF7A6JYASta8pxE6aATVriVb0kaaynzEnngmnd9ys34wfyjjV

